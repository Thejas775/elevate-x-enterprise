'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react'
import type { Product } from '@/lib/types'

export default function AdminProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('products').select('*, category:categories(name)').order('created_at', { ascending: false })
    if (search) query = query.ilike('name', `%${search}%`)
    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }, [supabase, search])

  useEffect(() => { fetch() }, [fetch])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    setDeleting(id)
    await supabase.from('products').delete().eq('id', id)
    await fetch()
    setDeleting(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link href="/admin/products/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" /></div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No products found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Stock</th>
                <th className="px-6 py-3 text-left">Featured</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-contain p-1" />
                        ) : <Package className="w-full h-full text-gray-300 p-2" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-xs">{product.name}</p>
                        {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{(product.category as {name:string} | null)?.name || '—'}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.featured ? <span className="text-yellow-500">⭐</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${product.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
