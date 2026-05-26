import { artifacts, ethers } from "hardhat";

const CREATE2_DEPLOYER = "0x4e59b44847b379578588920cA78FbF26c0B4956C";
const CREATE2_DEPLOYER_RUNTIME =
  "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156014578182fd5b8082525050506014600cf3";

function requiredAddress(name: string, value: string | undefined) {
  if (!value) throw new Error(`${name} is required`);
  return ethers.getAddress(value);
}

function requiredBytes32(name: string, value: string | undefined) {
  if (!value) throw new Error(`${name} is required`);
  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) throw new Error(`${name} must be bytes32`);
  return value;
}

async function ensureCreate2Deployer() {
  const code = await ethers.provider.getCode(CREATE2_DEPLOYER);
  if (code !== "0x") return;

  const [signer] = await ethers.getSigners();
  console.log("CREATE2 deployer missing on this network. Installing singleton deployer...");
  const tx = await signer.sendTransaction({
    to: undefined,
    data: CREATE2_DEPLOYER_RUNTIME
  });
  await tx.wait();

  const newCode = await ethers.provider.getCode(CREATE2_DEPLOYER);
  if (newCode === "0x") {
    throw new Error("CREATE2 deployer installation failed");
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const poolManager = requiredAddress(
    "POOL_MANAGER",
    process.env.POOL_MANAGER ?? "0x360e68faccca8ca495c1b759fd9eee466db9fb32"
  );
  const registryAddress = requiredAddress("REPUTATION_REGISTRY", process.env.REPUTATION_REGISTRY);
  const vaultAddress = requiredAddress("LP_PROTECTION_VAULT", process.env.LP_PROTECTION_VAULT);
  const salt = requiredBytes32("HOOK_SALT", process.env.HOOK_SALT);

  await ensureCreate2Deployer();

  const artifact = await artifacts.readArtifact("RepuFlowV4Hook");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "address", "address"],
    [poolManager, registryAddress, vaultAddress]
  );
  const initCode = ethers.concat([artifact.bytecode, constructorArgs]);
  const expected = ethers.getCreate2Address(CREATE2_DEPLOYER, salt, ethers.keccak256(initCode));

  console.log("Deploying RepuFlowV4Hook with:", await deployer.getAddress());
  console.log("Expected hook address:", expected);

  const existing = await ethers.provider.getCode(expected);
  if (existing === "0x") {
    const tx = await deployer.sendTransaction({
      to: CREATE2_DEPLOYER,
      data: ethers.concat([salt, initCode])
    });
    console.log("CREATE2 tx:", tx.hash);
    await tx.wait();
  } else {
    console.log("Hook already deployed at expected address");
  }

  const deployedCode = await ethers.provider.getCode(expected);
  if (deployedCode === "0x") throw new Error("Hook deployment failed");

  const Registry = await ethers.getContractFactory("ReputationRegistry");
  const registry = Registry.attach(registryAddress);
  const Vault = await ethers.getContractFactory("LpProtectionVault");
  const vault = Vault.attach(vaultAddress);

  if (!(await registry.scoreWriters(expected))) {
    const tx = await registry.setScoreWriter(expected, true);
    console.log("setScoreWriter tx:", tx.hash);
    await tx.wait();
  }

  if (!(await vault.recorders(expected))) {
    const tx = await vault.setRecorder(expected, true);
    console.log("setRecorder tx:", tx.hash);
    await tx.wait();
  }

  console.log("RepuFlowV4Hook:", expected);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

