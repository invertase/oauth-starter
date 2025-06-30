import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

interface AuthorizationCode {
  code: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  expiresAt: number;
}

interface RefreshToken {
  token: string;
  clientId: string;
  scope: string;
  userId: string;
}

interface AccessToken {
  token: string;
  clientId: string;
  scope: string;
  userId: string;
  expiresAt: number;
}

interface OAuthClient {
  secret?: string;
  name: string;
  redirectUris: string[];
  public?: boolean;
}

const authorizationCodes = new Map<string, AuthorizationCode>();
const refreshTokens = new Map<string, RefreshToken>();
const accessTokens = new Map<string, AccessToken>();

const mockClients: Record<string, OAuthClient> = {
  "mock-client-id": {
    name: "Mock OAuth Client",
    redirectUris: [
      "http://localhost:5173/callback",
      "http://localhost:5173/auth/callback",
    ],
    public: true,
  },
};

const mockUser = {
  id: "default-user-11111",
  email: "user@example.com",
  name: "Test User",
  picture: "https://randomuser.me/api/portraits/lego/5.jpg",
};

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function base64URLEncode(str: Buffer): string {
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function sha256(buffer: string): Buffer {
  return crypto.createHash("sha256").update(buffer).digest();
}

function shouldSimulateServerError(): boolean {
  return Math.random() < 0.1; // 10% chance
}

app.get("/oauth/authorize", (req, res) => {
  const {
    client_id,
    redirect_uri,
    response_type,
    scope = "profile email",
    state,
    code_challenge,
    code_challenge_method,
    error,
  } = req.query;

  if (error === "true") {
    const errorUrl = `${redirect_uri}?error=access_denied&error_description=User%20denied%20access${
      state ? `&state=${state}` : ""
    }`;
    return res.redirect(errorUrl);
  }

  if (!client_id || !redirect_uri || !response_type) {
    return res.status(400).json({
      error: "invalid_request",
      error_description: "Missing required parameters",
    });
  }

  const client = mockClients[client_id as string];
  if (!client) {
    return res.status(400).json({
      error: "invalid_client",
      error_description: "Unknown client",
    });
  }

  if (!client.redirectUris.includes(redirect_uri as string)) {
    return res.status(400).json({
      error: "invalid_request",
      error_description: "Invalid redirect URI",
    });
  }

  if (response_type !== "code") {
    return res.status(400).json({
      error: "unsupported_response_type",
      error_description: "Only authorization code flow is supported",
    });
  }

  const authCode = generateToken();
  const authCodeData: AuthorizationCode = {
    code: authCode,
    clientId: client_id as string,
    redirectUri: redirect_uri as string,
    scope: scope as string,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };

  if (code_challenge) {
    authCodeData.codeChallenge = code_challenge as string;
    authCodeData.codeChallengeMethod =
      (code_challenge_method as string) || "plain";
  }

  authorizationCodes.set(authCode, authCodeData);

  const callbackUrl = `${redirect_uri}?code=${authCode}${
    state ? `&state=${state}` : ""
  }`;
  res.redirect(callbackUrl);
});

app.post("/oauth/token", (req, res) => {
  if (shouldSimulateServerError()) {
    return res.status(500).json({
      error: "server_error",
      error_description:
        "The authorization server encountered an unexpected condition that prevented it from fulfilling the request",
    });
  }

  const {
    grant_type,
    code,
    redirect_uri,
    client_id,
    client_secret,
    refresh_token,
    code_verifier,
  } = req.body;

  if (!grant_type || !client_id) {
    return res.status(400).json({
      error: "invalid_request",
      error_description: "Missing required parameters",
    });
  }

  const client = mockClients[client_id];
  if (!client) {
    return res.status(401).json({
      error: "invalid_client",
      error_description: "Unknown client",
    });
  }

  // For confidential clients, validate the secret
  if (!client.public && client.secret !== client_secret) {
    return res.status(401).json({
      error: "invalid_client",
      error_description: "Invalid client credentials",
    });
  }

  if (grant_type === "authorization_code") {
    if (!code || !redirect_uri) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing code or redirect_uri",
      });
    }

    const authCodeData = authorizationCodes.get(code);
    if (!authCodeData) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Invalid authorization code",
      });
    }

    if (authCodeData.expiresAt < Date.now()) {
      authorizationCodes.delete(code);
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Authorization code expired",
      });
    }

    if (
      authCodeData.clientId !== client_id ||
      authCodeData.redirectUri !== redirect_uri
    ) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Invalid code parameters",
      });
    }

    // Public clients MUST use PKCE
    if (client.public && !authCodeData.codeChallenge) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "PKCE is required for public clients",
      });
    }

    if (authCodeData.codeChallenge) {
      if (!code_verifier) {
        return res.status(400).json({
          error: "invalid_request",
          error_description: "PKCE code_verifier required",
        });
      }

      let verifierValid = false;
      if (authCodeData.codeChallengeMethod === "plain") {
        verifierValid = code_verifier === authCodeData.codeChallenge;
      } else if (authCodeData.codeChallengeMethod === "S256") {
        const challenge = base64URLEncode(sha256(code_verifier));
        verifierValid = challenge === authCodeData.codeChallenge;
      }

      if (!verifierValid) {
        return res.status(400).json({
          error: "invalid_grant",
          error_description: "Invalid PKCE code_verifier",
        });
      }
    }

    authorizationCodes.delete(code);

    const accessToken = `mock_access_token_${generateToken()}`;
    const refreshToken = `mock_refresh_token_${generateToken()}`;

    accessTokens.set(accessToken, {
      token: accessToken,
      clientId: client_id,
      scope: authCodeData.scope,
      userId: "default",
      expiresAt: Date.now() + 3600 * 1000, // 1 hour
    });

    refreshTokens.set(refreshToken, {
      token: refreshToken,
      clientId: client_id,
      scope: authCodeData.scope,
      userId: "default",
    });

    return res.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: authCodeData.scope,
    });
  } else if (grant_type === "refresh_token") {
    if (!refresh_token) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing refresh_token",
      });
    }

    const refreshTokenData = refreshTokens.get(refresh_token);
    if (!refreshTokenData || refreshTokenData.clientId !== client_id) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Invalid refresh token",
      });
    }

    const newAccessToken = `mock_access_token_${generateToken()}`;
    const newRefreshToken = `mock_refresh_token_${generateToken()}`;

    accessTokens.set(newAccessToken, {
      token: newAccessToken,
      clientId: client_id,
      scope: refreshTokenData.scope,
      userId: refreshTokenData.userId,
      expiresAt: Date.now() + 3600 * 1000,
    });

    refreshTokens.delete(refresh_token);
    refreshTokens.set(newRefreshToken, {
      token: newRefreshToken,
      clientId: client_id,
      scope: refreshTokenData.scope,
      userId: refreshTokenData.userId,
    });

    return res.json({
      access_token: newAccessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: newRefreshToken,
      scope: refreshTokenData.scope,
    });
  }

  return res.status(400).json({
    error: "unsupported_grant_type",
    error_description:
      "Only authorization_code and refresh_token grants are supported",
  });
});

