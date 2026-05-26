export const userStatusMap = {
  ENABLED: { text: '启用', type: 'success' },
  DISABLED: { text: '禁用', type: 'info' }
}

export const bookStatusMap = {
  NORMAL: { text: '正常', type: 'success' },
  DISABLED: { text: '停用', type: 'info' }
}

export const borrowStatusMap = {
  PENDING: { text: '待审批', type: 'warning' },
  APPROVED: { text: '已通过', type: 'success' },
  REJECTED: { text: '已拒绝', type: 'danger' },
  RETURNED: { text: '已归还', type: 'info' }
}

export function statusText(map, value) {
  return map[value]?.text || value || '-'
}

export function statusType(map, value) {
  return map[value]?.type || 'info'
}

export function formatDate(value) {
  if (!value) {
    return '-'
  }
  return String(value).slice(0, 10)
}

export function formatDateTime(value) {
  if (!value) {
    return '-'
  }
  return String(value).replace('T', ' ').slice(0, 19)
}
