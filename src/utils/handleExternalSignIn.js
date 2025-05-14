// import { signInWithPopup, createUserWithCustomToken } from 'firebase/auth';
// import { auth } from '../../../firebase/auth'; // Adjust the path as needed

// const handleExternalSignIn = async (providerName, externalAuthProviderConfig, initiateLinkedInLogin, handleLinkedInCallback, setError, navigate) => {
//   setError('');
//   const providerConfig = externalAuthProviderConfig[providerName.toLowerCase()];
//   if (providerConfig) {
//     if (providerConfig.signInMethod === 'signInWithPopup' && providerConfig.provider) {
//       try {
//         await signInWithPopup(auth, providerConfig.provider);
//       } catch (err) {
//         setError(err.message || `${providerName} sign-in failed.`);
//       }
//     } else if (providerConfig.signInMethod === 'initiateLinkedInLogin') {
//       initiateLinkedInLogin();
//     }
//   } else {
//     setError(`Sign-in with ${providerName} is not supported.`);
//   }
// };

// export default handleExternalSignIn;