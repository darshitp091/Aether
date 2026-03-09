import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  Float, 
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  PresentationControls,
  Stage
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

function ClothModel({ color, type }: { color: string, type: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.2;
    }
  });

  // Procedural "fabric" shape based on type
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} castShadow receiveShadow>
        {type === 'Outerwear' ? (
          <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        ) : type === 'Tops' ? (
          <sphereGeometry args={[1, 64, 64]} />
        ) : (
          <boxGeometry args={[1.5, 1.5, 1.5]} />
        )}
        <MeshDistortMaterial 
          color={color} 
          speed={2} 
          distort={0.3} 
          radius={1} 
          metalness={0.8} 
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function ProductConfigurator3D({ color, type }: { color: string, type: string }) {
  return (
    <div className="w-full h-full min-h-[500px]">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 45 }}>
        <color attach="background" args={['#111111']} />
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5} shadows="contact">
            <PresentationControls
              global
              rotation={[0, 0.3, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
            >
              <ClothModel color={color} type={type} />
            </PresentationControls>
          </Stage>
        </Suspense>
        
        <OrbitControls makeDefault enableZoom={true} enablePan={false} minDistance={2} maxDistance={6} />
        
        <EffectComposer>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.2} radius={0.4} />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
