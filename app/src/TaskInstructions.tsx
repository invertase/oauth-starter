export function TaskInstructions() {
  return (
    <div className="mt-12 bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-left">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Your Challenge: Secure OAuth 2.0 with PKCE (~1 hour)
      </h3>

      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <p className="text-sm">
            <strong>What is PKCE?</strong> PKCE (pronounced "pixie") stands for
            Proof Key for Code Exchange. It's a security extension that protects
            OAuth flows from certain attacks, especially important for public
            clients like single-page applications.
            <a
              href="https://en.wikipedia.org/wiki/Proof_key_for_code_exchange"
              className="text-blue-600 dark:text-blue-400 underline ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about PKCE →
            </a>
          </p>
        </div>

        <p>
          Your task is to enhance this OAuth 2.0 client by implementing PKCE.
          This will make the authentication flow more secure by preventing
          authorization code interception attacks.
        </p>

        <div>
          <h4 className="font-medium mb-2">What you'll implement:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Generate a cryptographically random code verifier</li>
            <li>Create a code challenge using SHA-256 hashing</li>
            <li>Include PKCE parameters in the OAuth flow</li>
            <li>
              Handle server errors gracefully (the server has a 10% error rate
              for testing)
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-2">OAuth Server Endpoints:</h4>
          <ul className="list-disc list-inside space-y-1 font-mono text-sm">
            <li>
              <span className="text-green-600 dark:text-green-400">GET</span>{" "}
              /oauth/authorize - Start the auth flow
            </li>
            <li>
              <span className="text-blue-600 dark:text-blue-400">POST</span>{" "}
              /oauth/token - Exchange code for tokens
            </li>
            <li>
              <span className="text-green-600 dark:text-green-400">GET</span>{" "}
              /oauth/userinfo - Fetch user details
            </li>
          </ul>
          <p className="text-sm mt-2 text-amber-600 dark:text-amber-400">
            ⚠️ The server enforces strict PKCE validation - all parameters must
            be correct!
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <h4 className="font-medium mb-2">Success looks like:</h4>
          <p className="text-sm">
            When you've implemented PKCE correctly, clicking "Login with OAuth"
            will securely authenticate you and display your user profile
            information on this page.
          </p>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          <p>
            <strong>Helpful resources:</strong>
            <br />•{" "}
            <a
              href="https://datatracker.ietf.org/doc/html/rfc7636"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              RFC 7636 (PKCE Specification)
            </a>
            <br />•{" "}
            <a
              href="https://oauth.net/2/pkce/"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              OAuth.net PKCE Guide
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
