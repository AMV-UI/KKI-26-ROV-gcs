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

    // Calculate percentage for the custom dual-color slider track
    const currentVal = isLive && !isDraggingRef.current ? (maxDuration || 0) : sliderValue;
    const percentage = maxDuration > 0 ? (currentVal / maxDuration) * 100 : 0;

    return (
        <div className="w-full bg-black rounded-lg overflow-hidden border border-neutral-700 shadow-xl h-fit font-sans text-white">

            {/* Video Grid */}
            <div className="grid grid-cols-2 w-full bg-black gap-1">
                {STREAMS.map((stream, index) => (
                    <div key={stream} className="flex flex-col bg-black">

                        {/* Stream Header */}
                        <div className="w-full bg-[#F8E07D] text-black font-bold text-center py-1.5 text-sm uppercase tracking-wide">
                            {index === 0 ? "Front Cam" : "Bottom Cam"}
                        </div>

                        {/* Stream Body */}
                        <div className="relative w-full aspect-video bg-black">
                            <video
                                ref={(el) => setVideoRef(el, index)}
                                className="w-full h-full object-contain"
                                autoPlay
                                playsInline
                                muted
                                onTimeUpdate={index === 0 ? handleVideoTimeUpdate : undefined}
                            />
                            {isLive && (
                                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse shadow-md">
                                    LIVE
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Timeline Bar & Slider Controls */}
            <div className="p-4 bg-[#D9D9D9] flex flex-col gap-2">
                <div className="flex justify-between text-xs text-black font-mono font-bold">
                    <span>- {Math.max(0, Math.floor(maxDuration - sliderValue))}s</span>
                    <span>{isLive ? "LIVE" : `Replay: ${Math.floor(sliderValue)}s`}</span>
                </div>

                <input
                    type="range"
                    min="0"
                    max={maxDuration > 0 ? maxDuration : 100}
                    step="0.1"
                    value={currentVal}
                    onChange={handleSliderChange}
                    onMouseUp={handleSliderRelease}
                    onTouchEnd={handleSliderRelease}
                    disabled={maxDuration === 0}
                    style={{
                        background: `linear-gradient(to right, #BAA85D ${percentage}%, #E2C037 ${percentage}%)`
                    }}
                    className={`w-full h-2 rounded-lg appearance-none 
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer
                        ${maxDuration === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                    `}
                />
            </div>
        </div>
    );
}
