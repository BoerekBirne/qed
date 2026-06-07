/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { OperationType, FirestoreErrorInfo } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase client
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Boot Connection Verification
async function verifyFirebaseConnection() {
  try {
    // Attempt raw server fetch as required in SKILL guidelines
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("[Firebase] Please check your Firebase configuration and network parameters.");
    }
  }
}
verifyFirebaseConnection();

// Centralized error handling as specified in SKILL guidelines
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
    },
    operationType,
    path
  };
  
  console.error('[QED FireStore Error] logged:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
