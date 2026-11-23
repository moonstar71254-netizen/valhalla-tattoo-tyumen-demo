import React, { Component, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

const LINK_COUNT = 80;
const Z_REF = new THREE.Vector3(0, 0, 1);
const X_FALLBACK = new THREE.Vector3(1, 0, 0);

const KEYFRAMES = [
  {
    p: 0.0,
    camPos: [1.1, 1.8, 10.6],
    lookAt: [1.4, 0.8, 0.0],
    key: new THREE.Color('#E8EEF5'),
    rim: new THREE.Color('#FFFFFF'),
    fill: new THREE.Color('#9FB6CE'),
    emissive: new THREE.Color('#161C24'),
  },
  {
    p: 0.37,
    camPos: [-1.4, 0.6, 8.6],
    lookAt: [0.4, -0.3, 0.4],
    key: new THREE.Color('#C49B66'),
    rim: new THREE.Color('#F5D3A4'),
    fill: new THREE.Color('#78532A'),
    emissive: new THREE.Color('#24170B'),
  },
  {
    p: 0.65,
    camPos: [2.2, -0.4, 6.8],
    lookAt: [0.9, -0.5, 1.1],
    key: new THREE.Color('#B83B2A'),
    rim: new THREE.Color('#F26D5B'),
    fill: new THREE.Color('#6E1B13'),
    emissive: new THREE.Color('#280B08'),
  },
  {
    p: 1.0,
    camPos: [0.5, 0.8, 12.2],
    lookAt: [0.8, 0.2, 0.0],
    key: new THREE.Color('#C8A86B'),
    rim: new THREE.Color('#B7CEE4'),
    fill: new THREE.Color('#6F879E'),
    emissive: new THREE.Color('#181D24'),
  },
];

function sampleKeyframes(progress, out) {
  const clamped = Math.max(0, Math.min(1, progress));
  let a = KEYFRAMES[0];
  let b = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (clamped >= KEYFRAMES[i].p && clamped <= KEYFRAMES[i + 1].p) {
      a = KEYFRAMES[i];
      b = KEYFRAMES[i + 1];
      break;
    }
  }
  const span = b.p - a.p || 1;
  const rawT = (clamped - a.p) / span;
  const t = rawT * rawT * (3 - 2 * rawT);

  out.camX = THREE.MathUtils.lerp(a.camPos[0], b.camPos[0], t);
  out.camY = THREE.MathUtils.lerp(a.camPos[1], b.camPos[1], t);
  out.camZ = THREE.MathUtils.lerp(a.camPos[2], b.camPos[2], t);
  out.lookX = THREE.MathUtils.lerp(a.lookAt[0], b.lookAt[0], t);
  out.lookY = THREE.MathUtils.lerp(a.lookAt[1], b.lookAt[1], t);
  out.lookZ = THREE.MathUtils.lerp(a.lookAt[2], b.lookAt[2], t);

  out.key.copy(a.key).lerp(b.key, t);
  out.rim.copy(a.rim).lerp(b.rim, t);
  out.fill.copy(a.fill).lerp(b.fill, t);
  out.emissive.copy(a.emissive).lerp(b.emissive, t);
}

