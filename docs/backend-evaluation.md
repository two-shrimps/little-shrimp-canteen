# Little Shrimp Canteen 后端方案评估

> 评估日期：2026-10-22
> 对应任务：`S0.5`
> 结论：MVP 选择 Supabase，新建项目优先使用 Singapore 区域

## 1. 当前约束

MVP 后端需要支持：

- 一个登录账号和会话恢复。
- 默认私人食堂与非登录同桌档案。
- 菜谱、菜单、采购、账单和做菜记录之间的关系数据。
- 私有菜谱截图、成品照片和缩略图。
- 服务端 AI 调用、结构校验、限流与日志。
- 行级数据隔离，以及未来好友认领和食堂分组的升级空间。
- React Native + Expo 客户端。

MVP 不要求多人实时共同编辑，但需要同一账号跨设备恢复数据。

## 2. 候选比较

| 维度 | Supabase | Firebase | Appwrite |
| --- | --- | --- | --- |
| 核心数据模型 | 原生 PostgreSQL，适合当前关系与约束 | Firestore 以文档/集合为主，需要重塑关系模型 | TablesDB 可表达结构化关系，也提供独立 PostgreSQL |
| 认证 | 内置 Auth，官方有 Expo React Native 指南 | 内置 Auth，移动端生态成熟 | 内置 Auth |
| 图片存储 | Storage 与数据库 RLS 体系可统一设计 | Cloud Storage + Security Rules | Storage + 权限模型 |
| 服务端逻辑 | Edge Functions，可保护 AI 密钥 | Cloud Functions | Functions |
| 权限演进 | PostgreSQL RLS 适合从单拥有者扩展为成员关系 | Security Rules 可行，但跨集合规则更分散 | 资源级权限可行，需要适配其平台模型 |
| 数据可迁移性 | 标准 PostgreSQL，迁移路径最清楚 | Firestore 绑定较强 | 原生数据库与平台数据库需先选定抽象 |
| 当前方案匹配度 | 高 | 中 | 中 |
| 主要风险 | 无中国大陆区域；RLS 配置错误会暴露数据 | 关系查询和确定性约束复杂；成本按多项使用量计费 | 当前项目经验和生态验证较少 |

## 3. 决策

MVP 采用 Supabase，项目区域优先选择 Singapore。

理由：

1. 当前实体天然是关系模型：用餐计划、菜谱、食材、采购项来源、账单和做菜记录存在大量外键及多对多关系。PostgreSQL 可以直接表达这些约束。
2. Supabase 官方提供 Expo React Native 的认证、数据库和图片上传路径，客户端组合已有明确支持。
3. Auth、PostgreSQL、Storage 和 Edge Functions 在一个权限边界内，能减少首版基础设施数量。
4. 未来加入食堂成员时，可以扩展 `table_members` 与 RLS，而不需要迁移核心业务数据模型。
5. 标准 PostgreSQL 降低长期平台锁定风险。

Firebase 不作为默认方案，因为 MVP 的数据关系和确定性合并逻辑比离线实时文档同步更核心。Appwrite 保留为后备，但当前没有足够收益抵消更换数据与权限抽象的成本。

## 4. 成本基线

内部 MVP 先使用 Free Plan：官方当前列出的免费额度包括两个项目、每项目 500 MB 数据库、1 GB 存储、5 GB 出站流量、50,000 MAU 和 500,000 次 Edge Function 调用。该额度足以验证单账号闭环，但图片原件最可能先触及存储或出站限制。

进入持续内部试用前需要重新核对当时价格，并设置用量告警。AI 模型费用不包含在 Supabase 成本中，在 `S0.6` 单独评估。

## 5. 安全基线

- 所有暴露 schema 中的业务表默认启用 RLS。
- 客户端只配置 Supabase URL 和 publishable key；禁止放入 secret/service-role key。
- 授权依据来自不可由用户自行修改的数据，不使用 `user_metadata` 作为权限判断。
- 私有图片桶的对象路径包含食堂 ID，并通过 `table_members` 验证拥有关系。
- Storage 覆盖上传若使用 upsert，需要同时具备 `INSERT`、`SELECT` 和 `UPDATE` 策略。
- AI Provider 密钥只存在于 Edge Function secrets；图片送往模型前由服务端验证当前账号的数据访问权。
- 服务端高权限函数放在未暴露 schema，并固定 `search_path`。

## 6. 进入阶段 1 前的验证

- [ ] 从首位用户的目标手机测试 Singapore 项目的登录、读取和图片上传延迟。
- [ ] 在目标日常网络下连续测试 Wi-Fi 与蜂窝网络，不只测试开发机。
- [ ] 建立最小 RLS 测试：账号只能访问自己默认食堂的数据。
- [ ] 建立私有图片桶测试：未登录和其他账号都不能读取对象。
- [ ] 验证 Edge Function 可以安全调用候选 AI 服务且不会把密钥返回客户端。
- [ ] 在创建付费资源前重新核对价格、预算上限和数据位置要求。

如果中国大陆目标网络出现持续不可接受的失败率或延迟，暂停阶段 1 的云端接入，重新评估国内合规云服务或自托管方案；不要通过客户端重试掩盖基础网络问题。

## 7. 官方资料

- [Supabase：Expo React Native 教程](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Supabase：可用区域](https://supabase.com/docs/guides/platform/regions)
- [Supabase：计费与免费额度](https://supabase.com/docs/guides/platform/billing-on-supabase)
- [Supabase：Storage 权限控制](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase：Edge Functions 计费](https://supabase.com/docs/guides/functions/pricing)
- [Firebase：Cloud Firestore 数据模型](https://firebase.google.com/docs/firestore/data-model)
- [Appwrite：Databases](https://appwrite.io/docs/products/databases)
