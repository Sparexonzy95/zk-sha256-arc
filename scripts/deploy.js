const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to Arc network...\n");

  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("📍 Deploying contracts with account:", deployerAddress);
  
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "\n");

  // Deploy SHA256 contract
  console.log("📝 Deploying SHA256 contract...");
  const SHA256 = await hre.ethers.getContractFactory("SHA256");
  const sha256 = await SHA256.deploy();
  await sha256.waitForDeployment();
  const sha256Address = await sha256.getAddress();
  console.log("✅ SHA256 deployed to:", sha256Address);

  // Deploy Groth16Verifier contract
  console.log("\n📝 Deploying Groth16Verifier contract...");
  const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("✅ Groth16Verifier deployed to:", verifierAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    sha256Address: sha256Address,
    verifierAddress: verifierAddress,
    deployer: deployerAddress,
    timestamp: new Date().toISOString()
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also save as latest
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}-latest.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment info saved to:", filename);
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Summary:");
  console.log("  - SHA256 Contract:", sha256Address);
  console.log("  - Verifier Contract:", verifierAddress);
  console.log("  - Network:", hre.network.name);
  console.log("  - Chain ID:", deploymentInfo.chainId);
  console.log("\n💡 Next steps:");
  console.log("  1. Generate proofs: npm run prove");
  console.log("  2. Verify proofs: npm run verify-proof");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
