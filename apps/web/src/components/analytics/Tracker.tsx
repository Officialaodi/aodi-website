"use client"

import { useEffect, useRef, useCallback } from "react"
import { usePathname, useSearchParams } from "next/navigation"

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`
}

function getVisitorId(): string {
  if (typeof window === "undefined") return ""
  let visitorId = localStorage.getItem("aodi_visitor_id")
  if (!visitorId) {
    visitorId = generateId()
    localStorage.setItem("aodi_visitor_id", visitorId)
  }
  return visitorId
}

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  const sessionKey = "aodi_session_id"
  const sessionExpiry = "aodi_session_expiry"
  const SESSION_DURATION = 30 * 60 * 1000

  const now = Date.now()
  const expiry = sessionStorage.getItem(sessionExpiry)
  
  if (expiry && parseInt(expiry) > now) {
    sessionStorage.setItem(sessionExpiry, (now + SESSION_DURATION).toString())
    return sessionStorage.getItem(sessionKey) || generateId()
  }

  const newSessionId = generateId()
  sessionStorage.setItem(sessionKey, newSessionId)
  sessionStorage.setItem(sessionExpiry, (now + SESSION_DURATION).toString())
  return newSessionId
}

function getBrowserInfo() {
  if (typeof window === "undefined") return {}
  
  const ua = navigator.userAgent
  let browser = "Unknown"
  let browserVersion = ""
  let os = "Unknown"
  let osVersion = ""
  let deviceType = "desktop"

  if (ua.includes("Firefox/")) {
    browser = "Firefox"
    browserVersion = ua.split("Firefox/")[1]?.split(" ")[0] || ""
  } else if (ua.includes("Edg/")) {
    browser = "Edge"
    browserVersion = ua.split("Edg/")[1]?.split(" ")[0] || ""
  } else if (ua.includes("Chrome/")) {
    browser = "Chrome"
    browserVersion = ua.split("Chrome/")[1]?.split(" ")[0] || ""
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    browser = "Safari"
    browserVersion = ua.split("Version/")[1]?.split(" ")[0] || ""
  }

  if (ua.includes("Windows NT")) {
    os = "Windows"
    osVersion = ua.split("Windows NT ")[1]?.split(";")[0] || ""
  } else if (ua.includes("Mac OS X")) {
    os = "macOS"
    osVersion = ua.split("Mac OS X ")[1]?.split(")")[0]?.replace(/_/g, ".") || ""
  } else if (ua.includes("Android")) {
    os = "Android"
    osVersion = ua.split("Android ")[1]?.split(";")[0] || ""
    deviceType = "mobile"
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    os = "iOS"
    osVersion = ua.split("OS ")[1]?.split(" ")[0]?.replace(/_/g, ".") || ""
    deviceType = ua.includes("iPad") ? "tablet" : "mobile"
  } else if (ua.includes("Linux")) {
    os = "Linux"
  }

  if (window.innerWidth <= 768 && deviceType === "desktop") {
    deviceType = window.innerWidth <= 480 ? "mobile" : "tablet"
  }

  return { browser, browserVersion, os, osVersion, deviceType }
}

function getUTMParams() {
  if (typeof window === "undefined") return {}
  const params = new URLSearchParams(window.location.search)
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    utmContent: params.get("utm_content") || undefined,
  }
}

async function sendAnalytics(type: string, data: Record<string, unknown>) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
      keepalive: true,
    })
  } catch (error) {
    console.debug("Analytics tracking error:", error)
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const sessionIdRef = useRef<string>("")
  const visitorIdRef = useRef<string>("")
  const pageViewCountRef = useRef(0)
  const pageStartTimeRef = useRef(Date.now())
  const sessionStartTimeRef = useRef(Date.now())
  const maxScrollRef = useRef(0)
  const lastPathRef = useRef("")
  const isInitializedRef = useRef(false)

  const trackEvent = useCallback((
    eventType: string,
    eventCategory?: string,
    eventAction?: string,
    eventLabel?: string,
    eventValue?: string,
    element?: HTMLElement
  ) => {
    sendAnalytics("event", {
      sessionId: sessionIdRef.current,
      visitorId: visitorIdRef.current,
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      path: window.location.pathname,
      elementId: element?.id,
      elementClass: element?.className,
      elementText: element?.textContent?.trim().substring(0, 100),
    })
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (pathname.startsWith("/admin")) return

    const visitorId = getVisitorId()
    const sessionId = getSessionId()
    visitorIdRef.current = visitorId
    sessionIdRef.current = sessionId

    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      sessionStartTimeRef.current = Date.now()
      
      const browserInfo = getBrowserInfo()
      const utmParams = getUTMParams()

      sendAnalytics("session_start", {
        sessionId,
        visitorId,
        userAgent: navigator.userAgent,
        ...browserInfo,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer,
        ...utmParams,
        entryPage: pathname,
      })
    }

    if (pathname !== lastPathRef.current) {
      pageViewCountRef.current++
      pageStartTimeRef.current = Date.now()
      maxScrollRef.current = 0
      lastPathRef.current = pathname

      sendAnalytics("page_view", {
        sessionId,
        visitorId,
        path: pathname,
        title: document.title,
        referrer: document.referrer,
        queryParams: Object.fromEntries(searchParams.entries()),
        pageCount: pageViewCountRef.current,
      })
    }

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = scrollHeight > 0 ? Math.round((window.scrollY / scrollHeight) * 100) : 0
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercent)
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      const button = target.closest("button")
      const clickable = target.closest("[data-track]")

      if (link) {
        const isExternal = link.hostname !== window.location.hostname
        trackEvent(
          isExternal ? "external_link_click" : "internal_link_click",
          "navigation",
          link.href,
          link.textContent?.trim(),
          undefined,
          link
        )
      } else if (button) {
        trackEvent(
          "button_click",
          "interaction",
          button.getAttribute("data-action") || "click",
          button.textContent?.trim(),
          undefined,
          button
        )
      } else if (clickable) {
        trackEvent(
          "custom_click",
          clickable.getAttribute("data-track-category") || "custom",
          clickable.getAttribute("data-track-action") || "click",
          clickable.getAttribute("data-track-label") || clickable.textContent?.trim(),
          undefined,
          clickable as HTMLElement
        )
      }
    }

    const handleSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement
      trackEvent(
        "form_submit",
        "conversion",
        form.getAttribute("data-form-name") || form.id || "unknown_form",
        form.action,
        undefined,
        form
      )
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const timeOnPage = Math.round((Date.now() - pageStartTimeRef.current) / 1000)
        const sessionDuration = Math.round((Date.now() - sessionStartTimeRef.current) / 1000)

        sendAnalytics("page_update", {
          sessionId: sessionIdRef.current,
          visitorId: visitorIdRef.current,
          timeOnPage,
          scrollDepth: maxScrollRef.current,
          sessionDuration,
        })
      }
    }

    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - pageStartTimeRef.current) / 1000)
      const sessionDuration = Math.round((Date.now() - sessionStartTimeRef.current) / 1000)

      sendAnalytics("page_update", {
        sessionId: sessionIdRef.current,
        visitorId: visitorIdRef.current,
        timeOnPage,
        scrollDepth: maxScrollRef.current,
        sessionDuration,
        exitIntent: true,
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    document.addEventListener("click", handleClick)
    document.addEventListener("submit", handleSubmit)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    const heartbeat = setInterval(() => {
      const sessionDuration = Math.round((Date.now() - sessionStartTimeRef.current) / 1000)
      sendAnalytics("page_update", {
        sessionId: sessionIdRef.current,
        visitorId: visitorIdRef.current,
        timeOnPage: Math.round((Date.now() - pageStartTimeRef.current) / 1000),
        scrollDepth: maxScrollRef.current,
        sessionDuration,
      })
    }, 30000)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("click", handleClick)
      document.removeEventListener("submit", handleSubmit)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      clearInterval(heartbeat)
    }
  }, [pathname, searchParams, trackEvent])

  return null
}
