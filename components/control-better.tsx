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
        // Changed main container to use #2A2A2A bg, #808080 border, and #D9D9D9 text
        <div className="bg-[#2A2A2A] border border-[#808080] rounded-xl shadow-lg p-6 text-[#D9D9D9] font-sans w-full min-w-0 flex flex-col xl:flex-row gap-8 items-center xl:items-start justify-center">

            {/* --- LEFT SIDE: RC Inputs --- */}
            <div className="flex flex-col w-full max-w-[12rem]">
                <h2 className="text-[#F8E07D] font-bold font-mono mb-4 border-b border-[#808080] pb-2">
                    RC Inputs
                </h2>
                <ul className="space-y-2 font-mono text-sm">
                    {/* List items use #808080 with 20% opacity for a subtle background */}
                    <li className="flex justify-between bg-[#808080]/20 px-3 py-2 rounded">
                        <span className="text-[#D9D9D9]">Forward</span>
                        {/* RC values use Palette Blue */}
                        <span className="text-[#2282F8] font-semibold">{data.forward_rc}</span>
                    </li>
                    <li className="flex justify-between bg-[#808080]/20 px-3 py-2 rounded">
                        <span className="text-[#D9D9D9]">Lateral</span>
                        <span className="text-[#2282F8] font-semibold">{data.lateral_rc}</span>
                    </li>
                    <li className="flex justify-between bg-[#808080]/20 px-3 py-2 rounded">
                        <span className="text-[#D9D9D9]">Vertical</span>
                        <span className="text-[#2282F8] font-semibold">{data.vertical_rc}</span>
                    </li>
                    <li className="flex justify-between bg-[#808080]/20 px-3 py-2 rounded">
                        <span className="text-[#D9D9D9]">Yaw</span>
                        <span className="text-[#2282F8] font-semibold">{data.yaw_rc}</span>
                    </li>
                </ul>
            </div>

            {/* --- RIGHT SIDE: Motor Image Overlay --- */}
            <div className="flex flex-col items-center w-full max-w-[317px]">
                <h2 className="text-[#F8E07D] font-bold font-mono mb-4 border-b border-[#808080] pb-2 w-full text-center">
                    Thruster Effort
                </h2>

                <div className="relative w-full aspect-[317/417] bg-[#808080]/10 rounded-lg overflow-hidden border border-[#808080] shadow-inner">
                    <img
                        src="/frame.png"
                        alt="ROV Frame Diagram"
                        className="absolute inset-0 w-full h-full object-contain opacity-80"
                    />

                    {/* Motor overlays use #2A2A2A bg, #BAA85D border, and Palette Green for values */}
                    {/* TOP ROW: Motor 2 (Left) & Motor 1 (Right) */}
                    <div className="absolute top-[15%] left-[20%] -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A]/90 backdrop-blur-sm border border-[#BAA85D] px-2 py-1 rounded text-xs font-mono shadow-md">
                        <span className="text-[#D9D9D9] mr-1">M2</span>
                        <span className="text-[#00FF00] font-bold">{data.mot2_eff}</span>
                    </div>
                    <div className="absolute top-[15%] right-[20%] translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A]/90 backdrop-blur-sm border border-[#BAA85D] px-2 py-1 rounded text-xs font-mono shadow-md">
                        <span className="text-[#D9D9D9] mr-1">M1</span>
                        <span className="text-[#00FF00] font-bold">{data.mot1_eff}</span>
                    </div>

                    {/* MIDDLE ROW: Motor 6 (Left) & Motor 5 (Right) */}
                    <div className="absolute top-[50%] left-[20%] -translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A]/90 backdrop-blur-sm border border-[#BAA85D] px-2 py-1 rounded text-xs font-mono shadow-md">
                        <span className="text-[#D9D9D9] mr-1">M6</span>
                        <span className="text-[#00FF00] font-bold">{data.mot6_eff}</span>
                    </div>
                    <div className="absolute top-[50%] right-[20%] translate-x-1/2 -translate-y-1/2 bg-[#2A2A2A]/90 backdrop-blur-sm border border-[#BAA85D] px-2 py-1 rounded text-xs font-mono shadow-md">
                        <span className="text-[#D9D9D9] mr-1">M5</span>
                        <span className="text-[#00FF00] font-bold">{data.mot5_eff}</span>
                    </div>

                    {/* BOTTOM ROW: Motor 4 (Left) & Motor 3 (Right) */}
                    <div className="absolute bottom-[15%] left-[20%] -translate-x-1/2 translate-y-1/2 bg-[#2A2A2A]/90 backdrop-blur-sm border border-[#BAA85D] px-2 py-1 rounded text-xs font-mono shadow-md">
                        <span className="text-[#D9D9D9] mr-1">M4</span>
                        <span className="text-[#00FF00] font-bold">{data.mot4_eff}</span>
                    </div>
                    <div className="absolute bottom-[15%] right-[20%] translate-x-1/2 translate-y-1/2 bg-[#2A2A2A]/90 backdrop-blur-sm border border-[#BAA85D] px-2 py-1 rounded text-xs font-mono shadow-md">
                        <span className="text-[#D9D9D9] mr-1">M3</span>
                        <span className="text-[#00FF00] font-bold">{data.mot3_eff}</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
