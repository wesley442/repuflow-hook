# Final Submission Template

## Project Name

RepuFlow Hook

## Short Description

RepuFlow Hook is a reputation-aware dynamic fee Hook for Uniswap v4 pools on X Layer. It gives clean traders and AI agents cheaper execution while charging toxic or high-impact flow more to protect LPs.

## Long Description

Liquidity providers often subsidize toxic flow, while high-quality traders and AI agents receive no persistent execution advantage. RepuFlow uses a Uniswap v4 Hook to adjust fees at swap time based on flow quality and trader reputation.

Before each swap, the Hook estimates whether the flow improves or harms the pool and reads the trader reputation score. Helpful flow and trusted agents receive fee discounts. Toxic flow receives a surcharge, and the surcharge is tracked as LP protection value. After each swap, the Hook updates the trader reputation profile onchain.

## Repository

TBD

## Demo

TBD

## Final X Post

TBD

## Contracts

- Hook:
- V4 Pool:
- ReputationRegistry:
- LpProtectionVault:

## Demo Transactions

- Normal trader:
- Good agent:
- Toxic flow:

## Built With

- X Layer
- Uniswap v4 Hooks
- Solidity
- Foundry
- React or Next.js

## Why It Matters

RepuFlow introduces a pool-native reputation layer for execution quality. It can help LPs price toxic flow more accurately and gives AI agents a reason to maintain long-term onchain reputation.

