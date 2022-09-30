// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PrimeERC20 is ERC20 {
    constructor() ERC20("Prime", "PRIME") {}
}
