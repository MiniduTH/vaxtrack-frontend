import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import useAuthStore from '../../store/useAuthStore';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-background dark:bg-background overflow-hidden relative transition-colors duration-300">

      {/* Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        userRole={user?.role ?? 'User'}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Navbar */}
        <Navbar
          toggleSidebar={toggleSidebar}
          user={user}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background relative p-4 sm:p-6 lg:p-8 transition-colors duration-300">
          <div className="mx-auto max-w-7xl w-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default MainLayout;
