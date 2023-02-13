import { Network } from "./utils";

export const AddressZero = "0x0000000000000000000000000000000000000000";
export const NativeEthAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export const Exchange: {[chainId: number]: string} = {
  [Network.Ethereum]: "0x20f780a973856b93f63670377900c1d2a50a77c4",
  [Network.EthereumGoerli]: "0x7fed7ed540c0731088190fed191fcf854ed65efa",
  [Network.Bsc]: "0xb3e3dfcb2d9f3dde16d78b9e6eb3538eb32b5ae1",
  [Network.BscTestnet]: "0x30fad3918084eba4379fd01e441a3bb9902f0843",
  [Network.Polygon]: "0xeaf5453b329eb38be159a872a6ce91c9a8fb0260",
  [Network.PolygonMumbai]: "0x2431e7671d1557d991a138c7af5d4cd223a605d6",
  [Network.Avalanche]: "0x18cd9270dbdca86d470cfb3be1b156241fffa9de",
  [Network.AvalancheFuji]: "0xd089757a20a36b0978156659cc1063b929da76ab",
};

export const WEth: {[chainId: number]: string} = {
  [Network.Ethereum]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  [Network.EthereumGoerli]: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
  [Network.Bsc]: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
  [Network.BscTestnet]: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
  [Network.Polygon]: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  [Network.PolygonMumbai]: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
  [Network.Avalanche]: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
  [Network.AvalancheFuji]: "0xd00ae08403b9bbb9124bb305c09058e32c39a48c",
}
