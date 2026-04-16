'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/ProductCard'
import { Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import type { Product, Category } from '@/lib/types'

const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A-Z' },
]

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const search = searchParams.get('search') || ''
  const categorySlug = searchParams.get('category') || ''
  const featured = searchParams.get('featured') || ''
  const sort = searchParams.get('sort') || 'created_at_desc'
  const minPrice = searchParams.get('min') || ''
  const maxPrice = searchParams.get('max') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const PER_PAGE = 12

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }, [supabase])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })

    if (search) query = query.ilike('name', `%${search}%`)
    if (featured) query = query.eq('featured', true)
    if (minPrice) query = query.gte('price', parseFloat(minPrice))
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice))

    if (categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    const [col, dir] = sort.split('_')
    const orderCol = col === 'created' ? 'created_at' : col
    query = query.order(orderCol, { ascending: dir === 'asc' })

    const from = (page - 1) * PER_PAGE
    query = query.range(from, from + PER_PAGE - 1)

    const { data, count } = await query
    setProducts(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [supabase, search, categorySlug, featured, sort, minPrice, maxPrice, page])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {search ? `Results for "${search}"` : categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => updateParams({ sort: e.target.value })}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</h3>
              <button
                onClick={() => router.push('/products')}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Category</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={!categorySlug}
                    onChange={() => updateParams({ category: '' })}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={categorySlug === cat.slug}
                      onChange={() => updateParams({ category: cat.slug })}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => updateParams({ min: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => updateParams({ max: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Featured */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!featured}
                  onChange={e => updateParams({ featured: e.target.checked ? 'true' : '' })}
                  className="text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Featured Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 h-80 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-5xl mb-4">🔍</p>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term</p>
              <button onClick={() => router.push('/products')} className="mt-4 text-blue-600 hover:underline">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => updateParams({ page: String(p) })}
                      className={`px-4 py-2 border rounded-lg text-sm ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <ProductsContent />
    </Suspense>
  )
}
