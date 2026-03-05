import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import GlobeGL from 'react-globe.gl'
import type { GlobeMethods } from 'react-globe.gl'
import { CountryNewsModal } from './CountryNewsModal'
import { MarketImpactSidebar } from './MarketImpactSidebar'
import { sentimentColors } from '../lib/news'
import { getCapitalByCode, getCapitalByName } from '../data/capitals'
import type { NewsPoint, NewsArticle } from '../types/news'

interface GlobeProps {
  className?: string
  newsPoints: NewsPoint[]
  isLoading?: boolean
  isCategorizing?: boolean
  categorizationProgress?: { completed: number; total: number }
}

/**
 * Aggregated country data for country-level markers
 */
interface CountryMarker {
  countryCode: string
  countryName: string
  lat: number
  lng: number
  articleCount: number
  sentiment: 'positive' | 'negative' | 'neutral'
  articles: NewsArticle[]
}

interface CountryGeoJson {
  type: string
  features: { type: string; properties: Record<string, unknown>; geometry: { type: string; coordinates: unknown } }[]
}

export function Globe({ 
  className, 
  newsPoints, 
  isLoading,
  isCategorizing,
  categorizationProgress 
}: GlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredCountry, setHoveredCountry] = useState<CountryMarker | null>(null)
  const [showMarketSidebar, setShowMarketSidebar] = useState(false)
  const [sidebarArticle, setSidebarArticle] = useState<NewsArticle | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [countriesGeoJson, setCountriesGeoJson] = useState<CountryGeoJson | null>(null)
  
  // Country modal state
  const [countryModalOpen, setCountryModalOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<CountryMarker | null>(null)

  // Load country borders GeoJSON
  useEffect(() => {
    fetch('/geo/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => setCountriesGeoJson(data))
      .catch(err => console.error('Failed to load country borders:', err))
  }, [])

  // Aggregate news points into country markers
  const countryMarkers: CountryMarker[] = useMemo(() => {
    const countryMap = new Map<string, CountryMarker>()

    for (const point of newsPoints) {
      const article = point.article
      const countryCode = article.countryCode || article.country.toUpperCase()
      const countryName = article.country

      // Get existing marker or create new one
      let marker = countryMap.get(countryCode)
      
      if (!marker) {
        // Try to get capital coordinates, fallback to point coordinates
        const capital = getCapitalByCode(countryCode) || getCapitalByName(countryName)
        
        // Fallback: derive from existing points (average of this country's points)
        const countryPoints = newsPoints.filter(p => 
          p.article.countryCode === countryCode || 
          p.article.country.toLowerCase() === countryName.toLowerCase()
        )
        
        let lat = capital?.lat ?? point.lat
        let lng = capital?.lng ?? point.lng
        
        // If no capital but multiple points, average them
        if (!capital && countryPoints.length > 1) {
          lat = countryPoints.reduce((sum, p) => sum + p.lat, 0) / countryPoints.length
          lng = countryPoints.reduce((sum, p) => sum + p.lng, 0) / countryPoints.length
        }

        marker = {
          countryCode,
          countryName,
          lat,
          lng,
          articleCount: 0,
          sentiment: 'neutral',
          articles: [],
        }
        countryMap.set(countryCode, marker)
      }

      // Add article to marker
      marker.articles.push(article)
      marker.articleCount = marker.articles.length
      
      // Update sentiment based on majority
      const sentiments = marker.articles.map(a => a.sentiment || 'neutral')
      const positive = sentiments.filter(s => s === 'positive').length
      const negative = sentiments.filter(s => s === 'negative').length
      
      if (positive > negative) {
        marker.sentiment = 'positive'
      } else if (negative > positive) {
        marker.sentiment = 'negative'
      } else {
        marker.sentiment = 'neutral'
      }
    }

    return Array.from(countryMap.values())
  }, [newsPoints])

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
    if (globeRef.current && (hoveredCountry || countryModalOpen)) {
      const controls = globeRef.current.controls()
      if (controls) {
        controls.autoRotate = false
      }
    }
  }, [hoveredCountry, countryModalOpen])

  // Handle country marker click - opens modal immediately
  const handleCountryClick = useCallback((point: object) => {
    const countryMarker = point as CountryMarker
    
    if (countryMarker?.articles.length > 0) {
      // Open country modal immediately - no camera delay
      setSelectedCountry(countryMarker)
      setCountryModalOpen(true)
      
      // Optional: also move camera to country
      if (globeRef.current) {
        globeRef.current.pointOfView(
          { lat: countryMarker.lat, lng: countryMarker.lng, altitude: 1.5 },
          800
        )
      }
    }
  }, [])

  // Handle article click from country modal - opens MarketImpactSidebar
  const handleArticleClick = useCallback((article: NewsArticle) => {
    setSidebarArticle(article)
    setShowMarketSidebar(true)
    setCountryModalOpen(false)
  }, [])

  const handleCountryHover = useCallback((point: object | null) => {
    setHoveredCountry(point as CountryMarker | null)
  }, [])

  const getMarkerColor = useCallback((point: object) => {
    const marker = point as CountryMarker
    return sentimentColors[marker.sentiment] || sentimentColors.neutral
  }, [])

  // Calculate marker size based on article count
  const getMarkerRadius = useCallback((point: object) => {
    const marker = point as CountryMarker
    const isHovered = hoveredCountry?.countryCode === marker.countryCode
    // Base size + scaling based on article count
    const baseRadius = Math.min(0.8, 0.4 + (marker.articleCount * 0.15))
    return isHovered ? baseRadius * 1.5 : baseRadius
  }, [hoveredCountry])

  // Calculate stats from country markers
  const positiveCount = useMemo(() => 
    countryMarkers.filter(m => m.sentiment === 'positive').reduce((sum, m) => sum + m.articleCount, 0),
    [countryMarkers]
  )
  const neutralCount = useMemo(() => 
    countryMarkers.filter(m => m.sentiment === 'neutral').reduce((sum, m) => sum + m.articleCount, 0),
    [countryMarkers]
  )
  const negativeCount = useMemo(() => 
    countryMarkers.filter(m => m.sentiment === 'negative').reduce((sum, m) => sum + m.articleCount, 0),
    [countryMarkers]
  )

  return (
    <div ref={containerRef} className={`relative ${className || ''}`} style={{ width: '100%', height: '100%' }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--hud-surface)]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--muted-foreground)]">Loading news...</span>
          </div>
        </div>
      )}

      {/* Categorization progress */}
      {isCategorizing && categorizationProgress && (
        <div className="absolute top-4 right-4 z-10 p-3 rounded-lg hud-panel">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[var(--tropical-teal)] border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-xs font-medium text-[var(--foreground)]">Categorizing...</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {categorizationProgress.completed}/{categorizationProgress.total}
              </p>
            </div>
          </div>
          <div className="mt-2 h-1 bg-[var(--hud-surface)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--tropical-teal)] to-[var(--neon-ice)] transition-all duration-300"
              style={{ width: `${(categorizationProgress.completed / categorizationProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Hover HUD tooltip - Compact country info */}
      {hoveredCountry && (
        <div className="absolute top-4 left-4 z-10 p-3 rounded-lg hud-panel min-w-[180px] animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: sentimentColors[hoveredCountry.sentiment] }}
            />
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {hoveredCountry.countryName}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[var(--muted-foreground)]">
              {hoveredCountry.articleCount} {hoveredCountry.articleCount === 1 ? 'article' : 'articles'}
            </p>
            <p className="text-[10px] text-[var(--muted-foreground)] opacity-60">
              Click to view details
            </p>
          </div>
        </div>
      )}

      {/* Stats overlay - Compact bordered */}
      {countryMarkers.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 p-2 rounded-lg hud-panel">
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors.positive }} />
            <span className="text-xs text-[var(--muted-foreground)]">{positiveCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors.neutral }} />
            <span className="text-xs text-[var(--muted-foreground)]">{neutralCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors.negative }} />
            <span className="text-xs text-[var(--muted-foreground)]">{negativeCount}</span>
          </div>
          <span className="text-xs text-[var(--muted-foreground)] pl-2 border-l border-[var(--hud-border)]">
            {countryMarkers.length} countries
          </span>
        </div>
      )}

      {/* Globe */}
      {dimensions.width > 0 && (
        <GlobeGL
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          // Schematic globe - dark with subtle atmosphere
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          // Country borders layer using polygons
          polygonsData={countriesGeoJson?.features}
          polygonCapColor={() => 'rgba(13, 21, 38, 0.3)'}
          polygonSideColor={() => 'rgba(13, 21, 38, 0.2)'}
          polygonStrokeColor={() => 'rgba(91, 192, 190, 0.35)'}
          polygonAltitude={0.005}
          // Country markers (aggregated)
          pointsData={countryMarkers}
          pointLat={(d: object) => (d as CountryMarker).lat}
          pointLng={(d: object) => (d as CountryMarker).lng}
          pointColor={getMarkerColor}
          pointAltitude={0.03}
          pointRadius={getMarkerRadius}
          pointLabel={(d: object) => {
            const marker = d as CountryMarker
            return `
              <div style="
                background: rgba(13, 21, 38, 0.95);
                padding: 8px 12px;
                border-radius: 6px;
                border: 1px solid rgba(91, 192, 190, 0.35);
                font-family: system-ui, sans-serif;
              ">
                <div style="font-size: 12px; font-weight: 600; color: #e8f4f8;">
                  ${marker.countryName}
                </div>
                <div style="font-size: 10px; color: #8ba5b5; margin-top: 4px;">
                  ${marker.articleCount} ${marker.articleCount === 1 ? 'article' : 'articles'}
                </div>
              </div>
            `
          }}
          onPointClick={handleCountryClick}
          onPointHover={handleCountryHover}
          // Simplified atmosphere - teal glow
          atmosphereColor="rgba(91, 192, 190, 0.2)"
          atmosphereAltitude={0.15}
          // Performance
          animateIn={true}
        />
      )}

      {/* Country News Modal */}
      <CountryNewsModal
        countryName={selectedCountry?.countryName || ''}
        articles={selectedCountry?.articles || []}
        isOpen={countryModalOpen}
        onClose={() => {
          setCountryModalOpen(false)
          setSelectedCountry(null)
        }}
        onArticleClick={handleArticleClick}
      />

      {/* Market Impact Sidebar */}
      <MarketImpactSidebar
        article={sidebarArticle}
        isOpen={showMarketSidebar}
        onClose={() => {
          setShowMarketSidebar(false)
          setSidebarArticle(null)
        }}
      />
    </div>
  )
}
