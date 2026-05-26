<template>
  <main class="login-page">
    <section class="login-shell">
      <div class="login-brand">
        <div class="brand-mark">L</div>
        <h1>图书管理系统</h1>
        <p>管理员与读者分角色使用</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" class="login-form" @keyup.enter="submit">
        <el-form-item prop="username">
          <el-input v-model="form.username" size="large" placeholder="用户名" clearable>
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" size="large" type="password" placeholder="密码" show-password>
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-button type="primary" size="large" :loading="loading" class="login-button" @click="submit">
          登录
        </el-button>
      </el-form>

      <div class="demo-accounts">
        <span>admin / admin123</span>
        <span>reader / reader123</span>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { login } from '../api/auth'
import { setAuth } from '../store/auth'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function submit() {
  await formRef.value.validate()
  loading.value = true
  try {
    const data = await login(form)
    setAuth(data)
    ElMessage.success('登录成功')
    router.replace('/books')
  } finally {
    loading.value = false
  }
}
</script>
