const { expect } = require("chai");

describe("ICO Contract", function () {
  let ICO;
  let owner;
  let investor1;
  let investor2;
  let investors;

  beforeEach(async function () {
    [owner, investor1, investor2, ...investors] = await ethers.getSigners();
    const ICOContract = await ethers.getContractFactory("ICO");
    ICO = await ICOContract.deploy();
    await ICO.deployed();
  });

  it("should have the correct token name, symbol, and decimal", async function () {
    expect(await ICO.name()).to.equal("ICO");
    expect(await ICO.symbol()).to.equal("ICO");
    expect(await ICO.decimals()).to.equal(18);
  });

  it("should allow investors to purchase tokens within the minimum and maximum purchase amount", async function () {
    const purchaseAmount = ethers.utils.parseEther("0.02");
    await ICO.connect(investor1).purchaseTokens({ value: purchaseAmount });
    expect(await ICO.balanceOf(investor1.address)).to.equal(purchaseAmount.mul(1000));
  });

  it("should not allow investors to purchase tokens below the minimum purchase amount", async function () {
    const purchaseAmount = ethers.utils.parseEther("0.005");
    await expect(ICO.connect(investor1).purchaseTokens({ value: purchaseAmount })).to.be.revertedWith("Minimum purchase amount not met");
  });

  it("should not allow investors to purchase tokens above the maximum purchase amount", async function () {
    const purchaseAmount = ethers.utils.parseEther("0.06");
    await expect(ICO.connect(investor1).purchaseTokens({ value: purchaseAmount })).to.be.revertedWith("Maximum purchase amount exceeded");
  });

  it("should not allow investors to purchase tokens after the end time", async function () {
    const purchaseAmount = ethers.utils.parseEther("0.02");
    await network.provider.send("evm_setNextBlockTimestamp", [Math.floor(Date.now() / 1000) + 86400]);
    await expect(ICO.connect(investor1).purchaseTokens({ value: purchaseAmount })).to.be.revertedWith("ICO has ended");
  });

  it("should transfer the correct amount of tokens to the investor after purchase", async function () {
    const purchaseAmount = ethers.utils.parseEther("0.02");
    await ICO.connect(investor1).purchaseTokens({ value: purchaseAmount });
    expect(await ICO.balanceOf(investor1.address)).to.equal(purchaseAmount.mul(1000));
  });

  it("should not allow investors to purchase tokens after the hard cap has been reached", async function () {
    const purchaseAmount = ethers.utils.parseEther("0.5");
    await ICO.connect(investor1).purchaseTokens({ value: purchaseAmount });
    await expect(ICO.connect(investor2).purchaseTokens({ value: purchaseAmount })).to.be.revertedWith("Hard cap reached");
  });

  it("should not allow investors to purchase tokens if the ICO has not reached the soft cap", async function () {
    const purchaseAmount = ethers.utils.parseEther("0.02");
    await expect(ICO.connect(investor1).purchaseTokens({ value: purchaseAmount })).to.be.revertedWith("Soft cap not reached");
  });

  it("should allow the owner to withdraw the funds after the ICO has ended and the soft cap has been reached", async function () {
    const purchaseAmount = ethers.utils.parseEther("0.1");
    await ICO.connect(investor1).purchaseTokens({ value: purchaseAmount });
    await network.provider.send("evm_setNextBlockTimestamp", [Math.floor(Date.now() / 1000) + 86400]);
    await ICO.withdrawFunds();
    expect(await owner.getBalance()).to.equal(purchaseAmount);
  });
});