import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import { ArrowRight, Cpu } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('featured', true)
    .gt('stock', 0)
    .limit(8)

  const { data: latestProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .gt('stock', 0)
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-blue-600/30 text-blue-300 text-sm font-medium px-3 py-1 rounded-full mb-4 border border-blue-500/30">
                🚀 New Arrivals Every Week
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                Power Your World with{' '}
                <span className="text-blue-400">Premium Tech</span>
              </h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Discover the latest laptops, desktops, GPUs, and accessories. From gaming rigs to workstations — we have everything you need to elevate your setup.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors flex items-center gap-2"
                >
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/products?featured=true"
                  className="border border-gray-600 hover:border-blue-400 hover:text-blue-400 text-gray-300 px-8 py-3 rounded-xl font-semibold text-lg transition-colors"
                >
                  View Deals
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <div className="w-56 h-56 bg-blue-600/30 rounded-full flex items-center justify-center border border-blue-400/30">
                    <Cpu className="w-28 h-28 text-blue-400 opacity-80" />
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute top-4 -left-8 bg-white text-gray-800 rounded-xl px-3 py-2 text-xs font-semibold shadow-xl">
                  🔥 RTX 4090 In Stock!
                </div>
                <div className="absolute bottom-8 -right-4 bg-blue-600 text-white rounded-xl px-3 py-2 text-xs font-semibold shadow-xl">
                  ⚡ Same Day Shipping
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-500 mt-1">Find exactly what you need</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories?.map(({ id, name, slug }) => (
            <Link
              key={id}
              href={`/products?category=${slug}`}
              className="group bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 hover:shadow-md transition-all duration-200"
            >
              <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">{name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="bg-gray-100 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">⭐ Featured Products</h2>
                <p className="text-gray-500 mt-1">Hand-picked top deals</p>
              </div>
              <Link href="/products?featured=true" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 text-sm">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      {latestProducts && latestProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🆕 New Arrivals</h2>
              <p className="text-gray-500 mt-1">Fresh stock just added</p>
            </div>
            <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Upgrade Your Setup?</h2>
          <p className="text-blue-100 text-lg mb-8">Join thousands of happy customers. Free shipping on orders over $99.</p>
          <Link
            href="/products"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 py-4 rounded-xl text-lg transition-colors inline-flex items-center gap-2"
          >
            Browse All Products <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
