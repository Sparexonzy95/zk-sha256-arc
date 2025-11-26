const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

describe("SHA256 Contract Tests", function () {
  let sha256Contract;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const SHA256 = await ethers.getContractFactory("SHA256");
    sha256Contract = await SHA256.deploy();
    await sha256Contract.waitForDeployment();
  });

  describe("Basic Hashing", function () {
    it("Should compute SHA-256 hash correctly for empty input", async function () {
      const input = "";
      const expectedHash = "0x" + crypto.createHash('sha256').update(input).digest('hex');
      
      const tx = await sha256Contract.hash(ethers.toUtf8Bytes(input));
      const receipt = await tx.wait();
      const event = receipt.logs[0];
      const result = event.args[1]; // hash is second argument in HashComputed event
      expect(result).to.equal(expectedHash);
    });

    it("Should compute SHA-256 hash correctly for 'hello world'", async function () {
      const input = "hello world";
      const expectedHash = "0x" + crypto.createHash('sha256').update(input).digest('hex');
      
      const tx = await sha256Contract.hash(ethers.toUtf8Bytes(input));
      const receipt = await tx.wait();
      const event = receipt.logs[0];
      const result = event.args[1];
      expect(result).to.equal(expectedHash);
    });

    it("Should compute SHA-256 hash correctly for single character", async function () {
      const input = "a";
      const expectedHash = "0x" + crypto.createHash('sha256').update(input).digest('hex');
      
      const tx = await sha256Contract.hash(ethers.toUtf8Bytes(input));
      const receipt = await tx.wait();
      const event = receipt.logs[0];
      const result = event.args[1];
      expect(result).to.equal(expectedHash);
    });

    it("Should compute SHA-256 hash correctly for longer text", async function () {
      const input = "The quick brown fox jumps over the lazy dog";
      const expectedHash = "0x" + crypto.createHash('sha256').update(input).digest('hex');
      
      const tx = await sha256Contract.hash(ethers.toUtf8Bytes(input));
      const receipt = await tx.wait();
      const event = receipt.logs[0];
      const result = event.args[1];
      expect(result).to.equal(expectedHash);
    });
  });

  describe("Hash Verification", function () {
    it("Should verify correct hash", async function () {
      const input = "test input";
      const expectedHash = "0x" + crypto.createHash('sha256').update(input).digest('hex');
      
      const isValid = await sha256Contract.verifyHash(
        ethers.toUtf8Bytes(input),
        expectedHash
      );
      expect(isValid).to.be.true;
    });

    it("Should reject incorrect hash", async function () {
      const input = "test input";
      const wrongHash = "0x" + "0".repeat(64);
      
      const isValid = await sha256Contract.verifyHash(
        ethers.toUtf8Bytes(input),
        wrongHash
      );
      expect(isValid).to.be.false;
    });
  });
});

describe("Groth16Verifier Contract Tests", function () {
  it("Should have correct contract code", async function () {
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    expect(Verifier).to.not.be.undefined;
  });
});
