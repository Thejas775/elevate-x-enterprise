import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, Tags } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex-shrink-0">
        <div className="p-4 border-b border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Admin Panel</p>
          <p className="text-sm font-bold text-white mt-1">Elevate X</p>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-700">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors text-sm">
              ← Back to Store
            </Link>
          </div>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
