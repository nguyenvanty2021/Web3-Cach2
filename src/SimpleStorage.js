// https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider
import React, { useState } from "react";
import { ethers } from "ethers";
import SimpleStorage_abi from "./contracts/SimpleStorage_abi.json";
import { useEffect } from "react/cjs/react.development";
import Web3 from "web3";
const SimpleStorage = () => {
  // deploy simple storage contract and paste deployed contract address here. This value is local ganache chain
  let contractAddress = "0xCF31E7c9E7854D7Ecd3F3151a9979BC2a82B4fe3";
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [defaultBalance, setDefaultBalance] = useState(null);
  const [connButtonText, setConnButtonText] = useState("Connect Wallet");
  const [currentContractVal, setCurrentContractVal] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [transferHash, setTransferHash] = useState();
  const getBalance2 = async (address) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.utils.formatEther(balance);
    console.log(balanceInEth);
  };
  const getBalance = (address) => {
    window.ethereum
      .request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      .then((balance) => {
        console.log(balance);
        // (balance/1e18).toFixed(4)
        setDefaultBalance(ethers.utils.formatEther(balance));
      });
  };
  const connectWalletHandler = async () => {
    if (
      window.ethereum &&
      window.ethereum.isMetaMask &&
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      try {
        const result = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        // const web3 = new Web3(window.ethereum)
        // console.log(web3)
        // sau khi connect sẽ có address
        if (result.length > 0) {
          accountChangedHandler(result[0]);
          setConnButtonText("Wallet Connected");
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    } else {
      console.log("Need to install MetaMask");
      setErrorMessage("Please install MetaMask browser extension to interact");
    }
  };
  // update account, will cause component re-render
  const accountChangedHandler = async (newAccount) => {
    // sau khi connect sẽ có address
    await getBalance(newAccount.toString());
    await setDefaultAccount(newAccount);
    updateEthers();
    const web3 = new Web3(window.ethereum);
    // get balance
    var balance = await web3.eth.getBalance(newAccount); //Will give value in.
    console.log(balance);
    // balance = web3.toDecimal(balance);
  };
  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload();
  };
  // listen for account changes
  window.ethereum.on("accountsChanged", accountChangedHandler);
  window.ethereum.on("chainChanged", chainChangedHandler);
  const updateEthers = async () => {
    // connect wallet using web3 provider
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(tempProvider);
    let tempSigner = tempProvider.getSigner();
    setSigner(tempSigner);
    const tx = await tempSigner.sendTransaction({
      to: "0x12e985b8FFEaE9cd153D22461027fb1151a6D13d",
      value: ethers.utils.parseEther("0.005"),
    });
    console.log([tx]);
    console.log(ethers.utils.formatEther(tx?.gasLimit?._hex));
    console.log(ethers.utils.formatEther(tx?.gasPrice?._hex));
    console.log(ethers.utils.formatEther(tx?.value?._hex));
    let tempContract = new ethers.Contract(
      contractAddress,
      SimpleStorage_abi,
      tempSigner
    );
    setContract(tempContract);
  };
  console.log(contract);
  const setHandler = (event) => {
    event.preventDefault();
    console.log("sending " + event.target.setText.value + " to the contract");
    contract.set(event.target.setText.value);
  };
  const getCurrentVal = async () => {
    let val = await contract.get();
    setCurrentContractVal(val);
  };
  // const handleInit = async () => {
  //   const web3 = new Web3('http://localhost:3000/')
  //   // tạo ra đối tượng contract
  //   const constract = await new web3.eth.Contract(SimpleStorage_abi, '0x12e985b8FFEaE9cd153D22461027fb1151a6D13d')
  //   console.log(constract)
  //   const name = await constract.methods.name().call()
  //   console.log(name)
  // }
  // useEffect(() => {
  //   handleInit()
  // })
  const handleChangeTransaction2 = async () => {
    const web3 = new Web3(window.ethereum);
    web3.eth.getAccounts(function(error, result) {
      web3.eth.sendTransaction(
          {from: defaultAccount,
          to: '0x12e985b8FFEaE9cd153D22461027fb1151a6D13d',
          value:   ethers.utils.parseEther("0.000005"),
          data: "0x06cb4bcd"
              }, function(err, transactionHash) {
        if (!err)
          console.log(transactionHash);
      });
  });
  };
  const handleChangeTransaction = async () => {
    if (
      window.ethereum &&
      window.ethereum.isMetaMask &&
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      try {
        const result = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: "0x63b51efd87c47415aa3efaf46331ce71fa831390",
              to: "0x12e985b8FFEaE9cd153D22461027fb1151a6D13d",
              gas: "0x5208", // 21000 GWEI,
              value: ethers.utils.parseEther("0.0005")._hex,
            },
          ],
        });
        console.log(result);
      } catch (error) {
        setErrorMessage(error.message);
      }
    } else {
      console.log("Need to install MetaMask");
      setErrorMessage("Please install MetaMask browser extension to interact");
    }
  };
  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) {
      return alert("Please install metamask");
    }
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    console.log(accounts);
  };
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  return (
    <div>
      <h4> {"Get/Set Contract interaction"} </h4>
      <button onClick={connectWalletHandler}>{connButtonText}</button>
      <div>
        <h3>Address: {defaultAccount}</h3>
      </div>
      <div>
        <h3>Balance: {defaultBalance}</h3>
      </div>
      <form onSubmit={setHandler}>
        <input id="setText" type="text" />
        <button type={"submit"}> Update Contract </button>
      </form>
      <div>
        <button onClick={getCurrentVal} style={{ marginTop: "5em" }}>
          {" "}
          Get Current Contract Value{" "}
        </button>
      </div>
      <button onClick={handleChangeTransaction}> Send transaction </button>
      <button onClick={handleChangeTransaction2}> Send transaction2 </button>
      {currentContractVal}
      {errorMessage}
    </div>
  );
};

export default SimpleStorage;
