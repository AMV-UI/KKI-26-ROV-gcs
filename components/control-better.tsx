"use client";
import React from "react";
import { useTelemetry } from "@/api/useTelemetry"; // Adjust path as needed

export default function SystemDiagnostics() {
    const { telemetry } = useTelemetry();

    // Safely fallback to 0 if the backend hasn't streamed data yet
    const data = telemetry || {
        forward_rc: 0, lateral_rc: 0, vertical_rc: 0, yaw_rc: 0,
        mot1_eff: 0, mot2_eff: 0, mot3_eff: 0, mot4_eff: 0, mot5_eff: 0, mot6_eff: 0
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg p-6 text-white font-sans w-fit flex flex-col md:flex-row gap-8">

            {/* --- LEFT SIDE: RC Inputs --- */}
            <div className="flex flex-col w-48">
                <h2 className="text-yellow-500 font-bold font-mono mb-4 border-b border-slate-700 pb-2">
                    RC Inputs
                </h2>
                <ul className="space-y-2 font-mono text-sm">
                    <li className="flex justify-between bg-slate-800 px-3 py-2 rounded">
                        <span className="text-slate-300">Forward</span>
                        <span className="text-cyan-400 font-semibold">{data.forward_rc}</span>
                    </li>
                    <li className="flex justify-between bg-slate-800 px-3 py-2 rounded">
                        <span className="text-slate-300">Lateral</span>
                        <span className="text-cyan-400 font-semibold">{data.lateral_rc}</span>
                    </li>
                    <li className="flex justify-between bg-slate-800 px-3 py-2 rounded">
                        <span className="text-slate-300">Vertical</span>
                        <span className="text-cyan-400 font-semibold">{data.vertical_rc}</span>
                    </li>
                    <li className="flex justify-between bg-slate-800 px-3 py-2 rounded">
                        <span className="text-slate-300">Yaw</span>
                        <span className="text-cyan-400 font-semibold">{data.yaw_rc}</span>
                    </li>
                </ul>
            </div>

            {/* --- RIGHT SIDE: Motor Image Overlay --- */}
            <div className="flex flex-col items-center">
                <h2 className="text-yellow-500 font-bold font-mono mb-4 border-b border-slate-700 pb-2 w-full text-center">
                    Thruster Effort
                </h2>

                {/* Specific 317x417 wrapper */}
                <div className="relative w-[317px] h-[417px] bg-slate-800 rounded-lg overflow-hidden border border-slate-600 shadow-inner">

                    {/* Background Diagram */}
                    <img
                        src="/frame.png"
                        alt="ROV Frame Diagram"
                        className="absolute inset-0 w-full h-full object-contain opacity-80"
                    />

                    {/* TOP ROW: Motor 2 (Left) & Motor 1 (Right) */}
                    <div className="absolute top-[15%] left-[20%] -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-sm border border-slate-500 px-2 py-1 rounded text-xs font-mono shadow-md">
                        <span className="text-slate-400 mr-1">M2</span>
                        <span className="text-green-400 font-bold">{data.mot2_eff}</span>
                    </div>
                    <div className="absolute top-[15%] right-[20%] translate-x-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-sm border border-slate-500 px-2 py-1 rounded text-xs font-mono shadow-md">
                        <span className="text-slate-400 mr-1">M1</span>
                        <span className="text-green-400 font-bold">{data.mot1_eff}</span>
                    </div>

                    {/* MIDDLE ROW: Motor 6 (Left) & Motor 5 (Right) */}
                    <div className="absolute top-[50%] left-[20%] -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-sm border border-slate-500 px-2 py-1 rounded text-xs font-mono shadow-md">
                        <span className="text-slate-400 mr-1">M6</span>
                        <span className="text-green-400 font-bold">{data.mot6_eff}</span>
                    </div>
                    <div className="absolute top-[50%] right-[20%] translate-x-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-sm border border-slate-500 px-2 py-1 rounded text-xs font-mono shadow-md">
                        <span className="text-slate-400 mr-1">M5</span>
                        <span className="text-green-400 font-bold">{data.mot5_eff}</span>
                    </div>

                    {/* BOTTOM ROW: Motor 4 (Left) & Motor 3 (Right) */}
                    <div className="absolute bottom-[15%] left-[20%] -translate-x-1/2 translate-y-1/2 bg-slate-900/90 backdrop-blur-sm border border-slate-500 px-2 py-1 rounded text-xs font-mono shadow-md">
                        <span className="text-slate-400 mr-1">M4</span>
                        <span className="text-green-400 font-bold">{data.mot4_eff}</span>
                    </div>
                    <div className="absolute bottom-[15%] right-[20%] translate-x-1/2 translate-y-1/2 bg-slate-900/90 backdrop-blur-sm border border-slate-500 px-2 py-1 rounded text-xs font-mono shadow-md">
                        <span className="text-slate-400 mr-1">M3</span>
                        <span className="text-green-400 font-bold">{data.mot3_eff}</span>
                    </div>

                </div>
            </div>

        </div>
    );
}
