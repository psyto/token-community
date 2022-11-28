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
}
