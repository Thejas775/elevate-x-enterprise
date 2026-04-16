'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Plus, X } from 'lucide-react'
import Link from 'next/link'
import type { Category } from '@/lib/types'

export default function ProductFormPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const isNew = id === 'new'

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    stock: '0',
    category_id: '',
    brand: '',
    featured: false,
    images: [] as string[],
    specs: {} as Record<string, string>,
  })
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecVal, setNewSpecVal] = useState('')

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }, [supabase])

  const fetchProduct = useCallback(async () => {
    if (isNew) return
    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    if (data) {
      setForm({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        price: String(data.price || ''),
        original_price: String(data.original_price || ''),
        stock: String(data.stock || 0),
        category_id: data.category_id || '',
        brand: data.brand || '',
        featured: data.featured || false,
        images: data.images || [],
        specs: data.specs || {},
      })
    }
    setLoading(false)
  }, [id, isNew, supabase])

  useEffect(() => {
    fetchCategories()
    fetchProduct()
  }, [fetchCategories, fetchProduct])

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      if (name === 'name') {
        setForm(f => ({ ...f, name: value, slug: generateSlug(value) }))
      } else {
        setForm(f => ({ ...f, [name]: value }))
      }
    }
  }

  const addImage = () => {
    if (!newImageUrl.trim()) return
    setForm(f => ({ ...f, images: [...f.images, newImageUrl.trim()] }))
    setNewImageUrl('')
  }

  const removeImage = (i: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
  }

  const addSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return
    setForm(f => ({ ...f, specs: { ...f.specs, [newSpecKey]: newSpecVal } }))
    setNewSpecKey('')
    setNewSpecVal('')
  }

  const removeSpec = (key: string) => {
    const { [key]: _, ...rest } = form.specs
    setForm(f => ({ ...f, specs: rest }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      description: form.description || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      stock: parseInt(form.stock),
      category_id: form.category_id || null,
      brand: form.brand || null,
      featured: form.featured,
      images: form.images,
      specs: Object.keys(form.specs).length > 0 ? form.specs : null,
    }

    if (isNew) {
      const { error } = await supabase.from('products').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('products').update(payload).eq('id', id)
      if (error) { setError(error.message); setSaving(false); return }
    }

    router.push('/admin/products')
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Add Product' : 'Edit Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input required name="name" value={form.name} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} name="description" value={form.description} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category_id" value={form.category_id} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— None —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="featured" checked={form.featured}
              onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="rounded text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Featured product</span>
          </label>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Pricing & Stock</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
              <input required type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($)</label>
              <input type="number" step="0.01" min="0" name="original_price" value={form.original_price} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input required type="number" min="0" name="stock" value={form.stock} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Product Images</h2>
          <p className="text-xs text-gray-500">Add image URLs (from Supabase Storage, Unsplash, etc.)</p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={addImage} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {form.images.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {form.images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-20 h-20 object-contain bg-gray-100 rounded-lg border border-gray-200" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Specifications</h2>
          <div className="flex gap-2">
            <input placeholder="Key (e.g. RAM)" value={newSpecKey} onChange={e => setNewSpecKey(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Value (e.g. 16GB)" value={newSpecVal} onChange={e => setNewSpecVal(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={addSpec} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {Object.entries(form.specs).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-800">{v}</span>
              <button type="button" onClick={() => removeSpec(k)} className="text-red-400 hover:text-red-600 ml-2">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
          </button>
          <Link href="/admin/products" className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
