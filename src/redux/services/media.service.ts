import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { db } from '../../lib/firebase/config';
import {
  collection,
  query,
  getDocs,
  doc,
  runTransaction,
  orderBy,
  writeBatch,
  getDoc,
} from 'firebase/firestore';
import { MediaFile } from '../../types/media';
import { cloudinaryService } from '../../services';

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: fakeBaseQuery(),
  endpoints: builder => ({
    getAllMedia: builder.query<MediaFile[], void>({
      async queryFn() {
        try {
          const q = query(
            collection(db, 'media'),
            orderBy('createdAt', 'desc')
          );
          const snapshot = await getDocs(q);
          const mediaFiles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as MediaFile[];
          return { data: mediaFiles };
        } catch (error: any) {
          console.error('Error fetching media:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch media files',
              error: error.message,
            },
          };
        }
      },
    }),

    uploadFile: builder.mutation<
      string,
      { file: File; onProgress?: (progress: number) => void }
    >({
      async queryFn({ file, onProgress }) {
        try {
          const url = await cloudinaryService.uploadFile(file, onProgress);

          const mediaFile: Omit<MediaFile, 'id'> = {
            name: file.name,
            url,
            size: file.size,
            type: file.type,
            createdAt: new Date().toISOString(),
          };

          await runTransaction(db, async transaction => {
            const docRef = doc(collection(db, 'media'));
            transaction.set(docRef, mediaFile);
          });

          return { data: url };
        } catch (error: any) {
          if (typeof error === 'object' && error !== null && 'url' in error) {
            try {
              const publicId = (error as { url: string }).url
                .split('/')
                .pop()
                ?.split('.')[0];
              if (publicId) {
                await cloudinaryService.deleteFile(publicId);
              }
            } catch (cleanupError) {
              console.error('Error cleaning up Cloudinary file:', cleanupError);
            }
          }
          console.error('Error uploading file:', error);
          return {
            error: {
              status: 'CUSTOM_ERROR',
              message: 'Failed to upload file',
              error: error.message,
            },
          };
        }
      },
    }),

    deleteFiles: builder.mutation<void, string[]>({
      async queryFn(ids) {
        try {
          const batch = writeBatch(db);

          const files: MediaFile[] = [];
          for (const id of ids) {
            const docRef = doc(db, 'media', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              files.push({ id, ...docSnap.data() } as MediaFile);
              batch.delete(docRef);
            }
          }

          await Promise.all(
            files.map(async file => {
              try {
                const publicId = file.url.split('/').pop()?.split('.')[0];
                if (publicId) {
                  await cloudinaryService.deleteFile(publicId);
                }
              } catch (error) {
                console.error(
                  `Error deleting file from Cloudinary: ${file.url}`,
                  error
                );
              }
            })
          );

          await batch.commit();
          return { data: undefined };
        } catch (error: any) {
          console.error('Error deleting files:', error);
          return {
            error: {
              status: 'DELETE_ERROR',
              message: 'Failed to delete files',
              error: error.message,
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetAllMediaQuery,
  useUploadFileMutation,
  useDeleteFilesMutation,
} = mediaApi;
