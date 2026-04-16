'use client'

import Link from 'next/link'
import { ShoppingCart, Star, Package } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/lib/types'
import { useState } from 'react'

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    setAdding(true)
    await addToCart(product.id)
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const imageUrl = product.images?.[0] || null

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Package className="w-16 h-16" />
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Featured
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {product.brand && (
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">{product.brand}</p>
          )}
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.original_price && (
              <span className="text-sm text-gray-400 line-through">${product.original_price.toFixed(2)}</span>
            )}
          </div>

          {/* Stock indicator */}
          <div className="flex items-center justify-between">
            <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className={`mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200
              ${product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
              }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {adding ? 'Adding...' : added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}
