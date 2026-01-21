import React from 'react';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Error Code */}
        <div className="mb-6 animate-pulse">
          <span className="text-9xl font-black text-red-400">403</span>
        </div>

        {/* Main Message */}
        <h1 className="text-5xl font-black text-white mb-4">Access Denied</h1>
        <p className="text-xl text-red-100 mb-8">
          You don't have permission to access this resource.
        </p>

        {/* Explanation Box */}
        <div className="bg-white/10 backdrop-blur-md border border-red-400/30 rounded-2xl p-8 mb-8">
          <div className="text-5xl mb-4">🚫</div>
          <p className="text-gray-200 mb-4">
            This action requires elevated privileges or specific user role. Your current account doesn't
            have the necessary permissions.
          </p>
          <ul className="text-gray-300 text-left space-y-2 inline-block">
            <li className="flex items-center gap-2">
              <span>🔐</span> Verify your account status
            </li>
            <li className="flex items-center gap-2">
              <span>📧</span> Contact administrator for role upgrade
            </li>
            <li className="flex items-center gap-2">
              <span>🔄</span> Try again with appropriate account
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <span>📊</span>
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-lg transition border border-white/20 flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            Return Home
          </button>
        </div>

        {/* Support Message */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-300 text-sm">
            If you believe this is a mistake, please contact us:
          </p>
          <p className="text-green-300 font-mono text-sm mt-2">support@landverification.gov.in</p>
        </div>
      </div>
    </div>
  );
};
