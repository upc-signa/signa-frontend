import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { meetService } from "../../services/api/meet.service";
import Meet from "../../components/meet/Meet";

export default function MeetRoom() {
    const { uuid } = useParams();

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
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                Cargando...
            </div>
        );
    }

    if (meet == null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                El Meet no existe o ocurrió un error.
            </div>
        );
    }

    if (!meet.isActive) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                El Meet ya expiró.
            </div>
        );
    }

    return (
        <div>
            <Meet meet={meet} />
        </div>
    );
}
