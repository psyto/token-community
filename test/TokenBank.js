const { expect } = require("chai");
const { ethers } = require("hardhat");
const { experimentalAddHardhatNetworkMessageTraceHook } = require("hardhat/config");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("TokenBank contract", function() {
    let MemberNFT;
    let memberNFT;
    const tokenURI1 = "hoge1";
    const tokenURI2 = "hoge2";
    const tokenURI3 = "hoge3";
    const tokenURI4 = "hoge4";
    const tokenURI5 = "hoge5";
    let TokenBank;
    let tokenBank;
    const name = "Token";
    const symbol = "TBK";
    let owner;
    let addr1;
    let addr2;
    let addr3;
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    beforeEach(async function() {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        MemberNFT = await ethers.getContractFactory("MemberNFT");
        memberNFT = await MemberNFT.deploy();
        await memberNFT.deployed();
        await memberNFT.nftMint(owner.address, tokenURI1);
        await memberNFT.nftMint(addr1.address, tokenURI2);
        await memberNFT.nftMint(addr1.address, tokenURI3);
        await memberNFT.nftMint(addr2.address, tokenURI4);

        TokenBank = await ethers.getContractFactory("TokenBank");
        tokenBank = await TokenBank.deploy(name, symbol, memberNFT.address);
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
        it("TokenBank balance should be zero", async function () {
            expect(await tokenBank.bankTotalDeposit()).to.equal(0);
        })
    });
    describe("transaction between address", function () {
        beforeEach(async function () {
            await tokenBank.transfer(addr1.address, 500);
        });
        it("token should be transferred", async function () {
            const startAddr1Balance = await tokenBank.balanceOf(addr1.address);
            const startAddr2Balance = await tokenBank.balanceOf(addr2.address);
            await tokenBank.connect(addr1).transfer(addr2.address, 100);
            const endAddr1Balance = await tokenBank.balanceOf(addr1.address);
            const endAddr2Balance = await tokenBank.balanceOf(addr2.address);
            expect(endAddr1Balance).to.equal(startAddr1Balance.sub(100));
            expect(endAddr2Balance).to.equal(startAddr2Balance.add(100));
        });
        it("transfer to zero address should be failed", async function () {
            await expect(tokenBank.transfer(zeroAddress, 100))
            .to.be.revertedWith("Zero address cannot be specified for 'to'!");
        });
        it("transfer with insufficient amount should be failed", async function () {
            await expect(tokenBank.connect(addr1).transfer(addr2.address, 510))
            .to.be.revertedWith("Insufficient balance!");
        });
        it("transfer should trigger event", async function () {
            await expect(tokenBank.connect(addr1).transfer(addr2.address, 100))
            .emit(tokenBank, "TokenTransfer").withArgs(addr1.address, addr2.address, 100);
        });
    });
    describe("Bank transaction", function () {
        beforeEach(async function () {
            await tokenBank.transfer(addr1.address, 500);
            await tokenBank.transfer(addr2.address, 200);
            await tokenBank.transfer(addr3.address, 100);
            await tokenBank.connect(addr1).deposit(100);
            await tokenBank.connect(addr2).deposit(200);
        });
        it("token can be deposited", async function () {
            const addr1Balance = await tokenBank.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(400);
            const addr1BankBalance = await tokenBank.bankBalanceOf(addr1.address);
            expect(addr1BankBalance).to.equal(100);
        });
        it("token can be transfered after deposit", async function () {
            const startAddr1Balance = await tokenBank.balanceOf(addr1.address);
            const startAddr2Balance = await tokenBank.balanceOf(addr2.address);
            await tokenBank.connect(addr1).transfer(addr2.address, 100);
            const endAddr1Balance = await tokenBank.balanceOf(addr1.address);
            const endAddr2Balance = await tokenBank.balanceOf(addr2.address);
            expect(endAddr1Balance).to.equal(startAddr1Balance.sub(100));
            expect(endAddr2Balance).to.equal(startAddr2Balance.add(100));
        });
        it("deposit should trigger TokenDeposit event", async function () {
            await expect(tokenBank.connect(addr1).deposit(100))
            .emit(tokenBank, "TokenDeposit").withArgs(addr1.address, 100);
        });
        it("token can be withdrawn", async function () {
            const startBankBalance = await tokenBank.connect(addr1).bankBalanceOf(addr1.address);
            const startTotalBankBalance = await tokenBank.connect(addr1).bankTotalDeposit();

            await tokenBank.connect(addr1).withdraw(100);

            const endBankBalance = await tokenBank.connect(addr1).bankBalanceOf(addr1.address);
            const endTotalBankBalance = await tokenBank.connect(addr1).bankTotalDeposit();

            expect(endBankBalance).to.equal(startBankBalance.sub(100));
            expect(endTotalBankBalance).to.equal(startTotalBankBalance.sub(100));
        });
        it("token can not be withdrawn if balance is insufficient", async function () {
            await expect(tokenBank.connect(addr1).withdraw(101))
            .to.be.revertedWith("An amount greater than your tokenBank balance!");
        });
        it("withdraw should trigger TokenWithdraw event", async function () {
            await expect(tokenBank.connect(addr1).withdraw(100))
            .emit(tokenBank, "TokenWithdraw").withArgs(addr1.address, 100);
        });
        it("deposit by owner should be failed", async function () {
            await expect(tokenBank.deposit(1))
            .to.be.revertedWith("Owner cannot execute");
        });
        it("withdraw by owner should be failed", async function () {
            await expect(tokenBank.withdraw(1))
            .to.be.revertedWith("Owner cannot execute");
        });
        it("owner cannot transfer the amount greater than total deposit amount", async function () {
            await expect(tokenBank.transfer(addr1.address, 201))
            .to.be.revertedWith("Amount greater than the total supply cannot be transferred");
        });
        it("transfer by non NFT member should be failed", async function () {
            await expect(tokenBank.connect(addr3).transfer(addr1.address, 100))
            .to.be.revertedWith("not NFT member");
        });
        it("deposit by non NFT member should be failed", async function () {
            await expect(tokenBank.connect(addr3).deposit(1))
            .to.be.revertedWith("not NFT member");
        });
        it("withdraw by non NFT member should be failed", async function () {
            await expect(tokenBank.connect(addr3).withdraw(1))
            .to.be.revertedWith("not NFT member");
        });
    });
})
