# X Content Calendar

## Account Setup

Recommended handle:

- `@RepuFlowHook`
- `@RepuFlowX`
- `@RepuFlowLabs`

Bio:

```text
Reputation-aware dynamic fees for Uniswap v4 pools on X Layer. Built for Hook the Future.
```

Pinned post after submission:

```text
RepuFlow Hook is our submission for Hook the Future.

Good agents get cheaper execution.
Toxic flow pays more to LPs.
Built with Uniswap v4 Hooks on X Layer.
```

## Day 1: 2026-05-25 - Posted

```text
Day 1 of building RepuFlow Hook for Hook the Future on @XLayerOfficial.

We are exploring reputation-aware dynamic fees for Uniswap v4:
good agents get cheaper execution,
toxic flow pays more to LPs.

Built with @Uniswap v4 Hooks.

@flapdotsh

#XLayer #UniswapV4 #BuildX
```

Follow-up:

```text
The core question:

Should every swap pay the same fee if some flow helps the pool while other flow extracts from LPs?

With v4 Hooks, the pool can answer at execution time.
```

## Day 2: 2026-05-26 - Ready to Post

```text
Day 2 update: RepuFlow now has a Uniswap v4 Hook adapter.

Implemented:
- beforeSwap returns a dynamic LP fee override
- afterSwap updates onchain reputation
- toxic-flow surcharge is tracked as LP protection

Local tests are passing. Next: X Layer deployment path.

@XLayerOfficial @Uniswap @flapdotsh
```

Follow-up:

```text
Why reputation matters for agentic trading:

An AI agent should be able to earn better execution over time.

RepuFlow makes execution quality persistent instead of treating every wallet as unknown flow forever.
```

Build proof follow-up:

```text
Today’s test coverage:

- normal flow receives base fee
- good agent receives discount
- toxic flow pays surcharge
- afterSwap updates reputation
- v4 beforeSwap returns OVERRIDE_FEE_FLAG

7 local tests passing.
```

## Day 3: 2026-05-27 - Ready to Post

```text
Day 3: RepuFlow deployment path is ready for X Layer.

Prepared:
- X Layer PoolManager target
- beforeSwap + afterSwap hook flags
- CREATE2 hook address mining
- deployment record template

Next: deploy registry, vault, hook, and dynamic-fee v4 pool.

@XLayerOfficial @Uniswap @flapdotsh
```

Screenshot post:

```text
RepuFlow demo view:

Same pool.
Different flow quality.
Different fee.

Now with the X Layer deployment path visible in the UI.
```

## Final Submission: 2026-05-28

```text
Submission: RepuFlow Hook

A reputation-aware dynamic fee Hook for Uniswap v4 pools on X Layer.

Good agents get cheaper execution.
Toxic flow pays more to LPs.
Every swap updates an onchain reputation profile.

Built for Hook the Future by @XLayerOfficial, @Uniswap, and @flapdotsh.

Demo:
[video link]

Contracts:
Hook: [address]
Pool: [pool id/address]
Registry: [address]
Vault: [address]

#XLayer #UniswapV4 #BuildX
```

Thread add-on:

```text
How it works:

1. beforeSwap checks flow quality and reputation
2. the Hook applies a bounded dynamic fee
3. afterSwap updates the trader profile
4. toxic-flow surcharge is tracked as LP protection value
```

Thread add-on:

```text
Why this matters:

LPs should not price all order flow equally.
AI agents should be able to earn trust over time.
X Layer gives this kind of execution primitive a low-cost environment to grow.
```

## Posting Rules

- Always include at least one concrete build update.
- Include screenshots when possible.
- Do not overclaim production readiness.
- Use contract addresses only after deployment is confirmed.
- Keep final post short enough that judges can scan it quickly.
