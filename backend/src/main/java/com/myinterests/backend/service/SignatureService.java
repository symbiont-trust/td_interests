package com.myinterests.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class SignatureService {
    
    @Value("${app.signature.private-key:#{null}}")
    private String privateKey;
    
    public String generateSignature(String message) {
        if (privateKey == null || privateKey.isEmpty()) {
            throw new RuntimeException("Private key not configured for signature generation");
        }
        
        try {
            // Create credentials from private key
            Credentials credentials = Credentials.create(privateKey);
            
            // Hash the message
            byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);
            
            // Sign the message hash
            Sign.SignatureData signature = Sign.signMessage(messageBytes, credentials.getEcKeyPair());
            
            // Combine r, s, and v into a single signature string
            byte[] r = signature.getR();
            byte[] s = signature.getS();
            byte[] v = signature.getV();
            
            // Concatenate r + s + v
            byte[] fullSignature = new byte[r.length + s.length + v.length];
            System.arraycopy(r, 0, fullSignature, 0, r.length);
            System.arraycopy(s, 0, fullSignature, r.length, s.length);
            System.arraycopy(v, 0, fullSignature, r.length + s.length, v.length);
            
            return Numeric.toHexString(fullSignature);
        } catch (Exception e) {
            log.error("Failed to generate signature for message: {}", message, e);
            throw new RuntimeException("Failed to generate signature", e);
        }
    }
    
    public String getSignerAddress() {
        if (privateKey == null || privateKey.isEmpty()) {
            throw new RuntimeException("Private key not configured");
        }
        
        try {
            Credentials credentials = Credentials.create(privateKey);
            return credentials.getAddress();
        } catch (Exception e) {
            log.error("Failed to get signer address", e);
            throw new RuntimeException("Failed to get signer address", e);
        }
    }
}