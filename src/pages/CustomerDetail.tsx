import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, DollarSign, ShoppingCart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Customer, Order } from '../types'

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchCustomer()
  }, [id])

  async function fetchCustomer() {
    try {
      const [customerRes, ordersRes] = await Promise.all([
        supabase.from('customers').select('*').eq('id', id).single(),
        supabase
          .from('orders')
          .select('*, order_items(quantity, unit_price, books(title, author))')
          .eq('customer_id', id)
          .order('created_at', { ascending: false }),
      ])

      if (customerRes.data) setCustomer(customerRes.data)
      if (ordersRes.data) setOrders(ordersRes.data)
    } catch (error) {
      console.error('Error fetching customer:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!customer) {
    return <div className="empty-state">Customer not found</div>
  }

  return (
    <div>
      <Link to="/customers" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} />
        Back to Customers
      </Link>

      <div className="detail-header">
        <div className="detail-title">
          <div>
            <h2>
              {customer.first_name} {customer.last_name}
            </h2>
            <div className="detail-meta">Customer since {new Date(customer.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="card-header">Customer Information</div>
          <div className="card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={18} style={{ color: 'var(--gray-400)' }} />
                <span>{customer.email}</span>
              </div>
              {customer.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Phone size={18} style={{ color: 'var(--gray-400)' }} />
                  <span>{customer.phone}</span>
                </div>
              )}
              {(customer.address || customer.city) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={18} style={{ color: 'var(--gray-400)' }} />
                  <span>
                    {customer.address}
                    {customer.address && customer.city && ', '}
                    {customer.city}
                    {customer.state && `, ${customer.state}`}
                    {customer.zip_code && ` ${customer.zip_code}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Order Statistics</div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  <ShoppingCart size={16} />
                  Total Orders
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  {customer.total_orders}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  <DollarSign size={16} />
                  Total Spent
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
                  ${customer.total_spent.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {customer.notes && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">Notes</div>
          <div className="card-content">
            <p style={{ color: 'var(--gray-600)', whiteSpace: 'pre-wrap' }}>{customer.notes}</p>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">Order History</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link to={`/orders/${order.id}`}>{order.id.slice(0, 8)}...</Link>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${order.status}`}>{order.status}</span>
                    </td>
                    <td>
                      {(order as any).order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0} items
                    </td>
                    <td>${Number(order.total).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
