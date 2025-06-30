import { useState } from "react";
import { TaskInstructions } from "./TaskInstructions";
import { UserProfile, type User, type TokenResponse } from "./UserProfile";

interface LoginFormProps {
  onLogin: () => void;
  loading: boolean;
}

function LoginForm({ onLogin, loading }: LoginFormProps) {
  return (
    <div className="text-center">
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Implement PKCE OAuth 2.0 flow
      </p>
      <button
        onClick={onLogin}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
      >
        {loading ? "Loading..." : "Login with OAuth (PKCE)"}
      </button>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CLIENT_ID = "mock-client-id";
  const REDIRECT_URI = "http://localhost:5173/callback";
  const AUTH_SERVER = "http://localhost:3001";

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      // TODO: Implement PKCE authorization flow
      // Hint: Store PKCE values somewhere for later retrieval during token exchange...
      window.location.href = `TODO`;
    } catch (err) {
      setError("Failed to initiate login");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setError(null);
    sessionStorage.clear();
  };

  const handleCallback = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const tokenResponse = await exchangeCodeForToken(code);
      const userInfo = await fetchUserInfo(tokenResponse.access_token);
      setUser(userInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const exchangeCodeForToken = async (
    _code: string
  ): Promise<TokenResponse> => {
    throw new Error("Not implemented");
  };

  const fetchUserInfo = async (_accessToken: string): Promise<User> => {
    throw new Error("Not implemented");
  };

  // Check for OAuth callback on component mount
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      setError(
        `OAuth error: ${error} - ${
          params.get("error_description") || "Unknown error"
        }`
      );
    } else if (code) {
      handleCallback(code);
      window.history.replaceState({}, document.title, "/");
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
          OAuth SPA PKCE Implementation Test
        </h1>

        {error && <div className="text-red-500">Error: {error}</div>}

        {!user ? (
          <LoginForm onLogin={handleLogin} loading={loading} />
        ) : (
          <UserProfile user={user} onLogout={handleLogout} />
        )}

        <TaskInstructions />
      </div>
    </div>
  );
}

export default App;
