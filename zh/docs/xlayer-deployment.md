# X Layer 部署计划

## 已确认网络参数

- Network: X Layer mainnet
- Chain ID: `196`
- RPC: `https://rpc.xlayer.tech`
- Uniswap v4 PoolManager: `0x360e68faccca8ca495c1b759fd9eee466db9fb32`

来源：Uniswap v4 deployments 文档和 X Layer RPC 资料。

## 环境变量

创建 `.env`：

```bash
cp .env.example .env
```

填写：

```text
XLAYER_RPC_URL=https://rpc.xlayer.tech
XLAYER_CHAIN_ID=196
POOL_MANAGER=0x360e68faccca8ca495c1b759fd9eee466db9fb32
PRIVATE_KEY=<deployer private key>
```

## 部署步骤

### 1. 部署 Registry 和 Vault

```bash
pnpm deploy:xlayer
```

保存：

- `ReputationRegistry`
- `LpProtectionVault`
- `Mock OKB`
- `Mock USD`

脚本会输出下一步挖 Hook 地址需要的环境变量。

### 2. 挖生产 Hook 地址

设置真实 registry 和 vault 地址：

```bash
export REPUTATION_REGISTRY=<registry>
export LP_PROTECTION_VAULT=<vault>
```

运行：

```bash
pnpm mine:hook
```

保存：

- salt
- predicted Hook address
- init code hash

### 3. 部署 RepuFlowV4Hook

Hook 地址必须包含 Uniswap v4 的权限位：

- `beforeSwap`
- `afterSwap`

目标 flag：

```text
0x00c0
```

当前项目已经提供 salt 挖矿脚本。生产部署应使用 CREATE2：

- CREATE2 deployer: `0x4e59b44847b379578588920cA78FbF26c0B4956C`
- contract: `RepuFlowV4Hook`
- constructor args: `POOL_MANAGER`, `REPUTATION_REGISTRY`, `LP_PROTECTION_VAULT`
- mined salt

### 4. 创建动态费率池

池子必须是 Uniswap v4 dynamic-fee pool，否则 `beforeSwap` 返回的 fee override 不会生效。

使用：

```text
LPFeeLibrary.DYNAMIC_FEE_FLAG = 0x800000
```

Pool key 字段：

- `currency0`：较小 token 地址
- `currency1`：较大 token 地址
- `fee`：`0x800000`
- `tickSpacing`：`60`
- `hooks`：已部署的 `RepuFlowV4Hook`

### 5. 执行 Demo Swaps

三笔 swap 的 hookData 编码池子不平衡程度：

```text
hookData = abi.encode(uint160(poolImbalanceBps))
```

Demo 用例：

- Normal Trader：amount `1`，imbalance `100`
- Good Agent：amount `-1`，imbalance `300`
- Toxic Flow：amount `20`，imbalance `100`

## Day 3 验证

- [ ] Registry 已部署
- [ ] Vault 已部署
- [ ] Hook salt 已挖出，flags 为 `0x00c0`
- [ ] Hook 已部署到预测地址
- [ ] Dynamic fee V4 pool 已创建
- [ ] 三笔 demo swap 已执行
- [ ] 交易 hash 已填入 `submission/deployment-record.md`

