'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'lawyer') {
      router.push('/dashboard/lawyer');
    } else if (user.role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/client');
    }
  }, [user, loading, router]);

  return (
    <div className="loading">
      <p>Redirecting to your dashboard...</p>
    </div>
  );
}
