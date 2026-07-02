import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Float, Icosahedron, Torus, MeshTransmissionMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';
import { easing } from 'maath';

// Layer 1 & 7: Stars & Galaxy Haze
function Starfield({ count, color, size, radius, depth }: { count: number, color: string, size: number, radius: number, depth: number }) {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = radius * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = (Math.random() - 0.5) * depth;
    }
    return arr;
  }, [count, radius, depth]);

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.02;
      ref.current.rotation.x -= delta * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color={color} size={size} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
    </Points>
  );
}

// Layer 3, 5, 6: Floating Geometries
function FloatingGlassObjects() {
  return (
    <group position={[0, 0, -2]}>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <Icosahedron args={[1, 0]} position={[-3, 1, -2]}>
          <MeshTransmissionMaterial 
            transmission={0.9} 
            thickness={1} 
            roughness={0.1} 
            chromaticAberration={0.04} 
            color="#fb7185" 
          />
        </Icosahedron>
      </Float>

      <Float speed={1.5} rotationIntensity={2} floatIntensity={3}>
        <Torus args={[0.8, 0.2, 16, 32]} position={[3, -1, -4]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <meshStandardMaterial color="#38bdf8" wireframe opacity={0.5} transparent />
        </Torus>
      </Float>

      <Float speed={1} rotationIntensity={1} floatIntensity={1.5}>
        <mesh position={[0, 2, -6]}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <MeshTransmissionMaterial 
            transmission={0.8} 
            thickness={2} 
            roughness={0.2} 
            color="#a78bfa" 
          />
        </mesh>
      </Float>
    </group>
  );
}

// Camera Controller (Smooth Interpolation)
function CameraRig() {
  const location = useLocation();
  const { camera, pointer } = useThree();
  
  useFrame((_state, delta) => {
    let targetZ = 6;
    let targetX = 0;
    let targetY = 0;
    
    // Smooth transition between pages
    if (location.pathname.includes('/dashboard')) {
      targetZ = 4;
      targetX = -1;
    } else if (location.pathname.includes('/courses')) {
      targetZ = 2;
      targetX = 1;
    } else if (location.pathname.includes('/fee-management')) {
      targetZ = 5;
      targetX = 2;
      targetY = 1;
    } else if (location.pathname.includes('/login')) {
      targetZ = 8;
      targetX = 0;
    }

    // Parallax mouse movement
    const mouseX = pointer.x * 0.8;
    const mouseY = pointer.y * 0.8;

    easing.damp3(camera.position, [targetX + mouseX, targetY + mouseY, targetZ], 0.4, delta);
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

export function ParallaxBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#f1f5f9']} />
        <fog attach="fog" args={['#f1f5f9', 4, 18]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#fb7185" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#38bdf8" />
        
        <Starfield count={2000} color="#94a3b8" size={0.03} radius={20} depth={30} />
        <Starfield count={1000} color="#cbd5e1" size={0.04} radius={15} depth={20} />
        
        <FloatingGlassObjects />
        <CameraRig />

        <EffectComposer>
          <Bloom luminanceThreshold={0.7} mipmapBlur intensity={0.4} />
          <Noise opacity={0.03} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
