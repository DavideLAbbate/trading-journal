import type { NewspaperPage } from '../../types/newspaper'
import { NewspaperPageFace } from './NewspaperPageFace'

interface NewspaperBookProps {
  pages: NewspaperPage[]
  currentPage: number
  // flipDirection: which page is moving. null = idle.
  // 'forward'  → right page flips toward the left  (going to next spread)
  // 'backward' → left page flips toward the right  (going to previous spread)
  flipDirection: 'forward' | 'backward' | null
  // flipProgress: 0.0 (not started) → 1.0 (fully flipped), always positive
  flipProgress: number
  isDragging: boolean
}

const PAGE_WIDTH = 520
const PAGE_HEIGHT = 700

export { PAGE_WIDTH, PAGE_HEIGHT }

export function NewspaperBook({
  pages,
  currentPage,
  flipDirection,
  flipProgress,
  isDragging,
}: NewspaperBookProps) {
  const isOpen = currentPage > 0          // spread is open (left page exists)
  const isFlipping = flipProgress > 0 && flipDirection !== null

  // Shadow cast by the flipping page, peaks at 90°
  const shadowIntensity = Math.sin(flipProgress * Math.PI) * 0.45

  // Page indices visible in the settled spread
  const leftPageIndex = currentPage - 1   // -1 when currentPage === 0 (no left page)
  const rightPageIndex = currentPage

  // ── Closed cover (page 0, no flip in progress) ──────────────────────────
  // Show a single page centered instead of a full spread.
  if (!isOpen && !isFlipping) {
    return (
      <div style={{ perspective: '1400px', perspectiveOrigin: '50% 38%' }}>
        <div
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(12deg) rotateY(-4deg)',
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            position: 'relative',
          }}
        >
          {/* Drop shadow */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: PAGE_HEIGHT + 24,
              width: PAGE_WIDTH,
              height: 50,
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
              filter: 'blur(14px)',
            }}
          />
          {pages[0] && (
            <NewspaperPageFace
              sections={pages[0].front}
              pageNumber={pages[0].pageNumber}
              tint={pages[0].tint}
            />
          )}
          {isDragging && (
            <div style={{ position: 'absolute', inset: 0, cursor: 'grabbing', zIndex: 20 }} />
          )}
        </div>
      </div>
    )
  }

  // ── Open spread ───────────────────────────────────────────────────────────
  // During a forward flip from the closed state (currentPage === 0), the book
  // transitions from single-page to open spread mid-animation.
  const spreadWidth = isOpen || isFlipping ? PAGE_WIDTH * 2 : PAGE_WIDTH

  return (
    <div style={{ perspective: '1400px', perspectiveOrigin: '50% 38%' }}>
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(12deg) rotateY(-4deg)',
          width: spreadWidth,
          height: PAGE_HEIGHT,
          position: 'relative',
          transition: 'width 0.3s ease',
        }}
      >
        {/* Drop shadow under book */}
        <div
          style={{
            position: 'absolute',
            left: 30,
            top: PAGE_HEIGHT + 24,
            width: spreadWidth - 60,
            height: 50,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
            filter: 'blur(14px)',
          }}
        />

        {/* Page stack depth (settled pages already read, peeking out on the left) */}
        {currentPage > 0 && (
          <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
            {Array.from({ length: Math.min(currentPage, 5) }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: idx * 1.5,
                  top: -idx * 0.5,
                  width: PAGE_WIDTH * 2 - idx * 3,
                  height: PAGE_HEIGHT - idx,
                  backgroundColor: `hsl(220, 25%, ${8 + idx * 0.5}%)`,
                  transform: `translateZ(${-idx * 2 - 2}px)`,
                  borderRight: '1px solid rgba(91,192,190,0.15)',
                }}
              />
            ))}
          </div>
        )}

        {/* LEFT PAGE — back face of the previous page.
            Hidden while it's the one flipping (backward flip). */}
        {leftPageIndex >= 0 && pages[leftPageIndex] && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              transform: 'translateZ(1px)',
              opacity: flipDirection === 'backward' && isFlipping ? 0 : 1,
            }}
          >
            <NewspaperPageFace
              sections={pages[leftPageIndex].back}
              pageNumber={pages[leftPageIndex].pageNumber}
              isBack
              tint={pages[leftPageIndex].tint}
            />
          </div>
        )}

        {/* RIGHT PAGE — front face of the current page.
            Hidden while it's the one flipping (forward flip). */}
        {rightPageIndex < pages.length && pages[rightPageIndex] && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: isOpen || isFlipping ? PAGE_WIDTH : 0,
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              transform: 'translateZ(1px)',
              opacity: flipDirection === 'forward' && isFlipping ? 0 : 1,
            }}
          >
            <NewspaperPageFace
              sections={pages[rightPageIndex].front}
              pageNumber={pages[rightPageIndex].pageNumber}
              tint={pages[rightPageIndex].tint}
            />
          </div>
        )}

        {/* FLIPPING PAGE */}
        {isFlipping && flipDirection !== null && (
          <FlippingPage
            pages={pages}
            currentPage={currentPage}
            flipDirection={flipDirection}
            flipProgress={flipProgress}
            isOpen={isOpen}
          />
        )}

        {/* Spine (only visible when spread is open) */}
        {(isOpen || isFlipping) && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: PAGE_WIDTH - 1,
              width: 2,
              height: PAGE_HEIGHT,
              background: 'linear-gradient(to right, rgba(0,0,0,0.35), rgba(91,192,190,0.1), rgba(0,0,0,0.35))',
              transform: 'translateZ(3px)',
            }}
          />
        )}

        {/* Dynamic cast shadow from flipping page */}
        {isFlipping && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: flipDirection === 'forward' ? PAGE_WIDTH : 0,
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              background: `linear-gradient(to ${flipDirection === 'forward' ? 'left' : 'right'}, rgba(0,0,0,${shadowIntensity}), transparent)`,
              transform: 'translateZ(3px)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Grabbing cursor overlay */}
        {isDragging && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              cursor: 'grabbing',
              transform: 'translateZ(10px)',
              zIndex: 20,
            }}
          />
        )}
      </div>
    </div>
  )
}

