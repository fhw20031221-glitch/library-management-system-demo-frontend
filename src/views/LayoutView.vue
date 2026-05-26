<template>
  <el-container class="app-layout">
    <el-aside width="232px" class="sidebar">
      <div class="sidebar-title">
        <div class="brand-mark small">L</div>
        <span>图书管理系统</span>
      </div>
      <el-menu router :default-active="route.path" class="sidebar-menu">
        <el-menu-item index="/books">
          <el-icon><Reading /></el-icon>
          <span>图书管理</span>
        </el-menu-item>
        <el-menu-item v-if="isAdmin" index="/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item v-if="isAdmin" index="/borrow">
          <el-icon><Tickets /></el-icon>
          <span>借阅审批</span>
        </el-menu-item>
        <el-menu-item v-if="isReader" index="/my-borrow">
          <el-icon><DocumentChecked /></el-icon>
          <span>我的申请</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="topbar">
        <div>
          <div class="topbar-title">{{ pageTitle }}</div>
          <div class="topbar-subtitle">{{ roleText }}</div>
        </div>
        <div class="topbar-user">
          <el-tag :type="isAdmin ? 'danger' : 'success'" effect="light">
            {{ authState.user?.role }}
          </el-tag>
          <span>{{ authState.user?.nickname || authState.user?.username }}</span>
          <el-button :icon="SwitchButton" circle title="退出登录" @click="logout" />
        </div>
      </el-header>
      <el-main class="content">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DocumentChecked, Reading, SwitchButton, Tickets, User } from '@element-plus/icons-vue'
import { authState, clearAuth } from '../store/auth'

const route = useRoute()
const router = useRouter()

const isAdmin = computed(() => authState.user?.role === 'ADMIN')
const isReader = computed(() => authState.user?.role === 'READER')
const roleText = computed(() => (isAdmin.value ? '管理员工作台' : '读者工作台'))
const pageTitle = computed(() => route.meta.title || route.matched.at(-1)?.name || '工作台')

function logout() {
  clearAuth()
  router.replace('/login')
}
</script>
