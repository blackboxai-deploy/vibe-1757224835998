'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import { createClient } from "@/lib/supabase/client"
import { getCurrentUser } from '@/lib/auth'
import type { House } from '@/types/database'
import { toast } from 'sonner'

export default function NewInspectionPage() {
  const params = useParams()
  const router = useRouter()
  const [house, setHouse] = useState<House | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHouse = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth/signin')
          return
        }

        const supabase = createClient()
        const { data, error } = await supabase
          .from('houses')
          .select('*')
          .eq('id', params.id as string)
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error loading house:', error)
          toast.error('House not found')
          router.push('/dashboard')
          return
        }

        setHouse(data)
      } catch (error) {
        console.error('Error loading house:', error)
        toast.error('Error loading house details')
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadHouse()
    }
  }, [params.id, router])



  const handleCancel = () => {
    router.push(`/houses/${params.id}/inspections`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
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
            <span>New</span>
          </nav>
          <h1 className="text-3xl font-bold text-foreground">Create New Inspection</h1>
          <p className="text-muted-foreground">
            Create a detailed inspection record for {house.name}
          </p>
        </div>
      </div>

       {/* Form */}
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
            <p className="mb-4">Inspection form will be available once Supabase is configured</p>
            <div className="space-x-4">
              <Button onClick={handleCancel}>
                Back to Inspections
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}