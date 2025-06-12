// src/services/settingsService.js
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';

const SETTINGS_COLLECTION = 'userSettings';

/**
 * Fetches a user's settings from Firestore.
 * @param {string} userId The unique ID of the user.
 * @returns {Promise<object | null>} A promise that resolves with the user's settings object, or null if not found.
 */
export const fetchSettingsFromFirestore = async (userId) => {
  if (!userId) {
    console.error("fetchSettingsFromFirestore: userId is undefined.");
    return null;
  }
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log(`No settings found for user: ${userId}. Returning default.`);
      return null; // Return null if document doesn't exist, hook will handle defaults
    }
  } catch (error) {
    console.error('Error fetching settings from Firestore:', error);
    throw new Error('Failed to fetch user settings.'); // Re-throw for hook to catch
  }
};

/**
 * Saves a user's settings to Firestore.
 * @param {string} userId The unique ID of the user.
 * @param {object} settings The settings object to save.
 * @returns {Promise<void>} A promise that resolves when settings are saved.
 */
export const saveSettingsToFirestore = async (userId, settings) => {
  if (!userId) {
    throw new Error("saveSettingsToFirestore: userId is undefined.");
  }
  if (!settings) {
    throw new Error("saveSettingsToFirestore: settings object is undefined.");
  }
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, userId);
    // setDoc with merge: true ensures that only the fields provided are updated,
    // and other fields in the document remain unchanged.
    await setDoc(settingsRef, settings, { merge: true });
    console.log(`Settings saved for user: ${userId}`);
  } catch (error) {
    console.error('Error saving settings to Firestore:', error);
    throw new Error('Failed to save user settings.'); // Re-throw for hook to catch
  }
};