app.post("/oauth/refresh", (req, res) => {
  if (shouldSimulateServerError()) {
    return res.status(500).json({
      error: "server_error",
      error_description:
        "The authorization server encountered an unexpected condition that prevented it from fulfilling the request",
    });
  }

  req.body.grant_type = "refresh_token";
  app._router.handle(req, res);
});

app.get("/oauth/userinfo", (req, res) => {
  if (shouldSimulateServerError()) {
    return res.status(500).json({
      error: "server_error",
      error_description:
        "The authorization server encountered an unexpected condition that prevented it from fulfilling the request",
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "invalid_request",
      error_description: "Missing or invalid Authorization header",
    });
  }

  const token = authHeader.substring(7);
  const tokenData = accessTokens.get(token);

  if (!tokenData) {
    return res.status(401).json({
      error: "invalid_token",
      error_description: "Invalid access token",
    });
  }

  if (tokenData.expiresAt < Date.now()) {
    accessTokens.delete(token);
    return res.status(401).json({
      error: "invalid_token",
      error_description: "Access token expired",
    });
  }

  res.json(mockUser);
});

const server = app.listen(PORT, () => {
  console.log(`Mock OAuth 2.0 server running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("  GET  /oauth/authorize");
  console.log("  POST /oauth/token");
  console.log("  POST /oauth/refresh");
  console.log("  GET  /oauth/userinfo");
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
  });
});

export default app;
