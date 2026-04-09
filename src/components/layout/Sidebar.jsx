import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiActivity,
  FiMapPin,
  FiX,
  FiList,
  FiPackage,
  FiAlertCircle,
  FiFileText,
  FiAlertTriangle,
} from 'react-icons/fi';

// ─── Nav config per role ──────────────────────────────────────────────────────

const getNavLinks = (role) => {
  const common = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome, end: true },
  ];

  if (role === 'Admin') {
    return [
      ...common,
      { name: 'Queue Board',      path: '/dashboard/queue',        icon: FiList       },
      { name: 'Hospitals',        path: '/dashboard/hospitals',    icon: FiMapPin     },
      { name: 'Clinics',          path: '/dashboard/clinics',      icon: FiCalendar   },
      { name: 'Vaccines',         path: '/dashboard/vaccines',     icon: FiPackage    },
      { name: 'Batches',          path: '/dashboard/batches',      icon: FiList       },
      { name: 'Inventory Alerts', path: '/dashboard/inventory',    icon: FiAlertCircle},
      { name: 'All Appointments', path: '/dashboard/appointments', icon: FiUsers      },
      { name: 'All Records',      path: '/dashboard/records',      icon: FiFileText   },
      { name: 'Side Effects',     path: '/dashboard/side-effects', icon: FiAlertTriangle },
    ];
  }

  if (role === 'HospitalStaff') {
    return [
      ...common,
      { name: 'Queue Board',      path: '/dashboard/queue',        icon: FiList       },
      { name: 'Clinics',          path: '/dashboard/clinics',      icon: FiCalendar   },
      { name: 'Batches',          path: '/dashboard/batches',      icon: FiPackage    },
      { name: 'All Records',      path: '/dashboard/records',      icon: FiFileText   },
      { name: 'Side Effects',     path: '/dashboard/side-effects', icon: FiAlertTriangle },
    ];
  }

  // Public (default)
  return [
    ...common,
    { name: 'My Appointments',  path: '/dashboard/appointments',      icon: FiCalendar   },
    { name: 'Book Appointment', path: '/dashboard/appointments/book', icon: FiActivity   },
    { name: 'Find Hospital',    path: '/dashboard/hospitals',         icon: FiMapPin     },
    { name: 'My Records',       path: '/dashboard/records',           icon: FiFileText   },
    { name: 'My Dependents',    path: '/dashboard/dependents',        icon: FiUsers      },
    { name: 'Side Effects',     path: '/dashboard/side-effects',      icon: FiAlertTriangle },
  ];
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({ isOpen, toggleSidebar, userRole = 'Public' }) => {
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

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-xl leading-none">
              V
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">
              VaxTrack
            </span>
          </div>

          {/* Close button (mobile only) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.end}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 font-medium'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                }
              `}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
            >
              <link.icon className="w-5 h-5 shrink-0" />
              <span className="text-sm">{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
