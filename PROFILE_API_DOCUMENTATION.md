# My Interests Profile API Documentation

## Overview

The My Interests Profile API provides secure external access to user profiles and connection data through a RESTful interface. The API uses JWT-based client authentication and ECDSA signatures for data integrity.

## Base URL

```
http://localhost:8080/api
```

## Authentication

All Profile API endpoints require client authentication using JWT tokens obtained through the authentication endpoint.

### Client Authentication

#### POST `/profile-auth/authenticate`

Authenticates an API client and returns a JWT token for accessing profile endpoints.

**Request:**
```http
POST /api/profile-auth/authenticate
Content-Type: application/json

{
  "client_id": "your-client-id"
}
```

**Response (Success):**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "client_id": "your-client-id"
}
```

**Response (Error):**
```json
{
  "error": "Authentication failed",
  "message": "Invalid client ID"
}
```

**Status Codes:**
- `200 OK` - Authentication successful
- `400 Bad Request` - Missing or invalid client_id
- `401 Unauthorized` - Invalid client credentials
- `500 Internal Server Error` - Server error

## Profile Endpoints

### GET `/profile/{walletAddress}`

Retrieves a user's profile including their interests and connections with cryptographic signature for data integrity.

**Authentication Required:** Yes (Bearer token)

**Parameters:**
- `walletAddress` (path) - The wallet address of the user (42-character hex string starting with 0x)

**Request:**
```http
GET /api/profile/0x1234567890abcdef1234567890abcdef12345678
Authorization: Bearer {access_token}
```

**Response (Success):**
```json
{
  "profile": "{\"profile-wallet-address\":\"0x1234567890abcdef1234567890abcdef12345678\",\"non-unique-handle\":\"alice\",\"profile-interests\":[\"Technology\",\"Blockchain\"],\"contacts\":[{\"wallet-address\":\"0xabcdef1234567890abcdef1234567890abcdef12\",\"non-unique-handle\":\"bob\",\"common-interests\":[\"Technology\"]}]}",
  "profile_hash": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  "signature": "0x1234567890abcdef...",
  "signer_address": "0x9876543210fedcba9876543210fedcba98765432",
  "wallet_address": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Profile JSON Structure:**
The `profile` field contains a JSON string with the following structure:
```json
{
  "profile-wallet-address": "0x1234567890abcdef1234567890abcdef12345678",
  "non-unique-handle": "alice",
  "profile-interests": ["Technology", "Blockchain", "DeFi"],
  "contacts": [
    {
      "wallet-address": "0xabcdef1234567890abcdef1234567890abcdef12",
      "non-unique-handle": "bob", 
      "common-interests": ["Technology", "Blockchain"]
    }
  ]
}
```

**Response Fields:**
- `profile` - JSON string containing the user's profile data
- `profile_hash` - SHA-256 hash of the profile JSON for integrity verification
- `signature` - ECDSA signature of the profile JSON for authenticity verification
- `signer_address` - Ethereum address of the signing authority
- `wallet_address` - The requested user's wallet address

**Response (Error):**
```json
{
  "error": "Profile not found",
  "message": "User not found"
}
```

**Status Codes:**
- `200 OK` - Profile retrieved successfully
- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - User profile not found
- `500 Internal Server Error` - Server error

## Data Integrity and Security

### Signature Verification

Each profile response includes an ECDSA signature that can be verified to ensure data authenticity:

1. **Hash Verification**: Compute SHA-256 hash of the profile JSON and compare with `profile_hash`
2. **Signature Verification**: Verify the ECDSA signature using the `signer_address` and profile JSON
3. **Timestamp Validation**: Check that the data is current (implementation-dependent)

### Example Verification (JavaScript)

```javascript
import { ethers } from 'ethers';

function verifyProfile(response) {
  const { profile, profile_hash, signature, signer_address } = response;
  
  // 1. Verify hash
  const computedHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(profile));
  if (computedHash !== profile_hash) {
    throw new Error('Profile hash mismatch');
  }
  
  // 2. Verify signature
  const recoveredAddress = ethers.utils.verifyMessage(profile, signature);
  if (recoveredAddress !== signer_address) {
    throw new Error('Invalid signature');
  }
  
  return true;
}
```

## Rate Limiting

- **Authentication**: 10 requests per minute per client
- **Profile Retrieval**: 100 requests per minute per authenticated client

## Error Handling

All API responses use consistent error formats:

```json
{
  "error": "Error type",
  "message": "Detailed error description"
}
```

Common error scenarios:
- **Invalid Authentication**: Return 401 with authentication error
- **Resource Not Found**: Return 404 with specific resource error
- **Rate Limit Exceeded**: Return 429 with rate limit information
- **Server Errors**: Return 500 with generic error message

## Client Implementation Example

### Java Client (Spring Boot)

```java
@Service
public class ProfileApiClient {
    
    @Value("${profile.api.base-url}")
    private String baseUrl;
    
    @Value("${profile.api.client-id}")  
    private String clientId;
    
    private RestTemplate restTemplate = new RestTemplate();
    private String cachedToken;
    
    public ProfileResponse getProfile(String walletAddress) {
        String token = getAuthToken();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        return restTemplate.exchange(
            baseUrl + "/api/profile/" + walletAddress,
            HttpMethod.GET,
            entity,
            ProfileResponse.class
        ).getBody();
    }
    
    private String getAuthToken() {
        if (cachedToken != null) return cachedToken;
        
        Map<String, String> request = Map.of("client_id", clientId);
        
        AuthResponse response = restTemplate.postForObject(
            baseUrl + "/api/profile-auth/authenticate",
            request,
            AuthResponse.class
        );
        
        return cachedToken = response.getAccessToken();
    }
}
```

### JavaScript/TypeScript Client

```typescript
class ProfileApiClient {
    private baseUrl: string;
    private clientId: string;
    private cachedToken?: string;
    
    constructor(baseUrl: string, clientId: string) {
        this.baseUrl = baseUrl;
        this.clientId = clientId;
    }
    
    async getProfile(walletAddress: string): Promise<ProfileResponse> {
        const token = await this.getAuthToken();
        
        const response = await fetch(`${this.baseUrl}/api/profile/${walletAddress}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    private async getAuthToken(): Promise<string> {
        if (this.cachedToken) return this.cachedToken;
        
        const response = await fetch(`${this.baseUrl}/api/profile-auth/authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id: this.clientId })
        });
        
        const data = await response.json();
        return this.cachedToken = data.access_token;
    }
}
```

## Configuration

### Client Registration

API clients must be registered in the database before use:

```sql
INSERT INTO api_clients (client_id, client_name, is_active, created_at, updated_at) 
VALUES ('your-client-id', 'Your Application Name', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### Environment Variables

Backend configuration:
```yaml
# application.yml
app:
  signature:
    private-key: ${PROFILE_SIGNATURE_PRIVATE_KEY:}

jwt:
  secret: ${JWT_SECRET:your-secret-key}
  expiration: 86400000  # 24 hours
```

Client configuration:
```yaml
# profile-api-client application.yml  
profile:
  api:
    base-url: http://localhost:8080
    client-id: ${PROFILE_API_CLIENT_ID:your-client-id}
```

## Security Considerations

1. **Transport Security**: Always use HTTPS in production
2. **API Key Management**: Store client IDs securely, never in source code
3. **Token Storage**: Cache tokens securely, implement proper expiration handling
4. **Signature Verification**: Always verify signatures in production environments
5. **Rate Limiting**: Implement client-side rate limiting to avoid hitting limits
6. **Error Handling**: Don't expose sensitive information in error messages

## Support and Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check client_id is registered and active
2. **404 Profile Not Found**: Verify wallet address format and user existence  
3. **Invalid Signature**: Check signature verification implementation
4. **Rate Limited**: Implement exponential backoff and token caching

### Contact Information

For API support and client registration:
- Email: john.charles.dickerson@gmail.com
- Location: Nairobi, Kenya

## Changelog

### Version 1.0.0
- Initial release
- JWT-based client authentication
- Profile retrieval with ECDSA signatures
- Comprehensive error handling
- Rate limiting implementation