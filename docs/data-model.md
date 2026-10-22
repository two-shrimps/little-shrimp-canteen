# Little Shrimp Canteen 最小数据模型与权限策略

> 设计日期：2026-10-22
> 对应任务：`S0.7`
> 状态：已形成可执行草案，待 Supabase 本地环境或云端测试项目验证

## 1. 设计结论

MVP 使用“账号—食堂—业务数据”三级归属：

```text
auth.users
    │
    ├── table_members ── table_spaces
    │                         │
    │                         ├── diner_profiles
    │                         ├── recipes ── ingredients / steps / sources
    │                         ├── meal_plans ── meal_plan_recipes
    │                         ├── shopping_trips ── shopping_items ── sources
    │                         ├── cooking_records ── cooking_ratings
    │                         └── media_assets
    └── profiles
```

- 注册后通过数据库触发器自动创建个人资料、默认私人食堂和 owner 成员关系。
- MVP 每个食堂只有一个登录成员，但保留 `table_members`，以后增加好友不迁移核心业务表。
- 每张业务表直接保存 `table_space_id`。RLS 权限判断固定、查询简单，也避免沿多层关联才能判断租户。
- 复合外键同时包含 `table_space_id`，数据库会拒绝把 A 食堂的数据关联到 B 食堂。
- 主键使用 UUID，便于客户端离线创建记录；时间使用 `timestamptz`，金额使用 `numeric(12,2)`。
- 可恢复删除的核心内容使用 `deleted_at`，历史账单与记录不做级联硬删除。

可执行草案见 [`supabase/schema.sql`](../supabase/schema.sql)。

## 2. 核心不变量

1. 所有业务数据必须归属于一个食堂。
2. 任何跨实体引用必须属于同一食堂。
3. 同桌档案不是登录账号；`claimed_by_user_id` 只为未来认领预留，MVP 不开放流程。
4. 一条做菜评分的主体只能是登录账号或同桌档案之一，不能同时为空或同时存在。
5. 同一次做菜记录中，同一账号或同一同桌档案只能有一条评分。
6. 菜谱食材同时保留原始文本和可选标准化值；标准化失败不妨碍保存。
7. 计划数量、实际购买数量和实付金额分开保存。
8. 图片桶保持私有；对象路径必须匹配 `users/{user_id}/avatar/...` 或 `tables/{table_space_id}/{media_type}/...` 命名空间。
9. `profiles.display_name` 必填，去除首尾空格后为 1–20 个字符；`default_servings` 为 1–20，默认 2。
10. 账号资料在文档、SQL 和代码中统一使用 `public.profiles`。

## 3. 用户资料模型

认证身份来自 `auth.users`，可编辑展示资料来自 `public.profiles`：

| 字段 | 规则 |
| --- | --- |
| `id` | 与 `auth.users.id` 一一对应 |
| `display_name` | 必填；trim 后 1–20 个字符；允许重复 |
| `avatar_path` | 可空；只允许当前用户的头像命名空间 |
| `default_servings` | `smallint`；1–20；默认 2 |
| `created_at` / `updated_at` | 记录创建与更新时间 |

昵称不是登录凭据，也不能用于权限判断。注册触发器依次使用注册资料昵称、邮箱 `@` 前缀和“小虾”作为初始昵称，并截断到 20 个字符。

`default_servings` 只作为新菜谱详情和新建用餐计划的默认值；修改后不回写历史菜单、采购或做菜记录。

## 4. 私有媒体与头像路径

账号头像和食堂媒体共用私有桶 `private-media`，但使用不同命名空间和 RLS：

```text
users/{user_id}/avatar/{asset_id}.{ext}
tables/{table_space_id}/diner-avatars/{asset_id}.{ext}
tables/{table_space_id}/recipe-sources/{asset_id}.{ext}
tables/{table_space_id}/recipe-covers/{asset_id}.{ext}
tables/{table_space_id}/cooking-photos/{asset_id}.{ext}
tables/{table_space_id}/receipts/{asset_id}.{ext}
tables/{table_space_id}/share-cards/{asset_id}.{ext}
```

权限规则：

- 用户头像只允许该用户读取、上传、覆盖和删除。
- 食堂媒体只允许食堂成员读取；上传者可以覆盖或删除自己创建的对象。
- 同桌头像属于食堂媒体，不属于账号头像。
- `profiles.avatar_path` 必须匹配当前 `profiles.id` 的用户头像目录。
- `diner_profiles.avatar_path` 必须匹配所属食堂的 `diner-avatars` 目录。
- `media_assets` 只登记食堂媒体，不登记账号头像；其 `media_type` 必须与对象目录匹配。
- 对象名不得包含 `..`；客户端使用随机 UUID 作为文件名，不使用用户提供的原文件名。
- 桶保持私有，客户端通过授权请求或短期签名 URL 读取。
- 对象创建、覆盖与删除通过 Storage API 完成，不直接修改 `storage` schema 表。

## 5. 权限模型

### MVP

- `anon` 无权访问业务表和私有图片。
- `authenticated` 仅能访问自己在 `table_members` 中所属食堂的数据。
- 注册触发器负责建立默认食堂，客户端不能伪造 owner。
- 当前账号可以维护同桌档案并代录评价。
- 账号评分只能以当前 `auth.uid()` 作为主体，不能替另一个登录账号写评分。
- Edge Function 使用用户 JWT 查询业务数据；只有确需后台处理的步骤才使用 secret key。

