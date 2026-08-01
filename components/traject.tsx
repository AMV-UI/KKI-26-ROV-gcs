"use client";
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Grid } from "@react-three/drei";
import * as THREE from "three";
import { useTelemetry } from "@/api/useTelemetry"; // Adjust path

const MAX_POINTS = 500;
const UPDATE_RATE_SEC = 0.1;

const pwmToVelocity = (pwm: number | undefined, maxSpeed: number) => {
    if (!pwm || pwm === 0) return 0;

    const NEUTRAL = 1500;
    const DEADBAND = 30;
    const RANGE = 400;

    const diff = (pwm - NEUTRAL)
    if (Math.abs(diff) < DEADBAND) return 0;

    return (diff / RANGE) * maxSpeed;
};

const PathRenderer = ({ telemetryRef }: { telemetryRef: React.MutableRefObject<any> }) => {
    const currentPosition = useRef(new THREE.Vector3(0, 0, 0));
    const timeSinceLastPoint = useRef(0);
    const pointBuffer = useRef<THREE.Vector3[]>([new THREE.Vector3(0, 0, 0)]);
    const [linePoints, setLinePoints] = useState<THREE.Vector3[]>([new THREE.Vector3(0, 0, 0)]);

    const markerRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        const data = telemetryRef.current;
        if (!data) return;

        const speedForward = pwmToVelocity(data.forward_rc, 1.5);
        const speedLateral = pwmToVelocity(data.lateral_rc, 1.0);
        const speedVertical = pwmToVelocity(data.vertical_rc, 0.8);

        const bodyVelocity = new THREE.Vector3(
            speedLateral,
            speedVertical,
            -speedForward
        );

        const euler = new THREE.Euler(
            // data.pitch || 0,
            0,
            -(data.yaw || 0),
            data.roll || 0,
            'YXZ'
        );

        bodyVelocity.applyEuler(euler);

        currentPosition.current.addScaledVector(bodyVelocity, delta);

        if (markerRef.current) {
            markerRef.current.position.copy(currentPosition.current);
            markerRef.current.rotation.copy(euler);
        }

        timeSinceLastPoint.current += delta;
        if (timeSinceLastPoint.current >= UPDATE_RATE_SEC) {
            timeSinceLastPoint.current = 0;

            const newPoint = currentPosition.current.clone();
            pointBuffer.current.push(newPoint);

            if (pointBuffer.current.length > MAX_POINTS) {
                pointBuffer.current.shift();
            }

            setLinePoints([...pointBuffer.current]);
        }
    });

    return (
        <group>
            {linePoints.length > 1 && (
                <Line
                    points={linePoints}
                    color="#2282F8" // Palette Blue
                    lineWidth={3}
                />
            )}

            <group ref={markerRef}>
                {/* Rotate the cone -90 degrees on X so its tip points "Forward" (-Z axis) instead of "Up" (+Y axis) */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.15, 0.5, 16]} />
                    <meshStandardMaterial color="#BAA85D" /> {/* Palette Dark Gold */}
                </mesh>
            </group>
        </group>
    );
};

export default function TrajectoryGraph() {
    const { telemetry } = useTelemetry();

    // We must pass telemetry into a ref to avoid a stale closure inside useFrame
    const telemetryRef = useRef(telemetry);
    useEffect(() => {
        telemetryRef.current = telemetry;
    }, [telemetry]);

    return (
        <div className="w-full min-w-0 h-96 bg-[#2A2A2A] rounded-xl overflow-hidden border border-[#808080] shadow-lg relative flex flex-col">

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 z-10 bg-[#2A2A2A]/80 border border-[#BAA85D] rounded px-3 py-2 pointer-events-none">
                <h3 className="text-[#F8E07D] text-xs font-bold uppercase tracking-wide mb-1">
                    Trajectory Estimate
                </h3>
                <div className="text-[#D9D9D9] text-[10px] font-mono flex flex-col">
                    <span>Dead Reckoning (IMU + Vel)</span>
                    <span className="text-[#008702] font-bold mt-1">Buffer: {MAX_POINTS} pts</span>
                </div>
            </div>

            {/* Render Canvas */}
            <div className="flex-grow relative min-h-0 min-w-0 w-full">
                <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 10]} intensity={1} />

                    <Grid
                        infiniteGrid
                        fadeDistance={20}
                        sectionColor="#808080" // Palette Medium Gray
                        cellColor="#2A2A2A"    // Palette Dark Gray
                    />

                    <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

                    <PathRenderer telemetryRef={telemetryRef} />
                </Canvas>
            </div>

        </div>
    );
}
