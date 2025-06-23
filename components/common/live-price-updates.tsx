"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

const LiveData = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Disconnected");

  useEffect(() => {
    console.log("🚀 Initializing WebSocket connection to CoinDCX...");

    const newSocket = io("wss://stream.coindcx.com", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    // Connection successful
    newSocket.on("connect", () => {
      console.log("✅ Connected to CoinDCX WebSocket");
      console.log("Socket ID:", newSocket.id);
      setIsConnected(true);
      setConnectionStatus("Connected");

      // Join the price channel
      newSocket.emit("join", {
        channelName: "B-BTC_USDT@prices",
      });

      console.log("📡 Joined channel: B-BTC_USDT@prices");
    });

    // Connection failed
    newSocket.on("connect_error", (error) => {
      console.error("❌ Connection failed:", error);
      setIsConnected(false);
      setConnectionStatus(`Error: ${error.message}`);
    });

    // Disconnected
    newSocket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected:", reason);
      setIsConnected(false);
      setConnectionStatus(`Disconnected: ${reason}`);
    });

    // Listen for price updates
    newSocket.on("price-change", (data) => {
      console.log("💰 Price update received:", data);
    });

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up WebSocket connection");
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">
          CoinDCX WebSocket Connection Test
        </h1>

        {/* Connection Status */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-4 h-4 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="font-semibold">Status:</span>
          <span
            className={`px-3 py-1 rounded text-sm ${
              isConnected
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {connectionStatus}
          </span>
        </div>

        {/* Socket Info */}
        {socket && (
          <div className="bg-gray-50 rounded p-4 mb-4">
            <h3 className="font-semibold mb-2">Connection Details:</h3>
            <div className="text-sm space-y-1">
              <p>
                <strong>Socket ID:</strong> {socket.id || "Not connected"}
              </p>
              <p>
                <strong>Connected:</strong> {socket.connected ? "Yes" : "No"}
              </p>
              <p>
                <strong>Endpoint:</strong> https://stream.coindcx.com
              </p>
              <p>
                <strong>Transport:</strong>{" "}
                {socket.io?.engine?.transport?.name || "Unknown"}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-semibold text-blue-800 mb-2">What This Does:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Connects to CoinDCX WebSocket endpoint</li>
            <li>• Joins the B-BTC_USDT@prices channel</li>
            <li>• Listens for price-change events</li>
            <li>• Logs all data to browser console</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2">
            Open browser DevTools Console to see live data updates
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveData;
