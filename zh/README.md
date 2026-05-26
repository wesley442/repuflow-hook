# RepuFlow Hook 中文说明

面向 X Layer 上 Uniswap v4 池子的“信誉感知动态费率”Hook。

## 一句话介绍

RepuFlow Hook 让 Uniswap v4 池子可以根据交易流质量和交易者或 AI Agent 的链上信誉动态调整 swap 费率。

优质 Agent 获得更低执行成本。有毒流量向 LP 支付更高费用。

## 黑客松背景

- 活动：Hook the Future, Build X Hackathon
- 链：X Layer
- 构建目标：Uniswap v4 Hook
- 链上要求：在 X Layer 部署 V4 Pool 和 Hook 合约
- 提交截止：2026-05-28 23:59 UTC

## 问题

LP 经常为有毒流量承担成本，而长期行为良好的交易者和 AI Agent 并不会获得持续的执行优势。大多数池子把所有流量都当成同一种流量处理，即使它们对 LP 的影响完全不同。

## 方案

RepuFlow 使用 Uniswap v4 Hook，让池子在每次交易执行时动态判断：

1. `beforeSwap` 判断本次 swap 是否改善或损害池子状态。
2. Hook 应用动态费率。
3. 对池子有帮助的流量获得费率折扣。
4. 有毒流量或高冲击流量支付额外费用。
5. `afterSwap` 更新交易者链上信誉分。
6. 额外费用被记录为 LP 保护价值。

## MVP 范围

合约：

- `RepuFlowHook.sol`
- `ReputationRegistry.sol`
- `LpProtectionVault.sol`
- `MockToken.sol`
- `DeployXLayer.s.sol`

前端：

- 连接钱包
- 展示池子状态
- 展示预计动态费率
- 执行 demo swap
- 展示钱包信誉分
- 展示 LP protection vault 数值

Demo 预设：

- Good Agent
- Normal Trader
- Toxic Flow

## 当前实现状态

本地已完成：

- Hardhat + TypeScript 项目初始化
- RepuFlow MVP 合约
- Uniswap v4 Hook adapter，包含 `beforeSwap` 费率覆盖和 `afterSwap` 信誉结算
- 本地部署脚本
- 覆盖费率报价、信誉更新、费率边界、LP protection 记账的单元测试
- Vite React demo UI

最终黑客松提交前仍需完成：

- 挖出/部署带有 Uniswap v4 权限位的生产 Hook 地址
- 在 X Layer 部署 V4 Pool 和 Hook
- 补充 X Layer 合约地址和交易 hash
- 录制最终 demo 视频

## 费率模型

MVP 初始值：

| 流量类型 | 信誉分 | 预期费率 |
| --- | ---: | ---: |
| Good Agent | 80-100 | 15-20 bps |
| Normal Trader | 40-70 | 30 bps |
| Toxic Flow | 0-30 | 80-120 bps |

费率边界：

- 最低费率：5 bps
- 基础费率：30 bps
- 最高费率：150 bps

## 评审亮点

- 创新性：基于 Uniswap v4 Hook 的信誉感知市场结构。
- 市场价值：保护 LP，同时为 AI Agent 提供长期链上信誉和执行优势。
- 完成度：部署 Hook、部署 V4 Pool、真实 swap demo、前端、视频。
- 链上可验证：最终提交包含合约地址和交易 hash。

## 中文文档

- [实施计划](docs/implementation-plan.md)
- [Hook 机制设计](docs/mechanism.md)
- [Demo 脚本](docs/demo-script.md)
- [X Layer 部署计划](docs/xlayer-deployment.md)
- [提交清单](submission/checklist.md)
- [X 内容日历](social/x-content-calendar.md)

## 链接占位

- Demo:
- 仓库:
- 最终 X post:
- Hook 合约:
- Pool:
- Registry:
- Vault:

## 本地运行

安装依赖：

```bash
pnpm install
```

运行合约测试：

```bash
pnpm test
```

运行本地部署脚本：

```bash
pnpm deploy:local
```

运行前端：

```bash
pnpm dev
```

构建前端：

```bash
pnpm web:build
```

## 部署到 X Layer

从 `.env.example` 创建 `.env`：

```bash
cp .env.example .env
```

设置：

```text
XLAYER_RPC_URL=
PRIVATE_KEY=
```

然后运行：

```bash
pnpm deploy:xlayer
```
