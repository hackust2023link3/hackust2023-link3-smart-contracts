const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Link3 Dollar Unit Tests", function () {
          let link3DollarContract, link3DollarDeployer, link3DollarUser
          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              user = accounts[1]

              await deployments.fixture(["all"])

              link3DollarContract = await ethers.getContract("Link3Dollar")
              link3DollarDeployer = link3DollarContract.connect(deployer)
              link3DollarUser = link3DollarContract.connect(user)
          })

          describe("setWelcomeRewardAmount", function () {
              it("can only be called by the contract creator", async function () {
                  await expect(link3DollarUser.setWelcomeRewardAmount(3000)).to.be.revertedWith(
                      `NotOwner("${user.address}")`
                  )
              })
              it("updates welcome reward amount", async function () {
                  await link3DollarDeployer.setWelcomeRewardAmount(3000)
                  const welcomeRewardAmount = await link3DollarDeployer.getWelcomeRewardAmount()
                  assert(welcomeRewardAmount.toString() == "3000")
              })
          })

          describe("grantWelcomeRewardTo", function () {
              it("can only be called by the contract creator", async function () {
                  await expect(
                      link3DollarUser.grantWelcomeRewardTo(user.address)
                  ).to.be.revertedWith(`NotOwner("${user.address}")`)
              })
              it("grants welcome reward to user not joined", async function () {
                  await link3DollarDeployer.grantWelcomeRewardTo(user.address)
                  const balance = await link3DollarDeployer.balanceOf(user.address)
                  assert(balance.toString() === "2000")
              })
              it("cannot grant welcome reward to user already joined", async function () {
                  await link3DollarDeployer.grantWelcomeRewardTo(user.address)
                  await expect(
                      link3DollarDeployer.grantWelcomeRewardTo(user.address)
                  ).to.be.revertedWith(`UserAlreadyJoined("${user.address}")`)
              })
          })

          describe("isUserGrantedWelcomeReward", function () {
              it("returns false for users not yet welcome", async function () {
                  const isUserGrantedWelcomeReward =
                      await link3DollarDeployer.isUserGrantedWelcomeReward(user.address)
                  assert(isUserGrantedWelcomeReward === false)
              })
              it("returns true for users already welcome", async function () {
                  await link3DollarDeployer.grantWelcomeRewardTo(user.address)
                  const isUserGrantedWelcomeReward =
                      await link3DollarDeployer.isUserGrantedWelcomeReward(user.address)
                  assert(isUserGrantedWelcomeReward === true)
              })
          })

          describe("grantDollarsTo", function () {
              it("can only be called by the contract creator", async function () {
                  await expect(
                      link3DollarUser.grantDollarsTo(user.address, 1000)
                  ).to.be.revertedWith(`NotOwner("${user.address}")`)
              })
              it("adds dollars to user wallet", async function () {
                  await link3DollarDeployer.grantDollarsTo(user.address, 1000)
                  const balance = await link3DollarDeployer.balanceOf(user.address)
                  assert(balance.toString() === "1000")
              })
          })

          describe("removeDollarsFrom", function () {
              it("can only be called by the contract creator", async function () {
                  await expect(
                      link3DollarUser.removeDollarsFrom(user.address, 1000)
                  ).to.be.revertedWith(`NotOwner("${user.address}")`)
              })
              it("removes dollars from user wallet", async function () {
                  await link3DollarDeployer.grantDollarsTo(user.address, 2000)
                  await link3DollarDeployer.removeDollarsFrom(user.address, 1000)
                  const balance = await link3DollarDeployer.balanceOf(user.address)
                  assert(balance.toString() === "1000")
              })
          })

          describe("decimals", function () {
              it("returns number of decimals", async function () {
                  const decimals = await link3DollarUser.decimals()
                  assert(decimals === 2)
              })
          })
      })
