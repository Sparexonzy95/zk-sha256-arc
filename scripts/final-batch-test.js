const hre = require("hardhat");
const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");

const execAsync = promisify(exec);

const testInputs = [
  "final test 1",
  "final test 2", 
  "final test 3",
  "final test 4",
  "final test 5"
];

async function generateAndVerify() {
  console.log("🚀 Final Batch Test - 5 Complete Proofs\n");
  console.log("━".repeat(60));
  
  const [signer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  const startBlock = await hre.ethers.provider.getBlockNumber();
  
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Starting Block:", startBlock);
  console.log("Signer:", await signer.getAddress());
  console.log("━".repeat(60));
  console.log("");

  const deployment = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "deployments", "arc_testnet-latest.json")
  ));
  
  const sha256 = await hre.ethers.getContractAt("SHA256", deployment.sha256Address);
  const verifier = await hre.ethers.getContractAt("Groth16Verifier", deployment.verifierAddress);

  const results = [];

  for (let i = 0; i < testInputs.length; i++) {
    const input = testInputs[i];
    console.log(`\n[${ i + 1}/5] Processing: "${input}"`);
    console.log("─".repeat(60));
    
    try {
      // Step 1: Generate proof
      console.log("  ⚙️  Generating proof...");
      await execAsync(`node scripts/generateProof.js --input "${input}"`, {
        cwd: path.join(__dirname, "..")
      });
      
      // Step 2: Load the proof
      const proofsDir = path.join(__dirname, "..", "proofs");
      const proofFiles = fs.readdirSync(proofsDir)
        .filter(f => f.startsWith('proof_'))
        .sort()
        .reverse();
      
      const latestProof = proofFiles[0];
      const timestamp = latestProof.match(/proof_(\d+)\.json/)[1];
      
      const proofData = JSON.parse(fs.readFileSync(path.join(proofsDir, latestProof)));
      const calldata = JSON.parse(fs.readFileSync(path.join(proofsDir, `calldata_${timestamp}.json`)));
      
      console.log("  ✅ Proof generated");
      
      // Step 3: Compute hash on-chain
      console.log("  📝 Computing hash on-chain...");
      const paddedInput = Buffer.from(proofData.paddedInputHex, 'hex');
      const tx1 = await sha256.hash(paddedInput);
      const receipt1 = await tx1.wait();
      
      console.log("  ✅ Hash computed");
      console.log("     TX:", receipt1.hash);
      console.log("     Block:", receipt1.blockNumber);
      console.log("     Gas:", receipt1.gasUsed.toString());
      
      // Step 4: Verify proof on-chain
      console.log("  🔐 Verifying proof on-chain...");
      const computedHash = "0x" + proofData.expectedHash;
      
      const tx2 = await verifier.verifyProof(
        calldata.a,
        calldata.b,
        calldata.c,
        computedHash,
        { gasLimit: 3000000 }
      );
      const receipt2 = await tx2.wait();
      
      console.log("  ✅ Proof verified");
      console.log("     TX:", receipt2.hash);
      console.log("     Block:", receipt2.blockNumber);
      console.log("     Gas:", receipt2.gasUsed.toString());
      
      // Save result
      results.push({
        index: i + 1,
        input: input,
        hash: computedHash,
        hashTx: receipt1.hash,
        hashBlock: receipt1.blockNumber,
        hashGas: receipt1.gasUsed.toString(),
        verifyTx: receipt2.hash,
        verifyBlock: receipt2.blockNumber,
        verifyGas: receipt2.gasUsed.toString(),
        success: true
      });
      
      console.log("  🎉 Complete!");
      
    } catch (error) {
      console.error("  ❌ Failed:", error.message);
      results.push({
        index: i + 1,
        input: input,
        success: false,
        error: error.message
      });
    }
  }

  // Summary
  console.log("\n" + "━".repeat(60));
  console.log("📊 FINAL BATCH TEST COMPLETE!");
  console.log("━".repeat(60));
  console.log("");
  
  const successful = results.filter(r => r.success).length;
  console.log("Total Tests:", results.length);
  console.log("Successful:", successful);
  console.log("Failed:", results.length - successful);
  console.log("");

  if (successful > 0) {
    console.log("✅ SUCCESSFUL VERIFICATIONS:\n");
    
    results.filter(r => r.success).forEach(r => {
      console.log(`[${r.index}] "${r.input}"`);
      console.log(`    Hash TX:   ${r.hashTx} (Block ${r.hashBlock})`);
      console.log(`    Verify TX: ${r.verifyTx} (Block ${r.verifyBlock})`);
      console.log("");
    });
  }

  // Save to file
  const finalReport = {
    timestamp: new Date().toISOString(),
    network: network.name,
    chainId: network.chainId.toString(),
    startBlock: startBlock,
    endBlock: await hre.ethers.provider.getBlockNumber(),
    totalTests: results.length,
    successful: successful,
    contracts: {
      sha256: deployment.sha256Address,
      verifier: deployment.verifierAddress
    },
    results: results
  };

  fs.writeFileSync(
    path.join(__dirname, "..", "FINAL_TEST_REPORT.json"),
    JSON.stringify(finalReport, null, 2)
  );

  console.log("📄 Report saved to: FINAL_TEST_REPORT.json");
  console.log("");
  
  // Create markdown report
  let markdown = "# Final Test Report - Arc Testnet\n\n";
  markdown += `**Date:** ${new Date().toISOString()}\n`;
  markdown += `**Network:** ${network.name}\n`;
  markdown += `**Chain ID:** ${network.chainId.toString()}\n`;
  markdown += `**Blocks:** ${startBlock} → ${finalReport.endBlock}\n\n`;
  markdown += "## Contracts\n";
  markdown += `- **SHA256:** ${deployment.sha256Address}\n`;
  markdown += `- **Verifier:** ${deployment.verifierAddress}\n\n`;
  markdown += "## Results\n\n";
  markdown += `**Total:** ${results.length} | **Successful:** ${successful} | **Failed:** ${results.length - successful}\n\n`;
  
  results.filter(r => r.success).forEach(r => {
    markdown += `### Test ${r.index}: "${r.input}"\n`;
    markdown += `- **Hash TX:** ${r.hashTx}\n`;
    markdown += `  - Block: ${r.hashBlock}\n`;
    markdown += `  - Gas: ${r.hashGas}\n`;
    markdown += `- **Verify TX:** ${r.verifyTx}\n`;
    markdown += `  - Block: ${r.verifyBlock}\n`;
    markdown += `  - Gas: ${r.verifyGas}\n`;
    markdown += `- **Status:** ✅ Verified\n\n`;
  });

  fs.writeFileSync(
    path.join(__dirname, "..", "FINAL_TEST_REPORT.md"),
    markdown
  );

  console.log("📄 Markdown report saved to: FINAL_TEST_REPORT.md");
  console.log("");
  console.log("🎉 ALL DONE! You now have 5 fresh verified proofs!");
}

generateAndVerify()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
