// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

string constant NAME = "Link 3 Dollar";
string constant SYMBOL = "L3D";

error NotOwner(address user);
error UserAlreadyJoined(address user);
error UserNotYetJoined(address user);

contract Link3Dollar is ERC20 {
    address private immutable i_owner;
    uint256 private s_welcome_reward_amount;
    mapping(address => bool) private s_addressWelcomeReward;

    event WelcomedUser(address indexed user);

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert NotOwner(msg.sender);
        }
        _;
    }

    modifier onlyNotJoined(address user) {
        if (s_addressWelcomeReward[user]) {
            revert UserAlreadyJoined(user);
        }
        _;
    }

    constructor() ERC20(NAME, SYMBOL) {
        i_owner = msg.sender;
        s_welcome_reward_amount = 2000;
    }

    function setWelcomeRewardAmount(uint256 amount) external onlyOwner {
        s_welcome_reward_amount = amount;
    }

    function grantWelcomeRewardTo(address to) external onlyOwner onlyNotJoined(to) {
        s_addressWelcomeReward[to] = true;
        _mint(to, s_welcome_reward_amount);
        emit WelcomedUser(to);
    }

    function grantDollarsTo(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function removeDollarsFrom(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    function getWelcomeRewardAmount() public view returns (uint256) {
        return s_welcome_reward_amount;
    }

    function isUserGrantedWelcomeReward(address _address) public view returns (bool) {
        return s_addressWelcomeReward[_address];
    }

    function decimals() public pure override returns (uint8) {
        return 2;
    }
}
