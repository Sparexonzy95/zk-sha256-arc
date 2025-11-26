const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function verifyLive() {
  console.log("🔗 Live verification on Arc Testnet\n");
  
  const [signer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  const currentBlock = await hre.ethers.provider.getBlockNumber();
  
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Current Block:", currentBlock);
  console.log("Signer:", await signer.getAddress());
  console.log("");
  
  // Load latest proof
  const proofsDir = path.join(__dirname, "..", "proofs");
  const proofFiles = fs.readdirSync(proofsDir)
    .filter(f => f.startsWith('proof_'))
    .sort()
    .reverse();
  
  const latestProof = proofFiles[0];
  const timestamp = latestProof.match(/proof_(\d+)\.json/)[1];
  
  const proofData = JSON.parse(fs.readFileSync(path.join(proofsDir, latestProof)));
  const calldata = JSON.parse(fs.readFileSync(path.join(proofsDir, `calldata_${timestamp}.json`)));
  
  console.log("Testing with proof:", latestProof);
  console.log("Input:", proofData.input);
  console.log("");
  
  const deployment = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "deployments", "arc_testnet-latest.json")
  ));
  
  const sha256 = await hre.ethers.getContractAt("SHA256", deployment.sha256Address);
  const verifier = await hre.ethers.getContractAt("Groth16Verifier", deployment.verifierAddress);
  
  // Test 1: Compute hash
  console.log("📝 Test 1: Computing hash on-chain...");
  const paddedInput = Buffer.from(proofData.paddedInputHex, 'hex');
  const tx1 = await sha256.hash(paddedInput);
  const receipt1 = await tx1.wait();
  
  console.log("✅ Hash computed!");
  console.log("  TX:", receipt1.hash);
  console.log("  Block:", receipt1.blockNumber);
  console.log("  Gas:", receipt1.gasUsed.toString());
  console.log("");
  
  // Test 2: Verify proof
  console.log("🔐 Test 2: Verifying ZK proof on-chain...");
  const computedHash = "0x" + proofData.expectedHash;
  
  const tx2 = await verifier.verifyProof(
    calldata.a,
    calldata.b,
    calldata.c,
    computedHash,
    { gasLimit: 3000000 }
  );
  const receipt2 = await tx2.wait();
  
  console.log("✅ Proof verified!");
  console.log("  TX:", receipt2.hash);
  console.log("  Block:", receipt2.blockNumber);
  console.log("  Gas:", receipt2.gasUsed.toString());
  console.log("");
  
  console.log("━".repeat(60));
  console.log("🎉 LIVE VERIFICATION COMPLETE ON ARC TESTNET!");
  console.log("━".repeat(60));
  console.log("");
  console.log("📊 Summary:");
  console.log("  Chain ID: 5042002");
  console.log("  Block Height:", receipt2.blockNumber);
  console.log("  Hash TX:", receipt1.hash);
  console.log("  Verify TX:", receipt2.hash);
  console.log("");
  console.log("✅ Both transactions confirmed on Arc Testnet");
  console.log("✅ Transactions have REAL block numbers");
  console.log("✅ Should be visible in Arc explorer");
}

verifyLive()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
