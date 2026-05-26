# 图书管理系统 Demo - 前端

这是图书管理系统 Demo 的前端项目，基于 Vue 3、Vite 和 Element Plus 实现。项目采用前后端分离方式开发，通过 Axios 调用后端接口，并使用 JWT Token 完成登录鉴权。

后端仓库：<https://github.com/fhw20031221-glitch/library-management-system-demo-backend>

## 技术栈

- Vue 3
- Vite
- Element Plus
- Vue Router
- Axios
- JavaScript

## 功能说明

- 登录页：支持管理员和普通用户登录。
- 主布局：根据角色展示不同菜单。
- 图书管理：
  - 管理员可以新增、编辑、删除图书。
  - 普通用户可以浏览图书并提交借阅申请。
- 用户管理：管理员可以维护用户、状态和密码。
- 借阅审批：管理员可以查看全部申请并审批通过或拒绝。
- 我的申请：普通用户可以查看自己的申请状态和详情。
- 申请详情：展示图书、申请人、审批意见、借出日期、应还日期和归还状态。

## 目录结构

```text
src
  api/       Axios 请求封装
  router/    前端路由和角色过滤
  store/     登录状态和本地 Token 管理
  utils/     状态映射工具
  views/     页面组件
```

## 本地运行

### 1. 安装依赖

```powershell
npm install
```

### 2. 启动开发服务

```powershell
npm run dev
```

默认访问地址：

```text
http://127.0.0.1:5173
```

### 3. 后端要求

后端需要先启动，并运行在：

```text
http://localhost:8080
```

Vite 已配置代理：

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## 默认账号

```text
管理员：admin / admin123
普通用户：reader / reader123
```

## 构建

```powershell
npm run build
```

构建产物会输出到：

```text
dist/
```

## 权限说明

前端通过路由 `meta.roles` 和本地登录状态控制菜单与页面访问。该控制只用于提升用户体验，真正的权限校验仍由后端接口完成。

## 说明

这是学习阶段 Demo 项目，适合用于理解 Vue 前后端分离开发、Element Plus 页面搭建、Axios 请求封装和 JWT 登录流程。
