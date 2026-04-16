'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { items, loading, removeFromCart, updateQuantity, total } = useCart()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors">
          Continue Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <ShoppingCart className="w-7 h-7 text-blue-600" /> Shopping Cart
        <span className="text-base font-normal text-gray-500">({items.length} items)</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
              {/* Image */}
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {item.product?.images?.[0] ? (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product?.slug}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                  {item.product?.name}
                </Link>
                {item.product?.brand && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.product.brand}</p>
                )}
                <p className="text-blue-600 font-bold mt-1">${item.product?.price.toFixed(2)}</p>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-100">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 py-1 text-sm font-semibold min-w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-100">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-800">
                  ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={total >= 99 ? 'text-green-600' : ''}>
                  {total >= 99 ? 'FREE' : '$9.99'}
                </span>
              </div>
              {total < 99 && (
                <p className="text-xs text-blue-600 bg-blue-50 rounded px-3 py-2">
                  Add ${(99 - total).toFixed(2)} more for free shipping!
                </p>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base text-gray-900">
                <span>Total</span>
                <span>${(total + (total >= 99 ? 0 : 9.99)).toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl font-semibold transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link href="/products" className="block text-center text-blue-600 hover:underline text-sm mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
