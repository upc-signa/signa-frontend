import { useEffect, useRef, useState } from "react";
import { Realtime } from "ably";
import { env } from '../../config/env';

const ably = new Realtime({
    key: "cCqgBQ.afR32Q:TlHR0hT_yKHMfHYCJU48MbRqlWkiGtmRdyGBYowc9cI",
});

export default function Chat({ uid, name, channel, id }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        const channelAbly = ably.channels.get(channel);
        console.log(channel);
        const handleMessage = (msg) => {
            let data;
            try {
                data = typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data;
            } catch (error) {
                console.error("Error parsing message:", error);
                return;
            }
            setMessages((prev) => [...prev, data]);
        };

        channelAbly.subscribe("message", handleMessage);

        return () => {
            channelAbly.unsubscribe("message", handleMessage);
        };
    }, [channel]);


    const sendMessage = async () => {
        if (!input.trim()) return;

        await fetch(env.API_URL_FRONTEND + "send-message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, name, text: input, meet: channel, id }),
        });

        setInput("");
    };

    return (
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg  flex flex-col mt-2 h-fit min-h-[300px]">
            <div className="flex-1 overflow-y-auto mb-4 space-y-2 max-h-60">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`p-2 rounded-lg max-w-[75%] ${msg.uid === uid
                                ? "bg-blue-600 text-white self-end"
                                : "bg-gray-700 text-white self-start"
                            }`}
                    >
                        <strong className="text-sm">{msg.name}:</strong> <span>{msg.text}</span>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 p-2 rounded-lg text-black"
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}
