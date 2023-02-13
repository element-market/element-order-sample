import { BigNumber, Signer, Contract } from "ethers";
import { TransactionResponse } from '@ethersproject/abstract-provider';

import * as Addresses from "./addresses";
import * as Types from "./types";
import { BatchSignedData, CollectionData, ElementOrder, OrderKind, OrderSide, Schema } from "./types";

import ExchangeAbi from "./abis/Exchange.json";
import { bn, encodeBits, lc, n } from "./utils";
import { toRawErc1155Order, toRawERC20Token, toRawErc721Order } from "./converter";

// MASK_96 = (1 << 96) - 1
const MASK_96 = bn(1).shl(96).sub(1);

export class Exchange {
  public chainId: number;
  public contract: Contract;
  
  constructor(chainId: number) {
    this.chainId = chainId;
    this.contract = new Contract(Addresses.Exchange[this.chainId], ExchangeAbi);
  }
  
  // --- Fill order ---
  public async fillOrder(
    signer: Signer,
    order: ElementOrder,
    matchParams: Types.MatchParams,
  ): Promise<TransactionResponse> {
    const to = this.contract.address;
    const taker = await signer.getAddress();
    let data: string;
    let value: BigNumber | undefined;
    
    if (order.kind == OrderKind.BatchSignedOrder) {
      const d = order.data as BatchSignedData;
      
      // data1 [56 bits(startNonce) + 8 bits(v) + 32 bits(listingTime) + 160 bits(maker)]
      const data1 = encodeBits([
        [d.startNonce, 56],
        [order.v, 8],
        [order.listingTime, 32],
        [order.maker, 160]
      ]);
      
      // taker [64 bits(part1) + 96 bits(part2)]
      const takerPart1 = bn(taker).shr(96).toHexString();
      const takerPart2 = bn(taker).and(MASK_96).toHexString();
      
      // data2 [64 bits(taker part1) + 32 bits(expiryTime) + 160 bits(erc20Token)]
      const data2 = encodeBits([
        [takerPart1, 64],
        [order.expirationTime, 32],
        [toRawERC20Token(order.currency), 160]
     ]);
      
      // data3 [96 bits(taker part2) + 160 bits(platformFeeRecipient)]
      const data3 = encodeBits([
        [takerPart2, 96],
        [d.platformFeeRecipient, 160],
      ]);
      
      const collectionsBytes = generateCollectionsBytes(d, order.nonce);
      data = this.contract.interface.encodeFunctionData("fillBatchSignedERC721Order", [
        {
          data1,
          data2,
          data3,
          r: order.r,
          s: order.s,
        },
        collectionsBytes,
      ]);
      
      if (lc(order.currency) == Addresses.AddressZero) {
        value = bn(order.price);
      }
    } else {
      const signature = {
        signatureType: 0,
        v: order.v,
        r: order.r,
        s: order.s,
      };
      
      if (order.side == OrderSide.SELL_ORDER) {
        if (order.schema == Schema.ERC721) {
          data = this.contract.interface.encodeFunctionData("buyERC721Ex", [
            toRawErc721Order(order),
            signature,
            taker,
            "0x",
          ]);
          if (lc(order.currency) == Addresses.AddressZero) {
            value = bn(order.price);
          }
        } else {
          data = this.contract.interface.encodeFunctionData("buyERC1155Ex", [
            toRawErc1155Order(order),
            signature,
            taker,
            matchParams.nftAmount!,
            "0x",
          ]);
          if (lc(order.currency) == Addresses.AddressZero) {
            value = bn(order.price).mul(matchParams.nftAmount!);
          }
        }
      } else {
        const unwrapNativeToken = (lc(order.currency) == lc(Addresses.WEth[this.chainId]));
        const nftId = (order.kind == OrderKind.ContractOffer) ? matchParams.nftId! : order.nftId;
        
        if (order.schema == Schema.ERC721) {
          data = this.contract.interface.encodeFunctionData("sellERC721", [
            toRawErc721Order(order),
            signature,
            nftId,
            unwrapNativeToken,
            "0x",
          ]);
        } else {
          data = this.contract.interface.encodeFunctionData("sellERC1155", [
            toRawErc1155Order(order),
            signature,
            nftId,
            matchParams.nftAmount!,
            unwrapNativeToken,
            "0x",
          ]);
        }
      }
    }
  
    return signer.sendTransaction({
      from: taker,
      to,
      data: data,
      value: value && bn(value).toHexString(),
    });
  }
  
  public async cancelOrder(signer: Signer, order: ElementOrder): Promise<TransactionResponse> {
    let data: string;
    if (order.schema == Schema.ERC721) {
      data = this.contract.interface.encodeFunctionData("batchCancelERC721Orders", [
        [order.nonce],
      ]);
    } else {
      data = this.contract.interface.encodeFunctionData("batchCancelERC1155Orders", [
        [order.nonce],
      ]);
    }
  
    return signer.sendTransaction({
      to: this.contract.address,
      data: data,
    });
  }
  
  public async cancelAllOrdersByUser(signer: Signer): Promise<TransactionResponse> {
    const data: string = this.contract.interface.encodeFunctionData("incrementHashNonce", []);
    return signer.sendTransaction({
      to: this.contract.address,
      data: data,
    });
  }
}

const generateCollectionsBytes = (data: BatchSignedData, orderNonce: string): string => {
  let bytes = "0x";
  let current = n(data.startNonce);
  if (data.basicCollections?.length) {
    for (const collection of data.basicCollections) {
      bytes += generateCollectionBytes(true, collection, n(orderNonce), current);
      current += collection.items.length;
    }
  }
  if (data.collections?.length) {
    for (const collection of data.collections) {
      bytes += generateCollectionBytes(false, collection, n(orderNonce), current);
      current += collection.items.length;
    }
  }
  return bytes;
};

const generateCollectionBytes = (
  isBasic: boolean,
  collection: CollectionData,
  orderNonce: number,
  nonce: number
): string => {
  let filledIndex = 0;
  let filledCount = 0;
  for (let i = 0; i < collection.items.length; i++, nonce++) {
    if (nonce == orderNonce) {
      filledIndex = i;
      filledCount = 1;
      break;
    }
  }
  
  // head1 [96 bits(filledIndexList part1) + 160 bits(nftAddress)]
  // Here, the leftmost 1 byte is used for filledIndex.
  const head1 = encodeBits([
    [filledIndex, 8],
    [0, 88],
    [collection.nftAddress, 160]
  ], false);
  
  // head2 [8 bits(collectionType) + 8 bits(itemsCount) + 8 bits(filledCount) + 8 bits(unused)
  //        + 32 bits(filledIndexList part2)
  //        + 16 bits(platformFee) + 16 bits(royaltyFee) + 160 bits(royaltyFeeRecipient)]
  const head2 = encodeBits([
    [isBasic ? 0 : 1, 8],
    [collection.items.length, 8],
    [filledCount, 8],
    [0, 8],
    [0, 32],
    [collection.platformFee, 16],
    [collection.royaltyFee, 16],
    [collection.royaltyFeeRecipient, 160],
  ], false);
  
  let bytes = head1 + head2;
  if (isBasic) {
    for (const item of collection.items) {
      // item [96 bits(erc20TokenAmount) + 160 bits(nftId)].
      bytes += encodeBits([
        [item.erc20TokenAmount, 96],
        [item.nftId, 160]
     ], false);
    }
  } else {
    for (const item of collection.items) {
      bytes += (
        encodeBits([[item.erc20TokenAmount, 256]], false) +
        encodeBits([[item.nftId, 256]], false)
      );
    }
  }
  return bytes;
};
