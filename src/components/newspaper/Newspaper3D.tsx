import { useState, useRef, useCallback, useEffect } from 'react'
import type { NewspaperIssue } from '../../types/newspaper'
import { NewspaperBook, PAGE_WIDTH } from './NewspaperBook'

interface Newspaper3DProps {
  issue: NewspaperIssue
  className?: string
}

// Minimum horizontal pixels before we count a move as a drag (not a click)
const DRAG_THRESHOLD = 8

export function Newspaper3D({ issue, className }: Newspaper3DProps) {
  const pages = issue.pages

  // currentPage: index of the page shown on the RIGHT side of the open spread.
  // 0 = only right page visible (closed/cover state).
  const [currentPage, setCurrentPage] = useState(0)

  // Which page half received the pointerdown
  // 'right' → user grabbed the right page → can only drag LEFT → forward flip
  // 'left'  → user grabbed the left page  → can only drag RIGHT → backward flip
  const dragSideRef = useRef<'left' | 'right' | null>(null)

  // flipDirection: which page is currently animating
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward' | null>(null)
  // flipProgress: 0 → 1, always positive
  const [flipProgress, setFlipProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  // Drag state refs
  const isDragActiveRef = useRef(false)
  const pointerStartXRef = useRef<number | null>(null)
  const activePointerIdRef = useRef<number | null>(null)

  // Animation refs
  const animProgressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const isAnimatingRef = useRef(false)
  const committedRef = useRef(false)
  const flipDirectionRef = useRef<'forward' | 'backward'>('forward')
  const currentPageRef = useRef(0)

  const animateFnRef = useRef<(() => void) | null>(null)

  // Keep currentPageRef in sync with state
  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

  // Spring animation loop
  const animate = useCallback(() => {
    const target = targetProgressRef.current
    const current = animProgressRef.current
    const diff = target - current

    if (Math.abs(diff) < 0.001) {
      animProgressRef.current = target
      setFlipProgress(target)

      if (committedRef.current && target >= 0.999) {
        // Flip completed — advance the page index and reset
        const dir = flipDirectionRef.current
        const nextPage = dir === 'forward'
          ? Math.min(pages.length - 1, currentPageRef.current + 1)
          : Math.max(0, currentPageRef.current - 1)

        animProgressRef.current = 0
        targetProgressRef.current = 0
        committedRef.current = false
        dragSideRef.current = null
        setCurrentPage(nextPage)
        setFlipProgress(0)
        setFlipDirection(null)
        setIsDragging(false)
      } else if (!committedRef.current) {
        // Snapped back
        animProgressRef.current = 0
        targetProgressRef.current = 0
        dragSideRef.current = null
        setFlipProgress(0)
        setFlipDirection(null)
        setIsDragging(false)
      }

      isAnimatingRef.current = false
      return
    }

    animProgressRef.current += diff * 0.15
    setFlipProgress(animProgressRef.current)

    if (animateFnRef.current) {
      rafRef.current = requestAnimationFrame(animateFnRef.current)
    }
  }, [pages.length])

  useEffect(() => {
    animateFnRef.current = animate
  }, [animate])

  const startAnimation = useCallback(() => {
    if (!isAnimatingRef.current && animateFnRef.current) {
      isAnimatingRef.current = true
      rafRef.current = requestAnimationFrame(animateFnRef.current)
    }
  }, [])

  // Decide whether to commit the flip or snap back
  const resolveFlip = useCallback((liveProgress: number) => {
    const threshold = 0.35
    if (liveProgress >= threshold) {
      committedRef.current = true
      const dir = flipDirectionRef.current
      const page = currentPageRef.current
      const blocked =
        (dir === 'forward' && page >= pages.length - 1) ||
        (dir === 'backward' && page <= 0)

      if (blocked) {
        committedRef.current = false
        targetProgressRef.current = 0
      } else {
        targetProgressRef.current = 1
      }
    } else {
      committedRef.current = false
      targetProgressRef.current = 0
    }
    startAnimation()
  }, [pages.length, startAnimation])

  // ─── Pointer handlers ──────────────────────────────────────────────────────

  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (!containerRef.current?.contains(e.target as Node)) return

    // Determine which half of the book was clicked.
    // The scene is always PAGE_WIDTH * 2 wide. At page 0 the closed journal is
    // centered inside that scene, so only clicks inside the centered cover count.
    const containerRect = containerRef.current.getBoundingClientRect()
    const sceneLeft = containerRect.left + (containerRect.width - PAGE_WIDTH * 2) / 2
    const page = currentPageRef.current

    let clickedSide: 'left' | 'right'

    if (page === 0) {
      const closedLeft = sceneLeft + PAGE_WIDTH / 2
      const closedRight = closedLeft + PAGE_WIDTH
      const closedCenter = closedLeft + PAGE_WIDTH / 2

      if (e.clientX < closedLeft || e.clientX > closedRight) return

      clickedSide = e.clientX < closedCenter ? 'left' : 'right'
    } else {
      const spineX = sceneLeft + PAGE_WIDTH
      clickedSide = e.clientX < spineX ? 'left' : 'right'
    }

    // At page 0 there is no left page — left-side clicks do nothing
    if (clickedSide === 'left' && page === 0) return
    // At the last page the right side can still exist (single page on right) but no forward flip
    // We'll allow the pointer down but gate the drag below.

    dragSideRef.current = clickedSide
    pointerStartXRef.current = e.clientX
    isDragActiveRef.current = false
    activePointerIdRef.current = e.pointerId
  }, [])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (activePointerIdRef.current === null) return
    if (e.pointerId !== activePointerIdRef.current) return
    if (pointerStartXRef.current === null) return

    const deltaX = e.clientX - pointerStartXRef.current
    const side = dragSideRef.current

    // Gate: right page can only drag LEFT (negative deltaX → forward flip)
    //        left page can only drag RIGHT (positive deltaX → backward flip)
    if (side === 'right' && deltaX > 0) return  // wrong direction for right page
    if (side === 'left' && deltaX < 0) return   // wrong direction for left page

    const absDelta = Math.abs(deltaX)

    // Activate drag once threshold is crossed
    if (!isDragActiveRef.current) {
      if (absDelta < DRAG_THRESHOLD) return
      isDragActiveRef.current = true
      const dir: 'forward' | 'backward' = side === 'right' ? 'forward' : 'backward'
      flipDirectionRef.current = dir
      setFlipDirection(dir)
      setIsDragging(true)
    }

    const page = currentPageRef.current
    const dir = flipDirectionRef.current

    // Block if already at boundary
    if (dir === 'forward' && page >= pages.length - 1) return
    if (dir === 'backward' && page <= 0) return

    const rawProgress = absDelta / PAGE_WIDTH
    const clamped = Math.min(1, rawProgress)

    animProgressRef.current = clamped
    targetProgressRef.current = clamped
    setFlipProgress(clamped)
  }, [pages.length])

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (e.pointerId !== activePointerIdRef.current) return
    activePointerIdRef.current = null

    if (!isDragActiveRef.current) {
      pointerStartXRef.current = null
      dragSideRef.current = null
      return
    }

    isDragActiveRef.current = false
    pointerStartXRef.current = null

    resolveFlip(animProgressRef.current)
  }, [resolveFlip])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (currentPageRef.current >= pages.length - 1) return
      committedRef.current = true
      flipDirectionRef.current = 'forward'
      dragSideRef.current = 'right'
      targetProgressRef.current = 1
      animProgressRef.current = 0.05
      setFlipDirection('forward')
      setFlipProgress(0.05)
      startAnimation()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (currentPageRef.current <= 0) return
      committedRef.current = true
      flipDirectionRef.current = 'backward'
      dragSideRef.current = 'left'
      targetProgressRef.current = 1
      animProgressRef.current = 0.05
      setFlipDirection('backward')
      setFlipProgress(0.05)
      startAnimation()
    }
  }, [pages.length, startAnimation])

  // All events on window so fast drags never lose the pointer
  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      window.removeEventListener('keydown', handleKeyDown)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [handlePointerDown, handlePointerMove, handlePointerUp, handleKeyDown])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none' as const,
        WebkitUserSelect: 'none' as const,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
    >
      <NewspaperBook
        pages={pages}
        currentPage={currentPage}
        flipDirection={flipDirection}
        flipProgress={flipProgress}
        isDragging={isDragging}
      />

      {/* Page indicator */}
      <div
        className="mt-6 text-[var(--muted-foreground)] text-sm"
        style={{ fontFamily: 'IBM Plex Mono, monospace' }}
      >
        {currentPage + 1} / {pages.length}
      </div>

      {/* Navigation hint */}
      <div
        className="mt-2 text-[var(--muted-foreground)] text-xs opacity-60"
        style={{ fontFamily: 'IBM Plex Mono, monospace' }}
      >
        Drag a page to flip • ← → keys
      </div>
    </div>
  )
}
