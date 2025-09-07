"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/Navbar"
import { PageSpinner } from "@/components/ui/loading-spinner"
import { InspectionCard } from "@/components/inspections/InspectionCard"
import { InspectionForm } from "@/components/inspections/InspectionForm"
import { createClient } from "@/lib/supabase/client"
import { getCurrentUser } from "@/lib/auth"
import { House, Inspection, NewInspection, UpdateInspection } from "@/types/database"
import { toast } from "sonner"

export default function HousePage() {
  const params = useParams()
  const router = useRouter()
  const houseId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [house, setHouse] = useState<House | null>(null)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [showInspectionForm, setShowInspectionForm] = useState(false)
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push("/auth/signin")
          return
        }

        // Fetch house details
        const { data: houseData, error: houseError } = await supabase
          .from("houses")
          .select("*")
          .eq("id", houseId)
          .eq("user_id", user.id)
          .single()

        if (houseError) throw houseError
        setHouse(houseData)

        // Fetch inspections
        const { data: inspectionData, error: inspectionError } = await supabase
          .from("inspections")
          .select("*")
          .eq("house_id", houseId)
          .eq("user_id", user.id)
          .order("inspection_date", { ascending: false })

        if (inspectionError) throw inspectionError
        setInspections(inspectionData || [])

      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load house data")
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    if (houseId) {
      fetchData()
    }
  }, [houseId, router, supabase])

  const handleCreateInspection = async (data: NewInspection) => {
    const user = await getCurrentUser()
    if (!user) return

    const { data: newInspection, error } = await supabase
      .from("inspections")
      .insert({
        ...data,
        user_id: user.id,
        house_id: houseId
      })
      .select()
      .single()

    if (error) throw error

    setInspections(prev => [newInspection, ...prev])
  }

  const handleUpdateInspection = async (data: UpdateInspection) => {
    if (!editingInspection) return

    const { data: updatedInspection, error } = await supabase
      .from("inspections")
      .update(data)
      .eq("id", editingInspection.id)
      .select()
      .single()

    if (error) throw error

    setInspections(prev =>
      prev.map(inspection =>
        inspection.id === editingInspection.id ? updatedInspection : inspection
      )
    )
  }

  const handleDeleteInspection = async (inspectionId: string) => {
    const { error } = await supabase
      .from("inspections")
      .delete()
      .eq("id", inspectionId)

    if (error) throw error

    setInspections(prev => prev.filter(inspection => inspection.id !== inspectionId))
  }

  const handleEditInspection = (inspection: Inspection) => {
    setEditingInspection(inspection)
    setFormMode("edit")
    setShowInspectionForm(true)
  }

  const handleAddInspection = () => {
    setEditingInspection(null)
    setFormMode("create")
    setShowInspectionForm(true)
  }

  const handleCloseForm = () => {
    setShowInspectionForm(false)
    setEditingInspection(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <PageSpinner />
      </div>
    )
  }

  if (!house) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">House not found</h1>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
                <span>→</span>
                <span className="text-gray-900 font-medium">{house.name}</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">{house.name}</h1>
              {house.address && (
                <p className="text-gray-600 mt-2">{house.address}</p>
              )}
            </div>
            <Button onClick={handleAddInspection}>
              Add Inspection
            </Button>
          </div>
        </div>

        {/* House Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">House Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Inspections</span>
                <Badge variant="secondary">{inspections.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Created</span>
                <span>{new Date(house.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Updated</span>
                <span>{new Date(house.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {inspections.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Latest inspection: {new Date(inspections[0].inspection_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium">{inspections[0].title}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No inspections yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/houses/${house.id}/inspections`}>
                  View All Inspections
                </Link>
              </Button>
              <Button onClick={handleAddInspection} className="w-full">
                New Inspection
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Inspections */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Inspections</h2>
            <Button asChild variant="outline">
              <Link href={`/houses/${house.id}/inspections`}>
                View All
              </Link>
            </Button>
          </div>

          {inspections.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="text-gray-500 mb-4">No inspections yet</div>
              <Button onClick={handleAddInspection}>
                Create First Inspection
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inspections.slice(0, 6).map((inspection) => (
                <InspectionCard
                  key={inspection.id}
                  inspection={inspection}
                  onEdit={handleEditInspection}
                  onDelete={handleDeleteInspection}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Inspection Form Modal */}
      <InspectionForm
        open={showInspectionForm}
        onClose={handleCloseForm}
        onSubmit={formMode === "create" ? handleCreateInspection : handleUpdateInspection}
        inspection={editingInspection}
        mode={formMode}
        houseId={houseId}
      />
    </div>
  )
}