# Deployment Record

## Network

- Network: X Layer
- Chain ID: 196
- RPC: `https://rpc.xlayer.tech`
- Uniswap v4 PoolManager: `0x360e68faccca8ca495c1b759fd9eee466db9fb32`

## RepuFlow Contracts

- ReputationRegistry: `0x8C235BBb0468c26a45C34C627cB70ad9a6072982`
- LpProtectionVault: `0x7C19c7cE8810f7af82e3852E6435159996Ba98a0`
- RepuFlowHook demo facade: `0x1589A16849d1ea38d9E47b6b59D70306CF7b990b`
- RepuFlowV4Hook: `0xCA3F1a914C3DBddC18754Be684c0A982838980C0`
- Mock OKB: `0x0264f0C02201F512C012D812309f23093311Fe0B`
- Mock USD: `0x3AA351f84B6f76ED14463F32f97fA22ECB2613Fd`
- DemoPoolOperator: `0x6e0F7C563C3aDc3f9D682570549a7Bb3a8C443D1`
- V4 Pool / PoolId: `0x0d136c98265159561baef57aa8c312a29ae12c97edc10eb97fb14a023ada1631`

## Hook Address Mining

- Required flags: `beforeSwap | afterSwap`
- Required flag value: `0x00c0`
- CREATE2 deployer: `0x4e59b44847b379578588920cA78FbF26c0B4956C`
- Salt: `0x0000000000000000000000000000000000000000000000000000000000001173`
- Predicted hook address: `0xCA3F1a914C3DBddC18754Be684c0A982838980C0`
- Init code hash: `0x4de5e1fe32ca87cdd81ed9315295e6c7a94d8f217d3fa0b9cf65a36df83bc232`

## Demo Transactions

- RepuFlowV4Hook CREATE2 deployment: `0x3b6cef634bbff32e884a120063b11d3a8af793a5154905a7220c4094dfa44c7e`
- Registry setScoreWriter: `0x112a6bcd2761eb69d9a7d7178379f6b0a685619dde4f34c2b3569ca2f7fea5bd`
- Vault setRecorder: `0xcf9340cd37e94e799017e612f21c4916cafeb89a1894bc1f9273f01c85470a45`
- Pool initialize: `0xdb85fcf0e60bb61a824cc705d9b80037c22175ef6cb5bb17a6cba70e86994b47`
- Add liquidity: `0x3af81d54e0f14f7a88639430f378cf19c87ed27f31fa3051c9111376ab2a6e40`
- Normal trader swap: `0x959369b5dc76071abd6c46de400e932fe8b3f6c355aab578f2669738a7b9745f`
- Good agent swap: `0x6e5d75614fc01bccda73e42630a5a3d5922a087e58f6f6cb17b505e98bd14398`
- Toxic flow swap: `0x485e9480935041e5d6ca3f22faf50993f4ecf14bea3a3cea876e82986e2f0d79`
- Reputation update:
- LP protection surcharge: `totalProtectionBps = 80`

## Notes

- The v4 pool must use a dynamic fee pool so the `beforeSwap` LP fee override is honored.
- RepuFlow stores display fees in bps and converts to Uniswap v4 fee units before returning the override.
