"use client";
import React from "react";
import { useTelemetry } from "@/api/useTelemetry"; // Adjust path as needed

export default function RCMotorStatus() {
    const { telemetry } = useTelemetry();

    // Safely fallback to default values (usually 1500 for neutral PWM, 0 for effort) 
    // if the backend hasn't streamed data yet
    const data = telemetry || {
        forward_rc: 0, lateral_rc: 0, vertical_rc: 0, yaw_rc: 0,
        mot1_eff: 0, mot2_eff: 0, mot3_eff: 0, mot4_eff: 0, mot5_eff: 0, mot6_eff: 0
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg p-5 text-white font-sans w-full max-w-sm">
            <h2 className="text-yellow-500 font-bold font-mono mb-4 text-center border-b border-slate-700 pb-2">
                System Diagnostics
            </h2>

            <div className="flex flex-row justify-between gap-4">

                {/* RC Inputs Column */}
                <div className="flex-1">
                    <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">RC Inputs</h3>
                    <ul className="space-y-1 font-mono text-sm">
                        <li className="flex justify-between bg-slate-800 px-2 py-1 rounded">
                            <span className="text-slate-300">Forward</span>
                            <span className="text-cyan-400 font-semibold">{data.forward_rc}</span>
                        </li>
                        <li className="flex justify-between bg-slate-800 px-2 py-1 rounded">
                            <span className="text-slate-300">Lateral</span>
                            <span className="text-cyan-400 font-semibold">{data.lateral_rc}</span>
                        </li>
                        <li className="flex justify-between bg-slate-800 px-2 py-1 rounded">
                            <span className="text-slate-300">Vertical</span>
                            <span className="text-cyan-400 font-semibold">{data.vertical_rc}</span>
                        </li>
                        <li className="flex justify-between bg-slate-800 px-2 py-1 rounded">
                            <span className="text-slate-300">Yaw</span>
                            <span className="text-cyan-400 font-semibold">{data.yaw_rc}</span>
                        </li>
                    </ul>
                </div>

                {/* Motor Efforts Column */}
                <div className="flex-1">
                    <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Motor Effort</h3>
                    <ul className="space-y-1 font-mono text-sm">
                        {[
                            { label: "M1", val: data.mot1_eff },
                            { label: "M2", val: data.mot2_eff },
                            { label: "M3", val: data.mot3_eff },
                            { label: "M4", val: data.mot4_eff },
                            { label: "M5", val: data.mot5_eff },
                            { label: "M6", val: data.mot6_eff },
                        ].map((motor, idx) => (
                            <li key={idx} className="flex justify-between bg-slate-800 px-2 py-1 rounded">
                                <span className="text-slate-300">{motor.label}</span>
                                <span className="text-green-400 font-semibold">{motor.val}</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
}
