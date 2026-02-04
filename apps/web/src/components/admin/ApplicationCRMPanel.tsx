"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageSquare, 
  Clock, 
  Mail, 
  Send, 
  Trash2,
  Plus
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Note {
  id: number
  applicationId: number
  authorName: string
  content: string
  isInternal: boolean
  createdAt: string
}

interface ActivityLog {
  id: number
  entityType: string
  entityId: number
  action: string
  details: string | null
  performedBy: string
  createdAt: string
}

interface EmailTemplate {
  id: number
  name: string
  slug: string
  subject: string
  body: string
  category: string
  variables: string | null
}

interface ApplicationCRMPanelProps {
  applicationId: number
  applicantName: string
  applicantEmail: string
  applicationType: string
}

export function ApplicationCRMPanel({ 
  applicationId, 
  applicantName, 
  applicantEmail,
  applicationType 
}: ApplicationCRMPanelProps) {
  const [activePanel, setActivePanel] = useState<"notes" | "activity" | "email">("notes")
  const [notes, setNotes] = useState<Note[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [newNote, setNewNote] = useState("")
  const [notesLoading, setNotesLoading] = useState(false)
  const [activityLoading, setActivityLoading] = useState(false)
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    fetchNotes()
    fetchActivityLogs()
    fetchEmailTemplates()
  }, [applicationId])

  const fetchNotes = async () => {
    setNotesLoading(true)
    try {
      const response = await fetch(`/api/admin/notes?applicationId=${applicationId}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setNotesLoading(false)
    }
  }

  const fetchActivityLogs = async () => {
    setActivityLoading(true)
    try {
      const response = await fetch(`/api/admin/activity-logs?entityType=application&entityId=${applicationId}`)
      if (response.ok) {
        const data = await response.json()
        setActivityLogs(data.logs || [])
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error)
    } finally {
      setActivityLoading(false)
    }
  }

  const fetchEmailTemplates = async () => {
    try {
      const response = await fetch("/api/admin/email-templates?category=application")
      if (response.ok) {
        const data = await response.json()
        setEmailTemplates(data)
      }
    } catch (error) {
      console.error("Error fetching email templates:", error)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    try {
      const response = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          content: newNote,
          authorName: "Admin"
        })
      })
      if (response.ok) {
        setNewNote("")
        fetchNotes()
        fetchActivityLogs()
      }
    } catch (error) {
      console.error("Error adding note:", error)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm("Delete this note?")) return
    try {
      const response = await fetch(`/api/admin/notes/${noteId}`, {
        method: "DELETE"
      })
      if (response.ok) {
        fetchNotes()
      }
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = emailTemplates.find(t => t.id.toString() === templateId)
    if (template) {
      let subject = template.subject
      let body = template.body
      
      subject = subject.replace(/\{\{name\}\}/g, applicantName)
      subject = subject.replace(/\{\{applicationType\}\}/g, applicationType)
      body = body.replace(/\{\{name\}\}/g, applicantName)
      body = body.replace(/\{\{applicationType\}\}/g, applicationType)
      
      setEmailSubject(subject)
      setEmailBody(body)
    }
  }

  const handleSendEmail = async () => {
    if (!emailSubject || !emailBody) {
      alert("Please enter subject and body")
      return
    }
    setSendingEmail(true)
    try {
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          templateId: selectedTemplate ? parseInt(selectedTemplate) : null,
          recipientEmail: applicantEmail,
          recipientName: applicantName,
          subject: emailSubject,
          body: emailBody
        })
      })
      if (response.ok) {
        alert("Email sent successfully!")
        setSelectedTemplate("")
        setEmailSubject("")
        setEmailBody("")
        fetchActivityLogs()
      } else {
        alert("Failed to send email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      alert("Failed to send email")
    } finally {
      setSendingEmail(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: "Application created",
      status_changed: "Status updated",
      note_added: "Note added",
      email_sent: "Email sent"
    }
    return labels[action] || action
  }

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex gap-2 mb-4">
        <Button
          variant={activePanel === "notes" ? "default" : "outline"}
          size="sm"
          onClick={() => setActivePanel("notes")}
          data-testid="button-notes-tab"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Notes ({notes.length})
        </Button>
        <Button
          variant={activePanel === "activity" ? "default" : "outline"}
          size="sm"
          onClick={() => setActivePanel("activity")}
          data-testid="button-activity-tab"
        >
          <Clock className="w-4 h-4 mr-2" />
          Activity
        </Button>
        <Button
          variant={activePanel === "email" ? "default" : "outline"}
          size="sm"
          onClick={() => setActivePanel("email")}
          data-testid="button-email-tab"
        >
          <Mail className="w-4 h-4 mr-2" />
          Send Email
        </Button>
      </div>

      {activePanel === "notes" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add an internal note..."
              className="flex-1"
              data-testid="input-new-note"
            />
            <Button onClick={handleAddNote} disabled={!newNote.trim()} data-testid="button-add-note">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {notesLoading ? (
            <p className="text-gray-500 text-sm">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-gray-500 text-sm">No notes yet</p>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-3" data-testid={`note-${note.id}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-500">
                      {note.authorName} - {formatDate(note.createdAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDeleteNote(note.id)}
                      data-testid={`button-delete-note-${note.id}`}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activePanel === "activity" && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activityLoading ? (
            <p className="text-gray-500 text-sm">Loading activity...</p>
          ) : activityLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No activity recorded</p>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b last:border-0" data-testid={`activity-${log.id}`}>
                <div className="w-2 h-2 rounded-full bg-[#0F3D2E] mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{getActionLabel(log.action)}</p>
                  {log.details && (
                    <p className="text-xs text-gray-600 truncate">{log.details}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {formatDate(log.createdAt)} by {log.performedBy}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activePanel === "email" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Use Template</label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger data-testid="select-email-template">
                <SelectValue placeholder="Select a template (optional)" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm text-gray-500 mb-1 block">To</label>
            <p className="text-sm font-medium">{applicantName} &lt;{applicantEmail}&gt;</p>
          </div>
          
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Subject</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Email subject"
              data-testid="input-email-subject"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Body</label>
            <Textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Email body..."
              rows={6}
              data-testid="input-email-body"
            />
          </div>
          
          <Button 
            onClick={handleSendEmail} 
            disabled={sendingEmail || !emailSubject || !emailBody}
            className="w-full"
            data-testid="button-send-email"
          >
            <Send className="w-4 h-4 mr-2" />
            {sendingEmail ? "Sending..." : "Send Email"}
          </Button>
        </div>
      )}
    </div>
  )
}
