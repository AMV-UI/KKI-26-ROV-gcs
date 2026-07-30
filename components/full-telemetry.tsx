"use client";

import { useTelemetry } from "@/api/useTelemetry";

export default function TelemetryDisplay() {
    const { telemetry, isConnected } = useTelemetry();

    if (!isConnected) {
        return <div className="text-red-500 animate-pulse">Connecting to ROV Telemetry...</div>;
    }

    if (!telemetry) {
        return <div className="text-yellow-500">Waiting for data...</div>;
    }

    return (
        <div className="bg-neutral-800 p-4 rounded-lg font-mono text-sm text-white border border-neutral-700 w-80">
            <h2 className="text-lg font-bold text-blue-400 mb-2">Live Telemetry</h2>

            <div className="grid grid-cols-2 gap-2">
                <span className="text-neutral-400">Mode:</span>
                <span className="text-right">{telemetry.mode}</span>

                <span className="text-neutral-400">Depth:</span>
                <span className="text-right">{telemetry.depth.toFixed(2)} m</span>

                <span className="text-neutral-400">Battery:</span>
                <span className="text-right">{telemetry.battery.toFixed(1)} V</span>

                <span className="text-neutral-400">QR Side:</span>
                <span className="text-right">{telemetry.qr_side}</span>

            </div>

            <div className="mt-4 pt-2 border-t border-neutral-600 flex justify-between">
                <span className="text-neutral-400">FC Status:</span>
                <span className={telemetry.fc_status ? "text-green-500" : "text-red-500"}>
                    {telemetry.fc_status ? "ONLINE" : "OFFLINE"}
                </span>
            </div>
        </div>
    );
}
