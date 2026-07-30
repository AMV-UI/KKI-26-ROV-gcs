import VideoPlayer from "@/components/video-player"; // Adjust the path based on your folder structure
import TelemetryDisplay from "@/components/full-telemetry";
import DepthMeter from "@/components/depth_meter";
import QRStatusBox from "@/components/qr-panel";
import AttitudeGauge from "@/components/attitude-gauge";
import RovModelViewer from "@/components/rov-viewer";
import RCMotorStatus from "@/components/control_simple";
import SystemDiagnostics from "@/components/control-better";

export default function HomePage() {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    const timestamp = new Date().toLocaleString('id-ID', options);

    return (
        <main className="min-h-screen bg-neutral-950 flex flex-col font-sans">

            {/* Header */}
            <header className="p-4 border-b border-neutral-800 text-white bg-neutral-950 z-10 shadow-md">
                <h1 className="text-xl text-center font-bold font-mono text-yellow-500 tracking-wide">
                    AMV UI - Nemo | Universitas Indonesia | {timestamp}
                </h1>
            </header>

            {/* Main Dashboard Grid */}
            <div className="flex-grow p-6 flex flex-col gap-6 overflow-x-hidden">

                {/* 
                  UPPER PART 
                  Uses a 3-column grid. Video takes up 2 columns (wider), QR code takes 1 column.
                */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Cameras */}
                    <div className="xl:col-span-2 w-full flex justify-center items-center">
                        <VideoPlayer />
                    </div>

                    {/* QR Code */}
                    <div className="xl:col-span-1 w-full flex justify-center items-center">
                        <QRStatusBox />
                    </div>
                </div>

                {/* 
                  LOWER PART 
                  Uses a 3-column grid. Each component gets exactly 1 equal column.
                */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-2">
                    {/* Depth Meter */}
                    <div className="w-full flex justify-center items-center">
                        <DepthMeter />
                    </div>

                    <div className="w-full flex justify-center items-center">
                        <SystemDiagnostics />
                    </div>

                    {/* ROV Design (3D Viewer) */}
                    <div className="w-full flex justify-center items-center">
                        <RovModelViewer />
                    </div>

                    {/* Attitude (Roll, Pitch, Yaw) */}
                    <div className="w-full flex justify-center items-center">
                        <AttitudeGauge />
                    </div>
                </div>

            </div>
        </main>
    );
}
