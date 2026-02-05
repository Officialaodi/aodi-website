"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, Image as ImageIcon, Video, FileText, Loader2 } from "lucide-react"

type MediaType = "image" | "video" | "document" | "any"

interface MediaUploadProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
  mediaType?: MediaType
  maxSizeMB?: number
}

const ACCEPT_MAP: Record<MediaType, string> = {
  image: "image/jpeg,image/png,image/gif,image/webp,image/svg+xml",
  video: "video/mp4,video/webm,video/ogg,video/quicktime",
  document: "application/pdf",
  any: "image/*,video/*,application/pdf"
}

const DEFAULT_MAX_SIZE: Record<MediaType, number> = {
  image: 10,
  video: 100,
  document: 10,
  any: 100
}

export function MediaUpload({
  value,
  onChange,
  placeholder = "Upload a file or enter URL",
  className = "",
  mediaType = "any",
  maxSizeMB,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [uploadedType, setUploadedType] = useState<"image" | "video" | "document" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSize = maxSizeMB || DEFAULT_MAX_SIZE[mediaType]
  const accept = ACCEPT_MAP[mediaType]

  const detectMediaType = (url: string): "image" | "video" | "document" | null => {
    const lower = url.toLowerCase()
    if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/)) return "image"
    if (lower.match(/\.(mp4|webm|ogg|mov)(\?|$)/)) return "video"
    if (lower.match(/\.pdf(\?|$)/)) return "document"
    return null
  }

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
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
      setUploadedType(data.mediaType)
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [onChange, maxSize])

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      const detectedType = detectMediaType(urlInput.trim())
      setUploadedType(detectedType)
      onChange(urlInput.trim())
      setUrlInput("")
      setShowUrlInput(false)
    }
  }

  const handleRemove = () => {
    onChange("")
    setUploadedType(null)
    setError(null)
  }

  const renderPreview = () => {
    const type = uploadedType || detectMediaType(value)
    
    if (type === "video") {
      return (
        <video
          src={value}
          controls
          className="max-w-full h-auto max-h-48 rounded-lg border"
          onError={() => setError("Failed to load video")}
        />
      )
    }
    
    if (type === "document") {
      return (
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border">
          <FileText className="w-8 h-8 text-destructive" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{value.split('/').pop()}</p>
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline" data-testid="link-view-pdf">
              View PDF
            </a>
          </div>
        </div>
      )
    }
    
    return (
      <img
        src={value}
        alt="Uploaded media"
        className="max-w-full h-auto max-h-48 rounded-lg border object-cover"
        onError={() => setError("Failed to load image")}
      />
    )
  }

  const getIcon = () => {
    if (mediaType === "video") return <Video className="w-10 h-10 text-muted-foreground" />
    if (mediaType === "document") return <FileText className="w-10 h-10 text-muted-foreground" />
    if (mediaType === "image") return <ImageIcon className="w-10 h-10 text-muted-foreground" />
    return <Upload className="w-10 h-10 text-muted-foreground" />
  }

  const getPlaceholderText = () => {
    if (mediaType === "video") return "Upload a video (MP4, WebM, up to 100MB)"
    if (mediaType === "document") return "Upload a PDF document (up to 10MB)"
    if (mediaType === "image") return "Upload an image (JPEG, PNG, GIF, WebP, up to 10MB)"
    return placeholder
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {value ? (
        <div className="relative inline-block">
          {renderPreview()}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 rounded-full"
            onClick={handleRemove}
            data-testid="button-remove-media"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/50">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id="media-upload"
            data-testid="input-file-upload"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {getIcon()}
              <p className="text-sm text-muted-foreground">{getPlaceholderText()}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-media"
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
          <Input
            type="url"
            placeholder="https://example.com/media-file"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1"
            data-testid="input-media-url"
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
            data-testid="button-cancel-url"
          >
            Cancel
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" data-testid="text-upload-error">{error}</p>
      )}
    </div>
  )
}
