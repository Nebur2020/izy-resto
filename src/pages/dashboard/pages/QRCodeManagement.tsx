import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Copy,
  Download,
  Link as LinkIcon,
  CheckCircle,
  Sparkles,
  Info,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function isValidUrl(url: string): { isValid: boolean; formattedUrl: string } {
  url = url.trim().replace(/\/+$/, '');

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const urlObject = new URL(url);

    const hostnameRegex = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;
    if (!hostnameRegex.test(urlObject.hostname)) {
      return { isValid: false, formattedUrl: url };
    }

    return { isValid: true, formattedUrl: url };
  } catch {
    return { isValid: false, formattedUrl: url };
  }
}

export function QRCodeManagement() {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    setUrlError(null);
  };

  const generateQRCode = useCallback(async () => {
    if (!url) {
      toast.error(t('qrCode:empty-url'));
      return;
    }

    const { isValid, formattedUrl } = isValidUrl(url);
    if (!isValid) {
      setUrlError(t('qrCode:invalid-url'));
      toast.error(t('qrCode:invalid-url'));
      return;
    }

    try {
      setIsGenerating(true);
      setUrlError(null);

      const dataUrl = await QRCode.toDataURL(formattedUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      setQrCodeDataUrl(dataUrl);
      setUrl(formattedUrl);
      toast.success(t('qrCode:qr-code-generated'));
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      toast.error(t('qrCode:qr-code-generation-failed'));
    } finally {
      setIsGenerating(false);
    }
  }, [url]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t('qrCode:copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      toast.error(t('qrCode:copy-failed'));
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qr-code-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t('qrCode:qr-code-downloaded'));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl space-y-8"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative inline-flex h-20 w-20 items-center justify-center"
          >
            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 rounded-3xl rotate-6" />
            <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-3xl -rotate-6" />
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
              <QrCode className="h-8 w-8 text-white" />
            </div>
          </motion.div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {t('qrCode:qr-code-generator')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-lg">
            {t('qrCode:qr-code-description')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl">
          <div className="p-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('qrCode:cover-link')}
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="google.com ou https://google.com"
                  className={`
                    block w-full rounded-xl border pl-10 pr-12 py-3
                    transition-colors
                    ${
                      urlError
                        ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/10'
                        : 'border-gray-200 dark:border-gray-600 dark:bg-gray-700/50'
                    }
                    focus:outline-none focus:ring-2
                    ${
                      urlError
                        ? 'focus:ring-red-500 focus:border-red-500'
                        : 'focus:ring-blue-500 focus:border-blue-500'
                    }
                  `}
                />
                <AnimatePresence>
                  {url && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      onClick={copyToClipboard}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      title={copied ? 'Copié!' : 'Copier'}
                    >
                      {copied ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <Button
                onClick={generateQRCode}
                disabled={!url || isGenerating}
                className={`
                  relative inline-flex items-center justify-center px-6 py-3 
                  text-sm font-medium !text-white
                  bg-gradient-to-r from-blue-500 to-indigo-600 
                  hover:from-blue-600 hover:to-indigo-700 
                  rounded-xl shadow-lg hover:shadow-xl 
                  transition-all duration-200 min-w-[140px]
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  transform hover:-translate-y-0.5 active:scale-95
                  [&>*]:text-white [&>span]:text-white
                  disabled:from-gray-400 disabled:to-gray-500
                `}
              >
                <Sparkles
                  className={`w-4 h-4 mr-2 text-white ${
                    isGenerating ? 'animate-spin' : ''
                  }`}
                />
                <span className='!text-white'>
                  {isGenerating
                    ? t('qrCode:generating')
                    : t('qrCode:generator')}
                </span>
              </Button>
            </div>

            {urlError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <AlertCircle className="h-4 w-4" />
                {urlError}
              </motion.p>
            )}
          </div>
          <AnimatePresence mode="wait">
            {qrCodeDataUrl ? (
              <motion.div
                key="qr-code"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 border-t dark:border-gray-700/50"
              >
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity" />
                    <div className="relative bg-white rounded-xl p-6 shadow-lg">
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={downloadQRCode}
                    className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl
                             hover:bg-gray-800 dark:hover:bg-gray-600 shadow-lg hover:shadow-xl
                             transition-all duration-200 transform hover:-translate-y-0.5
                             active:scale-95 group flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                    <span>{t('qrCode:download-qr-code')}</span>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 border-t dark:border-gray-700/50"
              >
                <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700/50 rounded-xl blur-xl" />
                    <QrCode className="relative w-16 h-16 mb-4" />
                  </div>
                  <p className="text-sm mt-4">{t('qrCode:qr-dont-display')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20
                       rounded-2xl p-6 backdrop-blur-xl border border-blue-100/50 dark:border-blue-800/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                {t('qrCode:used-direction')}
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {t('qrCode:used-1')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {t('qrCode:used-2')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {t('qrCode:used-3')}
              </li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50
                       rounded-2xl p-6 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-500/10 dark:bg-gray-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {t('qrCode:applications')}
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                {t('qrCode:applications-description-1')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                {t('qrCode:applications-description-2')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                {t('qrCode:applications-description-3')}
              </li>
            </ul>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>
            {t('qrCode:url-format-accepted')} google.com, www.google.com,
            https://google.com
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
