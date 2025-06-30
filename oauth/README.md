# OAuth 2.0 Mock Provider

A mock OAuth 2.0 authorization server for testing OAuth flows with PKCE support.

## Features

- Full OAuth 2.0 authorization code flow
- PKCE (Proof Key for Code Exchange) support for public clients
- 10% random error rate for testing error handling
- Public client configuration (no client secret required)
- User profile endpoint

## API Endpoints

### 1. Authorization Endpoint

**GET /oauth/authorize**

Initiates the OAuth 2.0 authorization flow.

#### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `client_id` | Yes | The client identifier |
| `redirect_uri` | Yes | The callback URL (must be registered) |
| `response_type` | Yes | Must be `code` |
| `scope` | No | Space-separated scopes (default: `profile email`) |
| `state` | No | Opaque value for maintaining state |
| `code_challenge` | Yes* | PKCE code challenge (*required for public clients) |
| `code_challenge_method` | No | PKCE method (`plain` or `S256`, default: `plain`) |

#### Response

Redirects to the `redirect_uri` with:
- Success: `?code={authorization_code}&state={state}`
- Error: `?error={error_code}&error_description={description}&state={state}`

#### Example

```
GET http://localhost:3001/oauth/authorize?
    client_id=mock-client-id&
    redirect_uri=http://localhost:5173/callback&
    response_type=code&
    scope=profile%20email&
    state=xyz123&
    code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&
    code_challenge_method=S256
```

### 2. Token Endpoint

**POST /oauth/token**

Exchanges authorization code for access token or refreshes access token.

#### Request Headers

```
Content-Type: application/x-www-form-urlencoded
```

#### Request Body Parameters

For authorization code exchange:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `grant_type` | Yes | Must be `authorization_code` |
| `code` | Yes | The authorization code |
| `redirect_uri` | Yes | Must match the authorization request |
| `client_id` | Yes | The client identifier |
| `client_secret` | No | Not required for public clients |
| `code_verifier` | Yes* | Required for public clients using PKCE |

For refresh token:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `grant_type` | Yes | Must be `refresh_token` |
| `refresh_token` | Yes | The refresh token |
| `client_id` | Yes | The client identifier |
| `client_secret` | No | Not required for public clients |

#### Response

```json
{
  "access_token": "mock_access_token_...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "mock_refresh_token_...",
  "scope": "profile email"
}
```

#### Error Response

```json
{
  "error": "invalid_grant",
  "error_description": "Invalid authorization code"
}
```

#### Example

```bash
curl -X POST http://localhost:3001/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=abc123" \
  -d "redirect_uri=http://localhost:5173/callback" \
  -d "client_id=mock-client-id" \
  -d "code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
```

### 3. User Info Endpoint

**GET /oauth/userinfo**

Retrieves authenticated user's profile information.

#### Request Headers

```
Authorization: Bearer {access_token}
```

#### Response

```json
{
  "id": "default-user-11111",
  "email": "user@example.com",
  "name": "Test User",
  "picture": "https://randomuser.me/api/portraits/lego/5.jpg"
}
```

#### Error Response

```json
{
  "error": "invalid_token",
  "error_description": "Invalid access token"
}
```

#### Example

```bash
curl http://localhost:3001/oauth/userinfo \
  -H "Authorization: Bearer mock_access_token_..."
```

## Available Test Client

### Mock Public Client
- **Client ID**: `mock-client-id`
- **Type**: Public client (no secret required)
- **PKCE**: Required
- **Redirect URIs**: 
  - `http://localhost:5173/callback`
  - `http://localhost:5173/auth/callback`

## PKCE Implementation

The server enforces PKCE for public clients as defined in [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636):

1. **Public Client Requirements**:
   - PKCE is mandatory for `mock-client-id`
   - No client secret is required or accepted

2. **Code Challenge Methods**:
   - `plain`: Direct comparison (not recommended)
   - `S256`: SHA256 hash of the verifier (recommended)

3. **Code Verifier Requirements**:
   - 43-128 characters
   - Characters: `[A-Z] [a-z] [0-9] - . _ ~`

4. **Code Challenge for S256**:
   ```
   code_challenge = BASE64URL(SHA256(code_verifier))
   ```

## Error Simulation

The server has a **10% random error rate** to test error handling:

- Returns HTTP 500 with error response
- Occurs on `/oauth/token` and `/oauth/userinfo` endpoints only
- Does NOT occur on `/oauth/authorize` to prevent redirect issues
- Error format:
  ```json
  {
    "error": "server_error",
    "error_description": "The authorization server encountered an unexpected condition..."
  }
  ```

## Running the Server

```bash
# Install dependencies
pnpm install

# Start the server (runs on port 3001)
pnpm dev

# Or use npm/yarn
npm run dev
yarn dev
```

## Complete Flow Example

### 1. Generate PKCE values (client-side)
```javascript
// Generate code verifier
const codeVerifier = generateRandomString(128);

// Generate code challenge
const encoder = new TextEncoder();
const data = encoder.encode(codeVerifier);
const digest = await crypto.subtle.digest('SHA-256', data);
const codeChallenge = base64URLEncode(digest);
```

### 2. Authorization request
```
http://localhost:3001/oauth/authorize?
  client_id=mock-client-id&
  redirect_uri=http://localhost:5173/callback&
  response_type=code&
  code_challenge={codeChallenge}&
  code_challenge_method=S256
```

### 3. Token exchange
```javascript
const response = await fetch('http://localhost:3001/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: 'http://localhost:5173/callback',
    client_id: 'mock-client-id',
    code_verifier: codeVerifier,
  }),
});
```

### 4. Get user info
```javascript
const userResponse = await fetch('http://localhost:3001/oauth/userinfo', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

## Notes

- Authorization codes expire after 5 minutes
- Access tokens expire after 1 hour
- The server validates all PKCE parameters strictly
- Public clients must use PKCE
- All registered redirect URIs are on `http://localhost:5173`