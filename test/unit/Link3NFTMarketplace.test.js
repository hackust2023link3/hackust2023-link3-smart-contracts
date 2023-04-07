const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Link3 Marketplace Unit Tests", function () {
          const TOKEN_ID = 1
          const TOKEN_URI = "https://sample.json"
          const PRICE = 250
          let link3DollarContract, link3DollarDeployer, link3DollarUser
          let link3NFTContract, link3NFTDeployer, link3NFTUser
          let link3NFTMarketplaceContract, link3NFTMarketplaceDeployer, link3NFTMarketplaceUser

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              user = accounts[1]

              await deployments.fixture(["all"])

              link3DollarContract = await ethers.getContract("Link3Dollar")
              link3DollarDeployer = link3DollarContract.connect(deployer)
              link3DollarUser = link3DollarContract.connect(user)

              link3NFTContract = await ethers.getContract("Link3NFT")
              link3NFTDeployer = link3NFTContract.connect(deployer)
              link3NFTUser = link3NFTContract.connect(user)

              link3NFTMarketplaceContract = await ethers.getContract("Link3NFTMarketplace")
              link3NFTMarketplaceDeployer = link3NFTMarketplaceContract.connect(deployer)
              link3NFTMarketplaceUser = link3NFTMarketplaceContract.connect(user)

              await link3DollarDeployer.grantWelcomeRewardTo(deployer.address)
              await link3DollarDeployer.approve(link3NFTMarketplaceDeployer.address, 2000)

              await link3NFTDeployer.airDropNFT(user.address, TOKEN_URI)
              await link3NFTUser.approve(link3NFTMarketplaceContract.address, TOKEN_ID)
          })

          describe("listItem", function () {
              it("can only be called by the NFT owner", async function () {
                  await expect(
                      link3NFTMarketplaceDeployer.listItem(
                          link3NFTContract.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.revertedWith(`NotOwner("${deployer.address}")`)
              })
              it("can only be called with non zero price", async function () {
                  await expect(
                      link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, 0)
                  ).to.be.revertedWith(`PriceMustBeLargerThanZero`)
              })
              it("can only be called after the marketplace got the NFT approval from its owner", async function () {
                  await link3NFTUser.approve(ethers.constants.AddressZero, TOKEN_ID)
                  await expect(
                      link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith(`NotApprovedForMarketplace`)
              })
              it("emits an event after listing an item", async function () {
                  expect(
                      await link3NFTMarketplaceUser.listItem(
                          link3NFTContract.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.emit("ItemListed")
              })
              it("can only list an item not yet listed", async function () {
                  await link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, PRICE)
                  await expect(
                      link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("AlreadyListed")
              })
              it("updates listing with seller and price", async function () {
                  await link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, PRICE)
                  const listing = await link3NFTMarketplaceDeployer.getListing(
                      link3NFTContract.address,
                      TOKEN_ID
                  )
                  assert(listing.price.toString() == PRICE.toString())
                  assert(listing.seller.toString() == user.address)
              })
          })

          describe("cancelListing", function () {
              it("requires the item to be already listed", async function () {
                  await expect(
                      link3NFTMarketplaceUser.cancelListing(link3NFTContract.address, TOKEN_ID)
                  ).to.be.revertedWith("NotListed")
              })
              it("can only be called by the NFT owner", async function () {
                  await link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, PRICE)
                  await expect(
                      link3NFTMarketplaceDeployer.cancelListing(link3NFTContract.address, TOKEN_ID)
                  ).to.be.revertedWith(`NotOwner("${deployer.address}")`)
              })
              it("removes listing and emits an ItemCanceled event", async function () {
                  await link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, PRICE)
                  expect(
                      await link3NFTMarketplaceUser.cancelListing(
                          link3NFTContract.address,
                          TOKEN_ID
                      )
                  ).to.emit("ItemCanceled")
                  const listing = await link3NFTMarketplaceDeployer.getListing(
                      link3NFTContract.address,
                      TOKEN_ID
                  )
                  assert(listing.price.toString() == "0")
              })
          })

          describe("buyItem", function () {
              it("requires the item to be already listed", async function () {
                  await expect(
                      link3NFTMarketplaceDeployer.buyItem(
                          link3NFTContract.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.revertedWith("NotListed")
              })
              it("requires the dollar given to be not less than the item price", async function () {
                  await link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, PRICE)
                  await expect(
                      link3NFTMarketplaceDeployer.buyItem(
                          link3NFTContract.address,
                          TOKEN_ID,
                          PRICE - 10
                      )
                  ).to.be.revertedWith("PriceNotMet")
              })
              it("transfers the nft from the seller to the buyer and transfer dollars from the buyer to the seller", async function () {
                  await link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, PRICE)
                  expect(
                      await link3NFTMarketplaceDeployer.buyItem(
                          link3NFTContract.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.emit("ItemBought")
                  const newOwner = await link3NFTDeployer.ownerOf(TOKEN_ID)
                  const sellerBalance = await link3DollarUser.balanceOf(user.address)
                  assert(newOwner.toString() == deployer.address)
                  assert(sellerBalance.toString() == PRICE.toString())
              })
              it("requires enough dollar allowance of the buyer", async function () {
                  await link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, PRICE)
                  await link3DollarDeployer.approve(link3NFTMarketplaceContract.address, 0)
                  await expect(
                      link3NFTMarketplaceDeployer.buyItem(
                          link3NFTContract.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.revertedWith("ERC20: insufficient allowance")
              })
          })
          describe("updateListing", function () {
              it("requires the item to be already listed", async function () {
                  await expect(
                      link3NFTMarketplaceDeployer.updateListing(
                          link3NFTContract.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.revertedWith("NotListed")
              })
              it("can only be called by the NFT owner", async function () {
                  await link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, PRICE)
                  await expect(
                      link3NFTMarketplaceDeployer.cancelListing(link3NFTContract.address, TOKEN_ID)
                  ).to.be.revertedWith(`NotOwner("${deployer.address}")`)
              })
              it("can only be called with non zero price", async function () {
                  await link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, PRICE)
                  await expect(
                      link3NFTMarketplaceUser.updateListing(link3NFTContract.address, TOKEN_ID, 0)
                  ).to.be.revertedWith(`PriceMustBeLargerThanZero`)
              })
              it("updates the price of the item", async function () {
                  await link3NFTMarketplaceUser.listItem(link3NFTContract.address, TOKEN_ID, PRICE)
                  expect(
                      await link3NFTMarketplaceUser.updateListing(
                          link3NFTContract.address,
                          TOKEN_ID,
                          PRICE + 100
                      )
                  ).to.emit("ItemListed")
                  const listing = await link3NFTMarketplaceDeployer.getListing(
                      link3NFTContract.address,
                      TOKEN_ID
                  )
                  assert(listing.price.toString() == (PRICE + 100).toString())
              })
          })
      })
