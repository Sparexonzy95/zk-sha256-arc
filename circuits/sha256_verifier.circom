pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/sha256/sha256.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/**
 * @title SHA256Verifier
 * @dev Verifies SHA-256 hash matches claimed hash
 * Optimized for smaller verifier contract (256 bits = 32 bytes max)
 */
template SHA256Verifier(maxBits) {
    signal input claimedHash[256];
    signal input preimage[maxBits];
    
    // Compute SHA-256
    component sha = Sha256(maxBits);
    for (var i = 0; i < maxBits; i++) {
        sha.in[i] <== preimage[i];
    }
    
    // Compare all bits
    signal output isValid;
    component equals[256];
    var sum = 0;
    
    for (var i = 0; i < 256; i++) {
        equals[i] = IsEqual();
        equals[i].in[0] <== sha.out[i];
        equals[i].in[1] <== claimedHash[i];
        sum += equals[i].out;
    }
    
    component allEqual = IsEqual();
    allEqual.in[0] <== sum;
    allEqual.in[1] <== 256;
    
    isValid <== allEqual.out;
    isValid === 1;
}

// Reduced to 256 bits (32 bytes) for smaller verifier
component main {public [claimedHash]} = SHA256Verifier(256);
