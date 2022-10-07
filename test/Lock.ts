import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployPrime() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Prime = await ethers.getContractFactory("PrimeERC20");
    const prime = await Prime.deploy();

    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(prime.address);

    return { prime, vault, owner, otherAccount };
  }

  // describe("Mint", function() {
  //   it("1000 minted", async function () {
  //     const {prime, vault, owner} = await deployPrime();
  //     expect(await prime.balanceOf(owner.address)).to.equal(1000);
  //   });
  // })

  describe("Deposit", function() {
    it("1000 prime", async function () {
      const {prime, vault, owner} = await deployPrime();
      await prime.approve(vault.address, 1000);
      await vault.deposit(1000);
      const data = await vault.user(owner.address);
      expect(data[0]).to.equal(1000);
    })
  })
});
