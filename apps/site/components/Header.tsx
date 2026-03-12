'use client'

import Link from 'next/link'
import { useState } from 'react'

const navItems = [
  { href: '/install', label: 'Install' },
  { href: '/cli', label: 'CLI' },
  { href: '/spec', label: 'Specification' },
  { href: '/guide', label: 'Guide' },
  { href: '/about', label: 'About' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-navy-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900">
            <span className="text-sm font-bold text-amber-400">T</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-navy-900">
            Tell
          </span>
          <span className="hidden text-sm text-navy-400 sm:inline">Protocol</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-navy-600 transition-colors hover:text-navy-900"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/install"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-navy-900 transition-colors hover:bg-amber-400"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-600 transition-colors hover:bg-navy-100 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-navy-200 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-navy-600 transition-colors hover:text-navy-900"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/install"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-navy-900"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
