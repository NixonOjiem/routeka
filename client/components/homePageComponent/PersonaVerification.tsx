import Persona from 'persona';

const PersonaVerification = ({ userId }) => {
  const handleVerify = () => {
    const client = new Persona.Client({
      templateId: 'itmpl_YOUR_TEMPLATE_ID',
      environment: 'sandbox', // Use 'production' for live
      referenceId: userId.toString(),
      onReady: () => client.open(),
      onComplete: ({ inquiryId, status, fields }) => {
        console.log(`Completed inquiry ${inquiryId} with status ${status}`);
        // At this point, Persona's webhook is firing to your Laravel backend
      },
      onCancel: () => console.log('User exited'),
      onError: (error) => console.error(`Persona Error: ${error.message}`),
    });
  };

  return (
    <button 
      onClick={handleVerify}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
    >
      Verify My Identity
    </button>
  );
};

export default PersonaVerification;