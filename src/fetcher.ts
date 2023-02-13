import axios from "axios";
import { OrderKind } from "./types";
import { Chain, s } from "./utils";
import { toElementOrder } from "./converter";
import { checkValidity } from "./checker";

export type FetchOrdersParams = {
  chain: "eth" | "bsc" | "polygon" | "avalanche";
  side?: "0" | "1"; // 0 = buy, 1 = sell
  payment_token?: string;
  order_by?: "created_at" | "base_price";
  direction?: "desc" | "asc";
  listed_before?: number; // seconds
  listed_after?: number; // seconds
  limit?: number;
};

export type FetchedOrder = {
  createTime: number;
  expirationTime: number;
  listingTime: number;
  
  orderHash: string;
  maker: string;
  taker: string;
  
  side: number;
  saleKind: number;
  paymentToken: string;
  
  schema: string;
  contractAddress: string;
  tokenId: string;
  quantity: string;
  
  exchangeData: string;
}

export class Fetcher {
  
  public async fetchOrders(
    chainId: number,
    side: "sell" | "buy",
    listedBefore = 0,
    limit = 50
  ) {
    let newCursor = listedBefore;
    
    const url = this.buildFetchOrdersURL({
      chain: Chain[chainId] as any,
      side: side === "sell" ? "1" : "0",
      listed_before: listedBefore > 0 ? listedBefore : undefined,
      order_by: "created_at",
      direction: "desc",
      limit: limit,
    });
    
    try {
      const response = await axios.get(url, {
        headers: {
          "x-api-key": '',
        },
        timeout: 10000,
      });
      
      const fetchedOrders: FetchedOrder[] = response.data.data.orders;
      const values: any[] = [];
      
      for (const fetchedOrder of fetchedOrders) {
        if (
          fetchedOrder.saleKind == OrderKind.FixedPrice ||
          fetchedOrder.saleKind == OrderKind.BatchSignedOrder ||
          fetchedOrder.saleKind == OrderKind.ContractOffer
        ) {
          const order = await this.parseOrder(chainId, fetchedOrder);
          if (order) {
            values.push({
              id: order.id,
              target: order.nftAddress,
              maker: order.maker,
              created_at: fetchedOrder.createTime,
              data: order as any,
              source: "element",
            })
          }
        }
      }
      
      if (values.length) {
        // await sendToOrdersQueue(values);
      }
      
      if (fetchedOrders.length) {
        newCursor = fetchedOrders[0].createTime
      }
    } catch (error) {
      throw error;
    }
    return newCursor;
  }
  
  public async parseOrder(chainId: number, fetchedOrder: FetchedOrder) {
    try {
      const order = toElementOrder(fetchedOrder)
      if (order) {
        // check orderHash and signature.
        checkValidity(chainId, order);
        
        // check fillability if needed.
        // await checkFillability(provider, order);
        return order
      }
    } catch {
    }
  }
  
  public buildFetchOrdersURL(params: FetchOrdersParams) {
    // For now there's no support for testnets
    // https://element.readme.io/reference/retrieve-orders-list
    const baseApiUrl = `https://api.element.market/openapi/v1/orders/list`;
    const queryParams = new URLSearchParams();
    
    if (params.chain) {
      queryParams.append("chain", s(params.chain));
    }
    
    if (params.limit) {
      queryParams.append("limit", s(params.limit));
    }
    
    if (params.listed_after) {
      queryParams.append("listed_after", s(params.listed_after));
    }
    
    if (params.listed_before) {
      queryParams.append("listed_before", s(params.listed_after));
    }
    
    if (params.order_by) {
      queryParams.append("order_by", s(params.order_by));
    }
    
    if (params.direction) {
      queryParams.append("direction", s(params.direction));
    }
    
    if (params.side) {
      queryParams.append("side", s(params.side));
    }
    
    return decodeURI(`${ baseApiUrl }?${ queryParams.toString() }`);
  }
}
