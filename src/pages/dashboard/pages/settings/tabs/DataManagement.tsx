import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Database,
  Trash2,
  RefreshCw,
  Loader2,
  FolderOpen,
  AlertTriangleIcon,
} from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { ConfirmDialog } from '../../../../../components/ui/ConfirmDialog';
import { cloudinaryService } from '../../../../../services/cloudinary/cloudinary.service';
import { db } from '../../../../../lib/firebase/config';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../../../hooks';

interface CollectionData {
  name: string;
  count: number;
  realName: string;
}

export function DataManagement() {
  const { t } = useTranslation();
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    collection?: string;
    itemCount?: number;
  }>({ isOpen: false });
  const [resetConfirmation, setResetConfirmation] = useState(false);

  const {settings} = useSettings();
  const primaryColor = settings?.palette.primary;

  const collectionsMapping: { [key: string]: string } = {
    'settingData:categories': 'categories',
    'settingData:menu-items': 'menu_items',
    'settingData:orders': 'orders',
    'settingData:inventory': 'inventory',
    'settingData:stock-history': 'stock_history',
    'settingData:media': 'media',
    'settingData:variants': 'variants',
    'settingData:transactions': 'transactions',
    'settingData:payment-methods': 'payment_methods',
    'settingData:staff': 'staff',
    'settingData:settings': 'settings',
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setIsLoading(true);
      const collectionsToCheck = Object.keys(collectionsMapping);

      const collectionsData = await Promise.all(
        collectionsToCheck.map(async key => {
          const realName = collectionsMapping[key];
          const snapshot = await getDocs(collection(db, realName));
          return {
            name: t(key),
            count: snapshot.size,
            realName,
          };
        })
      );

      setCollections(collectionsData);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast.error(t('settingData:error-loading-collections'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!deleteConfirmation.collection) return;
    const collectionName = deleteConfirmation.collection;

    try {
      setIsDeleting(collectionName);

      if (collectionName === 'media') {
        const snapshot = await getDocs(collection(db, 'media'));
        const mediaFiles = snapshot.docs.map(doc => doc.data());

        for (const file of mediaFiles) {
          try {
            const publicId = file.url.split('/').pop()?.split('.')[0];
            if (publicId) {
              await cloudinaryService.deleteFile(publicId);
            }
          } catch (error) {
            console.error('Error deleting file from Cloudinary:', error);
          }
        }
      }

      const snapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      await loadCollections();
      toast.success(t('settingData:collection-deleted', { collectionName }));
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error(t('settingData:error-deleting-collection'));
    } finally {
      setIsDeleting(null);
      setDeleteConfirmation({ isOpen: false });
    }
  };

  const handleResetWebsite = async () => {
    try {
      setIsResetting(true);
      for (const { realName } of collections) {
        if (realName === 'settings') continue;
        if (realName === 'payment_methods') continue;

        if (realName === 'media') {
          const snapshot = await getDocs(collection(db, 'media'));
          const mediaFiles = snapshot.docs.map(doc => doc.data());

          for (const file of mediaFiles) {
            try {
              const publicId = file.url.split('/').pop()?.split('.')[0];
              if (publicId) {
                await cloudinaryService.deleteFile(publicId);
              }
            } catch (error) {
              console.error('Error deleting file from Cloudinary:', error);
            }
          }
        }

        const snapshot = await getDocs(collection(db, realName));
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        const hasAcceptedCookies = localStorage.getItem('cookiesAccepted')
          ? localStorage.getItem('cookiesAccepted') === 'true'
          : false;

        await batch.commit();
        localStorage.clear();

        if (hasAcceptedCookies) {
          localStorage.setItem('cookiesAccepted', `${hasAcceptedCookies}`);
        }
      }

      await loadCollections();
      toast.success(t('settingData:website-reset'));
    } catch (error) {
      console.error('Error resetting website:', error);
      toast.error(t('settingData:error-resetting-website'));
    } finally {
      setIsResetting(false);
      setResetConfirmation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 dark:text-blue-400" color={primaryColor} />
          <h2 className="text-xl font-semibold">
            {t('settingData:manage-data')}
          </h2>
          <span className="flex gap-2 text-red-800 dark:text-red-400">
            <AlertTriangleIcon /> {t('settingData:danger-zone')}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {collections
            .filter(({ realName }) => realName !== 'payment_methods')
            .map(({ name, count, realName }) => (
              <motion.div
                key={realName}
                layout
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg" style={{ backgroundColor: primaryColor }}>
                    <FolderOpen className="w-5 h-5 text-blue-500" color="#fff"/>
                  </div>
                  <div>
                    <h3 className="font-medium capitalize">{name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {count} document{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {realName !== 'settings' && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      setDeleteConfirmation({
                        isOpen: true,
                        collection: realName,
                        itemCount: count,
                      })
                    }
                    disabled={isDeleting === realName}
                    className="flex-shrink-0"
                  >
                    {isDeleting === realName ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-white" />
                    )}
                  </Button>
                )}
              </motion.div>
            ))}
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <h2 className="text-xl font-semibold">
            {t('settingData:reset-website')}
          </h2>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-4">
            {t('settingData:reset-website-warning')}
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-6">
            {t('settingData:reset-website-warning-desc')}
          </p>
          <Button
            variant="danger"
            onClick={() => setResetConfirmation(true)}
            disabled={isResetting}
            className="w-full sm:w-auto"
            spanClassName="text-white"
          >
            {isResetting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                {t('settingData:resetting-website')}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('settingData:reset-website')}
              </>
            )}
          </Button>
        </div>
      </section>
      <ConfirmDialog
        isOpen={deleteConfirmation.isOpen}
        title={t('settingData:delete-collection', {
          collection: deleteConfirmation.collection,
        })}
        message={t('settingData:delete-collection-desc', {
          deleteConfirmationCollection: deleteConfirmation.collection,
          deleteConfirmationItemCount: deleteConfirmation.itemCount,
        })}
        confirmLabel={t('common:delete')}
        onConfirm={handleDeleteCollection}
        onCancel={() => setDeleteConfirmation({ isOpen: false })}
        isLoading={isDeleting === deleteConfirmation.collection}
      />

      <ConfirmDialog
        isOpen={resetConfirmation}
        title={t('settingData:reset-website-sub-title')}
        message={t('settingData:reset-website-desc')}
        confirmLabel={t('settingData:reset-website')}
        onConfirm={handleResetWebsite}
        onCancel={() => setResetConfirmation(false)}
        isLoading={isResetting}
      />
    </div>
  );
}
