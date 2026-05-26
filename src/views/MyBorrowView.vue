<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <h2>我的申请</h2>
        <p>查看借阅审批进度和归还状态</p>
      </div>
      <el-button :icon="Reading" type="primary" @click="router.push('/books')">去选书</el-button>
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
        <el-table-column prop="bookTitle" label="图书" min-width="180" />
        <el-table-column prop="bookAuthor" label="作者" width="140" />
        <el-table-column prop="isbn" label="ISBN" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(borrowStatusMap, row.status)" effect="light">
              {{ statusText(borrowStatusMap, row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="borrowDate" label="借出日期" width="120" />
        <el-table-column prop="dueDate" label="归还期限" width="120" />
        <el-table-column prop="createdAt" label="申请时间" width="190" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button :icon="View" size="small" @click="goDetail(row)">详情</el-button>
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
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Finished, Reading, Refresh, Search, View } from '@element-plus/icons-vue'
import { listMyBorrowApplications, returnBorrowBook } from '../api/borrow'
import { borrowStatusMap, statusText, statusType } from '../utils/status'

const router = useRouter()
const loading = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({
  current: 1,
  size: 10,
  status: ''
})

onMounted(load)

async function load() {
  loading.value = true
  try {
    const data = await listMyBorrowApplications(query)
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

async function returnBook(row) {
  await ElMessageBox.confirm(`确认归还《${row.bookTitle}》？`, '归还登记')
  await returnBorrowBook(row.id)
  ElMessage.success('归还已登记')
  load()
}
</script>
