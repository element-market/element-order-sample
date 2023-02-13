import { BigNumber } from 'ethers'

export enum Network {
  // Ethereum
  Ethereum = 1,
  EthereumGoerli = 5,
  // Bsc
  Bsc = 56,
  BscTestnet = 97,
  // Polygon
  Polygon = 137,
  PolygonMumbai = 80001,
  // Avalanche
  Avalanche = 43114,
  AvalancheFuji = 43113,
}

export const Chain: {[chainId: number]: string} = {
  [Network.Ethereum]: "eth",
  [Network.EthereumGoerli]: "eth",
  [Network.Bsc]: "bsc",
  [Network.BscTestnet]: "bsc",
  [Network.Polygon]: "polygon",
  [Network.PolygonMumbai]: "polygon",
  [Network.Avalanche]: "avalanche",
  [Network.AvalancheFuji]: "avalanche",
};

export const lc = (x: string) => x?.toLowerCase();
export const n = (x: any) => (x ? Number(x) : x);
export const s = (x: any) => (x ? String(x) : x);
export const bn = (value: any) => BigNumber.from(lc(s(value)));

export const encodeBits = (args: any[][], withPrefix = true): string => {
  let data = withPrefix ? "0x" : "";
  for (const arg of args) {
    data += toZeroPaddingHex(bn(arg[0]).toHexString(), arg[1]);
  }
  return data;
}

const toZeroPaddingHex = (hexStr: string, bitCount: number): string => {
  const count = bitCount / 4;
  const str = lc(hexStr.substring(2));
  if (str.length > count) {
    return str.substring(str.length - count);
  }
  let zero = '';
  for (let i = str.length; i < count; i++) {
    zero += '0';
  }
  return zero + str;
}
