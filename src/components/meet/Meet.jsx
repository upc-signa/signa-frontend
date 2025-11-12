import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import Chat from "./Chat";
import { env } from '../../config/env';

const APP_ID = "3807e6c8dfc4434faa3a57e3d67c6842";


export default function Meet({ meet }) {
    const [joined, setJoined] = useState(false);

    const [name, setName] = useState("");
    const [uid, setUid] = useState("");

    const [remoteUsers, setRemoteUsers] = useState({});
    const [localTracks, setLocalTracks] = useState({ audio: null, video: null });
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [micEnabled, setMicEnabled] = useState(true);

    const localContainerRef = useRef(null);
    const clientRef = useRef(null);
    const isSafari =
        typeof navigator !== "undefined" &&
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const waitForElement = async (selector, timeout = 3000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const el = document.querySelector(selector);
            if (el) return el;
            await new Promise((r) => requestAnimationFrame(r));
        }
        return null;
    };

    useEffect(() => {
        clientRef.current = AgoraRTC.createClient({
            mode: "rtc",
            codec: isSafari ? "h264" : "vp8",
        });
        const client = clientRef.current;

        const syncRemoteUsers = () => {
            setRemoteUsers({ ...client.remoteUsers });
        };

        const onUserPublished = async (user, mediaType) => {
            try {
                await client.subscribe(user, mediaType);
            } catch (err) {
                console.error("subscribe error", err);
            }

            syncRemoteUsers();

            if (mediaType === "video") {
                const el = await waitForElement(`#video-slot-${user.uid}`);
                if (el && user.videoTrack) {
                    try {
                        user.videoTrack.play(el);
                    } catch (err) {
                        console.error("Error al reproducir video remoto:", err);
                    }
                }
            }

            if (mediaType === "audio" && user.audioTrack) {
                try {
                    user.audioTrack.play();
                } catch (err) {
                    console.error("Error al reproducir audio remoto:", err);
                }
            }
        };

        const onUserUnpublished = () => syncRemoteUsers();
        const onUserLeft = () => syncRemoteUsers();
        const onUserJoined = () => syncRemoteUsers();

        client.on("user-published", onUserPublished);
        client.on("user-unpublished", onUserUnpublished);
        client.on("user-left", onUserLeft);
        client.on("user-joined", onUserJoined);

        const poll = setInterval(() => syncRemoteUsers(), 2000);

        return () => {
            clearInterval(poll);
            client.removeAllListeners();
            (async () => {
                try {
                    const c = clientRef.current;
                    if (c) {
                        Object.values(c.remoteUsers || {}).forEach((u) => {
                            if (u.videoTrack) {
                                try {
                                    u.videoTrack.stop();
                                    u.videoTrack.close();
                                } catch { }
                            }
                            if (u.audioTrack) {
                                try {
                                    u.audioTrack.stop();
                                    u.audioTrack.close();
                                } catch { }
                            }
                        });
                    }
                } catch (err) {
                    console.warn("cleanup error", err);
                }
            })();
        };
    }, [isSafari]);

    const waitForVisible = async (elRef, timeout = 2000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const el = elRef.current;
            if (el && el.offsetParent !== null) return el;
            await new Promise((r) => requestAnimationFrame(r));
        }
        return elRef.current;
    };

    useEffect(() => {
        const tryPlayLocal = async () => {
            if (localTracks.video) {
                const el = await waitForVisible(localContainerRef, 2000);
                if (!el) return;
                try {
                    localTracks.video.play(el);
                } catch (err) {
                    console.error("Error reproducir track local:", err);
                }
            }
        };
        tryPlayLocal();
    }, [localTracks.video]);

    useEffect(() => {
        Object.values(remoteUsers).forEach(async (user) => {
            if (user.videoTrack) {
                const el = await waitForElement(`#user-${user.uid}`);
                if (el) {
                    try {
                        user.videoTrack.play(el);
                    } catch (err) {
                        console.error("Reintento play remoto:", err);
                    }
                }
            }
        });
    }, [remoteUsers]);

    const joinMeet = async () => {
        if (!name.trim() && !uid.trim()) {
            alert("Por favor ingresa tu nombre");
            return;
        }

        const client = clientRef.current;

        if (!client) {
            alert("Client no inicializado");
            return;
        }



        try {
            const tokenRequest = await fetch(env.API_URL_FRONTEND + `signa-token?channel=${meet.uuid}&uid=${uid}`);
            const tokenData = await tokenRequest.json();
            const rtcToken = tokenData.rtcToken;

            await client.join(APP_ID, meet.uuid, rtcToken, uid);

            let localAudioTrack = null;
            let localVideoTrack = null;

            try {
                [localAudioTrack, localVideoTrack] =
                    await AgoraRTC.createMicrophoneAndCameraTracks();
                setLocalTracks({ audio: localAudioTrack, video: localVideoTrack });
                await client.publish([localAudioTrack, localVideoTrack]);
            } catch (err) {
                console.warn("No se pudo crear cámara+mic:", err);
                localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                setLocalTracks({ audio: localAudioTrack, video: null });
                await client.publish([localAudioTrack]);
                alert("Entraste solo con audio (no se detectó cámara o denegaste permisos).");
            }

            setRemoteUsers({ ...client.remoteUsers });
            setJoined(true);
        } catch (err) {
            console.error("Error join:", err);
            alert("Error al unirse. Revisa consola.");
        }
    };

    const leaveMeet = async () => {
        const client = clientRef.current;

        try {
            if (!client) return;

            const toUnpub = [];
            if (localTracks.audio) toUnpub.push(localTracks.audio);
            if (localTracks.video) toUnpub.push(localTracks.video);
            if (toUnpub.length) await client.unpublish(toUnpub);

            if (localTracks.audio) {
                localTracks.audio.stop();
                localTracks.audio.close();
            }
            if (localTracks.video) {
                localTracks.video.stop();
                localTracks.video.close();
            }

            Object.values(client.remoteUsers || {}).forEach((u) => {
                if (u.audioTrack) u.audioTrack.stop();
                if (u.videoTrack) u.videoTrack.stop();
            });

            await client.leave();

            setJoined(false);
            setRemoteUsers({});
            setLocalTracks({ audio: null, video: null });
        } catch (err) {
            console.error("leaveMeet error", err);
        }
    };

    // ✅ NUEVO: cerrar sesión automáticamente si se recarga o cierra la pestaña
    useEffect(() => {
        const handleBeforeUnload = async () => {
            try {
                await leaveMeet();
            } catch { }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [joined, localTracks]);

    const toggleCamera = async () => {
        const { video } = localTracks;
        if (!video) {
            alert("No tienes cámara disponible o no se detectó.");
            return;
        }

        try {
            if (cameraEnabled) {
                await video.setEnabled(false);
            } else {
                await video.setEnabled(true);
            }
            setCameraEnabled(!cameraEnabled);
        } catch (err) {
            console.error("Error al alternar cámara:", err);
        }
    };

    const toggleMic = async () => {
        const { audio } = localTracks;
        if (!audio) {
            alert("No tienes micrófono disponible o no se detectó.");
            return;
        }

        try {
            if (micEnabled) {
                await audio.setEnabled(false);
            } else {
                await audio.setEnabled(true);
            }
            setMicEnabled(!micEnabled);
        } catch (err) {
            console.error("Error al alternar micrófono:", err);
        }
    };

    const handleLogin = async (name) => {
        const uid = String(Math.floor(Math.random() * 2032));
        setUid(uid);
        setName(name)
    }

    return (
        <div>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                {!joined ? (
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center w-80">
                        <h1 className="text-3xl font-black text-orange-500 mb-6 mb-4">Unirse al Meet</h1>
                        <input
                            type="text"
                            placeholder="Tu nombre"
                            value={name}
                            onChange={(e) => handleLogin(e.target.value)}
                            className="input-underline mb-4"
                        />
                        <button
                            onClick={joinMeet}
                            className="self-end bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow transition-colors w-full"
                        >
                            Entrar
                        </button>
                    </div>
                ) : (
                    <div  className="meet-room">
                        <div>
                            <h1 className="text-xl font-semibold mb-4 text-center">
                                Bienvenido, {name} 👋 <br/> Meet: #{meet.uuid}
                            </h1>

                            <div className="flex flex-wrap justify-center gap-3 mb-6">
                                <div
                                    id="local-user"
                                    ref={localContainerRef}
                                    className="bg-gray-700 rounded-lg overflow-hidden w-72 h-52 shadow-md flex items-center justify-center text-gray-400 relative"
                                >
                                    {!localTracks.video && <span>Sin cámara</span>}
                                    <span className="absolute bottom-2 left-2 text-xs bg-black bg-opacity-50 px-2 py-1 rounded z-40">
                                        Tú
                                    </span>
                                    <style>{`
                #local-user video {
                  width: 100% !important;
                  height: 100% !important;
                  object-fit: cover;
                  transform: scaleX(-1);
                }
                .remote-video video {
                  width: 100% !important;
                  height: 100% !important;
                  object-fit: cover;
                }
              `}</style>
                                </div>

                                {Object.values(remoteUsers).map((user) => {
                                    const hasVideo = !!user.videoTrack;
                                    return (
                                        <div
                                            key={user.uid}
                                            id={`user-${user.uid}`}
                                            className="remote-video bg-gray-700 rounded-lg overflow-hidden w-72 h-52 shadow-md relative"
                                        >
                                            {/* contenedor específico donde Agora inyectará el <video> */}
                                            <div
                                                id={`video-slot-${user.uid}`}
                                                className="w-full h-full flex items-center justify-center"
                                                style={{ position: "absolute", inset: 0 }}
                                            >
                                                {!hasVideo && <span className="text-gray-400">Sin cámara</span>}
                                            </div>

                                            {/* etiqueta fuera del slot de video para que no la borre el SDK */}
                                            <span className="user-label absolute bottom-2 left-2 text-xs bg-black bg-opacity-50 px-2 py-1 rounded z-40">
                                                Usuario {user.uid}
                                            </span>
                                        </div>
                                    );
                                })}


                            </div>

                            <div className={"flex gap-2 items-center mt-2 mb-6 justify-center"}>
                                <button
                                    onClick={toggleMic}
                                    className={`${micEnabled ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
                                        } px-4 py-2 rounded-lg`}
                                >
                                    {micEnabled ? "Mutear micrófono" : "Activar micrófono"}
                                </button>

                                <button
                                    onClick={toggleCamera}
                                    className={`${cameraEnabled ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
                                        } px-4 py-2 rounded-lg`}
                                >
                                    {cameraEnabled ? "Apagar cámara" : "Encender cámara"}
                                </button>

                                <button
                                    onClick={leaveMeet}
                                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                                >
                                    Salir del Meet
                                </button>
                            </div>
                        </div>

                        <Chat
                            uid={uid}
                            name={name}
                            channel={meet.uuid}
                            id={meet.id}
                        />
                    </div>
                )}

            </div>
        </div>
    );
}
