'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-600">Sesión iniciada como:</p>
            <p className="font-semibold text-gray-900">{user.email}</p>
          </div>
          <div>
            <span
              className={`
                px-3 py-1 rounded-full text-xs font-medium
                ${user.role === 'admin'
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                }
              `}
            >
              {user.role === 'admin' ? 'Administrador' : 'Neumólogo'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
