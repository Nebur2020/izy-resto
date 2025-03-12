import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
  User,
} from 'firebase/auth';
import { app } from '../../lib/firebase/config';

const auth = getAuth(app);

setPersistence(auth, browserSessionPersistence).catch(error => {
  console.error('Auth persistence error:', error);
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fakeBaseQuery(),
  endpoints: builder => ({
    login: builder.mutation<User, { email: string; password: string }>({
      async queryFn({ email, password }) {
        try {
          const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          return { data: result.user };
        } catch (error: any) {
          const errorMessage = getErrorMessage(error.code);
          return {
            error: {
              status: 'AUTH_ERROR',
              message: errorMessage,
              error: error.message,
            },
          };
        }
      },
    }),

    logout: builder.mutation<void, void>({
      async queryFn() {
        try {
          await signOut(auth);

          const hasAcceptedCookies = localStorage.getItem('cookiesAccepted')
            ? localStorage.getItem('cookiesAccepted') === 'true'
            : false;

          sessionStorage.clear();
          localStorage.clear();

          if (hasAcceptedCookies) {
            localStorage.setItem('cookiesAccepted', `${hasAcceptedCookies}`);
          }

          return { data: undefined };
        } catch (error: any) {
          return {
            error: {
              status: 'AUTH_ERROR',
              message: 'Failed to log out',
              error: error.message,
            },
          };
        }
      },
    }),
  }),
});

const getErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Adresse email invalide';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé';
    case 'auth/user-not-found':
      return 'Aucun compte trouvé avec cet email';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect';
    case 'auth/too-many-requests':
      return 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
    case 'auth/network-request-failed':
      return 'Erreur de connexion. Vérifiez votre connexion internet.';
    default:
      return 'Échec de la connexion';
  }
};

// Exportation des hooks
export const { useLoginMutation, useLogoutMutation } = authApi;

// Gestion de l'état d'authentification en temps réel
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

// Récupérer l'utilisateur actuel
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
