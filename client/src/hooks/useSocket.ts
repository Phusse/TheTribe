import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3001";

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        // Initialize socket
        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("🔌 Connected to Socket.IO");
        });

        socket.on("connect_error", (err) => {
            console.error("🔌 Socket connection error:", err.message);
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    return socketRef.current;
};
