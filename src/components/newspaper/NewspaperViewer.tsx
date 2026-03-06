import { useEffect, useCallback, useRef, useState } from 'react'
import { NEWSPAPER_ISSUE } from '../../data/newspaper-pages'
import { Newspaper3D } from './Newspaper3D'
import { cn } from '../../lib/utils'

interface NewspaperViewerProps {
  open: boolean
  onClose: () => void
}

const ZOOM_MIN = 0.55
const ZOOM_MAX = 1.5
const ZOOM_STEP = 0.08

export function NewspaperViewer({ open, onClose }: NewspaperViewerProps) {
  const hintTimeoutRef = useRef<number | null>(null)
  const [showHint, setShowHint] = useState(true)

  // Zoom state — driven by wheel outside the newspaper book
  const [zoom, setZoom] = useState(1)
  const bookRef = useRef<HTMLDivElement>(null)

  // Handle showing/hiding hint + reset zoom based on open state
  useEffect(() => {
    if (open) {
      hintTimeoutRef.current = window.setTimeout(() => {
        setShowHint(false)
      }, 3000)
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
  }, [open])

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
          className="mt-6 text-center flex-shrink-0"
          style={{ fontFamily: 'IBM Plex Mono, monospace' }}
        >
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-wide">
            {NEWSPAPER_ISSUE.title}
          </h1>
          <div className="text-[var(--muted-foreground)] text-sm mt-1">
            {NEWSPAPER_ISSUE.edition} • {NEWSPAPER_ISSUE.date}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors border border-[var(--hud-border)] hover:border-[var(--tropical-teal)] bg-[var(--hud-surface)]"
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
        {zoom !== 1 && (
          <div
            className="absolute top-6 left-6 text-[var(--muted-foreground)] text-xs border border-[var(--hud-border)] bg-[var(--hud-surface)] px-2 py-1 pointer-events-none"
            style={{ fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {Math.round(zoom * 100)}%
          </div>
        )}

        {/* The 3D newspaper — wrapped in zoom container */}
        <div className="flex-1 flex items-center justify-center mt-4 w-full overflow-hidden">
          <div
            ref={bookRef}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <Newspaper3D issue={NEWSPAPER_ISSUE} />
          </div>
        </div>

        {/* Hint — fades out after 3 s */}
        <div
          className={cn(
            'absolute bottom-8 text-[var(--muted-foreground)] text-sm font-mono transition-opacity duration-500',
            showHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          style={{ fontFamily: 'IBM Plex Mono, monospace' }}
        >
          Drag to flip • scroll to zoom
        </div>
      </div>
    </div>
  )
}
