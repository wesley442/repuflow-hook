# 最终提交模板

## 项目名

RepuFlow Hook

## 简短描述

RepuFlow Hook 是一个部署在 X Layer 上、面向 Uniswap v4 池子的信誉感知动态费率 Hook。它让优质交易者和 AI Agent 获得更低执行成本，同时让有毒或高冲击流量向 LP 支付更高费用。

## 详细描述

LP 经常为有毒流量承担成本，而高质量交易者和 AI Agent 并没有持续的执行优势。RepuFlow 使用 Uniswap v4 Hook，在每次 swap 执行时根据流量质量和交易者信誉动态调整费率。

在每次 swap 之前，Hook 判断本次流量是否改善或伤害池子，并读取交易者信誉分。对池子有帮助的流量和可信 Agent 获得费率折扣。有毒流量支付额外费用，额外部分被记录为 LP protection value。每次 swap 之后，Hook 会在链上更新交易者信誉画像。

## 仓库

TBD

## Demo

TBD

## 最终 X Post

TBD

## 合约

- Hook：
- V4 Pool：
- ReputationRegistry：
- LpProtectionVault：

## Demo 交易

- Normal trader：
- Good agent：
- Toxic flow：

## 使用技术

- X Layer
- Uniswap v4 Hooks
- Solidity
- Foundry
- React 或 Next.js

## 为什么重要

RepuFlow 为执行质量引入了池子原生的信誉层。它可以帮助 LP 更准确地为有毒流量定价，同时让 AI Agent 有动力维护长期链上信誉。

