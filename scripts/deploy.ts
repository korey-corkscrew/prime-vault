import { ethers } from "hardhat";

async function main() {
  const Prime = await ethers.getContractFactory("PrimeERC20");
  const prime = await Prime.deploy();

  await prime.deployed();

  console.log(`Prime deployed to ${prime.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
