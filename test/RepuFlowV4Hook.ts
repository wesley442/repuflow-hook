import { expect } from "chai";
import { ethers } from "hardhat";

const OVERRIDE_FEE_FLAG = 0x400000;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("RepuFlowV4Hook", function () {
  async function deployFixture() {
    const [manager, normalTrader, goodAgent, toxicTrader] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("ReputationRegistry");
    const registry = await Registry.deploy();

    const Vault = await ethers.getContractFactory("LpProtectionVault");
    const vault = await Vault.deploy();

    const Hook = await ethers.getContractFactory("RepuFlowV4HookHarness");
    const hook = await Hook.deploy(await manager.getAddress(), await registry.getAddress(), await vault.getAddress());

    await registry.setScoreWriter(await hook.getAddress(), true);
    await vault.setRecorder(await hook.getAddress(), true);

    await registry.setScore(await goodAgent.getAddress(), 90);
    await registry.setScore(await toxicTrader.getAddress(), 20);

    const key = {
      currency0: ZERO_ADDRESS,
      currency1: "0x0000000000000000000000000000000000000001",
      fee: 0x800000,
      tickSpacing: 60,
      hooks: await hook.getAddress()
    };

    return { normalTrader, goodAgent, toxicTrader, registry, vault, hook, key };
  }

  it("returns a v4 dynamic fee override from beforeSwap", async function () {
    const { goodAgent, hook, key } = await deployFixture();
    const params = {
      zeroForOne: true,
      amountSpecified: -ethers.parseEther("1"),
      sqrtPriceLimitX96: 0
    };
    const hookData = ethers.AbiCoder.defaultAbiCoder().encode(["uint160"], [300]);

    const result = await hook.exposedBeforeSwap.staticCall(await goodAgent.getAddress(), key, params, hookData);
    const overrideFee = Number(result[2]);

    expect(overrideFee & OVERRIDE_FEE_FLAG).to.equal(OVERRIDE_FEE_FLAG);
    expect(overrideFee & ~OVERRIDE_FEE_FLAG).to.equal(1000);
  });

  it("updates reputation and LP protection from afterSwap", async function () {
    const { toxicTrader, registry, vault, hook, key } = await deployFixture();
    const trader = await toxicTrader.getAddress();
    const params = {
      zeroForOne: true,
      amountSpecified: ethers.parseEther("20"),
      sqrtPriceLimitX96: 0
    };
    const hookData = ethers.AbiCoder.defaultAbiCoder().encode(["uint160"], [100]);

    await expect(hook.exposedAfterSwap(trader, key, params, hookData))
      .to.emit(hook, "SwapSettled")
      .withArgs(trader, 2, 12, 80);

    expect(await registry.scoreOf(trader)).to.equal(12);
    expect(await vault.totalProtectionBps()).to.equal(80);
  });
});

