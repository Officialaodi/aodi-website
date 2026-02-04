'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import Captcha from '@/components/ui/captcha'
import { Youtube, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react'

const socialLinks = [
  { name: 'YouTube', href: 'https://www.youtube.com/@africaofourdreaminitiative3252', icon: Youtube },
  { name: 'LinkedIn', href: 'https://ng.linkedin.com/company/africa-of-our-dream-initiative-aodi', icon: Linkedin },
  { name: 'X', href: 'https://x.com/official_aodi', icon: Twitter },
  { name: 'Facebook', href: 'https://web.facebook.com/OfficialAODI', icon: Facebook },
  { name: 'Instagram', href: 'https://www.instagram.com/official_aodi', icon: Instagram },
]

const footerLinks = {
  programs: [
    { name: 'Global Mentorship & Leadership', href: '/programs/global-mentorship-leadership' },
    { name: 'EmpowerHer Initiative', href: '/programs/empowerher' },
    { name: 'Campus Ambassador', href: '/programs/campus-ambassador' },
    { name: 'All Programs', href: '/programs' },
    { name: 'Events', href: '/events' },
  ],
  getInvolved: [
    { name: 'Partner with AODI', href: '/get-involved/partner' },
    { name: 'Become a Mentor', href: '/get-involved/mentor' },
    { name: 'Apply as Mentee', href: '/get-involved/mentee' },
    { name: 'Volunteer', href: '/get-involved/volunteer' },
    { name: 'Support AODI', href: '/support' },
  ],
  about: [
    { name: 'About AODI', href: '/about' },
    { name: 'Impact', href: '/impact' },
    { name: 'Stories', href: '/stories' },
    { name: 'Newsroom', href: '/newsroom' },
    { name: 'Resources', href: '/resources' },
    { name: 'Governance', href: '/governance' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/policies/terms' },
    { name: 'Privacy Policy', href: '/policies/privacy' },
    { name: 'Safeguarding Policy', href: '/policies/safeguarding' },
  ],
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaToken }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setStatus('success')
        setMessage(data.message)
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong')
      }
    } catch {
      setStatus('error')
      setMessage('Failed to subscribe. Please try again.')
    }
  }

  return (
    <footer className="bg-aodi-green" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/aodi-logo.png"
                alt="AODI Logo"
                width={56}
                height={56}
                className="rounded-full"
              />
              <span className="text-white font-bold text-2xl">AODI</span>
            </div>
            <p className="text-sm leading-6 text-white/70">
              Africa of Our Dream Education Initiative — Building Africa&apos;s Next Generation of Leaders
            </p>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2 py-1 text-xs text-white/80 bg-white/10 rounded">
                UK-governed
              </span>
              <span className="inline-flex items-center px-2 py-1 text-xs text-white/80 bg-white/10 rounded">
                Africa-focused
              </span>
            </div>
            
            <div className="mt-4 space-y-2 text-sm text-white/70">
              <p className="flex items-start gap-2">
                <span className="font-medium text-white">Email:</span>
                <a href="mailto:aodi.info@africaofourdreaminitiative.org" className="hover:text-white transition-colors" data-testid="link-footer-email">
                  aodi.info@africaofourdreaminitiative.org
                </a>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-medium text-white">UK:</span>
                <span>Verulam Way, Cambridge, CB4 2HJ, United Kingdom</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-medium text-white">Nigeria:</span>
                <span>Millenium Estate, Gbagada, Lagos 100234, Nigeria</span>
              </p>
            </div>
            
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label={`Follow AODI on ${item.name}`}
                  data-testid={`link-social-${item.name.toLowerCase()}`}
                >
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3">Subscribe to our Newsletter</h3>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 text-sm rounded bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-aodi-gold"
                    required
                    data-testid="input-newsletter-email"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-4 py-2 text-sm font-medium bg-aodi-gold text-aodi-green rounded hover:bg-aodi-gold/90 disabled:opacity-50"
                    data-testid="button-newsletter-subscribe"
                  >
                    {status === 'loading' ? '...' : 'Subscribe'}
                  </button>
                </div>
                <Captcha onVerify={setCaptchaToken} />
                {message && (
                  <p className={`text-xs ${status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                    {message}
                  </p>
                )}
              </form>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Programs</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {footerLinks.programs.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-white/70 hover:text-white" data-testid={`link-footer-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Get Involved</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {footerLinks.getInvolved.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-white/70 hover:text-white" data-testid={`link-footer-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">About</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {footerLinks.about.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-white/70 hover:text-white" data-testid={`link-footer-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {footerLinks.legal.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm leading-6 text-white/70 hover:text-white" data-testid={`link-footer-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-xs leading-5 text-white/50">
            &copy; {new Date().getFullYear()} Africa of Our Dream Education Initiative. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
