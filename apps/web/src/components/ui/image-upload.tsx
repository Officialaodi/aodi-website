"use client"

import { useState, useRef, useCallback, useId } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon, Loader2, RefreshCw } from "lucide-react"

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
  const [imageLoadFailed, setImageLoadFailed] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uniqueId = useId()

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setUploading(true)
    setError(null)
    setImageLoadFailed(false)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        let errorMsg = "Upload failed"
        try {
          const data = await response.json()
          errorMsg = data.error || errorMsg
        } catch {}
        throw new Error(errorMsg)
      }

      const data = await response.json()
      setRetryCount(0)
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
      setImageLoadFailed(false)
      setRetryCount(0)
      setError(null)
      onChange(urlInput.trim())
      setUrlInput("")
      setShowUrlInput(false)
    }
  }

  const handleRemove = () => {
    onChange("")
    setError(null)
    setImageLoadFailed(false)
    setRetryCount(0)
  }

  const handleImageError = () => {
    setImageLoadFailed(true)
    if (retryCount === 0) {
      setError("Failed to load image preview. The image may still be saved correctly.")
    }
  }

  const handleRetryLoad = () => {
    setImageLoadFailed(false)
    setError(null)
    setRetryCount(prev => prev + 1)
  }

  const imgSrc = value ? (retryCount > 0 ? `${value}?retry=${retryCount}` : value) : ""

  return (
    <div className={`space-y-2 ${className}`}>
      {value ? (
        <div className="relative inline-block">
          {imageLoadFailed ? (
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
              <ImageIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate">{value}</p>
                <p className="text-xs text-gray-400 mt-1">Image preview unavailable</p>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetryLoad}
                  data-testid="button-retry-image"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  data-testid="button-remove-image"
                >
                  <X className="w-3 h-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <>
              <img
                src={imgSrc}
                alt="Uploaded image"
                className="max-w-full h-auto max-h-48 rounded-lg border object-cover"
                onError={handleImageError}
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
            </>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id={`image-upload-${uniqueId}`}
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
        <p className="text-sm text-yellow-600" data-testid="text-upload-error">{error}</p>
      )}
    </div>
  )
}
