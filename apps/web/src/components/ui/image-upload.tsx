"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
  accept?: string
}

export function ImageUpload({
  value,
  onChange,
  placeholder = "Upload an image or enter URL",
  className = "",
  accept = "image/*",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const data = await response.json()
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [onChange])

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput("")
      setShowUrlInput(false)
    }
  }

  const handleRemove = () => {
    onChange("")
    setError(null)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Uploaded image"
            className="max-w-full h-auto max-h-48 rounded-lg border object-cover"
            onError={() => setError("Failed to load image")}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
            data-testid="button-remove-image"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
            data-testid="input-file-upload"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ImageIcon className="w-10 h-10 text-gray-400" />
              <p className="text-sm text-gray-500">{placeholder}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-image"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  data-testid="button-enter-url"
                >
                  Enter URL
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {showUrlInput && !value && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border rounded-lg"
            data-testid="input-image-url"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleUrlSubmit}
            data-testid="button-submit-url"
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowUrlInput(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500" data-testid="text-upload-error">{error}</p>
      )}
    </div>
  )
}
