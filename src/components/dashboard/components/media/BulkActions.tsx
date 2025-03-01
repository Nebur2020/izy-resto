import { motion } from 'framer-motion';
import { Trash2, Upload } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { useTranslation } from 'react-i18next';

interface IBulkActionsProps {
  selectedCount: number;
  onUpload: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActions(props: IBulkActionsProps) {
  const { t } = useTranslation();
  const { selectedCount, onUpload, onDelete, onClearSelection } = props;

  if (selectedCount === 0) {
    return (
      <Button onClick={onUpload}>
        <Upload className="w-4 h-4 mr-2" />
        {t('media:add-media')}
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
    >
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {selectedCount} {t('commont:element')}
        {selectedCount > 1 ? 's' : ''} {t('common:selected')}
        {selectedCount > 1 ? 's' : ''}
      </span>

      <Button variant="danger" onClick={onDelete} spanClassName='text-white'>
        <Trash2 className="w-4 h-4 mr-2 text-white" />
        {t('common:delete')}
      </Button>

      <Button variant="secondary" onClick={onClearSelection}>
        {t('common:cancel')}
      </Button>
    </motion.div>
  );
}
