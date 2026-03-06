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
          transform: 'rotateX(4deg) rotateY(-5deg)',
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
        width: SCENE_WIDTH - 120,
        height: 52,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.16) 48%, transparent 76%)',
        filter: 'blur(16px)',
        opacity: 0.82,
      }}
    />
  )
}

function ClosedJournal({ pages, isDragging }: { pages: NewspaperPage[]; isDragging: boolean }) {
  const page = pages[0]

  return (
    <>
      <PageStack side="closed" count={8} pageLeft={CLOSED_LEFT} />

      <div
        style={{
          position: 'absolute',
          top: 6,
          left: CLOSED_LEFT - 10,
          width: 10,
          height: PAGE_HEIGHT - 4,
          background: 'linear-gradient(to right, rgba(8,14,24,0.46), rgba(222,228,232,0.12), rgba(12,18,28,0.34))',
          borderTopLeftRadius: 4,
          borderBottomLeftRadius: 4,
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.08)',
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
        border: '1px solid rgba(196,206,214,0.14)',
        background: 'linear-gradient(135deg, rgba(12,18,28,0.95), rgba(8,12,20,0.92))',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02), inset 14px 0 30px rgba(0,0,0,0.2)',
        transform: 'translateZ(0px)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 18,
          border: '1px solid rgba(222,228,232,0.05)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.015), transparent)',
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
          background: 'linear-gradient(to right, rgba(0,0,0,0.34), rgba(210,220,228,0.09), rgba(0,0,0,0.34))',
          transform: 'translateZ(6px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: PAGE_WIDTH - 14,
          width: 28,
          height: PAGE_HEIGHT,
          background: 'linear-gradient(to right, rgba(0,0,0,0.14), rgba(255,255,255,0.015), rgba(0,0,0,0.14))',
          pointerEvents: 'none',
          transform: 'translateZ(10px)',
          opacity: 0.75,
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
        background: `linear-gradient(to ${direction === 'forward' ? 'left' : 'right'}, rgba(0,0,0,${intensity}), rgba(0,0,0,0.08) 42%, transparent 78%)`,
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
        const offsetX = side === 'left' ? -idx * 1.35 : idx * 1.35
        const offsetY = idx * 0.65
        const z = -idx * 0.65 - 2
        const edgeWidth = side === 'closed' ? 8 + idx * 0.6 : 6 + idx * 0.4

        return (
          <div
            key={`${side}-${idx}`}
            style={{
              position: 'absolute',
              top: offsetY,
              left: pageLeft + offsetX,
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              border: '1px solid rgba(214,221,227,0.05)',
              background: 'linear-gradient(180deg, rgba(208,214,220,0.18), rgba(140,150,160,0.05) 6%, rgba(11,17,26,0.14) 12%, rgba(8,12,20,0.62) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.028)',
              opacity: Math.max(0.07, 0.2 - idx * 0.018),
              transform: `translateZ(${z}px)`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                [side === 'left' ? 'left' : 'right']: 0,
                width: edgeWidth,
                background: 'linear-gradient(to right, rgba(228,232,236,0.13), rgba(208,214,220,0.06), transparent)',
                opacity: 0.75,
              }}
            />
          </div>
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

  const showBackContent = flipProgress >= 0.5
  const visibleSections = showBackContent
    ? (flipDirection === 'forward' ? page.back : page.front)
    : (flipDirection === 'forward' ? page.front : page.back)
  const visibleIsBack = showBackContent
    ? flipDirection === 'forward'
    : flipDirection === 'backward'

  const rotation = flipDirection === 'forward' ? -176 * flipProgress : 176 * flipProgress
  const lift = 6 + Math.sin(flipProgress * Math.PI) * 9
  const tilt = (flipDirection === 'forward' ? -1 : 1) * Math.sin(flipProgress * Math.PI) * 1.6
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
        transform: `translateZ(${lift}px) rotateX(${tilt}deg) rotateY(${rotation}deg)`,
        zIndex: 30,
        willChange: 'transform',
        filter: `drop-shadow(${flipDirection === 'forward' ? '-8px' : '8px'} 10px 18px rgba(0, 0, 0, 0.22))`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: `${showBackContent ? 'rotateY(180deg) ' : ''}translateZ(0.2px)`,
          overflow: 'hidden',
        }}
      >
        <NewspaperPageFace
          sections={visibleSections}
          pageNumber={page.pageNumber}
          isBack={visibleIsBack}
          tint={page.tint}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: flipDirection === 'forward' ? 0 : 'auto',
          right: flipDirection === 'forward' ? 'auto' : 0,
          width: 5,
          height: PAGE_HEIGHT,
          background: 'linear-gradient(to right, rgba(232,236,239,0.26), rgba(232,236,239,0.08), rgba(255,255,255,0.01), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value)
}
