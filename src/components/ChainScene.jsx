import React, { Component, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

const LINK_COUNT = 80;
const UP_AXIS = new THREE.Vector3(0, 1, 0);

const MOOD_LIGHTS = {
  hero: {
    key: '#E8EEF5',
    rim: '#FFFFFF',
    fill: '#9FB6CE',
    emissive: '#161C24',
  },
  space: {
    key: '#C49B66',
    rim: '#F2CFA0',
    fill: '#6E4C28',
    emissive: '#22170C',
  },
  services: {
    key: '#B83B2A',
    rim: '#F06A56',
    fill: '#6B1C14',
    emissive: '#260B08',
  },
  contacts: {
    key: '#C8A86B',
    rim: '#B7CEE4',
    fill: '#6B8299',
    emissive: '#171C22',
  },
};

function ForgedChain({ scrollRef, mood }) {
  const meshRef = useRef(null);
  const materialRef = useRef(null);
  const keyLightRef = useRef(null);
  const rimLightRef = useRef(null);
  const fillLightRef = useRef(null);
  const { size, camera } = useThree();

  const isMobile = size.width < 768;

  const geometry = useMemo(() => new THREE.TorusGeometry(0.5, 0.12, 24, 48), []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const curve = useMemo(() => {
    const xScale = isMobile ? 0.52 : 1.0;
    const points = [
      new THREE.Vector3(5.6 * xScale, 26, -1.6),
      new THREE.Vector3(5.2 * xScale, 18, 0.8),
      new THREE.Vector3(4.5 * xScale, 10, 1.5),
      new THREE.Vector3(4.1 * xScale, 3.2, 1.8),
      new THREE.Vector3(3.6 * xScale, -2.5, 1.5),
      new THREE.Vector3(-2.4 * xScale, -9.5, 0.9),
      new THREE.Vector3(-3.2 * xScale, -16.5, 1.6),
      new THREE.Vector3(3.4 * xScale, -23.5, 1.2),
      new THREE.Vector3(4.0 * xScale, -31, 0.4),
      new THREE.Vector3(-1.4 * xScale, -39, -1.4),
    ];
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  }, [isMobile]);

  const scratch = useMemo(
    () => ({
      dummy: new THREE.Object3D(),
      pos: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      twist: new THREE.Quaternion(),
      targetKey: new THREE.Color(),
      targetRim: new THREE.Color(),
      targetFill: new THREE.Color(),
      targetEmissive: new THREE.Color(),
      smoothScroll: 0,
    }),
    []
  );

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dt = Math.min(delta, 0.05);
    const targetScroll = scrollRef.current || 0;
    scratch.smoothScroll += (targetScroll - scratch.smoothScroll) * Math.min(1, dt * 8);

    const elapsed = state.clock.getElapsedTime();
    const travelOffset = scratch.smoothScroll * 0.46;

    for (let i = 0; i < LINK_COUNT; i++) {
      const baseT = i / LINK_COUNT;
      let t = (baseT + travelOffset) % 1;
      if (t < 0) t += 1;

      curve.getPointAt(t, scratch.pos);
      curve.getTangentAt(t, scratch.tangent).normalize();

      scratch.pos.y += 6.5 - scratch.smoothScroll * 13.0;
      scratch.pos.x += Math.sin(elapsed * 0.45 + i * 0.14) * 0.05;

      scratch.quat.setFromUnitVectors(UP_AXIS, scratch.tangent);

      const angle = (i % 2 === 0 ? Math.PI / 2 : 0) + elapsed * 0.12 + scratch.smoothScroll * 1.4;
      scratch.twist.setFromAxisAngle(scratch.tangent, angle);
      scratch.quat.premultiply(scratch.twist);

      scratch.dummy.position.copy(scratch.pos);
      scratch.dummy.quaternion.copy(scratch.quat);
      scratch.dummy.scale.set(1, 1.6, 1);
      scratch.dummy.updateMatrix();
      mesh.setMatrixAt(i, scratch.dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    const camX = (isMobile ? 0.4 : 1.0) + Math.sin(scratch.smoothScroll * Math.PI * 1.4) * (isMobile ? 0.55 : 1.25);
    const camY = 1.4 - scratch.smoothScroll * 2.8;
    const camZ = isMobile ? 13.4 : 10.8;

    camera.position.x += (camX - camera.position.x) * Math.min(1, dt * 4);
    camera.position.y += (camY - camera.position.y) * Math.min(1, dt * 4);
    camera.position.z += (camZ - camera.position.z) * Math.min(1, dt * 4);
    camera.lookAt(isMobile ? 0.4 : 1.3, camY - 0.6, 0);

    const palette = MOOD_LIGHTS[mood] || MOOD_LIGHTS.hero;
    const colorLerp = 1 - Math.exp(-dt * 5.2);

    if (keyLightRef.current) {
      scratch.targetKey.set(palette.key);
      keyLightRef.current.color.lerp(scratch.targetKey, colorLerp);
    }
    if (rimLightRef.current) {
      scratch.targetRim.set(palette.rim);
      rimLightRef.current.color.lerp(scratch.targetRim, colorLerp);
    }
    if (fillLightRef.current) {
      scratch.targetFill.set(palette.fill);
      fillLightRef.current.color.lerp(scratch.targetFill, colorLerp);
    }
    if (materialRef.current) {
      scratch.targetEmissive.set(palette.emissive);
      materialRef.current.emissive.lerp(scratch.targetEmissive, colorLerp);
    }
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 14, 34]} />

      <ambientLight intensity={0.45} color="#dce3ec" />
      <directionalLight
        ref={keyLightRef}
        position={[7, 9, 10]}
        intensity={5.4}
        color="#E8EEF5"
      />
      <directionalLight
        ref={rimLightRef}
        position={[-8, 3, 6]}
        intensity={3.6}
        color="#FFFFFF"
      />
      <pointLight
        ref={fillLightRef}
        position={[4, -5, 8]}
        intensity={28}
        distance={28}
        decay={1.6}
        color="#9FB6CE"
      />

      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={4.5}
          color="#ffffff"
          scale={[14, 4, 1]}
          position={[0, 8, 4]}
          rotation={[Math.PI / 2.4, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={3.8}
          color="#e8eef5"
          scale={[5, 14, 1]}
          position={[9, 1, 5]}
          rotation={[0, -Math.PI / 2.6, 0]}
        />
        <Lightformer
          form="rect"
          intensity={3.2}
          color="#d8dee8"
          scale={[5, 14, 1]}
          position={[-9, -1, 4]}
          rotation={[0, Math.PI / 2.6, 0]}
        />
        <Lightformer
          form="ring"
          intensity={2.4}
          color="#f3e6d3"
          scale={8}
          position={[2, -6, 6]}
          rotation={[-Math.PI / 3, 0, 0]}
        />
      </Environment>

      <instancedMesh ref={meshRef} args={[geometry, null, LINK_COUNT]} frustumCulled={false}>
        <meshPhysicalMaterial
          ref={materialRef}
          color="#6e7580"
          metalness={1}
          roughness={0.18}
          envMapIntensity={1.8}
          clearcoat={0.35}
          clearcoatRoughness={0.15}
          emissive="#161C24"
          emissiveIntensity={0.45}
        />
      </instancedMesh>
    </>
  );
}

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="webgl-fallback" aria-hidden="true" />;
    }
    return this.props.children;
  }
}

export default function ChainScene({ scrollRef, mood }) {
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const ctx = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!ctx) setWebglOk(false);
    } catch {
      setWebglOk(false);
    }
  }, []);

  if (!webglOk) {
    return <div className="webgl-fallback" aria-hidden="true" />;
  }

  return (
    <div className="canvas-layer" aria-hidden="true">
      <SceneErrorBoundary>
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [1.0, 1.4, 10.8], fov: 42, near: 0.1, far: 80 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.18,
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              setWebglOk(false);
            });
          }}
        >
          <ForgedChain scrollRef={scrollRef} mood={mood} />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
