# Implementation Plan

## Goal

Build and submit RepuFlow Hook for the X Layer Hook hackathon before 2026-05-28 23:59 UTC.

Recommended internal deadline: 2026-05-28 20:00 UTC.

## Delivery Principles

- Prioritize a working onchain demo over complex scoring.
- Deploy a real Hook and V4 Pool on X Layer.
- Keep the fee model simple enough to explain in under 30 seconds.
- Make the final submission easy to verify from README links.

## Timeline

### 2026-05-25: Direction and Project Foundation

Objective: lock the concept and create the project skeleton.

Tasks:

- Create repository `repuflow-hook`.
- Initialize Foundry or a Uniswap v4 Hook template.
- Create project X account.
- Write README draft.
- Implement initial contract skeletons:
  - `RepuFlowHook.sol`
  - `ReputationRegistry.sol`
  - `LpProtectionVault.sol`
- Define fee and reputation rules.
- Publish Day 1 X post.

Deliverables:

- README draft
- Contract skeleton
- Fee model table
- X account
- Day 1 post

### 2026-05-26: Hook Logic and Tests

Objective: make the dynamic fee mechanism work locally.

Tasks:

- Implement `beforeSwap` fee override.
- Implement `afterSwap` reputation update.
- Implement registry reads and writes.
- Add fee bounds.
- Add basic owner/admin controls for demo addresses.
- Write Foundry tests:
  - normal trader receives base fee
  - good trader receives discount
  - toxic flow receives surcharge
  - score updates after swap
  - fee never exceeds min or max
- Write `docs/mechanism.md`.
- Publish Day 2 X post.

Deliverables:

- Passing local tests
- Mechanism doc
- Day 2 post

### 2026-05-27: X Layer Deployment and Frontend

Objective: deploy and demonstrate real onchain behavior.

Tasks:

- Configure X Layer RPC and deployer wallet.
- Deploy:
  - mock tokens
  - reputation registry
  - LP protection vault
  - RepuFlow Hook
  - V4 Pool
- Run demo swaps:
  - normal trader
  - good agent
  - toxic flow
- Save transaction hashes.
- Build minimal frontend:
  - wallet connect
  - fee preview
  - swap action
  - reputation score display
  - vault value display
- Update README with deployed addresses.
- Publish Day 3 X post with screenshot.

Deliverables:

- Deployed contracts
- Pool address or PoolId
- Demo transactions
- Frontend MVP
- Day 3 post

### 2026-05-28: Polish, Video, and Submission

Objective: finish materials and submit before the deadline.

Tasks:

- Verify contracts if explorer support is available.
- Run final local tests.
- Run final testnet demo.
- Record 1-3 minute demo video.
- Complete README.
- Complete submission checklist.
- Submit the hackathon form.
- Publish final X submission post.

Deliverables:

- Final README
- Demo video
- Submission form
- Final X post
- Contract addresses
- Transaction hashes

## Engineering Backlog

### Must Have

- Hook deployed on X Layer
- V4 Pool deployed on X Layer
- Dynamic fee calculation
- Reputation read path
- Reputation update path
- At least three demo transaction hashes
- README with all submission links

### Should Have

- Frontend demo
- Contract verification
- Demo video with captions
- LP protection vault display
- Clean Foundry test suite

### Can Cut

- Complex oracle integration
- Multi-pool support
- Real AI agent automation
- Production-grade reputation algorithm
- Mainnet deployment

## Risk Management

| Risk | Mitigation |
| --- | --- |
| V4 deployment friction on X Layer | Start from existing hook template and keep pool setup minimal |
| Dynamic fee override complexity | Use simple bounded fee rules first |
| Frontend takes too long | Keep a scriptable CLI demo as fallback |
| Explorer verification fails | Include source code, addresses, and tx hashes in README |
| Submission deadline pressure | Freeze features by 2026-05-28 12:00 UTC |

## Final Submission Package

- GitHub repo
- Demo video
- Final X post
- Hook address
- Pool address or PoolId
- Registry address
- Vault address
- Demo transaction hashes
- README with setup instructions

