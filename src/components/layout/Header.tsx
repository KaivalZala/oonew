import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, Settings } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount } = useCart();
  const { user, signOut } = useAuth();
  const itemCount = getItemCount();

  const isMenuPage = location.pathname === '/menu';
  const isAdminPage = location.pathname.startsWith('/admin');

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleAdminAccess = () => {
    navigate('/admin/login');
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center min-w-0">
            <button
              onClick={() => navigate(isAdminPage ? '/admin/dashboard' : '/menu')}
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent truncate"
            >
              OONA
            </button>
            <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-500 hidden xs:block">The One Restaurant</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Admin Access Button - Only show on customer pages */}
            {!isAdminPage && (
              <button
                onClick={handleAdminAccess}
                className="p-2 text-gray-400 hover:text-orange-600 transition-colors opacity-50 hover:opacity-100"
                title="Admin Access"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {isMenuPage && (
              <button
                onClick={() => navigate('/menu/cart')}
                className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            {isAdminPage && user && (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 max-w-[120px] truncate">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-red-600 p-1 sm:p-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}