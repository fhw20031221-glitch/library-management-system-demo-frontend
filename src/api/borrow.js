import http from './http'

export function createBorrowApplication(data) {
  return http.post('/borrow-applications', data)
}

export function listMyBorrowApplications(params) {
  return http.get('/borrow-applications/my', { params })
}

export function listBorrowApplications(params) {
  return http.get('/borrow-applications', { params })
}

export function getBorrowApplication(id) {
  return http.get(`/borrow-applications/${id}`)
}

export function approveBorrowApplication(id, data) {
  return http.patch(`/borrow-applications/${id}/approve`, data)
}

export function returnBorrowBook(id) {
  return http.patch(`/borrow-applications/${id}/return`)
}