interface FlippingPageProps {
  pages: NewspaperPage[]
  currentPage: number
  flipDirection: 'forward' | 'backward'
  flipProgress: number  // 0.0 → 1.0
  isOpen: boolean
}

function FlippingPage({ pages, currentPage, flipDirection, flipProgress, isOpen }: FlippingPageProps) {
  // flipProgress 0→1 maps to rotation 0→180 degrees
  const flipAngle = flipProgress * 180

  // Subtle paper curl
  const curlY = 1 - Math.sin((flipAngle * Math.PI) / 180) * 0.04
  const curlX = Math.cos((flipAngle * Math.PI) / 180) >= 0
    ? 1 - Math.sin((flipAngle * Math.PI) / 180) * 0.02
    : 1 - Math.sin(((180 - flipAngle) * Math.PI) / 180) * 0.02

  // Forward flip: right page rotates from its LEFT edge (spine) toward the left.
  //   transform-origin = left center, rotation goes negative (0 → -180).
  // Backward flip: left page rotates from its RIGHT edge (spine) toward the right.
  //   transform-origin = right center, rotation goes positive (0 → +180).
  const transformOrigin = flipDirection === 'forward' ? 'left center' : 'right center'
  const rotation = flipDirection === 'forward' ? -flipAngle : flipAngle

  // Which page data is flipping
  const flippingPageIndex = flipDirection === 'forward' ? currentPage : currentPage - 1
  if (flippingPageIndex < 0 || flippingPageIndex >= pages.length) return null

  const page = pages[flippingPageIndex]

  // Position: forward flip starts on the right half; backward on the left half.
  // If the book was closed (currentPage === 0, isOpen === false) and we're doing
  // a forward flip, the page starts centered (left = 0) and the spread opens as it turns.
  const pageLeft = flipDirection === 'forward'
    ? (isOpen ? PAGE_WIDTH : 0)
    : 0

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: pageLeft,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        transformStyle: 'preserve-3d',
        transformOrigin,
        transform: `rotateY(${rotation}deg) scaleY(${curlY}) scaleX(${curlX})`,
        zIndex: 5,
      }}
    >
      {/* Front face — what you see while the page is still facing you */}
      <div style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}>
        <NewspaperPageFace
          sections={flipDirection === 'forward' ? page.front : page.back}
          pageNumber={page.pageNumber}
          isBack={flipDirection === 'backward'}
          tint={page.tint}
        />
      </div>

      {/* Back face — revealed as the page rotates past 90° */}
      <div
        style={{
          backfaceVisibility: 'hidden',
          position: 'absolute',
          inset: 0,
          transform: 'rotateY(180deg)',
        }}
      >
        <NewspaperPageFace
          sections={flipDirection === 'forward' ? page.back : page.front}
          pageNumber={page.pageNumber}
          isBack={flipDirection === 'forward'}
          tint={page.tint}
        />
      </div>

      {/* Paper edge highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: flipDirection === 'forward' ? 0 : 'auto',
          right: flipDirection === 'forward' ? 'auto' : 0,
          width: 3,
          height: PAGE_HEIGHT,
          background: 'linear-gradient(to right, rgba(255,255,255,0.08), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
