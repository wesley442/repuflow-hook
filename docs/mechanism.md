# Hook Mechanism

## Core Idea

RepuFlow Hook changes pool fees according to two signals:

1. Flow quality: whether the swap helps or harms the pool.
2. Reputation: whether the trader or agent has a history of clean execution.

## Swap Lifecycle

```text
User or Agent
  -> Swap
  -> RepuFlowHook.beforeSwap
  -> Dynamic fee override
  -> Pool executes swap
  -> RepuFlowHook.afterSwap
  -> Reputation update
  -> LP protection accounting
```

## Uniswap v4 Integration

The project now has two contract surfaces:

- `RepuFlowHook`: a small facade for fast local demos and algorithm tests.
- `RepuFlowV4Hook`: the real Uniswap v4 adapter using `BaseHook`.

`RepuFlowV4Hook` enables:

- `beforeSwap`: quotes the dynamic fee and returns a v4 LP fee override.
- `afterSwap`: settles the reputation update and LP protection accounting.

Uniswap v4 represents LP fees in hundredths of a bip. RepuFlow stores user-facing values in bps, then converts them before returning the override:

```text
v4Fee = finalFeeBps * 100 | LPFeeLibrary.OVERRIDE_FEE_FLAG
```

## Fee Formula

MVP formula:

```text
finalFee = baseFee + flowAdjustment - reputationDiscount
finalFee = clamp(finalFee, minFee, maxFee)
```

Default values:

```text
minFee = 5 bps
baseFee = 30 bps
maxFee = 150 bps
```

## Flow Quality

The MVP classifies flow using simple deterministic rules.

Helpful flow:

- Swap direction improves pool balance.
- Swap size is moderate.
- Recent behavior has not repeatedly pushed the pool in one direction.

Neutral flow:

- Normal size.
- No clear balance improvement or harm.

Toxic flow:

- Large single-sided swap.
- Repeated short-window pressure in one direction.
- High pool impact.

## Reputation Score

Each address has a score between 0 and 100.

Initial MVP levels:

| Score | Label | Fee Effect |
| ---: | --- | ---: |
| 80-100 | Good Agent | Up to 10 bps discount |
| 40-79 | Normal Trader | No special discount |
| 0-39 | Risky Flow | Less discount or surcharge |

## LP Protection

When toxic flow pays more than the base fee, the surcharge is tracked as LP protection value.

MVP accounting:

```text
protectionValue += max(finalFee - baseFee, 0)
```

This value is displayed in the frontend to make the LP benefit visible during the demo.

## Demo Examples

### Good Agent

Input:

- Score: 90
- Flow: balance-improving

Output:

- Fee: 15-20 bps
- Reputation remains high or improves

### Normal Trader

Input:

- Score: 50
- Flow: neutral

Output:

- Fee: 30 bps
- Reputation updates slightly

### Toxic Flow

Input:

- Score: 20
- Flow: high-impact one-sided swap

Output:

- Fee: 80-120 bps
- Surcharge tracked for LP protection
- Reputation decreases

## Why This Fits X Layer

X Layer can support low-cost, frequent execution. That makes it a good venue for AI agents and automated trading systems. RepuFlow gives those agents a reason to build persistent reputation instead of treating every pool interaction as a one-off transaction.
