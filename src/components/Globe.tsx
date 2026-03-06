import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import GlobeGL from 'react-globe.gl'
import type { GlobeMethods } from 'react-globe.gl'
import * as THREE from 'three'
import { CountryNewsModal } from './CountryNewsModal'
import { MarketImpactSidebar } from './MarketImpactSidebar'
import { sentimentColors } from '../lib/news'
import { getCoordinatesByCountryCode, getCoordinatesByCountryName } from '../data/country-coordinates'
import type { NewsPoint, NewsArticle } from '../types/news'

export interface HudFocus {
  name: string
  code: string
  count: number
  sentiment: 'positive' | 'negative' | 'neutral'
  hasData: boolean
  isGlobal: boolean
}

interface GlobeProps {
  className?: string
  newsPoints: NewsPoint[]
  isLoading?: boolean
  externalArticle?: NewsArticle | null
  onTogglePanels?: (visible: boolean) => void
  onHudFocusChange?: (focus: HudFocus) => void
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

interface GeoFeature {
  type: string
  properties: Record<string, unknown>
  geometry: { type: string; coordinates: unknown }
}

interface CountryGeoJson {
  type: string
  features: GeoFeature[]
}

// Flat dark globe material — schematic, no texture
const globeMaterial = new THREE.MeshPhongMaterial({
  color: new THREE.Color('#070c18'),
  emissive: new THREE.Color('#060a14'),
  shininess: 8,
  transparent: false,
})

/**
 * Extract ISO A2 code from a GeoJSON feature's properties
 */
function getFeatureIso(feat: GeoFeature): string {
  const props = feat.properties
  const isoA2 = ((props.ISO_A2 as string) || (props.iso_a2 as string) || '').toUpperCase()
  const isoA2Eh = ((props.ISO_A2_EH as string) || '').toUpperCase()
  if (isoA2 && isoA2 !== '-99') return isoA2
  if (isoA2Eh && isoA2Eh !== '-99') return isoA2Eh
  return isoA2 || isoA2Eh || ''
}

/**
 * Create a DOM element for a country marker (diamond glyph).
 * Event handlers are wired externally via data attributes + delegated events.
 */
function createMarkerEl(marker: CountryMarker): HTMLDivElement {
  const color = sentimentColors[marker.sentiment] || sentimentColors.neutral

  const wrapper = document.createElement('div')
  wrapper.className = 'globe-marker'
  wrapper.setAttribute('data-country-code', marker.countryCode)
  wrapper.style.color = color

  const diamond = document.createElement('div')
  diamond.className = 'globe-marker-diamond'
  wrapper.appendChild(diamond)

  // Count tag
  if (marker.articleCount > 0) {
    const count = document.createElement('span')
    count.className = 'globe-marker-count'
    count.textContent = String(marker.articleCount)
    wrapper.appendChild(count)
  }

  // Country code label (visible on hover via CSS)
  const label = document.createElement('span')
  label.className = 'globe-marker-label'
  label.textContent = marker.countryCode
  wrapper.appendChild(label)

  return wrapper
}

export function Globe({
  className,
  newsPoints,
  isLoading,
  externalArticle,
  onTogglePanels,
  onHudFocusChange,
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

  // Polygon hover — ref for perf-safe dedup, state for render
  const hoveredPolygonRef = useRef<string | null>(null)
  const [hoveredPolygonIso, setHoveredPolygonIso] = useState<string | null>(null)
  const boundElementsRef = useRef<WeakSet<HTMLDivElement>>(new WeakSet())

  // External article bridge: when App passes an article from GlobalFeed, open sidebar
  useEffect(() => {
    if (externalArticle) {
      queueMicrotask(() => {
        setSidebarArticle(externalArticle)
        setShowMarketSidebar(true)
      })
    }
  }, [externalArticle])

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

      let marker = countryMap.get(countryCode)

      if (!marker) {
        const coords = getCoordinatesByCountryCode(countryCode) || getCoordinatesByCountryName(countryName)

        let lat = coords?.lat ?? point.lat
        let lng = coords?.lng ?? point.lng

        if (!coords) {
          const countryPoints = newsPoints.filter(p =>
            p.article.countryCode === countryCode ||
            p.article.country.toLowerCase() === countryName.toLowerCase()
          )
          if (countryPoints.length > 1) {
            lat = countryPoints.reduce((sum, p) => sum + p.lat, 0) / countryPoints.length
            lng = countryPoints.reduce((sum, p) => sum + p.lng, 0) / countryPoints.length
          }
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

      marker.articles.push(article)
      marker.articleCount = marker.articles.length

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

  // Build a lookup: ISO code → CountryMarker for polygon click/hover
  const markersByIso = useMemo(() => {
    const map = new Map<string, CountryMarker>()
    for (const m of countryMarkers) {
      map.set(m.countryCode.toUpperCase(), m)
    }
    return map
  }, [countryMarkers])

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
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
    if (globeRef.current && (hoveredCountry || hoveredPolygonIso || countryModalOpen)) {
      const controls = globeRef.current.controls()
      if (controls) {
        controls.autoRotate = false
      }
    }
  }, [hoveredCountry, hoveredPolygonIso, countryModalOpen])

  // Handle country marker click → opens modal immediately
  const handleCountryClick = useCallback((marker: CountryMarker) => {
    if (marker?.articles.length > 0) {
      setSelectedCountry(marker)
      setCountryModalOpen(true)

      if (globeRef.current) {
        globeRef.current.pointOfView(
          { lat: marker.lat, lng: marker.lng, altitude: 1.5 },
          800
        )
      }
    }
  }, [])

  // Handle article click from country modal → opens MarketImpactSidebar
  const handleArticleClick = useCallback((article: NewsArticle) => {
    setSidebarArticle(article)
    setShowMarketSidebar(true)
    setCountryModalOpen(false)
  }, [])

  // ─── Polygon hover (perf-safe: ref dedup) ───
  const handlePolygonHover = useCallback((feat: object | null) => {
    const iso = feat ? getFeatureIso(feat as GeoFeature) : null
    if (iso === hoveredPolygonRef.current) return // no change → skip setState
    hoveredPolygonRef.current = iso
    setHoveredPolygonIso(iso)
  }, [])

  // Polygon click → open modal if country has data
  const handlePolygonClick = useCallback((feat: object) => {
    const iso = getFeatureIso(feat as GeoFeature)
    const marker = markersByIso.get(iso)
    if (marker) {
      handleCountryClick(marker)
    }
  }, [markersByIso, handleCountryClick])

  // ─── Polygon color functions (dynamic per hover/selection/sentiment) ───
  const polygonCapColor = useCallback((feat: object) => {
    const iso = getFeatureIso(feat as GeoFeature)
    const isHovered = iso === hoveredPolygonIso
    const isSelected = iso === selectedCountry?.countryCode?.toUpperCase()
    const marker = markersByIso.get(iso)

    if (isSelected) return 'rgba(111, 255, 233, 0.16)'
    if (isHovered && marker) {
      const color = sentimentColors[marker.sentiment]
      return color + '26'
    }
    if (isHovered) return 'rgba(91, 192, 190, 0.12)'
    if (marker) return 'rgba(91, 192, 190, 0.08)'
    return 'rgba(13, 21, 38, 0.18)'
  }, [hoveredPolygonIso, selectedCountry, markersByIso])

  const polygonStrokeColor = useCallback((feat: object) => {
    const iso = getFeatureIso(feat as GeoFeature)
    const isHovered = iso === hoveredPolygonIso
    const isSelected = iso === selectedCountry?.countryCode?.toUpperCase()

    if (isSelected) return '#6fffe9'
    if (isHovered) return 'rgba(91, 192, 190, 0.7)'
    return 'rgba(91, 192, 190, 0.25)'
  }, [hoveredPolygonIso, selectedCountry])

  const polygonAltitude = useCallback((feat: object) => {
    const iso = getFeatureIso(feat as GeoFeature)
    if (iso === hoveredPolygonIso) return 0.008
    return 0.005
  }, [hoveredPolygonIso])

  // ─── Unified HUD Focus (marker hover OR polygon hover → falls back to global stats) ───
  const hudFocus = useMemo(() => {
    if (hoveredCountry) {
      return {
        name: hoveredCountry.countryName,
        code: hoveredCountry.countryCode,
        count: hoveredCountry.articleCount,
        sentiment: hoveredCountry.sentiment,
        hasData: true,
        isGlobal: false,
      }
    }
    if (hoveredPolygonIso) {
      const marker = markersByIso.get(hoveredPolygonIso)
      if (marker) {
        return {
          name: marker.countryName,
          code: marker.countryCode,
          count: marker.articleCount,
          sentiment: marker.sentiment,
          hasData: true,
          isGlobal: false,
        }
      }
      // Country exists in GeoJSON but has no news data
      const feature = countriesGeoJson?.features.find(f => getFeatureIso(f) === hoveredPolygonIso)
      const name = (feature?.properties?.NAME as string) || (feature?.properties?.name as string) || hoveredPolygonIso
      return {
        name,
        code: hoveredPolygonIso,
        count: 0,
        sentiment: 'neutral' as const,
        hasData: false,
        isGlobal: false,
      }
    }
    // Default: show global overview
    return {
      name: 'Global Overview',
      code: 'LIVE',
      count: countryMarkers.reduce((sum, m) => sum + m.articleCount, 0),
      sentiment: (() => {
        const pos = countryMarkers.filter(m => m.sentiment === 'positive').length
        const neg = countryMarkers.filter(m => m.sentiment === 'negative').length
        return pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral'
      })() as 'positive' | 'negative' | 'neutral',
      hasData: countryMarkers.length > 0,
      isGlobal: true,
    }
  }, [hoveredCountry, hoveredPolygonIso, markersByIso, countriesGeoJson, countryMarkers])

  // Notify parent when hudFocus changes (for external HUD overlay)
  useEffect(() => {
    onHudFocusChange?.(hudFocus)
  }, [hudFocus, onHudFocusChange])

  // Calculate sentiment stats from individual articles (matches badges)
  const sentimentCounts = useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0 }
    for (const marker of countryMarkers) {
      for (const article of marker.articles) {
        const sentiment = article.sentiment || 'neutral'
        if (sentiment === 'positive') counts.positive++
        else if (sentiment === 'negative') counts.negative++
        else counts.neutral++
      }
    }
    return counts
  }, [countryMarkers])

  // ─── htmlElementsData: create marker elements ───
  const markerElements = useMemo(() => {
    return countryMarkers.map(marker => ({
      ...marker,
      el: createMarkerEl(marker),
    }))
  }, [countryMarkers])

  // Sync hover class on marker elements + bind click handlers
  useEffect(() => {
    for (const { el, countryCode, ...marker } of markerElements) {
      const isHovered = hoveredCountry?.countryCode === countryCode || hoveredPolygonIso === countryCode.toUpperCase()
      if (isHovered) {
        el.classList.add('is-hovered')
      } else {
        el.classList.remove('is-hovered')
      }

      // Bind event listeners only once
      if (!boundElementsRef.current.has(el)) {
        boundElementsRef.current.add(el)
        el.addEventListener('mouseenter', () => {
          setHoveredCountry({ countryCode, ...marker } as CountryMarker)
        })
        el.addEventListener('mouseleave', () => {
          setHoveredCountry(null)
        })
        el.addEventListener('click', () => {
          const fullMarker: CountryMarker = { countryCode, ...marker }
          handleCountryClick(fullMarker)
        })
      }
    }
  }, [markerElements, hoveredCountry, hoveredPolygonIso, handleCountryClick])

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

      {/* Stats overlay - Compact bordered */}
      {countryMarkers.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 p-2 rounded-sm hud-panel">
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors.positive }} />
            <span className="font-mono-hud text-xs text-[var(--muted-foreground)]">{sentimentCounts.positive}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors.neutral }} />
            <span className="font-mono-hud text-xs text-[var(--muted-foreground)]">{sentimentCounts.neutral}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColors.negative }} />
            <span className="font-mono-hud text-xs text-[var(--muted-foreground)]">{sentimentCounts.negative}</span>
          </div>
          <span className="font-mono-hud text-xs text-[var(--muted-foreground)] pl-2 border-l border-[var(--hud-border)]">
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
          // Schematic globe — flat dark material, no texture
          globeMaterial={globeMaterial}
          // Country polygon borders
          polygonsData={countriesGeoJson?.features}
          polygonCapColor={polygonCapColor}
          polygonSideColor={() => 'rgba(13, 21, 38, 0.15)'}
          polygonStrokeColor={polygonStrokeColor}
          polygonAltitude={polygonAltitude}
          onPolygonHover={handlePolygonHover}
          onPolygonClick={handlePolygonClick}
          // HTML marker elements (diamond glyphs)
          htmlElementsData={markerElements}
          htmlLat={(d: object) => (d as CountryMarker).lat}
          htmlLng={(d: object) => (d as CountryMarker).lng}
          htmlAltitude={0.02}
          htmlElement={(d: object) => (d as { el: HTMLDivElement }).el}
          // No atmosphere — schematic look
          showAtmosphere={false}
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
          onTogglePanels?.(true)
          setShowMarketSidebar(false)
          setSidebarArticle(null)
        }}
      />
    </div>
  )
}
