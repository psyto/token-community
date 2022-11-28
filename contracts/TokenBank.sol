// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract TokenBank {
    /// @dev Token name
    string private _name;

    /// @dev Token symbol
    string private _symbol;

    /// @dev Token total supply count
    uint256 constant _totalSupply = 1000;

    /// @dev TokenBank total deposit
    uint256 private _bankTotalDeposit;

    /// @dev TokenBank owner
    address public owner;

    /// @dev Token balances of each account address
    mapping(address => uint256) private _balances;

    /// @dev Tokan balances, which TokenBank reserves for each account address
    mapping(address => uint256) private _tokenBankBalances;

    /// @dev Token transfer event
    event TokenTransfer(
        address indexed from,
        address indexed to,
        uint256 amount
    );

    /// @dev Token deposit event
    event TokenDeposit(address indexed from, uint256 amount);

    /// @dev Token withdraw event
    event TokenWithdraw(address indexed from, uint256 amount);

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        owner = msg.sender;
        _balances[owner] = _totalSupply;
    }

    /// @dev return Token name
    function name() public view returns (string memory) {
        return _name;
    }

    /// @dev return Token symbol
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /// @dev return Token total supply
    function totalSupply() public pure returns (uint256) {
        return _totalSupply;
    }

    /// @dev return Token balance of specified account address
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /// @dev transfer Token
    function transfer(address to, uint256 amount) public {
        address from = msg.sender;
        _transfer(from, to, amount);
    }

    /// @dev implement transfer
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal {
        require(to != address(0), "Zero address cannot be specified for 'to'!");
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "Insufficient balance!");
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;
        emit TokenTransfer(from, to, amount);
    }
}
