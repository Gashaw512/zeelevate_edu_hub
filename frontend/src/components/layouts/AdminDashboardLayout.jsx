import { Link, Outlet } from 'react-router-dom';

const AdminDashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link to="/admin/dashboard" className="block py-2 px-4 rounded hover:bg-blue-700">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/courses" className="block py-2 px-4 rounded hover:bg-blue-700">
                Manage Courses
              </Link>
            </li>
            <li>
              <Link to="/admin/students" className="block py-2 px-4 rounded hover:bg-blue-700">
                View Students
              </Link>
            </li>
            <li>
              <button className="block py-2 px-4 rounded hover:bg-blue-700 w-full text-left">
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;