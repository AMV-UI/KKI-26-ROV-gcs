"use client";
import React, { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Center, Html, useProgress } from "@react-three/drei";
import { STLLoader } from "three-stdlib";
import * as THREE from "three";

// Loading Spinner for the 3D Model
function Loader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <span className="text-white font-mono text-sm whitespace-nowrap bg-slate-800/80 px-3 py-1 rounded">
                Loading {progress.toFixed(0)}%
            </span>
        </Html>
    );
}

// Model Component that actually loads the STL
const STLModel = ({ url }: { url: string }) => {
    // useLoader automatically suspends the component until the file is fetched
    const geometry = useLoader(STLLoader, url);

    return (
        <mesh geometry={geometry}>
            {/* Standard material that reacts to light */}
            <meshStandardMaterial color="#0ea5e9" roughness={0.3} metalness={0.4} side={THREE.DoubleSide} />
        </mesh>
    );
};

export default function RovModelViewer() {
    return (
        <div className="w-full h-96 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-lg relative">

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 z-10 bg-black/50 border border-slate-600 rounded px-3 py-2">
                <h3 className="text-white text-xs font-bold uppercase tracking-wide mb-1">ROV Orientation</h3>
                <div className="text-slate-300 text-[10px] font-mono flex flex-col">
                    <span><span className="text-red-500 font-bold">X</span> (Red) : Roll Axis</span>
                    <span><span className="text-green-500 font-bold">Y</span> (Green): Yaw Axis</span>
                    <span><span className="text-blue-500 font-bold">Z</span> (Blue): Pitch Axis</span>
                </div>
            </div>

            {/* Three.js Canvas */}
            <Canvas camera={{ position: [200, 200, 200], fov: 45 }}>

                {/* Scene Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[100, 100, 100]} intensity={1.5} />
                <directionalLight position={[-100, -100, -100]} intensity={0.5} />

                {/* 3-Axis Measurement Bar (Size: 150 units) */}
                <axesHelper args={[150]} />

                {/* Mouse Interaction Controls (Rotate, Zoom, Pan) */}
                <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

                {/* Suspense wrapper handles the loading state of the STL */}
                <Suspense fallback={<Loader />}>
                    {/* <Center> automatically calculates the bounding box of the STL and centers it on 0,0,0 */}
                    <Center>
                        <STLModel url="/rov_model.stl" />
                    </Center>
                </Suspense>

            </Canvas>
        </div>
    );
}
