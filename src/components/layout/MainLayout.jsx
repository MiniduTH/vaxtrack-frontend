import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Example user state (would normally come from auth context)
  const [user] = useState({
    name: 'Sarah Connor',
    role: 'patient', // 'admin' | 'staff' | 'patient'
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-background dark:bg-background overflow-hidden relative transition-colors duration-300">
      
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        userRole={user.role} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Navbar inside the main flex column so it visually lines up to the right of sidebar desktop */}
        <Navbar 
          toggleSidebar={toggleSidebar} 
          user={user} 
        />
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background relative p-4 sm:p-6 lg:p-8 relax-scroll transition-colors duration-300">
          
          {/* A container to cap max width nicely */}
          <div className="mx-auto max-w-7xl w-full">
            {/* The Outlet renders nested routes (e.g. /dashboard/appointments) */}
            <Outlet />
          </div>
          
        </main>

      </div>
    </div>
  );
};

export default MainLayout;
