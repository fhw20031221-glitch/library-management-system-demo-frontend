import { createRouter, createWebHistory } from 'vue-router'
import { authState, hasRole } from '../store/auth'
import LoginView from '../views/LoginView.vue'
import LayoutView from '../views/LayoutView.vue'
import BooksView from '../views/BooksView.vue'
import UsersView from '../views/UsersView.vue'
import BorrowAdminView from '../views/BorrowAdminView.vue'
import MyBorrowView from '../views/MyBorrowView.vue'
import BorrowDetailView from '../views/BorrowDetailView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/',
      component: LayoutView,
      redirect: '/books',
      children: [
        { path: 'books', name: 'books', component: BooksView, meta: { title: '图书管理', roles: ['ADMIN', 'READER'] } },
        { path: 'users', name: 'users', component: UsersView, meta: { title: '用户管理', roles: ['ADMIN'] } },
        { path: 'borrow', name: 'borrow', component: BorrowAdminView, meta: { title: '借阅审批', roles: ['ADMIN'] } },
        { path: 'my-borrow', name: 'myBorrow', component: MyBorrowView, meta: { title: '我的申请', roles: ['READER'] } },
        { path: 'borrow/:id', name: 'borrowDetail', component: BorrowDetailView, meta: { title: '申请详情', roles: ['ADMIN', 'READER'] } }
      ]
    }
  ]
})

router.beforeEach((to) => {
  if (to.name === 'login') {
    return authState.token ? '/books' : true
  }
  if (!authState.token) {
    return '/login'
  }
  const roles = to.meta.roles || []
  if (!hasRole(roles)) {
    return '/books'
  }
  return true
})

export default router
