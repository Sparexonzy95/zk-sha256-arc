#!/bin/bash

set -e

echo "🔧 Setting up ZK Circuit..."
echo ""

CIRCUIT_NAME="sha256_verifier"
BUILD_DIR="circuits/build"
PTAU_FILE="powersOfTau28_hez_final_17.ptau"  # Changed to 17

# Create build directory
mkdir -p $BUILD_DIR

# Check if circom is installed
if ! command -v circom &> /dev/null; then
    echo "❌ circom not found."
    exit 1
fi

echo "✅ circom found"

# Check Powers of Tau file
if [ ! -f "$BUILD_DIR/$PTAU_FILE" ]; then
    echo "📥 Downloading Powers of Tau file (2^17 - 180MB, may take 5-10 minutes)..."
    cd $BUILD_DIR
    wget https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_17.ptau
    cd ../..
    echo "✅ Powers of Tau downloaded"
else
    echo "✅ Powers of Tau file already exists"
fi

# Compile circuit
echo ""
echo "⚙️  Compiling circuit..."
circom circuits/$CIRCUIT_NAME.circom --r1cs --wasm --sym -o $BUILD_DIR

if [ ! -f "$BUILD_DIR/${CIRCUIT_NAME}.r1cs" ]; then
    echo "❌ Circuit compilation failed"
    exit 1
fi
echo "✅ Circuit compiled"

# Generate witness calculator
echo ""
echo "⚙️  Generating witness calculator..."
cd $BUILD_DIR/${CIRCUIT_NAME}_js
npm install --legacy-peer-deps
cd ../../..
echo "✅ Witness calculator ready"

# Setup Groth16 using node directly
echo ""
echo "⚙️  Setting up Groth16 (this may take 10-15 minutes)..."
node node_modules/snarkjs/build/cli.cjs groth16 setup $BUILD_DIR/${CIRCUIT_NAME}.r1cs $BUILD_DIR/$PTAU_FILE $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey
echo "✅ Initial setup complete"

# Contribute to phase 2 ceremony
echo ""
echo "⚙️  Contributing to ceremony..."
echo "random entropy" | node node_modules/snarkjs/build/cli.cjs zkey contribute $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey $BUILD_DIR/${CIRCUIT_NAME}_final.zkey --name="First contribution"
echo "✅ Contribution complete"

# Export verification key
echo ""
echo "⚙️  Exporting verification key..."
node node_modules/snarkjs/build/cli.cjs zkey export verificationkey $BUILD_DIR/${CIRCUIT_NAME}_final.zkey $BUILD_DIR/verification_key.json
echo "✅ Verification key exported"

# Generate Solidity verifier
echo ""
echo "⚙️  Generating Solidity verifier..."
node node_modules/snarkjs/build/cli.cjs zkey export solidityverifier $BUILD_DIR/${CIRCUIT_NAME}_final.zkey contracts/Groth16Verifier.sol
echo "✅ Solidity verifier generated"

# Info display
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 CIRCUIT SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Generated files:"
echo "  - $BUILD_DIR/${CIRCUIT_NAME}.r1cs"
echo "  - $BUILD_DIR/${CIRCUIT_NAME}_final.zkey"
echo "  - $BUILD_DIR/verification_key.json"
echo "  - contracts/Groth16Verifier.sol (updated)"
echo ""
echo "✨ Next steps:"
echo "  1. Run tests: npm test"
echo "  2. Deploy contracts: npm run deploy"
echo "  3. Generate proofs: npm run prove"
echo ""
