import { useEffect, useRef } from 'react'
import {
  Cartesian3,
  createOsmBuildingsAsync,
  Ion,
  Math as CesiumMath,
  Terrain,
  Viewer
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

// Set your Cesium Ion access token
// Get a free token at: https://cesium.com/ion/tokens
Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN || ''

interface CesiumGlobeProps {
  className?: string
}

export function CesiumGlobe({ className }: CesiumGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return

    const initCesium = async () => {
      try {
        // Initialize the Cesium Viewer
        const viewer = new Viewer(containerRef.current!, {
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
      } catch (error) {
        console.error('Failed to initialize Cesium:', error)
      }
    }

    initCesium()

    // Cleanup on unmount
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
