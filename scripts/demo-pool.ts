import { ethers } from "hardhat";

const HOOK = "0xCA3F1a914C3DBddC18754Be684c0A982838980C0";
const TOKEN_A = "0x0264f0C02201F512C012D812309f23093311Fe0B";
const TOKEN_B = "0x3AA351f84B6f76ED14463F32f97fA22ECB2613Fd";
const POOL_MANAGER = "0x360e68faccca8ca495c1b759fd9eee466db9fb32";
const UINT160_MAX = (1n << 160n) - 1n;

function sortTokens(a: string, b: string) {
  return BigInt(a) < BigInt(b) ? [a, b] : [b, a];
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Demo operator deployer:", deployerAddress);

  const Operator = await ethers.getContractFactory("DemoPoolOperator");
  const operator = await Operator.deploy(POOL_MANAGER);
  await operator.waitForDeployment();
  const operatorAddress = await operator.getAddress();
  console.log("DemoPoolOperator:", operatorAddress);

  const [currency0, currency1] = sortTokens(TOKEN_A, TOKEN_B);
  const key = {
    currency0,
    currency1,
    fee: 0x800000,
    tickSpacing: 60,
    hooks: HOOK
  };

  const poolId = await operator.poolId.staticCall(key);
  console.log("PoolId:", poolId);

  try {
    const initTx = await operator.initialize(key);
    console.log("initialize tx:", initTx.hash);
    await initTx.wait();
  } catch (error) {
    console.log("initialize skipped or failed; continuing with existing pool");
  }

  const token0 = await ethers.getContractAt("MockToken", currency0);
  const token1 = await ethers.getContractAt("MockToken", currency1);

  const mintAmount = ethers.parseEther("1000000");
  await (await token0.mint(deployerAddress, mintAmount)).wait();
  await (await token1.mint(deployerAddress, mintAmount)).wait();
  await (await token0.approve(operatorAddress, ethers.MaxUint256)).wait();
  await (await token1.approve(operatorAddress, ethers.MaxUint256)).wait();
  console.log("Minted and approved mock tokens");

  const liquidityTx = await operator.addWideLiquidity(key, ethers.parseEther("1000"), "0x");
  console.log("add liquidity tx:", liquidityTx.hash);
  await liquidityTx.wait();

  const hookDataNormal = ethers.AbiCoder.defaultAbiCoder().encode(["uint160"], [100]);
  const hookDataGood = ethers.AbiCoder.defaultAbiCoder().encode(["uint160"], [300]);
  const hookDataToxic = ethers.AbiCoder.defaultAbiCoder().encode(["uint160"], [100]);

  const normalTx = await operator.swap(
    key,
    { zeroForOne: true, amountSpecified: -ethers.parseEther("1"), sqrtPriceLimitX96: 4295128740n },
    hookDataNormal
  );
  console.log("normal trader swap tx:", normalTx.hash);
  await normalTx.wait();

  const goodTx = await operator.swap(
    key,
    { zeroForOne: true, amountSpecified: -ethers.parseEther("1"), sqrtPriceLimitX96: 4295128740n },
    hookDataGood
  );
  console.log("good agent swap tx:", goodTx.hash);
  await goodTx.wait();

  const toxicTx = await operator.swap(
    key,
    { zeroForOne: true, amountSpecified: -ethers.parseEther("20"), sqrtPriceLimitX96: 4295128740n },
    hookDataToxic
  );
  console.log("toxic flow swap tx:", toxicTx.hash);
  await toxicTx.wait();

  const registry = await ethers.getContractAt("ReputationRegistry", "0x8C235BBb0468c26a45C34C627cB70ad9a6072982");
  const vault = await ethers.getContractAt("LpProtectionVault", "0x7C19c7cE8810f7af82e3852E6435159996Ba98a0");
  console.log("Deployer reputation:", (await registry.scoreOf(deployerAddress)).toString());
  console.log("Total protection bps:", (await vault.totalProtectionBps()).toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
