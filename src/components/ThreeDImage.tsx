import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const ImageShader = {
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: null },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uHover: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uHover;
    uniform vec2 uMouse;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Subtle wave effect based on hover
      float wave = sin(pos.x * 2.0 + uTime) * 0.05 * uHover;
      pos.z += wave;
      
      // Mouse interaction depth
      float dist = distance(uv, uMouse);
      float proximity = 1.0 - smoothstep(0.0, 0.5, dist);
      pos.z += proximity * 0.1 * uHover;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uHover;
    uniform vec2 uMouse;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // RGB Shift on hover
      float dist = distance(uv, uMouse);
      float shift = 0.01 * uHover * (1.0 - smoothstep(0.0, 0.3, dist));
      
      float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
      float g = texture2D(uTexture, uv).g;
      float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;
      
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
};

function ImageMesh({ src, className }: { src: string, className?: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, src);
  const hoverRef = useRef(0);

  useFrame((state) => {
    const { clock, mouse } = state;
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = clock.getElapsedTime();
      material.uniforms.uMouse.value.lerp(new THREE.Vector2(mouse.x * 0.5 + 0.5, mouse.y * 0.5 + 0.5), 0.1);
      
      // Smooth hover transition
      hoverRef.current = THREE.MathUtils.lerp(hoverRef.current, meshRef.current.userData.hovered ? 1 : 0, 0.1);
      material.uniforms.uHover.value = hoverRef.current;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      onPointerOver={() => (meshRef.current.userData.hovered = true)}
      onPointerOut={() => (meshRef.current.userData.hovered = false)}
    >
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        uniforms={{
          ...ImageShader.uniforms,
          uTexture: { value: texture }
        }}
        vertexShader={ImageShader.vertexShader}
        fragmentShader={ImageShader.fragmentShader}
        transparent
      />
    </mesh>
  );
}

export default function ThreeDImage({ src, className, aspect = "3/4" }: { src: string, className?: string, aspect?: string }) {
  return (
    <div className={`${className} relative overflow-hidden`} style={{ aspectRatio: aspect }}>
      <Canvas camera={{ position: [0, 0, 1], fov: 50 }} dpr={[1, 2]}>
        <ImageMesh src={src} />
      </Canvas>
    </div>
  );
}
