import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './program.css';
import { getIdToken } from "firebase/auth";
import { auth } from "../../firebase/auth"; 

const Program = () => {
  const [programs, setProgram] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    badge: '',
    status: 'available',
    classStartDate: '',
    registrationDeadline: '',
    order: 1,
    features: []
  });
  const [featuresText, setFeaturesText] = useState(''); // Single textarea for features
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [newFeatureInput, setNewFeatureInput] = useState('');

  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      const token = await getIdToken(currentUser, true); 
      setAuthToken(token);
      fetchProgram(token);
    };
    fetchData();
  }, []);

  const fetchProgram = async (token = authToken) => {
    try {
      setLoading(true);

      const response = await axios.get('http://localhost:3001/api/admin/programs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProgram(response.data.programs.map(program => ({
        id: program.programId,
        title: program.title || '',
        price: program.price || '',
        badge: program.badge || '',
        status: program.status || 'available',
        classStartDate: program.classStartDate || '',
        registrationDeadline: program.registrationDeadline || '',
        order: program.order || 1,
        features: program.features || []
      })));
      
      setError('');
    } catch (err) {
      setError('Failed to fetch programs. Please try again.');
      toast.error('Failed to fetch programs');
      console.error('Error fetching programs:', err);
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

  const handleFeaturesChange = (e) => {
    const text = e.target.value;
    setFeaturesText(text);
    // Convert text to array (split by new lines and filter out empty lines)
    const featuresArray = text.split('\n').filter(line => line.trim() !== '');
    setFormData(prev => ({
      ...prev,
      features: featuresArray
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      
      const submissionData = {
        ...formData,
        // Features are already updated via handleFeaturesChange
      };

      if (editingId) {
        await axios.put(
          `http://localhost:3001/api/admin/programs/${editingId}`,
          submissionData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.info('Program updated successfully!');
      } else {
        await axios.post(
          'http://localhost:3001/api/admin/add-program',
          submissionData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.info('Program added successfully!');
      }
      
      // Reset form
      setFormData({
        title: '',
        price: '',
        badge: '',
        status: 'available',
        classStartDate: '',
        registrationDeadline: '',
        order: 1,
        features: []
      });
      setFeaturesText('');
      setEditingId(null);
      fetchProgram();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Operation failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error saving program:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (program) => {
    setFormData({
      title: program.title,
      price: program.price,
      badge: program.badge,
      status: program.status || 'available',
      classStartDate: program.classStartDate,
      registrationDeadline: program.registrationDeadline,
      order: program.order || 1,
      features: program.features || []
    });
    // Convert features array to text (one per line)
    setFeaturesText(program.features.join('\n'));
    setEditingId(program.id);
    document.querySelector('.course-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const confirmDelete = (program) => {
    setProgramToDelete(program);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!programToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3001/api/admin/programs/${programToDelete.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.info('Program deleted successfully');
      fetchProgram();
    } catch (err) {
      const errorMsg = 'Failed to delete program. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error deleting program:', err);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setProgramToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProgramToDelete(null);
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
            <p>Are you sure you want to delete the program "{programToDelete?.title}"?</p>
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
      
      <h1 className="courses-title">Manage Program</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="course-form">
        <h2 className="form-title">
          {editingId ? 'Edit Program' : 'Add New Program'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid three-column">
            <div className="form-group">
              <label className="form-label">Program Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
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
            <div className="form-group">
              <label className="form-label">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="form-input"
                required
                min="1"
              />
            </div>
          </div>
          
          <div className="form-grid">

              <div className="form-group">
            <label className="form-label">Badge</label>
            <textarea
              name="badge"
              value={formData.badge}
              onChange={handleInputChange}
              className="form-textarea"
              rows="3"
              required
            />
          </div>
          
       <div className="form-group">
        <label className="form-label">Features</label>
        <div className="feature-input-wrapper">
            <input
            type="text"
            value={newFeatureInput}
            onChange={(e) => setNewFeatureInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && newFeatureInput.trim() !== '') {
                e.preventDefault();
                setFormData(prev => ({
                    ...prev,
                    features: [...prev.features, newFeatureInput.trim()]
                }));
                setNewFeatureInput('');
                }
            }}
            className="form-input"
            placeholder="Type and press Enter to add"
            />
            <div className="feature-tags">
            {formData.features.map((feature, index) => (
                <span className="feature-tag" key={index}>
                {feature}
                <button
                    type="button"
                    className="remove-tag-btn"
                    onClick={() => {
                    const updated = formData.features.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, features: updated }));
                    }}
                >
                    &times;
                </button>
                </span>
            ))}
            </div>
        </div>
        </div>
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
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="available">Available</option>
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
              {loading ? 'Processing...' : editingId ? 'Update Program' : 'Add Program'}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    title: '',
                    badge: '',
                    price: '',
                    registrationDeadline: '',
                    classStartDate: '',
                    status: 'available',
                    order: 1,
                    features: []
                  });
                  setFeaturesText('');
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
        <h2 className="list-title">Current Programs</h2>
        {loading && programs.length === 0 ? (
          <div className="loading-placeholder">Loading programs...</div>
        ) : programs.length === 0 ? (
          <div className="empty-placeholder">No programs found</div>
        ) : (
          <div className="table-container">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Registration Deadline</th>
                  <th>Features</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map(program => (
                  <tr key={program.id}>
                    <td>{program.order || 1}</td>
                    <td>{program.title || 'Untitled'}</td>
                    <td>{program.price ? `$${program.price}` : 'Free'}</td>
                    <td>
                      <span className={`status-badge ${program.status === 'available' ? 'active' : 'inactive'}`}>
                        {program.status || 'available'}
                      </span>
                    </td>
                    <td>{program.classStartDate || 'Not set'}</td>
                    <td>{program.registrationDeadline || 'Not set'}</td>
                    <td>
                      <ul className="features-list">
                        {program.features && program.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="action-buttons">
                      <button
                        onClick={() => handleEdit(program)}
                        className="edit-btn"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(program)}
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

export default Program;