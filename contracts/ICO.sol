// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ICOToken.sol";

contract ICO {
    ICOToken public token;
    address public owner;
    mapping(address => uint256) public deposits;
    uint256 public softCap;
    uint256 public hardCap;
    uint256 public minPurchaseAmount;
    uint256 public maxPurchaseAmount;
    uint256 public totalDeposits;
    bool public isICOActive;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public rate;

    constructor(
        ICOToken _token,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _minPurchaseAmount,
        uint256 _maxPurchaseAmount,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _rate
    ) {
        token = _token;
        owner = msg.sender;
        softCap = _softCap;
        hardCap = _hardCap;
        minPurchaseAmount = _minPurchaseAmount;
        maxPurchaseAmount = _maxPurchaseAmount;
        startTime = _startTime;
        endTime = _endTime;
        rate = _rate;
        isICOActive = true;
    }

    function deposit() public payable {
        require(isICOActive, "ICO: ICO is not active");
        require(msg.value >= minPurchaseAmount, "ICO: deposit amount is below minimum");
        require(msg.value <= maxPurchaseAmount, "ICO: deposit amount is above maximum");
        require(totalDeposits + msg.value <= hardCap, "ICO: deposit amount exceeds hard cap");
        deposits[msg.sender] += msg.value;
        totalDeposits += msg.value;
    }

    function withdraw() public {
        require(!isICOActive, "ICO: ICO is still active");
        require(deposits[msg.sender] > 0, "ICO: no deposit to withdraw");
        uint256 amount = deposits[msg.sender];
        deposits[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function claim() public {
        require(!isICOActive, "ICO: ICO is still active");
        require(totalDeposits >= softCap, "ICO: soft cap not reached");
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "ICO: no tokens to claim");
        uint256 amount = (deposits[msg.sender] * rate) / 10 ** 10;
        deposits[msg.sender] = 0;
        token.transfer(msg.sender, amount);
    }

    function endICO() public {
        require(msg.sender == owner, "ICO: only owner can end ICO");
        isICOActive = false;
    }
}