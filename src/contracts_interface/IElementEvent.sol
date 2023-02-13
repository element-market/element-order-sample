// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IElementEvent {

    struct Fee {
        address recipient;
        uint256 amount;
    }

    /// @dev Emitted HashNonceIncremented.
    /// topic: 0x4cf3e8a83c6bf8a510613208458629675b4ae99b8029e3ab6cb6a86e5f01fd31
    event HashNonceIncremented(address maker, uint256 newHashNonce);

    /// @dev Emitted whenever an `ERC721Order` is cancelled.
    /// topic: 0xa015ad2dc32f266993958a0fd9884c746b971b254206f3478bc43e2f125c7b9e
    event ERC721OrderCancelled(address maker, uint256 nonce);

    /// @dev Emitted whenever an `ERC1155Order` is cancelled.
    /// topic: 0x4d5ea7da64f50a4a329921b8d2cab52dff4ebcc58b61d10ff839e28e91445684
    event ERC1155OrderCancelled(address maker, uint256 nonce);

    /// @dev Emitted whenever an `ERC721SellOrder` is filled.
    /// topic: 0x9c248aa1a265aa616f707b979d57f4529bb63a4fc34dc7fc61fdddc18410f74e
    /// Note that: The erc20FillAmount includes fees.
    event ERC721SellOrderFilled(
        bytes32 orderHash,
        address maker,
        address taker,
        uint256 nonce,
        address erc20Token,
        uint256 erc20TokenAmount,
        Fee[] fees,
        address erc721Token,
        uint256 erc721TokenId
    );

    /// @dev Emitted whenever an `ERC721BuyOrder` is filled.
    /// topic: 0xd90a5c60975c6ff8eafcf02088e7b50ae5d9e156a79206ba553df1c4fb4594c2
    /// Note that: The erc20FillAmount includes fees.
    event ERC721BuyOrderFilled(
        bytes32 orderHash,
        address maker,
        address taker,
        uint256 nonce,
        address erc20Token,
        uint256 erc20TokenAmount,
        Fee[] fees,
        address erc721Token,
        uint256 erc721TokenId
    );

    /// @dev Emitted whenever an `ERC1155SellOrder` is filled.
    /// topic: 0xfcde121a3f6a9b14a3ce266d61fc00940de86c4d8c1d733fe62d503ae5d99ff9
    /// Note that: The erc20FillAmount includes fees.
    event ERC1155SellOrderFilled(
        bytes32 orderHash,
        address maker,
        address taker,
        uint256 nonce,
        address erc20Token,
        uint256 erc20FillAmount,
        Fee[] fees,
        address erc1155Token,
        uint256 erc1155TokenId,
        uint128 erc1155FillAmount
    );

    /// @dev Emitted whenever an `ERC1155BuyOrder` is filled.
    /// topic: 0x105616901449a64554ca9246a5bbcaca973b40b3c0055e5070c6fa191618d9f3
    /// Note that: The erc20FillAmount includes fees.
    event ERC1155BuyOrderFilled(
        bytes32 orderHash,
        address maker,
        address taker,
        uint256 nonce,
        address erc20Token,
        uint256 erc20FillAmount,
        Fee[] fees,
        address erc1155Token,
        uint256 erc1155TokenId,
        uint128 erc1155FillAmount
    );
}
