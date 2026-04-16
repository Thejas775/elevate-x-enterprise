'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import type { Order } from '@/lib/types'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    fetch()
  }, [supabase])

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h1>
        <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
        <Link href="/products" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Package className="w-7 h-7 text-blue-600" /> My Orders
      </h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Order header */}
            <button
              className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-mono text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-900">${order.total.toFixed(2)}</span>
                {expanded === order.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {/* Order items */}
            {expanded === order.id && (
              <div className="border-t border-gray-200 px-6 py-4 space-y-3">
                {order.order_items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product?.slug}`} className="text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-1">
                        {item.product?.name}
                      </Link>
                      <p className="text-xs text-gray-500">×{item.quantity} @ ${item.price.toFixed(2)}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                {order.shipping_address && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Shipping to:</p>
                    <p className="text-sm text-gray-700 mt-0.5">{order.shipping_address}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
