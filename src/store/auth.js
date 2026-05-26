import { reactive } from 'vue'

const AUTH_TOKEN_KEY = 'library_token'
const AUTH_USER_KEY = 'library_user'
const storage = sessionStorage
const savedUser = storage.getItem(AUTH_USER_KEY)

export const authState = reactive({
  token: storage.getItem(AUTH_TOKEN_KEY) || '',
  user: savedUser ? JSON.parse(savedUser) : null
})

export function setAuth(payload) {
  authState.token = payload.token
  authState.user = payload.user
  storage.setItem(AUTH_TOKEN_KEY, payload.token)
  storage.setItem(AUTH_USER_KEY, JSON.stringify(payload.user))
}

export function clearAuth() {
  authState.token = ''
  authState.user = null
  storage.removeItem(AUTH_TOKEN_KEY)
  storage.removeItem(AUTH_USER_KEY)
}

export function hasRole(roles = []) {
  if (!roles.length) {
    return true
  }
  return authState.user && roles.includes(authState.user.role)
}
