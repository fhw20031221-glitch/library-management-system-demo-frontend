import http from './http'

export function login(data) {
  return http.post('/auth/login', data)
}

export function me() {
  return http.get('/auth/me')
}
