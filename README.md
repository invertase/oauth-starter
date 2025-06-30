# OAuth PKCE Implementation Technical Test

## Overview
This is a 1-hour technical test to implement PKCE (Proof Key for Code Exchange) in an OAuth 2.0 client application.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the mock OAuth server:
   ```bash
   pnpm dev --filter oauth-mock-server
   ```

3. In a new terminal, start the React app:
   ```bash
   pnpm dev --filter app
   ```

4. Open http://localhost:5173 in your browser

## Your Task

Implement PKCE in the OAuth 2.0 flow. The application should:
- Generate and use PKCE parameters correctly
- Successfully authenticate users
- Display user profile information
- Handle errors appropriately

## Technical Details

- **OAuth Server**: http://localhost:3001
- **Client ID**: `mock-client-id`
- **Redirect URI**: http://localhost:5173/callback
- **PKCE Method**: S256

Note: Some endpoints of the mock server have an intentional 10% random error rate to test your error handling :)

## Evaluation

Your implementation will be evaluated on:
- Correctness of PKCE implementation
- Code quality and organization
- Error handling
- Understanding of OAuth 2.0 security

Good luck!