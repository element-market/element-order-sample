export enum OrderSide {
  SELL_ORDER,
  BUY_ORDER
}

export enum OrderKind {
  FixedPrice,
  DutchAuction,
  EnglishAuction,
  BatchSignedOrder,
  ContractOffer = 7
}

export enum Schema {
  ERC721 = "erc721",
  ERC1155 = "erc1155"
}

export type OrderData = {
  fees: {
    recipient: string;
    amount: string;
    feeData: string;
  }[];
  properties?: {
    propertyValidator: string;
    propertyData: string;
  }[];
}

export type CollectionData = {
  nftAddress: string;
  platformFee: number;
  royaltyFeeRecipient: string;
  royaltyFee: number;
  items: {
    erc20TokenAmount: string;
    nftId: string;
  }[];
};

export type BatchSignedData = {
  startNonce: string;
  platformFeeRecipient: string;
  basicCollections: CollectionData[];
  collections: CollectionData[];
}

export type ElementOrder = {
  id: string;
  hash: string;
  side: OrderSide;
  kind: OrderKind;
  maker: string;
  taker: string;
  listingTime: number;
  expirationTime: number;
  nonce: string;
  currency: string;
  price: string;
  schema: Schema;
  nftAddress: string;
  nftId: string;
  nftAmount: string;
  data: OrderData | BatchSignedData;
  hashNonce: string;
  v: number;
  r: string;
  s: string;
};

export type MatchParams = {
  nftId?: string;
  nftAmount?: string;
};
