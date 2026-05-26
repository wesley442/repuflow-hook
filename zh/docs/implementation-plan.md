# 实施计划

## 目标

在 2026-05-28 23:59 UTC 前完成并提交 RepuFlow Hook。

建议内部截止时间：2026-05-28 20:00 UTC，给部署、录屏和表单提交预留缓冲。

## 交付原则

- 优先保证真实链上 demo，而不是复杂算法。
- 必须在 X Layer 部署真实 Hook 和 V4 Pool。
- 费率规则要足够简单，能在 30 秒内解释清楚。
- README 必须让评委可以快速验证合约、交易和 demo。

## 时间轴

### 2026-05-25：确定方向和项目基础

目标：锁定概念，建立项目骨架。

任务：

- 创建仓库 `repuflow-hook`。
- 初始化 Foundry 或 Uniswap v4 Hook 模板。
- 创建项目 X 账号。
- 编写 README 初稿。
- 实现初始合约骨架：
  - `RepuFlowHook.sol`
  - `ReputationRegistry.sol`
  - `LpProtectionVault.sol`
- 定义费率和信誉规则。
- 发布 Day 1 X 内容。

交付物：

- README 初稿
- 合约骨架
- 费率模型表
- X 账号
- Day 1 内容

### 2026-05-26：Hook 逻辑和测试

目标：让动态费率机制在本地跑通。

任务：

- 实现 `beforeSwap` 费率覆盖逻辑。
- 实现 `afterSwap` 信誉更新逻辑。
- 实现 registry 读写。
- 增加费率上下限。
- 为 demo 地址增加基础管理能力。
- 编写 Foundry 测试：
  - 普通交易者获得基础费率
  - 高信誉交易者获得折扣
  - 有毒流量支付额外费率
  - swap 后分数更新
  - 费率不会超过上下限
- 编写 `docs/mechanism.md`。
- 发布 Day 2 X 内容。

交付物：

- 本地测试通过
- 机制文档
- Day 2 内容

### 2026-05-27：X Layer 部署和前端

目标：部署到链上，并演示真实链上行为。

任务：

- 配置 X Layer RPC 和部署钱包。
- 部署：
  - mock tokens
  - reputation registry
  - LP protection vault
  - RepuFlow Hook
  - V4 Pool
- 执行 demo swap：
  - normal trader
  - good agent
  - toxic flow
- 保存交易 hash。
- 构建最小前端：
  - 连接钱包
  - 费率预览
  - swap 操作
  - 信誉分展示
  - vault 数值展示
- 更新 README 合约地址。
- 发布 Day 3 X 内容和截图。

交付物：

- 已部署合约
- Pool address 或 PoolId
- Demo 交易 hash
- 前端 MVP
- Day 3 内容

### 2026-05-28：打磨、录屏、提交

目标：完成所有提交材料。

任务：

- 如果区块浏览器支持，验证合约源码。
- 跑最终本地测试。
- 跑最终 testnet demo。
- 录制 1-3 分钟 demo 视频。
- 完成 README。
- 完成提交清单。
- 提交黑客松表单。
- 发布最终 X submission post。

交付物：

- 最终 README
- Demo 视频
- 提交表单
- 最终 X post
- 合约地址
- 交易 hash

## 工程待办

### 必须完成

- Hook 部署到 X Layer
- V4 Pool 部署到 X Layer
- 动态费率计算
- 信誉读取路径
- 信誉更新路径
- 至少三笔 demo 交易 hash
- README 包含所有提交链接

### 应该完成

- 前端 demo
- 合约验证
- 带字幕的 demo 视频
- LP protection vault 展示
- 干净的 Foundry 测试

### 可以砍掉

- 复杂 oracle 集成
- 多池支持
- 真 AI Agent 自动交易
- 生产级信誉算法
- 主网部署

## 风险管理

| 风险 | 应对 |
| --- | --- |
| X Layer 上 V4 部署遇到阻力 | 从现成 Hook 模板开始，池子配置保持最小化 |
| 动态费率覆盖逻辑复杂 | 先实现简单的有界费率规则 |
| 前端耗时过长 | 保留 CLI 脚本 demo 作为备选 |
| 区块浏览器验证失败 | README 中提供源码、地址和交易 hash |
| 截止时间压力 | 2026-05-28 12:00 UTC 后冻结新功能 |

## 最终提交包

- GitHub 仓库
- Demo 视频
- 最终 X post
- Hook 地址
- Pool 地址或 PoolId
- Registry 地址
- Vault 地址
- Demo 交易 hash
- README 和运行说明

