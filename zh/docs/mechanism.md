# Hook 机制设计

## 核心想法

RepuFlow Hook 根据两个信号调整池子费率：

1. 流量质量：本次 swap 是改善池子，还是伤害池子。
2. 交易者信誉：交易者或 AI Agent 是否有良好的历史执行记录。

## Swap 生命周期

```text
用户或 Agent
  -> 发起 Swap
  -> RepuFlowHook.beforeSwap
  -> 动态费率覆盖
  -> Pool 执行 swap
  -> RepuFlowHook.afterSwap
  -> 更新信誉分
  -> 更新 LP protection 记账
```

## Uniswap v4 集成

当前项目有两个合约入口：

- `RepuFlowHook`：用于快速本地 demo 和算法测试的 facade。
- `RepuFlowV4Hook`：基于 `BaseHook` 的真实 Uniswap v4 adapter。

`RepuFlowV4Hook` 已实现：

- `beforeSwap`：计算动态费率，并返回 v4 LP fee override。
- `afterSwap`：结算信誉更新和 LP protection 记账。

Uniswap v4 的 LP fee 单位是百分之一 bps。RepuFlow 内部用 bps 表示面向用户的数值，返回 override 前转换为 v4 单位：

```text
v4Fee = finalFeeBps * 100 | LPFeeLibrary.OVERRIDE_FEE_FLAG
```

## 费率公式

MVP 公式：

```text
finalFee = baseFee + flowAdjustment - reputationDiscount
finalFee = clamp(finalFee, minFee, maxFee)
```

默认值：

```text
minFee = 5 bps
baseFee = 30 bps
maxFee = 150 bps
```

## 流量质量判断

MVP 使用简单、确定性的规则判断流量质量。

有帮助的流量：

- swap 方向改善池子余额。
- swap 规模适中。
- 最近行为没有反复向同一方向冲击池子。

中性流量：

- 规模正常。
- 无明显改善或伤害。

有毒流量：

- 大额单边 swap。
- 短时间内持续向同一方向冲击池子。
- 对池子价格或余额影响较大。

## 信誉分

每个地址有一个 0 到 100 的分数。

MVP 分层：

| 分数 | 标签 | 费率影响 |
| ---: | --- | ---: |
| 80-100 | Good Agent | 最高 10 bps 折扣 |
| 40-79 | Normal Trader | 无特殊折扣 |
| 0-39 | Risky Flow | 折扣减少或增加 surcharge |

## LP 保护

当有毒流量支付高于基础费率的费用时，额外部分会记录为 LP protection value。

MVP 记账：

```text
protectionValue += max(finalFee - baseFee, 0)
```

前端会展示这个值，让评委直观看到 LP 被保护的效果。

## Demo 示例

### Good Agent

输入：

- 分数：90
- 流量：改善池子状态

输出：

- 费率：15-20 bps
- 信誉保持高分或继续提升

### Normal Trader

输入：

- 分数：50
- 流量：中性

输出：

- 费率：30 bps
- 信誉小幅更新

### Toxic Flow

输入：

- 分数：20
- 流量：高冲击单边 swap

输出：

- 费率：80-120 bps
- surcharge 计入 LP protection
- 信誉分下降

## 为什么适合 X Layer

X Layer 适合低成本、高频率执行，这很适合 AI Agent 和自动化交易系统。RepuFlow 让这些 Agent 有动力积累长期链上信誉，而不是每次交易都被当成未知流量处理。
