import { createClient } from '@/lib/supabase/server'
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: productCount }, { count: orderCount }, { count: userCount }, { data: recentOrders }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*, profiles(full_name, email)').order('created_at', { ascending: false }).limit(5),
  ])

  const { data: revenueData } = await supabase.from('orders').select('total').neq('status', 'cancelled')
  const totalRevenue = revenueData?.reduce((sum, o) => sum + o.total, 0) || 0

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const stats = [
    { label: 'Total Products', value: productCount || 0, icon: Package, color: 'bg-blue-500' },
    { label: 'Total Orders', value: orderCount || 0, icon: ShoppingBag, color: 'bg-green-500' },
    { label: 'Customers', value: userCount || 0, icon: Users, color: 'bg-purple-500' },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'bg-yellow-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`${color} text-white p-3 rounded-xl`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <a href="/admin/orders" className="text-blue-600 text-sm hover:underline">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders?.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-gray-600">#{(order.id as string).slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-gray-800">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(order as any).profiles?.full_name || (order as any).profiles?.email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
