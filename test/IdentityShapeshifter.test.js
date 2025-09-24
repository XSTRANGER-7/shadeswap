const { expect } = require("chai");
const { ethers } = require("hardhat");

// The Oasis Sapphire precompile is available on-chain; tests can run against Hardhat in-memory
// for basic logic, but true encrypt()/decrypt() requires Sapphire runtime. We will mock using
// a local call to ensure functions don't revert, then run a smoke deploy on testnet.

describe("IdentityShapeshifter", function () {
  let Contract, contract, owner, other;
  let tokenA, tokenB;

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    // Deploy mock tokens for address placeholders
    const Mock = await ethers.getContractFactory("MockERC20");
    tokenA = await Mock.deploy("TokenA", "TKA", 18);
    await tokenA.deployed();
    tokenB = await Mock.deploy("TokenB", "TKB", 18);
    await tokenB.deployed();

    Contract = await ethers.getContractFactory("IdentityShapeshifter");
    contract = await Contract.deploy();
    await contract.deployed();
  });

  it("creates identity and sets active on first", async function () {
    const name = "Main Persona";
    const metadata = ethers.utils.toUtf8Bytes("secret:alpha");
    const tx = await contract.createIdentity(name, metadata);
    const receipt = await tx.wait();

    const ids = await contract.connect(owner).getIdentityIds();
    expect(ids.length).to.equal(1);
    const active = await contract.getActiveIdentity();
    expect(active).to.equal(ids[0]);

    // getIdentity will attempt decrypt() which only works on Sapphire.
    // On a standard EVM chain this would revert. So we don't call it here.
  });

  it("switches identity", async function () {
    await (await contract.createIdentity("One", ethers.utils.toUtf8Bytes("a"))).wait();
    await (await contract.createIdentity("Two", ethers.utils.toUtf8Bytes("b"))).wait();
    const ids = await contract.getIdentityIds();
    await expect(contract.switchIdentity(ids[1])).to.emit(contract, 'ActiveIdentityChanged');
    const active = await contract.getActiveIdentity();
    expect(active).to.equal(ids[1]);
  });

  it("logs a simulated swap and enforces minAmountOut", async function () {
    await (await contract.createIdentity("Trader", ethers.utils.toUtf8Bytes("m"))).wait();
    const amountIn = ethers.utils.parseUnits("100", 0);
    const minOutOk = ethers.BigNumber.from(amountIn).mul(98).div(100);
    const minOutTooHigh = minOutOk.add(1);

    // ok path (simulation mode because router is unset)
    await expect(
      contract.swapTokens(tokenA.address, tokenB.address, amountIn, minOutOk)
    ).to.emit(contract, 'SwapExecuted');

    // slippage revert
    await expect(
      contract.swapTokens(tokenA.address, tokenB.address, amountIn, minOutTooHigh)
    ).to.be.revertedWith('Slippage too high');
  });

  it("supports swaps under different personas (simulation mode)", async function () {
    // Create two personas
    await (await contract.createIdentity("Alice", ethers.utils.toUtf8Bytes("x"))).wait();
    await (await contract.createIdentity("Bob", ethers.utils.toUtf8Bytes("y"))).wait();
    const all = await contract.getIdentityIds();

    // Swap under persona 1
    await contract.switchIdentity(all[0]);
    const amountIn = ethers.BigNumber.from(1000);
    const minOut = amountIn.mul(98).div(100);
    await expect(contract.swapTokens(tokenA.address, tokenB.address, amountIn, minOut)).to.emit(contract,'SwapExecuted');

    // Swap under persona 2
    await contract.switchIdentity(all[1]);
    await expect(contract.swapTokens(tokenA.address, tokenB.address, amountIn, minOut)).to.emit(contract,'SwapExecuted');

    // Fetch histories (confidential on Sapphire; here accessible for test owner)
    const h1 = await contract.getSwapHistory(all[0]);
    const h2 = await contract.getSwapHistory(all[1]);
    expect(h1.length).to.equal(1);
    expect(h2.length).to.equal(1);
  });
});
