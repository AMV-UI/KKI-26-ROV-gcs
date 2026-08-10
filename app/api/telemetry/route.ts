import { NextResponse } from "next/server";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

// --- Proto & client setup (unchanged) ---
const PROTO_PATH = path.resolve(process.cwd(), "protos/server.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const gcsProto = protoDescriptor.gcs;

const client = new gcsProto.Server(
    "localhost:50051",
    grpc.credentials.createInsecure()
);

const DEFAULT_TELEMETRY = {
    mode: "MANUAL",
    battery: 0,
    timestamp: null,
    qr_side: "NOT_FOUND",
    depth: 0,
    rollspeed: 0, pitchspeed: 0, yawspeed: 0,
    roll: 0, pitch: 0, yaw: 0,
    forward_rc: 1500, lateral_rc: 1500, vertical_rc: 1500, yaw_rc: 1500,
    mot1_eff: 0, mot2_eff: 0, mot3_eff: 0, mot4_eff: 0, mot5_eff: 0, mot6_eff: 0,
    fc_cpu_load: false,
    fc_gyro_health: false,
    fc_acc_health: false,
    fc_compass_health: false,
    fc_baro_health: false,
    armed: false,
    servo_effort: 1500
};
// ------------------------------------------

export async function GET(req: Request) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            let isClientConnected = true;
            let activeCall: any = null;
            let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

            // Track consecutive failures for backoff & optional abort
            let consecutiveFailures = 0;
            const MAX_RETRIES = 10;          // stop after this many failures
            const BASE_DELAY_MS = 2000;       // start at 2 seconds
            const MAX_DELAY_MS = 30000;       // cap at 30 seconds

            // Immediately push default values so the UI shows something
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(DEFAULT_TELEMETRY)}\n\n`));

            const connectGrpc = () => {
                if (!isClientConnected) return;

                activeCall = client.getTelemetry({});

                activeCall.on("data", (response: any) => {
                    // Successfully received data → reset failure counter & reconnect delay
                    consecutiveFailures = 0;
                    if (isClientConnected) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(response)}\n\n`));
                    }
                });

                activeCall.on("error", (error: any) => {
                    // Ignore cancellation errors
                    if (error.code === grpc.status.CANCELLED) return;

                    console.error(`gRPC stream error (Code ${error.code}):`, error.message);

                    // Send fallback data so the UI can zero out / show disconnected
                    if (isClientConnected) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(DEFAULT_TELEMETRY)}\n\n`));
                    }

                    // Schedule a reconnect with exponential backoff
                    if (isClientConnected) {
                        scheduleReconnect();
                    }
                });

                activeCall.on("end", () => {
                    // Stream ended normally – the server finished sending.
                    // We still want to reconnect if the client is still connected.
                    if (isClientConnected) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(DEFAULT_TELEMETRY)}\n\n`));
                        console.log("gRPC stream ended naturally. Will reconnect.");
                        scheduleReconnect();
                    }
                });
            };

            const scheduleReconnect = () => {
                // Clear any already pending reconnect
                if (reconnectTimer) {
                    clearTimeout(reconnectTimer);
                    reconnectTimer = null;
                }

                consecutiveFailures++;

                if (consecutiveFailures > MAX_RETRIES) {
                    // Too many failures – give up and close the SSE stream.
                    console.error("Max reconnection attempts reached. Closing SSE stream.");
                    if (activeCall) activeCall.cancel();
                    try { controller.close(); } catch (e) { }
                    return;
                }

                const delay = Math.min(BASE_DELAY_MS * Math.pow(2, consecutiveFailures - 1), MAX_DELAY_MS);
                console.log(`Reconnecting in ${delay / 1000}s (attempt ${consecutiveFailures})...`);

                reconnectTimer = setTimeout(() => {
                    reconnectTimer = null;
                    connectGrpc();
                }, delay);
            };

            // Start the first connection
            connectGrpc();

            // Handle client disconnection (browser closed / navigated away)
            req.signal.addEventListener("abort", () => {
                isClientConnected = false;
                if (reconnectTimer) {
                    clearTimeout(reconnectTimer);
                    reconnectTimer = null;
                }
                if (activeCall) activeCall.cancel();
                try { controller.close(); } catch (e) { }
            });
        }
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}
