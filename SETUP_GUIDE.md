# 🚀 COMPLETE SETUP GUIDE - zk-SHA256 on Arc

## ⏱️ Estimated Time: 30-45 minutes

This guide will walk you through every step needed to complete Task 2 of the Arc Creator Role challenge.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (optional, for version control)
- [ ] Arc testnet wallet with funds
- [ ] Private key saved securely
- [ ] Text editor (VS Code recommended)
- [ ] Terminal/command line access

---

## 🔧 Part 1: Environment Setup (5 minutes)

### 1.1 Install Circom

**On Linux/Mac:**
```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
source $HOME/.cargo/env

# Install Circom
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom

# Verify installation
circom --version
# Expected: circom compiler 2.1.6
```

**On Windows:**
- Use WSL (Windows Subsystem for Linux) and follow Linux instructions
- Or download pre-built binary from Circom releases

### 1.2 Project Setup

```bash
# Navigate to project directory
cd zk-sha256-arc

# Install Node dependencies
npm install

# This should complete without errors
```

### 1.3 Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor

# Add your private key:
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Save and exit (Ctrl+X, then Y, then Enter in nano)
```

**⚠️ SECURITY WARNING:**
- Never commit `.env` to version control
- Never share your private key
- Use testnet funds only for testing

---

## ⚙️ Part 2: Circuit Setup (10-15 minutes)

This is the most time-consuming step but only needs to be done once.

### 2.1 Run Circuit Setup

```bash
npm run setup-circuit
```

**What happens:**
1. Downloads Powers of Tau file (~60MB) - takes 2-3 minutes
2. Compiles Circom circuit - takes 1-2 minutes
3. Generates proving key - takes 5-10 minutes
4. Generates verification key
5. Updates Solidity verifier contract

**Expected output:**
```
🔧 Setting up ZK Circuit...
✅ circom found
📥 Downloading Powers of Tau file...
✅ Powers of Tau downloaded
⚙️  Compiling circuit...
✅ Circuit compiled
⚙️  Setting up Groth16 (this may take a few minutes)...
✅ Initial setup complete
⚙️  Contributing to ceremony...
✅ Contribution complete
🎉 CIRCUIT SETUP COMPLETE!
```

**Troubleshooting:**
- If download is slow: Consider downloading manually from Hermez S3
- If compilation fails: Check circom is in PATH
- If out of memory: You need at least 4GB RAM

### 2.2 Verify Setup

Check that these files were created:

```bash
ls -la circuits/build/
```

You should see:
- `sha256_verifier.r1cs`
- `sha256_verifier_final.zkey`
- `verification_key.json`
- `sha256_verifier_js/` directory

---

## 🧪 Part 3: Testing (5 minutes)

### 3.1 Run Test Suite

```bash
npm test
```

**Expected output:**
```
  SHA256 Contract Tests
    Basic Hashing
      ✓ Should compute SHA-256 hash correctly for empty input
      ✓ Should compute SHA-256 hash correctly for 'hello world'
      ✓ Should compute SHA-256 hash correctly for single character
      ✓ Should compute SHA-256 hash correctly for longer text
      ✓ Should compute SHA-256 hash correctly for numbers
    Hash Verification
      ✓ Should verify correct hash
      ✓ Should reject incorrect hash
    ...
  
  20 passing (2s)
```

**If tests fail:**
- Check Node.js version is 16+
- Delete `node_modules` and run `npm install` again
- Check no syntax errors in contracts

---

## 🚀 Part 4: Deployment to Arc (5 minutes)

### 4.1 Check Wallet Balance

Make sure you have Arc testnet funds:

```bash
# Your address should be visible during deployment
# If you need funds, visit Arc testnet faucet
```

### 4.2 Deploy Contracts

```bash
npm run deploy -- --network arc_testnet
```

**Expected output:**
```
🚀 Starting deployment to Arc network...
📍 Deploying contracts with account: 0xYourAddress
💰 Account balance: 1000000000000000000

📝 Deploying SHA256 contract...
✅ SHA256 deployed to: 0xSHA256Address

📝 Deploying Groth16Verifier contract...
✅ Groth16Verifier deployed to: 0xVerifierAddress

🎉 DEPLOYMENT COMPLETE!
```

**Save these addresses!** They're also in `deployments/arc_testnet-latest.json`

**Troubleshooting:**
- Insufficient funds: Get more from faucet
- Nonce too high: Wait 1 minute and retry
- RPC error: Check Arc testnet is online

---

## 🔐 Part 5: Generate Proofs (5 minutes)

### 5.1 Single Proof Generation

Test with one proof first:

```bash
npm run prove -- --input "hello world"
```

**Expected output:**
```
🔐 Generating ZK Proof for SHA-256 verification
📝 Input: hello world
🔑 Expected SHA-256: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
⚙️  Computing witness...
⚙️  Generating proof...
✅ Proof generated!
🔍 Verifying proof locally...
✅ Proof verified locally!
🎉 PROOF GENERATION COMPLETE!
```

### 5.2 Batch Generation (Required: 5 proofs)

Use the automated script:

```bash
bash scripts/batch-generate.sh
```

**Or manually generate 5:**
```bash
npm run prove -- --input "test1"
npm run prove -- --input "test2"
npm run prove -- --input "test3"
npm run prove -- --input "test4"
npm run prove -- --input "test5"
```

**Verify proofs were created:**
```bash
ls -la proofs/
```

You should see:
- `proof_*.json` files (5+)
- `calldata_*.json` files (5+)

---

## ✅ Part 6: On-Chain Verification (10 minutes)

This is the final and most important step!

### 6.1 Single Verification Test

Test with one proof first:

```bash
npm run verify-proof
```

**Expected output:**
```
🔗 Verifying proof on Arc blockchain...
⚙️  Step 1: Computing hash on-chain...
✅ Hash computed on-chain
📍 Transaction: 0xHashTxHash
⚙️  Step 2: Verifying ZK proof on-chain...
✅ Proof verification result: true
📍 Transaction: 0xVerifyTxHash
🎉 ON-CHAIN VERIFICATION COMPLETE!
```

**Important:** Copy both transaction hashes!

### 6.2 Batch Verification (Required: 5+ verifications)

Use the automated script:

```bash
bash scripts/batch-verify.sh
```

**What happens:**
1. Finds all proof files
2. Verifies each on Arc blockchain
3. Records transaction hashes
4. Saves results to `VERIFICATION_RESULTS.md`

**Expected output:**
```
📊 Batch Verification Complete!
  Total proofs: 5
  Verified: 5
  Failed: 0

