# ZK-Verified SHA-256 on Arc Testnet

Zero-Knowledge proof system for SHA-256 verification on Arc blockchain using Circom and Groth16.

## 🎯 Project Overview

This project demonstrates privacy-preserving SHA-256 verification using zero-knowledge proofs. Users can prove they know the preimage of a SHA-256 hash without revealing the actual input.

## ✅ Task 2 Requirements - ALL MET

- ✅ Circuit source code (Circom 2.2.3)
- ✅ Prover implementation (CLI with batch support)
- ✅ Verifier contract deployed on Arc Testnet
- ✅ SHA-256 contract deployed on Arc Testnet
- ✅ 5+ proof verifications (completed 5 successful verifications)
- ✅ Test vectors (7 unit tests + 5 integration tests)

## 📋 Deployed Contracts

### Arc Testnet (Chain ID: 5042002)

- **SHA256 Contract:** `0x4023E5FbDCB7912a8840D0EB5a8919991Dd4f98b`
- **Groth16Verifier Contract:** `0xFd75Eefb3f9a4180F9Ea0714302e2e29c29f6e5C`

## 🔗 Verified Transactions

All 5 proof verifications completed successfully on Arc Testnet:

### Test 1
- Hash TX: `0x6dd336429f3edc6d9ef64949c5d4fe7b46d8ece532157e5122e4e4f570cbd3bb` (Block 13,156,761)
- Verify TX: `0xec54dfa56d57e6985dd0c10b11c9370253a019a3b5fe1e589fd19abc3c4cb09d` (Block 13,156,766)

### Test 2
- Hash TX: `0x6166968620cd92c68573f233a7d301f89228b35c96c06e61e8b27251837a8f22` (Block 13,156,773)
- Verify TX: `0x14cd2e5dcd5f662b8d556969f016afa54fc6bbd5a433a66bfb80609f65f5ef89` (Block 13,156,777)

### Test 3
- Hash TX: `0x5e3fc44985743d247cf0820cd8538b619b9cda33abb116515c1a2b6e6eca3001` (Block 13,156,784)
- Verify TX: `0x110a11bc144c761eca93d21be72684c55b8bd3bd43a53b9029a1c460d8edd5b0` (Block 13,156,787)

### Test 4
- Hash TX: `0xbf8c56cca840a96858aca50f0434eb0cdfc4a232567aab7b67fd112dcdf8a669` (Block 13,156,795)
- Verify TX: `0x922c6d5f8a6c5e4d73ef47e0ac7410ca0ef7760a9f6ed14e51680a7e7c6bf143` (Block 13,156,799)

### Test 5
- Hash TX: `0x95950668c4bab00d4aeee35391c74acae16fa40c269735c707c0b099d6ebf366` (Block 13,156,806)
- Verify TX: `0xe79923b910b80de98ea21ff1d1b9cbece3f21f21809d2e8d634cde95ccadcf13` (Block 13,156,810)

**See [FINAL_TEST_REPORT.md](./FINAL_TEST_REPORT.md) for complete details.**

## 🛠️ Technology Stack

- **Smart Contracts:** Solidity 0.8.20
- **ZK Framework:** Circom 2.2.3
- **Proof System:** Groth16 (BN254 curve)
- **Development:** Hardhat, Ethers.js v6
- **Testing:** Chai, Mocha
- **Network:** Arc Testnet

## 📁 Project Structure
```
zk-sha256-arc/
├── circuits/
│   └── sha256_verifier.circom    # ZK circuit (256-bit)
├── contracts/
│   ├── SHA256.sol                 # SHA-256 implementation
│   └── Groth16Verifier.sol        # ZK proof verifier
├── scripts/
│   ├── deploy.js                  # Deployment script
│   ├── generateProof.js           # Proof generator
│   ├── verifyProof.js             # On-chain verifier
│   └── final-batch-test.js        # Batch testing
├── test/
│   └── SHA256.test.js             # Test suite (7/7 passing)
├── hardhat.config.js              # Hardhat configuration
├── package.json                   # Dependencies
├── FINAL_TEST_REPORT.md          # Complete test results
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js v16+
- Circom 2.1.6+
- Arc Testnet funds

### Installation
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/zk-sha256-arc.git
cd zk-sha256-arc

# Install dependencies
npm install --legacy-peer-deps

# Install Circom (Linux/Mac/WSL)
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
source $HOME/.cargo/env
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom
cd ..

# Configure environment
cp .env.example .env
# Edit .env and add your PRIVATE_KEY
```

### Setup Circuit
```bash
# This takes 15-20 minutes
bash scripts/setup-circuit.sh
```

### Run Tests
```bash
npm test
```

### Deploy to Arc Testnet
```bash
npx hardhat run scripts/deploy.js --network arc_testnet
```

### Generate and Verify Proofs
```bash
# Generate 5 proofs and verify on-chain
npx hardhat run scripts/final-batch-test.js --network arc_testnet
```

## 🧪 Testing

Comprehensive test suite with 7 passing tests:
```bash
npm test
```

**Test Coverage:**
- ✅ Empty input hashing
- ✅ String hashing ("hello world", single char, long text)
- ✅ Hash verification (correct/incorrect)
- ✅ Event emission
- ✅ Edge cases (special chars, unicode)
- ✅ Groth16Verifier deployment

## 📊 Gas Costs

| Operation | Gas Used |
|-----------|----------|
| Hash Computation | ~24,643 |
| Proof Verification | ~32,650 |
| **Total per proof** | **~57,293** |

## 🔐 Security Considerations

- Private keys managed via environment variables
- Circuit uses trusted Powers of Tau ceremony
- Groth16 proof system with BN254 curve
- All contracts tested and verified

## 🌐 Network Information

**Arc Testnet:**
- RPC: `https://rpc.blockdaemon.testnet.arc.network`
- Chain ID: `5042002`
- Explorer: https://testnet.arcscan.app
- Faucet: https://faucet.circle.com

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [Quick Reference](./QUICK_REFERENCE.md) - Command cheat sheet
- [Final Test Report](./FINAL_TEST_REPORT.md) - Complete verification results

## 🤝 Contributing

Built for the Arc Creator Role Challenge - Task 2.

## 📝 License

MIT License

## 🙏 Acknowledgments

- [Circom](https://docs.circom.io/) - Zero-knowledge circuit framework
- [SnarkJS](https://github.com/iden3/snarkjs) - ZK proof generation
- [Arc Network](https://arc.network/) - Blockchain platform
- [Circle](https://www.circle.com/) - USDC and blockchain infrastructure

## 📞 Contact

For questions or collaboration opportunities, please open an issue or reach out via Twitter @0xklink.

---

**Built with love for Arc Network
