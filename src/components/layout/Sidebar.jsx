import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiCalendar, 
  FiActivity, 
  FiSettings, 
  FiX, 
  FiMapPin 
} from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar, userRole = 'patient' }) => {
  // Define navigation links based on roles
  const getNavLinks = (role) => {
    const commonLinks = [
      { name: 'Dashboard', path: '/dashboard', icon: <FiHome className="w-5 h-5" /> },
    ];

    const adminLinks = [
      ...commonLinks,
      { name: 'Hospitals', path: '/dashboard/hospitals', icon: <FiMapPin className="w-5 h-5" /> },
      { name: 'Clinics', path: '/dashboard/clinics', icon: <FiActivity className="w-5 h-5" /> },
      { name: 'User Management', path: '/dashboard/users', icon: <FiUsers className="w-5 h-5" /> },
      { name: 'Settings', path: '/dashboard/settings', icon: <FiSettings className="w-5 h-5" /> },
    ];

    const staffLinks = [
      ...commonLinks,
      { name: 'Clinic Management', path: '/dashboard/clinics', icon: <FiActivity className="w-5 h-5" /> },
      { name: 'Appointments', path: '/dashboard/appointments', icon: <FiCalendar className="w-5 h-5" /> },
    ];

    const patientLinks = [
      ...commonLinks,
      { name: 'My Appointments', path: '/dashboard/appointments', icon: <FiCalendar className="w-5 h-5" /> },
      { name: 'Find Hospitals', path: '/dashboard/find-hospitals', icon: <FiMapPin className="w-5 h-5" /> },
      { name: 'Health Records', path: '/dashboard/records', icon: <FiActivity className="w-5 h-5" /> },
    ];

    switch (role) {
      case 'admin':
        return adminLinks;
      case 'staff':
        return staffLinks;
      case 'patient':
      default:
        return patientLinks;
    }
  };

  const navLinks = getNavLinks(userRole);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-xl leading-none">
              V
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              VaxTrack
            </span>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 overflow-y-auto h-[calc(100vh-4rem)]">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 font-medium' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                }
              `}
              onClick={() => {
                // Close sidebar on mobile when a link is clicked
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                }
              }}
            >
              <span className={`transition-colors duration-200 ${
                  // isActive is handled by navlink via match, but since we can't easily access it here for icon color without duplicating logic,
                  // CSS cascading from parent will color the icon if currentColor is used.
                 '' 
                }`}>
                {link.icon}
              </span>
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
