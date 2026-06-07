/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  bio: string | null;
  age: number | null;
  userLevel: number;
  totalLikes: number;
  followers: number;
  imageCount: number;
  isPrivate: boolean;
  themePreference: 'light' | 'dark' | 'system';
  languagePreference: 'de' | 'en';
  pushLikes: boolean;
  pushComments: boolean;
  preferredSubjects?: string[];
  isFilterPreferredFeed?: boolean;
  lastUploadDate?: string;
  dailyUploadCount?: number;
}

export interface StudySheet {
  id: string;
  titel: string;
  fach: string;
  schule: string;
  inhalt: string;
  autor: string;
  autorId: string;
  likes: number;
  likedBy: string[];
  createdAt: number; // Stamp in seconds
  image: string; // Base64 encoding or SVG string
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}
