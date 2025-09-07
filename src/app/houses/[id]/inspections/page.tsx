'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from "@/lib/supabase/client"
import { getCurrentUser } from '@/lib/auth'
import type { House, Inspection } from '@/types/database'
import { InspectionCard } from '@/components/inspections/InspectionCard'
import { toast } from 'sonner'

export default function HouseInspectionsPage() {
  const params = useParams()
  const router = useRouter()
  const [house, setHouse] = useState<House | null>(null)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth/signin')
          return
        }

        const supabase = createClient()
        
        // Load house details
        const { data: houseData, error: houseError } = await supabase
          .from('houses')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single()

        if (houseError) {
          console.error('Error loading house:', houseError)
          toast.error('House not found')
          router.push('/dashboard')
          return
        }

        setHouse(houseData)
        await loadInspections(user.id)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Error loading inspections')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadData()
    }
  }, [params.id, router])

  const loadInspections = async (userId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('house_id', params.id)
      .eq('user_id', userId)
      .order('inspection_date', { ascending: false })

    if (error) {
      console.error('Error loading inspections:', error)
      toast.error('Error loading inspections')
    } else {
      setInspections(data || [])
    }
  }

  const handleInspectionDeleted = async () => {
    const user = await getCurrentUser()
    if (user) {
      await loadInspections(user.id)
    }
  }

  const handleInspectionEdit = (inspection: Inspection) => {
    // For now, just navigate to the inspection detail page
    router.push(`/houses/${params.id}/inspections/${inspection.id}`)
  }

  const filteredInspections = inspections.filter(inspection =>
    inspection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inspection.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!house) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">House Not Found</h1>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <Link href="/dashboard" className="hover:text-foreground">
                  Dashboard
                </Link>
                <span>/</span>
                <Link href={`/houses/${house.id}`} className="hover:text-foreground">
                  {house.name}
                </Link>
                <span>/</span>
                <span>Inspections</span>
              </nav>
              <h1 className="text-3xl font-bold text-foreground">Inspections</h1>
              <p className="text-muted-foreground">
                Manage all inspections for {house.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                {inspections.length} Inspections
              </Badge>
              <Link href={`/houses/${params.id}/inspections/new`}>
                <Button>New Inspection</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Search */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search inspections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Inspections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inspections.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inspections.filter(inspection => {
                    const inspectionDate = new Date(inspection.inspection_date)
                    const now = new Date()
                    return inspectionDate.getMonth() === now.getMonth() &&
                           inspectionDate.getFullYear() === now.getFullYear()
                  }).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Latest Inspection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {inspections.length > 0 
                    ? formatDate(inspections[0].inspection_date)
                    : 'None'
                  }
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Property
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">{house.name}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Inspections Grid */}
        {filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-primary/20 rounded"></div>
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No inspections found' : 'No inspections yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? `No inspections match "${searchTerm}". Try a different search term.`
                  : 'Start by creating your first inspection for this property.'
                }
              </p>
              {!searchTerm && (
                <Link href={`/houses/${params.id}/inspections/new`}>
                  <Button>Create First Inspection</Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInspections.map((inspection) => (
              <InspectionCard
                key={inspection.id}
                inspection={inspection}
                onEdit={handleInspectionEdit}
                onDelete={async (inspectionId) => {
                  // Delete the inspection via Supabase
                  const supabase = createClient()
                  const { error } = await supabase
                    .from("inspections")
                    .delete()
                    .eq("id", inspectionId)
                  
                  if (error) throw error
                  
                  // Refresh the list
                  await handleInspectionDeleted()
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}