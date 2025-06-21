// src/components/AppProviders.js
import PropTypes from 'prop-types';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { ProgramsProvider } from '../../context/ProgramsContext';
import { EnrolledCoursesProvider } from '../../context/EnrolledCoursesContext';
import { NotificationsProvider } from '../../context/NotificationsContext';
import { SettingsProvider } from '../../context/SettingsContext';
import React from 'react';

/**
 * Internal wrapper to conditionally render NotificationsProvider
 * only after auth loading is complete.
 */
const NotificationsWrapper = ({ children }) => {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    // Optionally return a loader or null to prevent premature rendering
    return null;
  }

  return <NotificationsProvider>{children}</NotificationsProvider>;
};

NotificationsWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * AppProviders component.
 * Wraps the app with all context providers.
 */
const AppProviders = ({ children }) => {
  return (
    <ProgramsProvider>
      <AuthProvider>
        <NotificationsWrapper>
          <EnrolledCoursesProvider>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </EnrolledCoursesProvider>
        </NotificationsWrapper>
      </AuthProvider>
    </ProgramsProvider>
  );
};

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;
