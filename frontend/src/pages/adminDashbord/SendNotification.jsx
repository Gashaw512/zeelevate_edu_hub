import React, { useState, useEffect } from "react";
import axios from "axios";
import './SendNotification.module.css';
import { auth } from "../../firebase/auth"; 
import { getIdToken } from "firebase/auth"; // Import getIdToken to fetch the token
import { toast, ToastContainer } from 'react-toastify';



function SendNotification() {
  const [notificationType, setNotificationType] = useState("global");
  const [message, setMessage] = useState("");
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
    const [authToken, setAuthToken] = useState('');


    useEffect(() => {
      const fetchData = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("User not authenticated");
  
        // Get fresh token from Firebase
        const token = await getIdToken(currentUser, true); 
        setAuthToken(token);
      };
      fetchData();
    }, []);

  useEffect(() => {
    if (notificationType === "course") {
      axios.get("http://localhost:3001/api/admin/courses" , {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
        .then(res => setCourses(res.data.courses || []))
        .catch(() => setCourses([]));
    } else if (notificationType === "student") {
      axios.get("http://localhost:3001/api/admin/students"  , {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
        .then(res => setStudents(res.data.students || []))
        .catch(() => setStudents([]));
    }
  }, [notificationType]);

  const handleSubmit = async () => {
    if (!message.trim()) return setFeedback("Please enter a message.");

    let payload = { message };
    if (notificationType === "global") {
      payload.isGlobal = true;
    } else if (notificationType === "course" && selectedCourse) {
      payload.courseId = selectedCourse;
    } else if (notificationType === "student" && selectedStudent) {
      payload.recipientId = selectedStudent;
    } else {
      return setFeedback("Please complete the required fields.");
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:3001/api/admin/send-notification", payload, { headers: { Authorization: `Bearer ${authToken}` } });
      toast.info("✅ Notification sent successfully!");
      setMessage("");
      setSelectedCourse("");
      setSelectedStudent("");
    } catch (error) {
      toast.info("❌ Failed to send notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="notification-dashboard">
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
      toastClassName="custom-toast"
      progressClassName="custom-progress"
    />
    
    <div className="notification-card">
      <h2 className="notification-title">
        <span className="notification-icon">📢</span>
        Send Notification
      </h2>

      <div className="notification-controls">
        <div className="radio-tile-group">
          <div className={`radio-tile ${notificationType === "global" ? "selected" : ""}`}>
            <label>
              <input
                type="radio"
                value="global"
                checked={notificationType === "global"}
                onChange={() => setNotificationType("global")}
              />
              <div className="radio-content">
                <span className="radio-icon">🌎</span>
                <span className="radio-label">Global</span>
              </div>
            </label>
          </div>
          
          <div className={`radio-tile ${notificationType === "course" ? "selected" : ""}`}>
            <label>
              <input
                type="radio"
                value="course"
                checked={notificationType === "course"}
                onChange={() => setNotificationType("course")}
              />
              <div className="radio-content">
                <span className="radio-icon">📚</span>
                <span className="radio-label">Course</span>
              </div>
            </label>
          </div>
          
          <div className={`radio-tile ${notificationType === "student" ? "selected" : ""}`}>
            <label>
              <input
                type="radio"
                value="student"
                checked={notificationType === "student"}
                onChange={() => setNotificationType("student")}
              />
              <div className="radio-content">
                <span className="radio-icon">👨‍🎓</span>
                <span className="radio-label">Student</span>
              </div>
            </label>
          </div>
        </div>

        {notificationType === "course" && (
          <div className="select-wrapper">
            <select
              className="custom-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select a Course</option>
              {courses.map((c, index) =>
                c.courseId && (
                  <option key={index} value={c.courseId}>
                    {c.courseTitle || c.name}
                  </option>
                )
              )}
            </select>
            <span className="select-arrow">▼</span>
          </div>
        )}

        {notificationType === "student" && (
          <div className="select-wrapper">
            <select
              className="custom-select"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">Select a Student</option>
              {students.map((s, index) => (
                <option key={index} value={s.uid}>
                  {s.email}
                </option>
              ))}
            </select>
            <span className="select-arrow">▼</span>
          </div>
        )}
        
        <div className="message-box">
          <textarea
            className="message-input"
            placeholder="Enter your notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5"
          />
          <div className="message-counter">{message.length}/500</div>
        </div>
        
        <button 
          className={`send-button ${loading ? "sending" : ""}`} 
          onClick={handleSubmit} 
          disabled={loading}
        >
          <span className="button-text">
            {loading ? "Sending..." : "Send Notification"}
          </span>
          <span className="button-icon">
            {loading ? <div className="spinner"></div> : "✉️"}
          </span>
        </button>

        {feedback && (
          <div className={`feedback ${feedback.type || "info"}`}>
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  </div>
);
}

export default SendNotification;
