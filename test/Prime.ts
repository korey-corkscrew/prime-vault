import { time, loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Prime Token & Vault", function () {
  // let owner, otherAccount;

  before(async function () {
    // Contracts are deployed using the first signer/account by default
    [this.owner] = await ethers.getSigners();

    const Prime = await ethers.getContractFactory("PrimeERC20");
    this.prime = await Prime.deploy();

    const Vault = await ethers.getContractFactory("Vault");
    this.vault = await Vault.deploy(this.prime.address);

    this.pusd = await ethers.getContractAt("PUSD", await this.vault.PUSD_TOKEN())

    await this.prime.approve(this.vault.address, ethers.constants.MaxUint256);
  });

  describe("Deployment", function() {
    it("Owner is minted 1000 PRIME", async function () {
      expect(await this.prime.balanceOf(this.owner.address)).to.equal(ethers.utils.parseEther("1000"));
    });
  })

  describe("Deposit", function() {
    it("1000 PRIME", async function () {
      this.depositAmount = ethers.utils.parseEther("1000");
      
      await this.vault.deposit(this.depositAmount);
      const data = await this.vault.users(this.owner.address);
      expect(data[0]).to.equal(this.depositAmount);
      expect(data[1]).to.equal(await time.latest());
      expect(await this.vault.pendingInterest(this.owner.address)).to.equal(0);
    });
  });

  describe("Interest", function() {
    it("After 100 seconds", async function () {
      await mine(100);
      this.pendingInterestAfter100Seconds = await this.vault.pendingInterest(this.owner.address);
      expect(this.pendingInterestAfter100Seconds).to.be.greaterThan(0);
    });

    it("After 200 seconds", async function () {
      await mine(100);
      this.pendingInterestAfter200Seconds = await this.vault.pendingInterest(this.owner.address);
      expect(this.pendingInterestAfter200Seconds).to.be.greaterThan(this.pendingInterestAfter100Seconds);
    });

    it("After 1000 seconds", async function () {
      await mine(800);
      this.pendingInterestAfter1000Seconds = await this.vault.pendingInterest(this.owner.address);
      expect(this.pendingInterestAfter1000Seconds).to.be.greaterThan(this.pendingInterestAfter200Seconds);
    });

    it("After 1 year", async function () {
      await mine(31535000);
      this.pendingInterestAfter1Year = await this.vault.pendingInterest(this.owner.address);
      const expectedInterest = ethers.utils.parseEther("10");
      this.minInterest = expectedInterest.mul(999999).div(1000000);
      this.maxInterest = expectedInterest.mul(1000001).div(1000000);
      expect(this.pendingInterestAfter1Year).to.be.greaterThanOrEqual(this.minInterest);
      expect(this.pendingInterestAfter1Year).to.be.lessThanOrEqual(this.maxInterest);
    });

    it("Claim Interest", async function() {
      await this.vault.claim();
      expect(await this.vault.pendingInterest(this.owner.address)).to.equal(0);
      expect(await this.pusd.balanceOf(this.owner.address)).to.be.greaterThanOrEqual(this.minInterest);
      expect(await this.pusd.balanceOf(this.owner.address)).to.be.lessThanOrEqual(this.maxInterest);
    })
  });
});