function ForgedChain({ progressRef }) {
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
    const xScale = isMobile ? 0.48 : 1.0;
    const points = [
      new THREE.Vector3(5.2 * xScale, 32, -1.6),
      new THREE.Vector3(4.8 * xScale, 22, 0.5),
      new THREE.Vector3(4.2 * xScale, 12, 1.4),
      new THREE.Vector3(3.8 * xScale, 3.5, 1.8),
      new THREE.Vector3(2.8 * xScale, -4.5, 1.5),
      new THREE.Vector3(-2.1 * xScale, -12.5, 1.1),
      new THREE.Vector3(-2.6 * xScale, -20.5, 1.5),
      new THREE.Vector3(2.6 * xScale, -28.5, 1.3),
      new THREE.Vector3(3.4 * xScale, -36.5, 0.5),
      new THREE.Vector3(-1.2 * xScale, -45.0, -1.2),
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
      sampled: {
        camX: 1.1,
        camY: 1.8,
        camZ: 10.6,
        lookX: 1.4,
        lookY: 0.8,
        lookZ: 0.0,
        key: new THREE.Color('#E8EEF5'),
        rim: new THREE.Color('#FFFFFF'),
        fill: new THREE.Color('#9FB6CE'),
        emissive: new THREE.Color('#161C24'),
      },
      smoothProgress: 0,
      lookCurrent: new THREE.Vector3(1.4, 0.8, 0),
    }),
    []
  );

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dt = Math.min(delta, 0.05);
    const targetProgress = progressRef.current || 0;
    scratch.smoothProgress += (targetProgress - scratch.smoothProgress) * Math.min(1, dt * 10);

    const p = scratch.smoothProgress;
    const travelOffset = p * 0.34;
    const elapsed = state.clock.getElapsedTime();

    for (let i = 0; i < LINK_COUNT; i++) {
      let t = (i / LINK_COUNT + travelOffset) % 1;
      if (t < 0) t += 1;

      curve.getPointAt(t, scratch.pos);
      curve.getTangentAt(t, scratch.tangent).normalize();

      scratch.pos.y += 9.5 - p * 16.0;
      scratch.pos.x += Math.sin(elapsed * 0.35 + i * 0.12) * 0.03;

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

    sampleKeyframes(p, scratch.sampled);
    const camLerp = 1 - Math.exp(-dt * 6);
    const mobileZOffset = isMobile ? 2.6 : 0;
    const targetCamX = isMobile ? scratch.sampled.camX * 0.45 : scratch.sampled.camX;
    const targetLookX = isMobile ? scratch.sampled.lookX * 0.35 : scratch.sampled.lookX;

    camera.position.x += (targetCamX - camera.position.x) * camLerp;
    camera.position.y += (scratch.sampled.camY - camera.position.y) * camLerp;
    camera.position.z += (scratch.sampled.camZ + mobileZOffset - camera.position.z) * camLerp;

    scratch.lookCurrent.x += (targetLookX - scratch.lookCurrent.x) * camLerp;
    scratch.lookCurrent.y += (scratch.sampled.lookY - scratch.lookCurrent.y) * camLerp;
    scratch.lookCurrent.z += (scratch.sampled.lookZ - scratch.lookCurrent.z) * camLerp;
    camera.lookAt(scratch.lookCurrent);

    const colorLerp = 1 - Math.exp(-dt * 7);
    if (keyLightRef.current) keyLightRef.current.color.lerp(scratch.sampled.key, colorLerp);
    if (rimLightRef.current) rimLightRef.current.color.lerp(scratch.sampled.rim, colorLerp);
    if (fillLightRef.current) fillLightRef.current.color.lerp(scratch.sampled.fill, colorLerp);
    if (materialRef.current) materialRef.current.emissive.lerp(scratch.sampled.emissive, colorLerp);
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 14, 34]} />

      <ambientLight intensity={0.45} color="#dce3ec" />
      <directionalLight
        ref={keyLightRef}
        position={[7, 9, 10]}
        intensity={5.6}
        color="#E8EEF5"
      />
      <directionalLight
        ref={rimLightRef}
        position={[-8, 3, 6]}
        intensity={3.8}
        color="#FFFFFF"
      />
      <pointLight
        ref={fillLightRef}
        position={[4, -5, 8]}
        intensity={30}
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
          envMapIntensity={1.85}
          clearcoat={0.35}
          clearcoatRoughness={0.15}
          emissive="#161C24"
          emissiveIntensity={0.48}
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

export default function ChainScene({ progressRef }) {
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
          camera={{ position: [1.1, 1.8, 10.6], fov: 42, near: 0.1, far: 80 }}
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
          <ForgedChain progressRef={progressRef} />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
