export interface Book {
  id: string
  title: string
  author: string
  isbn: string | null
  price: number
  stock_quantity: number
  genre: string | null
  description: string | null
  cover_image_url: string | null
  posted_by: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  notes: string | null
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  book_id: string
  quantity: number
  unit_price: number
  book?: Book
}

export interface Order {
  id: string
  customer_id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  tax: number
  total: number
  shipping_address: string | null
  notes: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  items?: OrderItem[]
}
