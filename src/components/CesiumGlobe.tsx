import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Cartesian3,
  Color,
  Ion,
  Viewer,
  GeoJsonDataSource,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
  Entity,
  CallbackProperty
} from 'cesium'
import { countriesData, type CountryInfo } from '../data/countries'
import { CountryModal } from './CountryModal'

// GeoJSON URL for country boundaries
const COUNTRIES_GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'

interface CesiumGlobeProps {
  className?: string
}

export function CesiumGlobe({ className }: CesiumGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const dataSourceRef = useRef<GeoJsonDataSource | null>(null)
  const hoveredEntityRef = useRef<Entity | null>(null)
  const originalColorRef = useRef<Color | null>(null)
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null)
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null)

  const handleCloseModal = useCallback(() => {
    setSelectedCountry(null)
  }, [])

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return

    const token = import.meta.env.VITE_CESIUM_TOKEN
    if (!token) {
      setError('VITE_CESIUM_TOKEN non configurato')
      setLoading(false)
      return
    }
    Ion.defaultAccessToken = token

    let viewer: Viewer | null = null
    let handler: ScreenSpaceEventHandler | null = null

    const initCesium = async () => {
      try {
        // Create a div to hide credits
        const creditContainer = document.createElement('div')
        creditContainer.style.display = 'none'

        // Simple globe viewer without terrain for better performance
        viewer = new Viewer(containerRef.current!, {
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          creditContainer,
          requestRenderMode: true,
          maximumRenderTimeChange: Infinity,
        })

        viewerRef.current = viewer

        // Set initial camera position to show the globe
        viewer.camera.setView({
          destination: Cartesian3.fromDegrees(10, 30, 20000000),
        })

        // Limit zoom
        if (viewer.scene && viewer.scene.screenSpaceCameraController) {
          viewer.scene.screenSpaceCameraController.minimumZoomDistance = 2000000
          viewer.scene.screenSpaceCameraController.maximumZoomDistance = 30000000
        }

        // Load country boundaries
        const dataSource = await GeoJsonDataSource.load(COUNTRIES_GEOJSON_URL, {
          stroke: Color.fromCssColorString('#3b82f6'),
          strokeWidth: 1,
          fill: Color.fromCssColorString('#3b82f6').withAlpha(0.1),
        })
        
        // Check if viewer is still valid before adding data source
        if (!viewer || viewer.isDestroyed()) {
          return
        }

        viewer.dataSources.add(dataSource)
        dataSourceRef.current = dataSource

        // Style all entities
        const entities = dataSource.entities.values
        for (const entity of entities) {
          if (entity.polygon) {
            entity.polygon.outlineColor = new CallbackProperty(() => {
              if (hoveredEntityRef.current === entity) {
                return Color.fromCssColorString('#10b981')
              }
              return Color.fromCssColorString('#3b82f6')
            }, false) as unknown as Color
            
            entity.polygon.outlineWidth = new CallbackProperty(() => {
              if (hoveredEntityRef.current === entity) {
                return 3
              }
              return 1
            }, false) as unknown as number
          }
        }

        // Event handlers for click and hover
        handler = new ScreenSpaceEventHandler(viewer.scene.canvas)

        // Click handler
        handler.setInputAction((movement: { position: { x: number; y: number } }) => {
          if (!viewer || viewer.isDestroyed()) return
          const pickedObject = viewer.scene.pick(movement.position)
          
          if (defined(pickedObject) && pickedObject.id) {
            const entity = pickedObject.id as Entity
            const countryName = entity.properties?.ADMIN?.getValue() as string
            
            if (countryName) {
              const countryInfo = countriesData[countryName]
              if (countryInfo) {
                setSelectedCountry(countryInfo)
              } else {
                // Fallback for countries not in our data
                setSelectedCountry({
                  name: countryName,
                  capital: 'N/A',
                  population: 'N/A',
                  area: 'N/A',
                  currency: 'N/A',
                  language: 'N/A',
                  continent: 'N/A'
                })
              }
            }
          }
        }, ScreenSpaceEventType.LEFT_CLICK)

        // Hover handler
        handler.setInputAction((movement: { endPosition: { x: number; y: number } }) => {
          if (!viewer || viewer.isDestroyed()) return
          const pickedObject = viewer.scene.pick(movement.endPosition)
          
          // Reset previous hovered entity
          if (hoveredEntityRef.current && hoveredEntityRef.current.polygon) {
            hoveredEntityRef.current.polygon.material = Color.fromCssColorString('#3b82f6').withAlpha(0.1)
          }
          
          if (defined(pickedObject) && pickedObject.id) {
            const entity = pickedObject.id as Entity
            const countryName = entity.properties?.ADMIN?.getValue() as string
            
            if (countryName && entity.polygon) {
              hoveredEntityRef.current = entity
              setHoveredCountryName(countryName)
              
              // Highlight on hover
              entity.polygon.material = Color.fromCssColorString('#10b981').withAlpha(0.3)
              viewer.scene.requestRender()
            }
          } else {
            hoveredEntityRef.current = null
            setHoveredCountryName(null)
          }
        }, ScreenSpaceEventType.MOUSE_MOVE)

        setLoading(false)
      } catch (err) {
        console.error('Failed to initialize Cesium:', err)
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
        setLoading(false)
      }
    }

    initCesium()

    return () => {
      if (handler) {
        handler.destroy()
        handler = null
      }
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy()
        viewer = null
        viewerRef.current = null
      }
    }
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[var(--card)]">
        <div className="text-center p-4">
          <p className="font-semibold mb-2 text-[var(--destructive)]">Errore Cesium</p>
          <p className="text-sm text-[var(--muted-foreground)]">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className || ''}`} style={{ width: '100%', height: '100%' }}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--background)]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[var(--muted-foreground)]">Caricamento globo...</p>
          </div>
        </div>
      )}
      
      {/* Hovered country indicator */}
      {hoveredCountryName && (
        <div className="absolute top-4 left-4 z-10 px-3 py-2 bg-[var(--card)]/90 backdrop-blur-sm border border-[var(--border)] rounded-lg">
          <p className="text-sm font-medium text-[var(--foreground)]">{hoveredCountryName}</p>
        </div>
      )}

      {/* Cesium container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Country modal */}
      <CountryModal country={selectedCountry} onClose={handleCloseModal} />
    </div>
  )
}
