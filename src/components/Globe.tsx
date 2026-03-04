import { useEffect, useRef, useState, useCallback } from 'react'
import GlobeGL from 'react-globe.gl'
import { CountryModal } from './CountryModal'
import { countriesData, type CountryInfo } from '../data/countries'

// Lightweight GeoJSON for country boundaries
const COUNTRIES_GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'

interface CountryFeature {
  type: 'Feature'
  properties: {
    NAME: string
    ISO_A2: string
    ISO_A3: string
    CONTINENT: string
    POP_EST: number
    GDP_MD: number
  }
  geometry: {
    type: string
    coordinates: number[][][]
  }
}

interface GlobeProps {
  className?: string
}

export function Globe({ className }: GlobeProps) {
  const globeRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [countries, setCountries] = useState<CountryFeature[]>([])
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null)
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

  // Load countries GeoJSON
  useEffect(() => {
    fetch(COUNTRIES_GEOJSON_URL)
      .then(res => res.json())
      .then(data => {
        setCountries(data.features)
      })
      .catch(err => console.error('Failed to load countries:', err))
  }, [])

  // Set initial camera position
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 30, lng: 10, altitude: 2.5 }, 0)
      
      // Disable zoom limits
      const controls = globeRef.current.controls()
      if (controls) {
        controls.minDistance = 150
        controls.maxDistance = 500
      }
    }
  }, [countries])

  const handlePolygonClick = useCallback((polygon: object, event: MouseEvent, coords: { lat: number; lng: number; altitude: number }) => {
    const feature = polygon as CountryFeature | null
    if (feature?.properties?.NAME) {
      const countryName = feature.properties.NAME
      const info = countriesData[countryName]
      if (info) {
        setSelectedCountry(info)
      }
    }
  }, [])

  const handlePolygonHover = useCallback((polygon: object | null, prevPolygon: object | null) => {
    const feature = polygon as CountryFeature | null
    setHoveredCountry(feature?.properties?.NAME || null)
  }, [])

  const getPolygonColor = useCallback((polygon: object) => {
    const feature = polygon as CountryFeature
    const isHovered = feature.properties?.NAME === hoveredCountry
    return isHovered 
      ? 'rgba(59, 130, 246, 0.6)' 
      : 'rgba(59, 130, 246, 0.2)'
  }, [hoveredCountry])

  const getPolygonStrokeColor = useCallback((polygon: object) => {
    const feature = polygon as CountryFeature
    const isHovered = feature.properties?.NAME === hoveredCountry
    return isHovered 
      ? 'rgba(34, 197, 94, 1)' 
      : 'rgba(59, 130, 246, 0.5)'
  }, [hoveredCountry])

  const getPolygonAltitude = useCallback((polygon: object) => {
    const feature = polygon as CountryFeature
    const isHovered = feature.properties?.NAME === hoveredCountry
    return isHovered ? 0.02 : 0.01
  }, [hoveredCountry])

  return (
    <div ref={containerRef} className={`relative ${className || ''}`} style={{ width: '100%', height: '100%' }}>
      {/* Hover indicator */}
      {hoveredCountry && (
        <div className="absolute top-4 left-4 z-10 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-lg">
          <span className="text-sm font-medium text-[var(--foreground)]">{hoveredCountry}</span>
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
          polygonsData={countries}
          polygonCapColor={getPolygonColor}
          polygonSideColor={() => 'rgba(59, 130, 246, 0.1)'}
          polygonStrokeColor={getPolygonStrokeColor}
          polygonAltitude={getPolygonAltitude}
          polygonLabel={(d: object) => {
            const feature = d as CountryFeature
            return `<div class="globe-tooltip">${feature.properties?.NAME || ''}</div>`
          }}
          onPolygonClick={handlePolygonClick}
          onPolygonHover={handlePolygonHover}
          atmosphereColor="#3b82f6"
          atmosphereAltitude={0.15}
        />
      )}

      {/* Country Modal */}
      <CountryModal
        country={selectedCountry}
        isOpen={!!selectedCountry}
        onClose={() => setSelectedCountry(null)}
      />

      {/* Tooltip styles */}
      <style>{`
        .globe-tooltip {
          background: var(--card);
          color: var(--foreground);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid var(--border);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  )
}
