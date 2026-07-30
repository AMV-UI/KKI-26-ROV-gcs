"use client";
import React from "react";
import { useTelemetry } from "@/api/useTelemetry"; // Adjust path as needed

interface AttitudeGaugeProps {
    title: string;
    angleRad: number;
    speedRad: number;
}

// Reusable Clock-style Gauge Component
const AttitudeGauge: React.FC<AttitudeGaugeProps> = ({ title, angleRad, speedRad }) => {
    // Convert Radians to Degrees
    const angleDeg = angleRad * (180 / Math.PI);
    const speedDeg = speedRad * (180 / Math.PI);

    return (
        <div className="flex flex-col items-center p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-sm w-36">
            <h3 className="text-slate-300 font-bold mb-3 uppercase tracking-wider text-xs">
                {title}
            </h3>

            {/* Clock Face */}
            <div className="relative w-24 h-24 rounded-full border-4 border-slate-600 bg-slate-900 flex items-center justify-center shadow-inner mb-4">

                {/* Crosshair / Tick marks */}
                <div className="absolute w-full h-[2px] bg-slate-700/50"></div>
                <div className="absolute h-full w-[2px] bg-slate-700/50"></div>

                {/* N, S, E, W Tick indicators */}
                <div className="absolute top-0 w-1 h-2 bg-slate-400 rounded-b-sm"></div>
                <div className="absolute bottom-0 w-1 h-2 bg-slate-400 rounded-t-sm"></div>
                <div className="absolute left-0 w-2 h-1 bg-slate-400 rounded-r-sm"></div>
                <div className="absolute right-0 w-2 h-1 bg-slate-400 rounded-l-sm"></div>

                {/* Rotating Clock Hand (Arrow) */}
                <svg
                    className="absolute w-full h-full transition-transform duration-100 ease-linear z-10 drop-shadow-md"
                    style={{ transform: `rotate(${angleDeg}deg)` }}
                    viewBox="0 0 100 100"
                >
                    {/* SVG polygon drawn to point straight up (12 o'clock) and pivot at exactly 50,50 (the center) */}
                    <polygon
                        points="50,10 56,25 52,25 52,50 48,50 48,25 44,25"
                        fill="#ef4444"
                    />
                </svg>

                {/* Center Pivot Dot */}
                <div className="absolute w-3 h-3 bg-white rounded-full z-20 shadow-sm border border-slate-300"></div>
            </div>

            {/* Numerical Data Readouts */}
            <div className="text-center font-mono w-full flex flex-col gap-1">
                <div className="bg-slate-900 border border-slate-700 rounded px-2 py-1">
                    <span className="text-white text-sm font-semibold">{angleDeg.toFixed(1)}°</span>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded px-2 py-1">
                    <span className="text-slate-400 text-[10px] block uppercase leading-tight">Speed</span>
                    <span className="text-cyan-400 text-xs font-semibold">{speedDeg.toFixed(1)}°/s</span>
                </div>
            </div>
        </div>
    );
};

export default function AttitudeDisplay() {
    const { telemetry } = useTelemetry();

    // Safely fallback to 0 if the backend hasn't streamed data yet
    const data = telemetry || {
        roll: 0, pitch: 0, yaw: 0,
        rollspeed: 0, pitchspeed: 0, yawspeed: 0
    };

    return (
        <div className="flex flex-row gap-4 p-6 bg-slate-900 rounded-xl w-fit shadow-xl border border-slate-700">
            <AttitudeGauge
                title="Roll"
                angleRad={data.roll}
                speedRad={data.rollspeed}
            />
            <AttitudeGauge
                title="Pitch"
                angleRad={data.pitch}
                speedRad={data.pitchspeed}
            />
            <AttitudeGauge
                title="Yaw"
                angleRad={data.yaw}
                speedRad={data.yawspeed}
            />
        </div>
    );
}
