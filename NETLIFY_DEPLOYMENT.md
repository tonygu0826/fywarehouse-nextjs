# Netlify 部署指南

## 🚀 快速部署步骤（3分钟获得预览地址）

### 第1步：登录 Netlify
1. **访问**: [netlify.com](https://netlify.com)
2. **登录**: 使用GitHub账号（推荐）或邮箱注册
3. **进入**: Dashboard

### 第2步：从GitHub导入
1. **点击**: "Add new site" → "Import an existing project"
2. **选择**: GitHub
3. **授权**: 允许Netlify访问你的GitHub账号
4. **选择仓库**: `tonygu0826/fywarehouse-nextjs`

### 第3步：自动配置
**Netlify会自动检测Next.js并配置**：
- **Build command**: `npm run build`（自动检测）
- **Publish directory**: `.next`（自动检测）
- **Base directory**: `/`（根目录）

**无需手动配置**，Netlify会读取 `netlify.toml` 文件。

### 第4步：环境变量（可选，部署后配置）
如需配置以下环境变量：
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API密钥
- `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD` - 邮件SMTP配置
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics测量ID
- `NEXT_PUBLIC_GTM_ID` - Google Tag Manager ID

**配置位置**：
部署完成后 → Site settings → Environment variables → Edit variables

### 第5步：部署
1. **点击**: "Deploy site"
2. **等待**: 构建完成（约2-3分钟）
3. **获得**: 预览地址 `https://fywarehouse-nextjs.netlify.app`

## ⚙️ 项目配置详情

### Netlify配置文件 (`netlify.toml`)
项目包含完整的Netlify配置：

#### 构建配置
```toml
[build]
  command = "npm run build"
  publish = ".next"
  NODE_VERSION = "18"
```

#### 安全头配置
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy`（完整的CSP策略，允许原站CDN图片）
- 其他安全头

#### 缓存策略
- **静态资源**: 长期缓存（31536000秒，immutable）
- **API路由**: 无缓存（no-store）
- **图片**: WebP/AVIF格式优化

#### 重定向配置
- **XML站点地图**: 代理到原站sitemap
- **客户端路由**: SPA回退支持

### Next.js 配置
- **框架**: Next.js 14.2.30
- **构建输出**: `.next` 目录
- **图片优化**: 支持原站CDN图片（`user-assets.sxlcdn.com`等）
- **API路由**: Netlify Functions支持

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
- 触摸目标大小合适

✅ **生产特性**:
- HTTPS自动启用（🔒绿色锁标志）
- 全球CDN加速（Netlify Edge Network）
- 安全头配置正确

### 测试地址
- **主页**: `https://fywarehouse-nextjs.netlify.app`
- **API健康检查**: `https://fywarehouse-nextjs.netlify.app/api/contact/health`
- **API测试**: `https://fywarehouse-nextjs.netlify.app/api/contact/test`

## 🔧 故障排除

### 常见问题

#### 1. 构建失败
- **检查**: Netlify部署日志（Deploy → Deploy details → Build logs）
- **本地验证**: 运行 `npm run build` 确保通过
- **Node版本**: Netlify使用Node.js 18（已配置）

#### 2. 图片加载问题
- **原因**: 原站CDN图片可能需要CORS配置
- **已配置**: CSP中允许 `user-assets.sxlcdn.com`、`static-assets.sxlcdn.com`等

#### 3. API路由404
- **检查**: Netlify Functions配置是否正确
- **验证**: API路由是否在 `.next/server/pages/api` 中构建

#### 4. 环境变量不生效
- **解决**: 在Netlify环境变量中重新配置
- **重启**: 重新部署使环境变量生效

## 📊 Netlify 优势

### 免费套餐特点
- **100GB带宽/月** - 足够中小型网站使用
- **300构建分钟/月** - 自动部署和预览
- **无服务器函数** - 支持API路由
- **全球CDN** - Netlify Edge Network
- **自动HTTPS** - SSL证书自动配置
- **即时缓存失效** - 内容更新立即生效

### 性能优化
- **边缘网络**: 内容在全球边缘节点缓存
- **图片优化**: 自动WebP/AVIF转换
- **预渲染**: 静态页面预生成
- **资源合并**: CSS/JS自动优化

## 🔄 后续更新

### 自动部署
- 每次推送到 `main` 分支自动触发重新部署
- 预览部署：每个Pull Request生成独立预览
- 分支部署：不同分支的独立部署

### 自定义域名
如需绑定 `fywarehouse.com`：
1. Netlify站点 → Domain settings → Custom domains
2. 添加自定义域名
3. 在域名注册商处配置DNS指向Netlify
4. Netlify自动配置SSL证书

### 环境管理
- **生产环境**: `main` 分支自动部署
- **预览环境**: Pull Request部署
- **分支环境**: 功能分支部署

## 📞 技术支持

### 需要帮助？
- **查看部署日志**: Netlify站点 → Deployments → 点击部署 → "Deploy details"
- **检查配置**: 确保 `netlify.toml` 文件存在且正确
- **环境变量**: Site settings → Environment variables

### 项目状态
- ✅ **代码**: 100%完成（12天开发成果）
- ✅ **GitHub**: 完整推送
- ✅ **Netlify配置**: 已准备就绪（`netlify.toml`）
- ⏳ **等待部署**: 完成Netlify导入后立即上线

---

**预计部署时间**: 2-3分钟  
**预览地址**: `https://fywarehouse-nextjs.netlify.app`  
**项目状态**: 随时可部署 🚀

## 🆚 Netlify vs 其他平台
| 功能 | Netlify | Vercel | Cloudflare Pages |
|------|---------|--------|------------------|
| **npm稳定性** | ✅ 稳定 | ❌ npm bug | ❌ npm bug |
| **免费额度** | 100GB/月 | 100GB/月 | 无限流量 |
| **部署速度** | 快 | 快 | 快 |
| **Next.js支持** | 优秀 | 优秀 | 优秀 |
| **推荐指数** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

**选择Netlify的原因**: npm环境稳定，无`Exit handler never called`错误，部署可靠。

---

**立即开始部署** → [netlify.com](https://netlify.com)