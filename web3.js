const Web3 = require('web3');

const web3 = new Web3('http://localhost:8545');

const MyContract = new web3.eth.Contract(abi, address);