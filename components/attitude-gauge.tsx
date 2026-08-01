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
        // Changed justify-between to justify-center and added a tight gap-1.5 so items stick together
        <div className="flex flex-col items-center justify-center p-2 gap-1.5 bg-[#F8E07D] rounded-lg border border-black/10 shadow-sm w-full h-full max-w-[9rem] min-h-0 min-w-0">
            <h3 className="text-black font-bold uppercase tracking-wider text-[10px] xl:text-xs">
                {title}
            </h3>

            {/* Scaled down fixed sizes using responsive classes */}
            <div className="relative w-16 h-16 xl:w-20 xl:h-20 shrink-0 rounded-full border-[3px] border-black bg-transparent flex items-center justify-center shadow-inner">

                {/* Crosshair / Tick marks */}
                <div className="absolute w-full h-[2px] bg-black/20"></div>
                <div className="absolute h-full w-[2px] bg-black/20"></div>

                {/* N, S, E, W Tick indicators */}
                <div className="absolute top-0 w-1 h-1.5 xl:h-2 bg-black rounded-b-sm"></div>
                <div className="absolute bottom-0 w-1 h-1.5 xl:h-2 bg-black rounded-t-sm"></div>
                <div className="absolute left-0 w-1.5 xl:w-2 h-1 bg-black rounded-r-sm"></div>
                <div className="absolute right-0 w-1.5 xl:w-2 h-1 bg-black rounded-l-sm"></div>

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
                <div className="absolute w-2 h-2 xl:w-3 xl:h-3 bg-black rounded-full z-20 shadow-sm border border-black/20"></div>
            </div>

            {/* Numerical Data Readouts - removed mt-auto so readouts stick directly under the clock */}
            <div className="text-center font-mono w-full flex flex-col gap-1">
                <div className="border border-black/20 rounded px-1 py-0.5 xl:py-1">
                    <span className="text-black text-[10px] xl:text-sm font-bold">{angleDeg.toFixed(1)}°</span>
                </div>
                <div className="border border-black/20 rounded px-1 py-0.5 xl:py-1">
                    <span className="text-black font-bold text-[8px] xl:text-[10px] block uppercase leading-tight">Speed</span>
                    <span className="text-black text-[9px] xl:text-xs font-bold">{speedDeg.toFixed(1)}°/s</span>
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
        // Reduced gap between gauges to gap-1 for a tighter layout
        <div className="grid grid-cols-3 justify-items-center items-center gap-1 p-2 bg-transparent rounded-xl w-full h-full min-h-0 min-w-0 shadow-xl border border-black/20">
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
