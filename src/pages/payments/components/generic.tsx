import { LucideIcon, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

type PaymentStatus = 'success' | 'error' | 'pending';

type StyleConfig = {
  background: string;
  iconBg: string;
  iconColor: string;
  button: string;
};

type StatusStylesConfig = {
  [key in PaymentStatus]: StyleConfig;
};

type StatusIconsConfig = {
  [key in PaymentStatus]: LucideIcon;
};

export interface PaymentReturnProps {
  /** The current status of the payment */
  status?: PaymentStatus;
  /** The main title displayed at the top */
  title: string;
  /** The message displayed under the title */
  message: string;
  /** The text displayed on the action button */
  buttonText: string;
  /** Function called when the button is clicked */
  onButtonClick?: () => void;
  /** Optional custom icon to override the default status icon */
  customIcon?: LucideIcon;
  /** Whether to show the entrance animation */
  animate?: boolean;
}

const STATUS_STYLES: StatusStylesConfig = {
  success: {
    background: 'from-green-50 to-white dark:from-green-950',
    iconBg: 'bg-green-100 dark:bg-green-900',
    iconColor: 'text-green-600 dark:text-green-400',
    button: 'bg-green-600 hover:bg-green-700',
  },
  error: {
    background: 'from-red-50 to-white dark:from-red-950',
    iconBg: 'bg-red-100 dark:bg-red-900',
    iconColor: 'text-red-600 dark:text-red-400',
    button: 'bg-red-600 hover:bg-red-700',
  },
  pending: {
    background: 'from-yellow-50 to-white dark:from-yellow-950',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    button: 'bg-yellow-600 hover:bg-yellow-700',
  },
};

const STATUS_ICONS: StatusIconsConfig = {
  success: CheckCircle2,
  error: XCircle,
  pending: AlertCircle,
};

export default function PaymentReturn({
  status = 'pending',
  title,
  message,
  buttonText,
  onButtonClick,
  customIcon,
  animate = true,
}: PaymentReturnProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const styles = STATUS_STYLES[status];
  const Icon = customIcon || STATUS_ICONS[status];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main
      className={`min-h-screen bg-gradient-to-b ${styles.background} dark:to-background flex items-center justify-center p-4`}
    >
      <div
        className={`max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center
        ${
          animate && mounted
            ? 'animate-in slide-in-from-bottom duration-500'
            : ''
        }`}
      >
        <div
          className={`inline-flex items-center justify-center w-16 h-16 mb-6 ${styles.iconBg} rounded-full`}
        >
          <Icon className={`w-8 h-8 ${styles.iconColor}`} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>

        <nav className="space-y-4">
          <button
            onClick={onButtonClick}
            className={`block w-full px-8 py-3 text-sm font-medium text-white ${styles.button} rounded-lg transition-colors`}
          >
            {buttonText}
          </button>
        </nav>
      </div>
    </main>
  );
}

// Example usage with types
// const Example = () => {
//   const successProps: PaymentReturnProps = {
//     status: 'success',
//     title: 'Paiement Réussi !',
//     message:
//       'Votre transaction a été traitée avec succès. Un email de confirmation vous sera envoyé dans quelques minutes.',
//     buttonText: 'Retourner à la page précédente',
//   };

//   const errorProps: PaymentReturnProps = {
//     status: 'error',
//     title: 'Échec du Paiement',
//     message:
//       'Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer ou contacter le support.',
//     buttonText: 'Réessayer',
//   };

//   const pendingProps: PaymentReturnProps = {
//     status: 'pending',
//     title: 'Paiement en Cours',
//     message:
//       'Votre paiement est en cours de traitement. Veuillez ne pas fermer cette fenêtre.',
//     buttonText: 'Actualiser la page',
//   };

//   return <PaymentReturn {...successProps} />;
// };
