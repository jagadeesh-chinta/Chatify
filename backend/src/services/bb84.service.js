import crypto from 'crypto';

/**
 * BB84 Quantum Key Distribution Simulation (ACADEMIC PURPOSE ONLY)
 * This is a software simulation of the BB84 protocol for educational purposes.
 * It does NOT implement real quantum cryptography.
 * 
 * Algorithm Flow:
 * 1. Alice generates random bit sequence
 * 2. Alice generates random basis sequence (+ or x)
 * 3. Bob generates random basis sequence (independent)
 * 4. Both parties publicly share their basis sequences (not bits)
 * 5. Bits where bases match are kept for the shared key
 * 6. Final key is hashed using SHA-256
 */

/**
 * Generate a random bit (0 or 1)
 */
const generateRandomBit = () => Math.floor(Math.random() * 2);

/**
 * Generate a random basis (0 = rectilinear '+', 1 = diagonal 'x')
 */
const generateRandomBasis = () => Math.floor(Math.random() * 2);

/**
 * Encode a bit in a basis (simulation of quantum state)
 * In real BB84, this would be quantum state. Here it's just a representation.
 */
const encodeQubit = (bit, basis) => {
  // basis: 0 = rectilinear (+), 1 = diagonal (x)
  // For simulation, we just tag the bit with its basis
  return { bit, basis };
};

/**
 * Main BB84 Key Generation Function
 * 
 * @param {number} keyLength - Desired bit length for the final shared key (default: 32)
 * @returns {Promise<string>} - SHA-256 hashed shared key in hexadecimal format
 */
export const generateSharedKey = async (keyLength = 32) => {
  try {
    // Length must be sufficient for sifting (approximately 4x the desired key length)
    // On average, only 50% of bits survive sifting (when bases match)
    const sequenceLength = Math.max(keyLength * 4, 128);

    /**
     * ALICE'S PHASE: Generate and encode qubits
     */
    const aliceBits = Array.from({ length: sequenceLength }, () => generateRandomBit());
    const aliceBases = Array.from({ length: sequenceLength }, () => generateRandomBasis());
    
    // Alice "sends" encoded qubits (simulation - in real BB84 this would be quantum transmission)
    const qubits = aliceBits.map((bit, idx) => encodeQubit(bit, aliceBases[idx]));

    /**
     * BOB'S PHASE: Generate random bases and measure qubits
     */
    const bobBases = Array.from({ length: sequenceLength }, () => generateRandomBasis());
    
    // Bob measures each qubit with his random basis
    // In reality, if his basis doesn't match Alice's, the measurement gives random result
    // For simulation, we'll track which bases match instead
    const bobMeasurements = qubits.map((qubit, idx) => (
      bobBases[idx] === aliceBases[idx] 
        ? qubit.bit  // Correct basis - measurement is accurate
        : generateRandomBit()  // Wrong basis - measurement is random
    ));

    /**
     * SIFTING PHASE: Keep only bits where bases matched
     * Alice and Bob publicly compare bases (but NOT the bit values)
     */
    const siftedKey = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      if (aliceBases[i] === bobBases[i]) {
        // Bases matched - keep the bit
        siftedKey.push(aliceBits[i]);
      }
    }

    /**
     * FINAL KEY DERIVATION: Convert binary array to binary string and hash
     */
    if (siftedKey.length === 0) {
      console.warn('BB84: Sifted key is empty, generating fallback key');
      return generateFallbackKey(keyLength);
    }

    // Convert bit array to binary string
    const binaryKey = siftedKey
      .slice(0, keyLength)
      .join('');

    // If sifted key is still too short, pad it
    if (binaryKey.length < keyLength) {
      console.warn(`BB84: Sifted key (${binaryKey.length}) was shorter than requested (${keyLength})`);
      return generateFallbackKey(keyLength);
    }

    // Use the binary key and hash it with SHA-256
    const finalBinaryKey = binaryKey.slice(0, keyLength);
    const hashedKey = crypto
      .createHash('sha256')
      .update(finalBinaryKey)
      .digest('hex');

    console.log(`BB84 Key Generation: Generated ${sequenceLength} qubits, sifted to ${finalBinaryKey.length} bits, hashed to SHA-256`);
    
    return hashedKey;

  } catch (error) {
    console.error('BB84 Key Generation Error:', error);
    // Fallback to random key generation if anything fails
    return generateFallbackKey(keyLength);
  }
};

/**
 * Fallback Random Key Generation
 * Used if BB84 simulation fails or produces insufficient key material
 * This uses cryptographically secure random number generation
 */
const generateFallbackKey = (keyLength = 32) => {
  // Generate random bytes and convert to hex
  // SHA-256 produces 32 bytes (256 bits), which is standard
  const randomBytes = crypto.randomBytes(keyLength);
  return randomBytes.toString('hex');
};

/**
 * Verify a key was properly generated (optional utility)
 * Helps detect corrupted or invalid keys in storage
 */
export const isValidKey = (key) => {
  // SHA-256 hex output is always 64 characters
  return typeof key === 'string' && /^[a-f0-9]{64}$/.test(key);
};

export default {
  generateSharedKey,
  isValidKey,
};
