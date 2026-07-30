import { NextResponse } from "next/server";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

// 1. Load the proto file
const PROTO_PATH = path.resolve(process.cwd(), "protos/server.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const gcsProto = protoDescriptor.gcs;

// Initialize the client OUTSIDE the request to reuse the gRPC channel efficiently
const client = new gcsProto.Server(
    "localhost:50051",
    grpc.credentials.createInsecure()
);

export async function GET(req: Request) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            let isClientConnected = true;
            let activeCall: any = null;

            // Reusable connection wrapper
            const connectGrpc = () => {
                // If the user already left the page, stop trying to reconnect
                if (!isClientConnected) return;

                // Open the gRPC stream
                activeCall = client.getTelemetry({});

                // Handle incoming data
                activeCall.on("data", (response: any) => {
                    if (isClientConnected) {
                        const sseMessage = `data: ${JSON.stringify(response)}\n\n`;
                        controller.enqueue(encoder.encode(sseMessage));
                    }
                });

                // Handle errors (e.g., Python server crashes or is unavailable)
                activeCall.on("error", (error: any) => {
                    // gRPC Code 1: CANCELLED (The Next.js client aborted the request)
                    if (error.code === 1) return;

                    console.error(`gRPC stream error (Code ${error.code}):`, error.message);

                    // Wait 2 seconds and retry the connection
                    if (isClientConnected) {
                        console.log("Retrying backend connection in 2 seconds...");
                        setTimeout(connectGrpc, 2000);
                    }
                });

                // Handle graceful closure from the backend
                activeCall.on("end", () => {
                    if (isClientConnected) {
                        console.log("gRPC stream ended naturally. Reconnecting in 2 seconds...");
                        setTimeout(connectGrpc, 2000);
                    }
                });
            };

            // 2. Initiate the first connection
            connectGrpc();

            // 3. Cleanup when the browser frontend disconnects/unmounts
            req.signal.addEventListener("abort", () => {
                isClientConnected = false; // Break the retry loop

                if (activeCall) {
                    activeCall.cancel(); // Stop the active gRPC stream
                }

                // Safely close the Next.js SSE controller
                try {
                    controller.close();
                } catch (e) {
                    // Ignore already-closed errors
                }
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
