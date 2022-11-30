import Head from 'next/head'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import { memberNFTAddress, tokenBankAddress } from '../../contracts'
import MemberNFT from '../contracts/MemberNFT.json'
import TokenBank from '../contracts/TokenBank.json'

export default function Home() {
  const [account, setAccount] = useState('')
  const [chainId, setChainId] = useState(false)
  const [tokenBalance, setTokenBalance] = useState('')
  const [bankBalance, setBankBalance] = useState('')
  const [bankTotalDeposit, setBankTotalDeposit] = useState('')
  const [nftOwner, setNftOwner] = useState(false)
  const [inputData, setInputData] = useState({ transferAddress: '', transferAmount: '', depositAmount: '', withdrawAmount: '' });
  const [items, setItems] = useState([])
  const goerliId = '0x5'
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  const checkMetaMaskInstalled = async () => {
    const { ethereum } = window as any;
    if (!ethereum) {
      alert('Please install MetaMask!');
    }
  }
  const checkChainId = async () => {
    const { ethereum } = window as any;
    if (ethereum) {
      const chain = await ethereum.request({method: 'eth_chainId'});
      console.log(`chain: ${chain}`);

      if (chain != goerliId) {
        alert('Please connect to Goerli!');
        setChainId(false);
        return
      } else {
        setChainId(true);
      }
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });
      console.log(`account: ${accounts[0]}`);
      setAccount(accounts[0]);

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const tokenBankContract = new ethers.Contract(tokenBankAddress, TokenBank.abi, signer);
      const tBalance = await tokenBankContract.balanceOf(accounts[0]);
      console.log(`tBalance: ${tBalance}`);
      setTokenBalance(tBalance.toNumber());

      const bBalance = await tokenBankContract.bankBalanceOf(accounts[0]);
      console.log(`bBalance: ${bBalance}`);
      setBankBalance(bBalance.toNumber());

      const totalDeposit = await tokenBankContract.bankTotalDeposit();
      console.log(`totalDeposit: ${totalDeposit}`);
      setBankTotalDeposit(totalDeposit.toNumber());

      checkNft(accounts[0]);

      ethereum.on('accountsChanged', checkAccountChanged);
      ethereum.on('chainChanged', checkChainId);
    } catch (err) {
      console.log(err);
    }
  }

  const checkAccountChanged = () => {
    setAccount('');
    setTokenBalance('');
    setBankBalance('');
    setBankTotalDeposit('');
    setNftOwner(false);
    setInputData({ transferAddress: '', transferAmount: '', depositAmount: '', withdrawAmount: '' });
    setItems([]);
  }

  const checkNft = async (addr: any) => {
    const { ethereum } = window as any;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const nftContract = new ethers.Contract(
      memberNFTAddress,
      MemberNFT.abi,
      signer
    );

    const balance = await nftContract.balanceOf(addr);
    console.log(`nftBalance: ${balance.toNumber()}`);

    if (balance.toNumber() > 0) {
      setNftOwner(true);
    } else {''}
  }

  const tokenTransfer = async (event: any) => {
    event.preventDefault();
    if (tokenBalance >= inputData.transferAmount && zeroAddress != inputData.transferAddress) {
      try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const tokenBankContract = new ethers.Contract(tokenBankAddress, TokenBank.abi, signer);
        const tx = await tokenBankContract.transfer(inputData.transferAddress, inputData.transferAmount);
        await tx.wait();

        const tBalance = await tokenBankContract.balanceOf(account);
        setTokenBalance(tBalance.toNumber());
        setInputData(prevData => ({
          ...prevData,
          transferAddress: '',
          transferAmount: ''
        }));
      } catch (err) {
console.log(err);
}
    } else {
      alert("You cannot specify the amount greater than token balance and zero address!");
    }
  }

  const tokenDeposit = async (event: any) => {
    event.preventDefault();
    if (tokenBalance >= inputData.depositAmount) {
      try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const tokenBankContract = new ethers.Contract(tokenBankAddress, TokenBank.abi, signer);
        const tx = await tokenBankContract.deposit(inputData.depositAmount);
        await tx.wait();

        const tBalance = await tokenBankContract.balanceOf(account);
        const bBalance = await tokenBankContract.bankBalanceOf(account);
        const totalDeposit = await tokenBankContract.bankTotalDeposit();
        setTokenBalance(tBalance.toNumber());
        setBankBalance(bBalance.toNumber());
        setBankTotalDeposit(totalDeposit.toNumber());

        setInputData(prevData => ({
          ...prevData,
          depositAmount: ''
        }));
      } catch (err) {
console.log(err);
}
    } else {
      alert("You cannot specify the amount greater than token balance!");
    }
  }

  const tokenWithdraw = async (event: any) => {
    event.preventDefault();
    if (bankBalance >= inputData.withdrawAmount) {
      try {
        const { ethereum } = window as any;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const tokenBankContract = new ethers.Contract(tokenBankAddress, TokenBank.abi, signer);
        const tx = await tokenBankContract.withdraw(inputData.withdrawAmount);
        await tx.wait();

        const tBalance = await tokenBankContract.balanceOf(account);
        const bBalance = await tokenBankContract.bankBalanceOf(account);
        const totalDeposit = await tokenBankContract.bankTotalDeposit();
        setTokenBalance(tBalance.toNumber());
        setBankBalance(bBalance.toNumber());
        setBankTotalDeposit(totalDeposit.toNumber());

        setInputData(prevData => ({
          ...prevData,
          withdrawAmount: ''
        }));
      } catch (err) {
console.log(err);
}
    } else {
      alert("You cannot withdraw the amount greater than deposit balance!");
    }
  }
  
  const handler = (e: any) => {
    setInputData(prevData => ({
      ...prevData,
      [e.target.name]: e.target.value
    }));
  }

  useEffect(() => {
    checkMetaMaskInstalled();
    checkChainId();
  }, [])

  return (
    <div className={'flex flex-col items-center bg-slate-100 text-blue-900 min-h-screen'}>
      <Head>
        <title>Token DApp</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h2 className='{text-6xl font-bold my-12 mt-8}'>
        Welcome to Token Community!
      </h2>
      <div className='mt-8 mb-16 hover:rotate-180 hover:scale-105 transition duration-700 ease-in-out'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='160'
          height='160'
          viewBox='0 0 350 350'
        >
          <polygon points="0 0, 175 0, 175 175, 0 175" stroke="black" fill="#0000ff" />
          <polygon points="0 175, 175 175, 175 350, 0 350" stroke="black" fill="#ffc0cb" />
          <polygon points="175 0, 350 0, 350 175, 175 175" stroke="black" fill="#90EE90" />
          <polygon points="175 175, 350 175, 350 350, 175 350" stroke="black" fill="#ffff00" />
        </svg>
      </div>
      <div className={'flex mt-1'}>
        {account === '' ? (
          <button className={'bg-transparent text-blue-700 font-semibold py-2 px-4 border border-blue-500 rounded hover:border-transparent hover:text-white hover:bg-blue-500 hover:cursor-pointer'}
            onClick={connectWallet}>
            Connect to MetaMask
          </button>
        ) : (
          chainId ? (
            <div >
              <div className='px-2 py-2 bg-transparent'>
                <span className="flex flex-col items-left font-semibold">Total deposit: {bankTotalDeposit}</span>
              </div>
              <div className='px-2 py-2 mb-2 bg-white border border-gray-400'>
                <span className="flex flex-col items-left font-semibold">Address: {account}</span>
                <span className="flex flex-col items-left font-semibold">Token balance: {tokenBalance}</span>
                < span className="flex flex-col items-left font-semibold">Deposit amount: {bankBalance}</span>
              </div>
              {nftOwner ? (
              <>
                <form className="flex pl-1 py-1 mb-1 bg-white border border-gray-400">
                  <input
                    type="text"
                    className="w-5/12 ml-2 text-center border border-gray-400"
                    name="transferAddress"
                    placeholder="Wallet Address"
                    onChange={handler}
                    value={inputData.transferAddress}
                  />
                  <input
                    type="text"
                    className="w-5/12 ml-2 text-right border border-gray-400"
                    name="transferAmount"
                    placeholder={`100`}
                    onChange={handler}
                    value={inputData.transferAmount}
                  />
                  <button
                    className="w-2/12 mx-2 bg-white border-blue-500 hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
                    onClick={tokenTransfer}
                  >Transfer</button>
                </form>
                <form className="flex pl-1 py-1 mb-1 bg-white border border-gray-400">
                  <input
                    type="text"
                    className="w-10/12 ml-2 text-right border border-gray-400"
                    name="depositAmount"
                    placeholder={`100`}
                    onChange={handler}
                    value={inputData.depositAmount}
                  />
                  <button
                    className="w-2/12 mx-2 bg-white hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
                    onClick={tokenDeposit}
                  >Deposit</button>
                </form>
                <form className="flex pl-1 py-1 mb-1 bg-white border border-gray-400">
                  <input
                    type="text"
                    className="w-10/12 ml-2 text-right border border-gray-400"
                    name="withdrawAmount"
                    placeholder={`100`}
                    onChange={handler}
                    value={inputData.withdrawAmount}
                  />
                  <button
                    className="w-2/12 mx-2 bg-white hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded"
                    onClick={tokenWithdraw}
                  >Withdraw</button>
                </form>
              </>) : (<></>)}
            </div>
          ) : (
            <div className='flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3'>
              <div>Goerliに接続してください</div>
            </div>)
        )}
      </div>
    </div>
  )
}
