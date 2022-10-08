import { ethers } from "hardhat";

async function main() {
  const Prime = await ethers.getContractFactory("PrimeERC20");
  const prime = await Prime.deploy();

  await prime.deployed();
  
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(prime.address);

  await vault.deployed();

  console.log(`Prime deployed to ${prime.address}. Vault deployed to ${vault.address}`);

  const approve = await prime.approve(vault.address, ethers.constants.MaxUint256);
  await approve.wait();
  const deposit = await vault.deposit(ethers.utils.parseEther("100"));
  await deposit.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
