#!/bin/bash

echo "🔗 Batch On-Chain Verification Script"
echo "======================================"
echo ""
echo "This script will verify all generated proofs on Arc blockchain"
echo ""

# Check if proofs directory exists
if [ ! -d "proofs" ]; then
  echo "❌ No proofs directory found"
  echo "   Generate proofs first: npm run prove"
  exit 1
fi

# Count proof files
PROOF_FILES=(proofs/proof_*.json)
PROOF_COUNT=${#PROOF_FILES[@]}

if [ $PROOF_COUNT -eq 0 ]; then
  echo "❌ No proof files found in proofs/ directory"
  echo "   Generate proofs first: npm run prove"
  exit 1
fi

echo "📝 Found $PROOF_COUNT proof file(s)"
echo ""

VERIFIED_COUNT=0
FAILED_COUNT=0
TX_HASHES=()

# Verify each proof
for proof_file in "${PROOF_FILES[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 Verifying: $proof_file"
  
  # Extract timestamp from filename
  TIMESTAMP=$(echo $proof_file | grep -oP 'proof_\K\d+')
  CALLDATA_FILE="proofs/calldata_${TIMESTAMP}.json"
  
  if [ ! -f "$CALLDATA_FILE" ]; then
    echo "   ❌ Calldata file not found: $CALLDATA_FILE"
    FAILED_COUNT=$((FAILED_COUNT + 1))
    continue
  fi
  
  # Run verification
  if OUTPUT=$(node scripts/verifyProof.js --proof "$proof_file" --calldata "$CALLDATA_FILE" 2>&1); then
    VERIFIED_COUNT=$((VERIFIED_COUNT + 1))
    
    # Extract transaction hashes
    HASH_TX=$(echo "$OUTPUT" | grep -oP 'Hash TX: \K0x[a-fA-F0-9]+')
    VERIFY_TX=$(echo "$OUTPUT" | grep -oP 'Verify TX: \K0x[a-fA-F0-9]+')
    
    if [ ! -z "$HASH_TX" ] && [ ! -z "$VERIFY_TX" ]; then
      TX_HASHES+=("$HASH_TX")
      TX_HASHES+=("$VERIFY_TX")
      echo "   ✅ Verified successfully"
      echo "   📍 Hash TX: $HASH_TX"
      echo "   📍 Verify TX: $VERIFY_TX"
    fi
  else
    FAILED_COUNT=$((FAILED_COUNT + 1))
    echo "   ❌ Verification failed"
    echo "$OUTPUT" | tail -5
  fi
  
  echo ""
  
  # Small delay between transactions
  sleep 2
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Batch Verification Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Total proofs: $PROOF_COUNT"
echo "  Verified: $VERIFIED_COUNT"
echo "  Failed: $FAILED_COUNT"
echo ""

if [ $VERIFIED_COUNT -ge 5 ]; then
  echo "✅ Task requirement met: $VERIFIED_COUNT proofs verified on-chain"
  echo ""
  echo "📋 Transaction Hashes:"
  for tx in "${TX_HASHES[@]}"; do
    echo "   - $tx"
  done
  echo ""
  echo "💡 Save these transaction hashes for your submission!"
  
  # Save to file
  {
    echo "# zk-SHA256 Arc Verification Results"
    echo ""
    echo "Date: $(date)"
    echo "Network: arc_testnet"
    echo ""
    echo "## Statistics"
    echo "- Total Proofs: $PROOF_COUNT"
    echo "- Verified: $VERIFIED_COUNT"
    echo "- Failed: $FAILED_COUNT"
    echo ""
    echo "## Transaction Hashes"
    for tx in "${TX_HASHES[@]}"; do
      echo "- $tx"
    done
  } > VERIFICATION_RESULTS.md
  
  echo "📄 Results saved to: VERIFICATION_RESULTS.md"
else
  echo "⚠️  Only $VERIFIED_COUNT proofs verified (need 5)"
  echo "   Generate more proofs: npm run prove"
fi
echo ""
