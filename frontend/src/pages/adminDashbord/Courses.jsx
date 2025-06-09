import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Courses.css';
import { getIdToken } from "firebase/auth";
import { auth } from "../../firebase/auth"; // adjust path as needed

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseTitle: '',
    courseDetails: '',
    price: '',
    registrationDeadline: '',
    classStartDate: '',
    classDuration: '',
    classLink: '',
    status: 'active' // default status
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  //const authToken = localStorage.getItem('token') || '';
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      // Get fresh token from Firebase
      const token = await getIdToken(currentUser, true); 
      setAuthToken(token);
      fetchCourses(token);
    };
    fetchData();
  }, []);

  const fetchCourses = async (token = authToken) => {
    try {
      setLoading(true);

      const response = await axios.get('http://localhost:3001/api/admin/courses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCourses(response.data.courses.map(course => ({
        id: course.courseId,
        courseTitle: course.courseTitle || '',
        courseDetails: course.courseDetails || '',
        price: course.price || '',
        registrationDeadline: course.registrationDeadline || '',
        classStartDate: course.classStartDate || '',
        classDuration: course.classDuration || '',
        classLink: course.classLink || '',
        status: course.status || 'active'
      })));
      
      setError('');
    } catch (err) {
      setError('Failed to fetch courses. Please try again.');
      toast.error('Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      if (editingId) {
        await axios.put(
          `http://localhost:3001/api/admin/courses/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.info('Course updated successfully!');
      } else {
        await axios.post(
          'http://localhost:3001/api/admin/add-course',
          formData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.info('Course added successfully!');
      }
      
      setFormData({
        courseTitle: '',
        courseDetails: '',
        price: '',
        registrationDeadline: '',
        classStartDate: '',
        classDuration: '',
        classLink: '',
        status: 'active' // reset to default
      });
      setEditingId(null);
      fetchCourses();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Operation failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error saving course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setFormData({
      courseTitle: course.courseTitle,
      courseDetails: course.courseDetails,
      price: course.price,
      registrationDeadline: course.registrationDeadline,
      classStartDate: course.classStartDate,
      classDuration: course.classDuration,
      classLink: course.classLink,
      status: course.status || 'active' 
    });
    setEditingId(course.id);
    // Scroll to form
    document.querySelector('.course-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const confirmDelete = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3001/api/admin/courses/${courseToDelete.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.info('Course deleted successfully');
      fetchCourses();
    } catch (err) {
      const errorMsg = 'Failed to delete course. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error deleting course:', err);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setCourseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  return (
    <div className="courses-container">
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete the course "{courseToDelete?.courseTitle}"?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                onClick={cancelDelete}
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="delete-btn"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <h1 className="courses-title">Manage Courses</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Course Form */}
      <div className="course-form">
        <h2 className="form-title">
          {editingId ? 'Edit Course' : 'Add New Course'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Course Title</label>
              <input
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="form-input"
                required
                step="0.01"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Course Details</label>
            <textarea
              name="courseDetails"
              value={formData.courseDetails}
              onChange={handleInputChange}
              className="form-textarea"
              rows="3"
              required
            />
          </div>
          
          <div className="form-grid three-column">
            <div className="form-group">
              <label className="form-label">Registration Deadline</label>
              <input
                type="date"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Class Start Date</label>
              <input
                type="date"
                name="classStartDate"
                value={formData.classStartDate}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Class Duration (days)</label>
              <input
                type="number"
                name="classDuration"
                value={formData.classDuration}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>
          
          <div className="form-grid two-column-uneven">
            <div className="form-group">
              <label className="form-label">Class Link</label>
              <input
                type="url"
                name="classLink"
                value={formData.classLink}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className={`submit-btn ${loading ? 'disabled' : ''}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : editingId ? 'Update Course' : 'Add Course'}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    courseTitle: '',
                    courseDetails: '',
                    price: '',
                    registrationDeadline: '',
                    classStartDate: '',
                    classDuration: '',
                    classLink: ''
                  });
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Courses List */}
      <div className="courses-list">
        <h2 className="list-title">Current Courses</h2>
        {loading && courses.length === 0 ? (
          <div className="loading-placeholder">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="empty-placeholder">No courses found</div>
        ) : (
          <div className="table-container">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td>{course.courseTitle || 'Untitled'}</td>
                    <td>{course.price ? `$${course.price}` : 'Free'}</td>
                    <td>
                      <span className={`status-badge ${course.status === 'active' ? 'active' : 'inactive'}`}>
                        {course.status || 'active'}
                      </span>
                    </td>
                    <td>{course.classStartDate || 'Not set'}</td>
                    <td>{course.classDuration ? `${course.classDuration} days` : 'Not set'}</td>
                    <td className="action-buttons">
                      <button
                        onClick={() => handleEdit(course)}
                        className="edit-btn"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(course)}
                        className="delete-btn"
                        disabled={loading}
                      >
                        Delete
                      </button>
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

export default Courses;