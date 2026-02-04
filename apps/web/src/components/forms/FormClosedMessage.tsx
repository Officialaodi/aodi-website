"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

interface FormClosedMessageProps {
  message: string
  title?: string
}

export function FormClosedMessage({ 
  message, 
  title = "Form Closed" 
}: FormClosedMessageProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-6">
            {message}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="outline">Return Home</Button>
            </Link>
            <Link href="/contact">
              <Button>Contact Us</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
