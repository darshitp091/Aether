import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  Sphere,
  Torus,
  MeshTransmissionMaterial,
  Environment,
  ContactShadows,
  Text,
  ScrollControls,
  useScroll,
  PerspectiveCamera
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, DepthOfField, Glitch, Noise } from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import * as THREE from 'three';

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.1;
    meshRef.current.rotation.y = time * 0.15;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 100]} scale={2}>
        <MeshTransmissionMaterial
          backside
          samples={16}
          resolution={512}
          transmission={1}
          roughness={0.1}
          thickness={0.5}
          ior={1.5}
          chromaticAberration={0.06}
          anisotropy={0.1}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.5}
          color="#ffffff"
        />
      </Sphere>
    </Float>
  );
}

function FloatingRing({ position, scale, speed, rotationSpeed, color }: { position: [number, number, number], scale: number, speed: number, rotationSpeed: number, color: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.z = time * rotationSpeed;
    meshRef.current.rotation.x = time * (rotationSpeed / 2);
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={1}>
      <Torus ref={meshRef} args={[1, 0.015, 16, 100]} position={position} scale={scale}>
        <meshStandardMaterial color={color} roughness={0} metalness={1} transparent opacity={0.6} emissive={color} emissiveIntensity={2} />
      </Torus>
    </Float>
  );
}

function ThreeDTypography() {
  const scroll = useScroll();
  const textRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    const r1 = scroll.range(0, 0.2);
    textRef.current.position.y = r1 * 5;
    textRef.current.rotation.x = r1 * Math.PI * 0.1;
    textRef.current.scale.setScalar(1 - r1 * 0.5);
  });

  return (
    <group ref={textRef}>
      <Text
        font="https://fonts.gstatic.com/s/anton/v25/1Pt6G8zb6ie5256mOQ.woff"
        fontSize={1.5}
        position={[0, 0.5, 0]}
        maxWidth={10}
        lineHeight={0.8}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        AETHER
        <meshStandardMaterial color="#00FF00" metalness={0.8} roughness={0.1} emissive="#00FF00" emissiveIntensity={0.5} />
      </Text>
      <Text
        font="https://fonts.gstatic.com/s/anton/v25/1Pt6G8zb6ie5256mOQ.woff"
        fontSize={0.8}
        position={[0, -0.5, 0]}
        maxWidth={10}
        lineHeight={0.8}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        WORLDWIDE
        <meshStandardMaterial color="white" metalness={0.8} roughness={0.1} />
      </Text>
    </group>
  );
}

function Scene() {
  const scroll = useScroll();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const { mouse, viewport } = useThree();

  useFrame((state) => {
    const r1 = scroll.range(0, 0.5);
    const r2 = scroll.range(0.5, 0.5);

    // Camera fly-through path
    state.camera.position.z = 6 - r1 * 10 + r2 * 5;
    state.camera.position.x = Math.sin(r1 * Math.PI) * 2;
    state.camera.lookAt(0, 0, 0);

    // Subtle mouse parallax
    state.camera.position.x += (mouse.x * viewport.width * 0.05 - state.camera.position.x) * 0.1;
    state.camera.position.y += (mouse.y * viewport.height * 0.05 - state.camera.position.y) * 0.1;
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#00FF00" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#00FF00" />
      <pointLight position={[10, -10, 5]} intensity={1.5} color="#ffffff" />

      <AnimatedSphere />
      <ThreeDTypography />

      <FloatingRing position={[0, 0, 0]} scale={2.8} speed={1} rotationSpeed={0.2} color="#00FF00" />
      <FloatingRing position={[0, 0, 0]} scale={3.2} speed={1.5} rotationSpeed={-0.15} color="#ffffff" />
      <FloatingRing position={[0, 0, 0]} scale={3.6} speed={0.8} rotationSpeed={0.1} color="#00FF00" />

      <Environment preset="city" />
      <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />

      <EffectComposer enableNormalPass={false}>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
        <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
        <Glitch
          delay={new THREE.Vector2(1.5, 3.5)}
          duration={new THREE.Vector2(0.1, 0.3)}
          strength={new THREE.Vector2(0.05, 0.1)}
          mode={GlitchMode.SPORADIC}
          active
          ratio={0.85}
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
      </EffectComposer>
    </>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <Canvas dpr={[1, 2]}>
        <ScrollControls pages={3} damping={0.2}>
          <Scene />
        </ScrollControls>
      </Canvas>
    </div>
  );
}
