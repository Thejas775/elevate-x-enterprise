'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Package } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [error, setError] = useState('')

  const shipping = total >= 99 ? 0 : 9.99
  const grandTotal = total + shipping

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/checkout')
      return
    }

    const shippingAddress = `${form.full_name}, ${form.address}, ${form.city}, ${form.state} ${form.zip}, ${form.country}`

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total: grandTotal,
        shipping_address: shippingAddress,
      })
      .select()
      .single()

    if (orderError || !order) {
      setError('Failed to create order. Please try again.')
      setSubmitting(false)
      return
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product?.price || 0,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      setError('Failed to save order items. Please contact support.')
      setSubmitting(false)
      return
    }

    // Update stock
    for (const item of items) {
      await supabase.rpc('decrement_stock', {
        product_id: item.product_id,
        amount: item.quantity,
      })
    }

    await clearCart()
    setOrderId(order.id)
    setSuccess(true)
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-green-50 rounded-2xl p-10 border border-green-200">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-2">Thank you for your order. We'll send a confirmation to your email.</p>
          <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-100 px-3 py-2 rounded-lg">Order ID: {orderId.slice(0, 8).toUpperCase()}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/account/orders" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              View Orders
            </Link>
            <Link href="/products" className="border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-700 mb-4">Your cart is empty</h1>
        <Link href="/products" className="text-blue-600 hover:underline">Start shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input required name="full_name" value={form.full_name} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input required type="email" name="email" value={form.email} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input required name="address" value={form.address} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input required name="city" value={form.city} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input required name="state" value={form.state} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                <input required name="zip" value={form.zip} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select name="country" value={form.country} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="IN">India</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-sm text-blue-800">
            💳 <strong>Payment:</strong> This is a demo store. No real payment is collected. Orders are placed in "pending" status.
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-base transition-colors disabled:opacity-60"
          >
            {submitting ? 'Placing Order...' : `Place Order — $${grandTotal.toFixed(2)}`}
          </button>
        </form>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-gray-800">{item.product?.name}</p>
                    <p className="text-gray-500">×{item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-800">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-gray-900 pt-1 border-t border-gray-200">
                <span>Total</span><span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
