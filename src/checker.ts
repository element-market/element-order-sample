import { Contract } from "ethers";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { verifyTypedData } from "@ethersproject/wallet";
import { Provider } from "@ethersproject/abstract-provider";

import { ElementOrder, OrderSide, Schema } from "./types";
import { EIP712_DOMAIN, getEip712TypesAndValue, } from "./eip712Types";
import { bn, lc } from "./utils";
import { toRawErc1155Order } from "./converter";

import * as Addresses from "./addresses";
import ExchangeAbi from "./abis/Exchange.json";

export const checkValidity = (chainId: number, order: ElementOrder) => {
  const domain = EIP712_DOMAIN(chainId);
  const [ types, value ] = getEip712TypesAndValue(order);
  
  // check orderHash
  const hash = _TypedDataEncoder.hash(domain, types, value);
  if (hash != order.hash) {
    throw new Error("Invalid order");
  }
  
  // check signature
  const signer = verifyTypedData(domain, types, value, {
    v: order.v,
    r: order.r,
    s: order.s,
  });
  
  if (lc(signer) !== order.maker) {
    throw new Error("Invalid signature");
  }
}

export const checkFillability = async (provider: Provider, order: ElementOrder) => {
  const chainId = await provider.getNetwork().then((n) => n.chainId);
  const exchange = new Contract(Addresses.Exchange[chainId], ExchangeAbi as any, provider);
  
  const hashNonce = await exchange.getHashNonce(order.maker);
  if (!bn(hashNonce).eq(order.hashNonce)) {
    throw new Error("not-fillable");
  }
  
  if (order.schema == Schema.ERC721) {
    // nonceRange = order.nonce >> 8
    const nonceRange = bn(order.nonce).shr(8);
    const statusVector = await exchange.getERC721OrderStatusBitVector(
      order.maker,
      nonceRange
    );
    
    // nonceMask = 1 << (order.nonce & 0xff)
    const nonceMask = bn(1).shl(bn(order.nonce).and(0xff).toNumber());
    if (!nonceMask.and(statusVector).isZero()) {
      throw new Error("not-fillable");
    }
  } else {
    const info = (order.side == OrderSide.SELL_ORDER) ?
        await exchange.getERC1155SellOrderInfo(toRawErc1155Order(order)) :
        await exchange.getERC1155BuyOrderInfo(toRawErc1155Order(order));
    if (!bn(info.status).eq(1) || bn(info.remainingAmount).isZero()) {
      throw new Error("not-fillable");
    }
  }
}
