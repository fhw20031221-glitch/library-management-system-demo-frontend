import http from './http'

export function listBooks(params) {
  return http.get('/books', { params })
}

export function createBook(data) {
  return http.post('/books', data)
}

export function updateBook(id, data) {
  return http.put(`/books/${id}`, data)
}

export function deleteBook(id) {
  return http.delete(`/books/${id}`)
}
