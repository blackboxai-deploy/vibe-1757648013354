'use client'

import { useEffect, useRef, useState } from 'react'
import { ConfigurationData, FilterState } from '@/types/dashboard'

interface BranchRadiusViewProps {
  branchId: string
  provinceId: string
  configData: ConfigurationData
  filterState: FilterState
}

export function BranchRadiusView({ 
  branchId, 
  provinceId, 
  configData, 
  filterState 
}: BranchRadiusViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)

  // Mock branch data
  const branchData = {
    id: branchId,
    name: 'KC Jakarta Pusat',
    coordinates: [-6.2088, 106.8456] as [number, number],
    radiusKm: 10,
    potentialScore: 87
  }

  // Mock hexagon grid data for potential scoring
  const mockHexagonGrid = [
    { id: 'hex1', coordinates: [-6.2000, 106.8400] as [number, number], potentialScore: 85, type: 'high-traffic' },
    { id: 'hex2', coordinates: [-6.2100, 106.8500] as [number, number], potentialScore: 92, type: 'high-traffic' },
    { id: 'hex3', coordinates: [-6.2200, 106.8600] as [number, number], potentialScore: 45, type: 'underserved' },
    { id: 'hex4', coordinates: [-6.2300, 106.8300] as [number, number], potentialScore: 78, type: 'competitive' },
    { id: 'hex5', coordinates: [-6.1900, 106.8700] as [number, number], potentialScore: 25, type: 'low-potential' }
  ]

  // Mock customer data
  const mockCustomers = [
    { id: 'cust1', type: 'wondr-user', coordinates: [-6.2050, 106.8450] as [number, number], potentialValue: 8500 },
    { id: 'cust2', type: 'non-wondr-user', coordinates: [-6.2150, 106.8550] as [number, number], potentialValue: 12000 },
    { id: 'cust3', type: 'sales-lead', coordinates: [-6.2250, 106.8350] as [number, number], potentialValue: 15000 },
    { id: 'cust4', type: 'wondr-user', coordinates: [-6.1950, 106.8650] as [number, number], potentialValue: 6500 }
  ]

  // Mock sales network connections
  const mockSalesConnections = [
    { fromKC: branchId, toCustomer: 'cust1', strength: 85 },
    { fromKC: branchId, toCustomer: 'cust3', strength: 72 },
    { fromKC: branchId, toCustomer: 'cust4', strength: 91 }
  ]

  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default

      const map = L.map(mapRef.current!, {
        center: branchData.coordinates,
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      setMapInstance(map)

      // Add 10km radius circle
      L.circle(branchData.coordinates, {
        radius: branchData.radiusKm * 1000,
        fillColor: '#3B82F6',
        color: '#3B82F6',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.1
      }).addTo(map)

      // Add KC branch marker
      const kcMarker = L.circleMarker(branchData.coordinates, {
        radius: 15,
        fillColor: '#1F2937',
        color: 'white',
        weight: 3,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map)

      kcMarker.bindTooltip(`
        <div class="font-semibold">${branchData.name}</div>
        <div class="text-sm text-gray-600 mt-1">
          <div>Branch ID: ${branchData.id}</div>
          <div>Potential Score: ${branchData.potentialScore}</div>
          <div>Coverage: ${branchData.radiusKm}km radius</div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -20]
      })

      // Add hexagon grid markers
      mockHexagonGrid.forEach((hex) => {
        const hexColors = {
          'high-traffic': '#10B981',
          'underserved': '#F59E0B',
          'competitive': '#EF4444',
          'low-potential': '#6B7280'
        }

        const hexMarker = L.circleMarker(hex.coordinates, {
          radius: 12,
          fillColor: hexColors[hex.type as keyof typeof hexColors],
          color: 'white',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        })

        hexMarker.bindTooltip(`
          <div class="font-semibold">Zone ${hex.id}</div>
          <div class="text-sm text-gray-600 mt-1">
            <div>Type: ${hex.type.replace('-', ' ')}</div>
            <div>Potential Score: ${hex.potentialScore}</div>
          </div>
        `)

        hexMarker.addTo(map)
      })

      // Add customer markers
      mockCustomers.forEach((customer) => {
        const customerColors = {
          'wondr-user': '#3B82F6',
          'non-wondr-user': '#6B7280',
          'sales-lead': '#F59E0B'
        }

        const customerMarker = L.circleMarker(customer.coordinates, {
          radius: 6,
          fillColor: customerColors[customer.type as keyof typeof customerColors],
          color: 'white',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        })

        customerMarker.bindTooltip(`
          <div class="font-semibold">${customer.type.replace('-', ' ').toUpperCase()}</div>
          <div class="text-sm text-gray-600 mt-1">
            <div>ID: ${customer.id}</div>
            <div>Potential Value: Rp ${customer.potentialValue.toLocaleString()}</div>
          </div>
        `)

        customerMarker.addTo(map)
      })

      // Add sales network connections (spider web)
      mockSalesConnections.forEach((connection) => {
        const customer = mockCustomers.find(c => c.id === connection.toCustomer)
        if (customer) {
          const connectionLine = L.polyline([
            branchData.coordinates,
            customer.coordinates
          ], {
            color: '#8B5CF6',
            weight: 2,
            opacity: 0.6,
            dashArray: '5, 10'
          })

          connectionLine.bindTooltip(`
            <div class="font-semibold">Sales Connection</div>
            <div class="text-sm text-gray-600 mt-1">
              <div>To: ${connection.toCustomer}</div>
              <div>Strength: ${connection.strength}%</div>
            </div>
          `)

          connectionLine.addTo(map)
        }
      })
    }

    initMap()

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