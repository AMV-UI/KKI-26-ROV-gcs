"use client";

import { useCameraStream } from "../api/camera";

const STREAMS = ["live/frontcam", "live/bottomcam"];

export default function VideoPlayer() {
    const {
        setVideoRef,
    } = useCameraStream(STREAMS);

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
                            />
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
