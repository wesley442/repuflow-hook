import { expect } from "chai";
import { ethers } from "hardhat";

describe("RepuFlowHook", function () {
  async function deployFixture() {
    const [owner, normalTrader, goodAgent, toxicTrader] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("ReputationRegistry");
    const registry = await Registry.deploy();

    const Vault = await ethers.getContractFactory("LpProtectionVault");
    const vault = await Vault.deploy();

    const Hook = await ethers.getContractFactory("RepuFlowHook");
    const hook = await Hook.deploy(await registry.getAddress(), await vault.getAddress());

    await registry.setScoreWriter(await hook.getAddress(), true);
    await vault.setRecorder(await hook.getAddress(), true);

    await registry.setScore(await goodAgent.getAddress(), 90);
    await registry.setScore(await toxicTrader.getAddress(), 20);

    return { owner, normalTrader, goodAgent, toxicTrader, registry, vault, hook };
  }

  it("quotes the base fee for neutral flow from a normal trader", async function () {
    const { normalTrader, hook } = await deployFixture();

    const quote = await hook.quoteSwap.staticCall(await normalTrader.getAddress(), ethers.parseEther("1"), 100);

    expect(quote.baseFeeBps).to.equal(30);
    expect(quote.finalFeeBps).to.equal(30);
    expect(quote.reputationScore).to.equal(50);
    expect(quote.quality).to.equal(1);
  });

  it("discounts helpful flow from a high-reputation agent", async function () {
    const { goodAgent, hook } = await deployFixture();

    const quote = await hook.quoteSwap.staticCall(await goodAgent.getAddress(), -ethers.parseEther("1"), 300);

    expect(quote.quality).to.equal(0);
    expect(quote.reputationDiscountBps).to.equal(10);
    expect(quote.finalFeeBps).to.equal(10);
  });

  it("surcharges toxic flow and records LP protection", async function () {
    const { toxicTrader, registry, vault, hook } = await deployFixture();
    const trader = await toxicTrader.getAddress();

    const quote = await hook.quoteSwap.staticCall(trader, ethers.parseEther("20"), 100);
    expect(quote.quality).to.equal(2);
    expect(quote.finalFeeBps).to.equal(110);
    expect(quote.surchargeBps).to.equal(80);

    await expect(hook.settleAfterSwap(trader, ethers.parseEther("20"), 100))
      .to.emit(hook, "SwapSettled")
      .withArgs(trader, 2, 12, 80);

    expect(await registry.scoreOf(trader)).to.equal(12);
    expect(await vault.totalProtectionBps()).to.equal(80);
  });

  it("updates reputation after neutral and helpful swaps", async function () {
    const { normalTrader, goodAgent, registry, hook } = await deployFixture();

    await hook.settleAfterSwap(await normalTrader.getAddress(), ethers.parseEther("1"), 100);
    expect(await registry.scoreOf(await normalTrader.getAddress())).to.equal(51);

    await hook.settleAfterSwap(await goodAgent.getAddress(), -ethers.parseEther("1"), 300);
    expect(await registry.scoreOf(await goodAgent.getAddress())).to.equal(92);
  });

  it("keeps fees inside bounds", async function () {
    const { hook } = await deployFixture();

    expect(await hook.clampFee(-100)).to.equal(5);
    expect(await hook.clampFee(1000)).to.equal(150);
    expect(await hook.clampFee(42)).to.equal(42);
  });
});

