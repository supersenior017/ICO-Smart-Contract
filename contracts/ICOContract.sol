pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ICO is Ownable {
	IERC20 private _token;
	mapping(address => uint256) private _deposits;
	uint256 private _softCap = 10 ** 17; // 0.1 BNB
	uint256 private _hardCap = 10 ** 18; // 1 BNB
	uint256 private _minPurchase = 10 ** 16; // 0.01 BNB
	uint256 private _maxPurchase = 5 * 10 ** 16; // 0.05 BNB
	uint256 private _rate = 10 ** 15; // 0.001 BNB
	uint256 private _startTime = 1735689600; // 5/8/2023 0 AM GMT
	uint256 private _endTime = 1735776000; // 5/9/2023 0 AM GMT
	bool private _icoEnded = false;

	event Deposit(address indexed buyer, uint256 amount);
	event Withdraw(address indexed buyer, uint256 amount);
	event Claim(address indexed buyer, uint256 amount);

	constructor(address tokenAddress) {
		_token = IERC20(tokenAddress);
	}

	function deposit(uint256 amount) public {
		require(
			block.timestamp >= _startTime && block.timestamp < _endTime,
			"ICO not active"
		);
		require(!_icoEnded, "ICO ended");
		require(
			amount >= _minPurchase && amount <= _maxPurchase,
			"Invalid amount"
		);
		require(
			_deposits[msg.sender] + amount <= _maxPurchase,
			"Exceeds max purchase amount"
		);
		require(
			_token.balanceOf(address(this)) + amount <= _hardCap,
			"Exceeds hard cap"
		);

		_deposits[msg.sender] += amount;
		_token.transferFrom(msg.sender, address(this), amount);

		emit Deposit(msg.sender, amount);
	}

	function withdraw() public {
		require(_icoEnded, "ICO not ended");
		require(_deposits[msg.sender] > 0, "No deposit");

		uint256 amount = _deposits[msg.sender];
		_deposits[msg.sender] = 0;
		_token.transfer(msg.sender, amount);

		emit Withdraw(msg.sender, amount);
	}

	function claim() public {
		require(_icoEnded, "ICO not ended");
		require(_deposits[msg.sender] > 0, "No deposit");

		uint256 amount = _deposits[msg.sender] * _rate;
		_deposits[msg.sender] = 0;
		_token.transfer(msg.sender, amount);

		emit Claim(msg.sender, amount);
	}

	function endICO() public onlyOwner {
		require(block.timestamp >= _endTime, "ICO not ended");
		require(!_icoEnded, "ICO already ended");

		if (_token.balanceOf(address(this)) >= _softCap) {
			_icoEnded = true;
		} else {
			_token.transfer(owner(), _token.balanceOf(address(this)));
		}
	}

	function setSoftCap(uint256 softCap) public onlyOwner {
		_softCap = softCap;
	}

	function setHardCap(uint256 hardCap) public onlyOwner {
		_hardCap = hardCap;
	}

	function setMinPurchase(uint256 minPurchase) public onlyOwner {
		_minPurchase = minPurchase;
	}

	function setMaxPurchase(uint256 maxPurchase) public onlyOwner {
		_maxPurchase = maxPurchase;
	}

	function setRate(uint256 rate) public onlyOwner {
		_rate = rate;
	}

	function setStartTime(uint256 startTime) public onlyOwner {
		_startTime = startTime;
	}

	function setEndTime(uint256 endTime) public onlyOwner {
		_endTime = endTime;
	}

	function isICOEnded() public view returns (bool) {
		return _icoEnded;
	}

	function getDeposit(address buyer) public view returns (uint256) {
		return _deposits[buyer];
	}

	function getSoftCap() public view returns (uint256) {
		return _softCap;
	}

	function getHardCap() public view returns (uint256) {
		return _hardCap;
	}

	function getMinPurchase() public view returns (uint256) {
		return _minPurchase;
	}

	function getMaxPurchase() public view returns (uint256) {
		return _maxPurchase;
	}

	function getRate() public view returns (uint256) {
		return _rate;
	}

	function getStartTime() public view returns (uint256) {
		return _startTime;
	}

	function getEndTime() public view returns (uint256) {
		return _endTime;
	}
}