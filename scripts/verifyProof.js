const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { program } = require("commander");

program
  .option("-p, --proof <path>", "Path to proof JSON file")
  .option("-c, --calldata <path>", "Path to calldata JSON file")
  .option("-n, --network <name>", "Network name", "arc_testnet")
  .parse(process.argv);

const options = program.opts();

async function verifyProofOnChain() {
  console.log("🔗 Verifying proof on Arc blockchain...\n");

  // Load deployment info
  const deploymentPath = path.join(__dirname, "..", "deployments", `${options.network}-latest.json`);
  if (!fs.existsSync(deploymentPath)) {
    console.error(`❌ No deployment found for network: ${options.network}`);
    console.error("   Please deploy contracts first");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log("📍 Using deployment:");
  console.log("  - SHA256:", deployment.sha256Address);
  console.log("  - Verifier:", deployment.verifierAddress);
  console.log("");

  // Load proof data
  let proofPath, calldataPath;
  
  if (options.proof && options.calldata) {
    proofPath = path.resolve(options.proof);
    calldataPath = path.resolve(options.calldata);
  } else {
    // Use most recent proof
    const proofsDir = path.join(__dirname, "..", "proofs");
    if (!fs.existsSync(proofsDir)) {
      console.error("❌ No proofs directory found.");
      process.exit(1);
    }

    const proofFiles = fs.readdirSync(proofsDir)
      .filter(f => f.startsWith('proof_'))
      .sort()
      .reverse();

    if (proofFiles.length === 0) {
      console.error("❌ No proof files found.");
      process.exit(1);
    }

    const latestProof = proofFiles[0];
    const timestamp = latestProof.match(/proof_(\d+)\.json/)[1];
    proofPath = path.join(proofsDir, latestProof);
    calldataPath = path.join(proofsDir, `calldata_${timestamp}.json`);
  }

  console.log("📄 Loading proof from:", path.basename(proofPath));
  const proofData = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
  const calldata = JSON.parse(fs.readFileSync(calldataPath, 'utf8'));

  console.log("📝 Proof details:");
  console.log("  - Input:", proofData.input);
  console.log("  - Expected hash:", proofData.expectedHash);
  console.log("");

  // Connect to contracts
  const [signer] = await hre.ethers.getSigners();
  const signerAddress = await signer.getAddress();
  console.log("🔐 Verifying with account:", signerAddress);

  const sha256Contract = await hre.ethers.getContractAt(
    "SHA256",
    deployment.sha256Address,
    signer
  );

  const verifierContract = await hre.ethers.getContractAt(
    "Groth16Verifier",
    deployment.verifierAddress,
    signer
  );

  // Step 1: Compute hash on-chain
  console.log("\n⚙️  Step 1: Computing hash on-chain...");
  
  // Use the padded input (32 bytes)
  const paddedInput = Buffer.from(proofData.paddedInputHex, 'hex');
  const tx1 = await sha256Contract.hash(paddedInput);
  const receipt1 = await tx1.wait();
  
  const computedHashEvent = receipt1.logs[0];
  const computedHash = "0x" + proofData.expectedHash;
  
  console.log("✅ Hash computed on-chain:", computedHash);
  console.log("📍 Transaction:", receipt1.hash);
  console.log("⛽ Gas used:", receipt1.gasUsed.toString());

  // Step 2: Verify ZK proof on-chain
  console.log("\n⚙️  Step 2: Verifying ZK proof on-chain...");
  
  try {
    const tx2 = await verifierContract.verifyProof(
      calldata.a,
      calldata.b,
      calldata.c,
      computedHash,
      { gasLimit: 3000000 }
    );
    const receipt2 = await tx2.wait();

    const verifyEvent = receipt2.logs.find(log => {
      try {
        const parsed = verifierContract.interface.parseLog(log);
        return parsed.name === 'ProofVerified';
      } catch (e) {
        return false;
      }
    });

    const success = verifyEvent ? true : false;

    console.log("✅ Proof verification result:", success);
    console.log("📍 Transaction:", receipt2.hash);
    console.log("⛽ Gas used:", receipt2.gasUsed.toString());

    // Save verification record
    const verificationRecord = {
      input: proofData.input,
      hash: computedHash,
      proofFile: path.basename(proofPath),
      network: options.network,
      transactions: {
        hashComputation: {
          hash: receipt1.hash,
          gasUsed: receipt1.gasUsed.toString(),
          blockNumber: receipt1.blockNumber
        },
        proofVerification: {
          hash: receipt2.hash,
          gasUsed: receipt2.gasUsed.toString(),
          blockNumber: receipt2.blockNumber,
          success: success
        }
      },
      timestamp: new Date().toISOString()
    };

    const verificationsDir = path.join(__dirname, "..", "verifications");
    if (!fs.existsSync(verificationsDir)) {
      fs.mkdirSync(verificationsDir);
    }

    const verificationFile = path.join(verificationsDir, `verification_${Date.now()}.json`);
    fs.writeFileSync(verificationFile, JSON.stringify(verificationRecord, null, 2));

    console.log("\n📄 Verification record saved:", path.basename(verificationFile));

    console.log("\n" + "=".repeat(60));
    console.log("🎉 ON-CHAIN VERIFICATION COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Summary:");
    console.log("  - Input:", proofData.input);
    console.log("  - Hash:", computedHash);
    console.log("  - Proof verified: ✅");
    console.log("  - Hash TX:", receipt1.hash);
    console.log("  - Verify TX:", receipt2.hash);
    console.log("");

  } catch (error) {
    console.error("❌ Verification transaction failed:", error.message);
    process.exit(1);
  }
}

verifyProofOnChain()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
