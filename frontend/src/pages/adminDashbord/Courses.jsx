import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Courses.css';
import { getIdToken } from "firebase/auth";
import { auth } from "../../firebase/auth"; 

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    difficulty: 'Beginner',
    imageUrl: '',
    classLink: '',
    status: 'active',
    order: '',
    programIds: []
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      const token = await getIdToken(currentUser, true); 
      setAuthToken(token);
      fetchPrograms(token);
      fetchCourses(token);
    };
    fetchData();
  }, []);

  const fetchPrograms = async (token = authToken) => {
    try {
      const response = await axios.get('http://localhost:3001/api/admin/programs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPrograms(response.data.programs);
    } catch (err) {
      setError('Failed to fetch programs. Please try again.');
      console.error('Error fetching programs:', err);
    }
  };

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
        name: course.name || '',
        description: course.description || '',
        duration: course.duration || '',
        difficulty: course.difficulty || 'Beginner',
        imageUrl: course.imageUrl || '',
        classLink: course.classLink || '',
        status: course.status || 'active',
        order: course.order || '',
        programIds: course.programIds || [],
        programNames: course.programNames || []
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

  const handleProgramSelection = (programId) => {
    setFormData(prev => {
      if (prev.programIds.includes(programId)) {
        return {
          ...prev,
          programIds: prev.programIds.filter(id => id !== programId)
        };
      } else {
        return {
          ...prev,
          programIds: [...prev.programIds, programId]
        };
      }
    });
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
        toast.success('Course updated successfully!');
      } else {
        await axios.post(
          'http://localhost:3001/api/admin/add-course',
          formData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.success('Course added successfully!');
      }
      
      setFormData({
        name: '',
        description: '',
        duration: '',
        difficulty: 'Beginner',
        imageUrl: '',
        classLink: '',
        status: 'active',
        order: '',
        programIds: []
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
      name: course.name,
      description: course.description,
      duration: course.duration,
      difficulty: course.difficulty,
      imageUrl: course.imageUrl,
      classLink: course.classLink,
      status: course.status || 'active',
      order: course.order,
      programIds: course.programIds || []
    });
    setEditingId(course.id);
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

  const filteredCourses = selectedProgramFilter 
    ? courses.filter(course => course.programIds.includes(selectedProgramFilter))
    : courses;

  const getProgramNames = (programIds) => {
    return programIds.map(id => {
      const program = programs.find(p => p.programId === id);
      return program ? program.title : 'Unknown Program';
    }).join(', ');
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
      
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete the course "{courseToDelete?.name}"?</p>
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
      
      <div className="course-form">
        <h2 className="form-title">
          {editingId ? 'Edit Course' : 'Add New Course'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Course Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              rows="3"
              required
            />
          </div>
          
          <div className="form-grid three-column">
            <div className="form-group">
              <label className="form-label">Duration (days)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
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
          
          <div className="form-grid two-column-uneven">
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
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
          </div>
          
          <div className="form-group">
            <label className="form-label">Programs</label>
            <div className="programs-checkbox-container">
              {programs.map(program => (
                <div key={program.programId} className="program-checkbox">
                  <input
                    type="checkbox"
                    id={`program-${program.programId}`}
                    checked={formData.programIds.includes(program.programId)}
                    onChange={() => handleProgramSelection(program.programId)}
                  />
                  <label htmlFor={`program-${program.programId}`}>
                    {program.title}
                  </label>
                </div>
              ))}
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
                    name: '',
                    description: '',
                    duration: '',
                    difficulty: 'Beginner',
                    imageUrl: '',
                    classLink: '',
                    status: 'active',
                    order: '',
                    programIds: []
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
      
      <div className="courses-list">
        <div className="list-header">
          <h2 className="list-title">Current Courses</h2>
          <div className="program-filter">
            <label htmlFor="program-filter">Filter by Program:</label>
            <select
              id="program-filter"
              value={selectedProgramFilter}
              onChange={(e) => setSelectedProgramFilter(e.target.value)}
            >
              <option value="">All Programs</option>
              {programs.map(program => (
                <option key={program.programId} value={program.programId}>
                  {program.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {loading && courses.length === 0 ? (
          <div className="loading-placeholder">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="empty-placeholder">
            {selectedProgramFilter ? 'No courses found in selected program' : 'No courses found'}
          </div>
        ) : (
          <div className="table-container">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Programs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map(course => (
                  <tr key={course.id}>
                    <td>{course.name || 'Untitled'}</td>
                    <td className="description-cell">{course.description || 'No description'}</td>
                    <td>{course.duration ? `${course.duration} days` : 'Not set'}</td>
                    <td>{course.difficulty || 'Not set'}</td>
                    <td>
                      <span className={`status-badge ${course.status === 'active' ? 'active' : 'inactive'}`}>
                        {course.status || 'active'}
                      </span>
                    </td>
                    <td>{getProgramNames(course.programIds)}</td>
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