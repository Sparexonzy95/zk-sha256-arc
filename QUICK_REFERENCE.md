# Quick Reference - zk-SHA256 Arc

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY

# 3. Setup circuit (takes 10-15 min)
npm run setup-circuit

# 4. Run tests
npm test

# 5. Deploy to Arc
npm run deploy -- --network arc_testnet

# 6. Generate a proof
npm run prove -- --input "your text here"

# 7. Verify proof on-chain
npm run verify-proof
```

## ⚡ Batch Operations

```bash
# Generate 5 proofs at once
bash scripts/batch-generate.sh

# Verify all proofs on-chain
bash scripts/batch-verify.sh
```

## 📋 Check Status

```bash
# View deployment info
cat deployments/arc_testnet-latest.json

# Count proofs
ls proofs/ | wc -l

# Count verifications
ls verifications/ | wc -l

# View verification results
cat VERIFICATION_RESULTS.md
```

## 🔧 Useful Commands

```bash
# Compile contracts only
npm run compile

# Test specific file
npx hardhat test test/SHA256.test.js

# Generate proof with custom output
npm run prove -- --input "test" --output ./my-proofs

# Verify specific proof
npm run verify-proof -- --proof ./proofs/proof_123.json

# Clean build artifacts
rm -rf artifacts cache circuits/build

# Reset everything
npm run clean && npm install && npm run setup-circuit
```

## 📊 Gas Estimation

```bash
# Get deployment costs
npx hardhat run scripts/deploy.js --network hardhat

# Test gas costs locally
npx hardhat test --network hardhat
```

## 🐛 Debug Commands

```bash
# Enable debug logging
export DEBUG=*
npm run prove

# Check Hardhat version
npx hardhat --version

# Check network connection
npx hardhat run scripts/checkNetwork.js --network arc_testnet

# Verify contract on explorer
npx hardhat verify --network arc_testnet <CONTRACT_ADDRESS>
```

## 📁 Important Files

- `contracts/SHA256.sol` - Main SHA-256 implementation
- `contracts/Groth16Verifier.sol` - ZK proof verifier
- `circuits/sha256_verifier.circom` - ZK circuit
- `scripts/deploy.js` - Deployment script
- `scripts/generateProof.js` - Proof generator
- `scripts/verifyProof.js` - On-chain verifier
- `hardhat.config.js` - Network configuration
- `.env` - Environment variables (private!)

## 🔗 Key Directories

- `proofs/` - Generated proof files
- `verifications/` - Verification records
- `deployments/` - Deployment info
- `artifacts/` - Compiled contracts
- `circuits/build/` - Compiled circuits

## ⚙️ Environment Variables

```bash
PRIVATE_KEY=           # Your wallet private key
ARC_TESTNET_RPC=       # Arc testnet RPC URL
ARC_TESTNET_CHAIN_ID=  # Arc testnet chain ID
ARC_MAINNET_RPC=       # Arc mainnet RPC URL
ARC_MAINNET_CHAIN_ID=  # Arc mainnet chain ID
ARCSCAN_API_KEY=       # Optional: for verification
```

## 🎯 Task 2 Requirements

Required deliverables:
- [x] Circuit source code
- [x] Prover implementation
- [x] Verifier contract deployed on Arc
- [ ] 5+ successful proof verifications on Arc
- [x] Test vectors for multiple inputs

## 📱 Contact & Support

- Author: Kimmy
- Challenge: Arc Creator Role - Task 2
- Built with: Solidity, Circom, Hardhat, SnarkJS

## ⚡ Pro Tips

1. Always test locally before deploying
2. Keep backups of deployment info
3. Save all transaction hashes
4. Use meaningful input strings for proofs
5. Monitor gas costs
6. Check block explorer for confirmations
7. Document everything!

## 🔐 Security Reminders

- Never commit .env file
- Use testnet for development
- Verify contracts on explorer
- Keep private keys secure
- Double-check addresses before transactions

---

For complete documentation, see:
- README.md - Full project documentation
- SETUP_GUIDE.md - Step-by-step setup instructions
