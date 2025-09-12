'use client'

import { useEffect, useRef, useState } from 'react'
import { ConfigurationData, FilterState } from '@/types/dashboard'
import { getProvinceById } from '@/lib/indonesia-geodata'

interface ProvinceDetailViewProps {
  provinceId: string
  configData: ConfigurationData
  filterState: FilterState
  onBranchSelect: (branchId: string) => void
}

export function ProvinceDetailView({ 
  provinceId, 
  configData, 
  filterState, 
  onBranchSelect 
}: ProvinceDetailViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)

  const province = getProvinceById(provinceId)

  // Mock infrastructure data for the province
  const mockInfrastructure = [
    { id: 'KC001', name: 'KC Jakarta Pusat', type: 'KC', coordinates: [-6.2088, 106.8456], customers: 1250 },
    { id: 'KC002', name: 'KC Jakarta Utara', type: 'KC', coordinates: [-6.1344, 106.8640], customers: 980 },
    { id: 'ATM001', name: 'ATM Mall Central Park', type: 'ATM', coordinates: [-6.1768, 106.7800], customers: 0 },
    { id: 'AGENT001', name: 'Agent46 Kelapa Gading', type: 'Agent46', coordinates: [-6.1588, 106.9000], customers: 340 }
  ]

  // Mock value chain data
  const mockValueChain = [
    { id: 'PROD001', type: 'producer', coordinates: [-6.2500, 106.8000], isWondrUser: true, businessType: 'Manufacturing' },
    { id: 'DIST001', type: 'distributor', coordinates: [-6.1800, 106.8200], isWondrUser: false, businessType: 'Wholesale' },
    { id: 'CONS001', type: 'consumer', coordinates: [-6.2200, 106.8600], isWondrUser: true, businessType: 'Retail' }
  ]

  useEffect(() => {
    if (!mapRef.current || !province) return

    const initMap = async () => {
      const L = (await import('leaflet')).default

      const map = L.map(mapRef.current!, {
        center: [province.coordinates[0], province.coordinates[1]],
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      setMapInstance(map)

      // Add hexagon grid for potential zones
      const hexagonGrid = [
        { coords: [province.coordinates[0] + 0.2, province.coordinates[1] + 0.1], potential: 92, type: 'high-potential' },
        { coords: [province.coordinates[0] - 0.1, province.coordinates[1] + 0.2], potential: 78, type: 'moderate-potential' },
        { coords: [province.coordinates[0] + 0.1, province.coordinates[1] - 0.2], potential: 45, type: 'low-potential' },
        { coords: [province.coordinates[0] - 0.2, province.coordinates[1] - 0.1], potential: 65, type: 'moderate-potential' },
        { coords: [province.coordinates[0] + 0.3, province.coordinates[1]], potential: 88, type: 'high-potential' },
        { coords: [province.coordinates[0] - 0.3, province.coordinates[1]], potential: 35, type: 'low-potential' },
        { coords: [province.coordinates[0], province.coordinates[1] + 0.3], potential: 72, type: 'moderate-potential' },
        { coords: [province.coordinates[0], province.coordinates[1] - 0.3], potential: 58, type: 'moderate-potential' }
      ]

      // Add hexagon markers with color-coded potential
      hexagonGrid.forEach((hex, index) => {
        const hexColors = {
          'high-potential': '#10B981',    // Green
          'moderate-potential': '#F59E0B', // Orange  
          'low-potential': '#EF4444'      // Red
        }

        // Create hexagon-like polygon
        const hexSize = 0.08
        const hexagonPoints: [number, number][] = []
        for (let i = 0; i < 6; i++) {
          const angle = (i * 60) * (Math.PI / 180)
          const lat = hex.coords[0] + hexSize * Math.cos(angle)
          const lng = hex.coords[1] + hexSize * Math.sin(angle)
          hexagonPoints.push([lat, lng])
        }

        const hexagon = L.polygon(hexagonPoints, {
          fillColor: hexColors[hex.type as keyof typeof hexColors],
          color: 'white',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.6
        })

        const tooltipContent = `
          <div class="font-semibold">Potential Zone ${index + 1}</div>
          <div class="text-sm text-gray-600 mt-1">
            <div>Potential Score: ${hex.potential}</div>
            <div>Classification: ${hex.type.replace('-', ' ')}</div>
          </div>
        `

        hexagon.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -10]
        })

        hexagon.addTo(map)
      })

      // Add infrastructure points
      mockInfrastructure.forEach((point) => {
        const markerColors = {
          KC: '#3B82F6', // Blue
          ATM: '#10B981', // Green
          Agent46: '#F59E0B' // Orange
        }

        const marker = L.circleMarker([point.coordinates[0], point.coordinates[1]], {
          radius: point.type === 'KC' ? 12 : 8,
          fillColor: markerColors[point.type as keyof typeof markerColors],
          color: 'white',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        })

        const tooltipContent = `
          <div class="font-semibold">${point.name}</div>
          <div class="text-sm text-gray-600 mt-1">
            <div>Type: ${point.type}</div>
            ${point.customers > 0 ? `<div>Customers: ${point.customers.toLocaleString()}</div>` : ''}
          </div>
        `

        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -10]
        })

        if (point.type === 'KC') {
          marker.on('click', () => {
            onBranchSelect(point.id)
          })
        }

        marker.addTo(map)
      })

      // Add value chain points
      mockValueChain.forEach((point) => {
        const typeColors = {
          producer: '#8B5CF6', // Purple
          distributor: '#F59E0B', // Orange
          consumer: '#10B981' // Green
        }

        const marker = L.circleMarker([point.coordinates[0], point.coordinates[1]], {
          radius: 6,
          fillColor: typeColors[point.type as keyof typeof typeColors],
          color: point.isWondrUser ? 'white' : '#666',
          weight: point.isWondrUser ? 3 : 1,
          opacity: 1,
          fillOpacity: 0.8
        })

        const tooltipContent = `
          <div class="font-semibold">${point.type.charAt(0).toUpperCase() + point.type.slice(1)}</div>
          <div class="text-sm text-gray-600 mt-1">
            <div>Business: ${point.businessType}</div>
            <div>Wondr User: ${point.isWondrUser ? 'Yes' : 'No'}</div>
          </div>
        `

        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -10]
        })

        marker.addTo(map)
      })
    }

    initMap()

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [province])

  if (!province) return <div>Province not found</div>

  return (
    <div className="h-full w-full">
      {/* Clean Map Container - No Overlays */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}