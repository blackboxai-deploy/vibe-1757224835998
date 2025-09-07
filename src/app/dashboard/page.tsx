"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/layout/Navbar"
import { HouseCard } from "@/components/houses/HouseCard"
import { HouseForm } from "@/components/houses/HouseForm"
import { PageSpinner } from "@/components/ui/loading-spinner"
import { createClient } from "@/lib/supabase/client"
import { getCurrentUser } from "@/lib/auth"
import { House, NewHouse, UpdateHouse } from "@/types/database"
import { toast } from "sonner"

type HouseWithCount = House & { inspection_count?: number }

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [houses, setHouses] = useState<HouseWithCount[]>([])
  const [filteredHouses, setFilteredHouses] = useState<HouseWithCount[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showHouseForm, setShowHouseForm] = useState(false)
  const [editingHouse, setEditingHouse] = useState<House | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/auth/signin")
          return
        }
        setUser(currentUser)
        await fetchHouses(currentUser.id)
      } catch (error) {
        console.error("Error checking user:", error)
        router.push("/auth/signin")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredHouses(houses)
    } else {
      const filtered = houses.filter(house =>
        house.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (house.address && house.address.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredHouses(filtered)
    }
  }, [houses, searchQuery])

  const fetchHouses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("houses")
        .select(`
          *,
          inspections(count)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Transform the data to include inspection count
      const housesWithCounts = data.map(house => ({
        ...house,
        inspection_count: house.inspections[0]?.count || 0
      }))

      setHouses(housesWithCounts)
    } catch (error) {
      console.error("Error fetching houses:", error)
      toast.error("Failed to load houses")
    }
  }

  const handleCreateHouse = async (data: NewHouse) => {
    if (!user) return

    const { data: newHouse, error } = await supabase
      .from("houses")
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    setHouses(prev => [{ ...newHouse, inspection_count: 0 }, ...prev])
  }

  const handleUpdateHouse = async (data: UpdateHouse) => {
    if (!editingHouse) return

    const { data: updatedHouse, error } = await supabase
      .from("houses")
      .update(data)
      .eq("id", editingHouse.id)
      .select()
      .single()

    if (error) throw error

    setHouses(prev => 
      prev.map(house => 
        house.id === editingHouse.id 
          ? { ...updatedHouse, inspection_count: house.inspection_count }
          : house
      )
    )
  }

  const handleDeleteHouse = async (houseId: string) => {
    const { error } = await supabase
      .from("houses")
      .delete()
      .eq("id", houseId)

    if (error) throw error

    setHouses(prev => prev.filter(house => house.id !== houseId))
  }

  const handleEditHouse = (house: House) => {
    setEditingHouse(house)
    setFormMode("edit")
    setShowHouseForm(true)
  }

  const handleAddHouse = () => {
    setEditingHouse(null)
    setFormMode("create")
    setShowHouseForm(true)
  }

  const handleCloseForm = () => {
    setShowHouseForm(false)
    setEditingHouse(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <PageSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your houses and inspection records
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Houses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{houses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {houses.reduce((sum, house) => sum + (house.inspection_count || 0), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {houses.filter(house => {
                  const created = new Date(house.created_at)
                  const now = new Date()
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">New houses</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search houses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleAddHouse}>
            Add New House
          </Button>
        </div>

        {/* Houses Grid */}
        {filteredHouses.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {searchQuery ? "No houses match your search." : "No houses yet."}
            </div>
            {!searchQuery && (
              <Button onClick={handleAddHouse}>
                Add Your First House
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => (
              <HouseCard
                key={house.id}
                house={house}
                onEdit={handleEditHouse}
                onDelete={handleDeleteHouse}
              />
            ))}
          </div>
        )}
      </main>

        {/* House Form Modal */}
      <HouseForm
        open={showHouseForm}
        onClose={handleCloseForm}
        onSubmit={async (data: NewHouse | UpdateHouse) => {
          if (formMode === "create") {
            await handleCreateHouse(data as NewHouse)
          } else {
            await handleUpdateHouse(data as UpdateHouse)
          }
        }}
        house={editingHouse}
        mode={formMode}
      />
    </div>
  )
}