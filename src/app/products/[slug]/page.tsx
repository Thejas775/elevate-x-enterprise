'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, Package, Star, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '@/lib/types'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const supabase = createClient()
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .single()

      setProduct(data)

      if (data?.category_id) {
        const { data: related } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .limit(4)
        setRelatedProducts(related || [])
      }
      setLoading(false)
    }
    fetchProduct()
  }, [slug, supabase])

  const handleAddToCart = async () => {
    if (!product) return
    setAdding(true)
    await addToCart(product.id, quantity)
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-700">Product not found</h1>
        <Link href="/products" className="mt-4 text-blue-600 hover:underline flex items-center gap-1 justify-center">
          <ArrowLeft className="w-4 h-4" /> Back to products
        </Link>
      </div>
    )
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const images = product.images?.length > 0 ? product.images : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-blue-600">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-800 truncate max-w-48">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Image Gallery */}
        <div>
          <div className="relative bg-gray-100 rounded-xl overflow-hidden h-96 mb-3">
            {images.length > 0 ? (
              <>
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-6"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImage(i => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package className="w-24 h-24" />
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-blue-500' : 'border-gray-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.brand && (
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">{product.brand}</p>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
            {product.original_price && (
              <span className="text-xl text-gray-400 line-through">${product.original_price.toFixed(2)}</span>
            )}
            {discount > 0 && (
              <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded-full">
                Save {discount}%
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>
              </>
            ) : (
              <span className="text-red-500 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
          )}

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-gray-100 text-lg font-medium"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold min-w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 hover:bg-gray-100 text-lg font-medium"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-base transition-all
                  ${added ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                <ShoppingCart className="w-5 h-5" />
                {adding ? 'Adding...' : added ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-500" /> Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-500 block">{key}</span>
                    <span className="text-sm font-medium text-gray-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <Link key={p.id} href={`/products/${p.slug}`} className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="h-full w-full object-contain p-2" />
                  ) : (
                    <Package className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600">{p.name}</p>
                <p className="text-base font-bold text-gray-900 mt-1">${p.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
