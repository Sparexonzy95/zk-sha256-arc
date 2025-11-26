const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { program } = require("commander");

program
  .option("-i, --input <string>", "Input string to hash", "hello world")
  .option("-o, --output <path>", "Output directory for proof", "./proofs")
  .parse(process.argv);

const options = program.opts();

async function generateProof() {
  console.log("🔐 Generating ZK Proof for SHA-256 verification\n");

  const input = options.input;
  
  // Check input length (max 32 bytes for 256-bit circuit)
  if (input.length > 32) {
    console.error("❌ Input too long! Max 32 bytes for this circuit.");
    console.error("   Your input:", input.length, "bytes");
    process.exit(1);
  }
  
  console.log("📝 Input:", input);

  // Convert input to bytes and pad to 32 bytes
  const inputBytes = Buffer.from(input, 'utf8');
  const paddedBytes = Buffer.alloc(32); // 32 bytes = 256 bits
  inputBytes.copy(paddedBytes);
  
  // Compute SHA-256 hash of the PADDED input
  const hash = crypto.createHash('sha256').update(paddedBytes).digest();
  const hashHex = hash.toString('hex');
  console.log("🔑 Expected SHA-256:", hashHex);

  // Convert padded bytes to bits
  const inputBits = [];
  for (let i = 0; i < 32; i++) {
    for (let j = 7; j >= 0; j--) {
      inputBits.push((paddedBytes[i] >> j) & 1);
    }
  }

  // Convert hash to bits
  const hashBits = [];
  for (let i = 0; i < hash.length; i++) {
    for (let j = 7; j >= 0; j--) {
      hashBits.push((hash[i] >> j) & 1);
    }
  }

  // Prepare circuit inputs
  const circuitInput = {
    preimage: inputBits,
    claimedHash: hashBits
  };

  console.log("\n⚙️  Computing witness...");
  const wasmPath = path.join(__dirname, "..", "circuits", "build", "sha256_verifier_js", "sha256_verifier.wasm");
  const wtnsPath = path.join(__dirname, "..", "circuits", "build", "witness.wtns");
  
  if (!fs.existsSync(wasmPath)) {
    console.error("❌ WASM file not found:", wasmPath);
    console.error("   Run: bash scripts/setup-circuit.sh");
    process.exit(1);
  }

  try {
    // Calculate witness
    await snarkjs.wtns.calculate(circuitInput, wasmPath, wtnsPath);

    console.log("⚙️  Generating proof (this takes 1-2 minutes)...");
    const zkeyPath = path.join(__dirname, "..", "circuits", "build", "sha256_verifier_final.zkey");
    
    if (!fs.existsSync(zkeyPath)) {
      console.error("❌ zkey file not found:", zkeyPath);
      console.error("   Run: bash scripts/setup-circuit.sh");
      process.exit(1);
    }

    const { proof, publicSignals } = await snarkjs.groth16.prove(zkeyPath, wtnsPath);

    console.log("✅ Proof generated!");

    // Create output directory
    const outputDir = path.resolve(options.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const proofData = {
      input: input,
      inputHex: inputBytes.toString('hex'),
      paddedInputHex: paddedBytes.toString('hex'),
      expectedHash: hashHex,
      proof: proof,
      publicSignals: publicSignals,
      timestamp: new Date().toISOString()
    };

    const filename = `proof_${timestamp}.json`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(proofData, null, 2));

    console.log("\n📄 Proof saved to:", filepath);

    // Save call data
    const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    const calldataFile = path.join(outputDir, `calldata_${timestamp}.json`);
    
    const calldataArray = JSON.parse("[" + calldata + "]");
    const formattedCalldata = {
      a: calldataArray[0],
      b: calldataArray[1],
      c: calldataArray[2],
      input: calldataArray[3]
    };

    fs.writeFileSync(calldataFile, JSON.stringify(formattedCalldata, null, 2));
    console.log("📄 Calldata saved to:", calldataFile);

    // Verify locally
    console.log("\n🔍 Verifying proof locally...");
    const vkeyPath = path.join(__dirname, "..", "circuits", "build", "verification_key.json");
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));
    const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    if (verified) {
      console.log("✅ Proof verified locally!");
    } else {
      console.log("❌ Proof verification failed locally");
      process.exit(1);
    }

    console.log("\n🎉 SUCCESS!\n");

    // Cleanup witness file
    if (fs.existsSync(wtnsPath)) {
      fs.unlinkSync(wtnsPath);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

generateProof()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
