const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { moveBlocks } = require("../utils/move-blocks")

let deployerPk = ""
let targetAddress = "0x0363b7d9574201FE3E51da85F151E3BF2e5b0f63"
let amount = 2390

async function grantDollars() {
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
    const mintTx = await link3Dollar.connect(deployer).grantDollarsTo(targetAddress, amount)
    const mintTxReceipt = await mintTx.wait(1)
    console.log(
        `Granted ${(amount / 100).toFixed(2)} L3D to ${targetAddress} from contract: ${
            link3Dollar.address
        }`
    )
    const balance = await link3Dollar.balanceOf(targetAddress)
    console.log(
        `Now he has ${(balance / 100).toFixed(2)} L3D in total`
    )
    if (network.config.chainId == 31337) {
        // Moralis has a hard time if you move more than 1 block!
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

grantDollars()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
