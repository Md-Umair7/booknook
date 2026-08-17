import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2, Book } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Book as BookType } from '../types'

const COVER_IMAGES = [
  'https://covers.openlibrary.org/b/id/10521470-L.jpg',
  'https://covers.openlibrary.org/b/id/8385211-L.jpg',
  'https://covers.openlibrary.org/b/id/10522455-L.jpg',
  'https://covers.openlibrary.org/b/id/10522344-L.jpg',
  'https://covers.openlibrary.org/b/id/10522479-L.jpg',
  'https://covers.openlibrary.org/b/id/10522321-L.jpg',
  'https://covers.openlibrary.org/b/id/10522492-L.jpg',
  'https://covers.openlibrary.org/b/id/10522388-L.jpg',
]

export default function Books() {
  const [books, setBooks] = useState<BookType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState<BookType | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    price: '',
    stock_quantity: '',
    genre: '',
    description: '',
    cover_image_url: '',
    posted_by: '',
  })

  useEffect(() => {
    fetchBooks()
  }, [searchQuery, genreFilter])

  async function fetchBooks() {
    try {
      let query = supabase.from('books').select('*').order('title')

      if (genreFilter) {
        query = query.eq('genre', genreFilter)
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query
      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingBook(null)
    setFormData({
      title: '',
      author: '',
      isbn: '',
      price: '',
      stock_quantity: '',
      genre: '',
      description: '',
      cover_image_url: COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)],
      posted_by: '',
    })
    setShowModal(true)
  }

  function openEditModal(book: BookType) {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      price: book.price.toString(),
      stock_quantity: book.stock_quantity.toString(),
      genre: book.genre || '',
      description: book.description || '',
      cover_image_url: book.cover_image_url || '',
      posted_by: book.posted_by || '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const bookData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
      }

      if (editingBook) {
        const { error } = await supabase
          .from('books')
          .update({ ...bookData, updated_at: new Date().toISOString() })
          .eq('id', editingBook.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('books').insert([bookData])
        if (error) throw error
      }
      setShowModal(false)
      fetchBooks()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function deleteBook(id: string) {
    if (!confirm('Are you sure you want to delete this book?')) return

    try {
      const { error } = await supabase.from('books').delete().eq('id', id)
      if (error) throw error
      fetchBooks()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const genres = [...new Set(books.map((b) => b.genre).filter(Boolean))] as string[]

  return (
    <div>
      <div className="page-header">
        <h2>Books</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Add Book
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
              placeholder="Search by title or author..."
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
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            style={{
              padding: '0.625rem 0.875rem',
              border: '1px solid var(--gray-300)',
              borderRadius: 8,
              fontSize: '0.875rem',
              minWidth: 150,
            }}
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <Book size={48} />
          <p>No books found</p>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-cover">
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title} />
                ) : (
                  <Book size={48} />
                )}
              </div>
              <div className="book-info">
                <div className="book-title">{book.title}</div>
                <div className="book-author">by {book.author}</div>
                <div className="book-posted">Posted by {book.posted_by || 'Unknown'}</div>
                <div className="book-price">${book.price.toFixed(2)}</div>
                <div className="book-stock">{book.stock_quantity} in stock</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(book)} style={{ flex: 1 }}>
                    <Edit size={14} />
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteBook(book.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBook ? 'Edit Book' : 'New Book'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>ISBN</label>
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Genre</label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Posted By</label>
                  <input
                    type="text"
                    value={formData.posted_by}
                    onChange={(e) => setFormData({ ...formData, posted_by: e.target.value })}
                    placeholder="Name of person listing this book"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBook ? 'Save Changes' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
