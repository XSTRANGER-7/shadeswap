const hre = require("hardhat");
const { wrap } = require('@oasisprotocol/sapphire-paratime');

async function main() {
  console.log("Deploying IdentityShapeshifter contract to Oasis Sapphire...");
  console.log("Network:", hre.network.name);

  // Guard: require a funded PRIVATE_KEY when deploying to Sapphire networks
  if (hre.network.name.startsWith('sapphire')) {
    const hasAccount = Array.isArray(hre.network.config.accounts) && hre.network.config.accounts.length > 0;
    if (!hasAccount) {
      throw new Error(
        'Missing PRIVATE_KEY in .env. Set PRIVATE_KEY to a funded Sapphire Testnet key (without 0x) and retry.'
      );
    }
  }

  // Get the deployer address and wrap for Sapphire
  let [deployer] = await hre.ethers.getSigners();
  if (hre.network.name.startsWith('sapphire')) {
    deployer = wrap(deployer);
  }
  console.log(`Deploying contracts with the account: ${await deployer.getAddress()}`);

  // Deploy the contract
  const IdentityShapeshifter = await hre.ethers.getContractFactory("IdentityShapeshifter", deployer);
  const identityShapeshifter = await IdentityShapeshifter.deploy();

  await identityShapeshifter.deployed();

  console.log(`IdentityShapeshifter deployed to: ${identityShapeshifter.address}`);
  console.log("Transaction hash:", identityShapeshifter.deployTransaction.hash);

  // Optional: configure Uniswap V3 router
  const router = process.env.UNISWAP_V3_ROUTER;
  const fee = parseInt(process.env.UNISWAP_V3_FEE || '3000', 10);
  if (router && router !== '0x0000000000000000000000000000000000000000') {
    console.log(`Configuring router ${router} with fee ${fee}...`);
    const tx = await identityShapeshifter.setSwapRouter(router, fee);
    await tx.wait();
    console.log('Router configured.');
  } else {
    console.log('UNISWAP_V3_ROUTER not set; running in simulation mode by default.');
  }
  
  console.log("\n-------------------------------------------------------");
  console.log("Contract deployment completed successfully!");
  console.log("This contract leverages Oasis Sapphire's confidential computation");
  console.log("to provide private persona management and trading.");
  console.log("-------------------------------------------------------\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });