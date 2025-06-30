export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Authentication Successful!
      </h2>
      <img
        src={user.picture}
        alt={user.name}
        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-200 dark:border-gray-700"
      />
      <div className="space-y-2 mb-6">
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Name:</span> {user.name}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">ID:</span> {user.id}
        </p>
      </div>
      <button
        onClick={onLogout}
        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
      >
        Logout
      </button>
    </div>
  );
}
