const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")

let tokenId = 1
let deployerPk = ""
let userPk = ""

async function cancelItem() {
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
    const tx = await link3NFTMarketplace.connect(user).cancelListing(link3NFT.address, tokenId)
    await tx.wait(1)
    console.log("NFT Canceled!")
    if (network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

cancelItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
