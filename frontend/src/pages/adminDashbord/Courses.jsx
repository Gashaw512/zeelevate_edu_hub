import { useState, useEffect } from 'react';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseTitle: '',
    courseDetails: '',
    price: '',
    registrationDeadline: '',
    classStartDate: '',
    classDuration: '',
    classLink: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const authToken = localStorage.getItem('token') || '';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/admin/courses', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
    setCourses(Array.isArray(response.data.courses) ? response.data.courses : []);
      setError('');
    } catch (err) {
      setError('Failed to fetch courses. Please try again.');
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
      if (editingId) {
        // Update existing course
        await axios.put(
          `http://localhost:3001/api/admin/courses/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );
      } else {
        // Add new course
        await axios.post(
          'http://localhost:3001/api/admin/add-course',
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );
      }
      
      // Reset form and refresh courses
      setFormData({
        courseTitle: '',
        courseDetails: '',
        price: '',
        registrationDeadline: '',
        classStartDate: '',
        classDuration: '',
        classLink: ''
      });
      setEditingId(null);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please try again.');
      console.error('Error saving course:', err);
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
      classLink: course.classLink
    });
    setEditingId(course.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await axios.delete(`http://localhost:3001/api/admin/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      fetchCourses();
    } catch (err) {
      setError('Failed to delete course. Please try again.');
      console.error('Error deleting course:', err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Courses</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Course Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Course' : 'Add New Course'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                step="0.01"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Details</label>
            <textarea
              name="courseDetails"
              value={formData.courseDetails}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows="3"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
              <input
                type="date"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Start Date</label>
              <input
                type="date"
                name="classStartDate"
                value={formData.classStartDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Duration (days)</label>
              <input
                type="number"
                name="classDuration"
                value={formData.classDuration}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Link</label>
            <input
              type="url"
              name="classLink"
              value={formData.classLink}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
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
              className="ml-2 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
      
      {/* Courses List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Current Courses</h2>
        {loading && courses.length === 0 ? (
          <div className="text-center py-4">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-4">No courses found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Title</th>
                  <th className="py-2 px-4 border-b">Price</th>
                  <th className="py-2 px-4 border-b">Start Date</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td className="py-2 px-4 border-b">{course.courseTitle}</td>
                    <td className="py-2 px-4 border-b">${course.price}</td>
                    <td className="py-2 px-4 border-b">{course.classStartDate}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleEdit(course)}
                        className="bg-yellow-500 text-white py-1 px-2 rounded mr-2 hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
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