import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Columns, FileInput, FileText, BarChart2, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
  { to: '/columns', icon: <Columns size={20} />, label: 'Column Builder' },
  { to: '/data-entry', icon: <FileInput size={20} />, label: 'Data Entry' },
  { to: '/exports', icon: <FileText size={20} />, label: 'Export History' },
  { to: '/reports', icon: <BarChart2 size={20} />, label: 'Reports' },
];

const Sidebar: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <button
          onClick={toggleMobileSidebar}
          className="p-3 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center"
        >
          {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 md:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:z-0
        `}
      >
        <div className="h-full flex flex-col border-r border-gray-200">
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">DataCollect</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150
                  `}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              DataCollect v0.1.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;