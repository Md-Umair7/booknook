import { useEffect, useState } from 'react'
import { Plus, Search, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Order, Customer, Book } from '../types'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    customer_id: '',
    status: 'pending',
    shipping_address: '',
    notes: '',
    items: [{ book_id: '', quantity: 1 }] as { book_id: string; quantity: number }[],
  })

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
    fetchBooks()
  }, [searchQuery, statusFilter])

  async function fetchOrders() {
    try {
      let query = supabase
        .from('orders')
        .select('*, customers(first_name, last_name)')
        .order('created_at', { ascending: false })

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) throw error

      let filtered = data || []
      if (searchQuery) {
        filtered = filtered.filter(
          (o: any) =>
            o.customers?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customers?.last_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      setOrders(filtered)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('*').order('first_name')
    if (data) setCustomers(data)
  }

  async function fetchBooks() {
    const { data } = await supabase.from('books').select('*').gt('stock_quantity', 0).order('title')
    if (data) setBooks(data)
  }

  function calculateTotal() {
    return formData.items.reduce((sum, item) => {
      const book = books.find((b) => b.id === item.book_id)
      return sum + (book ? book.price * item.quantity : 0)
    }, 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const subtotal = calculateTotal()
      const tax = subtotal * 0.08
      const total = subtotal + tax

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_id: formData.customer_id,
            status: formData.status,
            subtotal,
            tax,
            total,
            shipping_address: formData.shipping_address,
            notes: formData.notes,
          },
        ])
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = formData.items
        .filter((item) => item.book_id)
        .map((item) => {
          const book = books.find((b) => b.id === item.book_id)
          return {
            order_id: order.id,
            book_id: item.book_id,
            quantity: item.quantity,
            unit_price: book?.price || 0,
          }
        })

      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
        if (itemsError) throw itemsError
      }

      // Update customer stats
      const customer = customers.find((c) => c.id === formData.customer_id)
      if (customer) {
        await supabase
          .from('customers')
          .update({
            total_orders: customer.total_orders + 1,
            total_spent: customer.total_spent + total,
          })
          .eq('id', formData.customer_id)
      }

      setShowModal(false)
      setFormData({
        customer_id: '',
        status: 'pending',
        shipping_address: '',
        notes: '',
        items: [{ book_id: '', quantity: 1 }],
      })
      fetchOrders()
      fetchCustomers()
    } catch (error: any) {
      alert(error.message)
    }
  }

  function addItem() {
    setFormData({
      ...formData,
      items: [...formData.items, { book_id: '', quantity: 1 }],
    })
  }

  function removeItem(index: number) {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  function updateItem(index: number, field: 'book_id' | 'quantity', value: string) {
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' ? parseInt(value) || 1 : value
    }
    setFormData({ ...formData, items: newItems })
  }

  async function updateStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
      if (error) throw error
      fetchOrders()
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Orders</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          New Order
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-content" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}
            />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                border: '1px solid var(--gray-300)',
                borderRadius: 8,
                fontSize: '0.875rem',
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.625rem 0.875rem',
              border: '1px solid var(--gray-300)',
              borderRadius: 8,
              fontSize: '0.875rem',
              minWidth: 150,
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    Loading...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id}>
                    <td>
                      <Link to={`/orders/${order.id}`}>{order.id.slice(0, 8)}...</Link>
                    </td>
                    <td>
                      <Link to={`/customers/${order.customer_id}`}>
                        {order.customers?.first_name} {order.customers?.last_name}
                      </Link>
                    </td>
                    <td>${Number(order.total).toFixed(2)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: 9999,
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          background:
                            order.status === 'pending'
                              ? 'var(--warning-500)'
                              : order.status === 'processing'
                                ? 'var(--primary-500)'
                                : order.status === 'shipped'
                                  ? 'var(--primary-700)'
                                  : order.status === 'delivered'
                                    ? 'var(--success-500)'
                                    : 'var(--gray-500)',
                          color: 'white',
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Order</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Customer</label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    required
                  >
                    <option value="">Select customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.first_name} {c.last_name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Shipping Address</label>
                  <input
                    type="text"
                    value={formData.shipping_address}
                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Order Items</label>
                  {formData.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <select
                        value={item.book_id}
                        onChange={(e) => updateItem(index, 'book_id', e.target.value)}
                        style={{ flex: 1 }}
                      >
                        <option value="">Select book...</option>
                        {books.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.title} - ${b.price.toFixed(2)} ({b.stock_quantity} in stock)
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        style={{ width: 70 }}
                      />
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeItem(index)}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
                    + Add Item
                  </button>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>

                <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Subtotal:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Tax (8%):</span>
                    <span>${(calculateTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 700,
                      borderTop: '1px solid var(--gray-300)',
                      paddingTop: '0.5rem',
                    }}
                  >
                    <span>Total:</span>
                    <span>${(calculateTotal() * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
