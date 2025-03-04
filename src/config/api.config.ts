export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
};

export const appConfig = {
  baseUrl: import.meta.env.VITE_APP_URL || 'https://restaurant-5ba0f.web.app',
};

export const secretKeys = {
  secret: '_[kX/hgy^75R*XDg7AT',
};

export const apiConfig = {
  baseUri: `${
    window.location.hostname.includes('localhost')
      ? 'http://localhost:3000'
      : 'https://restaurants-project-backend-solitary-brook-2574.fly.dev'
  }/api/v1`,
};
