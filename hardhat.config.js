require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
    networks: {
        hardhat: {},
        testnet: {
            url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
            chainId: 97,
            gasPrice: 20000000000,
            accounts: [process.env.PRIVATE_KEY],
            // {
            //     mnemonic: process.env.MNEMONIC,
            // },
        },
    },
    solidity: {
        version: '0.8.4',
    },
};