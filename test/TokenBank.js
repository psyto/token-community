const { expect } = require("chai");
const { ethers } = require("hardhat");
const { experimentalAddHardhatNetworkMessageTraceHook } = require("hardhat/config");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("TokenBank contract", function() {
    let TokenBank;
    let tokenBank;
    const name = "Token";
    const symbol = "TBK";
    let owner;

    beforeEach(async function() {
        [owner, addr1] = await ethers.getSigners();
        TokenBank = await ethers.getContractFactory("TokenBank");
        tokenBank = await TokenBank.deploy(name, symbol);
        await tokenBank.deployed();        
    });
    describe("Deploy", function () {
        it("Token name and symbol should be set", async function () {
            expect(await tokenBank.name()).to.equal(name);
            expect(await tokenBank.symbol()).to.equal(symbol);
        });
        it("deploy address should be set to owner", async function () {
            expect(await tokenBank.owner()).to.equal(owner.address);
        });
        it("total amount should be allocated to owner", async function () {
            const ownerBalance = await tokenBank.balanceOf(owner.address);
            expect(await tokenBank.totalSupply()).to.equal(ownerBalance);
        });
    });

})
