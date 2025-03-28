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
import { db, storage } from '../../lib/firebase/config';
import { MediaFile } from '../../types/media';
import { cloudinaryService } from '../cloudinary/cloudinary.service';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

class MediaService {
  private readonly collection = 'media';

  async getAllMedia(): Promise<MediaFile[]> {
    try {
      const q = query(
        collection(db, this.collection),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as MediaFile[];
    } catch (error) {
      console.error('Error fetching media:', error);
      throw new Error('Failed to fetch media files');
    }
  }

  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // First upload to Cloudinary
      const url = await cloudinaryService.uploadFile(file, onProgress);

      // Then save to Firestore using a transaction
      await runTransaction(db, async transaction => {
        const mediaFile: Omit<MediaFile, 'id'> = {
          name: file.name,
          url,
          size: file.size,
          type: file.type,
          createdAt: new Date().toISOString(),
        };

        const docRef = doc(collection(db, this.collection));
        transaction.set(docRef, mediaFile);
      });

      return url;
    } catch (error) {
      // If Cloudinary upload succeeds but Firestore fails, try to clean up
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
      throw error;
    }
  }

  async uploadFileToFirebase(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const storageRef = ref(storage, `media/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          snapshot => {
            if (onProgress) {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            }
          },
          error => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            await runTransaction(db, async transaction => {
              const mediaFile: Omit<MediaFile, 'id'> = {
                name: file.name,
                url,
                size: file.size,
                type: file.type,
                createdAt: new Date().toISOString(),
              };
              const docRef = doc(collection(db, this.collection));
              transaction.set(docRef, mediaFile);
            });
            resolve(url);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading file to Firebase:', error);
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(ids: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Get all files first to get their URLs
      const files: MediaFile[] = [];
      for (const id of ids) {
        const docRef = doc(db, this.collection, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          files.push({ id, ...docSnap.data() } as MediaFile);
          batch.delete(docRef);
        }
      }

      // Delete from Cloudinary first
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

      // Then commit Firestore batch
      await batch.commit();
    } catch (error) {
      console.error('Error deleting files:', error);
      throw new Error('Failed to delete files');
    }
  }
}

export const mediaService = new MediaService();
