import { Interface } from "@ethersproject/abi";

export type EventData = {
  topic: string;
  abi: Interface;
};

export const ERC721SellOrderFilled: EventData = {
  topic: "0x9c248aa1a265aa616f707b979d57f4529bb63a4fc34dc7fc61fdddc18410f74e",
  abi: new Interface([
    `event ERC721SellOrderFilled(
      bytes32 orderHash,
      address maker,
      address taker,
      uint256 nonce,
      address erc20Token,
      uint256 erc20TokenAmount,
      (
        address recipient,
        uint256 amount
      )[] fees,
      address erc721Token,
      uint256 erc721TokenId
    )`,
  ]),
};

export const ERC721BuyOrderFilled: EventData = {
  topic: "0xd90a5c60975c6ff8eafcf02088e7b50ae5d9e156a79206ba553df1c4fb4594c2",
  abi: new Interface([
    `event ERC721BuyOrderFilled(
        bytes32 orderHash,
        address maker,
        address taker,
        uint256 nonce,
        address erc20Token,
        uint256 erc20TokenAmount,
        (
            address recipient,
            uint256 amount
        )[] fees,
        address erc721Token,
        uint256 erc721TokenId
    )`,
  ]),
};

export const ERC1155SellOrderFilled: EventData = {
  topic: "0xfcde121a3f6a9b14a3ce266d61fc00940de86c4d8c1d733fe62d503ae5d99ff9",
  abi: new Interface([
    `event ERC1155SellOrderFilled(
        bytes32 orderHash,
        address maker,
        address taker,
        uint256 nonce,
        address erc20Token,
        uint256 erc20FillAmount,
        (
            address recipient,
            uint256 amount
        )[] fees,
        address erc1155Token,
        uint256 erc1155TokenId,
        uint128 erc1155FillAmount
      )`,
  ]),
};

export const ERC1155BuyOrderFilled: EventData = {
  topic: "0x105616901449a64554ca9246a5bbcaca973b40b3c0055e5070c6fa191618d9f3",
  abi: new Interface([
    `event ERC1155BuyOrderFilled(
        bytes32 orderHash,
        address maker,
        address taker,
        uint256 nonce,
        address erc20Token,
        uint256 erc20FillAmount,
        (
            address recipient,
            uint256 amount
        )[] fees,
        address erc1155Token,
        uint256 erc1155TokenId,
        uint128 erc1155FillAmount
      )`,
  ]),
};

export const ERC721OrderCancelled: EventData = {
  topic: "0xa015ad2dc32f266993958a0fd9884c746b971b254206f3478bc43e2f125c7b9e",
  abi: new Interface([
    `event ERC721OrderCancelled(
      address maker,
      uint256 nonce
    )`,
  ]),
};

export const ERC1155OrderCancelled: EventData = {
  topic: "0x4d5ea7da64f50a4a329921b8d2cab52dff4ebcc58b61d10ff839e28e91445684",
  abi: new Interface([
    `event ERC1155OrderCancelled(
      address maker,
      uint256 nonce
    )`,
  ]),
};

export const HashNonceIncremented: EventData = {
  topic: "0x4cf3e8a83c6bf8a510613208458629675b4ae99b8029e3ab6cb6a86e5f01fd31",
  abi: new Interface([
    `event HashNonceIncremented(
      address maker,
      uint256 newHashNonce
    )`,
  ]),
};
