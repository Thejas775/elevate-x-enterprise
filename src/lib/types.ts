export type Category = {
  id: string
  name: string
  slug: string
  image_url: string | null
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  original_price: number | null
  stock: number
  category_id: string | null
  images: string[]
  brand: string | null
  specs: Record<string, string> | null
  featured: boolean
  created_at: string
  category?: Category
}

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  is_admin: boolean
  created_at: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  user_id: string
  status: OrderStatus
  total: number
  shipping_address: string | null
  created_at: string
  order_items?: OrderItem[]
  profile?: Profile
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product?: Product
}

export type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  product?: Product
}

export type CartContextType = {
  items: CartItem[]
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  total: number
  count: number
}
