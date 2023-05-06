const { expect } = require("chai");

describe("MyContract", function () {
  let MyContract;

  beforeEach(async function () {
    const MyContractContract = await ethers.getContractFactory("MyContract");
    MyContract = await MyContractContract.deploy();
    await MyContract.deployed();
  });

  it("should set the number correctly", async function () {
    const number = 42;
    await MyContract.setNumber(number);
    expect(await MyContract.myNumber()).to.equal(number);
  });
});