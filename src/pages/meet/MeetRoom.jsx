import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { meetService } from "../../services/api/meet.service";
import Meet from "../../components/meet/Meet";

export default function MeetRoom() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [meet, setMeet] = useState(null);

    useEffect(() => {
        let intervalId;

        const fetchMeet = async () => {
            try {
                const data = await meetService.getMeetbyUuid(uuid);
                setMeet(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener el meet:", error);
                setMeet(null);
                setIsLoading(false);
            }
        };

        // Primera carga
        fetchMeet();

        // Verificar cada 60 segundos si el meet sigue activo
        intervalId = setInterval(async () => {
            try {
                const updatedData = await meetService.getMeetbyUuid(uuid);
                if (!updatedData || updatedData.isActive === false) {
                    setMeet({ ...updatedData, isActive: false });
                    clearInterval(intervalId);
                } else {
                    setMeet(updatedData);
                }
            } catch (error) {
                console.error("Error al verificar el estado del meet:", error);
                clearInterval(intervalId);
            }
        }, 60000);

        // Limpiar el intervalo al desmontar el componente
        return () => clearInterval(intervalId);
    }, [uuid]);

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-lg text-gray-400">Cargando meet...</p>
            </div>
        );
    }

    if (meet == null) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-4">
                <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold mb-2">Meet no encontrado</h1>
                    <p className="text-gray-400 mb-6">El meet no existe o ocurrió un error.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (!meet.isActive) {
        // Verificar si la reunión aún no ha comenzado o ya expiró
        const now = new Date();
        const endTime = meet.endSessionTime ? new Date(meet.endSessionTime) : null;
        
        // Si ya expiró, mostrar mensaje de finalizado
        if (endTime && now > endTime) {
            return (
                <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-4">
                    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md text-center">
                        <div className="text-6xl mb-4">⏰</div>
                        <h1 className="text-2xl font-bold mb-2">Meet finalizado</h1>
                        <p className="text-gray-400 mb-6">Este meet ya ha expirado.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                        >
                            Volver al inicio
                        </button>
                    </div>
                </div>
            );
        }
        
        // Si aún no ha comenzado, mostrar sala de espera
        const startTime = meet.startTime ? new Date(meet.startTime) : null;
        if (startTime && now < startTime) {
            // El startTime viene en UTC, necesitamos convertir explícitamente a hora de Perú
            // Restar 5 horas para convertir de UTC a Perú (UTC-5)
            const peruTime = new Date(startTime.getTime() - (5 * 60 * 60 * 1000));
            
            // Calcular tiempo restante usando la hora de Perú
            const timeUntilStart = Math.ceil((peruTime - now) / 1000 / 60); // minutos
            
            // Formatear manualmente para evitar problemas de timezone
            const year = peruTime.getFullYear();
            const month = String(peruTime.getMonth() + 1).padStart(2, '0');
            const day = String(peruTime.getDate()).padStart(2, '0');
            const formattedDate = `${day}/${month}/${year}`;
            
            let hours = peruTime.getHours();
            const minutes = String(peruTime.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
            hours = hours % 12;
            hours = hours ? hours : 12; // La hora '0' debe ser '12'
            const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
            
            return (
                <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-4">
                    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md text-center">
                        <div className="text-6xl mb-4">🕒</div>
                        <h1 className="text-2xl font-bold mb-2">Sala de espera</h1>
                        <p className="text-gray-400 mb-2">Esta reunión aún no ha comenzado.</p>
                        <p className="text-orange-500 font-semibold mb-6">
                            Comienza en aproximadamente {timeUntilStart} minuto{timeUntilStart !== 1 ? 's' : ''}
                        </p>
                        <div className="text-sm text-gray-500 mb-6">
                            Hora de inicio: {formattedDate} a las {formattedTime}
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                        >
                            Volver al inicio
                        </button>
                    </div>
                </div>
            );
        }
    }

    return <Meet meet={meet} />;
}
