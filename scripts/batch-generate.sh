#!/bin/bash

echo "🚀 Batch Proof Generation Script"
echo "================================="
echo ""
echo "This script will generate 5 different proofs with various inputs"
echo ""

# Array of test inputs
INPUTS=(
  "hello world"
  "zero knowledge proof"
  "blockchain technology"
  "SHA-256 verification"
  "Arc Network deployment"
)

PROOF_COUNT=0
SUCCESS_COUNT=0
FAILED_COUNT=0

echo "📝 Generating ${#INPUTS[@]} proofs..."
echo ""

for input in "${INPUTS[@]}"; do
  PROOF_COUNT=$((PROOF_COUNT + 1))
  echo "[$PROOF_COUNT/${#INPUTS[@]}] Generating proof for: \"$input\""
  
  if node scripts/generateProof.js --input "$input" > /dev/null 2>&1; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo "    ✅ Success"
  else
    FAILED_COUNT=$((FAILED_COUNT + 1))
    echo "    ❌ Failed"
  fi
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Batch Generation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Total proofs: $PROOF_COUNT"
echo "  Successful: $SUCCESS_COUNT"
echo "  Failed: $FAILED_COUNT"
echo ""

if [ $SUCCESS_COUNT -ge 5 ]; then
  echo "✅ Task requirement met: $SUCCESS_COUNT proofs generated"
  echo ""
  echo "💡 Next step: Verify all proofs on-chain"
  echo "   Run: bash scripts/batch-verify.sh"
else
  echo "⚠️  Only $SUCCESS_COUNT proofs generated (need 5)"
  echo "   Please check errors and try again"
fi
echo ""
