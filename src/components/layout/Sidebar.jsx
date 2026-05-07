import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiFolder, FiCheckSquare, FiUsers, FiX, FiUser,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard',  icon: FiGrid,        label: 'Dashboard' },
  { to: '/projects',   icon: FiFolder,      label: 'Projects' },
  { to: '/tasks',      icon: FiCheckSquare, label: 'My Tasks' },
  { to: '/profile',    icon: FiUser,        label: 'Profile' },
];

const adminItems = [
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin, user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800
          flex flex-col transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiGrid className="text-white" size={16} />
            </div>
            <span className="text-lg font-bold text-slate-100">TaskForge</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded text-slate-400 hover:text-slate-100"
            aria-label="Close sidebar"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Main
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="px-3 mt-5 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Admin
              </p>
              {adminItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Bottom user strip */}
        <div className="px-4 py-3 border-t border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
