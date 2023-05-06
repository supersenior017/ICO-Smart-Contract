// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
  uint256 public myNumber;

  function setNumber(uint256 number) public {
    myNumber = number;
  }
}