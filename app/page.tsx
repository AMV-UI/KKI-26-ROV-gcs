import VideoPlayer from "@/components/video-player"; // Adjust the path based on your folder structure
import DepthMeter from "@/components/depth_meter";
import QRStatusBox from "@/components/qr-panel";
import AttitudeGauge from "@/components/attitude-gauge";
import RovModelViewer from "@/components/rov-viewer";
import SystemDiagnostics from "@/components/control-better";
import TrajectoryGraph from "@/components/traject";
import SystemHealth from "@/components/system_health";
import { TelemetryProvider } from "@/api/useTelemetry";

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
        <TelemetryProvider>
            <main className="min-h-screen bg-neutral-950 flex flex-col font-sans">

                {/* Header */}
                <header className="p-2 border-b border-neutral-800 bg-neutral-950 z-10 shadow-md">
                    <h1 className="text-xl text-center font-bold font-mono text-[#CFBB68] tracking-wide">
                        AMV UI - Nemo | Universitas Indonesia | {timestamp}
                    </h1>
                </header>

                {/* Main Dashboard Grid */}
                <div className="flex-grow p-6 flex flex-col gap-6 overflow-x-hidden">

                    {/* 
                  UPPER PART 
                  Uses a 3-column grid. Video takes up 2 columns (wider), QR code takes 1 column.
                */}
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                        {/* Cameras */}
                        <div className="xl:col-span-4 w-full flex justify-center items-start">
                            <VideoPlayer />
                        </div>

                        {/* QR Code */}
                        <div className="xl:col-span-1 w-full flex justify-center items-start">
                            <QRStatusBox />
                        </div>
                    </div>

                    {/* 
                  LOWER PART 
                  Uses a 3-column grid. Each component gets exactly 1 equal column.
                */}
                    <div className="grid grid-cols-11 gap-6 mt-2 items-start">
                        {/* Depth Meter */}
                        <div className="w-full col-span-1 flex justify-center items-start">
                            <DepthMeter />
                        </div>


                        {/* Trajectory */}
                        <div className="col-span-3 w-full flex justify-center items-start min-w-0">
                            <TrajectoryGraph />
                        </div>

                        {/* ROV Design (3D Viewer) */}
                        <div className="col-span-3 w-full flex justify-center items-start min-w-0">
                            <RovModelViewer />
                        </div>

                        {/* Attitude (Roll, Pitch, Yaw) */}
                        <div className="col-span-4 w-full h-full flex justify-center items-start">
                            <AttitudeGauge />
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-6">
                        <div className="col-span-3 w-full flex justify-center items-start">
                            <SystemDiagnostics />
                        </div>

                        <div className="col-span-2 w-full flex justify-center items-start">
                            <SystemHealth />
                        </div>
                    </div>
                </div>
            </main>

        </TelemetryProvider>
    );
}
