# Cloudflare Pages 部署指南

## 🚀 快速部署步骤

### 第1步：登录 Cloudflare
1. **访问**: [pages.cloudflare.com](https://pages.cloudflare.com)
2. **登录**: 使用你的Cloudflare账号（或注册新账号）
3. **进入**: Pages 控制台

### 第2步：创建新项目
1. **点击**: "Create a project"
2. **连接**: GitHub 账号
3. **选择仓库**: `tonygu0826/fywarehouse-nextjs`

### 第3步：配置构建设置
**关键配置**:
- **项目名称**: `fywarehouse-nextjs`（自动生成 `fywarehouse-nextjs.pages.dev`）
- **生产分支**: `main`
- **构建设置**:
  - **Framework preset**: `Next.js`（Cloudflare 会自动检测）
  - **Build command**: `npm run build`
  - **Build output directory**: `.next`
  - **Node.js version**: `18`（默认）

### 第4步：环境变量配置（可选）
**如需配置以下环境变量**:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API密钥
- `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD` - 邮件SMTP配置
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics测量ID
- `NEXT_PUBLIC_GTM_ID` - Google Tag Manager ID

**配置位置**:
项目部署后 → Settings → Environment variables

### 第5步：部署
1. **点击**: "Save and Deploy"
2. **等待**: 构建完成（约3-5分钟）
3. **获得**: 预览地址 `https://fywarehouse-nextjs.pages.dev`

## ⚙️ 项目配置详情

### 已配置的安全头
项目包含 `_headers` 文件，自动配置以下安全头:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy`（完整的CSP策略）
- 其他安全头

### 重定向配置
`_redirects` 文件包含:
- API路由转发
- XML站点地图代理（指向原站sitemap）

### Next.js 配置
- **框架**: Next.js 14.2.30
- **构建输出**: `.next` 目录
- **图片优化**: 支持原站CDN图片
- **安全头**: 内置安全配置

## 🧪 部署后验证

### 功能测试清单
✅ **基本功能**:
- 首页加载（标题: FY Warehouse | Montreal Sufferance Warehouse）
- Logo和导航正常工作
- 5个服务模块完整显示（原站CDN图片）
- 联系表单字段显示正常
- 地图占位符显示（坐标: 45.458763122558594, -73.71878051757812）

✅ **响应式测试**:
- 桌面端布局完整
- 移动端（727px以下）单列布局

✅ **生产特性**:
- HTTPS自动启用
- 全球CDN加速
- 安全头配置正确

### 测试地址
- **主页**: `https://fywarehouse-nextjs.pages.dev`
- **API健康检查**: `https://fywarehouse-nextjs.pages.dev/api/contact/health`
- **API测试**: `https://fywarehouse-nextjs.pages.dev/api/contact/test`

## 🔧 故障排除

### 常见问题

#### 1. 构建失败
- **检查**: 构建日志中的错误信息
- **本地验证**: 运行 `npm run build` 确保通过
- **Node版本**: 确保使用 Node.js 18+

#### 2. 图片加载问题
- **原因**: 原站CDN图片可能需要CORS配置
- **检查**: 确保 `user-assets.sxlcdn.com` 在CSP中允许

#### 3. API路由404
- **检查**: `_redirects` 文件是否正确配置
- **验证**: API路由是否在 `.next` 构建输出中

#### 4. 环境变量不生效
- **解决**: 在Cloudflare Pages环境变量中重新配置
- **重启**: 重新部署使环境变量生效

## 📊 性能优化

### Cloudflare Pages 优势
- **全球CDN**: 内容在边缘网络缓存
- **自动HTTPS**: SSL证书自动配置
- **无限流量**: Cloudflare Pages完全免费
- **快速部署**: 构建和部署速度快

### 缓存策略
- **静态资源**: 长期缓存（31536000秒）
- **API路由**: 无缓存（no-store）
- **图片**: WebP/AVIF格式优化

## 🔄 后续更新

### 自动部署
- 每次推送到 `main` 分支自动触发重新部署
- 预览分支支持（Pull Request预览）

### 自定义域名
如需绑定 `fywarehouse.com`:
1. Cloudflare Pages → 项目 → Custom domains
2. 添加自定义域名
3. 在域名注册商处配置DNS指向Cloudflare

## 📞 技术支持

### 需要帮助？
- **查看部署日志**: Cloudflare Pages项目 → Deployments → 点击部署 → Logs
- **检查配置**: 确保构建命令和输出目录正确
- **环境变量**: 确认所有必需的环境变量已设置

### 项目状态
- ✅ **代码**: 100%完成（12天开发成果）
- ✅ **GitHub**: 完整推送
- ✅ **Cloudflare配置**: 已准备就绪
- ⏳ **等待部署**: 完成Cloudflare Pages配置后立即上线

---

**预计部署时间**: 3-5分钟  
**预览地址**: `https://fywarehouse-nextjs.pages.dev`  
**项目状态**: 随时可部署 🚀