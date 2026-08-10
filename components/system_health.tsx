"use client";
import React, { useState, useEffect } from "react";
import { useTelemetry } from "@/api/useTelemetry"; // Adjust path as needed

// A small reusable component for each status row
const StatusRow = ({
    label,
    status,
    trueText = "OK",
    falseText = "FAULT",
    trueColor = "text-[#008702]", // Palette Green
    falseColor = "text-red-500"   // Standard red for errors
}: {
    label: string,
    status: boolean,
    trueText?: string,
    falseText?: string,
    trueColor?: string,
    falseColor?: string
}) => (
    <li className="flex justify-between items-center bg-[#808080]/20 px-3 py-2 rounded border border-transparent">
        <span className="text-[#D9D9D9]">{label}</span>
        <span className={`font-semibold ${status ? trueColor : falseColor}`}>
            {status ? trueText : falseText}
        </span>
    </li>
);


const StringDataRow = ({
    label,
    status,
}: {
    label: string,
    status: string,
}) => (
    <li className="flex justify-between items-center bg-[#808080]/20 px-3 py-2 rounded border border-transparent">
        <span className="text-[#D9D9D9]">{label}</span>
        <span className={`font-semibold ${status}`}>
            {status}
        </span>
    </li>
);

export default function SystemHealth() {
    const { telemetry } = useTelemetry();
    const [lastLogTime, setLastLogTime] = useState<string>("Loading...");

    // Generate the dummy log time on mount to prevent hydration mismatches
    useEffect(() => {
        const date = new Date();
        // Subtract a random number between 1 and 15 minutes
        const randomMinutes = Math.floor(Math.random() * 15) + 1;
        date.setMinutes(date.getMinutes() - randomMinutes);

        // Format as HH:MM:SS
        setLastLogTime(date.toLocaleTimeString([], { hour12: false }));
    }, []);

    // Safely fallback to false/disarmed if the backend hasn't streamed data yet
    const data = telemetry || {
        fc_cpu_load: false,
        fc_gyro_health: false,
        fc_acc_health: false,
        fc_compass_health: false,
        fc_baro_health: false,
        armed: false,
        mode: "MANUAL",

    };

    return (
        <div className="bg-[#2A2A2A] border border-[#808080] rounded-xl shadow-lg p-6 font-sans w-full min-w-0 flex flex-col">

            <div className="flex justify-between items-end border-b border-[#808080] mb-4 pb-2">
                <h2 className="text-[#F8E07D] font-bold font-mono text-base">
                    System Health
                </h2>

                {/* Global Armed/Disarmed Badge */}
                <div className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${data.armed
                    ? "bg-[#008702]/20 text-[#008702] border-[#008702]"
                    : "bg-[#808080]/20 text-[#808080] border-[#808080]"
                    }`}>
                    {data.armed ? "ARMED" : "DISARMED"}
                </div>
            </div>

            {/* Split into two columns on larger screens for compactness */}
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-sm mb-4">
                <StatusRow
                    label="CPU Load"
                    status={data.fc_cpu_load}
                    trueText="NORMAL"
                    falseText="HIGH"
                />

                <StatusRow
                    label="Gyroscope"
                    status={data.fc_gyro_health}
                />

                <StatusRow
                    label="Accelerometer"
                    status={data.fc_acc_health}
                />

                <StatusRow
                    label="Compass"
                    status={data.fc_compass_health}
                />

                <StatusRow
                    label="Barometer"
                    status={data.fc_baro_health}
                />

                <StringDataRow
                    label="Mode"
                    status={data.mode}
                />

                {/* Dummy Battery Row */}
                <li className="flex justify-between items-center bg-[#808080]/20 px-3 py-2 rounded border border-transparent">
                    <span className="text-[#D9D9D9]">Battery</span>
                    <span className="font-semibold text-[#008702]">
                        97%
                    </span>
                </li>
            </ul>

            {/* Dummy Last Log Saved Footer */}
            <div className="mt-auto pt-3 border-t border-[#808080]/50 flex justify-between items-center text-xs font-mono">
                <span className="text-[#808080]">Last Log Saved:</span>
                <span className="text-[#BAA85D] font-bold">{lastLogTime}</span>
            </div>

        </div>
    );
}
