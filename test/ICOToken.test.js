const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ICOToken", function () {
  let owner;
  let user1;
  let user2;
  let token;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const ICOToken = await ethers.getContractFactory("ICOToken");
    token = await ICOToken.deploy();
    await token.deployed();
  });

  it("should have the correct name, symbol, and decimals", async function () {
    expect(await token.name()).to.equal("ICO Token");
    expect(await token.symbol()).to.equal("ICO");
    expect(await token.decimals()).to.equal(18);
  });

  it("should have a total supply of 0 at deployment", async function () {
    expect(await token.totalSupply()).to.equal(0);
  });

  it("should allow the owner to mint tokens", async function () {
    // Mint 1000 tokens to user1
    await token.connect(owner).mint(user1.address, ethers.utils.parseEther("1000"));
    // Check that the balance was updated
    expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("1000"));
    expect(await token.totalSupply()).to.equal(ethers.utils.parseEther("1000"));
  });

  it("should not allow non-owners to mint tokens", async function () {
    // User1 tries to mint tokens
    await expect(
      token.connect(user1).mint(user2.address, ethers.utils.parseEther("1000"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
    // Check that the balance was not updated
    expect(await token.balanceOf(user2.address)).to.equal(0);
    expect(await token.totalSupply()).to.equal(0);
  });

  it("should allow the owner to burn tokens", async function () {
    // Mint 1000 tokens to user1
    await token.connect(owner).mint(user1.address, ethers.utils.parseEther("1000"));
    // Burn 500 tokens from user1
    await token.connect(owner).burn(user1.address, ethers.utils.parseEther("500"));

    // Check that the balance was updated
    expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("500"));
    expect(await token.totalSupply()).to.equal(ethers.utils.parseEther("500"));
  });

  it("should not allow non-owners to burn tokens", async function () {
    // Mint 1000 tokens to user1
    await token.connect(owner).mint(user1.address, ethers.utils.parseEther("1000"));
    // User1 tries to burn tokens
    await expect(
      token.connect(user1).burn(user1.address, ethers.utils.parseEther("500"))
    ).to.be.revertedWith("Ownable: caller is not the owner");

    // Check that the balance was not updated
    expect(await token.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("1000"));
    expect(await token.totalSupply()).to.equal(ethers.utils.parseEther("1000"));
  });
});