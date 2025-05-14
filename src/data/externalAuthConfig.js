import { GoogleAuthProvider } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import { FaLinkedin } from 'react-icons/fa';

const googleProvider = new GoogleAuthProvider();

const externalAuthProviderConfig = {
  google: {
    provider: googleProvider,
    signInMethod: 'signInWithPopup',
    icon: <FcGoogle className="social-icon" />,
    label: 'Continue with Google',
  },
  linkedin: {
    clientId: 'YOUR_LINKEDIN_CLIENT_ID', // Replace with your LinkedIn Client ID
    redirectUri: `${window.location.origin}/linkedin-callback`,
    scope: 'r_liteprofile r_emailaddress', // Adjust scopes as needed
    icon: <FaLinkedin className="social-icon linkedin" />,
    label: 'Continue with LinkedIn',
    signInMethod: 'initiateLinkedInLogin',
    callbackMethod: 'handleLinkedInCallback',
    backendEndpoint: '/api/auth/linkedin', // Replace with your backend API endpoint
  },
  // You can add configurations for other providers here (e.g., Facebook, GitHub)
};

export default externalAuthProviderConfig;