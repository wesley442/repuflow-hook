# RepuFlow Hook

Reputation-aware dynamic fees for Uniswap v4 pools on X Layer.

## One-liner

RepuFlow Hook lets a Uniswap v4 pool adjust swap fees based on flow quality and trader or agent reputation.

Good agents get cheaper execution. Toxic flow pays more to LPs.

## Hackathon Context

- Event: Hook the Future, Build X Hackathon
- Chain: X Layer
- Required build target: Uniswap v4 Hook
- Required onchain output: V4 Pool and Hook contract deployed on X Layer
- Submission deadline: 2026-05-28 23:59 UTC

## Problem

Liquidity providers often subsidize toxic flow, while high-quality traders and AI agents receive no persistent execution advantage. Most pools treat all flow equally even when the flow quality is very different.

## Solution

RepuFlow uses a Uniswap v4 Hook to make the pool react at execution time:

1. `beforeSwap` estimates whether a swap improves or harms pool balance.
2. The Hook applies a dynamic fee override.
3. Helpful flow receives a fee discount.
4. Toxic or high-impact flow pays a surcharge.
5. `afterSwap` updates the trader reputation profile.
6. Extra surcharge value is tracked as LP protection value.

## MVP Scope

Contracts:

- `RepuFlowHook.sol`
- `ReputationRegistry.sol`
- `LpProtectionVault.sol`
- `MockToken.sol`
- `DeployXLayer.s.sol`

Frontend:

- Connect wallet
- Show pool status
- Show estimated dynamic fee
- Execute demo swaps
- Show wallet reputation score
- Show LP protection vault value

Demo presets:

- Good Agent
- Normal Trader
- Toxic Flow

## Current Implementation Status

Completed locally:

- Hardhat + TypeScript project setup
- RepuFlow MVP contracts
- Uniswap v4 Hook adapter with `beforeSwap` fee override and `afterSwap` reputation settlement
- Local deployment script
- Unit tests for fee quotes, reputation updates, fee bounds, and LP protection accounting
- Vite React demo UI

Pending for final hackathon submission:

- Mine/deploy the production Hook address with the required Uniswap v4 permission bits
- Deploy V4 Pool and Hook on X Layer
- Add X Layer contract addresses and transaction hashes
- Record final demo video

## Fee Model

Initial MVP values:

| Flow Type | Reputation | Expected Fee |
| --- | ---: | ---: |
| Good Agent | 80-100 | 15-20 bps |
| Normal Trader | 40-70 | 30 bps |
| Toxic Flow | 0-30 | 80-120 bps |

Fee bounds:

- Minimum fee: 5 bps
- Base fee: 30 bps
- Maximum fee: 150 bps

## Judging Highlights

- Innovation: reputation-aware market structure using Uniswap v4 Hooks.
- Market potential: better LP protection and persistent execution identity for AI agents.
- Completion: deployed Hook, deployed V4 Pool, demo swaps, frontend, video.
- Onchain verification: contract addresses and transaction hashes included in final submission.

## Project Docs

- [Implementation Plan](docs/implementation-plan.md)
- [Hook Mechanism](docs/mechanism.md)
- [Demo Script](docs/demo-script.md)
- [X Layer Deployment Plan](docs/xlayer-deployment.md)
- [Submission Checklist](submission/checklist.md)
- [X Content Calendar](social/x-content-calendar.md)

## Chinese Docs

- [中文说明](zh/README.md)
- [中文白皮书](zh/docs/repuflow-whitepaper.md)
- [中文实施计划](zh/docs/implementation-plan.md)
- [中文 Hook 机制设计](zh/docs/mechanism.md)
- [中文 Demo 脚本](zh/docs/demo-script.md)
- [中文 X Layer 部署计划](zh/docs/xlayer-deployment.md)
- [中文提交清单](zh/submission/checklist.md)
- [中文 X 内容日历](zh/social/x-content-calendar.md)

## Links

- Demo:
- Repository:
- Final X post:
- Hook contract:
- Pool:
- Registry:
- Vault:

## Run Locally

Install dependencies:

```bash
pnpm install
```

Run contract tests:

```bash
pnpm test
```

Run local deployment script:

```bash
pnpm deploy:local
```

Run frontend:

```bash
pnpm dev
```

Build frontend:

```bash
pnpm web:build
```

## Deploy to X Layer

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Set:

```text
XLAYER_RPC_URL=
PRIVATE_KEY=
```

Then run:

```bash
pnpm deploy:xlayer
```
