const { frontEndContractsFile, frontEndAbiLocation } = require("../helper-hardhat-config")
require("dotenv").config()
const fs = require("fs")
const { network } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const link3Dollar = await ethers.getContract("Link3Dollar")
    fs.writeFileSync(
        `${frontEndAbiLocation}Link3Dollar.json`,
        link3Dollar.interface.format(ethers.utils.FormatTypes.json)
    )
    const link3NFT = await ethers.getContract("Link3NFT")
    fs.writeFileSync(
        `${frontEndAbiLocation}Link3NFT.json`,
        link3NFT.interface.format(ethers.utils.FormatTypes.json)
    )
    const link3NFTMarketplace = await ethers.getContract("Link3NFTMarketplace")
    fs.writeFileSync(
        `${frontEndAbiLocation}Link3NFTMarketplace.json`,
        link3NFTMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const link3Dollar = await ethers.getContract("Link3Dollar")
    const link3NFT = await ethers.getContract("Link3NFT")
    const link3NFTMarketplace = await ethers.getContract("Link3NFTMarketplace")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    contractAddresses[chainId] = {
        Link3Dollar: link3Dollar.address,
        Link3NFT: link3NFT.address,
        Link3NFTMarketplace: link3NFTMarketplace.address,
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]