✅ Task requirement met: 5 proofs verified on-chain

📋 Transaction Hashes:
   - 0xhash1...
   - 0xhash2...
   - 0xhash3...
   - 0xhash4...
   - 0xhash5...
   - 0xhash6...
   - 0xhash7...
   - 0xhash8...
   - 0xhash9...
   - 0xhash10...

📄 Results saved to: VERIFICATION_RESULTS.md
```

**Each proof generates 2 transactions:**
- Hash computation transaction
- Proof verification transaction

**So 5 proofs = 10 transactions total**

---

## 📦 Part 7: Package Deliverables (2 minutes)

### 7.1 Verify All Requirements

Check you have:

```bash
# 1. Check contracts deployed
cat deployments/arc_testnet-latest.json

# 2. Check proofs generated
ls proofs/ | wc -l  # Should be 10+ files (5 proofs + 5 calldata)

# 3. Check verifications completed
ls verifications/ | wc -l  # Should be 5+ files

# 4. Check transaction hashes documented
cat VERIFICATION_RESULTS.md
```

### 7.2 Create Submission Package

```bash
# Create submission directory
mkdir submission

# Copy required files
cp deployments/arc_testnet-latest.json submission/deployment.json
cp VERIFICATION_RESULTS.md submission/
cp README.md submission/

# Copy contract source
cp contracts/SHA256.sol submission/
cp contracts/Groth16Verifier.sol submission/

# Copy circuit source
cp circuits/sha256_verifier.circom submission/

# Copy test results
npm test > submission/test-results.txt

echo "📦 Submission package ready in submission/ directory"
```

---

## 📋 Final Checklist

Before submitting, verify:

### Contracts
- [ ] SHA-256 contract deployed on Arc
- [ ] Groth16 verifier deployed on Arc
- [ ] Contract addresses documented
- [ ] ABIs saved

### Proofs
- [ ] 5+ different proof files generated
- [ ] All proofs verified locally
- [ ] Proof generation working correctly

### On-Chain Verification
- [ ] 5+ proofs verified on Arc blockchain
- [ ] 10+ transaction hashes documented (2 per proof)
- [ ] All transactions confirmed on block explorer
- [ ] Verification results saved

### Code Quality
- [ ] All tests passing
- [ ] Code well-commented
- [ ] README up to date
- [ ] No security issues

### Documentation
- [ ] Contract addresses listed
- [ ] Transaction hashes listed
- [ ] Setup guide included
- [ ] Test results included

---

## 🎯 Task 2 Deliverables Summary

You should now have:

1. ✅ **Circuit source code**: `circuits/sha256_verifier.circom`
2. ✅ **Prover implementation**: `scripts/generateProof.js`
3. ✅ **Verifier contract deployed**: Check `deployment.json`
4. ✅ **5+ successful verifications**: Check `VERIFICATION_RESULTS.md`
5. ✅ **Test vectors**: See `test/SHA256.test.js` and `proofs/` directory

---

## 🔗 Verify on Block Explorer

To verify your transactions on Arc block explorer:

1. Go to Arc testnet explorer (check Arc documentation for URL)
2. Search for your contract addresses
3. Search for transaction hashes
4. Verify:
   - Contracts are deployed
   - Transactions succeeded
   - Events were emitted

---

## 🆘 Need Help?

### Common Issues

**"Module not found" errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Insufficient funds" error:**
- Visit Arc testnet faucet
- Wait for funds to arrive
- Retry deployment

**"Proof generation timeout":**
- Use shorter input strings (< 64 bytes)
- Increase system RAM
- Close other applications

**"Circuit not found" error:**
- Run `npm run setup-circuit` again
- Check `circuits/build/` directory exists

### Getting More Help

1. Check the main README.md
2. Review error messages carefully
3. Check Arc network status
4. Verify all dependencies installed

---

## 🎉 Success!

If you've completed all steps, you now have:
- A fully functional zk-SHA256 implementation
- Deployed contracts on Arc
- 5+ verified proofs on-chain
- Complete documentation

**Congratulations on completing Task 2! 🚀**

---

## 📝 Submission Template

When submitting for the creator role, include:

```
Task 2: zk-verified SHA-256 on Arc

Contract Addresses:
- SHA256: 0x...
- Verifier: 0x...

Transaction Hashes (10 total):
1. Hash computation: 0x...
2. Proof verification: 0x...
[... repeat for all 5 proofs ...]

Repository: [Your repo link]
Network: Arc Testnet
Chain ID: 421614

All deliverables completed ✅
```

---

**Built by Kimmy for the Arc Creator Role Challenge**
