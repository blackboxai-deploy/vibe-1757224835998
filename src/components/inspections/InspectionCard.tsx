"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Inspection } from "@/types/database"
import { toast } from "sonner"

interface InspectionCardProps {
  inspection: Inspection & { image_count?: number }
  onEdit: (inspection: Inspection) => void
  onDelete: (inspectionId: string) => Promise<void>
}

export function InspectionCard({ inspection, onEdit, onDelete }: InspectionCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(inspection.id)
      setShowDeleteDialog(false)
      toast.success("Inspection deleted successfully")
    } catch (error) {
      toast.error("Failed to delete inspection")
      console.error("Delete error:", error)
    } finally {
      setDeleting(false)
    }
  }

  const getDateBadgeColor = (dateString: string) => {
    const inspectionDate = new Date(dateString)
    const now = new Date()
    const diffTime = inspectionDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "destructive" // Past
    if (diffDays <= 7) return "default" // Within a week
    return "secondary" // Future
  }

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {inspection.title}
              </CardTitle>
              <Badge variant={getDateBadgeColor(inspection.inspection_date)}>
                {new Date(inspection.inspection_date).toLocaleDateString()}
              </Badge>
            </div>
            {inspection.notes && (
              <CardDescription className="text-gray-600 line-clamp-2">
                {inspection.notes}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <div className="h-4 w-4 flex items-center justify-center">
                  <div className="space-y-0.5">
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(inspection)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Photos</span>
            <span className="font-medium">
              {inspection.image_count || 0}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Created</span>
            <span>
              {new Date(inspection.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={`/houses/${inspection.house_id}/inspections/${inspection.id}`}>
                View Details
              </Link>
            </Button>
            {(inspection.image_count || 0) > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/houses/${inspection.house_id}/inspections/${inspection.id}/gallery`}>
                  Gallery
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inspection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{inspection.title}&rdquo;? This will also delete all associated photos. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}