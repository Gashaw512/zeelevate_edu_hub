import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signInWithCredential,
  OAuthProvider 
} from 'firebase/auth';

import { auth } from '../firebase/auth';
import externalAuthProviderConfig from '../data/externalAuthProviderConfig';

export const emailPasswordSignIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const googleSignIn = async () => {
  try {
    const { provider } = externalAuthProviderConfig.google;
    await signInWithPopup(auth, provider);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const initiateLinkedInLogin = () => {
  const { linkedin } = externalAuthProviderConfig;
  if (!linkedin.clientId) {
    throw new Error('LinkedIn Client ID not configured');
  }

  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedin.clientId}&redirect_uri=${encodeURIComponent(linkedin.redirectUri)}&scope=${encodeURIComponent(linkedin.scope)}&state=random_state_string`;
  
  window.location.href = linkedInAuthUrl;
};

export const handleLinkedInCallback = async (code) => {
  try {
    const { linkedin } = externalAuthProviderConfig;
    
    // Send code to backend to exchange for access token
    const response = await fetch(linkedin.backendEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with LinkedIn');
    }

    const { accessToken } = await response.json();

    // Sign in to Firebase with LinkedIn credential
    const provider = new OAuthProvider('linkedin.com');
    const credential = provider.credential({ accessToken });
    
    await signInWithCredential(auth, credential);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const handleSocialLogin = async (providerName) => {
  switch (providerName.toLowerCase()) {
    case 'google':
      return await googleSignIn();
    case 'linkedin':
      return await initiateLinkedInLogin();
    default:
      return { success: false, error: 'Unsupported provider' };
  }
};