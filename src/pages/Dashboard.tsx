import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, FileText, FileInput, Columns, ArrowRight } from 'lucide-react';
import Card from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';
import { useColumns } from '../contexts/ColumnContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { columns } = useColumns();

  // Mock data for dashboard stats
  const stats = [
    { id: 1, name: 'Total Entries', value: '128', icon: <FileText className="h-6 w-6 text-blue-500" /> },
    { id: 2, name: 'Excel Exports', value: '24', icon: <FileText className="h-6 w-6 text-green-500" /> },
    { id: 3, name: 'Custom Columns', value: columns.length.toString(), icon: <Columns className="h-6 w-6 text-purple-500" /> },
  ];

  // Mock data for recent activity
  const recentActivity = [
    { id: 1, action: 'Excel Export', date: '2025-07-02', user: 'Admin' },
    { id: 2, action: 'Added 5 new entries', date: '2025-07-02', user: 'Admin' },
    { id: 3, action: 'Modified column configuration', date: '2025-07-01', user: 'Admin' },
    { id: 4, action: 'Excel Export', date: '2025-07-01', user: 'Admin' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.username}! Here's your data collection overview.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/data-entry"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FileInput className="mr-2 h-4 w-4" />
            New Data Entry
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.id} className="overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-gray-50">
                {stat.icon}
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Configure Columns" className="hover:shadow-lg transition-all duration-200">
          <p className="text-gray-600 mb-4">
            Define custom columns to match your data collection needs.
          </p>
          <Link
            to="/columns"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Configure now
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Card>
        
        <Card title="Enter Data" className="hover:shadow-lg transition-all duration-200">
          <p className="text-gray-600 mb-4">
            Use your custom columns to quickly input and save data.
          </p>
          <Link
            to="/data-entry"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Enter data
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Card>
        
        <Card title="View Reports" className="hover:shadow-lg transition-all duration-200">
          <p className="text-gray-600 mb-4">
            Analyze your collected data with visual reports and statistics.
          </p>
          <Link
            to="/reports"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            View reports
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.user} • {activity.date}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <Link
            to="/reports"
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View all activity
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;