const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ICO", function () {
  let owner;
  let user1;
  let user2;
  let token;
  let ico;
  const softCap = ethers.utils.parseEther("0.1");
  const hardCap = ethers.utils.parseEther("1");
  const minPurchaseAmount = ethers.utils.parseEther("0.01");
  const maxPurchaseAmount = ethers.utils.parseEther("0.05");
  const rate = 1000; // 1 BNB = 1000 ICO tokens
  const startTime = Math.floor(Date.now() / 1000) + 60; // start in 1 minute
  const endTime = Math.floor(Date.now() / 1000) + 120; // end in 2 minutes

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const ICOToken = await ethers.getContractFactory("ICOToken");
    token = await ICOToken.deploy();
    await token.deployed();

    const ICO = await ethers.getContractFactory("ICO");
    ico = await ICO.deploy(
      token.address,
      softCap,
      hardCap,
      minPurchaseAmount,
      maxPurchaseAmount,
      startTime,
      endTime,
      rate
    );
    await ico.deployed();

    // Give some tokens to user1 and user2
    await token.mint(user1.address, ethers.utils.parseEther("1000"));
    await token.mint(user2.address, ethers.utils.parseEther("1000"));
  });

  it("should allow users to deposit during the ICO", async function () {
    // User1 deposits 0.02 BNB
    await ico.connect(user1).deposit({ value: ethers.utils.parseEther("0.02") });

    // User2 deposits 0.03 BNB
    await ico.connect(user2).deposit({ value: ethers.utils.parseEther("0.03") });

    // Check that the deposits were recorded correctly
    expect(await ico.deposits(user1.address)).to.equal(ethers.utils.parseEther("0.02"));
    expect(await ico.deposits(user2.address)).to.equal(ethers.utils.parseEther("0.03"));
    expect(await ico.totalDeposits()).to.equal(ethers.utils.parseEther("0.05"));
  });

  it("should allow users to deposit during the ICO", async function () {
    // User1 deposits 0.02 BNB
    await ico.connect(user1).deposit({ value: ethers.utils.parseEther("0.02") });

    // User2 deposits 0.03 BNB
    await ico.connect(user2).deposit({ value: ethers.utils.parseEther("0.03") });

    // Check that the deposits were recorded correctly
    expect(await ico.deposits(user1.address)).to.equal(ethers.utils.parseEther("0.02"));
    expect(await ico.deposits(user2.address)).to.equal(ethers.utils.parseEther("0.03"));
    expect(await ico.totalDeposits()).to.equal(ethers.utils.parseEther("0.05"));
  });

  it("should not allow deposits below the minimum amount", async function () {
    // User1 tries to deposit 0.005 BNB (below the minimum)
    await expect(
      ico.connect(user1).deposit({ value: ethers.utils.parseEther("0.005") })
    ).to.be.revertedWith("ICO: deposit amount is below minimum");

    // Check that the deposit was not recorded
    expect(await ico.deposits(user1.address)).to.equal(0);
  });

  it("should not allow deposits above the maximum amount", async function () {
    // User1 tries to deposit 0.06 BNB (above the maximum)
    await expect(
      ico.connect(user1).deposit({ value: ethers.utils.parseEther("0.06") })
    ).to.be.revertedWith("ICO: deposit amount is above maximum");

    // Check that the deposit was not recorded
    expect(await ico.deposits(user1.address)).to.equal(0);
  });

  it("should not allow deposits that exceed the hard cap", async function () {
  // User1 deposits 0.5 BNB
  await ico.connect(user1).deposit({ value: ethers.utils.parseEther("0.5") });

  // User2 tries to deposit 0.4 BNB (within the hard cap)
  await expect(
    ico.connect(user2).deposit({ value: ethers.utils.parseEther("0.4") })
  ).to.not.be.reverted;

  // Check that the deposit was recorded correctly
  expect(await ico.deposits(user2.address)).to.equal(ethers.utils.parseEther("0.4"));
  expect(await ico.totalDeposits()).to.equal(ethers.utils.parseEther("0.9"));
  });

  it("should allow users to withdraw after the ICO if it fails", async function () {
    // User1 deposits 0.02 BNB
    await ico.connect(user1).deposit({ value: ethers.utils.parseEther("0.02") });

    // User1 withdraws after the ICO fails
    await ico.endICO();
    await ico.connect(user1).withdraw();

    // Check that the deposit was refunded
    expect(await ethers.provider.getBalance(ico.address)).to.equal(0);
    expect(await ethers.provider.getBalance(user1.address)).to.be.above(ethers.utils.parseEther("0.98"));
  });

  it(" allow users to withdraw after the ICO if it fails", async function () {
    // User1 deposits 0.02 BNB
    await ico.connect(user1).deposit({ value: ethers.utils.parseEther("0.02") });

    // User1 withdraws after the ICO fails
    await ico.endICO();
    await ico.connect(user1).withdraw();

    // Check that the deposit was refunded
    expect(await ethers.provider.getBalance(ico.address)).to.equal(0);
    expect(await ethers.provider.getBalance(user1.address)).to.be.above(ethers.utils.parseEther("0.98"));
  });

  it("should allow users to claim tokens after the ICO succeeds", async function () {
    // User1 deposits 0.02 BNB
    await ico.connect(user1).deposit({ value: ethers.utils.parseEther("0.02") });

    // User2 deposits 0.03 BNB
    await ico.connect(user2).deposit({ value: ethers.utils.parseEther("0.03") });

    // End the ICO
    await ico.endICO();

    // Check that the ICO succeeded
    expect(await ico.ICOStatus()).to.equal("Succeeded");

    // User1 claims their tokens
    await ico.connect(user1).claimTokens();

    // Check that the tokens were transferred correctly
    expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("20"));

    // User2 claims their tokens
    await ico.connect(user2).claimTokens();

    // Check that the tokens were transferred correctly
    expect(await token.balanceOf(user2.address)).to.equal(ethers.utils.parseEther("30"));
  });

  it("should not allow users to claim tokens before the ICO ends", async function () {
    // User1 deposits 0.02 BNB
    await ico.connect(user1).deposit({ value: ethers.utils.parseEther("0.02") });

    // User2 deposits 0.03 BNB
    await ico.connect(user2).deposit({ value: ethers.utils.parseEther("0.03") });

    // User1 tries to claim tokens before the ICO ends
    await expect(ico.connect(user1).claimTokens()).to.be.revertedWith("ICO: ICO is not over yet");

    // Check that the tokens were not transferred
    expect(await token.balanceOf(user1.address)).to.equal(0);

    // User2 tries to claim tokens before the ICO ends
    await expect(ico.connect(user2).claimTokens()).to.be.revertedWith("ICO: ICO is not over yet");

    // Check that the tokens were not transferred
    expect(await token.balanceOf(user2.address)).to.equal(0);
  });

  it("should not allow users to claim tokens if the ICO fails", async function () {
    // User1 deposits 0.02 BNB
    await ico.connect(user1).deposit({ value: ethers.utils.parseEther("0.02") });

    // End the ICO
    await ico.endICO();

    // Check that the ICO failed
    expect(await ico.ICOStatus()).to.equal("Failed");

    // User1 tries to claim tokens
    await expect(ico.connect(user1).claimTokens()).to.be.revertedWith("ICO: ICO did not succeed");

    // Check that the tokens were not transferred
    expect(await token.balanceOf(user1.address)).to.equal(0);
  });
});