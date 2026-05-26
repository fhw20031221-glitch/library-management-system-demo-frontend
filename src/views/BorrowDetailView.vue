<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <h2>申请详情</h2>
        <p>查看图书、申请人、审批和归还信息</p>
      </div>
      <div class="heading-actions">
        <el-button :icon="ArrowLeft" @click="router.back()">返回</el-button>
        <el-button
          v-if="detail?.status === 'APPROVED'"
          :icon="Finished"
          type="primary"
          plain
          @click="returnBook"
        >
          登记归还
        </el-button>
      </div>
    </div>

    <div class="detail-panel" v-loading="loading">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="申请编号">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(borrowStatusMap, detail.status)" effect="light">
            {{ statusText(borrowStatusMap, detail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="图书">{{ detail.bookTitle }}</el-descriptions-item>
        <el-descriptions-item label="ISBN">{{ detail.isbn }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ detail.bookAuthor || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detail.nickname || detail.username }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ detail.createdAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审批时间">{{ detail.approvedAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="借出日期">{{ detail.borrowDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="归还期限">{{ detail.dueDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="归还日期">{{ detail.returnDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updatedAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请说明" :span="2">
          {{ detail.reason || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="审批意见" :span="2">
          {{ detail.approvalComment || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="暂无详情" />
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Finished } from '@element-plus/icons-vue'
import { getBorrowApplication, returnBorrowBook } from '../api/borrow'
import { borrowStatusMap, statusText, statusType } from '../utils/status'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const detail = ref(null)

onMounted(load)

async function load() {
  loading.value = true
  try {
    detail.value = await getBorrowApplication(route.params.id)
  } finally {
    loading.value = false
  }
}

async function returnBook() {
  await ElMessageBox.confirm(`确认登记《${detail.value.bookTitle}》已归还？`, '归还登记')
  await returnBorrowBook(detail.value.id)
  ElMessage.success('归还已登记')
  load()
}
</script>
