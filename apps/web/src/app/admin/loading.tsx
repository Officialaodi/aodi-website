export default function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-sm">Loading Admin Dashboard...</p>
      </div>
    </div>
  )
}
