import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Float, useGLTF, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ProductModelProps {
  type: string;
  color: string;
}

function Particles({ count = 100 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 4;
      p[i * 3 + 1] = (Math.random() - 0.5) * 4;
      p[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return p;
  }, [count]);

  return (
    <Points positions={points} stride={3}>
      <PointMaterial transparent color="#ffffff" size={0.02} sizeAttenuation={true} depthWrite={false} opacity={0.2} />
    </Points>
  );
}

function ClothingMesh({ type, color }: ProductModelProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t / 4) / 8;
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {type === 'tshirt' && (
        <cylinderGeometry args={[0.5, 0.6, 1.2, 32]} />
      )}
      {type === 'hoodie' && (
        <group>
          <cylinderGeometry args={[0.55, 0.65, 1.3, 32]} />
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.35, 32, 32]} />
          </mesh>
        </group>
      )}
      {type === 'sweatshirt' && (
        <cylinderGeometry args={[0.52, 0.62, 1.25, 32]} />
      )}
      <MeshDistortMaterial 
        color={color} 
        roughness={0.2} 
        metalness={0.3} 
        distort={0.15} 
        speed={1.5}
      />
    </mesh>
  );
}

export default function Product3DModel({ type, color }: ProductModelProps) {
  return (
    <div className="w-full h-[400px] md:h-[600px] cursor-grab active:cursor-grabbing">
      <Canvas shadows camera={{ position: [0, 0, 3.5], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} />
        
        <Suspense fallback={null}>
          <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
            <ClothingMesh type={type} color={color} />
          </Float>
          <Particles count={150} />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
          <Environment preset="night" />
        </Suspense>

        <OrbitControls 
          enableZoom={true} 
          minDistance={2}
          maxDistance={6}
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5} 
        />
      </Canvas>
    </div>
  );
}
