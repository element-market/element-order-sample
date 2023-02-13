import { Log } from "@ethersproject/abstract-provider";
import * as Addresses from "./addresses";
import { bn, lc, s } from "./utils";
import { toOrderId, toStandardERC20Token } from "./converter";
import {
  ERC721SellOrderFilled,
  ERC721BuyOrderFilled,
  ERC1155SellOrderFilled,
  ERC1155BuyOrderFilled,
  ERC721OrderCancelled,
  ERC1155OrderCancelled,
  HashNonceIncremented
} from "./events";

export const handleEvents = async (logs: Array<Log>, chainId: number) => {
  const exchange = Addresses.Exchange[chainId];
  for (const log of logs) {
    if (lc(log.address) != exchange) {
      continue;
    }
    
    switch (log.topics[0]) {
      case ERC721SellOrderFilled.topic:
      case ERC721BuyOrderFilled.topic: {
        const { args } =
          (log.topics[0] == ERC721SellOrderFilled.topic) ?
            ERC721SellOrderFilled.abi.parseLog(log) : ERC721BuyOrderFilled.abi.parseLog(log);
        
        const maker = lc(args["maker"]);
        const taker = lc(args["taker"]);
        const nonce = s(args["nonce"]);
        const erc20Token = toStandardERC20Token(args["erc20Token"]);
        const price = s(args["erc20TokenAmount"]);
        const erc721Token = lc(args["erc721Token"]);
        const erc721TokenId = s(args["erc721TokenId"]);
        const orderHash = lc(args["orderHash"]);
  
        // Note that only the orderHash and nonce can uniquely determine the orderId.
        const orderId = toOrderId(orderHash, nonce);
        break;
      }
      
      case ERC1155SellOrderFilled.topic:
      case ERC1155BuyOrderFilled.topic: {
        const { args } =
          (log.topics[0] == ERC1155SellOrderFilled.topic) ?
            ERC1155SellOrderFilled.abi.parseLog(log) : ERC1155BuyOrderFilled.abi.parseLog(log);
        
        const maker = lc(args["maker"]);
        const taker = lc(args["taker"]);
        const nonce = s(args["nonce"]);
        const erc20Token = toStandardERC20Token(args["erc20Token"]);
        const erc20FillAmount = s(args["erc20FillAmount"]);
        const erc1155Token = lc(args["erc1155Token"]);
        const erc1155TokenId = s(args["erc1155TokenId"]);
        const erc1155FillAmount = s(args["erc1155FillAmount"]);
        const orderHash = lc(args["orderHash"]);
        
        // Note that only the orderHash and nonce can uniquely determine the orderId.
        const orderId = toOrderId(orderHash, nonce);
        const price = s(bn(erc20FillAmount).div(erc1155FillAmount));
        break;
      }
      
      case ERC721OrderCancelled.topic: {
        const { args } = ERC721OrderCancelled.abi.parseLog(log);
        const maker = lc(args["maker"]);
        const nonce = s(args["nonce"]);
        break;
      }
      
      case ERC1155OrderCancelled.topic: {
        const { args } = ERC1155OrderCancelled.abi.parseLog(log);
        const maker = lc(args["maker"]);
        const nonce = s(args["nonce"]);
        break;
      }
      
      case HashNonceIncremented.topic: {
        const { args } = HashNonceIncremented.abi.parseLog(log);
        const maker = lc(args["maker"]);
        const hashNonce = s(args["newHashNonce"]);
        break;
      }
    }
  }
}
