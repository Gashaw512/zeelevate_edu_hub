import Subheader from "../components/Subheader/Subheader";
import StudentDashboard from "../components/dashboard/StudentDashboard";
import Facilities from "../components/Facilities/Facilities";
import Footer from "../components/Footer/Footer";

const StudentDashboardPage = () => {
  return (
    <>
      <Subheader header="Our Courses" />
      <StudentDashboard />
      <Facilities />
      <Footer />
    </>
  );
};

export default StudentDashboardPage;
