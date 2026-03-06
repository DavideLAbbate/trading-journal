import type { ReactNode } from 'react'
import type { NewspaperPage } from '../../types/newspaper'
import { NewspaperPageFace } from './NewspaperPageFace'

interface NewspaperBookProps {
  pages: NewspaperPage[]
  currentPage: number
  flipDirection: 'forward' | 'backward' | null
  flipProgress: number
  isDragging: boolean
}

const PAGE_WIDTH = 520
const PAGE_HEIGHT = 700
const SCENE_WIDTH = PAGE_WIDTH * 2
const CLOSED_LEFT = PAGE_WIDTH / 2

export { PAGE_WIDTH, PAGE_HEIGHT }

export function NewspaperBook({
  pages,
  currentPage,
  flipDirection,
  flipProgress,
  isDragging,
}: NewspaperBookProps) {
  const isFlipping = flipDirection !== null && flipProgress > 0
  const isClosed = currentPage === 0 && !isFlipping
  const shadowIntensity = Math.sin(flipProgress * Math.PI) * 0.32

  const leftCount = Math.min(Math.max(currentPage, 0), 6)
  const rightCount = Math.min(Math.max(pages.length - currentPage - 1, 0), 6)

  const leftBasePage = getLeftBasePage(pages, currentPage, flipDirection)
  const rightBasePage = getRightBasePage(pages, currentPage, flipDirection)

  return (
    <div
      style={{
        width: SCENE_WIDTH,
        perspective: '1800px',
        perspectiveOrigin: '50% 38%',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: SCENE_WIDTH,
          height: PAGE_HEIGHT,
          transformStyle: 'preserve-3d',
          transform: 'rotateX(6deg) rotateY(-7deg)',
        }}
      >
        <BookShadow />

        {isClosed ? (
          <ClosedJournal pages={pages} isDragging={isDragging} />
        ) : (
          <>
            <PageStack side="left" count={leftCount} pageLeft={0} />
            <PageStack side="right" count={rightCount} pageLeft={PAGE_WIDTH} />

            {leftBasePage ? (
              <PagePlate pageLeft={0} z={1}>
                <NewspaperPageFace
                  sections={leftBasePage.sections}
                  pageNumber={leftBasePage.pageNumber}
                  isBack={leftBasePage.isBack}
                  tint={leftBasePage.tint}
                />
              </PagePlate>
            ) : (
              <InnerBoard pageLeft={0} />
            )}

            {rightBasePage && (
              <PagePlate pageLeft={PAGE_WIDTH} z={1}>
                <NewspaperPageFace
                  sections={rightBasePage.sections}
                  pageNumber={rightBasePage.pageNumber}
                  tint={rightBasePage.tint}
                />
              </PagePlate>
            )}

            <SpineGlow />

            {isFlipping && flipDirection !== null && (
              <>
                <FlipShadow direction={flipDirection} intensity={shadowIntensity} />
                <FlippingPage
                  pages={pages}
                  currentPage={currentPage}
                  flipDirection={flipDirection}
                  flipProgress={flipProgress}
                />
              </>
            )}
          </>
        )}

        {isDragging && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              cursor: 'grabbing',
              zIndex: 40,
            }}
          />
        )}
      </div>
    </div>
  )
}

interface VisiblePageData {
  sections: NewspaperPage['front']
  pageNumber: number
  tint?: string
  isBack?: boolean
}

function getLeftBasePage(
  pages: NewspaperPage[],
  currentPage: number,
  flipDirection: 'forward' | 'backward' | null
): VisiblePageData | null {
  if (flipDirection === 'backward') {
    const page = pages[currentPage - 2]
    if (!page) return null
    return {
      sections: page.back,
      pageNumber: page.pageNumber,
      isBack: true,
      tint: page.tint,
    }
  }

  if (currentPage <= 0) return null

  const page = pages[currentPage - 1]
  if (!page) return null

  return {
    sections: page.back,
    pageNumber: page.pageNumber,
    isBack: true,
    tint: page.tint,
  }
}

function getRightBasePage(
  pages: NewspaperPage[],
  currentPage: number,
  flipDirection: 'forward' | 'backward' | null
): VisiblePageData | null {
  if (flipDirection === 'forward') {
    const page = pages[currentPage + 1]
    if (!page) return null
    return {
      sections: page.front,
      pageNumber: page.pageNumber,
      tint: page.tint,
    }
  }

  const page = pages[currentPage]
  if (!page) return null

  return {
    sections: page.front,
    pageNumber: page.pageNumber,
    tint: page.tint,
  }
}

function BookShadow() {
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        top: PAGE_HEIGHT + 28,
        width: SCENE_WIDTH - 140,
        height: 64,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.18) 45%, transparent 75%)',
        filter: 'blur(18px)',
        opacity: 0.9,
      }}
    />
  )
}

