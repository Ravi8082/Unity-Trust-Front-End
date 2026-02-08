"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Float,
  RoundedBox,
  Text
} from "@react-three/drei";
import * as THREE from "three";

function Sign() {
  const signRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (signRef.current) {
      signRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={signRef}>
        {/* Rope */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
          <meshStandardMaterial color="#8b7355" roughness={0.8} />
        </mesh>
        
        {/* Rope Hook */}
        <mesh position={[0, 2.2, 0]}>
          <torusGeometry args={[0.1, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#c49b3a" metalness={0.9} roughness={0.2} />
        </mesh>
        
        {/* Main Sign Board */}
        <RoundedBox args={[3, 1.5, 0.15]} radius={0.1} smoothness={4} position={[0, 0.5, 0]}>
          <meshStandardMaterial color="#8b2323" roughness={0.4} />
        </RoundedBox>
        
        {/* Sign Border */}
        <RoundedBox args={[3.2, 1.7, 0.1]} radius={0.12} smoothness={4} position={[0, 0.5, -0.05]}>
          <meshStandardMaterial color="#d4a853" metalness={0.8} roughness={0.2} />
        </RoundedBox>
        
        {/* CLOSED Text */}
        <Text
          position={[0, 0.5, 0.1]}
          fontSize={0.5}
          color="#f0e6d3"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          CLOSED
        </Text>
        
        {/* Decorative Screws */}
        {[[-1.3, 1.1], [1.3, 1.1], [-1.3, -0.1], [1.3, -0.1]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.08]}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#c49b3a" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        
        {/* Small Sign Below */}
        <RoundedBox args={[2, 0.6, 0.1]} radius={0.05} smoothness={4} position={[0, -0.5, 0]}>
          <meshStandardMaterial color="#1a2744" roughness={0.3} />
        </RoundedBox>
        
        <Text
          position={[0, -0.5, 0.08]}
          fontSize={0.15}
          color="#d4a853"
          anchorX="center"
          anchorY="middle"
        >
          Page Not Found
        </Text>
      </group>
    </Float>
  );
}

function DustParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
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
        size={0.03} 
        color="#d4a853" 
        transparent 
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export function ClosedSign3D() {
  return (
    <div className="h-full w-full">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
        />
        
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <pointLight position={[-3, 3, 3]} intensity={0.5} color="#d4a853" />
        <spotLight 
          position={[0, 5, 5]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.8} 
          color="#fff5e6"
        />
        
        <Sign />
        <DustParticles />
        
        <Environment preset="warehouse" />
      </Canvas>
    </div>
  );
}
