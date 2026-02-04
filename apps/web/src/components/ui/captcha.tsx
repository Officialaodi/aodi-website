"use client"

import HCaptcha from "@hcaptcha/react-hcaptcha"
import { useRef, forwardRef, useImperativeHandle } from "react"

interface CaptchaProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: (error: string) => void
}

export interface CaptchaRef {
  reset: () => void
  execute: () => void
}

const Captcha = forwardRef<CaptchaRef, CaptchaProps>(({ onVerify, onExpire, onError }, ref) => {
  const captchaRef = useRef<HCaptcha>(null)
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY

  useImperativeHandle(ref, () => ({
    reset: () => captchaRef.current?.resetCaptcha(),
    execute: () => captchaRef.current?.execute()
  }))

  if (!siteKey) {
    return null
  }

  return (
    <div className="my-4" data-testid="captcha-container">
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={onVerify}
        onExpire={onExpire}
        onError={onError}
      />
    </div>
  )
})

Captcha.displayName = "Captcha"

export default Captcha
