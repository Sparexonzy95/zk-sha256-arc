// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SHA256
 * @dev Simple wrapper around Solidity's built-in sha256 precompile
 * @author Kimmy
 */
contract SHA256 {
    event HashComputed(bytes input, bytes32 hash);

    /**
     * @dev Compute SHA-256 hash using built-in precompile
     * @param input The input bytes to hash
     * @return The SHA-256 hash as bytes32
     */
    function hash(bytes memory input) public returns (bytes32) {
        bytes32 result = sha256(input);
        emit HashComputed(input, result);
        return result;
    }

    /**
     * @dev Verify that computed hash matches expected hash
     */
    function verifyHash(bytes memory input, bytes32 expectedHash) public pure returns (bool) {
        return sha256(input) == expectedHash;
    }

    /**
     * @dev Get hash for a string input (convenience function)
     */
    function hashString(string memory input) public returns (bytes32) {
        return hash(bytes(input));
    }
}