function ClosedJournal({ pages, isDragging }: { pages: NewspaperPage[]; isDragging: boolean }) {
  const page = pages[0]

  return (
    <>
      <PageStack side="closed" count={6} pageLeft={CLOSED_LEFT} />

      <div
        style={{
          position: 'absolute',
          top: 10,
          left: CLOSED_LEFT - 18,
          width: 18,
          height: PAGE_HEIGHT - 10,
          background: 'linear-gradient(to right, rgba(255,255,255,0.06), rgba(91,192,190,0.06), rgba(0,0,0,0.25))',
          borderTopLeftRadius: 6,
          borderBottomLeftRadius: 6,
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.06)',
          transform: 'translateZ(-2px)',
        }}
      />

      <PagePlate pageLeft={CLOSED_LEFT} z={8}>
        {page && (
          <NewspaperPageFace
            sections={page.front}
            pageNumber={page.pageNumber}
            tint={page.tint}
          />
        )}
      </PagePlate>

      {isDragging && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: CLOSED_LEFT,
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            zIndex: 39,
          }}
        />
      )}
    </>
  )
}

function InnerBoard({ pageLeft }: { pageLeft: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: pageLeft,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        border: '1px solid rgba(91,192,190,0.18)',
        background: 'linear-gradient(135deg, rgba(10,19,36,0.96), rgba(7,13,26,0.9))',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02), inset 20px 0 40px rgba(0,0,0,0.18)',
        transform: 'translateZ(0px)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 18,
          border: '1px solid rgba(91,192,190,0.08)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.01), transparent)',
        }}
      />
    </div>
  )
}

function SpineGlow() {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: PAGE_WIDTH - 1,
          width: 2,
          height: PAGE_HEIGHT,
          background: 'linear-gradient(to right, rgba(0,0,0,0.38), rgba(111,255,233,0.08), rgba(0,0,0,0.38))',
          transform: 'translateZ(6px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: PAGE_WIDTH - 12,
          width: 24,
          height: PAGE_HEIGHT,
          background: 'linear-gradient(to right, rgba(0,0,0,0.14), rgba(0,0,0,0), rgba(0,0,0,0.14))',
          pointerEvents: 'none',
          transform: 'translateZ(10px)',
          opacity: 0.9,
        }}
      />
    </>
  )
}

function FlipShadow({ direction, intensity }: { direction: 'forward' | 'backward'; intensity: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: direction === 'forward' ? PAGE_WIDTH : 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        background: `linear-gradient(to ${direction === 'forward' ? 'left' : 'right'}, rgba(0,0,0,${intensity}), transparent 72%)`,
        pointerEvents: 'none',
        transform: 'translateZ(12px)',
      }}
    />
  )
}

function PageStack({
  side,
  count,
  pageLeft,
}: {
  side: 'left' | 'right' | 'closed'
  count: number
  pageLeft: number
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => {
        const offsetX = side === 'left' ? -idx * 2 : idx * 2
        const offsetY = idx * 0.9
        const z = -idx - 2

        return (
          <div
            key={`${side}-${idx}`}
            style={{
              position: 'absolute',
              top: offsetY,
              left: pageLeft + offsetX,
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              border: '1px solid rgba(91,192,190,0.08)',
              background: idx === 0
                ? 'linear-gradient(180deg, rgba(20,31,54,0.85), rgba(10,18,33,0.9))'
                : 'linear-gradient(180deg, rgba(16,24,42,0.75), rgba(8,14,26,0.86))',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.015)',
              opacity: Math.max(0.08, 0.22 - idx * 0.025),
              transform: `translateZ(${z}px)`,
            }}
          />
        )
      })}
    </>
  )
}

function PagePlate({
  children,
  pageLeft,
  z,
}: {
  children: ReactNode
  pageLeft: number
  z: number
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: pageLeft,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        transform: `translateZ(${z}px)`,
      }}
    >
      {children}
    </div>
  )
}

interface FlippingPageProps {
  pages: NewspaperPage[]
  currentPage: number
  flipDirection: 'forward' | 'backward'
  flipProgress: number
}

function FlippingPage({ pages, currentPage, flipDirection, flipProgress }: FlippingPageProps) {
  const flippingPageIndex = flipDirection === 'forward' ? currentPage : currentPage - 1
  const page = pages[flippingPageIndex]

  if (!page) return null

  const rotation = flipDirection === 'forward' ? -180 * flipProgress : 180 * flipProgress
  const lift = 8 + Math.sin(flipProgress * Math.PI) * 10
  const closedOpening = flipDirection === 'forward' && currentPage === 0
  const leftEase = smoothstep(Math.min(1, flipProgress * 1.25))
  const pageLeft = flipDirection === 'forward'
    ? (closedOpening ? CLOSED_LEFT + (PAGE_WIDTH - CLOSED_LEFT) * leftEase : PAGE_WIDTH)
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
        transformOrigin: flipDirection === 'forward' ? 'left center' : 'right center',
        transform: `translateZ(${lift}px) rotateY(${rotation}deg)`,
        zIndex: 30,
        willChange: 'transform',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <NewspaperPageFace
          sections={flipDirection === 'forward' ? page.front : page.back}
          pageNumber={page.pageNumber}
          isBack={flipDirection === 'backward'}
          tint={page.tint}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: 'rotateY(180deg)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <NewspaperPageFace
          sections={flipDirection === 'forward' ? page.back : page.front}
          pageNumber={page.pageNumber}
          isBack={flipDirection === 'forward'}
          tint={page.tint}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: flipDirection === 'forward' ? 0 : 'auto',
          right: flipDirection === 'forward' ? 'auto' : 0,
          width: 4,
          height: PAGE_HEIGHT,
          background: 'linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0.02), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value)
}
