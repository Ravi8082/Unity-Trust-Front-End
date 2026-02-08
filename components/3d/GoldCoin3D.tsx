"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Float,
  Text3D,
  Center
} from "@react-three/drei";
import * as THREE from "three";

function Coin() {
  const coinRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (coinRef.current) {
      coinRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={coinRef}>
        {/* Main Coin Body */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.15, 64]} />
          <meshStandardMaterial 
            color="#d4a853" 
            metalness={1} 
            roughness={0.1} 
          />
        </mesh>
        
        {/* Outer Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.45, 0.08, 16, 64]} />
          <meshStandardMaterial 
            color="#c49b3a" 
            metalness={1} 
            roughness={0.15} 
          />
        </mesh>
        
        {/* Inner Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.05, 16, 64]} />
          <meshStandardMaterial 
            color="#c49b3a" 
            metalness={1} 
            roughness={0.15} 
          />
        </mesh>
        
        {/* Center Emblem - Front */}
        <mesh position={[0, 0, 0.08]}>
          <circleGeometry args={[0.8, 32]} />
          <meshStandardMaterial 
            color="#e6bc5c" 
            metalness={0.9} 
            roughness={0.2} 
          />
        </mesh>
        
        {/* Bank Symbol - Front */}
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[0.4, 0.6, 0.02]} />
          <meshStandardMaterial 
            color="#c49b3a" 
            metalness={1} 
            roughness={0.1} 
          />
        </mesh>
        <mesh position={[0, 0.4, 0.1]}>
          <coneGeometry args={[0.35, 0.3, 4]} rotation={[0, 0, Math.PI / 4]} />
          <meshStandardMaterial 
            color="#c49b3a" 
            metalness={1} 
            roughness={0.1} 
          />
        </mesh>
        
        {/* Center Emblem - Back */}
        <mesh position={[0, 0, -0.08]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.8, 32]} />
          <meshStandardMaterial 
            color="#e6bc5c" 
            metalness={0.9} 
            roughness={0.2} 
          />
        </mesh>
        
        {/* Stars around the edge */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          return (
            <mesh 
              key={i} 
              position={[
                Math.cos(angle) * 1.25, 
                Math.sin(angle) * 1.25, 
                0.08
              ]}
              scale={0.08}
            >
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial 
                color="#e6bc5c" 
                metalness={1} 
                roughness={0.1} 
              />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

function SparkleParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const radius = 2 + Math.random() * 1.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#d4a853" 
        transparent 
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

export function GoldCoin3D() {
  return (
    <div className="h-full w-full">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <pointLight position={[-3, 3, 3]} intensity={0.8} color="#d4a853" />
        <pointLight position={[3, -3, -3]} intensity={0.4} color="#1a4fd4" />
        
        <Coin />
        <SparkleParticles />
        
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
