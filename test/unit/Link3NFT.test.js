const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Link3 NFT Unit Tests", function () {
          const TOKEN_URI = "https://sample.json"
          let link3NFTContract, link3NFTDeployer, link3NFTUser
          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              user = accounts[1]

              await deployments.fixture(["all"])

              link3NFTContract = await ethers.getContract("Link3NFT")
              link3NFTDeployer = link3NFTContract.connect(deployer)
              link3NFTUser = link3NFTContract.connect(user)
          })

          describe("airDropNFT", function () {
              it("can only be called by the contract creator", async function () {
                  await expect(
                      link3NFTUser.airDropNFT(user.address, TOKEN_URI)
                  ).to.be.revertedWith(`NotOwner("${user.address}")`)
              })
              it("adds NFT to user wallet and emits a CreatedNFT event", async function () {
                  expect(await link3NFTDeployer.airDropNFT(user.address, TOKEN_URI)).to.emit(
                      "CreatedNFT"
                  )
                  const balance = await link3NFTDeployer.balanceOf(user.address)
                  assert(balance.toString() === "1")
                  const owner = await link3NFTDeployer.ownerOf(1)
                  assert(owner === user.address)
              })
          })
      })
