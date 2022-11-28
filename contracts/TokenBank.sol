// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract TokenBank {
    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    // Token total supply count
    uint256 constant _totalSupply = 1000;

    // TokenBank total deposit
    uint256 private _bankTotalDeposit;

    // TokenBank owner
    address public owner;

    // Token balances of each account address
    mapping(address => uint256) private _balances;

    // Tokan balances, which TokenBank reserves for each account address
    mapping(address => uint256) private _tokenBankBalances;
}
