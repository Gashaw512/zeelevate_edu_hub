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
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'enrollmentDate', direction: 'desc' });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, selectedProgram, sortConfig]);

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
          programId: enrollment.programId,
          programTitle: enrollment.programTitle,
          status: enrollment.status || 'N/A',
          enrollmentDate: enrollment.enrollmentDate 
            ? new Date(enrollment.enrollmentDate._seconds * 1000)
            : null,
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
    
    // Filter by search term (email or program title)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        student.email.toLowerCase().includes(term) || 
        student.programTitle.toLowerCase().includes(term)
      );
    }
    
    // Filter by program
    if (selectedProgram !== 'all') {
      result = result.filter(student => student.programId === selectedProgram);
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

  const getUniquePrograms = () => {
    const programs = {};
    students.forEach(student => {
      if (!programs[student.programId]) {
        programs[student.programId] = student.programTitle;
      }
    });
    return programs;
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
            placeholder="Search by email or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-control">
          <label htmlFor="program-filter">Filter by Program:</label>
          <select
            id="program-filter"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="program-select"
          >
            <option value="all">All Programs</option>
            {Object.entries(getUniquePrograms()).map(([id, title]) => (
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
                  <th onClick={() => requestSort('programTitle')}>
                    Program {sortConfig.key === 'programTitle' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('status')}>
                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('enrollmentDate')}>
                    Enrollment Date {sortConfig.key === 'enrollmentDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
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
                      <div className="program-title">{student.programTitle}</div>
                    </td>
                    <td className="status">
                      {student.status}
                    </td>
                    <td className="enrollment-date">
                      {formatDate(student.enrollmentDate)}
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