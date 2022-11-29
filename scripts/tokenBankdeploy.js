const fs = require("fs");
const memberNFTAddress = require("../memberNFTcontract");

const main = async () => {
    const addr1 = "0x257F56580fccf0DFbF1Ab2FA11CB29Efa084c854";
    const addr2 = "0x86E77bEF242821Ca048514E53ba88596e246A097";
    const addr3 = "0xDe285a07388Cb98134D5FC8fc958DC022e99f65C";
    const addr4 = "0xbE2424D4042C499CB6A54eb0Cc157466A5C81E2a";

    /// @dev deploy
    const TokenBank = await ethers.getContractFactory("TokenBank");
    const tokenBank = await TokenBank.deploy("TokenBank", "TBK", memberNFTAddress);
    await tokenBank.deployed();
    console.log(`Contract deployed to: https://goerli.etherscan.io/address/${tokenBank.address}`);

    /// @dev transfer token
    let tx = await tokenBank.transfer(addr2, 300);
    await tx.wait();
    console.log("Transferred to addr2");
    tx = await tokenBank.transfer(addr3, 200);
    await tx.wait();
    console.log("Transferred to addr3");
    tx = await tokenBank.transfer(addr4, 100);
    await tx.wait();
    console.log("Transferred to addr4");

    // write argument.js, which Verify reads
    fs.writeFileSync("./argument.js",
    `
    module.exports = [
        "TokenBank",
        "TBK",
        "${memberNFTAddress}"
    ]
    `
    );

    // write contracts.js, which Front End Application reads
    fs.writeFileSync("./contracts.js",
    `
    export const memberNFTAddress = "${memberNFTAddress}"
    export const tokenBankAddress = "${tokenBank.address}"
    `
    );
}

const tokenBankDeploy = async () => {
    try {
        await main();
        process.exit(0);
    } catch(err) {
        console.log(err);
        process.exit(1);
    }
};

tokenBankDeploy();
