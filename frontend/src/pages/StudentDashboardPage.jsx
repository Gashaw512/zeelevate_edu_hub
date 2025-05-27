
import { Link } from 'react-router-dom';
import Subheader from "../components/Subheader/Subheader";
import Footer from "../components/Footer/Footer";

const StudentDashboardPage = () => {
  return (
    <>
      <Subheader header="Welcome to the Zeelevate Student Area" />
      <div className="container mx-auto py-8">
        <p className="text-lg text-gray-700 mb-4">
          You are now in the general student area of the Zeelevate platform.
          From here, you can access your personalized learning dashboard to view
          your courses, track your progress, see assignments, and receive
          important notifications.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          Click the button below to go directly to your dashboard.
        </p>
        <Link to="/student/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go to Dashboard
        </Link>
        {/* You can add more general information or introductory content here if needed */}
      </div>
      <Footer />
    </>
  );
};

export default StudentDashboardPage;
