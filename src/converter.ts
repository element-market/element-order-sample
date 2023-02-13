import { BatchSignedData, CollectionData, ElementOrder, OrderData, OrderKind, Schema } from "./types";
import { FetchedOrder } from "./fetcher";
import { bn, encodeBits, lc, n, s } from "./utils";
import { AddressZero, NativeEthAddress } from "./addresses";
import { keccak256 } from "@ethersproject/keccak256";
import { defaultAbiCoder } from "@ethersproject/abi";

// Note that only the orderHash and nonce can uniquely determine the orderId.
export const toOrderId = (orderHash: string, orderNonce: string): string => {
  return keccak256(defaultAbiCoder.encode(
    [ "bytes32", "uint256" ],
    [ orderHash, orderNonce ]
  ));
}

export const toElementOrder = (order: FetchedOrder): ElementOrder | undefined => {
  const hash = order.orderHash.split(':')[0];
  const schema = lc(order.schema) == Schema.ERC721 ? Schema.ERC721 : Schema.ERC1155;
  
  let nonce;
  let hashNonce;
  let price;
  let nftAmount;
  let sig;
  let data;
  if (order.saleKind == OrderKind.BatchSignedOrder) {
    const json = JSON.parse(order.exchangeData);
    
    nonce = s(json.nonce);
    hashNonce = s(json.hashNonce);
    sig = {
      v: n(json.v),
      r: s(json.r),
      s: s(json.s),
    };
    data = {
      startNonce: s(json.startNonce),
      platformFeeRecipient: lc(json.platformFeeRecipient),
      basicCollections: normalizeCollections(json.basicCollections),
      collections: normalizeCollections(json.collections),
    };
    nftAmount = "1";
  
    const orderItem = findBatchSignedOrderItem(data, nonce);
    price = s(orderItem.erc20TokenAmount);
  } else {
    const json = JSON.parse(order.exchangeData)
    const rawOrder = json.order;
    
    sig = json.signature;
    nonce = s(rawOrder.nonce);
    hashNonce = s(rawOrder.hashNonce);
    nftAmount = (schema == Schema.ERC721) ? "1" : s(rawOrder.erc1155TokenAmount);
    
    const properties = (schema == Schema.ERC721) ? rawOrder.nftProperties : rawOrder.erc1155TokenProperties;
    data = {
      fees: rawOrder.fees?.map((item: any) => ({
        recipient: lc(item.recipient),
        amount: s(item.amount),
        feeData: lc(item.feeData),
      })) || [],
      properties: properties?.map((item: any) => ({
        propertyValidator: lc(item.propertyValidator),
        propertyData: lc(item.propertyData),
      })) || undefined,
    };
    
    let erc20Amount = bn(rawOrder.erc20TokenAmount);
    for (const fee of data.fees) {
      erc20Amount = erc20Amount.add(fee.amount);
    }
    price = s(erc20Amount.div(nftAmount));
  }
  
  // Note that only the orderHash and nonce can uniquely determine the orderId.
  const id = toOrderId(hash, nonce);
  return {
    id,
    hash,
    side: order.side,
    kind: order.saleKind,
    maker: lc(order.maker),
    taker: lc(order.taker),
    listingTime: n(order.listingTime),
    expirationTime: n(order.expirationTime),
    nonce,
    currency: toStandardERC20Token(order.paymentToken),
    price,
    schema,
    nftAddress: lc(order.contractAddress),
    nftId: s(order.tokenId),
    nftAmount,
    data,
    hashNonce,
    v: n(sig.v),
    r: s(sig.r),
    s: s(sig.s),
  }
}

export const toStandardERC20Token = (address: string): string => {
  if (!address || lc(address) == NativeEthAddress) {
    return AddressZero;
  }
  return lc(address);
};

export const toRawERC20Token = (address: string): string => {
  if (!address || lc(address) == AddressZero) {
    return NativeEthAddress;
  }
  return lc(address);
};

export const toRawErc721Order = (order: ElementOrder): any => {
  const data = order.data as OrderData;
  return {
    maker: order.maker,
    taker: order.taker,
    expiry: getExpiry(order),
    nonce: order.nonce,
    erc20Token: toRawERC20Token(order.currency),
    erc20TokenAmount: getRawERC20Amount(order),
    fees: data.fees,
    nft: order.nftAddress,
    nftId: order.nftId,
    nftProperties: data.properties,
    hashNonce: order.hashNonce,
  };
};

