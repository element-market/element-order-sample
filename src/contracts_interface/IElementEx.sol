// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IElementOrder.sol";

interface IElement is IElementOrder {

    enum OrderStatus {
        INVALID,
        FILLABLE,
        UNFILLABLE,
        EXPIRED
    }

    struct OrderInfo {
        bytes32 orderHash;
        OrderStatus status;
        uint128 orderAmount;
        // The remaining amount of the ERC721/ERC1155 asset
        // that can be filled for the order.
        uint128 remainingAmount;
    }

    /// data1 [56 bits(startNonce) + 8 bits(v) + 32 bits(listingTime) + 160 bits(maker)]
    /// data2 [64 bits(taker part1) + 32 bits(expiryTime) + 160 bits(erc20Token)]
    /// data3 [96 bits(taker part2) + 160 bits(platformFeeRecipient)]
    struct BatchSignedParameter {
        uint256 data1;
        uint256 data2;
        uint256 data3;
        bytes32 r;
        bytes32 s;
    }

    /// data1 [56 bits(startNonce) + 8 bits(v) + 32 bits(listingTime) + 160 bits(maker)]
    /// data2 [64 bits(taker part1) + 32 bits(expiryTime) + 160 bits(erc20Token)]
    /// data3 [96 bits(taker part2) + 160 bits(platformFeeRecipient)]
    struct BatchSignedParameters {
        uint256 data1;
        uint256 data2;
        uint256 data3;
        bytes32 r;
        bytes32 s;
        bytes collections;
    }

    function buyERC721Ex(
        NFTSellOrder calldata sellOrder,
        Signature calldata signature,
        address taker,
        bytes calldata takerData
    ) external payable;

    function batchBuyERC721sEx(
        NFTSellOrder[] calldata sellOrders,
        Signature[] calldata signatures,
        address[] calldata takers,
        bytes[] calldata takerDatas,
        bool revertIfIncomplete
    ) external payable returns (bool[] memory successes);

    function buyERC1155Ex(
        ERC1155SellOrder calldata sellOrder,
        Signature calldata signature,
        address taker,
        uint128 erc1155BuyAmount,
        bytes calldata takerData
    ) external payable;

    function batchBuyERC1155sEx(
        ERC1155SellOrder[] calldata sellOrders,
        Signature[] calldata signatures,
        address[] calldata takers,
        uint128[] calldata erc1155TokenAmounts,
        bytes[] calldata takerDatas,
        bool revertIfIncomplete
    ) external payable returns (bool[] memory successes);

    function sellERC721(
        NFTBuyOrder calldata buyOrder,
        Signature calldata signature,
        uint256 erc721TokenId,
        bool unwrapNativeToken,
        bytes calldata takerData
    ) external;

    function sellERC1155(
        ERC1155BuyOrder calldata buyOrder,
        Signature calldata signature,
        uint256 erc1155TokenId,
        uint128 erc1155SellAmount,
        bool unwrapNativeToken,
        bytes calldata takerData
    ) external;

    function fillBatchSignedERC721Order(
        BatchSignedParameter calldata parameter,
        bytes calldata collections
    ) external payable;

    /// @param additional1 [96 bits(withdrawETHAmount) + 160 bits(erc20Token)]
    /// @param additional2 [8 bits(revertIfIncomplete) + 88 bits(unused) + 160 bits(royaltyFeeRecipient)]
    function fillBatchSignedERC721Orders(
        BatchSignedParameters[] calldata parameters,
        uint256 additional1,
        uint256 additional2
    ) external payable;

    function batchCancelERC721Orders(uint256[] calldata orderNonces) external;

    function batchCancelERC1155Orders(uint256[] calldata orderNonces) external;

    // Cancel all orders for msg.sender
    function incrementHashNonce() external;

    function getHashNonce(address maker) external view returns (uint256);

    function getERC721OrderStatusBitVector(address maker, uint248 nonceRange)
        external
        view
        returns (uint256);

    function getERC1155SellOrderInfo(ERC1155SellOrder calldata order)
        external
        view
        returns (OrderInfo memory orderInfo);

    function getERC1155BuyOrderInfo(ERC1155BuyOrder calldata order)
        external
        view
        returns (OrderInfo memory orderInfo);
}
