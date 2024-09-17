'use client';
import React,{ useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestPasswordReset } from '@/lib/actions/user.action';

export default function RequestResetPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('email', email);

    const response = await requestPasswordReset(formData);

    setLoading(false);
    if (response.success) {
      setSuccess(response.message);
      setTimeout(() => {
        router.push('/'); 
      }, 3000);
    } else {
      setError(response.message);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-md bg-white p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-semibold">Request Password Reset</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 w-full rounded-md border border-gray-300 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-500">{success}</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>
      </form>
    </div>
  );
}
