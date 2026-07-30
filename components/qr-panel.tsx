"use client";
import React from "react";
import QRCode from "react-qr-code";
import { useTelemetry } from "@/api/useTelemetry"; // Adjust path as needed

export default function QRStatusBox() {
    const { telemetry } = useTelemetry();

    // Default to NOT_FOUND if telemetry is null
    const qrSide = telemetry?.qr_side || "NOT_FOUND";

    // Status logic: Valid unless NOT_FOUND
    const isValid = qrSide !== "NOT_FOUND";
    const statusText = isValid ? "Valid" : "Invalid";

    return (
        <div className="w-64 flex flex-col rounded-md overflow-hidden shadow-lg border border-slate-700 font-sans">

            {/* Heading with yellow background */}
            <div className="bg-yellow-400 text-slate-900 font-bold p-3 text-center uppercase tracking-wide text-sm">
                QR Code & Status
            </div>

            {/* Square Gray Content Box */}
            <div className="bg-slate-200 aspect-square flex flex-col items-center justify-center p-4">

                {/* QR Code / Placeholder Container */}
                <div className="w-50 h-50 flex items-center justify-center rounded mb-4 p-2">
                    {isValid ? (
                        <QRCode
                            value={qrSide}
                            size={140}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 140 140`}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 h-full w-full">
                            <img
                                src="/qr_placeholder.png"
                                alt="No QR Found"
                                width={1000}
                                height={1000}
                                className="opacity-50"
                            />
                        </div>
                    )}
                </div>

                {/* Text Details */}
                <div className="w-full text-left text-slate-800 text-sm font-medium space-y-1 px-2">
                    <p>
                        <span className="text-slate-500 mr-1">Status:</span>
                        <span className={isValid ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                            {statusText}
                        </span>
                    </p>
                    <p>
                        <span className="text-slate-500 mr-1">Side detected:</span>
                        <span className="font-bold">{qrSide}</span>
                    </p>
                </div>

            </div>
        </div>
    );
}
