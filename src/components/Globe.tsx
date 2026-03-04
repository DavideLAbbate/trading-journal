import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
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

// Cluster points that are too close together
interface ClusteredPoint extends NewsPoint {
  count: number
  articles: NewsArticle[]
}

function clusterPoints(points: NewsPoint[], threshold = 3): ClusteredPoint[] {
  const clusters: ClusteredPoint[] = []
  const used = new Set<string>()

  for (const point of points) {
    if (used.has(point.id)) continue

    const nearby = points.filter(p => {
      if (used.has(p.id) || p.id === point.id) return false
      const dist = Math.sqrt(
        Math.pow(p.lat - point.lat, 2) + Math.pow(p.lng - point.lng, 2)
      )
      return dist < threshold
    })

    if (nearby.length > 0) {
      const allPoints = [point, ...nearby]
      allPoints.forEach(p => used.add(p.id))
      
      // Calculate center of cluster
      const avgLat = allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length
      const avgLng = allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length
      
      // Determine dominant sentiment
      const sentimentCounts = { positive: 0, negative: 0, neutral: 0 }
      allPoints.forEach(p => sentimentCounts[p.sentiment]++)
      const dominantSentiment = Object.entries(sentimentCounts)
        .sort((a, b) => b[1] - a[1])[0][0] as 'positive' | 'negative' | 'neutral'

      clusters.push({
        ...point,
        id: `cluster_${point.id}`,
        lat: avgLat,
        lng: avgLng,
        sentiment: dominantSentiment,
        count: allPoints.length,
        articles: allPoints.map(p => p.article)
      })
    } else {
      used.add(point.id)
      clusters.push({
        ...point,
        count: 1,
        articles: [point.article]
      })
    }
  }

  return clusters
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
  const [hoveredPoint, setHoveredPoint] = useState<ClusteredPoint | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Cluster nearby points for better visibility
  const clusteredPoints = useMemo(() => clusterPoints(newsPoints), [newsPoints])

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
    const clusteredPoint = point as ClusteredPoint
    if (clusteredPoint?.articles?.length > 0) {
      // For clusters, show the first article (could implement a picker later)
      setSelectedArticle(clusteredPoint.articles[0])
      
      // Focus camera on the point
      if (globeRef.current) {
        globeRef.current.pointOfView(
          { lat: clusteredPoint.lat, lng: clusteredPoint.lng, altitude: 1.5 },
          1000
        )
      }
    }
  }, [])

  const handlePointHover = useCallback((point: object | null) => {
    setHoveredPoint(point as ClusteredPoint | null)
  }, [])

  const getPointColor = useCallback((point: object) => {
    const clusteredPoint = point as ClusteredPoint
    return sentimentColors[clusteredPoint.sentiment] || sentimentColors.neutral
  }, [])

  const getPointAltitude = useCallback((point: object) => {
    const clusteredPoint = point as ClusteredPoint
    const isHovered = hoveredPoint?.id === clusteredPoint.id
    // Bigger altitude for clusters
    const baseAltitude = clusteredPoint.count > 1 ? 0.04 : 0.02
    return isHovered ? 0.1 : baseAltitude
  }, [hoveredPoint])

  const getPointRadius = useCallback((point: object) => {
    const clusteredPoint = point as ClusteredPoint
    const isHovered = hoveredPoint?.id === clusteredPoint.id
    // Bigger radius for clusters based on count
    const baseRadius = 0.4 + Math.min(clusteredPoint.count * 0.15, 0.6)
    return isHovered ? baseRadius * 1.4 : baseRadius
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
        <div className="absolute top-4 left-4 z-10 max-w-xs p-3 rounded-lg bg-[var(--card)]/95 backdrop-blur-sm border border-[var(--border)] shadow-2xl animate-fade-in">
          <div className="flex items-start gap-2.5">
            <div 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
              style={{ backgroundColor: sentimentColors[hoveredPoint.sentiment] }} 
            />
            <div className="flex-1 min-w-0">
              {hoveredPoint.count > 1 ? (
                <>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {hoveredPoint.count} notizie
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {hoveredPoint.country}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-[var(--foreground)] line-clamp-2">
                    {hoveredPoint.title}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {hoveredPoint.source} - {hoveredPoint.country}
                  </p>
                </>
              )}
            </div>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-2 opacity-60">
            Click per dettagli
          </p>
        </div>
      )}

      {/* Stats overlay */}
      {newsPoints.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--card)]/80 backdrop-blur-sm border border-[var(--border)]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors.positive }} />
            <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
              {newsPoints.filter(p => p.sentiment === 'positive').length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors.neutral }} />
            <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
              {newsPoints.filter(p => p.sentiment === 'neutral').length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors.negative }} />
            <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
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
          pointsData={clusteredPoints}
          pointLat={(d: object) => (d as ClusteredPoint).lat}
          pointLng={(d: object) => (d as ClusteredPoint).lng}
          pointColor={getPointColor}
          pointAltitude={getPointAltitude}
          pointRadius={getPointRadius}
          pointLabel={(d: object) => {
            const point = d as ClusteredPoint
            const title = point.count > 1 
              ? `${point.count} notizie`
              : point.title.slice(0, 60) + (point.title.length > 60 ? '...' : '')
            return `
              <div style="
                background: rgba(12, 12, 15, 0.95);
                padding: 6px 10px;
                border-radius: 6px;
                border: 1px solid rgba(255,255,255,0.08);
                max-width: 200px;
                font-family: system-ui, sans-serif;
              ">
                <div style="font-size: 11px; font-weight: 500; color: #fafafa; line-height: 1.3;">
                  ${title}
                </div>
                <div style="font-size: 9px; color: #71717a; margin-top: 3px;">
                  ${point.country}
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
