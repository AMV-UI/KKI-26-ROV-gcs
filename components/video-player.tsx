"use client";

import { useCameraStream } from "../api/camera";

const STREAMS = ["live/frontcam", "live/bottomcam"];

export default function VideoPlayer() {
    const {
        setVideoRef,
        isLive,
        sliderValue,
        maxDuration,
        isDraggingRef,
        handleSliderChange,
        handleSliderRelease,
        handleVideoTimeUpdate
    } = useCameraStream(STREAMS);

    return (
        // Removed the outer min-h-screen div entirely. 
        // Changed max-w-4xl to w-full so it naturally fills the grid cell.
        <div className="w-full bg-black rounded-lg overflow-hidden border border-neutral-700 shadow-xl h-fit font-sans text-white">

            {/* Video Grid */}
            <div className="grid grid-cols-2 w-full bg-black gap-1">
                {STREAMS.map((stream, index) => (
                    <div key={stream} className="relative w-full aspect-video bg-black">
                        <video
                            ref={(el) => setVideoRef(el, index)}
                            className="w-full h-full object-contain"
                            autoPlay
                            playsInline
                            muted
                            onTimeUpdate={index === 0 ? handleVideoTimeUpdate : undefined}
                        />
                        {isLive && (
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                                LIVE
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 text-white/50 text-xs font-mono bg-black/50 px-1 rounded">
                            {stream}
                        </div>
                    </div>
                ))}
            </div>

            {/* Slider Controls */}
            <div className="p-3 bg-neutral-800 flex flex-col gap-2">
                <div className="flex justify-between text-xs text-neutral-400 font-mono">
                    <span>- {Math.max(0, Math.floor(maxDuration - sliderValue))}s</span>
                    <span>{isLive ? "LIVE" : `Replay: ${Math.floor(sliderValue)}s`}</span>
                </div>

                <input
                    type="range"
                    min="0"
                    max={maxDuration > 0 ? maxDuration : 100}
                    step="0.1"
                    value={isLive && !isDraggingRef.current ? (maxDuration || 0) : sliderValue}
                    onChange={handleSliderChange}
                    onMouseUp={handleSliderRelease}
                    onTouchEnd={handleSliderRelease}
                    disabled={maxDuration === 0}
                    className={`w-full h-2 rounded-lg appearance-none accent-blue-500 ${maxDuration === 0 ? "bg-neutral-800 cursor-not-allowed" : "bg-neutral-600 cursor-pointer"
                        }`}
                />
            </div>
        </div>
    );
}