export const toRawErc1155Order = (order: ElementOrder): any => {
  const data = order.data as OrderData;
  return {
    maker: order.maker,
    taker: order.taker,
    expiry: getExpiry(order),
    nonce: order.nonce,
    erc20Token: toRawERC20Token(order.currency),
    erc20TokenAmount: getRawERC20Amount(order),
    fees: data.fees,
    erc1155Token: order.nftAddress,
    erc1155TokenId: order.nftId,
    erc1155TokenAmount: order.nftAmount,
    erc1155TokenProperties: data.properties,
    hashNonce: order.hashNonce,
  };
};

export const toRawBatchSignedOrder = (order: ElementOrder): any => {
  const data = order.data as BatchSignedData;
  return {
    maker: order.maker,
    listingTime: order.listingTime,
    expiryTime: order.expirationTime,
    startNonce: data.startNonce,
    erc20Token: toRawERC20Token(order.currency),
    platformFeeRecipient: data.platformFeeRecipient,
    basicCollections: toRawCollections(data.basicCollections, true),
    collections: toRawCollections(data.collections, false),
    hashNonce: order.hashNonce,
  };
};

const toRawCollections = (collections: CollectionData[], isBasic: boolean) => {
  const list: any[] = [];
  for (const collection of collections) {
    const items: any[] = [];
    if (isBasic) {
      for (const item of collection.items) {
        // bytes32 item = [96 bits(erc20TokenAmount) + 160 bits(nftId)].
        items.push(encodeBits([
          [ item.erc20TokenAmount, 96 ],
          [ item.nftId, 160 ]
        ]));
      }
    } else {
      items.push(...collection.items);
    }
    
    // bytes32 fee
    const fee = encodeBits([
      [ 0, 64 ],
      [ collection.platformFee, 16 ],
      [ collection.royaltyFee, 16 ],
      [ collection.royaltyFeeRecipient, 160 ]
    ]);
    
    list.push({
      nftAddress: collection.nftAddress,
      fee,
      items,
    });
  }
  return list;
};

const getRawERC20Amount = (order: ElementOrder): string => {
  if (order.kind == OrderKind.BatchSignedOrder) {
    return s(bn(order.price).mul(order.nftAmount));
  } else {
    let erc20TokenAmount = bn(order.price).mul(order.nftAmount);
    const data = order.data as OrderData;
    for (const fee of data.fees) {
      erc20TokenAmount = erc20TokenAmount.sub(fee.amount);
    }
    return s(erc20TokenAmount);
  }
};

const getExpiry = (order: ElementOrder): string => {
  // [32 bits(listingTime) + 32 bits(expirationTime)
  return s(bn(order.listingTime).shl(32).or(order.expirationTime));
};

const normalizeCollections = (collections?: CollectionData[]): CollectionData[] => {
  return collections?.map((collection) => {
    return {
      nftAddress: lc(collection.nftAddress),
      platformFee: n(collection.platformFee),
      royaltyFeeRecipient: lc(collection.royaltyFeeRecipient),
      royaltyFee: n(collection.royaltyFee),
      items: collection.items?.map((item) => {
        return {
          erc20TokenAmount: s(item.erc20TokenAmount),
          nftId: s(item.nftId),
        };
      }) ?? [],
    };
  }) || [];
};

const findBatchSignedOrderItem = (data: BatchSignedData, orderNonce: string): any => {
  if (bn(orderNonce).gt(2 ** 48) || bn(data.startNonce).gt(2 ** 48)) {
    throw new Error("Invalid nonce");
  }
  
  const nonce = n(orderNonce);
  let start = n(data.startNonce);
  for (const collection of data.basicCollections) {
    let end = start + collection.items.length;
    if (nonce >= start && nonce < end) {
      const i = nonce - start;
      return collection.items[i];
    }
    start = end;
  }
  
  for (const collection of data.collections) {
    let end = start + collection.items.length;
    if (nonce >= start && nonce < end) {
      const i = nonce - start;
      return collection.items[i];
    }
    start = end;
  }
  throw new Error("Invalid order");
};
