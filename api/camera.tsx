import { useEffect, useRef, useCallback } from "react";


export function useCameraStream(streamPaths: string[]) {
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const webrtcRefs = useRef<(RTCPeerConnection | null)[]>([]);
    const reconnectTimeouts = useRef<NodeJS.Timeout[]>([]); // Track timeouts for cleanup

    // --- History Fetching Effect (Remains Unchanged) ---
    useEffect(() => {
        const cleanup = () => {
            webrtcRefs.current.forEach(pc => pc?.close());
            webrtcRefs.current = [];
            reconnectTimeouts.current.forEach(clearTimeout);
            reconnectTimeouts.current = [];
        };

        cleanup();

        startLiveStream();
        return cleanup;
    }, [streamPaths]);

    // --- Live Stream Reconnection Logic ---
    const connectLiveStream = async (path: string, index: number) => {
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

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                console.warn(`WebRTC disconnected for ${path}. Reconnecting in 3s...`);
                reconnectTimeouts.current[index] = setTimeout(() => {
                    connectLiveStream(path, index);
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
                connectLiveStream(path, index);
            }, 3000);
        }
    };

    const startLiveStream = () => {
        streamPaths.forEach((path, index) => {
            connectLiveStream(path, index);
        });
    };


    const setVideoRef = useCallback((el: HTMLVideoElement | null, index: number) => {
        videoRefs.current[index] = el;
    }, []);

    return {
        setVideoRef,
    };
}
