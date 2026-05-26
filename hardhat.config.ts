import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

const privateKey = process.env.PRIVATE_KEY;
const xLayerRpcUrl = process.env.XLAYER_RPC_URL ?? "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    xlayer: {
      url: xLayerRpcUrl,
      accounts: privateKey ? [privateKey] : []
    }
  }
};

export default config;
