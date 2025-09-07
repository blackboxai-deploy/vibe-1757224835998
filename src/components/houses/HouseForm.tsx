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
import { House, NewHouse, UpdateHouse } from "@/types/database"
import { toast } from "sonner"

interface HouseFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: NewHouse | UpdateHouse) => Promise<void>
  house?: House | null
  mode: "create" | "edit"
}

export function HouseForm({ open, onClose, onSubmit, house, mode }: HouseFormProps) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (mode === "edit" && house) {
      setName(house.name)
      setAddress(house.address || "")
    } else {
      setName("")
      setAddress("")
    }
  }, [house, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("House name is required")
      return
    }

    setLoading(true)
    try {
      const data = mode === "create" 
        ? { name: name.trim(), address: address.trim() || null } as NewHouse
        : { name: name.trim(), address: address.trim() || null } as UpdateHouse

      await onSubmit(data)
      toast.success(`House ${mode === "create" ? "created" : "updated"} successfully`)
      onClose()
    } catch (error) {
      toast.error(`Failed to ${mode} house`)
      console.error(`${mode} house error:`, error)
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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add New House" : "Edit House"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "Add a new house to your inspection portfolio." 
                : "Update the house information."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">House Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Main Street Property, Apartment 2B"
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter the complete address (optional)"
                rows={3}
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
                : (mode === "create" ? "Create House" : "Update House")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}