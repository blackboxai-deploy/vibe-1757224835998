'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { createClient } from "@/lib/supabase/client"
import { getCurrentUser } from '@/lib/auth'
import type { House, Inspection } from '@/types/database'

import { toast } from 'sonner'

export default function InspectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [house, setHouse] = useState<House | null>(null)
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth/signin')
          return
        }

        const supabase = createClient()
        
        // Load house
        const { data: houseData, error: houseError } = await supabase
          .from('houses')
          .select('*')
          .eq('id', params.id as string)
          .eq('user_id', user.id)
          .single()

        if (houseError) {
          console.error('Error loading house:', houseError)
          toast.error('House not found')
          router.push('/dashboard')
          return
        }

        // Load inspection
        const { data: inspectionData, error: inspectionError } = await supabase
          .from('inspections')
          .select('*')
          .eq('id', params.inspectionId as string)
          .eq('house_id', params.id as string)
          .eq('user_id', user.id)
          .single()

        if (inspectionError) {
          console.error('Error loading inspection:', inspectionError)
          toast.error('Inspection not found')
          router.push(`/houses/${params.id}/inspections`)
          return
        }

        setHouse(houseData)
        setInspection(inspectionData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Error loading inspection details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id && params.inspectionId) {
      loadData()
    }
  }, [params.id, params.inspectionId, router])



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!house || !inspection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Inspection Not Found</h1>
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
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <Link href={`/houses/${house.id}`} className="hover:text-foreground">
              {house.name}
            </Link>
            <span>/</span>
            <Link href={`/houses/${house.id}/inspections`} className="hover:text-foreground">
              Inspections
            </Link>
            <span>/</span>
            <span>Details</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">{inspection.title}</h1>
              <p className="text-muted-foreground">
                {formatDate(inspection.inspection_date)} at {formatTime(inspection.inspection_date)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{house.name}</Badge>
              <Button onClick={() => setShowEditDialog(true)}>
                Edit Inspection
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Inspection Details */}
            <Card>
              <CardHeader>
                <CardTitle>Inspection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Property</h3>
                  <p className="font-medium">{house.name}</p>
                  {house.address && (
                    <p className="text-sm text-muted-foreground">{house.address}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Inspection Title</h3>
                  <p className="font-medium">{inspection.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Date & Time</h3>
                  <p>{formatDate(inspection.inspection_date)} at {formatTime(inspection.inspection_date)}</p>
                </div>
                {inspection.notes && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Notes & Observations</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{inspection.notes}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Created</h3>
                    <p className="text-sm">{formatDate(inspection.created_at)}</p>
                  </div>
                  {inspection.updated_at && inspection.updated_at !== inspection.created_at && (
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-1">Last Updated</h3>
                      <p className="text-sm">{formatDate(inspection.updated_at)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Photos Section */}
            <Card>
              <CardHeader>
                <CardTitle>Inspection Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>Photo gallery will be available once connected to Supabase</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => setShowEditDialog(true)}
                >
                  Edit Inspection
                </Button>
                <Link href={`/houses/${house.id}/inspections/new`} className="block">
                  <Button variant="outline" className="w-full">
                    New Inspection
                  </Button>
                </Link>
                <Link href={`/houses/${house.id}/inspections`} className="block">
                  <Button variant="ghost" className="w-full">
                    All Inspections
                  </Button>
                </Link>
                <Link href={`/houses/${house.id}`} className="block">
                  <Button variant="ghost" className="w-full">
                    House Details
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Report Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Report Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Inspection Type</span>
                    <Badge variant="outline">{inspection.title}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Property</span>
                    <span className="text-sm font-medium">{house.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Has Notes</span>
                    <Badge variant={inspection.notes ? "default" : "secondary"}>
                      {inspection.notes ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

       {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <div className="p-4 text-center">
            <p>Edit form will be available once all components are properly integrated</p>
            <Button 
              onClick={() => setShowEditDialog(false)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}