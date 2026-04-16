'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CartItem, CartContextType } from '@/lib/types'

const CartContext = createContext<CartContextType>({
  items: [],
  loading: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  total: 0,
  count: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchCart = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setItems([])
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
    setItems(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchCart()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCart()
    })
    return () => subscription.unsubscribe()
  }, [fetchCart, supabase])

  const addToCart = async (productId: string, quantity = 1) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth/login'
      return
    }
    const existing = items.find(i => i.product_id === productId)
    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: productId, quantity })
    }
    await fetchCart()
  }

  const removeFromCart = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId)
    await fetchCart()
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
    await fetchCart()
  }

  const clearCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    setItems([])
  }

  const total = items.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity
  }, 0)

  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
