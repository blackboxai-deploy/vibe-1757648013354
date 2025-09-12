'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FilterState, ConfigurationData } from '@/types/dashboard'
import { getSectorById, CUSTOMER_SEGMENTS } from '@/lib/sector-data'

interface FilterPanelProps {
  filterState: FilterState
  onFilterChange: (newFilters: FilterState) => void
  configData: ConfigurationData | null
}

export function FilterPanel({ filterState, onFilterChange, configData }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleAgeRangeChange = (values: number[]) => {
    onFilterChange({
      ...filterState,
      ageRange: [values[0], values[1]]
    })
  }

  const handleIncomeRangeChange = (values: number[]) => {
    onFilterChange({
      ...filterState,
      incomeRange: [values[0], values[1]]
    })
  }

  const handleBusinessSectorToggle = (sectorId: string) => {
    const newSectors = filterState.businessSectors.includes(sectorId)
      ? filterState.businessSectors.filter(id => id !== sectorId)
      : [...filterState.businessSectors, sectorId]
    
    onFilterChange({
      ...filterState,
      businessSectors: newSectors
    })
  }

  const handleCustomerTypeToggle = (customerType: string) => {
    const newTypes = filterState.customerTypes.includes(customerType)
      ? filterState.customerTypes.filter(type => type !== customerType)
      : [...filterState.customerTypes, customerType]
    
    onFilterChange({
      ...filterState,
      customerTypes: newTypes
    })
  }

  const handleUserTypeToggle = (userType: 'wondr' | 'nonWondr' | 'sales') => {
    const updates: Partial<FilterState> = {}
    
    if (userType === 'wondr') {
      updates.showWondrUsers = !filterState.showWondrUsers
    } else if (userType === 'nonWondr') {
      updates.showNonWondrUsers = !filterState.showNonWondrUsers
    } else if (userType === 'sales') {
      updates.showSalesLeads = !filterState.showSalesLeads
    }

    onFilterChange({
      ...filterState,
      ...updates
    })
  }

  const clearAllFilters = () => {
    onFilterChange({
      ageRange: [18, 65],
      incomeRange: [3000000, 50000000],
      businessSectors: [],
      customerTypes: [],
      showWondrUsers: true,
      showNonWondrUsers: true,
      showSalesLeads: true
    })
  }

  const formatCurrency = (value: number) => {
    return `Rp ${(value / 1000000).toFixed(1)}M`
  }

  if (!configData) return null

   // Calculate statistics for the current configuration
  const totalProvinces = 34
  const greenProvinces = 18
  const yellowProvinces = 11
  const redProvinces = 5
  const avgRealization = 72

  return (
    <div className="h-full overflow-y-auto bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Analytics & Filters</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>
      </div>

      {/* National Statistics Section */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">National Overview</h3>
          
          {/* Target Profit */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Target Profit:</span>
            <span className="font-semibold text-blue-600">
              Rp {configData?.targetProfit.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Average Realization */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Avg Realization:</span>
            <Badge variant={avgRealization >= 80 ? 'default' : avgRealization >= 60 ? 'secondary' : 'destructive'}>
              {avgRealization}%
            </Badge>
          </div>

          {/* Province Performance Chart */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">Province Performance</div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span>On Target ({greenProvinces})</span>
                </div>
                <span className="font-medium">{Math.round((greenProvinces / totalProvinces) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full" 
                  style={{ width: `${(greenProvinces / totalProvinces) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-yellow-500"></div>
                  <span>Warning ({yellowProvinces})</span>
                </div>
                <span className="font-medium">{Math.round((yellowProvinces / totalProvinces) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-yellow-500 h-1.5 rounded-full" 
                  style={{ width: `${(yellowProvinces / totalProvinces) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span>Below Target ({redProvinces})</span>
                </div>
                <span className="font-medium">{Math.round((redProvinces / totalProvinces) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-red-500 h-1.5 rounded-full" 
                  style={{ width: `${(redProvinces / totalProvinces) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Legend Section */}
      <div className="px-6 py-4 border-b bg-blue-50">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Map Legend</h3>
          
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Province Colors (POI Density)</div>
            <div className="text-xs text-gray-600 mb-1">Darker blue = Higher POI concentration</div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-3 rounded" style={{backgroundColor: 'rgb(179, 205, 246)'}}></div>
              <div className="w-4 h-3 rounded" style={{backgroundColor: 'rgb(99, 155, 246)'}}></div>
              <div className="w-4 h-3 rounded" style={{backgroundColor: 'rgb(59, 130, 246)'}}></div>
              <div className="w-4 h-3 rounded" style={{backgroundColor: 'rgb(29, 100, 196)'}}></div>
            </div>
            <div className="text-xs text-gray-500">Light Blue → Dark Blue (Low → High POI)</div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Province Status</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
                <span>On Target (≥80% realization)</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-yellow-500 border border-white"></div>
                <span>Warning (60-79% realization)</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
                <span>Below Target (&lt;60% realization)</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-700">Hexagon Zones (Province View)</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-2 bg-green-500"></div>
                <span>High Potential (80-100)</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-2 bg-orange-500"></div>
                <span>Moderate Potential (50-79)</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-2 bg-red-500"></div>
                <span>Low Potential (0-49)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-4 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>

          {/* Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Demographics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Age Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Age Range: {filterState.ageRange[0]} - {filterState.ageRange[1]} years
                </Label>
                <Slider
                  value={filterState.ageRange}
                  onValueChange={handleAgeRangeChange}
                  max={70}
                  min={18}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Income Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Income: {formatCurrency(filterState.incomeRange[0])} - {formatCurrency(filterState.incomeRange[1])}
                </Label>
                <Slider
                  value={filterState.incomeRange}
                  onValueChange={handleIncomeRangeChange}
                  max={100000000}
                  min={2000000}
                  step={1000000}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* User Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-wondr-users"
                  checked={filterState.showWondrUsers}
                  onCheckedChange={() => handleUserTypeToggle('wondr')}
                />
                <Label htmlFor="show-wondr-users" className="text-sm cursor-pointer">
                  Show Wondr Users
                </Label>
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-non-wondr-users"
                  checked={filterState.showNonWondrUsers}
                  onCheckedChange={() => handleUserTypeToggle('nonWondr')}
                />
                <Label htmlFor="show-non-wondr-users" className="text-sm cursor-pointer">
                  Show Non-Wondr Users
                </Label>
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-sales-leads"
                  checked={filterState.showSalesLeads}
                  onCheckedChange={() => handleUserTypeToggle('sales')}
                />
                <Label htmlFor="show-sales-leads" className="text-sm cursor-pointer">
                  Show Sales Leads
                </Label>
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              </div>
            </CardContent>
          </Card>

          {/* Business Sectors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Business Sectors
                <Badge variant="outline" className="ml-2">
                  {filterState.businessSectors.length} selected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {configData.selectedSectors.map((sectorId) => {
                  const sector = getSectorById(sectorId)
                  if (!sector) return null

                  return (
                    <div 
                      key={sectorId}
                      className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                      onClick={() => handleBusinessSectorToggle(sectorId)}
                    >
                         <Checkbox
                        checked={filterState.businessSectors.includes(sectorId)}
                        onCheckedChange={() => handleBusinessSectorToggle(sectorId)}
                      />
                      <span className="text-sm flex-1">{sector.name}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Customer Segments
                <Badge variant="outline" className="ml-2">
                  {filterState.customerTypes.length} selected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {CUSTOMER_SEGMENTS.map((segment) => {
                  // Only show segments that are in the configuration
                  if (!configData.selectedCustomerSegments.includes(segment.id)) {
                    return null
                  }

                  return (
                    <div 
                      key={segment.id}
                      className="flex items-start space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                      onClick={() => handleCustomerTypeToggle(segment.id)}
                    >
                         <Checkbox
                        checked={filterState.customerTypes.includes(segment.id)}
                        onCheckedChange={() => handleCustomerTypeToggle(segment.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{segment.name}</div>
                        <div className="text-xs text-gray-600">{segment.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Active Filters Summary */}
          {(filterState.businessSectors.length > 0 || filterState.customerTypes.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {filterState.businessSectors.map((sectorId) => {
                      const sector = getSectorById(sectorId)
                      return (
                        <Badge 
                          key={sectorId} 
                          variant="secondary" 
                          className="text-xs cursor-pointer hover:bg-red-100"
                          onClick={() => handleBusinessSectorToggle(sectorId)}
                        >
                          {sector?.name} ×
                        </Badge>
                      )
                    })}
                    {filterState.customerTypes.map((typeId) => {
                      const segment = CUSTOMER_SEGMENTS.find(s => s.id === typeId)
                      return (
                        <Badge 
                          key={typeId} 
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-red-100"
                          onClick={() => handleCustomerTypeToggle(typeId)}
                        >
                          {segment?.name} ×
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}