# Demo Script

Target length: 1-3 minutes.

## Video Structure

### 0:00-0:20 Problem

Script:

```text
Liquidity providers often subsidize toxic flow, while high-quality traders and AI agents get no persistent execution advantage. RepuFlow Hook changes that with reputation-aware dynamic fees for Uniswap v4 pools on X Layer.
```

Visual:

- Show title screen or frontend home.
- Show one-line tagline.

### 0:20-0:50 Mechanism

Script:

```text
Before every swap, the Hook checks two signals: flow quality and trader reputation. Helpful flow receives a lower fee. Toxic or high-impact flow pays more, and the surcharge is tracked as LP protection value. After the swap, the Hook updates the trader reputation profile onchain.
```

Visual:

- Show architecture diagram or mechanism section.
- Show fee table.

### 0:50-1:40 Live Demo

Script:

```text
Here is the same pool with three different trader profiles.

The normal trader receives the base fee.
The good agent receives a discount because of clean historical behavior.
The toxic flow profile receives a higher fee, and the extra charge increases the LP protection value.
```

Visual:

- Connect wallet.
- Select Normal Trader and run swap.
- Select Good Agent and show lower fee.
- Select Toxic Flow and show higher fee plus vault update.

### 1:40-2:10 Onchain Proof

Script:

```text
The Hook, pool, registry, and vault are deployed on X Layer. These transaction hashes show the Hook being triggered by real swaps.
```

Visual:

- Show README contract address section.
- Show explorer or tx hash list.

### 2:10-2:30 Close

Script:

```text
RepuFlow turns Uniswap v4 pools into reputation-aware execution venues. Good agents get cheaper execution. Toxic flow pays more to LPs.
```

Visual:

- Show final project name and links.

## Required Screens

- Frontend fee preview
- Successful swap
- Reputation score
- LP protection vault value
- Contract addresses or explorer page

## Backup Demo

If frontend deployment fails, record terminal output:

1. Run deploy script.
2. Run normal trader swap script.
3. Run good agent swap script.
4. Run toxic flow swap script.
5. Show event logs with different fee values.

