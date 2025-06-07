// src/pages/admin/Students.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const authToken = localStorage.getItem('token') || '';


  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/admin/students', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      // Transform the API response to match our expected format
      const formattedStudents = response.data.students.flatMap(student => {
        return student.enrollments.map(enrollment => ({
          id: enrollment.id,
          uid: student.uid,
          email: student.email,
          phone: student.phone || 'N/A',
          courseId: enrollment.course_id,
          courseTitle: enrollment.course_title,
          courseDetails: enrollment.courseDetails || 'No details available',
          amountPaid: enrollment.amount_paid || 0,
          enrollmentDate: enrollment.enrollment_date 
            ? new Date(enrollment.enrollment_date._seconds * 1000).toLocaleDateString()
            : 'N/A',
          classStartDate: enrollment.classStartDate || 'Not scheduled',
          classDuration: enrollment.classDuration || 'N/A',
          classLink: enrollment.classLink || 'N/A'
        }));
      });
      
      setStudents(formattedStudents);
      setError('');
    } catch (err) {
      setError('Failed to fetch students. Please try again.');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Student Registrations</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        {students.length === 0 ? (
          <div className="text-center py-4">No student enrollments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-3 px-4 border-b text-left">Student Email</th>
                  <th className="py-3 px-4 border-b text-left">Course</th>
                  <th className="py-3 px-4 border-b text-left">Amount Paid</th>
                  <th className="py-3 px-4 border-b text-left">Enrollment Date</th>
                  <th className="py-3 px-4 border-b text-left">Start Date</th>
                  <th className="py-3 px-4 border-b text-left">Class Link</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">{student.email}</td>
                    <td className="py-3 px-4 border-b">
                      <div className="font-medium">{student.courseTitle}</div>
                      <div className="text-sm text-gray-500">{student.courseDetails}</div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      ${typeof student.amountPaid === 'number' 
                        ? student.amountPaid.toFixed(2) 
                        : student.amountPaid}
                    </td>
                    <td className="py-3 px-4 border-b">{student.enrollmentDate}</td>
                    <td className="py-3 px-4 border-b">{student.classStartDate}</td>
                    <td className="py-3 px-4 border-b">
                      {student.classLink !== 'N/A' ? (
                        <a 
                          href={student.classLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Join Class
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;