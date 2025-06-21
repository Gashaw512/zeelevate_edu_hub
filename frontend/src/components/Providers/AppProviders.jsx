import PropTypes from 'prop-types';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { ProgramsProvider } from '../../context/ProgramsContext';
import { EnrolledCoursesProvider } from '../../context/EnrolledCoursesContext';
import { NotificationsProvider } from '../../context/NotificationsContext';
import { SettingsProvider } from '../../context/SettingsContext';
import React from 'react';

const NotificationsWrapper = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    // Show nothing or a lightweight spinner, or simply null to avoid premature NotificationsProvider mount
    return null;
  }

  return <NotificationsProvider>{children}</NotificationsProvider>;
};

NotificationsWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

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
