"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, User, Mail, Clock, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AdminUser {
  id: number
  email: string
  fullName: string
  roleId: number
  roleName: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

interface Role {
  id: number
  name: string
  description: string | null
  isSystemRole: boolean
}

interface UserManagerProps {
  userPermissions: string[]
  currentUserId: number
}

export function UserManager({ userPermissions, currentUserId }: UserManagerProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    roleId: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const canManage = userPermissions.includes("users.manage")
  const canDelete = userPermissions.includes("users.delete")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/roles"),
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json()
        setRoles(rolesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingUser(null)
    setFormData({ email: "", fullName: "", password: "", roleId: "" })
    setError("")
    setDialogOpen(true)
  }

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      fullName: user.fullName,
      password: "",
      roleId: user.roleId.toString(),
    })
    setError("")
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : "/api/admin/users"
      const method = editingUser ? "PATCH" : "POST"

      const body: Record<string, unknown> = {
        fullName: formData.fullName,
        roleId: parseInt(formData.roleId),
      }

      if (!editingUser) {
        body.email = formData.email
        body.password = formData.password
      } else if (formData.password) {
        body.password = formData.password
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setDialogOpen(false)
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to save user")
      }
    } catch {
      setError("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (user: AdminUser) => {
    if (user.id === currentUserId) {
      alert("You cannot deactivate your own account")
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error toggling user status:", error)
    }
  }

  const handleDelete = async (user: AdminUser) => {
    if (user.id === currentUserId) {
      alert("You cannot delete your own account")
      return
    }

    if (!confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete user")
      }
    } catch {
      alert("An error occurred")
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never"
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
          <h2 className="text-xl font-semibold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">Manage admin user accounts</p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90" data-testid="button-create-user">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                {(canManage || canDelete) && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0F3D2E] flex items-center justify-center text-white text-sm font-medium">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.roleName}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {canManage && user.id !== currentUserId ? (
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => handleToggleActive(user)}
                          data-testid={`switch-user-active-${user.id}`}
                        />
                      ) : null}
                      <Badge variant={user.isActive ? "default" : "secondary"} className={user.isActive ? "bg-green-100 text-green-800" : ""}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(user.lastLoginAt)}
                  </TableCell>
                  {(canManage || canDelete) && (
                    <TableCell>
                      <div className="flex gap-1">
                        {canManage && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditDialog(user)}
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {canDelete && user.id !== currentUserId && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(user)}
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user's information" : "Create a new admin user account"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter full name"
                required
                data-testid="input-user-fullname"
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                  data-testid="input-user-email"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">
                {editingUser ? "New Password (leave blank to keep current)" : "Password"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={editingUser ? "Enter new password" : "Create password (min. 8 characters)"}
                required={!editingUser}
                data-testid="input-user-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleId">Role</Label>
              <Select
                value={formData.roleId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
              >
                <SelectTrigger data-testid="select-user-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90" data-testid="button-save-user">
                {saving ? "Saving..." : "Save User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
