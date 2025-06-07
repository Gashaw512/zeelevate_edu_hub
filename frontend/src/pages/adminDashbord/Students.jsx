// src/pages/admin/Students.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Students.css'; // We'll create this CSS file
import { getIdToken } from "firebase/auth";
import { auth } from "../../firebase/auth"; // adjust path as needed

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'enrollmentDate', direction: 'desc' });
  //const authToken = localStorage.getItem('token') || '';

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, selectedCourse, sortConfig]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
          const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    // Get fresh token from Firebase
    const authToken = await getIdToken(currentUser, true); 

      const response = await axios.get('http://localhost:3001/api/admin/students', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
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
            ? new Date(enrollment.enrollment_date._seconds * 1000)
            : null,
          classStartDate: enrollment.classStartDate || 'Not scheduled',
          classDuration: enrollment.classDuration || 'N/A',
          classLink: enrollment.classLink || 'N/A'
        }));
      });
      
      setStudents(formattedStudents);
      setError('');
    } catch (err) {
      setError('Failed to fetch students. Please try again.');
      toast.error('Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let result = [...students];
    
    // Filter by search term (email or course title)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        student.email.toLowerCase().includes(term) || 
        student.courseTitle.toLowerCase().includes(term)
      );
    }
    
    // Filter by course
    if (selectedCourse !== 'all') {
      result = result.filter(student => student.courseId === selectedCourse);
    }
    
    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredStudents(result);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getUniqueCourses = () => {
    const courses = {};
    students.forEach(student => {
      if (!courses[student.courseId]) {
        courses[student.courseId] = student.courseTitle;
      }
    });
    return courses;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && students.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-animation">
          <div className="loading-header"></div>
          <div className="loading-content"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="students-page">
       <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h1 className="page-title">Student Enrollments</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="controls-container">
        <div className="search-control">
          <input
            type="text"
            placeholder="Search by email or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-control">
          <label htmlFor="course-filter">Filter by Course:</label>
          <select
            id="course-filter"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="course-select"
          >
            <option value="all">All Courses</option>
            {Object.entries(getUniqueCourses()).map(([id, title]) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="enrollments-container">
        {filteredStudents.length === 0 ? (
          <div className="no-results">No matching enrollments found</div>
        ) : (
          <div className="table-responsive">
            <table className="enrollments-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('email')}>
                    Student Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('courseTitle')}>
                    Course {sortConfig.key === 'courseTitle' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('amountPaid')}>
                    Amount Paid {sortConfig.key === 'amountPaid' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('enrollmentDate')}>
                    Enrollment Date {sortConfig.key === 'enrollmentDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Class Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-email">{student.email}</div>
                      <div className="student-phone">{student.phone}</div>
                    </td>
                    <td>
                      <div className="course-title">{student.courseTitle}</div>
                      <div className="course-details">{student.courseDetails}</div>
                    </td>
                    <td className="amount-paid">
                      ${typeof student.amountPaid === 'number' 
                        ? student.amountPaid.toFixed(2) 
                        : student.amountPaid}
                    </td>
                    <td className="enrollment-date">
                      {formatDate(student.enrollmentDate)}
                    </td>
                    <td>
                      <div className="class-start-date">Starts: {student.classStartDate}</div>
                      <div className="class-duration">Duration: {student.classDuration}</div>
                    </td>
                    <td>
                      {student.classLink !== 'N/A' ? (
                        <a 
                          href={student.classLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="class-link"
                        >
                          Join Class
                        </a>
                      ) : (
                        <span className="no-link">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="summary-footer">
        Showing {filteredStudents.length} of {students.length} enrollments
      </div>
    </div>
  );
};

export default Students;