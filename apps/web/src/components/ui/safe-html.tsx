"use client"

import DOMPurify from "dompurify"

interface SafeHtmlProps {
  html: string
  className?: string
  as?: keyof JSX.IntrinsicElements
}

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "a", "img", "span", "div"
]

const ALLOWED_ATTR = [
  "href", "target", "rel", "src", "alt", "class", "style", "id"
]

export function SafeHtml({ html, className = "", as: Component = "div" }: SafeHtmlProps) {
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ["target"],
  })

  return (
    <Component
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ["target"],
  })
}
