'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp, Package, MessageCircle } from 'lucide-react'
import type { Order, OrderStatus } from '@/lib/types'

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminOrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('*, profiles(full_name, email), order_items(*, product:products(name, images))')
      .order('created_at', { ascending: false })
    if (filterStatus !== 'all') query = query.eq('status', filterStatus)
    const { data } = await query
    setOrders(data || [])
    setLoading(false)
  }, [supabase, filterStatus])

  useEffect(() => { fetch() }, [fetch])

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    await fetch()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Filter:</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" /></div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-gray-400"><Package className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No orders</p></div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map(order => (
              <div key={order.id}>
                {/* Row */}
                <div className="px-6 py-4 flex items-center gap-4">
                  <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="text-gray-400 hover:text-gray-600">
                    {expanded === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-mono text-gray-500 text-xs">#{(order.id as string).slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <p className="text-gray-800 font-medium">{(order as any).profiles?.full_name || 'Unknown'}</p>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <p className="text-xs text-gray-400">{(order as any).profiles?.email}</p>
                      {order.whatsapp_number && (
                        <a
                          href={`https://wa.me/${order.whatsapp_number.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1 text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          <MessageCircle className="w-3 h-3" />
                          {order.whatsapp_number}
                        </a>
                      )}
                    </div>
                    <div className="font-bold text-gray-900">${order.total.toFixed(2)}</div>
                    <div>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.status]}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {expanded === order.id && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</p>
                        <div className="space-y-2">
                          {order.order_items?.map(item => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 bg-white rounded border border-gray-200 flex-shrink-0 overflow-hidden">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(item as any).product?.images?.[0] ? (
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  <img src={(item as any).product.images[0]} alt="" className="w-full h-full object-contain p-0.5" />
                                ) : <Package className="w-full h-full text-gray-300 p-1" />}
                              </div>
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              <span className="text-gray-700">{(item as any).product?.name} ×{item.quantity}</span>
                              <span className="text-gray-500 ml-auto">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Shipping Address</p>
                        <p className="text-sm text-gray-700">{order.shipping_address || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
