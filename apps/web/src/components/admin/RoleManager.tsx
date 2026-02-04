"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Shield, X, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Permission {
  id: number
  key: string
  name: string
  description: string | null
  category: string
}

interface Role {
  id: number
  name: string
  description: string | null
  isSystemRole: boolean
  permissions: string[]
  createdAt: string
}

interface RoleManagerProps {
  userPermissions: string[]
}

export function RoleManager({ userPermissions }: RoleManagerProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({})
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const canManage = userPermissions.includes("roles.manage")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetch("/api/admin/roles"),
        fetch("/api/admin/permissions"),
      ])

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json()
        setRoles(rolesData)
      }

      if (permsRes.ok) {
        const permsData = await permsRes.json()
        setPermissions(permsData.permissions)
        setGroupedPermissions(permsData.grouped)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingRole(null)
    setFormData({ name: "", description: "", permissions: [] })
    setError("")
    setDialogOpen(true)
  }

  const openEditDialog = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions,
    })
    setError("")
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const url = editingRole
        ? `/api/admin/roles/${editingRole.id}`
        : "/api/admin/roles"
      const method = editingRole ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setDialogOpen(false)
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to save role")
      }
    } catch {
      setError("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/roles/${role.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete role")
      }
    } catch {
      alert("An error occurred")
    }
  }

  const togglePermission = (key: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }))
  }

  const toggleCategory = (category: string, permissions: Permission[]) => {
    const categoryKeys = permissions.map(p => p.key)
    const allSelected = categoryKeys.every(key => formData.permissions.includes(key))

    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !categoryKeys.includes(p))
        : [...new Set([...prev.permissions, ...categoryKeys])],
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F3D2E]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Roles</h2>
          <p className="text-sm text-gray-500">Manage roles and their permissions</p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90" data-testid="button-create-role">
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {roles.map(role => (
          <Card key={role.id} data-testid={`card-role-${role.id}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Shield className="w-5 h-5 text-[#0F3D2E]" />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  {role.isSystemRole && (
                    <Badge variant="secondary">System</Badge>
                  )}
                </div>
                {canManage && !role.isSystemRole && (
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(role)}
                      data-testid={`button-edit-role-${role.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(role)}
                      data-testid={`button-delete-role-${role.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              {role.description && (
                <CardDescription>{role.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {role.permissions.length === permissions.length ? (
                  <Badge variant="default" className="bg-[#0F3D2E]">All Permissions</Badge>
                ) : role.permissions.length === 0 ? (
                  <span className="text-sm text-gray-500">No permissions assigned</span>
                ) : (
                  role.permissions.slice(0, 8).map(perm => (
                    <Badge key={perm} variant="outline" className="text-xs">
                      {perm}
                    </Badge>
                  ))
                )}
                {role.permissions.length > 8 && (
                  <Badge variant="secondary">+{role.permissions.length - 8} more</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
            <DialogDescription>
              {editingRole ? "Modify the role settings and permissions" : "Create a new role with specific permissions"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Content Manager"
                  required
                  data-testid="input-role-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this role is for"
                  rows={2}
                  data-testid="input-role-description"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <Card key={category}>
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium">{category}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategory(category, perms)}
                        className="h-auto py-1 px-2 text-xs"
                      >
                        {perms.every(p => formData.permissions.includes(p.key)) ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="grid gap-2">
                      {perms.map(perm => (
                        <div key={perm.key} className="flex items-start gap-2">
                          <Checkbox
                            id={perm.key}
                            checked={formData.permissions.includes(perm.key)}
                            onCheckedChange={() => togglePermission(perm.key)}
                            data-testid={`checkbox-permission-${perm.key}`}
                          />
                          <div className="grid gap-0.5 leading-none">
                            <label htmlFor={perm.key} className="text-sm font-medium cursor-pointer">
                              {perm.name}
                            </label>
                            {perm.description && (
                              <p className="text-xs text-muted-foreground">{perm.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90" data-testid="button-save-role">
                {saving ? "Saving..." : "Save Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
