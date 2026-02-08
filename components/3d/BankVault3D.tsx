"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Float,
  MeshDistortMaterial,
  RoundedBox
} from "@react-three/drei";
import * as THREE from "three";

function VaultDoor() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main Vault Body */}
      <RoundedBox args={[3, 3.5, 0.5]} radius={0.1} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a2744" metalness={0.9} roughness={0.2} />
      </RoundedBox>
      
      {/* Vault Door Frame */}
      <RoundedBox args={[2.5, 3, 0.2]} radius={0.08} smoothness={4} position={[0, 0, 0.35]}>
        <meshStandardMaterial color="#0f1a2e" metalness={0.85} roughness={0.3} />
      </RoundedBox>
      
      {/* Gold Center Ring */}
      <mesh position={[0, 0, 0.5]}>
        <torusGeometry args={[0.6, 0.08, 16, 100]} />
        <meshStandardMaterial color="#d4a853" metalness={1} roughness={0.1} />
      </mesh>
      
      {/* Gold Spokes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos((angle * Math.PI) / 180) * 0.35, 
            Math.sin((angle * Math.PI) / 180) * 0.35, 
            0.5
          ]}
          rotation={[0, 0, (angle * Math.PI) / 180]}
        >
          <boxGeometry args={[0.5, 0.06, 0.04]} />
          <meshStandardMaterial color="#d4a853" metalness={1} roughness={0.1} />
        </mesh>
      ))}
      
      {/* Center Handle */}
      <mesh position={[0, 0, 0.55]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#d4a853" metalness={1} roughness={0.1} />
      </mesh>
      
      {/* Lock Bolts */}
      {[-0.9, 0.9].map((y) =>
        [-1, 1].map((side, i) => (
          <mesh key={`${y}-${i}`} position={[side * 1.1, y, 0.35]}>
            <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#8b9cb5" metalness={0.9} roughness={0.3} />
          </mesh>
        ))
      )}
    </group>
  );
}

function FloatingCoins() {
  const coinsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (coinsRef.current) {
      coinsRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={coinsRef}>
      {[...Array(5)].map((_, i) => (
        <Float
          key={i}
          speed={1.5 + i * 0.2}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <mesh 
            position={[
              Math.cos((i * 72 * Math.PI) / 180) * 2.5,
              Math.sin(i * 0.5) * 0.5 - 0.5,
              Math.sin((i * 72 * Math.PI) / 180) * 2.5
            ]}
            rotation={[Math.PI / 2, 0, i * 0.5]}
          >
            <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
            <meshStandardMaterial color="#d4a853" metalness={1} roughness={0.1} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function GlowingSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (sphereRef.current) {
      const material = sphereRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <mesh ref={sphereRef} position={[0, 0, -1]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <MeshDistortMaterial
        color="#d4a853"
        emissive="#d4a853"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
        distort={0.3}
        speed={2}
      />
    </mesh>
  );
}

export function BankVault3D() {
  return (
    <div className="h-full w-full">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
        
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color="#d4a853" />
        <pointLight position={[0, -3, 3]} intensity={0.3} color="#1a4fd4" />
        
        <VaultDoor />
        <FloatingCoins />
        <GlowingSphere />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
