const {expect} = require("Chai");
const { ethers } = require("hardhat");
const { experimentalAddHardhatNetworkMessageTraceHook } = require("hardhat/config");

describe("MemberNFT contract", function() {
    let MemberNFT;
    let memberNFT;
    const name = "MemberNFT";
    const symbol = "MEM";
    let owner;

    beforeEach(async function() {
        [owner] = await ethers.getSigners();
        MemberNFT = await ethers.getContractFactory("MemberNFT");
        memberNFT = await MemberNFT.deploy();
        await memberNFT.deployed();        
    });
    
    it("token name and symbol should be set", async function() {
        expect(await memberNFT.name()).to.equal(name);
        expect(await memberNFT.symbol()).to.equal(symbol);
    });
    it("deploy address should be owner", async function() {
        expect(await memberNFT.owner()).to.equal(owner.address);
    });
})