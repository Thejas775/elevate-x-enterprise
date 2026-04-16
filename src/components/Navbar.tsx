'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/context/CartContext'
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react'
import Image from 'next/image'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const { count } = useCart()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('categories').select('id, name, slug').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        setIsAdmin(data?.is_admin || false)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()
        setIsAdmin(data?.is_admin || false)
      } else {
        setIsAdmin(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/products', label: 'All Products' },
    ...categories.map(c => ({ href: `/products?category=${c.slug}`, label: c.name })),
  ]

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center h-16 py-2">
            <Image src="/logo.png" alt="Elevate X Enterprise" width={100} height={40} className="object-contain h-full w-auto" />
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search laptops, GPUs, RAM..."
                className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 hover:text-blue-400 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1 p-2 hover:text-blue-400 transition-colors">
                  <User className="w-6 h-6" />
                </button>
                <div className="absolute right-0 mt-1 w-44 bg-gray-800 rounded-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-700 rounded-t-lg">My Account</Link>
                  <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-gray-700">My Orders</Link>
                  {isAdmin && <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-700 text-blue-400">Admin Panel</Link>}
                  <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-red-400 rounded-b-lg">Sign Out</button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Sign In
              </Link>
            )}

            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom nav links — desktop */}
      <div className="hidden md:block bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium transition-colors hover:text-blue-400 ${pathname === link.href ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-300'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-4 space-y-2">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="block py-2 text-sm text-gray-300 hover:text-blue-400" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
