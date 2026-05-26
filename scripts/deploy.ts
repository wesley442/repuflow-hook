import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", await deployer.getAddress());

  const Registry = await ethers.getContractFactory("ReputationRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const Vault = await ethers.getContractFactory("LpProtectionVault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();

  const Hook = await ethers.getContractFactory("RepuFlowHook");
  const hook = await Hook.deploy(await registry.getAddress(), await vault.getAddress());
  await hook.waitForDeployment();

  await (await registry.setScoreWriter(await hook.getAddress(), true)).wait();
  await (await vault.setRecorder(await hook.getAddress(), true)).wait();

  const Token = await ethers.getContractFactory("MockToken");
  const tokenA = await Token.deploy("Mock OKB", "mOKB");
  await tokenA.waitForDeployment();
  const tokenB = await Token.deploy("Mock USD", "mUSD");
  await tokenB.waitForDeployment();

  console.log("ReputationRegistry:", await registry.getAddress());
  console.log("LpProtectionVault:", await vault.getAddress());
  console.log("RepuFlowHook:", await hook.getAddress());
  console.log("Mock OKB:", await tokenA.getAddress());
  console.log("Mock USD:", await tokenB.getAddress());
  console.log("");
  console.log("Next for v4 hook mining:");
  console.log(`REPUTATION_REGISTRY=${await registry.getAddress()}`);
  console.log(`LP_PROTECTION_VAULT=${await vault.getAddress()}`);
  console.log("pnpm mine:hook");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
