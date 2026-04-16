'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit, X, Check } from 'lucide-react'
import type { Category } from '@/lib/types'

export default function AdminCategoriesPage() {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [adding, setAdding] = useState(false)

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetch() }, [fetch])

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAdding(true)
    await supabase.from('categories').insert({ name: newName.trim(), slug: generateSlug(newName) })
    setNewName('')
    await fetch()
    setAdding(false)
  }

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return
    await supabase.from('categories').update({ name: editName.trim(), slug: generateSlug(editName) }).eq('id', id)
    setEditId(null)
    await fetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await supabase.from('categories').delete().eq('id', id)
    await fetch()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Categories</h1>

      {/* Add new */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Add New Category</h2>
        <div className="flex gap-2">
          <input
            placeholder="Category name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleAdd} disabled={adding || !newName.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" /></div>
        ) : categories.length === 0 ? (
          <div className="py-10 text-center text-gray-400">No categories yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map(cat => (
              <div key={cat.id} className="px-5 py-3 flex items-center gap-3">
                {editId === cat.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 border border-blue-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => handleEdit(cat.id)} className="p-1 text-green-600 hover:text-green-800"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditId(null)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-gray-800">{cat.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{cat.slug}</span>
                    <button onClick={() => { setEditId(cat.id); setEditName(cat.name) }} className="p-1 text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
