import { reactive } from 'vue'

const savedUser = localStorage.getItem('library_user')

export const authState = reactive({
  token: localStorage.getItem('library_token') || '',
  user: savedUser ? JSON.parse(savedUser) : null
})

export function setAuth(payload) {
  authState.token = payload.token
  authState.user = payload.user
  localStorage.setItem('library_token', payload.token)
  localStorage.setItem('library_user', JSON.stringify(payload.user))
}

export function clearAuth() {
  authState.token = ''
  authState.user = null
  localStorage.removeItem('library_token')
  localStorage.removeItem('library_user')
}

export function hasRole(roles = []) {
  if (!roles.length) {
    return true
  }
  return authState.user && roles.includes(authState.user.role)
}
