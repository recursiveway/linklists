'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in cookies
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const token = cookies.find(c => c.trim().startsWith('token='));
      setIsLoggedIn(true);
    };

    // Initial auth check
    checkAuth();

    // Listen for storage events from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'auth') {
        checkAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        // Update local state
        setIsLoggedIn(false);
        
        // Notify other tabs
        window.localStorage.setItem('auth', 'logged_out');
        
        // Clear cookie client-side as well
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        router.push('/login');
      } else {
        console.log('Logout failed');
      }
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-800">
            LinkLists
          </Link>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/playlist/create-playlist" className="text-gray-600 hover:text-gray-800">
                  Create Playlist
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-gray-800">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
