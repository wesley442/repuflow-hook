# X Layer Deployment Plan

## Known Network Parameters

- Network: X Layer mainnet
- Chain ID: `196`
- RPC: `https://rpc.xlayer.tech`
- Uniswap v4 PoolManager: `0x360e68faccca8ca495c1b759fd9eee466db9fb32`

Source: Uniswap v4 deployments documentation and X Layer RPC references.

## Environment

Create `.env`:

```bash
cp .env.example .env
```

Fill:

```text
XLAYER_RPC_URL=https://rpc.xlayer.tech
XLAYER_CHAIN_ID=196
POOL_MANAGER=0x360e68faccca8ca495c1b759fd9eee466db9fb32
PRIVATE_KEY=<deployer private key>
```

## Deployment Steps

### 1. Deploy Registry and Vault

```bash
pnpm deploy:xlayer
```

Save:

- `ReputationRegistry`
- `LpProtectionVault`
- `Mock OKB`
- `Mock USD`

The script prints environment variables for the next step.

### 2. Mine the Production Hook Address

Set actual registry and vault addresses:

```bash
export REPUTATION_REGISTRY=<registry>
export LP_PROTECTION_VAULT=<vault>
```

Run:

```bash
pnpm mine:hook
```

Save:

- salt
- predicted Hook address
- init code hash

### 3. Deploy RepuFlowV4Hook

The Hook address must include the Uniswap v4 permission bits for:

- `beforeSwap`
- `afterSwap`

Target flag value:

```text
0x00c0
```

The project currently mines the salt. The production deployment should use CREATE2 with:

- CREATE2 deployer: `0x4e59b44847b379578588920cA78FbF26c0B4956C`
- contract: `RepuFlowV4Hook`
- constructor args: `POOL_MANAGER`, `REPUTATION_REGISTRY`, `LP_PROTECTION_VAULT`
- mined salt

### 4. Create a Dynamic Fee Pool

The pool must be a Uniswap v4 dynamic-fee pool. Otherwise, `beforeSwap` fee override will be ignored.

Use:

```text
LPFeeLibrary.DYNAMIC_FEE_FLAG = 0x800000
```

Pool key fields:

- `currency0`: lower token address
- `currency1`: higher token address
- `fee`: `0x800000`
- `tickSpacing`: `60`
- `hooks`: deployed `RepuFlowV4Hook`

### 5. Run Demo Swaps

Run three swaps with hookData encoding the pool imbalance bps:

```text
hookData = abi.encode(uint160(poolImbalanceBps))
```

Demo cases:

- Normal Trader: amount `1`, imbalance `100`
- Good Agent: amount `-1`, imbalance `300`
- Toxic Flow: amount `20`, imbalance `100`

## Day 3 Verification

- [ ] Registry deployed
- [ ] Vault deployed
- [ ] Hook salt mined with `0x00c0` flags
- [ ] Hook deployed at predicted address
- [ ] Dynamic fee V4 pool created
- [ ] Three demo swaps executed
- [ ] Transaction hashes added to `submission/deployment-record.md`

