const { expect } = require("chai");

describe("ICOToken Contract", function () {
  let ICOToken;
  let owner;
  let investor1;
  let investor2;
  let investors;

  beforeEach(async function () {
    [owner, investor1, investor2, ...investors] = await ethers.getSigners();
    const ICOTokenContract = await ethers.getContractFactory("ICOToken");
    ICOToken = await ICOTokenContract.deploy();
    await ICOToken.deployed();
  });

  it("should have the correct name, symbol, and decimal", async function () {
    expect(await ICOToken.name()).to.equal("ICO Token");
    expect(await ICOToken.symbol()).to.equal("ICO");
    expect(await ICOToken.decimals()).to.equal(18);
  });

  it("should have the correct initial supply", async function () {
    expect(await ICOToken.totalSupply()).to.equal(ethers.utils.parseEther("500000"));
  });

  it("should allow the owner to mint new tokens", async function () {
    const mintAmount = ethers.utils.parseEther("1000");
    await ICOToken.connect(owner).mint(investor1.address, mintAmount);
    expect(await ICOToken.balanceOf(investor1.address)).to.equal(mintAmount);
  });

  it("should not allow non-owners to mint new tokens", async function () {
    const mintAmount = ethers.utils.parseEther("1000");
    await expect(ICOToken.connect(investor1).mint(investor2.address, mintAmount)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should allow the owner to burn tokens", async function () {
    const burnAmount = ethers.utils.parseEther("1000");
    await ICOToken.connect(owner).burn(burnAmount);
    expect(await ICOToken.totalSupply()).to.equal(ethers.utils.parseEther("499000"));
  });

  it("should not allow burning more tokens than the balance", async function () {
    const burnAmount = ethers.utils.parseEther("1000000");
    await expect(ICOToken.connect(owner).burn(burnAmount)).to.be.revertedWith("ERC20: burn amount exceeds balance");
  });

  it("should allow investors to transfer tokens", async function () {
    const transferAmount = ethers.utils.parseEther("1000");
    await ICOToken.connect(owner).mint(investor1.address, transferAmount);
    await ICOToken.connect(investor1).transfer(investor2.address, transferAmount);
    expect(await ICOToken.balanceOf(investor2.address)).to.equal(transferAmount);
  });

  it("should not allow investors to transfer more tokens than they have", async function () {
    const transferAmount = ethers.utils.parseEther("1000");
    await expect(ICOToken.connect(investor1).transfer(investor2.address, transferAmount)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("should emit Transfer event on successful transfer", async function () {
    const transferAmount = ethers.utils.parseEther("1000");
    await ICOToken.connect(owner).mint(investor1.address, transferAmount);
    const tx = await ICOToken.connect(investor1).transfer(investor2.address, transferAmount);
    const receipt = await tx.wait();
    const transferEvent = receipt.events.find((event) => event.event === "Transfer");
    expect(transferEvent.args.from).to.equal(investor1.address);
    expect(transferEvent.args.to).to.equal(investor2.address);
    expect(transferEvent.args.value).to.equal(transferAmount);
  });

  it("should emit Approval event on successful approval", async function () {
    const approvalAmount = ethers.utils.parseEther("1000");
    const tx = await ICOToken.connect(owner).approve(investor1.address, approvalAmount);
    const receipt = await tx.wait();
    const approvalEvent = receipt.events.find((event) => event.event === "Approval");
    expect(approvalEvent.args.owner).to.equal(owner.address);
    expect(approvalEvent.args.spender).to.equal(investor1.address);
    expect(approvalEvent.args.value).to.equal(approvalAmount);
  });

  it("should allow the approved spender to transfer tokens on behalf of the owner", async function () {
    const transferAmount = ethers.utils.parseEther("1000");
    await ICOToken.connect(owner).mint(owner.address, transferAmount);
    await ICOToken.connect(owner).approve(investor1.address, transferAmount);
    await ICOToken.connect(investor1).transferFrom(owner.address, investor2.address, transferAmount);
    expect(await ICOToken.balanceOf(investor2.address)).to.equal(transferAmount);
  });
});