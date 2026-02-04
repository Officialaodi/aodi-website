"use client"

import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface PolicyConsentProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  className?: string
}

export function PolicyConsent({
  checked,
  onCheckedChange,
  id = "policy-consent",
  className = "",
}: PolicyConsentProps) {
  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
        className="mt-1"
        data-testid="checkbox-policy-consent"
      />
      <Label htmlFor={id} className="font-normal text-sm text-slate leading-relaxed cursor-pointer">
        I consent to AODI storing my submitted data and agree to the{" "}
        <Link
          href="/policies/privacy"
          target="_blank"
          className="text-aodi-teal hover:underline"
        >
          Privacy Policy
        </Link>
        ,{" "}
        <Link
          href="/policies/terms"
          target="_blank"
          className="text-aodi-teal hover:underline"
        >
          Terms of Service
        </Link>
        , and{" "}
        <Link
          href="/policies/safeguarding"
          target="_blank"
          className="text-aodi-teal hover:underline"
        >
          Safeguarding Policy
        </Link>
        . <span className="text-red-500">*</span>
      </Label>
    </div>
  )
}
