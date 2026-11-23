import React, { Component, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

const LINK_COUNT = 80;
const MONOLITH_COUNT = 8;
const RUNE_STUD_COUNT = 12;
const PARTICLE_COUNT = 250;

const Z_REF = new THREE.Vector3(0, 0, 1);
const X_FALLBACK = new THREE.Vector3(1, 0, 0);

export const SCENE_CAMERA_PRESETS = [
  {
    cam: [0.4, 0.8, 10.2],
    look: [1.6, 0.2, 0.5],
    yShift: 8.5,
    haloPos: [2.35, 0.25, 2.3],
    haloScale: 1.0,
    haloRotY: -0.28,
    key: '#E8EEF5',
    rim: '#FFFFFF',
    fill: '#B6CBE0',
    emissive: '#1A222E',
    cursorLight: '#E8EEF5',
  },
  {
    cam: [-1.5, 1.35, 6.2],
    look: [1.75, 0.05, -0.5],
    yShift: 4.0,
    haloPos: [2.8, 0.4, -2.6],
    haloScale: 1.25,
    haloRotY: 0.42,
    key: '#C49B66',
    rim: '#FFE0B2',
    fill: '#8E6230',
    emissive: '#291A0C',
    cursorLight: '#E2B478',
  },
  {
    cam: [5.5, 0.35, 6.1],
    look: [1.1, -0.25, 0.8],
    yShift: -0.5,
    haloPos: [1.2, -1.6, -5.2],
    haloScale: 0.72,
    haloRotY: 1.15,
    key: '#D8A96E',
    rim: '#F5DFC2',
    fill: '#7F5932',
    emissive: '#26180D',
    cursorLight: '#E8BE82',
  },
  {
    cam: [2.8, -3.5, 5.4],
    look: [1.45, -0.2, 1.0],
    yShift: -5.0,
    haloPos: [3.4, 2.4, -4.4],
    haloScale: 0.62,
    haloRotY: 1.85,
    key: '#C94432',
    rim: '#FF7D6B',
    fill: '#8A2116',
    emissive: '#300C08',
    cursorLight: '#E55A44',
  },
  {
    cam: [-1.1, 2.0, 11.6],
    look: [1.2, 0.1, 0.0],
    yShift: -9.0,
    haloPos: [-0.6, 1.6, -3.4],
    haloScale: 0.88,
    haloRotY: 2.4,
    key: '#C8A86B',
    rim: '#C8DCF0',
    fill: '#7D96AE',
    emissive: '#1B222B',
    cursorLight: '#E5C47E',
  },
];

const MONOLITH_FORMATIONS = [
  [
    [4.4, 2.3, 2.6, 0.95],
    [0.5, 2.7, -1.4, 0.78],
    [4.9, -1.9, 1.5, 1.08],
    [0.4, -2.4, 2.9, 0.72],
    [3.1, 3.2, -3.2, 0.85],
    [5.8, 0.2, -2.0, 1.0],
    [-1.4, 1.9, -4.1, 0.75],
    [2.0, -3.1, -1.2, 0.9],
  ],
  [
    [5.8, 3.1, 0.8, 1.05],
    [-1.8, 3.3, -2.6, 0.84],
    [6.1, -2.6, -0.4, 1.12],
    [-2.1, -2.8, 1.2, 0.8],
    [4.2, 3.8, -4.4, 0.9],
    [6.8, 0.5, -3.1, 1.02],
    [-3.1, 1.2, -4.8, 0.76],
    [3.6, -3.7, -2.5, 0.95],
  ],
  [
    [3.4, 2.2, 2.4, 1.0],
    [0.4, 1.8, 3.2, 0.82],
    [-1.0, 0.2, 1.4, 0.86],
    [0.6, -1.8, -0.8, 0.94],
    [3.6, -2.1, -1.2, 1.06],
    [4.8, -0.3, 0.6, 0.98],
    [2.0, 2.6, -2.4, 0.74],
    [2.1, -2.6, 2.2, 0.88],
  ],
  [
    [3.1, 2.1, 1.8, 1.02],
    [4.7, 0.7, 1.6, 0.92],
    [3.2, -0.9, 1.9, 1.06],
    [4.8, -2.3, 1.5, 0.88],
    [1.6, 1.7, -0.8, 0.78],
    [3.6, 0.1, -1.0, 0.84],
    [1.8, -1.7, -0.9, 0.8],
    [4.1, 1.4, -3.1, 0.72],
  ],
  [
    [-3.6, 3.1, -2.4, 0.88],
    [0.8, 3.6, -3.8, 0.78],
    [-4.2, -2.6, -1.8, 0.95],
    [0.2, -3.4, -2.9, 0.82],
    [4.8, 3.7, -4.6, 0.85],
    [5.6, -3.2, -4.1, 0.92],
    [-2.0, 0.6, -5.2, 0.74],
    [2.6, -3.8, -5.0, 0.8],
  ],
];

function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.65)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function ValhallaWorld({ sceneStateRef, pointerRef, activeScene }) {
  const chainRef = useRef(null);
  const chainMatRef = useRef(null);
  const haloGroupRef = useRef(null);
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const runeStudsRef = useRef(null);
  const monolithRef = useRef(null);
  const monolithMatRef = useRef(null);
  const particlesRef = useRef(null);

  const keyLightRef = useRef(null);
  const rimLightRef = useRef(null);
  const fillLightRef = useRef(null);
  const cursorLightRef = useRef(null);

  const { size, camera } = useThree();
  const isMobile = size.width < 768;

  const geometries = useMemo(() => {
    return {
      link: new THREE.TorusGeometry(0.5, 0.12, 22, 44),
      outerRing: new THREE.TorusGeometry(2.55, 0.09, 8, 48),
      innerRing: new THREE.TorusGeometry(1.98, 0.045, 6, 36),
      runeStud: new THREE.BoxGeometry(0.08, 0.25, 0.09),
      monolith: new THREE.CylinderGeometry(0.14, 0.31, 1.32, 6, 1),
    };
  }, []);

  const particleData = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);

    const cDust = new THREE.Color('#c8d5e4');
    const cBronze = new THREE.Color('#d49a5a');
    const cRuby = new THREE.Color('#e04d38');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const spreadX = (Math.random() - 0.5) * 24;
      const spreadY = (Math.random() - 0.5) * 16;
      const spreadZ = i < PARTICLE_COUNT * 0.25 ? 2.5 + Math.random() * 5.2 : -9.5 + Math.random() * 12;

      positions[i3] = spreadX;
      positions[i3 + 1] = spreadY;
      positions[i3 + 2] = spreadZ;

      const r = Math.random();
      const col = r < 0.62 ? cDust : r < 0.86 ? cBronze : cRuby;
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      speeds[i] = 0.16 + Math.random() * 0.42;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const tex = createParticleTexture();
    return { geo, speeds, phases, tex };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      particleData.geo.dispose();
      particleData.tex.dispose();
    };
  }, [geometries, particleData]);

  useEffect(() => {
    const studs = runeStudsRef.current;
    if (!studs) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < RUNE_STUD_COUNT; i++) {
      const angle = (i / RUNE_STUD_COUNT) * Math.PI * 2;
      const r = 2.26;
      dummy.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
      dummy.rotation.set(0, 0, angle - Math.PI / 2);
      dummy.scale.set(1, i % 2 === 0 ? 1.15 : 0.72, 1);
      dummy.updateMatrix();
      studs.setMatrixAt(i, dummy.matrix);
    }
    studs.instanceMatrix.needsUpdate = true;
  }, []);

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

  const scratch = useMemo(() => {
    const shardStates = MONOLITH_FORMATIONS[0].map(([x, y, z, s], idx) => ({
      x,
      y,
      z,
      s,
      rx: idx * 0.7,
      ry: idx * 1.1,
      rz: idx * 0.4,
      sx: 0.75 + (idx % 3) * 0.18,
      sy: 0.85 + ((idx + 1) % 3) * 0.25,
      sz: 0.7 + (idx % 2) * 0.22,
    }));

    return {
      pos: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      side: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      basis: new THREE.Matrix4(),
      quat: new THREE.Quaternion(),
      oddRot: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2),
      scale: new THREE.Vector3(1, 1.6, 1),
      matrix: new THREE.Matrix4(),
      dummy: new THREE.Object3D(),
      smoothPtrX: 0,
      smoothPtrY: 0,
      lookVec: new THREE.Vector3(1.6, 0.2, 0.5),
      shardStates,
    };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = sceneStateRef.current;
    const elapsed = state.clock.getElapsedTime();
    const xMul = isMobile ? 0.5 : 1.0;

    const chain = chainRef.current;
    if (chain) {
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
        chain.setMatrixAt(i, scratch.matrix);
      }
      chain.instanceMatrix.needsUpdate = true;
    }

    if (haloGroupRef.current) {
      const hScale = s.haloScale * (isMobile ? 0.66 : 1.0);
      haloGroupRef.current.position.set(
        s.haloX * xMul,
        s.haloY + Math.sin(elapsed * 0.6) * 0.12,
        s.haloZ
      );
      haloGroupRef.current.rotation.set(
        0.18 + Math.sin(elapsed * 0.4) * 0.06,
        s.haloRotY + scratch.smoothPtrX * 0.18,
        Math.cos(elapsed * 0.32) * 0.05
      );
      haloGroupRef.current.scale.setScalar(hScale);
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = elapsed * 0.16;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -elapsed * 0.28;
      innerRingRef.current.rotation.x = Math.sin(elapsed * 0.45) * 0.22;
    }

    const monolith = monolithRef.current;
    if (monolith) {
      const targetFormation = MONOLITH_FORMATIONS[activeScene] || MONOLITH_FORMATIONS[0];
      const lerpFactor = 1 - Math.exp(-dt * 4.2);
      const dummy = scratch.dummy;

      for (let i = 0; i < MONOLITH_COUNT; i++) {
        const st = scratch.shardStates[i];
        const [tx, ty, tz, ts] = targetFormation[i];

        st.x += (tx * xMul - st.x) * lerpFactor;
        st.y += (ty - st.y) * lerpFactor;
        st.z += (tz - st.z) * lerpFactor;
        st.s += (ts * (isMobile ? 0.72 : 1.0) - st.s) * lerpFactor;

        const bobY = Math.sin(elapsed * (0.7 + i * 0.09) + i * 1.4) * 0.14;
        const driftX = Math.cos(elapsed * (0.5 + i * 0.07) + i) * 0.09;

        dummy.position.set(st.x + driftX, st.y + bobY, st.z);
        dummy.rotation.set(
          st.rx + elapsed * (0.14 + (i % 3) * 0.05),
          st.ry + elapsed * (0.2 + (i % 2) * 0.08) + s.chainOffset * 2.2,
          st.rz + Math.sin(elapsed * 0.4 + i) * 0.15
        );
        dummy.scale.set(st.sx * st.s, st.sy * st.s, st.sz * st.s);
        dummy.updateMatrix();
        monolith.setMatrixAt(i, dummy.matrix);
      }
      monolith.instanceMatrix.needsUpdate = true;
    }

    if (particlesRef.current) {
      const posAttr = particleData.geo.attributes.position;
      const arr = posAttr.array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        arr[i3 + 1] += particleData.speeds[i] * dt;
        arr[i3] += Math.sin(elapsed * 0.55 + particleData.phases[i]) * 0.12 * dt;
        if (arr[i3 + 1] > 8.5) {
          arr[i3 + 1] = -8.5;
        }
      }
      posAttr.needsUpdate = true;
      particlesRef.current.rotation.y = scratch.smoothPtrX * 0.08 + s.chainOffset * 0.6;
    }

    const ptrLerp = 1 - Math.exp(-dt * 5.5);
    scratch.smoothPtrX += (pointerRef.current.x - scratch.smoothPtrX) * ptrLerp;
    scratch.smoothPtrY += (pointerRef.current.y - scratch.smoothPtrY) * ptrLerp;

    const mobileZ = isMobile ? 2.6 : 0;
    camera.position.set(
      s.camX * xMul + scratch.smoothPtrX * 0.5,
      s.camY + scratch.smoothPtrY * 0.45,
      s.camZ + mobileZ
    );
    scratch.lookVec.set(s.lookX * xMul, s.lookY, s.lookZ);
    camera.lookAt(scratch.lookVec);

    if (cursorLightRef.current) {
      if (isMobile) {
        cursorLightRef.current.position.set(
          Math.sin(elapsed * 0.55) * 4.2,
          Math.sin(elapsed * 1.1) * 2.5,
          5.6
        );
      } else {
        cursorLightRef.current.position.set(
          scratch.smoothPtrX * 6.8 + 1.2,
          scratch.smoothPtrY * 4.2,
          5.8
        );
      }
      cursorLightRef.current.color.setRGB(s.curR, s.curG, s.curB);
    }

    if (keyLightRef.current) keyLightRef.current.color.setRGB(s.keyR, s.keyG, s.keyB);
    if (rimLightRef.current) rimLightRef.current.color.setRGB(s.rimR, s.rimG, s.rimB);
    if (fillLightRef.current) fillLightRef.current.color.setRGB(s.fillR, s.fillG, s.fillB);
    if (chainMatRef.current) chainMatRef.current.emissive.setRGB(s.emR, s.emG, s.emB);
    if (monolithMatRef.current) monolithMatRef.current.emissive.setRGB(s.emR, s.emG, s.emB);
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 14, 34]} />

      <ambientLight intensity={0.58} color="#e5ecf5" />
      <directionalLight ref={keyLightRef} position={[6, 9, 10]} intensity={6.2} color="#E8EEF5" />
      <directionalLight ref={rimLightRef} position={[-8, 4, 7]} intensity={4.5} color="#FFFFFF" />
      <pointLight
        ref={fillLightRef}
        position={[4, -4, 8]}
        intensity={34}
        distance={30}
        decay={1.5}
        color="#B6CBE0"
      />
      <pointLight
        ref={cursorLightRef}
        position={[2, 1, 5.8]}
        intensity={48}
        distance={24}
        decay={1.4}
        color="#E8EEF5"
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

      <instancedMesh ref={chainRef} args={[geometries.link, null, LINK_COUNT]} frustumCulled={false}>
        <meshPhysicalMaterial
          ref={chainMatRef}
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

      <group ref={haloGroupRef} position={[2.35, 0.25, 2.3]}>
        <mesh ref={outerRingRef} geometry={geometries.outerRing}>
          <meshPhysicalMaterial
            color="#6f7885"
            metalness={1}
            roughness={0.2}
            envMapIntensity={2.1}
            clearcoat={0.4}
            flatShading
          />
        </mesh>
        <mesh ref={innerRingRef} geometry={geometries.innerRing}>
          <meshPhysicalMaterial
            color="#a28f72"
            metalness={1}
            roughness={0.18}
            envMapIntensity={2.3}
            clearcoat={0.5}
          />
        </mesh>
        <instancedMesh
          ref={runeStudsRef}
          args={[geometries.runeStud, null, RUNE_STUD_COUNT]}
          frustumCulled={false}
        >
          <meshPhysicalMaterial
            color="#9aa4b2"
            metalness={1}
            roughness={0.15}
            envMapIntensity={2.4}
          />
        </instancedMesh>
      </group>

      <instancedMesh
        ref={monolithRef}
        args={[geometries.monolith, null, MONOLITH_COUNT]}
        frustumCulled={false}
      >
        <meshPhysicalMaterial
          ref={monolithMatRef}
          color="#3a3f48"
          metalness={0.96}
          roughness={0.22}
          envMapIntensity={2.0}
          clearcoat={0.6}
          clearcoatRoughness={0.12}
          flatShading
          emissive="#1A222E"
          emissiveIntensity={0.45}
        />
      </instancedMesh>

      <points ref={particlesRef} geometry={particleData.geo} frustumCulled={false}>
        <pointsMaterial
          size={0.16}
          map={particleData.tex}
          vertexColors
          transparent
          opacity={0.78}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
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

export default function ChainScene({ sceneStateRef, pointerRef, activeScene }) {
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
          camera={{ position: [0.4, 0.8, 10.2], fov: 42, near: 0.1, far: 80 }}
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
          <ValhallaWorld
            sceneStateRef={sceneStateRef}
            pointerRef={pointerRef}
            activeScene={activeScene}
          />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
