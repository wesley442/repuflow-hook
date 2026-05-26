import { ethers, artifacts } from "hardhat";

const CREATE2_DEPLOYER = "0x4e59b44847b379578588920cA78FbF26c0B4956C";
const BEFORE_SWAP_FLAG = 1 << 7;
const AFTER_SWAP_FLAG = 1 << 6;
const ALL_HOOK_MASK = (1 << 14) - 1;
const MAX_ITERATIONS = 1_000_000;

function normalizeAddress(value: string | undefined, fallback: string) {
  return ethers.getAddress(value && value.length > 0 ? value : fallback);
}

async function main() {
  const poolManager = normalizeAddress(
    process.env.POOL_MANAGER,
    "0x360e68faccca8ca495c1b759fd9eee466db9fb32"
  );
  const registry = normalizeAddress(process.env.REPUTATION_REGISTRY, ethers.ZeroAddress);
  const vault = normalizeAddress(process.env.LP_PROTECTION_VAULT, ethers.ZeroAddress);
  const deployer = normalizeAddress(process.env.CREATE2_DEPLOYER, CREATE2_DEPLOYER);
  const requiredFlags = BEFORE_SWAP_FLAG | AFTER_SWAP_FLAG;

  const artifact = await artifacts.readArtifact("RepuFlowV4Hook");
  const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "address", "address"],
    [poolManager, registry, vault]
  );
  const initCode = ethers.concat([artifact.bytecode, constructorArgs]);
  const initCodeHash = ethers.keccak256(initCode);

  for (let salt = 0; salt < MAX_ITERATIONS; salt += 1) {
    const saltHex = ethers.toBeHex(salt, 32);
    const address = ethers.getCreate2Address(deployer, saltHex, initCodeHash);
    const addressFlags = Number(BigInt(address) & BigInt(ALL_HOOK_MASK));

    if (addressFlags === requiredFlags) {
      console.log("RepuFlowV4Hook salt found");
      console.log("CREATE2 deployer:", deployer);
      console.log("PoolManager:", poolManager);
      console.log("Registry:", registry);
      console.log("Vault:", vault);
      console.log("Required flags:", `0x${requiredFlags.toString(16)}`);
      console.log("Salt:", saltHex);
      console.log("Hook address:", address);
      console.log("Init code hash:", initCodeHash);
      return;
    }
  }

  throw new Error(`No salt found in ${MAX_ITERATIONS} iterations`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

