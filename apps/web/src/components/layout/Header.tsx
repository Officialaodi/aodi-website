'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, Heart, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchResult {
  id: number
  title: string
  description: string | null
  type: string
  url: string
}

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Programs', href: '/programs' },
  { name: 'Impact', href: '/impact' },
  { name: 'Partners', href: '/partners' },
  { name: 'Get Involved', href: '/get-involved' },
  { name: 'About', href: '/about' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        setSearchResults(data.results || [])
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }
    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleResultClick = () => {
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      event: 'Event',
      program: 'Program',
      story: 'Story',
      resource: 'Resource',
      trustee: 'Trustee',
      director: 'Leadership',
      page: 'Page',
    }
    return labels[type] || type
  }

  return (
    <header className="bg-aodi-green sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-3" data-testid="link-home-logo">
            <Image
              src="/images/aodi-logo.png"
              alt="AODI Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl leading-tight">AODI</span>
              <span className="text-white/80 text-[10px] leading-tight hidden sm:block">Africa of Our Dream Education Initiative</span>
            </div>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
            onClick={() => setMobileMenuOpen(true)}
            data-testid="button-mobile-menu-open"
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-6 lg:items-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              data-testid={`link-nav-${item.name.toLowerCase().replace(' ', '-')}`}
            >
              {item.name}
            </Link>
          ))}
          
          <div className="relative" ref={searchRef}>
            {searchOpen ? (
              <div className="flex items-center">
                <div className="relative">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-64 h-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
                    data-testid="input-search"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 animate-spin" />
                  )}
                </div>
                <button
                  onClick={() => {
                    setSearchOpen(false)
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="ml-2 text-white/70 hover:text-white"
                  data-testid="button-search-close"
                >
                  <X className="h-5 w-5" />
                </button>
                
                {(searchResults.length > 0 || (searchQuery.length >= 2 && !isSearching)) && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                    {searchResults.length > 0 ? (
                      <ul className="py-2 max-h-96 overflow-y-auto">
                        {searchResults.map((result) => (
                          <li key={`${result.type}-${result.id}`}>
                            <Link
                              href={result.url}
                              onClick={handleResultClick}
                              className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                              data-testid={`link-search-result-${result.id}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-aodi-gold bg-aodi-gold/10 px-2 py-0.5 rounded">
                                  {getTypeLabel(result.type)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-1">
                                {result.title}
                              </p>
                              {result.description && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                  {result.description}
                                </p>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="text-white/70 hover:text-white transition-colors p-1"
                aria-label="Search"
                data-testid="button-search-open"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-2 lg:items-center">
          <Link href="/get-involved/partner" data-testid="link-cta-partner">
            <Button variant="outlineLight" size="sm">
              Partner
            </Button>
          </Link>
          <Link href="/get-involved/mentor" data-testid="link-cta-mentor">
            <Button variant="outlineLight" size="sm">
              Mentor
            </Button>
          </Link>
          <Link href="/support" data-testid="link-cta-support">
            <Button variant="gold" size="sm" className="font-semibold">
              <Heart className="h-4 w-4 mr-1 fill-current" />
              Support Us
            </Button>
          </Link>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-aodi-green px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                <Image
                  src="/images/aodi-logo.png"
                  alt="AODI Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <span className="text-white font-bold text-xl leading-tight">AODI</span>
                  <span className="text-white/80 text-[10px] leading-tight">Africa of Our Dream Education Initiative</span>
                </div>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-white"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-mobile-menu-close"
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-white/10">
                <div className="py-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search programs, events, stories..."
                      className="w-full h-10 pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      data-testid="input-mobile-search"
                    />
                  </div>
                  {searchQuery.length >= 2 && (
                    <div className="mt-2 bg-white rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                      {isSearching ? (
                        <div className="px-4 py-4 text-center">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto text-aodi-green" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        <ul>
                          {searchResults.map((result) => (
                            <li key={`mobile-${result.type}-${result.id}`}>
                              <Link
                                href={result.url}
                                onClick={() => {
                                  handleResultClick()
                                  setMobileMenuOpen(false)
                                }}
                                className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                              >
                                <span className="text-xs font-medium text-aodi-gold bg-aodi-gold/10 px-2 py-0.5 rounded">
                                  {getTypeLabel(result.type)}
                                </span>
                                <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-1">
                                  {result.title}
                                </p>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-4 text-center text-sm text-gray-500">
                          No results found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-medium text-white hover:bg-aodi-green/80"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`link-mobile-nav-${item.name.toLowerCase().replace(' ', '-')}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6 space-y-3">
                  <Link href="/support" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="gold" className="w-full font-semibold">
                      <Heart className="h-4 w-4 mr-1 fill-current" />
                      Support Us
                    </Button>
                  </Link>
                  <Link href="/get-involved/partner" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outlineLight" className="w-full mt-3">
                      Partner
                    </Button>
                  </Link>
                  <Link href="/get-involved/mentor" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outlineLight" className="w-full mt-3">
                      Mentor
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
