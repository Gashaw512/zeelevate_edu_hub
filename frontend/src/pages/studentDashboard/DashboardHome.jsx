import  { useMemo } from 'react'; 
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEnrolledCourses } from '../../context/EnrolledCoursesContext'; 
import useNotifications from '../../hooks/useNotifications'; 

import LoadingSpinner from '../../components/common/LoadingSpinner';

// Icons from Lucide React
import { BookOpen, Bell, User, ChevronRight, Settings, GraduationCap, XCircle, Clock } from 'lucide-react';

// CSS Modules
import styles from './DashboardHome.module.css';

const DashboardHome = () => {
    
    const { user, loading: authLoading } = useAuth(); // Auth loading state
    const {
        enrolledCourses,
        loadingEnrolledCourses,
        enrolledCoursesError,
        refetchEnrolledCourses // Function to re-trigger course fetch
    } = useEnrolledCourses();

    const {
        notifications,
        loading: notificationsLoading,
        error: notificationsError
    } = useNotifications(user?.uid); // Notifications hook depends on user ID

    // --- Memoized Values for Performance ---

    // Calculate unread notification count
    const unreadNotificationsCount = useMemo(() => {
        // Handle loading/error states for notifications gracefully
        if (notificationsLoading || notificationsError || !notifications) return 0;
        return notifications.filter(n => !n.read).length;
    }, [notifications, notificationsLoading, notificationsError]); // Dependencies for re-calculation

    // Derive active courses from the fetched enrolled courses
    const activeCourses = useMemo(() => {
        // Ensure enrolledCourses is an array before filtering
        if (!enrolledCourses || !Array.isArray(enrolledCourses)) return [];
        // Assuming 'active' is a valid status string from your backend
        return enrolledCourses.filter(course => course.status === 'active');
    }, [enrolledCourses]); // Dependency on enrolledCourses

    // --- Combined Loading State ---
    // Show a full-page spinner if any primary data source is loading
    if (authLoading || loadingEnrolledCourses || notificationsLoading) {
        return (
            <div className={styles.fullPageStatusContainer}>
                <LoadingSpinner message="Loading your dashboard..." />
            </div>
        );
    }

    // --- Combined Error State ---
    // Display comprehensive error messages if any data fetch fails
    if (notificationsError || enrolledCoursesError) {
        return (
            <div className={styles.errorContainer}>
                <XCircle size={48} className={styles.errorIcon} />
                <h2 className={styles.errorHeading}>Oops! Something Went Wrong.</h2>
                {/* Display specific error messages if available */}
                {notificationsError && (
                    <p className={styles.errorText}>
                        Notifications: {notificationsError.message || String(notificationsError)}
                    </p>
                )}
                {enrolledCoursesError && (
                    <p className={styles.errorText}>
                        Courses: {enrolledCoursesError.message || String(enrolledCoursesError)}
                    </p>
                )}
                <p className={styles.errorText}>
                    We couldn't load all parts of your dashboard. Please try again.
                </p>
                {/* Provide a retry mechanism for enrolled courses specifically if that's the primary issue */}
                {enrolledCoursesError && ( // Only show retry if courses errored
                    <button onClick={refetchEnrolledCourses} className={styles.retryButton}>
                        Retry Courses
                    </button>
                )}
                {/* You might want a general "Retry All" or "Refresh Page" button here too */}
            </div>
        );
    }

    // --- User Name for Display ---
    // Provides a fallback for display name
    const userName = user?.displayName || user?.email?.split('@')[0] || 'Student';

    // --- Main Dashboard Render ---
    return (
        <div className={styles.dashboardContainer}>
            {/* Welcome Section */}
            <div className={styles.welcomeSection}>
                <h1 className={styles.welcomeHeading}>
                    Ready to learn, <span className={styles.userNameHighlight}>{userName}</span>?
                </h1>
                <p className={styles.welcomeSubtitle}>
                    Pick up where you left off or explore new opportunities.
                </p>
                {/* Conditionally render "Continue Learning" button if there are active courses */}
                {activeCourses.length > 0 && (
                    <Link to={`/student/dashboard/courses/${activeCourses[0].courseId}`} className={styles.primaryActionButton}>
                        <GraduationCap size={20} /> Continue Learning
                    </Link>
                )}
            </div>

            {/* Overview Cards Grid */}
            <div className={styles.cardsGrid}>
                {/* Enrolled Courses Card */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <BookOpen className={styles.cardIconBlue} size={32} />
                        <h2 className={styles.cardTitle}>My Courses</h2>
                    </div>
                    <p className={styles.cardValue}>{enrolledCourses.length}</p>
                    <p className={styles.cardDescription}>
                        {enrolledCourses.length === 1 ? 'course enrolled' : 'courses enrolled'}
                    </p>
                    <Link to="/student/dashboard/courses" className={styles.cardLink}>
                        View All Courses <ChevronRight size={18} className={styles.linkIcon} />
                    </Link>
                </div>

                {/* Active Courses Card */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <Clock className={styles.cardIconOrange} size={32} />
                        <h2 className={styles.cardTitle}>In Progress</h2>
                    </div>
                    <p className={styles.cardValue}>{activeCourses.length}</p>
                    <p className={styles.cardDescription}>
                        {activeCourses.length === 1 ? 'course currently active' : 'courses currently active'}
                    {/* Consider displaying progress bar here for active courses or leading to one */}
                    </p>
                    <Link to="/student/dashboard/courses?filter=active" className={styles.cardLink}>
                        Go to Active <ChevronRight size={18} className={styles.linkIcon} />
                    </Link>
                </div>

                {/* Unread Notifications Card */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <Bell className={styles.cardIconAccent} size={32} />
                        <h2 className={styles.cardTitle}>Notifications</h2>
                    </div>
                    <p className={styles.cardValue}>{unreadNotificationsCount}</p>
                    <p className={styles.cardDescription}>
                        {unreadNotificationsCount === 1 ? 'unread message' : 'unread messages'}
                    </p>
                    <Link to="/student/dashboard/notifications" className={styles.cardLink}>
                        Check Notifications <ChevronRight size={18} className={styles.linkIcon} />
                    </Link>
                </div>
            </div>

            {/* Latest Activity / Progress Section */}
            <div className={styles.latestActivitySection}>
                <h2 className={styles.latestActivityTitle}>Your Progress at a Glance</h2>
                {enrolledCourses.length > 0 ? (
                    <div className={styles.activityList}>
                       
                        {enrolledCourses.slice(0, 3).map(course => (
                            <div key={course.id} className={styles.activityItem}>
                                <span className={styles.activityCourseTitle}>{course.title}</span>
                                <span className={`${styles.activityStatus} ${styles[course.status || 'unknown']}`}>
                                 
                                    {course.status ? (course.status.charAt(0).toUpperCase() + course.status.slice(1)) : 'N/A'}
                                </span>
                               
                                {typeof course.progress === 'number' && course.progress > 0 && (
                                    <span className={styles.activityProgress}>({course.progress}%)</span>
                                )}
                                <Link to={`/student/dashboard/courses/${course.courseId}`} className={styles.activityLink}>
                                    Go to Course <ChevronRight size={16} />
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Empty state for no enrolled courses
                    <div className={styles.emptyState}>
                        <p>You haven't enrolled in any courses yet. Start your learning journey today!</p>
                        <Link to="/programs" className={styles.enrollNowButton}>Explore Programs</Link>
                    </div>
                )}
            </div>

            {/* Quick Links / Action Section */}
            <div className={styles.quickActionsSection}>
                <h2 className={styles.quickActionsTitle}>Quick Actions</h2>
                <div className={styles.quickActionsGrid}>
                    <Link
                        to="/student/dashboard/courses"
                        className={styles.quickActionLink}
                    >
                        <span><BookOpen size={20} className={styles.actionLinkIcon} /> Browse Courses</span>
                        <ChevronRight size={20} />
                    </Link>
                    <Link
                        to="/student/dashboard/profile"
                        className={styles.quickActionLink}
                    >
                        <span><User size={20} className={styles.actionLinkIcon} /> Edit Profile</span>
                        <ChevronRight size={20} />
                    </Link>
                    <Link
                        to="/student/dashboard/settings"
                        className={styles.quickActionLink}
                    >
                        <span><Settings size={20} className={styles.actionLinkIcon} /> Adjust Settings</span>
                        <ChevronRight size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;