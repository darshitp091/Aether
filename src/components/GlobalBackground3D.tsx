import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Points, PointMaterial, Float, Icosahedron, MeshDistortMaterial, Text } from '@react-three/drei';
import { useScroll } from 'motion/react';

// Advanced Liquid Shader with vibrant, luxury colors
const LiquidShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColor1: { value: new THREE.Color('#4f46e5') }, // Indigo
    uColor2: { value: new THREE.Color('#7c3aed') }, // Violet
    uColor3: { value: new THREE.Color('#06b6d4') }, // Cyan
    uColor4: { value: new THREE.Color('#020205') }, // Deep Base
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    varying vec2 vUv;
    varying vec3 vPosition;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float t = uTime * 0.15;
      
      // Mouse interaction ripples with higher sensitivity
      float dist = distance(vUv, uMouse);
      float mouseFactor = smoothstep(0.4, 0.0, dist);
      float ripple = sin(dist * 25.0 - uTime * 4.0) * mouseFactor * 0.15;
      
      // Multi-layered noise for "Digital Silk" effect
      float n1 = snoise(p * 1.2 + t + ripple);
      float n2 = snoise(p * 2.5 - t * 0.4 + ripple);
      float n3 = snoise(p * 0.8 + t * 0.7 + ripple);
      float n4 = snoise(p * 5.0 + t * 2.0); // Fine detail noise
      
      vec3 color = uColor4;
      // Luxury color blending
      color = mix(color, uColor1, smoothstep(0.0, 0.8, n1));
      color = mix(color, uColor2, smoothstep(0.1, 0.9, n2));
      color = mix(color, uColor3, smoothstep(0.2, 0.7, n3));
      
      // Iridescent highlights
      vec3 irid = vec3(
        sin(n1 * 5.0 + t) * 0.5 + 0.5,
        sin(n2 * 5.0 + t + 2.0) * 0.5 + 0.5,
        sin(n3 * 5.0 + t + 4.0) * 0.5 + 0.5
      );
      color = mix(color, irid, n4 * 0.15 * mouseFactor);
      
      // Vignette and lighting
      float highlight = pow(1.0 - length(p), 4.0) * 0.3;
      color += highlight;
      
      // Add subtle "scanlines" in the shader
      float scanline = sin(vUv.y * 800.0) * 0.02;
      color -= scanline;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

function LiquidBackground() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { mouse } = useThree();

  useFrame((state) => {
    const { clock } = state;
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = clock.getElapsedTime();
      // Convert mouse from [-1, 1] to [0, 1]
      material.uniforms.uMouse.value.lerp(new THREE.Vector2(mouse.x * 0.5 + 0.5, mouse.y * 0.5 + 0.5), 0.1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -15]} scale={[50, 50, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        fragmentShader={LiquidShader.fragmentShader}
        vertexShader={LiquidShader.vertexShader}
        uniforms={LiquidShader.uniforms}
        transparent
      />
    </mesh>
  );
}

function Stars() {
  const ref = useRef<THREE.Points>(null!);
  const { mouse, viewport } = useThree();
  const { scrollYProgress } = useScroll();

  const { positions, colors } = useMemo(() => {
    const p = new Float32Array(10000 * 3);
    const c = new Float32Array(10000 * 3);
    const color = new THREE.Color();
    for (let i = 0; i < 10000; i++) {
      const r = 3.5;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);

      const mixedColor = color.setHSL(Math.random() * 0.1 + 0.6, 0.5, 0.7 + Math.random() * 0.3);
      c[i * 3] = mixedColor.r;
      c[i * 3 + 1] = mixedColor.g;
      c[i * 3 + 2] = mixedColor.b;
    }
    return { positions: p, colors: c };
  }, []);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 30;
    ref.current.rotation.y -= delta / 35;

    const targetX = mouse.x * (viewport.width / 10);
    const targetY = mouse.y * (viewport.height / 10);

    ref.current.position.x += (targetX - ref.current.position.x) * 0.05;
    ref.current.position.y += (targetY - ref.current.position.y) * 0.05;
    ref.current.position.z = scrollYProgress.get() * 3;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null!);
  const { mouse, viewport } = useThree();
  const { scrollYProgress } = useScroll();

  useFrame((state, delta) => {
    const targetX = mouse.x * (viewport.width / 5);
    const targetY = mouse.y * (viewport.height / 5);

    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.02;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.02;

    groupRef.current.rotation.z = scrollYProgress.get() * Math.PI * 0.5;
    groupRef.current.position.z = -scrollYProgress.get() * 8;
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={2} floatIntensity={2}>
        <Icosahedron args={[1, 0]} position={[-3, 2, -4]} scale={0.6}>
          <MeshDistortMaterial color="#4f46e5" distort={0.4} speed={2} roughness={0} metalness={1} opacity={0.3} transparent />
        </Icosahedron>
      </Float>
      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.5}>
        <Icosahedron args={[1, 0]} position={[4, -3, -5]} scale={1}>
          <MeshDistortMaterial color="#ec4899" distort={0.5} speed={3} roughness={0} metalness={1} opacity={0.25} transparent />
        </Icosahedron>
      </Float>
      <Float speed={1.5} rotationIntensity={3} floatIntensity={1}>
        <Icosahedron args={[1, 0]} position={[0, 0, -8]} scale={1.5}>
          <MeshDistortMaterial color="#06b6d4" distort={0.3} speed={1} roughness={0} metalness={1} opacity={0.2} transparent />
        </Icosahedron>
      </Float>
    </group>
  );
}

function HUD() {
  const groupRef = useRef<THREE.Group>(null!);
  const { mouse, viewport } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.x = (mouse.x * viewport.width) / 20;
      groupRef.current.position.y = (mouse.y * viewport.height) / 20;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Decorative corners */}
      <Text
        position={[-viewport.width / 2 + 0.8, viewport.height / 2 - 0.5, -5]}
        fontSize={0.12}
        color="#ffffff"
        fillOpacity={0.2}
      >
        [ AETHER_OS_V2.0 ]
      </Text>
      <Text
        position={[viewport.width / 2 - 0.8, -viewport.height / 2 + 0.5, -5]}
        fontSize={0.12}
        color="#00FF66"
        fillOpacity={0.3}
      >
        SECURE_AUTH_ACTIVE
      </Text>
    </group>
  );
}

function Grid() {
  return (
    <gridHelper args={[100, 50, '#ffffff', '#ffffff']} position={[0, -10, -10]} rotation={[Math.PI / 2.1, 0, 0]}>
      <meshBasicMaterial transparent opacity={0.03} color="#ffffff" />
    </gridHelper>
  );
}

function DigitalDataStream() {
  const count = 50;
  const meshRef = useRef<THREE.Group>(null!);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * 10 - 5,
        speed: 0.1 + Math.random() * 0.2,
        scale: 0.05 + Math.random() * 0.1,
      });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    meshRef.current.children.forEach((child, i) => {
      const p = particles[i];
      child.position.y -= p.speed * delta * 15;
      if (child.position.y < -5) child.position.y = 5;
    });
  });

  return (
    <group ref={meshRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, -6]} scale={[p.scale, p.scale * 10, 1]}>
          <planeGeometry />
          <meshBasicMaterial color="#00FF66" transparent opacity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export default function GlobalBackground3D() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#010103]">
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#4f46e5" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#ec4899" />
        <LiquidBackground />
        <Grid />
        <Stars />
        <FloatingShapes />
        <HUD />
        <DigitalDataStream />
      </Canvas>
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
}
