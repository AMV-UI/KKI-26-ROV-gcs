"use client";
import React, { useEffect, useState } from "react";
import { useTelemetry } from "@/api/useTelemetry"; // Adjust path as needed

let sharedAudioCtx: AudioContext | null = null;

const unlockAudio = () => {
    if (!sharedAudioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            sharedAudioCtx = new AudioContextClass();
        }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
        sharedAudioCtx.resume();
    }
};

const playBeep = () => {
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

    useEffect(() => {
        const handleInteraction = () => {
            unlockAudio();
            setAudioUnlocked(true);
        };

        window.addEventListener("click", handleInteraction, { once: true });
        window.addEventListener("touchstart", handleInteraction, { once: true });
        window.addEventListener("keydown", handleInteraction, { once: true });

        return () => {
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("touchstart", handleInteraction);
            window.removeEventListener("keydown", handleInteraction);
        };
    }, []);

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
            {!audioUnlocked && (
                <span className="text-[10px] text-[#2A2A2A] bg-[#F8E07D] px-2 py-1 rounded">
                    Click anywhere to enable alarms
                </span>
            )}

            {/* 2x2 Grid Container with #808080 Background */}
            <div className="bg-[#808080] p-3 rounded-xl w-fit shadow-lg grid grid-cols-[auto_auto] gap-x-4 gap-y-4">

                {/* 1. Header Left: Depth Text */}
                <div className="text-black text-center font-bold text-sm whitespace-pre-line leading-tight flex items-end justify-center">
                    {"depth\n(cm)"}
                </div>

                {/* 2. Header Right: Empty */}
                <div></div>

                {/* 3. Bottom Left: Depth Ticks */}
                <div className="relative h-64 w-12">
                    {depthTicks.map((tick) => (
                        <div
                            key={tick}
                            className="absolute right-0 flex items-center gap-2 -translate-y-1/2 text-xs font-mono text-black font-bold"
                            style={{ top: `${tick}%` }}
                        >
                            <span>{tick}</span>
                            <div className="w-2 h-[2px] bg-black"></div>
                        </div>
                    ))}
                </div>

                {/* 4. Bottom Right: The Meter */}
                <div className="relative h-64 w-8 justify-self-center ml-2">

                    {/* Gradient Background & Danger Zone */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#E0BE37] to-[#342F19] rounded-full shadow-inner overflow-hidden pointer-events-none">
                        {/* Danger Zone: Covers bottom 25% (75cm to 100cm) */}
                        <div className="absolute bottom-0 w-full h-[25%] bg-[#FF0000]/60 border-t-2 border-[#FF0000] z-0"></div>
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
                        {/* Triangle Pointer */}
                        <div className={`w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] drop-shadow-md transition-colors duration-300 ${isWarning ? "border-r-[#FF0000] animate-pulse" : "border-r-[#BAA85D]"
                            }`}></div>

                        {/* Value Box */}
                        <div className={`text-xs font-bold px-2 py-1 rounded-sm shadow-md whitespace-nowrap font-mono transition-colors duration-300 ${isWarning ? "bg-[#FF0000] text-white animate-pulse" : "bg-[#BAA85D] text-black"
                            }`}>
                            {rawDepthCm.toFixed(1)}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
