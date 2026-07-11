# Vercel 环境变量配置指南

## 方法一：Vercel Dashboard（推荐，最简单）

1. 打开 [vercel.com](https://vercel.com)，进入你的项目
2. 点击左侧导航栏的 **Settings** → **Environment Variables**
3. 点击 **Add New**
4. 逐个添加：

| Name | Value | Environment |
|------|-------|-------------|
| `AIRTABLE_API_KEY` | `patxxxxxxxxxxxxxxxx` | Production, Preview, Development |
| `AIRTABLE_BASE_ID` | `appxxxxxxxxxxxxxx` | Production, Preview, Development |
| `NEXT_PUBLIC_MIRROR_SITES` | `y2u.be,vidplay.me` | Production, Preview, Development |

5. 点击 **Save**
6. **重新部署**项目（Settings → Deployments → Redeploy）

> ⚠️ **环境变量修改后必须重新部署才会生效！**

## 方法二：Vercel CLI（命令行）

如果你本地安装了 Vercel CLI：

```bash
# 安装 CLI（如果还没装）
npm i -g vercel

# 登录
vercel login

# 进入项目目录
cd D:\AI\Chelsea的知识库\frontend

# 添加环境变量
vercel env add AIRTABLE_API_KEY production
# 粘贴你的 API Key

vercel env add AIRTABLE_BASE_ID production
# 粘贴你的 Base ID

# 也可以一次性添加到所有环境
vercel env add AIRTABLE_API_KEY all
```

## 方法三：通过 .env.local 文件（仅限本地开发）

**不要**把 `.env.local` 提交到 Git！

1. 确保 `frontend/.env.local` 已在 `.gitignore` 中：
   ```
   # .gitignore
   .env.local
   node_modules/
   ```

2. 本地开发时，Vercel 会自动读取 `.env.local`

3. 部署到 Vercel 后，**.env.local 不会被使用**，必须在 Dashboard 或 CLI 中配置

## 验证配置是否生效

在你的 Next.js 代码中创建一个测试页面：

```typescript
// app/test-env/page.tsx
export default function TestEnv() {
  return (
    <div>
      <h1>环境变量测试</h1>
      <p>AIRTABLE_BASE_ID: {process.env.AIRTABLE_BASE_ID ? '✅ 已配置' : '❌ 未配置'}</p>
      <p>AIRTABLE_API_KEY: {process.env.AIRTABLE_API_KEY ? '✅ 已配置' : '❌ 未配置'}</p>
    </div>
  )
}
```

访问 `/test-env` 页面检查是否显示 ✅

## 安全提示

- **不要**在 GitHub 上提交包含真实 API Key 的代码
- `AIRTABLE_API_KEY` 是敏感信息，只在服务端 API Route 中使用
- `NEXT_PUBLIC_` 前缀的环境变量会被编译到客户端代码中，不要用它暴露敏感信息
- 建议为开发环境和生产环境使用不同的 API Key
