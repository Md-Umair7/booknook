import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Users, ShoppingCart, DollarSign, BookOpen } from 'lucide-react'

interface Stats {
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  totalBooks: number
  recentOrders: any[]
  topCustomers: any[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalBooks: 0,
    recentOrders: [],
    topCustomers: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const [customersRes, ordersRes, booksRes, recentOrdersRes, topCustomersRes] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total, status'),
        supabase.from('books').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total, status, created_at, customers(first_name, last_name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('customers').select('id, first_name, last_name, total_spent, total_orders').order('total_spent', { ascending: false }).limit(5),
      ])

      const totalRevenue = ordersRes.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0

      setStats({
        totalCustomers: customersRes.count || 0,
        totalOrders: ordersRes.data?.length || 0,
        totalRevenue,
        totalBooks: booksRes.count || 0,
        recentOrders: recentOrdersRes.data || [],
        topCustomers: topCustomersRes.data || [],
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <div className="stat-value">{stats.totalCustomers}</div>
          <div className="stat-change positive">
            <Users size={16} style={{ display: 'inline', marginRight: 4 }} />
            Active customer base
          </div>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-change">
            <ShoppingCart size={16} style={{ display: 'inline', marginRight: 4 }} />
            All time orders
          </div>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="stat-change positive">
            <DollarSign size={16} style={{ display: 'inline', marginRight: 4 }} />
            Gross revenue
          </div>
        </div>

        <div className="stat-card">
          <h3>Books in Catalog</h3>
          <div className="stat-value">{stats.totalBooks}</div>
          <div className="stat-change">
            <BookOpen size={16} style={{ display: 'inline', marginRight: 4 }} />
            Available titles
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="card-header">Recent Orders</div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td>
                        <a href={`/orders/${order.id}`}>
                          {order.customers?.first_name} {order.customers?.last_name}
                        </a>
                      </td>
                      <td>${Number(order.total).toFixed(2)}</td>
                      <td>
                        <span className={`badge badge-${order.status}`}>{order.status}</span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Top Customers</div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                      No customers yet
                    </td>
                  </tr>
                ) : (
                  stats.topCustomers.map((customer: any) => (
                    <tr key={customer.id}>
                      <td>
                        <a href={`/customers/${customer.id}`}>
                          {customer.first_name} {customer.last_name}
                        </a>
                      </td>
                      <td>{customer.total_orders}</td>
                      <td>${Number(customer.total_spent).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
