import PropTypes from 'prop-types';
import { AuthProvider } from '../../context/AuthContext';
import { ProgramsProvider } from '../../context/ProgramsContext';
import { EnrolledCoursesProvider } from '../../context/EnrolledCoursesContext';

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
    <AuthProvider>
      <ProgramsProvider>
        <EnrolledCoursesProvider>
          {children}
        </EnrolledCoursesProvider>
      </ProgramsProvider>
    </AuthProvider>
  );
};

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;