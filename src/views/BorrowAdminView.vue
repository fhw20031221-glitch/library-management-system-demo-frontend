<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <h2>借阅审批</h2>
        <p>处理读者提交的借阅申请</p>
      </div>
    </div>

    <div class="toolbar">
      <el-select v-model="query.status" class="toolbar-select" placeholder="申请状态" clearable>
        <el-option label="待审批" value="PENDING" />
        <el-option label="已通过" value="APPROVED" />
        <el-option label="已拒绝" value="REJECTED" />
        <el-option label="已归还" value="RETURNED" />
      </el-select>
      <el-button :icon="Search" type="primary" plain @click="load">查询</el-button>
      <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
    </div>

    <div class="table-panel">
      <el-table v-loading="loading" :data="rows" stripe>
        <el-table-column prop="bookTitle" label="图书" min-width="170" />
        <el-table-column prop="isbn" label="ISBN" width="150" />
        <el-table-column prop="nickname" label="申请人" width="130" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(borrowStatusMap, row.status)" effect="light">
              {{ statusText(borrowStatusMap, row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="借出日期" width="120">
          <template #default="{ row }">{{ formatDate(row.borrowDate) }}</template>
        </el-table-column>
        <el-table-column label="归还期限" width="120">
          <template #default="{ row }">{{ formatDate(row.dueDate) }}</template>
        </el-table-column>
        <el-table-column label="申请时间" width="190">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button :icon="View" size="small" @click="goDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              :icon="Check"
              size="small"
              type="success"
              @click="openApproval(row, true)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              :icon="Close"
              size="small"
              type="danger"
              plain
              @click="openApproval(row, false)"
            >
              拒绝
            </el-button>
            <el-button
              v-if="row.status === 'APPROVED'"
              :icon="Finished"
              size="small"
              type="primary"
              plain
              @click="returnBook(row)"
            >
              归还
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

    <el-dialog v-model="approvalDialogVisible" :title="approvalForm.approved ? '审批通过' : '审批拒绝'" width="520px">
      <el-form :model="approvalForm" label-width="88px">
        <el-form-item label="图书">
          <el-input v-model="approvalForm.bookTitle" disabled />
        </el-form-item>
        <el-form-item label="申请人">
          <el-input v-model="approvalForm.nickname" disabled />
        </el-form-item>
        <el-form-item label="归还期限">
          <el-input v-model="approvalForm.dueDate" disabled />
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input v-model="approvalForm.comment" type="textarea" :rows="4" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approvalDialogVisible = false">取消</el-button>
        <el-button :type="approvalForm.approved ? 'success' : 'danger'" :loading="saving" @click="submitApproval">
          确认
        </el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, Finished, Refresh, Search, View } from '@element-plus/icons-vue'
import { approveBorrowApplication, listBorrowApplications, returnBorrowBook } from '../api/borrow'
import { borrowStatusMap, formatDate, formatDateTime, statusText, statusType } from '../utils/status'

const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({
  current: 1,
  size: 10,
  status: ''
})

const approvalDialogVisible = ref(false)
const approvalForm = reactive({
  id: null,
  approved: true,
  bookTitle: '',
  nickname: '',
  dueDate: '',
  comment: ''
})

onMounted(load)

async function load() {
  loading.value = true
  try {
    const data = await listBorrowApplications(query)
    rows.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.current = 1
  query.status = ''
  load()
}

function goDetail(row) {
  router.push(`/borrow/${row.id}`)
}

function openApproval(row, approved) {
  approvalForm.id = row.id
  approvalForm.approved = approved
  approvalForm.bookTitle = row.bookTitle
  approvalForm.nickname = row.nickname
  approvalForm.dueDate = row.dueDate || ''
  approvalForm.comment = approved ? '同意借阅，请按期归还。' : ''
  approvalDialogVisible.value = true
}

async function submitApproval() {
  saving.value = true
  try {
    await approveBorrowApplication(approvalForm.id, {
      approved: approvalForm.approved,
      comment: approvalForm.comment
    })
    ElMessage.success('审批已提交')
    approvalDialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function returnBook(row) {
  await ElMessageBox.confirm(`确认登记《${row.bookTitle}》已归还？`, '归还登记')
  await returnBorrowBook(row.id)
  ElMessage.success('归还已登记')
  load()
}
</script>
