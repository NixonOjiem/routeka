import Persona from 'persona';

const PersonaVerification = ({ userId, onComplete, className, label }) => {
    const handleVerify = () => {
        const client = new Persona.Client({
            templateId: import.meta.env.VITE_PERSONA_TEMPLATE_ID, // Use env vars!
            environment: import.meta.env.VITE_PERSONA_ENVIRONMENT,
            referenceId: userId?.toString(),
            onReady: () => client.open(),
            onComplete: (data) => {
                if (onComplete) onComplete(data);
            },
            onCancel: () => console.log('User exited'),
            onError: (error) => console.error(`Persona Error: ${error.message}`),
        });
    };

    return (
        <button onClick={handleVerify} className={className}>
            {label || "Verify My Identity"}
        </button>
    );
};

export default PersonaVerification;