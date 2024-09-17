'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/lib/actions/user.action';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { token } = params;  

  useEffect(() => {
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('token', token);
    formData.append('newPassword', newPassword);

    const response = await resetPassword(formData);

    setLoading(false);
    if (response.success) {
      setSuccess(response.message);
      setTimeout(() => {
        router.push('/sign-in');
      }, 3000);
    } else {
      setError(response.message);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-md bg-white p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-semibold">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-500">{success}</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
