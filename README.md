# OAuth PKCE Implementation Technical Test

## Overview
This is a 1-hour technical test to implement PKCE (Proof Key for Code Exchange) in the OAuth 2.0 frontend client application located in `/app`.

⚠️ IMPORTANT: This test is FRONTEND ONLY. Do NOT modify the mock OAuth server.

## Setup
1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the mock OAuth server (no modifications needed):
   ```bash
   pnpm dev --filter oauth-mock-server
   ```

3. In a new terminal, start the React app:
   ```bash
   pnpm dev --filter app
   ```

4. Open http://localhost:5173 in your browser

## Your Task
Implement PKCE in the OAuth 2.0 flow within the React frontend application (`/app` directory). 

The frontend application should:
- Generate and use PKCE parameters correctly
- Successfully authenticate users via the mock OAuth server
- Display user profile information after successful authentication
- Handle errors appropriately

**Note:** You should only modify code in the `/app` directory. The mock OAuth server is fully implemented and working.

## Technical Details
- **OAuth Server**: http://localhost:3001 (already implemented)
- **Client ID**: `mock-client-id`
- **Redirect URI**: http://localhost:5173/callback
- **PKCE Method**: S256
- **Frontend Framework**: React (located in `/app`)

Note: Some endpoints of the mock server have an intentional 10% random error rate to test your error handling :)

## Evaluation
Your implementation will be evaluated on:
- Correctness of PKCE implementation
- Code quality and organization
- Git commit structuring (we prefer to see logical commits rather than one large commit)
- Understanding of OAuth 2.0/PKCE

Feel free to use AI tools to assist you, but please ensure you fully understand any code you submit as we'll discuss your implementation in detail during the follow-up interview.

Good luck!
