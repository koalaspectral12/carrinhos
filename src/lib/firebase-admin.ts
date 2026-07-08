import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

type ServiceAccountShape = {
  project_id: string;
  client_email: string;
  private_key: string;
};

let adminApp: App | null = null;

function loadServiceAccount(): ServiceAccountShape | null {
  const jsonEnv = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  if (jsonEnv) {
    const parsed = JSON.parse(jsonEnv) as ServiceAccountShape;
    return {
      project_id: parsed.project_id,
      client_email: parsed.client_email,
      private_key: parsed.private_key,
    };
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey,
    };
  }

  const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const parsed = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')) as ServiceAccountShape;
    return {
      project_id: parsed.project_id,
      client_email: parsed.client_email,
      private_key: parsed.private_key,
    };
  }

  return null;
}

export function getFirebaseAdminApp() {
  if (adminApp) return adminApp;

  const account = loadServiceAccount();
  if (!account) {
    throw new Error('Firebase Admin não configurado. Defina FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON ou as variáveis FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL e FIREBASE_ADMIN_PRIVATE_KEY.');
  }

  adminApp = getApps()[0] ?? initializeApp({
    credential: cert({
      projectId: account.project_id,
      clientEmail: account.client_email,
      privateKey: account.private_key,
    }),
  });

  return adminApp;
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}