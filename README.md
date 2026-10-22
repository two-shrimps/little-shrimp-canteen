# Little Shrimp Canteen｜小虾食堂

面向情侣和小家庭的私人餐桌 App：把菜谱截图整理成可执行的菜单、采购清单和做菜记录。MVP 采用单登录账号与可选同桌档案，先跑通“导入—菜单—采购—记录”闭环。

## 技术栈

- React Native 0.88 + React 19
- Expo SDK 58 + Expo Router
- TypeScript 6
- Supabase（PostgreSQL、Auth、Storage、RLS）

## 本地开发

需要 Node.js `24.18.0`。使用 NVM 时：

```bash
nvm use
npm install
npm start
```

按平台启动：

```bash
npm run ios
npm run android
npm run web
```

## 质量检查

```bash
npm run lint
npm run typecheck
npx expo-doctor
npx expo export --platform all
```

## 项目结构

```text
src/                  App 路由、页面、组件和状态
assets/               App 构建使用的图标、图片和设计素材
supabase/             数据库 schema、RLS 与 Storage 策略
docs/                 产品、设计、实施、评测、原型和预览资料
app.json              Expo 应用配置
package.json          依赖与开发命令
```

`src/app/capabilities.tsx` 是内部原生能力诊断页，用于真机验收相册、相机、图片压缩和系统分享，不是面向用户的正式业务入口。

## 当前状态

- App 工程已位于仓库根目录，后续功能直接在此开发。
- Expo Router 四项底部导航、核心视觉页面、设置与同桌档案交互已可运行。
- iOS 模拟器、Web/iOS/Android 生产 bundle、ESLint、TypeScript 和 Expo Doctor 已通过。
- Supabase 登录、数据持久化、Storage 与 RLS 集成尚待接入测试项目验证。
- 真实手机相册、相机、图片压缩、系统分享及 Android 运行态仍待验收。

## 产品与工程文档

| 文档 | 内容 |
| --- | --- |
| [产品原型](docs/product-prototype.md) | 产品定位、用户流程、关键页面与 MVP |
| [实施记录](docs/implementation-practice.md) | 路线图、任务状态、技术决策与实践日志 |
| [数据模型](docs/data-model.md) | 核心实体、关系、约束和权限模型 |
| [后端评估](docs/backend-evaluation.md) | 后端选择、成本与安全基线 |
| [视觉规范](docs/visual-style.md) | 色彩、排版、组件、摄影和动效 |
| [竞品分析](docs/competitive-analysis.md) | 市场、竞品、机会与风险 |
| [首轮 Expo 原型记录](docs/expo-first-prototype.md) | 客户端选型验证和未验证边界 |

当前产品原型：[小虾食堂 · 产品原型 v1](https://www.figma.com/design/Qz8gtoyMivG5AQ5DuYnzYL/%E5%B0%8F%E8%99%BE%E9%A3%9F%E5%A0%82-%C2%B7-%E4%BA%A7%E5%93%81%E5%8E%9F%E5%9E%8B-v1?node-id=10-26)
