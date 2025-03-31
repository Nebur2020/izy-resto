import { useState, useEffect } from 'react';
import { mediaService } from '../services/media/media.service';
import { MediaFile } from '../types/media';
import toast from 'react-hot-toast';

export function useMedia() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const mediaFiles = await mediaService.getAllMedia();
      setFiles(mediaFiles);
    } catch (error) {
      console.error('Error loading media files:', error);
      toast.error('Failed to load media files');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const url = await mediaService.uploadFile(file);
      await loadFiles(); // Reload files after upload
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      throw error;
    }
  };

  const updloadFileToFirebase = async (file: File) => {
    try {
      const url = await mediaService.uploadFileToFirebase(file);
      await loadFiles(); // Reload files after upload
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      throw error;
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await mediaService.deleteFile([fileId]);
      await loadFiles(); // Reload files after deletion
      toast.success('Fichier supprimé avec succès');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Impossible de supprimer le fichier');
      throw error;
    }
  };

  return {
    files,
    isLoading,
    uploadFile,
    updloadFileToFirebase,
    deleteFile,
    refreshFiles: loadFiles,
  };
}
