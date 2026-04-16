'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Save } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function AccountPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' })

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm({ full_name: data.full_name || '', phone: data.phone || '', address: data.address || '' })
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({ id: user.id, ...form })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    setSaving(false)
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-16 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <User className="w-7 h-7 text-blue-600" /> My Account
      </h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">{profile?.full_name || 'User'}</h2>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            {profile?.is_admin && (
              <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">Admin</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Address</label>
            <textarea
              rows={3}
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors
              ${success ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : success ? '✓ Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
