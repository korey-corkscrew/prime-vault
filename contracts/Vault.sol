// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PrimeERC20.sol";

contract PUSD is ERC20, Ownable {
    constructor() ERC20("PUSD", "PUSD") {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

contract Vault {
    PrimeERC20 public immutable PRIME_TOKEN;
    PUSD public immutable PUSD_TOKEN;
    uint256 public constant RATE = 10;
    uint256 public constant BASE_RATE = 1000;
    uint256 private constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

    mapping(address => User) public users;
    
    struct User {
        uint256 depositAmount;
        uint depositTime;
        uint256 interest;
    }

    constructor(PrimeERC20 _prime) {
        PRIME_TOKEN = _prime;
        PUSD_TOKEN = new PUSD();
    }

    function deposit(uint256 amount) external {
        PRIME_TOKEN.transferFrom(msg.sender, address(this), amount);
        User storage user = users[msg.sender];
        user.interest += interest(user.depositAmount, user.depositTime);
        user.depositAmount += amount;
        user.depositTime = block.timestamp;
    }

    function claim() external {
        uint256 amount = pendingInterest(msg.sender);
        require(amount > 0, "Nothing to claim");
        users[msg.sender].interest = 0;
        users[msg.sender].depositTime = block.timestamp;
        PUSD_TOKEN.mint(msg.sender, amount);
    }

    function interest(uint256 depositAmt, uint timestamp) private view returns (uint256) {
        if(timestamp == 0) return 0;
        uint timeDiff = block.timestamp - timestamp;
        uint256 earnedPerSecond = (depositAmt * RATE) / BASE_RATE / SECONDS_PER_YEAR; 
        return earnedPerSecond * timeDiff;
    }

    function pendingInterest(address user) public view returns (uint256) {
        User memory userInfo = users[user];
        return userInfo.interest + interest(userInfo.depositAmount, userInfo.depositTime);
    }
}
