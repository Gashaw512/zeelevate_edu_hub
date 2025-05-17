import { GoogleAuthProvider } from 'firebase/auth'; // Import GoogleAuthProvider
import { FcGoogle } from 'react-icons/fc';
import { FaLinkedin } from 'react-icons/fa';

const googleProvider = new GoogleAuthProvider(); // Now GoogleAuthProvider is defined

const externalAuthProviderConfig = {
  google: {
    provider: googleProvider,
    signInMethod: 'signInWithPopup',
    icon: { component: FcGoogle, className: 'social-icon' }, // icon is now an object
    label: 'Continue with Google',
    // style: {
    //   backgroundColor: '#ffffff',
    //   color: '#757575',
    //   hoverBackgroundColor: '#f5f5f5',
    // }
  },
  linkedin: {
    // clientId: process.env.REACT_APP_LINKEDIN_CLIENT_ID,
    redirectUri: `${window.location.origin}/auth/linkedin/callback`,
    scope: 'r_liteprofile r_emailaddress openid profile email',
    icon: { component: FaLinkedin, className: 'social-icon linkedin' }, // icon is now an object
    label: 'Continue with LinkedIn',
    signInMethod: 'initiateLinkedInLogin',
    callbackMethod: 'handleLinkedInCallback',
    backendEndpoint: '/api/auth/linkedin',
    // style: {
    //   backgroundColor: '#0077B5',
    //   color: '#ffffff',
    //   hoverBackgroundColor: '#006097',
    // }
  },
};

export const getProviderConfig = (providerName) => {
  return externalAuthProviderConfig[providerName.toLowerCase()];
};

export const getAllProviders = () => {
  return Object.keys(externalAuthProviderConfig).map(key => ({
    name: key,
    ...externalAuthProviderConfig[key]
  }));
};

export default externalAuthProviderConfig;