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
}
