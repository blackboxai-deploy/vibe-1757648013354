'use client'

import { useEffect, useRef, useState } from 'react'
import { ConfigurationData, FilterState } from '@/types/dashboard'
import { INDONESIA_PROVINCES, INDONESIA_CENTER, MAP_ZOOM_LEVELS } from '@/lib/indonesia-geodata'

interface NationalMapViewProps {
  configData: ConfigurationData
  filterState: FilterState
  onProvinceSelect: (provinceId: string) => void
}

export function NationalMapView({ configData, filterState, onProvinceSelect }: NationalMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Dynamic import of Leaflet for client-side rendering
    const initMap = async () => {
      const L = (await import('leaflet')).default

      // Create map instance
      const map = L.map(mapRef.current!, {
        center: INDONESIA_CENTER,
        zoom: MAP_ZOOM_LEVELS.national,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
      })

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      setMapInstance(map)

       // Add province areas with POI density color coding
      INDONESIA_PROVINCES.forEach((province) => {
        // Calculate color intensity based on POI density (darker blue = more POI)
        const intensity = Math.min(province.poiDensity / 100, 1)
        
        // Create sophisticated blue gradient based on POI density
        // Higher POI = darker, more saturated blue
        const baseBlue = [59, 130, 246] // Original blue color
        const darkestBlue = [15, 70, 150] // Darkest blue for highest POI
        
        const r = Math.floor(baseBlue[0] + (darkestBlue[0] - baseBlue[0]) * intensity)
        const g = Math.floor(baseBlue[1] + (darkestBlue[1] - baseBlue[1]) * intensity)
        const b = Math.floor(baseBlue[2] + (darkestBlue[2] - baseBlue[2]) * intensity)
        
        const provinceColor = `rgb(${r}, ${g}, ${b})`
        const provinceFillOpacity = 0.5 + (intensity * 0.4) // More opacity for higher POI
        
        // Status indicator color
        const statusColors = {
          green: '#10B981',
          yellow: '#F59E0B', 
          red: '#EF4444'
        }

        // Create province area with POI density color
        const provinceArea = L.circle([province.coordinates[0], province.coordinates[1]], {
          radius: 70000 + (province.poiDensity * 1000), // Size based on POI density
          fillColor: provinceColor,
          color: '#1E40AF', // Darker border
          weight: 2,
          opacity: 0.9,
          fillOpacity: provinceFillOpacity
        })

        // Create status indicator marker
        const provinceMarker = L.circleMarker([province.coordinates[0], province.coordinates[1]], {
          radius: 12,
          fillColor: statusColors[province.realizationStatus],
          color: 'white',
          weight: 4,
          opacity: 1,
          fillOpacity: 1
        })

        // Tooltip content
        const tooltipContent = `
          <div class="font-semibold">${province.name}</div>
          <div class="text-sm text-gray-600 mt-1">
            <div>Realization: ${province.realizationValue}%</div>
            <div>Status: <span class="font-medium" style="color: ${statusColors[province.realizationStatus]}">${province.realizationStatus.toUpperCase()}</span></div>
            <div>POI Density: ${province.poiDensity}</div>
            <div>Target: Rp ${province.targetProfit.toLocaleString('id-ID')}</div>
          </div>
        `

        // Add interactions
        provinceMarker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -10],
          className: 'province-tooltip'
        })

        provinceArea.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -10],
          className: 'province-tooltip'
        })

        // Click handlers
        const handleClick = () => {
          onProvinceSelect(province.id)
        }

        provinceMarker.on('click', handleClick)
        provinceArea.on('click', handleClick)

        // Add to map
        provinceArea.addTo(map)
        provinceMarker.addTo(map)
      })

      // Custom CSS for tooltips
      const style = document.createElement('style')
      style.textContent = `
        .province-tooltip {
          background: white;
          border: none;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 8px 12px;
        }
        .province-tooltip .leaflet-tooltip-content {
          margin: 0;
        }
      `
      document.head.appendChild(style)
    }

    initMap()

    // Cleanup
    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [])

  return (
    <div className="h-full w-full">
      {/* Clean Map Container - No Overlays */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}