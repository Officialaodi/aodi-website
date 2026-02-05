"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Upload, 
  Search, 
  Trash2, 
  Copy, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Loader2,
  Check,
  X,
  FolderOpen,
  RefreshCw
} from "lucide-react"

interface MediaItem {
  id: number
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
  alt: string | null
  caption: string | null
  folder: string | null
  createdAt: string
}

interface UploadedFile {
  url: string
  filename: string
  originalName: string
  size: number
  type: string
  mediaType: string
}

export function MediaLibraryManager() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "image" | "video" | "document">("all")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/media")
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error("Failed to fetch media:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append("file", file)

      try {
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data: UploadedFile = await response.json()
        
        await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: data.filename,
            originalName: data.originalName,
            url: data.url,
            mimeType: data.type,
            size: data.size,
          }),
        })

        return data
      } catch (error) {
        console.error("Upload error:", error)
        return null
      }
    })

    await Promise.all(uploadPromises)
    await fetchMedia()
    setUploading(false)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this media item?")) return

    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setItems(items.filter((item) => item.id !== id))
        setSelectedItems(selectedItems.filter((i) => i !== id))
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) return

    try {
      await Promise.all(
        selectedItems.map((id) =>
          fetch(`/api/admin/media/${id}`, { method: "DELETE" })
        )
      )
      setItems(items.filter((item) => !selectedItems.includes(item.id)))
      setSelectedItems([])
    } catch (error) {
      console.error("Bulk delete error:", error)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="w-6 h-6 text-primary" />
    if (mimeType.startsWith("video/")) return <Video className="w-6 h-6 text-primary" />
    if (mimeType === "application/pdf") return <FileText className="w-6 h-6 text-destructive" />
    return <FolderOpen className="w-6 h-6 text-muted-foreground" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getMediaType = (mimeType: string): "image" | "video" | "document" => {
    if (mimeType.startsWith("image/")) return "image"
    if (mimeType.startsWith("video/")) return "video"
    return "document"
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = 
      filterType === "all" || getMediaType(item.mimeType) === filterType

    return matchesSearch && matchesType
  })

  const toggleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Media Library
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMedia}
              disabled={loading}
              data-testid="button-refresh-media"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={handleUpload}
              className="hidden"
              data-testid="input-file-upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              data-testid="button-upload-media"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload Files
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-media"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "image", "video", "document"] as const).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type)}
                data-testid={`button-filter-${type}`}
              >
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}s
              </Button>
            ))}
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center justify-between p-3 mb-4 bg-secondary rounded-lg border">
            <span className="text-sm text-foreground">
              {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItems([])}
                data-testid="button-clear-selection"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                data-testid="button-bulk-delete"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{searchTerm || filterType !== "all" ? "No matching media found" : "No media uploaded yet"}</p>
            <p className="text-sm mt-1">Upload images, videos, or PDFs to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`relative group border rounded-lg overflow-visible cursor-pointer transition-all hover-elevate ${
                  selectedItems.includes(item.id) 
                    ? "ring-2 ring-primary border-primary" 
                    : ""
                }`}
                onClick={() => toggleSelect(item.id)}
                data-testid={`media-item-${item.id}`}
              >
                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  {item.mimeType.startsWith("image/") ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : item.mimeType.startsWith("video/") ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-4">
                      {getMediaIcon(item.mimeType)}
                      <span className="text-xs text-muted-foreground text-center truncate w-full">
                        {item.originalName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="absolute top-2 left-2" data-testid={`checkbox-select-${item.id}`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedItems.includes(item.id) 
                      ? "bg-primary border-primary" 
                      : "bg-background/90 border-muted-foreground/30"
                  }`}>
                    {selectedItems.includes(item.id) && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(item.url)
                    }}
                    data-testid={`button-copy-url-${item.id}`}
                  >
                    {copiedUrl === item.url ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item.id)
                    }}
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-2 bg-card border-t">
                  <p className="text-xs font-medium truncate" title={item.originalName} data-testid={`text-filename-${item.id}`}>
                    {item.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(item.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
