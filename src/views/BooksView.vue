<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <h2>图书管理</h2>
        <p>维护馆藏信息、库存和借阅入口</p>
      </div>
      <el-button v-if="isAdmin" type="primary" :icon="Plus" @click="openCreate">
        新增图书
      </el-button>
    </div>

    <div class="toolbar">
      <el-input
        v-model="query.keyword"
        class="toolbar-input"
        placeholder="书名 / 作者 / ISBN"
        clearable
        @keyup.enter="load"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="query.status" class="toolbar-select" placeholder="状态" clearable>
        <el-option label="正常" value="NORMAL" />
        <el-option label="停用" value="DISABLED" />
      </el-select>
      <el-button :icon="Search" type="primary" plain @click="load">查询</el-button>
      <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
    </div>

    <div class="table-panel">
      <el-table v-loading="loading" :data="rows" stripe>
        <el-table-column prop="title" label="书名" min-width="180" />
        <el-table-column prop="author" label="作者" width="140" />
        <el-table-column prop="isbn" label="ISBN" width="150" />
        <el-table-column prop="category" label="分类" width="110" />
        <el-table-column label="库存" width="120">
          <template #default="{ row }">
            <el-tag :type="row.availableStock > 0 ? 'success' : 'danger'" effect="light">
              {{ row.availableStock }} / {{ row.totalStock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(bookStatusMap, row.status)" effect="light">
              {{ statusText(bookStatusMap, row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publisher" label="出版社" min-width="150" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="isAdmin" :icon="Edit" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="isAdmin" :icon="Delete" size="small" type="danger" plain @click="remove(row)">
              删除
            </el-button>
            <el-button
              v-if="isReader"
              :disabled="row.availableStock <= 0 || row.status !== 'NORMAL'"
              :icon="Tickets"
              size="small"
              type="primary"
              @click="openBorrow(row)"
            >
              申请
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

    <el-dialog v-model="bookDialogVisible" :title="bookForm.id ? '编辑图书' : '新增图书'" width="640px">
      <el-form ref="bookFormRef" :model="bookForm" :rules="bookRules" label-width="88px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="书名" prop="title">
              <el-input v-model="bookForm.title" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input v-model="bookForm.author" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ISBN" prop="isbn">
              <el-input v-model="bookForm.isbn" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类">
              <el-input v-model="bookForm.category" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总库存" prop="totalStock">
              <el-input-number v-model="bookForm.totalStock" :min="0" class="full-control" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="可借库存" prop="availableStock">
              <el-input-number v-model="bookForm.availableStock" :min="0" class="full-control" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="bookForm.status" class="full-control">
                <el-option label="正常" value="NORMAL" />
                <el-option label="停用" value="DISABLED" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出版社">
              <el-input v-model="bookForm.publisher" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="简介">
              <el-input v-model="bookForm.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="bookDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveBook">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="borrowDialogVisible" title="提交借阅申请" width="520px">
      <el-form ref="borrowFormRef" :model="borrowForm" :rules="borrowRules" label-width="88px">
        <el-form-item label="图书">
          <el-input v-model="borrowForm.bookTitle" disabled />
        </el-form-item>
        <el-form-item label="归还日期" prop="dueDate">
          <el-date-picker
            v-model="borrowForm.dueDate"
            class="full-control"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            placeholder="选择归还日期"
            :disabled-date="disabledDueDate"
          />
        </el-form-item>
        <el-form-item label="申请说明">
          <el-input v-model="borrowForm.reason" type="textarea" :rows="4" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="borrowDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitBorrow">提交</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Refresh, Search, Tickets } from '@element-plus/icons-vue'
import { createBook, deleteBook, listBooks, updateBook } from '../api/books'
import { createBorrowApplication } from '../api/borrow'
import { authState } from '../store/auth'
import { bookStatusMap, statusText, statusType } from '../utils/status'

const isAdmin = computed(() => authState.user?.role === 'ADMIN')
const isReader = computed(() => authState.user?.role === 'READER')
const loading = ref(false)
const saving = ref(false)
const rows = ref([])
const total = ref(0)
const query = reactive({
  current: 1,
  size: 10,
  keyword: '',
  status: ''
})

const bookDialogVisible = ref(false)
const bookFormRef = ref()
const bookForm = reactive(createEmptyBook())
const bookRules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }],
  totalStock: [{ required: true, message: '请输入总库存', trigger: 'blur' }]
}

const borrowDialogVisible = ref(false)
const borrowFormRef = ref()
const borrowForm = reactive({
  bookId: null,
  bookTitle: '',
  dueDate: '',
  reason: ''
})
const borrowRules = {
  dueDate: [{ required: true, message: '请选择归还日期', trigger: 'change' }]
}

onMounted(load)

async function load() {
  loading.value = true
  try {
    const data = await listBooks(query)
    rows.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.current = 1
  query.keyword = ''
  query.status = ''
  load()
}

function createEmptyBook() {
  return {
    id: null,
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: '',
    totalStock: 0,
    availableStock: 0,
    status: 'NORMAL',
    description: ''
  }
}

function fillBookForm(row = null) {
  Object.assign(bookForm, row ? { ...row } : createEmptyBook())
}

function openCreate() {
  fillBookForm()
  bookDialogVisible.value = true
}

function openEdit(row) {
  fillBookForm(row)
  bookDialogVisible.value = true
}

async function saveBook() {
  await bookFormRef.value.validate()
  saving.value = true
  try {
    if (bookForm.id) {
      await updateBook(bookForm.id, bookForm)
      ElMessage.success('图书已更新')
    } else {
      await createBook(bookForm)
      ElMessage.success('图书已新增')
    }
    bookDialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`确认删除《${row.title}》？`, '删除图书', { type: 'warning' })
  await deleteBook(row.id)
  ElMessage.success('图书已删除')
  load()
}

function openBorrow(row) {
  borrowForm.bookId = row.id
  borrowForm.bookTitle = row.title
  borrowForm.dueDate = defaultDueDate()
  borrowForm.reason = ''
  borrowDialogVisible.value = true
}

async function submitBorrow() {
  await borrowFormRef.value.validate()
  saving.value = true
  try {
    await createBorrowApplication({
      bookId: borrowForm.bookId,
      dueDate: borrowForm.dueDate,
      reason: borrowForm.reason
    })
    ElMessage.success('借阅申请已提交')
    borrowDialogVisible.value = false
  } finally {
    saving.value = false
  }
}

function disabledDueDate(date) {
  const value = startOfDay(date)
  const today = startOfDay(new Date())
  const maxDate = addDays(today, 30)
  return value < today || value > maxDate
}

function defaultDueDate() {
  return formatDate(addDays(startOfDay(new Date()), 30))
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date, days) {
  const value = new Date(date)
  value.setDate(value.getDate() + days)
  return value
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>
