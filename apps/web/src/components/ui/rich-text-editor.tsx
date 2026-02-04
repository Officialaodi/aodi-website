"use client"

import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  RemoveFormatting,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

function MenuBar({ editor }: { editor: Editor }) {
  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showImageInput, setShowImageInput] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  const setLink = useCallback(() => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    }
    setShowLinkInput(false)
    setLinkUrl("")
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
    }
    setShowImageInput(false)
    setImageUrl("")
  }, [editor, imageUrl])

  return (
    <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50 rounded-t-lg">
      <Button
        type="button"
        variant={editor.isActive("bold") ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        data-testid="rte-bold"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("italic") ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        data-testid="rte-italic"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("underline") ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        data-testid="rte-underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("strike") ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        data-testid="rte-strike"
      >
        <Strikethrough className="w-4 h-4" />
      </Button>
      
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      
      <Button
        type="button"
        variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        data-testid="rte-h1"
      >
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        data-testid="rte-h2"
      >
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        data-testid="rte-h3"
      >
        <Heading3 className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="button"
        variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        data-testid="rte-bullet-list"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        data-testid="rte-ordered-list"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        data-testid="rte-blockquote"
      >
        <Quote className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="button"
        variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        data-testid="rte-align-left"
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        data-testid="rte-align-center"
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        data-testid="rte-align-right"
      >
        <AlignRight className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <div className="relative">
        <Button
          type="button"
          variant={editor.isActive("link") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShowLinkInput(!showLinkInput)}
          data-testid="rte-link"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        {showLinkInput && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-10 flex gap-1">
            <input
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-48 px-2 py-1 text-sm border rounded"
              data-testid="rte-link-input"
            />
            <Button type="button" size="sm" onClick={setLink} data-testid="rte-link-confirm">
              Add
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageInput(!showImageInput)}
          data-testid="rte-image"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        {showImageInput && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-10 flex gap-1">
            <input
              type="url"
              placeholder="Image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-48 px-2 py-1 text-sm border rounded"
              data-testid="rte-image-input"
            />
            <Button type="button" size="sm" onClick={addImage} data-testid="rte-image-confirm">
              Add
            </Button>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        data-testid="rte-clear-format"
      >
        <RemoveFormatting className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        data-testid="rte-undo"
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        data-testid="rte-redo"
      >
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className = "",
  minHeight = "200px",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none p-4`,
        style: `min-height: ${minHeight}`,
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div className={`border rounded-lg ${className}`}>
        <div className="p-4 text-gray-400">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`} data-testid="rich-text-editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