### 未来好友与分组

- 增加 `member` 等角色时，读取策略仍复用成员关系。
- 写入权限需要按角色拆分，不能直接沿用 MVP 的“成员均可写”。
- 同桌档案认领必须走受审计的服务端事务，不能由客户端直接设置 `claimed_by_user_id`。
- 历史代录评分与本人评分需要增加来源字段和迁移规则。

## 6. 主要查询与索引

| 场景 | 索引 |
| --- | --- |
| 当前食堂的有效菜谱 | `recipes(table_space_id, updated_at desc) where deleted_at is null` |
| 某天的用餐计划 | `meal_plans(table_space_id, planned_for, meal_type)` |
| 当前采购 | `shopping_trips(table_space_id, status, started_at desc)` |
| 清单分组与排序 | `shopping_items(table_space_id, shopping_trip_id, area, position)` |
| 餐桌时间线 | `cooking_records(table_space_id, cooked_at desc)` |
| RLS 成员判断 | `table_members(user_id, table_space_id)` 主键反向补充索引 |

所有外键列都应有可用索引；复合索引按“等值过滤在前、时间范围或排序在后”排列。

## 7. 删除与历史规则

- 菜谱、同桌档案使用软删除；已被历史记录引用时禁止物理删除。
- 删除食堂属于账号级高风险操作，MVP 不直接暴露；未来由服务端执行导出、确认和级联删除。
- 采购完成后仍允许更正，但需追加更正记录；SQL 草案先保留 `updated_at`，审计表在阶段 5 加入。
- 媒体数据库记录删除不等于对象存储已删除；后台清理任务需可重试并记录结果。

## 8. 待同步操作接口

阶段 1 先定义统一的本地 `PendingOperations` 接口，阶段 5 再将其实现扩展为完整采购离线队列。设置页退出确认只依赖该接口，不直接了解各功能的存储细节。

建议接口：

```ts
type PendingOperationSummary = {
  shoppingChanges: number;
  mediaUploads: number;
  drafts: number;
  status: 'synced' | 'syncing' | 'failed' | 'unknown';
};

interface PendingOperations {
  getSummary(userId: string): Promise<PendingOperationSummary>;
  retryAll(userId: string): Promise<PendingOperationSummary>;
  preserveForLogout(userId: string): Promise<void>;
}
```

阶段 1 的最小实现：

- 资料草稿和头像上传任务必须登记。
- 尚未启用的采购离线队列返回 0，而不是伪造扫描结果。
- 查询失败返回 `unknown`，设置页不得显示“可以安全退出”。
- 待同步数据按用户 ID 隔离；退出时可以保留，但其他账号不可读取或提交。
- 正常退出清除会话和可重建缓存，不清除待同步队列。

阶段 5 扩展：

- 将采购本地变更接入相同接口。
- 支持重试、幂等提交、冲突处理和完成后清理。
- 接口契约保持不变，使 `S1.9` 无需重写退出逻辑。

## 9. 待验证项

- [ ] 在 Supabase PostgreSQL 上完整执行 `schema.sql`。
- [ ] 用两个测试账号证明无法跨食堂读取、插入或关联数据。
- [ ] 证明匿名用户无法读取业务表和私有图片。
- [ ] 验证注册触发器原子创建默认食堂和 owner 成员。
- [ ] 验证 Storage 上传、读取、覆盖与删除策略。
- [ ] 验证用户不能读取或覆盖其他用户的头像。
- [ ] 验证食堂成员只能使用允许的媒体目录，且 `media_type` 与目录一致。
- [ ] 验证昵称空值、空白、超过 20 字符和默认人数越界均被数据库拒绝。
- [ ] 用代表性菜单验证复合外键和主要查询索引。
- [ ] 在阶段 2 前细化 AI 导入任务/草稿表；避免模型响应直接写正式菜谱。

### 9.1 设置页相关数据库验收用例

创建 Supabase 测试项目后，至少验证：

| 用例 | 预期结果 |
| --- | --- |
| 新用户没有提供昵称 | 自动生成非空昵称和默认人数 2 |
| 昵称为 1 或 20 个字符 | 更新成功 |
| 昵称为空、纯空格、带首尾空格或超过 20 个字符 | 数据库拒绝 |
| 默认人数为 1 或 20 | 更新成功 |
| 默认人数为 0、21 或空值 | 数据库拒绝 |
| 上传 `users/{本人}/avatar/{uuid}.jpg` | 允许 |
| 上传或读取 `users/{他人}/avatar/{uuid}.jpg` | RLS 拒绝 |
| 食堂成员上传 `tables/{本食堂}/recipe-covers/{uuid}.jpg` | 允许 |
| 上传 `tables/{其他食堂}/...` | RLS 拒绝 |
| `media_type=receipt` 但路径使用 `recipe-covers` | 数据库拒绝登记 |
| 同桌头像指向其他食堂或非 `diner-avatars` 目录 | 数据库拒绝 |
| 待同步检查返回 `unknown` | 退出页不显示“可以安全退出” |
| 保留数据并退出后以同一账号重登 | 待同步任务仍可继续 |
| 保留数据并切换到其他账号 | 新账号不可读取或提交旧账号任务 |

由于本机当前没有运行 PostgreSQL 或 Docker daemon，本轮完成了结构与静态审查，但没有冒充数据库执行验证。创建 Supabase 测试项目或启动本地栈后，以上测试是 `S0.7` 的最终出口。
