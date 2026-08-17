import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Order } from '../types'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchOrder()
  }, [id])

  async function fetchOrder() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          '*, customers(id, first_name, last_name, email, phone), order_items(id, quantity, unit_price, books(id, title, author))'
        )
        .eq('id', id)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!order) {
    return <div className="empty-state">Order not found</div>
  }

  return (
    <div>
      <Link to="/orders" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      <div className="detail-header">
        <div className="detail-title">
          <div>
            <h2>Order {order.id.slice(0, 8)}</h2>
            <div className="detail-meta">
              <span className={`badge badge-${order.status}`}>{order.status}</span>
              <span style={{ marginLeft: '0.75rem' }}>
                Created {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="card-header">Customer</div>
          <div className="card-content">
            {order.customer && (
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                  <Link to={`/customers/${order.customer.id}`}>
                    {order.customer.first_name} {order.customer.last_name}
                  </Link>
                </p>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{order.customer.email}</p>
                {order.customer.phone && (
                  <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{order.customer.phone}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Shipping Address</div>
          <div className="card-content">
            {order.shipping_address ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={18} style={{ color: 'var(--gray-400)', marginTop: 2 }} />
                <span>{order.shipping_address}</span>
              </div>
            ) : (
              <span style={{ color: 'var(--gray-400)' }}>No shipping address provided</span>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">Order Items</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Author</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order as any).order_items?.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                    No items
                  </td>
                </tr>
              ) : (
                (order as any).order_items?.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.books?.title || 'Unknown Book'}</td>
                    <td>{item.books?.author || '-'}</td>
                    <td>{item.quantity}</td>
                    <td>${Number(item.unit_price).toFixed(2)}</td>
                    <td>${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">Order Summary</div>
        <div className="card-content">
          <div style={{ maxWidth: 300, marginLeft: 'auto' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                color: 'var(--gray-600)',
              }}
            >
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                color: 'var(--gray-600)',
              }}
            >
              <span>Tax</span>
              <span>${Number(order.tax).toFixed(2)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                fontSize: '1.25rem',
                borderTop: '1px solid var(--gray-200)',
                paddingTop: '0.75rem',
                marginTop: '0.5rem',
              }}
            >
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">Notes</div>
          <div className="card-content">
            <p style={{ color: 'var(--gray-600)', whiteSpace: 'pre-wrap' }}>{order.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}
