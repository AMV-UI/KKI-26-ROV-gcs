"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface TelemetryData {
    mode: "MANUAL" | "STABILIZE" | "DEPTH_HOLD";
    battery: number;
    timestamp: any;
    qr_side: "A" | "B" | "C" | "D" | "NOT_FOUND";
    depth: number;
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
    fc_cpu_load: boolean;
    fc_gyro_health: boolean;
    fc_acc_health: boolean;
    fc_compass_health: boolean;
    fc_baro_health: boolean;
    armed: boolean;
    servo_effort: number;
}


interface TelemetryContextType {
    telemetry: TelemetryData | null;
    isConnected: boolean;
}

// Create the shared context
const TelemetryContext = createContext<TelemetryContextType>({
    telemetry: null,
    isConnected: false,
});

// Create the Provider component that holds the single connection
export function TelemetryProvider({ children }: { children: ReactNode }) {
    const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const eventSource = new EventSource("/api/telemetry");

        eventSource.onopen = () => setIsConnected(true);

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

            // Optional: Add a 2-second delay before allowing native reconnects
            // to prevent aggressive server spam if the backend goes down
            setTimeout(() => {
                // By not doing anything here, we require a page refresh if the server dies.
                // Alternatively, you can implement a manual reconnect loop here.
            }, 2000);
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <TelemetryContext.Provider value={{ telemetry, isConnected }}>
            {children}
        </TelemetryContext.Provider>
    );
}

// Export the hook for components to consume the shared data
export function useTelemetry() {
    return useContext(TelemetryContext);
}
