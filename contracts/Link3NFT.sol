// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

string constant NAME = "Link 3 NFT";
string constant SYMBOL = "L3NFT";

error NotOwner(address user);

contract Link3NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address private immutable i_owner;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert NotOwner(msg.sender);
        }
        _;
    }

    event CreatedNFT(address indexed owner, uint256 indexed tokenId);

    constructor() ERC721(NAME, SYMBOL) {
        i_owner = msg.sender;
    }

    function airDropNFT(address to, string memory tokenURI) external onlyOwner {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId);
        _setTokenURI(newItemId, tokenURI);

        emit CreatedNFT(to, newItemId);
    }
}
