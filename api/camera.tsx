import { useEffect, useRef, useState, useCallback } from "react";

const REPLAY_BASE_URL = "http://127.0.0.1:9996/get";

export function useCameraStream(streamPaths: string[]) {
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const webrtcRefs = useRef<(RTCPeerConnection | null)[]>([]);
    const reconnectTimeouts = useRef<NodeJS.Timeout[]>([]); // Track timeouts for cleanup

    const [isLive, setIsLive] = useState(true);
    const [sliderValue, setSliderValue] = useState(0);
    const [maxDuration, setMaxDuration] = useState(0);

    const recordingStartRef = useRef<string | null>(null);
    const seekOffsetRef = useRef<number>(0);
    const isDraggingRef = useRef<boolean>(false);

    // --- History Fetching Effect (Remains Unchanged) ---
    useEffect(() => {
        let pollInterval: NodeJS.Timeout;
        const API_URL = `/media-api/v3/recordings/list?path=${streamPaths[0]}`;

        async function fetchHistory() {
            try {
                const res = await fetch(API_URL);
                if (!res.ok) throw new Error("API returned " + res.status);

                const data = await res.json();
                if (data.items && data.items.length > 0 && data.items[0].segments) {
                    const segments = data.items[0].segments;
                    if (segments.length > 0) {
                        recordingStartRef.current = segments[0].start;
                        const firstStartTime = new Date(segments[0].start).getTime();
                        const lastStartTime = new Date(segments[segments.length - 1].start).getTime();
                        const totalSeconds = (lastStartTime - firstStartTime) / 1000 + 10;

                        if (totalSeconds > 0 && !isNaN(totalSeconds)) {
                            setMaxDuration(totalSeconds);
                            if (isLive && !isDraggingRef.current) {
                                setSliderValue(totalSeconds);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch recording history:", err);
            }
        }

        fetchHistory();
        pollInterval = setInterval(fetchHistory, 5000);
        return () => clearInterval(pollInterval);
    }, [isLive, streamPaths]);

    useEffect(() => {
        const cleanup = () => {
            webrtcRefs.current.forEach(pc => pc?.close());
            webrtcRefs.current = [];
            reconnectTimeouts.current.forEach(clearTimeout);
            reconnectTimeouts.current = [];
        };

        cleanup();

        if (isLive) {
            startLiveStream();
        } else {
            startReplayStream(sliderValue);
        }

        return cleanup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLive, streamPaths]);

    // --- Live Stream Reconnection Logic ---
    const connectLiveStream = async (path: string, index: number) => {
        // Ensure old connections and timers are cleared before trying again
        if (reconnectTimeouts.current[index]) clearTimeout(reconnectTimeouts.current[index]);
        if (webrtcRefs.current[index]) webrtcRefs.current[index]?.close();

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        webrtcRefs.current[index] = pc;

        pc.ontrack = (event) => {
            const videoEl = videoRefs.current[index];
            if (videoEl && videoEl.srcObject !== event.streams[0]) {
                videoEl.srcObject = event.streams[0];
            }
        };

        // Trigger reconnect if the WebRTC connection drops mid-stream
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                console.warn(`WebRTC disconnected for ${path}. Reconnecting in 3s...`);
                reconnectTimeouts.current[index] = setTimeout(() => {
                    if (isLive) connectLiveStream(path, index);
                }, 3000);
            }
        };

        try {
            pc.addTransceiver("video", { direction: "recvonly" });
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const response = await fetch(`/media-api/${path}/whep`, {
                method: "POST",
                headers: { "Content-Type": "application/sdp" },
                body: offer.sdp,
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const answerSdp = await response.text();
            await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
            console.log(`Connected to ${path}`);
        } catch (err) {
            console.error(`WHEP connection failed for ${path}:`, err);
            // Trigger reconnect if the initial WHEP API request fails
            reconnectTimeouts.current[index] = setTimeout(() => {
                if (isLive) connectLiveStream(path, index);
            }, 3000);
        }
    };

    const startLiveStream = () => {
        streamPaths.forEach((path, index) => {
            connectLiveStream(path, index);
        });
    };

    // --- Replay Logic (Remains Unchanged) ---
    const startReplayStream = (offsetSeconds: number) => {
        if (!recordingStartRef.current) return;

        const baseTimeMs = new Date(recordingStartRef.current).getTime();
        const targetTimeMs = baseTimeMs + (offsetSeconds * 1000);
        const absoluteStartTime = new Date(targetTimeMs).toISOString();
        const remainingDuration = Math.max(1, maxDuration - offsetSeconds);

        seekOffsetRef.current = offsetSeconds;

        streamPaths.forEach((path, index) => {
            const videoEl = videoRefs.current[index];
            if (!videoEl) return;

            videoEl.srcObject = null;
            const url = `${REPLAY_BASE_URL}?path=${encodeURIComponent(path)}&start=${encodeURIComponent(absoluteStartTime)}&duration=${remainingDuration}&format=fmp4`;

            videoEl.src = url;
            videoEl.play().catch(console.error);
        });
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        isDraggingRef.current = true;
        setSliderValue(parseFloat(e.target.value));
    };

    const handleSliderRelease = () => {
        isDraggingRef.current = false;
        const snapThreshold = Math.max(0, maxDuration - 2);

        if (sliderValue >= snapThreshold && maxDuration > 2) {
            if (!isLive) setIsLive(true);
        } else {
            if (isLive) setIsLive(false);
            else startReplayStream(sliderValue);
        }
    };

    const handleVideoTimeUpdate = () => {
        const primaryVideo = videoRefs.current[0];
        if (!isLive && primaryVideo && !isDraggingRef.current) {
            const currentRealTime = seekOffsetRef.current + primaryVideo.currentTime;
            setSliderValue(currentRealTime);
        }
    };

    const setVideoRef = useCallback((el: HTMLVideoElement | null, index: number) => {
        videoRefs.current[index] = el;
    }, []);

    return {
        setVideoRef,
        isLive,
        sliderValue,
        maxDuration,
        isDraggingRef,
        handleSliderChange,
        handleSliderRelease,
        handleVideoTimeUpdate
    };
}
