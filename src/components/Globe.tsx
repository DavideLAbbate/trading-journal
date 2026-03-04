import { useEffect, useRef, useState, useCallback } from 'react'
import GlobeGL from 'react-globe.gl'
import { NewsModal } from './NewsModal'
import { sentimentColors } from '../lib/news'
import type { NewsPoint, NewsArticle } from '../types/news'

interface GlobeProps {
  className?: string
  newsPoints: NewsPoint[]
  isLoading?: boolean
  onAnalyzeArticle?: (article: NewsArticle) => Promise<void>
  isAnalyzing?: boolean
}

export function Globe({ 
  className, 
  newsPoints, 
  isLoading,
  onAnalyzeArticle,
  isAnalyzing 
}: GlobeProps) {
  const globeRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredPoint, setHoveredPoint] = useState<NewsPoint | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Set initial camera position
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 30, lng: 10, altitude: 2.2 }, 1000)
      
      // Configure controls
      const controls = globeRef.current.controls()
      if (controls) {
        controls.minDistance = 150
        controls.maxDistance = 500
        controls.autoRotate = true
        controls.autoRotateSpeed = 0.3
      }
    }
  }, [newsPoints.length])

  // Stop auto-rotate on interaction
  useEffect(() => {
    if (globeRef.current && (hoveredPoint || selectedArticle)) {
      const controls = globeRef.current.controls()
      if (controls) {
        controls.autoRotate = false
      }
    }
  }, [hoveredPoint, selectedArticle])

  const handlePointClick = useCallback((point: object) => {
    const newsPoint = point as NewsPoint
    if (newsPoint?.article) {
      setSelectedArticle(newsPoint.article)
      
      // Focus camera on the point
      if (globeRef.current) {
        globeRef.current.pointOfView(
          { lat: newsPoint.lat, lng: newsPoint.lng, altitude: 1.5 },
          1000
        )
      }
    }
  }, [])

  const handlePointHover = useCallback((point: object | null) => {
    setHoveredPoint(point as NewsPoint | null)
  }, [])

  const getPointColor = useCallback((point: object) => {
    const newsPoint = point as NewsPoint
    return sentimentColors[newsPoint.sentiment] || sentimentColors.neutral
  }, [])

  const getPointAltitude = useCallback((point: object) => {
    const newsPoint = point as NewsPoint
    const isHovered = hoveredPoint?.id === newsPoint.id
    return isHovered ? 0.08 : 0.02
  }, [hoveredPoint])

  const getPointRadius = useCallback((point: object) => {
    const newsPoint = point as NewsPoint
    const isHovered = hoveredPoint?.id === newsPoint.id
    return isHovered ? 0.8 : 0.5
  }, [hoveredPoint])

  return (
    <div ref={containerRef} className={`relative ${className || ''}`} style={{ width: '100%', height: '100%' }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--background)]/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--muted-foreground)]">Loading news...</span>
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredPoint && (
        <div className="absolute top-4 left-4 z-10 max-w-xs p-4 rounded-xl bg-[var(--card)]/95 backdrop-blur-sm border border-[var(--border)] shadow-2xl animate-fade-in">
          <div className="flex items-start gap-3">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5 animate-pulse-glow"
              style={{ 
                backgroundColor: sentimentColors[hoveredPoint.sentiment],
                color: sentimentColors[hoveredPoint.sentiment]
              }} 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--foreground)] line-clamp-2">
                {hoveredPoint.title}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {hoveredPoint.source}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">•</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {hoveredPoint.country}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Click per dettagli
          </p>
        </div>
      )}

      {/* Stats overlay */}
      {newsPoints.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 p-3 rounded-xl bg-[var(--card)]/80 backdrop-blur-sm border border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sentimentColors.positive }} />
            <span className="text-xs text-[var(--muted-foreground)]">
              {newsPoints.filter(p => p.sentiment === 'positive').length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sentimentColors.neutral }} />
            <span className="text-xs text-[var(--muted-foreground)]">
              {newsPoints.filter(p => p.sentiment === 'neutral').length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sentimentColors.negative }} />
            <span className="text-xs text-[var(--muted-foreground)]">
              {newsPoints.filter(p => p.sentiment === 'negative').length}
            </span>
          </div>
        </div>
      )}

      {/* Globe */}
      {dimensions.width > 0 && (
        <GlobeGL
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          // News points
          pointsData={newsPoints}
          pointLat={(d: object) => (d as NewsPoint).lat}
          pointLng={(d: object) => (d as NewsPoint).lng}
          pointColor={getPointColor}
          pointAltitude={getPointAltitude}
          pointRadius={getPointRadius}
          pointLabel={(d: object) => {
            const point = d as NewsPoint
            return `
              <div style="
                background: rgba(12, 12, 15, 0.95);
                padding: 8px 12px;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.1);
                max-width: 250px;
                font-family: system-ui, sans-serif;
              ">
                <div style="font-size: 12px; font-weight: 600; color: #fafafa; line-height: 1.4;">
                  ${point.title.slice(0, 80)}${point.title.length > 80 ? '...' : ''}
                </div>
                <div style="font-size: 10px; color: #71717a; margin-top: 4px;">
                  ${point.source} • ${point.country}
                </div>
              </div>
            `
          }}
          onPointClick={handlePointClick}
          onPointHover={handlePointHover}
          // Atmosphere
          atmosphereColor="#3b82f6"
          atmosphereAltitude={0.15}
          // Performance
          animateIn={true}
        />
      )}

      {/* News Modal */}
      <NewsModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onAnalyze={onAnalyzeArticle}
        isAnalyzing={isAnalyzing}
      />
    </div>
  )
}
