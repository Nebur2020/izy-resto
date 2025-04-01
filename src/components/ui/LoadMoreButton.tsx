import { RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks';

interface ILoadingMoreButtonProps {
  handleLoadMore: () => void;
  isLoading: boolean;
}

export default function LoadMoreButton(props: ILoadingMoreButtonProps) {
  const { handleLoadMore, isLoading } = props;
  const { t } = useTranslation();

  const { settings } = useSettings();
  const primaryColor = settings?.palette.primary;
  return (
    <Button
      variant="custom"
      type="button"
      onClick={handleLoadMore}
      disabled={isLoading}
      className="px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
      style={{ backgroundColor: primaryColor }}
      spanClassName="text-white"
    >
      {isLoading ? (
        <div
          className="w-4 h-4 border-2  border-t-transparent rounded-full animate-spin"
          style={{ borderColor: primaryColor }}
        ></div>
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      {t('common:load-more')}
    </Button>
  );
}
