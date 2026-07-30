"use client";
import React, { useEffect, useState } from "react";
import { useTelemetry } from "@/api/useTelemetry"; // Adjust path as needed

// 1. Create a persistent, shared AudioContext outside the component
let sharedAudioCtx: AudioContext | null = null;

// 2. Unlock function triggered on first user interaction
const unlockAudio = () => {
    if (!sharedAudioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            sharedAudioCtx = new AudioContextClass();
        }
    }
    // Resume the context if the browser put it in a suspended state
    if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
        sharedAudioCtx.resume();
    }
};

const playBeep = () => {
    // Safely abort if the user hasn't clicked the page yet to unlock audio
    if (!sharedAudioCtx || sharedAudioCtx.state !== "running") return;

    try {
        const osc = sharedAudioCtx.createOscillator();
        const gain = sharedAudioCtx.createGain();

        osc.connect(gain);
        gain.connect(sharedAudioCtx.destination);

        osc.type = "square";
        osc.frequency.setValueAtTime(880, sharedAudioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, sharedAudioCtx.currentTime);

        osc.start();
        osc.stop(sharedAudioCtx.currentTime + 0.15);
    } catch (e) {
        console.error("Audio playback failed.", e);
    }
};

export default function DepthMeter() {
    const { telemetry, isConnected } = useTelemetry();
    const [audioUnlocked, setAudioUnlocked] = useState(false);

    const rawDepthCm = (telemetry?.depth || 0) * 100;
    const clampedDepth = Math.min(Math.max(rawDepthCm, 0), 100);
    const isWarning = rawDepthCm > 75;

    // 3. Global listener to unlock audio on the very first interaction
    useEffect(() => {
        const handleInteraction = () => {
            unlockAudio();
            setAudioUnlocked(true);
        };

        // Bind to common interactions
        window.addEventListener("click", handleInteraction, { once: true });
        window.addEventListener("touchstart", handleInteraction, { once: true });
        window.addEventListener("keydown", handleInteraction, { once: true });

        return () => {
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("touchstart", handleInteraction);
            window.removeEventListener("keydown", handleInteraction);
        };
    }, []);

    // 4. Trigger the beep on an interval while isWarning is true
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isWarning) {
            playBeep();
            interval = setInterval(playBeep, 800);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isWarning]);

    const depthTicks = [0, 25, 50, 75, 100];

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Optional warning if audio is still locked by the browser */}
            {!audioUnlocked && (
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    Click anywhere to enable alarms
                </span>
            )}

            <div className="flex items-center bg-slate-900 p-6 rounded-xl w-fit shadow-lg border border-slate-700">

                {/* Left Side: Depth Ticks */}
                <div className="relative h-64 w-12 mr-4">
                    {depthTicks.map((tick) => (
                        <div
                            key={tick}
                            className={`absolute right-0 flex items-center gap-2 -translate-y-1/2 text-xs font-mono transition-colors duration-300 ${tick > 75 ? "text-red-400 font-bold" : "text-slate-300"
                                }`}
                            style={{ top: `${tick}%` }}
                        >
                            <span>{tick} cm</span>
                            <div className={`w-2 h-[1px] ${tick > 75 ? "bg-red-500" : "bg-slate-500"}`}></div>
                        </div>
                    ))}
                </div>

                {/* Right Side: Container */}
                <div className="relative h-64 w-8">

                    {/* Gradient Background & Danger Zone */}
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-300 via-blue-500 to-blue-900 rounded-full shadow-inner border border-slate-600/50 overflow-hidden pointer-events-none">
                        <div className="absolute bottom-0 w-full h-[25%] bg-red-600/40 border-t-2 border-red-500/80 z-0"></div>
                    </div>

                    {/* Overlay connection status if lost */}
                    {!isConnected && (
                        <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center rounded-full">
                            <span className="text-red-500 text-xs font-bold rotate-90 whitespace-nowrap">
                                OFFLINE
                            </span>
                        </div>
                    )}

                    {/* Depth Pointer (Triangle + Square) */}
                    <div
                        className="absolute left-full flex items-center -translate-y-1/2 transition-all duration-300 ease-out z-10"
                        style={{ top: `${clampedDepth}%` }}
                    >
                        <div className={`w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] drop-shadow-md transition-colors duration-300 ${isWarning ? "border-r-red-500 animate-pulse" : "border-r-white"
                            }`}></div>

                        <div className={`text-xs font-bold px-2 py-1 rounded-sm shadow-md whitespace-nowrap font-mono transition-colors duration-300 ${isWarning ? "bg-red-600 text-white animate-pulse" : "bg-white text-slate-900"
                            }`}>
                            {rawDepthCm.toFixed(1)} cm
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
