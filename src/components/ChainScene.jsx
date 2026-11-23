import React, { Component, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

const LINK_COUNT = 80;
const Z_REF = new THREE.Vector3(0, 0, 1);
const X_FALLBACK = new THREE.Vector3(1, 0, 0);

export const SCENE_CAMERA_PRESETS = [
  {
    cam: [0.8, 1.4, 9.8],
    look: [1.5, 0.5, 0.0],
    yShift: 8.5,
    key: '#E8EEF5',
    rim: '#FFFFFF',
    fill: '#B6CBE0',
    emissive: '#1A222E',
  },
  {
    cam: [-2.8, 2.2, 8.2],
    look: [0.9, -0.3, 0.6],
    yShift: 4.0,
    key: '#C49B66',
    rim: '#FFE0B2',
    fill: '#8E6230',
    emissive: '#291A0C',
  },
  {
    cam: [1.8, -0.2, 5.3],
    look: [1.4, -0.4, 1.4],
    yShift: -0.5,
    key: '#D8A96E',
    rim: '#F5DFC2',
    fill: '#7F5932',
    emissive: '#26180D',
  },
  {
    cam: [3.2, -3.1, 6.2],
    look: [1.5, -0.5, 1.1],
    yShift: -5.0,
    key: '#B83B2A',
    rim: '#FF7966',
    fill: '#8A2116',
    emissive: '#300C08',
  },
  {
    cam: [-0.9, 0.9, 11.4],
    look: [1.2, 0.2, 0.0],
    yShift: -9.0,
    key: '#C8A86B',
    rim: '#C8DCF0',
    fill: '#7D96AE',
    emissive: '#1B222B',
  },
];

function ForgedChain({ sceneStateRef, pointerRef }) {
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
    const xScale = isMobile ? 0.54 : 1.0;
    const points = [
      new THREE.Vector3(5.0 * xScale, 32, -1.2),
      new THREE.Vector3(4.5 * xScale, 22, 0.7),
      new THREE.Vector3(3.8 * xScale, 12, 1.5),
      new THREE.Vector3(3.4 * xScale, 3.5, 1.9),
      new THREE.Vector3(2.4 * xScale, -4.5, 1.6),
      new THREE.Vector3(-1.8 * xScale, -12.5, 1.2),
      new THREE.Vector3(-2.4 * xScale, -20.5, 1.6),
      new THREE.Vector3(2.5 * xScale, -28.5, 1.4),
      new THREE.Vector3(3.2 * xScale, -36.5, 0.6),
      new THREE.Vector3(-1.1 * xScale, -45.0, -1.0),
    ];
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  }, [isMobile]);

  const scratch = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      side: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      basis: new THREE.Matrix4(),
      quat: new THREE.Quaternion(),
      oddRot: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2),
      scale: new THREE.Vector3(1, 1.6, 1),
      matrix: new THREE.Matrix4(),
      smoothPtrX: 0,
      smoothPtrY: 0,
      lookVec: new THREE.Vector3(1.5, 0.5, 0),
    }),
    []
  );

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dt = Math.min(delta, 0.05);
    const s = sceneStateRef.current;
    const elapsed = state.clock.getElapsedTime();

    for (let i = 0; i < LINK_COUNT; i++) {
      let t = (i / LINK_COUNT + s.chainOffset) % 1;
      if (t < 0) t += 1;

      curve.getPointAt(t, scratch.pos);
      curve.getTangentAt(t, scratch.tangent).normalize();

      scratch.pos.y += s.yShift + Math.sin(elapsed * 0.85 + i * 0.22) * 0.04;
      scratch.pos.x += Math.cos(elapsed * 0.65 + i * 0.18) * 0.045;

      const refAxis = Math.abs(scratch.tangent.dot(Z_REF)) > 0.98 ? X_FALLBACK : Z_REF;
      scratch.side.crossVectors(scratch.tangent, refAxis).normalize();
      scratch.forward.crossVectors(scratch.side, scratch.tangent).normalize();

      scratch.basis.makeBasis(scratch.side, scratch.tangent, scratch.forward);
      scratch.quat.setFromRotationMatrix(scratch.basis);

      if (i % 2 === 1) {
        scratch.quat.multiply(scratch.oddRot);
      }

      scratch.matrix.compose(scratch.pos, scratch.quat, scratch.scale);
      mesh.setMatrixAt(i, scratch.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    const ptrLerp = 1 - Math.exp(-dt * 5.5);
    scratch.smoothPtrX += (pointerRef.current.x - scratch.smoothPtrX) * ptrLerp;
    scratch.smoothPtrY += (pointerRef.current.y - scratch.smoothPtrY) * ptrLerp;

    const mobileZ = isMobile ? 2.4 : 0;
    const xMul = isMobile ? 0.48 : 1.0;

    camera.position.set(
      s.camX * xMul + scratch.smoothPtrX * 0.45,
      s.camY + scratch.smoothPtrY * 0.45,
      s.camZ + mobileZ
    );
    scratch.lookVec.set(s.lookX * xMul, s.lookY, s.lookZ);
    camera.lookAt(scratch.lookVec);

    if (keyLightRef.current) keyLightRef.current.color.setRGB(s.keyR, s.keyG, s.keyB);
    if (rimLightRef.current) rimLightRef.current.color.setRGB(s.rimR, s.rimG, s.rimB);
    if (fillLightRef.current) fillLightRef.current.color.setRGB(s.fillR, s.fillG, s.fillB);
    if (materialRef.current) materialRef.current.emissive.setRGB(s.emR, s.emG, s.emB);
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 15, 36]} />

      <ambientLight intensity={0.62} color="#e5ecf5" />
      <directionalLight ref={keyLightRef} position={[6, 9, 10]} intensity={6.4} color="#E8EEF5" />
      <directionalLight ref={rimLightRef} position={[-8, 4, 7]} intensity={4.6} color="#FFFFFF" />
      <pointLight
        ref={fillLightRef}
        position={[4, -4, 8]}
        intensity={36}
        distance={30}
        decay={1.5}
        color="#B6CBE0"
      />

      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={5.6}
          color="#ffffff"
          scale={[16, 5, 1]}
          position={[0, 8, 5]}
          rotation={[Math.PI / 2.4, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={4.8}
          color="#edf3fa"
          scale={[6, 15, 1]}
          position={[9, 1, 6]}
          rotation={[0, -Math.PI / 2.5, 0]}
        />
        <Lightformer
          form="rect"
          intensity={4.0}
          color="#dde5f0"
          scale={[6, 15, 1]}
          position={[-9, -1, 5]}
          rotation={[0, Math.PI / 2.5, 0]}
        />
        <Lightformer
          form="ring"
          intensity={3.0}
          color="#f7ebd8"
          scale={9}
          position={[2, -6, 6]}
          rotation={[-Math.PI / 3, 0, 0]}
        />
      </Environment>

      <instancedMesh ref={meshRef} args={[geometry, null, LINK_COUNT]} frustumCulled={false}>
        <meshPhysicalMaterial
          ref={materialRef}
          color="#868f9c"
          metalness={1}
          roughness={0.16}
          envMapIntensity={2.25}
          clearcoat={0.45}
          clearcoatRoughness={0.14}
          emissive="#1A222E"
          emissiveIntensity={0.55}
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

export default function ChainScene({ sceneStateRef, pointerRef }) {
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
          camera={{ position: [0.8, 1.4, 9.8], fov: 42, near: 0.1, far: 80 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.24,
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              setWebglOk(false);
            });
          }}
        >
          <ForgedChain sceneStateRef={sceneStateRef} pointerRef={pointerRef} />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
