import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMenu, FiBell, FiUser, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';

const Navbar = ({ toggleSidebar, user = { name: 'John Doe', role: 'Patient' } }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Theme initialization and synchronization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-4 sm:px-6 z-30 relative transition-colors duration-200">
      
      {/* Left side: Hamburger */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 mr-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
          aria-label="Open sidebar"
        >
          <FiMenu className="w-5 h-5" />
        </button>
        
        {/* Optional Page Title can go here via contextual routing if desired */}
        <h1 className="text-xl font-bold tracking-tight hidden sm:block truncate max-w-[200px] lg:max-w-xs">
          {/* dynamic page title logic could go here */}
        </h1>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-1 sm:gap-3">
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button 
          onClick={() => navigate('/dashboard/appointments')}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          aria-label="View notifications"
        >
          <FiBell className="w-5 h-5" />
        </button>

        {/* User Dropdown Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 sm:mx-2" />

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button 
            className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
             <div className="hidden sm:block text-right mr-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white leading-none mb-1">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-none capitalize">
                  {user.role}
                </p>
             </div>
             <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0 border border-primary-200 dark:border-primary-800">
               <FiUser className="w-4 h-4" />
             </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-medium border border-border py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="px-4 py-3 border-b border-border sm:hidden">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5 capitalize">{user.role}</p>
              </div>
              
              <a href="#profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <FiUser className="w-4 h-4" />
                My Profile
              </a>
              
              <div className="h-px bg-border my-1" />
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors text-left"
              >
                <FiLogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
