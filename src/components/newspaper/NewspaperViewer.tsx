import { useEffect, useCallback, useRef, useState } from 'react'
import { NEWSPAPER_ISSUE } from '../../data/newspaper-pages'
import { PAGE_HEIGHT, PAGE_WIDTH } from './NewspaperBook'
import { Newspaper3D } from './Newspaper3D'
import { cn } from '../../lib/utils'

interface NewspaperViewerProps {
  open: boolean
  onClose: () => void
}

const ZOOM_MIN = 0.55
const ZOOM_MAX = 1.5
const ZOOM_STEP = 0.08
const SCENE_WIDTH = PAGE_WIDTH * 2

function getViewportMetrics() {
  if (typeof window === 'undefined') {
    return { fitScale: 1, isCoarsePointer: false }
  }

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const horizontalPadding = viewportWidth < 640 ? 24 : viewportWidth < 1024 ? 48 : 96
  const verticalChrome = viewportWidth < 640 ? 220 : viewportWidth < 1024 ? 240 : 210
  const availableWidth = Math.max(viewportWidth - horizontalPadding, 240)
  const availableHeight = Math.max(viewportHeight - verticalChrome, 260)
  const nextFitScale = Math.min(1, availableWidth / SCENE_WIDTH, availableHeight / PAGE_HEIGHT)

  return {
    fitScale: Math.max(0.34, nextFitScale),
    isCoarsePointer: window.matchMedia('(pointer: coarse)').matches,
  }
}

export function NewspaperViewer({ open, onClose }: NewspaperViewerProps) {
  const hintTimeoutRef = useRef<number | null>(null)
  const [showHint, setShowHint] = useState(true)
  const [fitScale, setFitScale] = useState(() => getViewportMetrics().fitScale)
  const [isCoarsePointer, setIsCoarsePointer] = useState(() => getViewportMetrics().isCoarsePointer)

  // Zoom state — relative to the fitted scale
  const [zoom, setZoom] = useState(1)
  const bookRef = useRef<HTMLDivElement>(null)

  const displayScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN * fitScale, fitScale * zoom))

  const updateViewportMetrics = useCallback(() => {
    const metrics = getViewportMetrics()
    setFitScale(metrics.fitScale)
    setIsCoarsePointer(metrics.isCoarsePointer)
  }, [])

  useEffect(() => {
    window.addEventListener('resize', updateViewportMetrics)

    return () => window.removeEventListener('resize', updateViewportMetrics)
  }, [updateViewportMetrics])

  // Handle showing/hiding hint + reset zoom based on open state
  useEffect(() => {
    if (open) {
      hintTimeoutRef.current = window.setTimeout(() => {
        setShowHint(false)
      }, isCoarsePointer ? 5000 : 3000)
    } else {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
        hintTimeoutRef.current = null
      }
      // Reset hint and zoom for next open
      const timeoutId = window.setTimeout(() => {
        setShowHint(true)
        setZoom(1)
      }, 0)
      return () => clearTimeout(timeoutId)
    }

    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
    }
  }, [isCoarsePointer, open])

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  // Scroll-to-zoom — only fires when wheel happens outside the book element
  const handleWheel = useCallback((e: WheelEvent) => {
    // If the pointer is over the book itself, let it scroll normally
    if (bookRef.current?.contains(e.target as Node)) return

    e.preventDefault()

    setZoom(prev => {
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev + delta))
    })
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(ZOOM_MAX, prev + ZOOM_STEP * 1.5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(ZOOM_MIN, prev - ZOOM_STEP * 1.5))
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoom(1)
  }, [])

  useEffect(() => {
    if (!open) return
    // passive: false so we can preventDefault and block page scroll
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [open, handleWheel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #0d1526 0%, #0b132b 60%, #050a14 100%)',
      }}
    >
      {/* Ambient glow behind the newspaper */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '50%',
          top: '45%',
          width: '800px',
          height: '600px',
          background:
            'radial-gradient(ellipse, rgba(91, 192, 190, 0.08) 0%, rgba(111, 255, 233, 0.03) 40%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Animated entrance */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center transition-all duration-500 ease-out'
        )}
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        {/* Title bar */}
        <div
          className="mt-4 px-16 text-center flex-shrink-0 sm:mt-6"
          style={{ fontFamily: 'IBM Plex Mono, monospace' }}
        >
          <h1 className="text-lg font-bold text-[var(--foreground)] tracking-wide sm:text-2xl">
            {NEWSPAPER_ISSUE.title}
          </h1>
          <div className="mt-1 text-xs text-[var(--muted-foreground)] sm:text-sm">
            {NEWSPAPER_ISSUE.edition} • {NEWSPAPER_ISSUE.date}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center border border-[var(--hud-border)] bg-[var(--hud-surface)] text-[var(--muted-foreground)] transition-colors hover:border-[var(--tropical-teal)] hover:text-[var(--foreground)] sm:right-6 sm:top-6"
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '1.5rem',
            lineHeight: 1,
          }}
          aria-label="Close newspaper"
        >
          ×
        </button>

        {/* Zoom indicator — shown only when not at 100% */}
        {Math.abs(displayScale - fitScale) > 0.01 && (
          <div
            className="pointer-events-none absolute left-3 top-3 border border-[var(--hud-border)] bg-[var(--hud-surface)] px-2 py-1 text-xs text-[var(--muted-foreground)] sm:left-6 sm:top-6"
            style={{ fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {Math.round(displayScale * 100)}%
          </div>
        )}

        {/* The 3D newspaper — wrapped in zoom container */}
        <div className="mt-2 flex w-full flex-1 items-center justify-center overflow-hidden px-3 pb-24 sm:mt-4 sm:px-6 sm:pb-20">
          <div
            ref={bookRef}
            style={{
              transform: `scale(${displayScale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <Newspaper3D issue={NEWSPAPER_ISSUE} />
          </div>
        </div>

        <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--hud-border)] bg-[var(--hud-surface)]/95 px-2 py-2 shadow-lg backdrop-blur sm:bottom-7">
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--hud-border)] text-lg text-[var(--foreground)] transition-colors hover:border-[var(--tropical-teal)]"
            aria-label="Zoom out"
          >
            -
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="min-w-16 rounded-full border border-[var(--hud-border)] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)] transition-colors hover:border-[var(--tropical-teal)] hover:text-[var(--foreground)]"
            aria-label="Reset zoom"
          >
            {Math.round(displayScale * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--hud-border)] text-lg text-[var(--foreground)] transition-colors hover:border-[var(--tropical-teal)]"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>

        {/* Hint — fades out after 3 s */}
        <div
          className={cn(
            'absolute bottom-3 px-4 text-center text-xs font-mono text-[var(--muted-foreground)] transition-opacity duration-500 sm:bottom-8 sm:text-sm',
            showHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          style={{ fontFamily: 'IBM Plex Mono, monospace' }}
        >
          {isCoarsePointer ? 'Swipe or double-tap a page to flip • use +/- to zoom' : 'Drag to flip • scroll or use +/- to zoom'}
        </div>
      </div>
    </div>
  )
}
