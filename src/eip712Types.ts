import * as Addresses from "./addresses";
import { ElementOrder, OrderKind, OrderSide, Schema } from "./types";
import { toRawBatchSignedOrder, toRawErc1155Order, toRawErc721Order } from "./converter";

export const EIP712_DOMAIN = (chainId: number) => ({
  name: "ElementEx",
  version: "1.0.0",
  chainId,
  verifyingContract: Addresses.Exchange[chainId],
});

export const NFT_SELL_ORDER_EIP712_TYPES = {
  NFTSellOrder: [
    { type: "address", name: "maker" },
    { type: "address", name: "taker" },
    { type: "uint256", name: "expiry" },
    { type: "uint256", name: "nonce" },
    { type: "address", name: "erc20Token" },
    { type: "uint256", name: "erc20TokenAmount" },
    { type: "Fee[]", name: "fees" },
    { type: "address", name: "nft" },
    { type: "uint256", name: "nftId" },
    { type: "uint256", name: "hashNonce" },
  ],
  Fee: [
    { name: "recipient", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "feeData", type: "bytes" },
  ],
};

export const NFT_BUY_ORDER_EIP712_TYPES = {
  Fee: [
    { name: "recipient", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "feeData", type: "bytes" },
  ],
  Property: [
    { name: "propertyValidator", type: "address" },
    { name: "propertyData", type: "bytes" },
  ],
  NFTBuyOrder: [
    { type: "address", name: "maker" },
    { type: "address", name: "taker" },
    { type: "uint256", name: "expiry" },
    { type: "uint256", name: "nonce" },
    { type: "address", name: "erc20Token" },
    { type: "uint256", name: "erc20TokenAmount" },
    { type: "Fee[]", name: "fees" },
    { type: "address", name: "nft" },
    { type: "uint256", name: "nftId" },
    { type: "Property[]", name: "nftProperties" },
    { type: "uint256", name: "hashNonce" },
  ],
};

export const ERC1155_SELL_ORDER_EIP712_TYPES = {
  ERC1155SellOrder: [
    { name: "maker", type: "address" },
    { name: "taker", type: "address" },
    { name: "expiry", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "erc20Token", type: "address" },
    { name: "erc20TokenAmount", type: "uint256" },
    { name: "fees", type: "Fee[]" },
    { name: "erc1155Token", type: "address" },
    { name: "erc1155TokenId", type: "uint256" },
    { name: "erc1155TokenAmount", type: "uint128" },
    { name: "hashNonce", type: "uint256" },
  ],
  Fee: [
    { name: "recipient", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "feeData", type: "bytes" },
  ],
};

export const ERC1155_BUY_ORDER_EIP712_TYPES = {
  ERC1155BuyOrder: [
    { name: "maker", type: "address" },
    { name: "taker", type: "address" },
    { name: "expiry", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "erc20Token", type: "address" },
    { name: "erc20TokenAmount", type: "uint256" },
    { name: "fees", type: "Fee[]" },
    { name: "erc1155Token", type: "address" },
    { name: "erc1155TokenId", type: "uint256" },
    { name: "erc1155TokenProperties", type: "Property[]" },
    { name: "erc1155TokenAmount", type: "uint128" },
    { type: "uint256", name: "hashNonce" },
  ],
  Fee: [
    { name: "recipient", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "feeData", type: "bytes" },
  ],
  Property: [
    { name: "propertyValidator", type: "address" },
    { name: "propertyData", type: "bytes" },
  ],
};

export const BATCH_SIGNED_ORDER_EIP712_TYPES = {
  BatchSignedERC721Orders: [
    { type: "address", name: "maker" },
    { type: "uint256", name: "listingTime" },
    { type: "uint256", name: "expiryTime" },
    { type: "uint256", name: "startNonce" },
    { type: "address", name: "erc20Token" },
    { type: "address", name: "platformFeeRecipient" },
    { type: "BasicCollection[]", name: "basicCollections" },
    { type: "Collection[]", name: "collections" },
    { type: "uint256", name: "hashNonce" },
  ],
  BasicCollection: [
    { type: "address", name: "nftAddress" },
    { type: "bytes32", name: "fee" },
    { type: "bytes32[]", name: "items" },
  ],
  Collection: [
    { type: "address", name: "nftAddress" },
    { type: "bytes32", name: "fee" },
    { type: "OrderItem[]", name: "items" },
  ],
  OrderItem: [
    { type: "uint256", name: "erc20TokenAmount" },
    { type: "uint256", name: "nftId" },
  ],
};

export const getEip712TypesAndValue = (order: ElementOrder) => {
  if (order.kind == OrderKind.BatchSignedOrder) {
    return [
      BATCH_SIGNED_ORDER_EIP712_TYPES,
      toRawBatchSignedOrder(order),
      "BatchSignedERC721Orders",
    ];
  } else {
    if (order.schema == Schema.ERC721) {
      if (order.side == OrderSide.SELL_ORDER) {
        return [
          NFT_SELL_ORDER_EIP712_TYPES,
          toRawErc721Order(order),
          "NFTSellOrder",
        ];
      } else {
        return [
          NFT_BUY_ORDER_EIP712_TYPES,
          toRawErc721Order(order),
          "NFTBuyOrder",
        ];
      }
    } else {
      if (order.side == OrderSide.SELL_ORDER) {
        return [
          ERC1155_SELL_ORDER_EIP712_TYPES,
          toRawErc1155Order(order),
          "ERC1155SellOrder",
        ];
      } else {
        return [
          ERC1155_BUY_ORDER_EIP712_TYPES,
          toRawErc1155Order(order),
          "ERC1155BuyOrder",
        ];
      }
    }
  }
}
