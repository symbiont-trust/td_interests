package com.myinterests.backend.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.web3j.crypto.ECDSASignature;
import org.web3j.crypto.Hash;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class WalletSignatureVerifier {

    public boolean verifySignature(String walletAddress, String message, String signature) {
        try {
            // Remove 0x prefix if present
            String cleanWalletAddress = cleanAddress(walletAddress);
            String cleanSignature = cleanHex(signature);

            // Create the message hash as done by MetaMask
            String prefix = "\u0019Ethereum Signed Message:\n";
            String prefixedMessage = prefix + message.length() + message;
            byte[] messageHash = Hash.sha3(prefixedMessage.getBytes(StandardCharsets.UTF_8));

            // Extract r, s, v from signature
            byte[] signatureBytes = Numeric.hexStringToByteArray(cleanSignature);
            if (signatureBytes.length != 65) {
                log.error("Invalid signature length: {}", signatureBytes.length);
                return false;
            }

            byte v = signatureBytes[64];
            if (v < 27) {
                v += 27;
            }

            byte[] r = new byte[32];
            byte[] s = new byte[32];
            System.arraycopy(signatureBytes, 0, r, 0, 32);
            System.arraycopy(signatureBytes, 32, s, 0, 32);

            // Create ECDSASignature
            ECDSASignature ecdsaSignature = new ECDSASignature(
                    new BigInteger(1, r),
                    new BigInteger(1, s)
            );

            // Recover public key
            for (int recovery = 0; recovery < 4; recovery++) {
                BigInteger publicKey = Sign.recoverFromSignature(recovery, ecdsaSignature, messageHash);
                if (publicKey != null) {
                    String recoveredAddress = "0x" + Keys.getAddress(publicKey);
                    if (recoveredAddress.equalsIgnoreCase("0x" + cleanWalletAddress)) {
                        return true;
                    }
                }
            }

            log.warn("Signature verification failed for wallet: {}", walletAddress);
            return false;

        } catch (Exception e) {
            log.error("Error verifying signature for wallet {}: {}", walletAddress, e.getMessage());
            return false;
        }
    }

    public String generateSignatureMessage(String walletAddress) {
        return "Sign this message to authenticate with My Interests: " + 
               System.currentTimeMillis() + 
               " for wallet " + walletAddress;
    }

    private String cleanAddress(String address) {
        if (address == null) return "";
        return address.startsWith("0x") ? address.substring(2) : address;
    }

    private String cleanHex(String hex) {
        if (hex == null) return "";
        return hex.startsWith("0x") ? hex.substring(2) : hex;
    }
}