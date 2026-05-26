# Demo 视频脚本

目标时长：1-3 分钟。

## 视频结构

### 0:00-0:20 问题

台词：

```text
LP 经常为有毒流量承担成本，而高质量交易者和 AI Agent 没有持续的执行优势。RepuFlow Hook 用 X Layer 上的 Uniswap v4 Hook 解决这个问题：根据交易流质量和信誉动态调整费率。
```

画面：

- 展示标题页或前端首页。
- 展示一句话 tagline。

### 0:20-0:50 机制

台词：

```text
每次 swap 之前，Hook 检查两个信号：流量质量和交易者信誉。对池子有帮助的流量获得更低费率。有毒或高冲击流量支付更高费用，额外费用被记录为 LP protection value。swap 之后，Hook 会更新交易者链上信誉分。
```

画面：

- 展示架构图或机制说明。
- 展示费率表。

### 0:50-1:40 现场 Demo

台词：

```text
这里是同一个池子的三个不同交易者画像。

普通交易者支付基础费率。
高信誉 Agent 因为历史行为良好获得折扣。
有毒流量画像支付更高费率，额外费用会增加 LP protection value。
```

画面：

- 连接钱包。
- 选择 Normal Trader 并执行 swap。
- 选择 Good Agent，展示更低费率。
- 选择 Toxic Flow，展示更高费率和 vault 数值变化。

### 1:40-2:10 链上证明

台词：

```text
Hook、pool、registry 和 vault 都已经部署在 X Layer。这些交易 hash 展示了 Hook 被真实 swap 触发。
```

画面：

- 展示 README 合约地址部分。
- 展示 explorer 或 tx hash 列表。

### 2:10-2:30 收尾

台词：

```text
RepuFlow 把 Uniswap v4 池子变成信誉感知的执行场所。优质 Agent 获得更低执行成本，有毒流量向 LP 支付更高费用。
```

画面：

- 展示项目名和链接。

## 必须展示的画面

- 前端费率预览
- 成功 swap
- 信誉分
- LP protection vault 数值
- 合约地址或 explorer 页面

## 备用 Demo

如果前端部署失败，录制终端输出：

1. 运行部署脚本。
2. 运行 normal trader swap 脚本。
3. 运行 good agent swap 脚本。
4. 运行 toxic flow swap 脚本。
5. 展示 event logs 中不同的 fee 数值。

