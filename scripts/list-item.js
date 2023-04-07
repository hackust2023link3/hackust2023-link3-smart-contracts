const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")

const PRICE = 090
let tokenId = 1
let deployerPk = ""
let userPk = ""

async function listItem() {
    let deployer
    let user
    if (!developmentChains.includes(network.name)) {
        const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL)
        deployer = new ethers.Wallet(deployerPk, provider)
        user = new ethers.Wallet(userPk, provider)
    } else {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        user = accounts[1]
    }
    const link3NFTMarketplace = await ethers.getContract("Link3NFTMarketplace")
    const link3NFT = await ethers.getContract("Link3NFT")
    console.log("Approving NFT...")
    const approvalTx = await link3NFT.connect(user).approve(link3NFTMarketplace.address, tokenId)
    await approvalTx.wait(1)
    console.log("Listing NFT...")
    const tx = await link3NFTMarketplace.connect(user).listItem(link3NFT.address, tokenId, PRICE)
    await tx.wait(1)
    console.log("NFT Listed!")
    if (network.config.chainId == 31337) {
        // Moralis has a hard time if you move more than 1 at once!
        await moveBlocks(1, (sleepAmount = 1000))
    }
}

listItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
