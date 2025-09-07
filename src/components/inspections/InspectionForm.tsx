"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Inspection, NewInspection, UpdateInspection } from "@/types/database"
import { toast } from "sonner"

interface InspectionFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: NewInspection | UpdateInspection) => Promise<void>
  inspection?: Inspection | null
  mode: "create" | "edit"
  houseId: string
}

export function InspectionForm({ 
  open, 
  onClose, 
  onSubmit, 
  inspection, 
  mode, 
  houseId 
}: InspectionFormProps) {
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [inspectionDate, setInspectionDate] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (mode === "edit" && inspection) {
      setTitle(inspection.title)
      setNotes(inspection.notes || "")
      // Format date for input field (YYYY-MM-DD)
      const date = new Date(inspection.inspection_date)
      setInspectionDate(date.toISOString().split('T')[0])
    } else {
      setTitle("")
      setNotes("")
      // Default to today's date
      const today = new Date()
      setInspectionDate(today.toISOString().split('T')[0])
    }
  }, [inspection, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error("Inspection title is required")
      return
    }

    if (!inspectionDate) {
      toast.error("Inspection date is required")
      return
    }

    setLoading(true)
    try {
      const data = mode === "create" 
        ? {
            title: title.trim(),
            notes: notes.trim() || null,
            inspection_date: new Date(inspectionDate).toISOString(),
            house_id: houseId
          } as NewInspection
        : {
            title: title.trim(),
            notes: notes.trim() || null,
            inspection_date: new Date(inspectionDate).toISOString()
          } as UpdateInspection

      await onSubmit(data)
      toast.success(`Inspection ${mode === "create" ? "created" : "updated"} successfully`)
      onClose()
    } catch (error) {
      toast.error(`Failed to ${mode} inspection`)
      console.error(`${mode} inspection error:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add New Inspection" : "Edit Inspection"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "Create a new inspection record for this house." 
                : "Update the inspection information."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Inspection Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Monthly Safety Check, Pre-Sale Inspection"
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inspection-date">Inspection Date *</Label>
              <Input
                id="inspection-date"
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any inspection notes, findings, or observations..."
                rows={4}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading 
                ? (mode === "create" ? "Creating..." : "Updating...")
                : (mode === "create" ? "Create Inspection" : "Update Inspection")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}