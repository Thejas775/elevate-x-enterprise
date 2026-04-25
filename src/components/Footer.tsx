import Link from 'next/link'
import { Cpu, Mail, Phone, MapPin, Share2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-blue-400 font-bold text-xl mb-4">
              <Cpu className="w-6 h-6" />
              <span>Elevate X</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted partner for premium laptops, desktops, and computer components. Quality tech at competitive prices.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition-colors"><Share2 className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?category=laptops" className="hover:text-blue-400 transition-colors">Laptops</Link></li>
              <li><Link href="/products?category=desktops" className="hover:text-blue-400 transition-colors">Desktops</Link></li>
              <li><Link href="/products?category=components" className="hover:text-blue-400 transition-colors">Components</Link></li>
              <li><Link href="/products?category=accessories" className="hover:text-blue-400 transition-colors">Accessories</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-blue-400 transition-colors">Featured</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/login" className="hover:text-blue-400 transition-colors">Sign In</Link></li>
              <li><Link href="/auth/register" className="hover:text-blue-400 transition-colors">Create Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-blue-400 transition-colors">My Orders</Link></li>
              <li><Link href="/account" className="hover:text-blue-400 transition-colors">Profile</Link></li>
              <li><Link href="/cart" className="hover:text-blue-400 transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>J/79 Anandvan Society, Near Saket Society, Susan Tarsali Road, Vadodara</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="tel:+919773179834" className="hover:text-blue-400 transition-colors">+91 97731 79834</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="mailto:elevatexenterprise@gmail.com" className="hover:text-blue-400 transition-colors">elevatexenterprise@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Elevate X Enterprise. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
