import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useNotifications from '../../hooks/useNotifications';
import useEnrolledCoursesFetcher from '../../hooks/useEnrolledCoursesFetcher'; // Use the refined hook

// Icons
import { BookOpen, Bell, User, ChevronRight, Settings, GraduationCap, XCircle, Clock } from 'lucide-react'; // Added Clock icon

// CSS Modules
import styles from './DashboardHome.module.css';

const DashboardHome = () => {
    const { user, loading: authLoading } = useAuth();
    const { notifications, loading: notificationsLoading, error: notificationsError } = useNotifications(user?.uid);
    const { enrolledCourses, loadingEnrollments, enrollmentsError, refetchEnrollments } = useEnrolledCoursesFetcher(user?.uid);

    // Calculate unread notifications count, memoized for performance
    const unreadNotificationsCount = useMemo(() => {
        if (notificationsLoading || notificationsError) return 0;
        return notifications.filter(n => !n.read).length;
    }, [notifications, notificationsLoading, notificationsError]);

    // Determine user's display name, providing a fallback
    // We'll use this for the dashboard's primary greeting.
    const userName = user?.displayName || user?.email?.split('@')[0] || 'Student';

    // Filter active courses for "Continue Learning"
    const activeCourses = useMemo(() => {
        return enrolledCourses.filter(course => course.status === 'active');
    }, [enrolledCourses]);

    // --- Loading State ---
    if (authLoading || notificationsLoading || loadingEnrollments) {
        return (
            <div className={styles.statusContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.statusText}>Loading your dashboard...</p>
            </div>
        );
    }

    // --- Error State ---
    if (notificationsError || enrollmentsError) {
        return (
            <div className={styles.errorContainer}>
                <XCircle size={48} className={styles.errorIcon} />
                <h2 className={styles.errorHeading}>Oops! Something Went Wrong.</h2>
                {notificationsError && <p className={styles.errorText}>Notifications: {notificationsError}</p>}
                {enrollmentsError && <p className={styles.errorText}>Courses: {enrollmentsError}</p>}
                <p className={styles.errorText}>We couldn't load all parts of your dashboard.</p>
                <button onClick={refetchEnrollments} className={styles.retryButton}>
                    Retry
                </button>
            </div>
        );
    }

    // --- Main Dashboard Content ---
    return (
        <div className={styles.dashboardContainer}>
            {/* Welcome Section - Make it more engaging/action-oriented */}
            <div className={styles.welcomeSection}>
                <h1 className={styles.welcomeHeading}>
                    Ready to learn, <span className={styles.userNameHighlight}>{userName}</span>?
                </h1>
                <p className={styles.welcomeSubtitle}>
                    Pick up where you left off or explore new opportunities.
                </p>
                {activeCourses.length > 0 && (
                    <Link to={`/student/dashboard/courses/${activeCourses[0].id}`} className={styles.primaryActionButton}>
                        <GraduationCap size={20} /> Continue Learning
                    </Link>
                )}
            </div>

            {/* Overview Cards */}
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

                {/* Active Courses Card (New) */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <Clock className={styles.cardIconOrange} size={32} /> {/* Using a new color for active */}
                        <h2 className={styles.cardTitle}>In Progress</h2>
                    </div>
                    <p className={styles.cardValue}>{activeCourses.length}</p>
                    <p className={styles.cardDescription}>
                        {activeCourses.length === 1 ? 'course currently active' : 'courses currently active'}
                    </p>
                    <Link to="/student/dashboard/courses?filter=active" className={styles.cardLink}>
                        Go to Active <ChevronRight size={18} className={styles.linkIcon} />
                    </Link>
                </div>

                {/* Unread Notifications Card */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <Bell className={styles.cardIconIndigo} size={32} />
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
                        {enrolledCourses.slice(0, 3).map(course => ( // Show up to 3 latest courses
                            <div key={course.id} className={styles.activityItem}>
                                <span className={styles.activityCourseTitle}>{course.title}</span>
                                <span className={`${styles.activityStatus} ${styles[course.status]}`}>
                                    {/* Safe access for status */}
                                    {course.status ? (course.status.charAt(0).toUpperCase() + course.status.slice(1)) : 'N/A'}
                                </span>
                                <Link to={`/student/dashboard/courses/${course.id}`} className={styles.activityLink}>
                                    Go to Course <ChevronRight size={16} />
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>You haven't enrolled in any courses yet. Start your learning journey today!</p>
                        <Link to="/programs" className={styles.enrollNowButton}>Explore Programs</Link>
                    </div>
                )}
            </div>

            {/* Quick Links / Action Section (Optional: can be combined or left as is) */}
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