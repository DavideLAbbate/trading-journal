import { useEffect, useRef, useState } from 'react'
import {
  Cartesian3,
  createOsmBuildingsAsync,
  Ion,
  Math as CesiumMath,
  Terrain,
  Viewer
} from 'cesium'
// CSS handled automatically by vite-plugin-cesium

interface CesiumGlobeProps {
  className?: string
}

export function CesiumGlobe({ className }: CesiumGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (!containerRef.current || viewerRef.current) return

    // Set Cesium Ion access token
    const token = import.meta.env.VITE_CESIUM_TOKEN
    if (!token) {
      setError('VITE_CESIUM_TOKEN non configurato. Aggiungi il token nel file .env')
      return
    }
    Ion.defaultAccessToken = token

    let viewer: Viewer | null = null

    const initCesium = async () => {
      try {
        console.log('[v0] Initializing Cesium viewer...')
        
        // Initialize the Cesium Viewer
        viewer = new Viewer(containerRef.current!, {
          terrain: Terrain.fromWorldTerrain(),
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          fullscreenButton: false,
        })

        viewerRef.current = viewer
        console.log('[v0] Cesium viewer initialized successfully')

        // Fly the camera to San Francisco
        viewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
          orientation: {
            heading: CesiumMath.toRadians(0.0),
            pitch: CesiumMath.toRadians(-15.0),
          }
        })

        // Add Cesium OSM Buildings
        const buildingTileset = await createOsmBuildingsAsync()
        viewer.scene.primitives.add(buildingTileset)
        console.log('[v0] OSM Buildings added')
      } catch (err) {
        console.error('[v0] Failed to initialize Cesium:', err)
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      }
    }

    initCesium()

    // Cleanup on unmount
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        console.log('[v0] Destroying Cesium viewer')
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[var(--card)] text-[var(--destructive)]">
        <div className="text-center p-4">
          <p className="font-semibold mb-2">Errore Cesium</p>
          <p className="text-sm text-[var(--muted-foreground)]">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
