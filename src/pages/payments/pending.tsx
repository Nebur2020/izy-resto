import PaymentReturn, { PaymentReturnProps } from './components/generic';

const PendingTransaction = () => {
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

  const pendingProps: PaymentReturnProps = {
    status: 'pending',
    title: 'Transaction en Cours',
    message: 'Votre paiement a bien été pris en compte...',
    buttonText:
      'Merci de fermer la fenêtre et de retourner page où la commande a été effectuée.',
    onButtonClick: () => console.log('Refresh clicked'),
  };

  return <PaymentReturn {...pendingProps} />;
};

export default PendingTransaction;
