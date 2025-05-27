// Dashboard 'My Courses' page.
import { mockCourses } from '../../data/index'; // Import mockCourses from data.js
import CourseCard from '../../components/Dashboard/CourseCard'; // Import CourseCard

const Courses = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Enrolled Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default Courses;