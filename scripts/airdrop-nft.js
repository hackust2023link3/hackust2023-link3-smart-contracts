const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_URI = "https://gateway.pinata.cloud/ipfs/QmXhd8bYPdLdi1gL3QoUXJe4YoB1ub5g7SVMTENE55ahu1"
let deployerPk = ""
let targetAddress = "0x408dCD023839ffe83AFb304a26463E89fD71361b"

async function airdropNFT() {
    const link3NFT = await ethers.getContract("Link3NFT")
    let deployer
    if (!developmentChains.includes(network.name)) {
        const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL)
        deployer = new ethers.Wallet(deployerPk, provider)
    } else {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        targetAddress = accounts[1].address
    }
    console.log("Minting NFT...")
    const mintTx = await link3NFT.connect(deployer).airDropNFT(targetAddress, TOKEN_URI)
    const mintTxReceipt = await mintTx.wait(1)
    console.log(
        `Minted tokenId ${mintTxReceipt.events[0].args.tokenId.toString()} from contract: ${
            link3NFT.address
        }`
    )
    if (network.config.chainId == 31337) {
        // Moralis has a hard time if you move more than 1 block!
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

airdropNFT()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
