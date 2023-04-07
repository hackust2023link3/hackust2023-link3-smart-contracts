const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")

let deployerPk = ""
let targetAddress = "0x408dCD023839ffe83AFb304a26463E89fD71361b"

async function grantWelcomeReward() {
    const link3Dollar = await ethers.getContract("Link3Dollar")
    let deployer
    if (!developmentChains.includes(network.name)) {
        const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL)
        deployer = new ethers.Wallet(deployerPk, provider)
    } else {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        targetAddress = accounts[1].address
    }
    console.log("Granting L3D...")
    const mintTx = await link3Dollar.connect(deployer).grantWelcomeRewardTo(targetAddress)
    await mintTx.wait(1)
    console.log(
        `Granted welcome reward to ${targetAddress} from contract: ${
            link3Dollar.address
        }`
    )
    if (network.config.chainId == 31337) {
        // Moralis has a hard time if you move more than 1 block!
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

grantWelcomeReward()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
