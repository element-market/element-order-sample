// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IElementOrder {

    /// @dev Allowed signature types.
    enum SignatureType {
        EIP712,
        PRESIGNED
    }

    /// @dev Encoded EC signature.
    struct Signature {
        // How to validate the signature.
        SignatureType signatureType;
        // EC Signature data.
        uint8 v;
        // EC Signature data.
        bytes32 r;
        // EC Signature data.
        bytes32 s;
    }

    struct Property {
        address propertyValidator;
        bytes propertyData;
    }

    struct Fee {
        address recipient;
        uint256 amount;
        bytes feeData;
    }

    struct OrderItem {
        uint256 erc20TokenAmount;
        uint256 nftId;
    }

    /// fee [16 bits(platformFeePercentage) + 16 bits(royaltyFeePercentage) + 160 bits(royaltyFeeRecipient)].
    /// items [96 bits(erc20TokenAmount) + 160 bits(nftId)].
    struct BasicCollection {
        address nftAddress;
        bytes32 fee;
        bytes32[] items;
    }

    /// fee [16 bits(platformFeePercentage) + 16 bits(royaltyFeePercentage) + 160 bits(royaltyFeeRecipient)].
    struct Collection {
        address nftAddress;
        bytes32 fee;
        OrderItem[] items;
    }

    struct NFTSellOrder {
        address maker;
        address taker;
        uint256 expiry;
        uint256 nonce;
        address erc20Token;
        uint256 erc20TokenAmount;
        Fee[] fees;
        address nft;
        uint256 nftId;
    }

    // All fields except `nftProperties` align
    // with those of NFTSellOrder
    struct NFTBuyOrder {
        address maker;
        address taker;
        uint256 expiry;
        uint256 nonce;
        address erc20Token;
        uint256 erc20TokenAmount;
        Fee[] fees;
        address nft;
        uint256 nftId;
        Property[] nftProperties;
    }

    // All fields except `erc1155TokenAmount` align
    // with those of NFTSellOrder
    struct ERC1155SellOrder {
        address maker;
        address taker;
        uint256 expiry;
        uint256 nonce;
        address erc20Token;
        uint256 erc20TokenAmount;
        Fee[] fees;
        address erc1155Token;
        uint256 erc1155TokenId;
        // End of fields shared with NFTOrder
        uint128 erc1155TokenAmount;
    }

    // All fields except `erc1155TokenAmount` align
    // with those of NFTBuyOrder
    struct ERC1155BuyOrder {
        address maker;
        address taker;
        uint256 expiry;
        uint256 nonce;
        address erc20Token;
        uint256 erc20TokenAmount;
        Fee[] fees;
        address erc1155Token;
        uint256 erc1155TokenId;
        Property[] erc1155TokenProperties;
        // End of fields shared with NFTOrder
        uint128 erc1155TokenAmount;
    }

    struct BatchSignedERC721Orders {
        address maker;
        uint256 listingTime;
        uint256 expiryTime;
        uint256 startNonce;
        address erc20Token;
        address platformFeeRecipient;
        BasicCollection[] basicCollections;
        Collection[] collections;
        uint256 hashNonce;
    }
}
