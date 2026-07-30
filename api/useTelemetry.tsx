import { useState, useEffect } from "react";

export interface TelemetryData {
    mode: "MANUAL" | "AUTONOMOUS";
    battery: number;
    timestamp: any;
    qr_side: "A" | "B" | "C" | "D" | "NOT_FOUND";
    depth: number;
    fc_status: boolean;
    sensor_status: boolean;
    rollspeed: number;
    pitchspeed: number;
    yawspeed: number;
    roll: number;
    pitch: number;
    yaw: number;
    forward_rc: number;
    lateral_rc: number;
    vertical_rc: number;
    yaw_rc: number;
    mot1_eff: number;
    mot2_eff: number;
    mot3_eff: number;
    mot4_eff: number;
    mot5_eff: number;
    mot6_eff: number;
}

export function useTelemetry() {
    const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const eventSource = new EventSource("/api/telemetry");

        eventSource.onopen = () => {
            setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
            try {
                const data: TelemetryData = JSON.parse(event.data);
                setTelemetry(data);
            } catch (err) {
                console.error("Failed to parse telemetry JSON", err);
            }
        };

        eventSource.onerror = () => {
            setIsConnected(false);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return { telemetry, isConnected };
}
