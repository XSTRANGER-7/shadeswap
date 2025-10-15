require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const normalizeAccounts = () => {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) return [];
  const with0x = pk.startsWith('0x') ? pk : `0x${pk}`;
  return [with0x];
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    // Oasis Sapphire Testnet
    sapphire: {
      url: process.env.SAPPHIRE_TESTNET_URL || "https://testnet.sapphire.oasis.dev",
      accounts: normalizeAccounts(),
      chainId: 23295,
    },
    // Oasis Sapphire Mainnet
    sapphireMain: {
      url: process.env.SAPPHIRE_MAINNET_URL || "https://sapphire.oasis.io",
      accounts: normalizeAccounts(),
      chainId: 23294,
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337,
    }
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  // For Oasis Sapphire contracts
  mocha: {
    timeout: 100000
  }
};
