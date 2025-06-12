// src/components/AppProviders.js
import PropTypes from 'prop-types';
import { AuthProvider } from '../../context/AuthContext';
import { ProgramsProvider } from '../../context/ProgramsContext';
import { EnrolledCoursesProvider } from '../../context/EnrolledCoursesContext';

import { NotificationsProvider } from '../../context/NotificationsContext';
import { SettingsProvider } from '../../context/SettingsContext';

/**
 * @typedef {object} AppProvidersProps
 * @property {React.ReactNode} children - The child components to be wrapped by the providers.
 */

/**
 * AppProviders component.
 * Wraps the application with all necessary context providers.
 *
 * @param {AppProvidersProps} props - The component props.
 * @returns {JSX.Element} The JSX element.
 */
const AppProviders = ({ children }) => {
  return (
    <ProgramsProvider>
      <AuthProvider>
          <NotificationsProvider> 
            <EnrolledCoursesProvider>
              <SettingsProvider>
{children}
              </SettingsProvider>
            </EnrolledCoursesProvider>
          </NotificationsProvider>
       
      </AuthProvider>
    </ProgramsProvider>
  );
};

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;