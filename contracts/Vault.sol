// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./PrimeERC20.sol";

contract PUSD is ERC20 {
    constructor() ERC20("PUSD", "PUSD") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract Vault {
    PrimeERC20 public immutable prime;
    PUSD public immutable pusd;
    uint256 public constant rate = 10;
    uint256 public constant baseRate = 1000;

    mapping(address => User) public user;
    
    struct User {
        uint256 depositAmount;
        uint depositTime;
        uint256 interest;
    }

    constructor(PrimeERC20 _prime) {
        prime = _prime;
        pusd = new PUSD();
    }

    function deposit(uint256 amount) external {
        prime.transferFrom(msg.sender, address(this), amount);
        user[msg.sender].interest += interest(user[msg.sender].depositAmount, user[msg.sender].depositTime);
        user[msg.sender].depositAmount += amount;
        user[msg.sender].depositTime = block.timestamp;
    }

    function claim() external {
        uint256 amount = user[msg.sender].interest;
        require(amount > 0, "Nothing to claim");
        user[msg.sender].interest = 0;
        user[msg.sender].depositTime = block.timestamp;
        pusd.mint(msg.sender, amount);
    }

    function interest(uint256 depositAmt, uint timestamp) public view returns (uint256) {
        if(timestamp == 0) return 0;
        uint timeDiff = block.timestamp - timestamp;
        uint256 earnedPerSecond = (depositAmt * rate) / baseRate / 31536000; 
        return earnedPerSecond * timeDiff;
    }
}
