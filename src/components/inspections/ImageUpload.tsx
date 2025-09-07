"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ImageUploadProps {
  inspectionId: string
  onImagesUploaded: (images: Array<{ id: string; url: string; path: string }>) => void
}

interface UploadProgress {
  file: string
  progress: number
  status: "uploading" | "completed" | "error"
}

export function ImageUpload({ inspectionId, onImagesUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const supabase = createClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(
      acceptedFiles.map(file => ({
        file: file.name,
        progress: 0,
        status: "uploading" as const
      }))
    )

    try {
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        try {
          // Create a unique filename
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
          const filePath = `inspections/${inspectionId}/${fileName}`

          // Upload file to Supabase Storage
          const { error } = await supabase.storage
            .from('inspection-images')
            .upload(filePath, file)

          if (error) throw error

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('inspection-images')
            .getPublicUrl(filePath)

          // Update progress
          setUploadProgress(prev => 
            prev.map((item, i) => 
              i === index 
                ? { ...item, progress: 100, status: "completed" }
                : item
            )
          )

          return {
            id: fileName,
            url: publicUrl,
            path: filePath
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          
          // Update progress with error
          setUploadProgress(prev => 
            prev.map((item, i) => 
              i === index 
                ? { ...item, progress: 0, status: "error" }
                : item
            )
          )
          
          throw error
        }
      })

      const results = await Promise.all(uploadPromises.map(p => p.catch(e => e)))
      const successfulUploads = results.filter(result => result && typeof result === 'object' && 'id' in result)
      const failedUploads = results.filter(result => result instanceof Error)

      if (successfulUploads.length > 0) {
        onImagesUploaded(successfulUploads)
        toast.success(`${successfulUploads.length} image(s) uploaded successfully`)
      }

      if (failedUploads.length > 0) {
        toast.error(`${failedUploads.length} image(s) failed to upload`)
      }

    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload images")
    } finally {
      setUploading(false)
      // Clear progress after a delay
      setTimeout(() => setUploadProgress([]), 2000)
    }
  }, [inspectionId, onImagesUploaded, supabase])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading
  })

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
              ${isDragReject ? 'border-red-500 bg-red-50' : ''}
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary rounded"></div>
              </div>
              
              {isDragActive ? (
                <p className="text-primary font-medium">Drop images here...</p>
              ) : isDragReject ? (
                <p className="text-red-500">Some files are not supported</p>
              ) : (
                <>
                  <p className="text-gray-700 font-medium">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: JPEG, PNG, WebP, GIF • Max 10 files • Up to 10MB each
                  </p>
                </>
              )}

              {!uploading && (
                <Button type="button" variant="outline" size="sm">
                  Choose Files
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Upload Progress</h4>
          {uploadProgress.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="truncate flex-1 mr-2">{item.file}</span>
                <span className={`
                  text-xs font-medium
                  ${item.status === "completed" ? "text-green-600" : ""}
                  ${item.status === "error" ? "text-red-600" : ""}
                  ${item.status === "uploading" ? "text-blue-600" : ""}
                `}>
                  {item.status === "completed" ? "✓ Completed" : 
                   item.status === "error" ? "✗ Failed" :
                   `${item.progress}%`}
                </span>
              </div>
              <Progress 
                value={item.progress} 
                className={`h-2 ${item.status === "error" ? "bg-red-100" : ""}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}