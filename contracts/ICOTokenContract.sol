pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ICOToken is ERC20, Ownable {
    uint8 private _decimals;

    constructor() ERC20("ICO", "ICO") {
        _setupDecimals(18);
        _mint(msg.sender, 500000 * 10**18);
    }

    function _setupDecimals(uint8 decimals_) internal {
        _decimals = decimals_;
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}