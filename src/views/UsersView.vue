<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <h2>用户管理</h2>
        <p>维护管理员和普通读者账户</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">新增用户</el-button>
    </div>

    <div class="toolbar">
      <el-input
        v-model="query.keyword"
        class="toolbar-input"
        placeholder="用户名 / 昵称"
        clearable
        @keyup.enter="load"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="query.role" class="toolbar-select" placeholder="角色" clearable>
        <el-option label="管理员" value="ADMIN" />
        <el-option label="普通用户" value="READER" />
      </el-select>
      <el-select v-model="query.status" class="toolbar-select" placeholder="状态" clearable>
        <el-option label="启用" value="ENABLED" />
        <el-option label="禁用" value="DISABLED" />
      </el-select>
      <el-button :icon="Search" type="primary" plain @click="load">查询</el-button>
      <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
    </div>

    <div class="table-panel">
      <el-table v-loading="loading" :data="rows" stripe>
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="nickname" label="昵称" width="140" />
        <el-table-column label="角色" width="110">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'success'" effect="light">
              {{ row.role === 'ADMIN' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(userStatusMap, row.status)" effect="light">
              {{ statusText(userStatusMap, row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="createdAt" label="创建时间" width="190" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button :icon="Edit" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button :icon="Key" size="small" @click="openPassword(row)">重置密码</el-button>
            <el-button
              :icon="row.status === 'ENABLED' ? Close : Check"
              size="small"
              :type="row.status === 'ENABLED' ? 'warning' : 'success'"
              plain
              @click="toggleStatus(row)"
            >
              {{ row.status === 'ENABLED' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="query.current"
          v-model:page-size="query.size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="load"
          @size-change="load"
        />
      </div>
    </div>

    <el-dialog v-model="userDialogVisible" :title="userForm.id ? '编辑用户' : '新增用户'" width="560px">
      <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="88px">
        <el-form-item label="用户名" prop="username" v-if="!userForm.id">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="初始密码" prop="password" v-if="!userForm.id">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="userForm.role" class="full-control">
                <el-option label="管理员" value="ADMIN" />
                <el-option label="普通用户" value="READER" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="userForm.status" class="full-control">
                <el-option label="启用" value="ENABLED" />
                <el-option label="禁用" value="DISABLED" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="手机号">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordDialogVisible" title="重置密码" width="420px">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="88px">
        <el-form-item label="用户">
          <el-input v-model="passwordForm.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="passwordForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="savePassword">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, Edit, Key, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { createUser, listUsers, resetUserPassword, updateUser, updateUserStatus } from '../api/users'
import { statusText, statusType, userStatusMap } from '../utils/status'

const loading = ref(false)
const saving = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({
  current: 1,
  size: 10,
  keyword: '',
  role: '',
  status: ''
})

const userDialogVisible = ref(false)
const userFormRef = ref()
const userForm = reactive(createEmptyUser())
const userRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
}

const passwordDialogVisible = ref(false)
const passwordFormRef = ref()
const passwordForm = reactive({
  id: null,
  username: '',
  password: ''
})
const passwordRules = {
  password: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
}

onMounted(load)

async function load() {
  loading.value = true
  try {
    const data = await listUsers(query)
    rows.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.current = 1
  query.keyword = ''
  query.role = ''
  query.status = ''
  load()
}

function createEmptyUser() {
  return {
    id: null,
    username: '',
    password: '',
    nickname: '',
    role: 'READER',
    status: 'ENABLED',
    phone: '',
    email: ''
  }
}

function fillUserForm(row = null) {
  Object.assign(userForm, row ? { ...row, password: '' } : createEmptyUser())
}

function openCreate() {
  fillUserForm()
  userDialogVisible.value = true
}

function openEdit(row) {
  fillUserForm(row)
  userDialogVisible.value = true
}

async function saveUser() {
  await userFormRef.value.validate()
  saving.value = true
  try {
    if (userForm.id) {
      await updateUser(userForm.id, userForm)
      ElMessage.success('用户已更新')
    } else {
      await createUser(userForm)
      ElMessage.success('用户已新增')
    }
    userDialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

function openPassword(row) {
  passwordForm.id = row.id
  passwordForm.username = row.username
  passwordForm.password = ''
  passwordDialogVisible.value = true
}

async function savePassword() {
  await passwordFormRef.value.validate()
  saving.value = true
  try {
    await resetUserPassword(passwordForm.id, { password: passwordForm.password })
    ElMessage.success('密码已重置')
    passwordDialogVisible.value = false
  } finally {
    saving.value = false
  }
}

async function toggleStatus(row) {
  const nextStatus = row.status === 'ENABLED' ? 'DISABLED' : 'ENABLED'
  await ElMessageBox.confirm(`确认${nextStatus === 'ENABLED' ? '启用' : '禁用'}用户 ${row.username}？`, '更新状态')
  await updateUserStatus(row.id, { status: nextStatus })
  ElMessage.success('用户状态已更新')
  load()
}
</script>
