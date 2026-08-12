'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface MarketOrbitSceneProps {
  className?: string;
  density?: 'compact' | 'full';
}

type SignalLine = {
  line: THREE.Line;
  target: THREE.Object3D;
  attribute: THREE.BufferAttribute;
};

export function MarketOrbitScene({ className, density = 'full' }: MarketOrbitSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(density === 'compact' ? 45 : 42, 1, 0.1, 100);
    camera.position.set(0, density === 'compact' ? 1.35 : 1.55, density === 'compact' ? 7.55 : 8.35);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const registerGeometry = <T extends THREE.BufferGeometry>(geometry: T) => {
      geometries.push(geometry);
      return geometry;
    };
    const registerMaterial = <T extends THREE.Material>(material: T) => {
      materials.push(material);
      return material;
    };

    const root = new THREE.Group();
    root.rotation.x = -0.28;
    root.rotation.z = 0.16;
    scene.add(root);

    scene.add(new THREE.AmbientLight(0xffffff, density === 'compact' ? 1.65 : 1.9));

    const keyLight = new THREE.PointLight(0xd8b4fe, density === 'compact' ? 42 : 50, 22);
    keyLight.position.set(3.4, 4.8, 4.6);
    scene.add(keyLight);

    const coolLight = new THREE.PointLight(0x67e8f9, density === 'compact' ? 26 : 32, 18);
    coolLight.position.set(-4.5, 1.6, 3.8);
    scene.add(coolLight);

    const makeLineMaterial = (color: number, opacity: number) => registerMaterial(new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    }));

    const makeRing = (radius: number, material: THREE.Material, rotation: [number, number, number], segments = 192) => {
      const points = Array.from({ length: segments }, (_, index) => {
        const angle = (index / segments) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      });
      const ring = new THREE.LineLoop(registerGeometry(new THREE.BufferGeometry().setFromPoints(points)), material);
      ring.rotation.set(...rotation);
      root.add(ring);
      return ring;
    };

    const portfolioCore = new THREE.Group();
    const coreShell = new THREE.Mesh(
      registerGeometry(new THREE.IcosahedronGeometry(0.68, 2)),
      registerMaterial(new THREE.MeshStandardMaterial({
        color: 0xe9d5ff,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.62,
        roughness: 0.18,
        metalness: 0.48,
        transparent: true,
        opacity: 0.92,
      })),
    );
    const coreWire = new THREE.Mesh(
      registerGeometry(new THREE.IcosahedronGeometry(0.78, 1)),
      registerMaterial(new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      })),
    );
    const corePulse = new THREE.Mesh(
      registerGeometry(new THREE.SphereGeometry(1.05, 48, 48)),
      registerMaterial(new THREE.MeshBasicMaterial({
        color: 0xc084fc,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
      })),
    );
    portfolioCore.add(corePulse, coreShell, coreWire);
    root.add(portfolioCore);

    const signalMaterial = makeLineMaterial(0xc4b5fd, 0.32);
    const assetRingMaterial = makeLineMaterial(0x67e8f9, 0.45);
    const secondaryRingMaterial = makeLineMaterial(0xc084fc, 0.25);
    const riskRingMaterial = makeLineMaterial(0xfbbf24, 0.48);
    const outerRiskMaterial = makeLineMaterial(0xfb7185, 0.2);

    const rings = [
      makeRing(2.05, assetRingMaterial, [0.9, 0.18, 0.12]),
      makeRing(2.82, secondaryRingMaterial, [1.14, -0.3, -0.32]),
      makeRing(3.52, riskRingMaterial, [0.72, 0.48, 0.42]),
      ...(density === 'full' ? [makeRing(4.18, outerRiskMaterial, [0.52, -0.55, 0.24])] : []),
    ];

    const grid = new THREE.GridHelper(density === 'compact' ? 7.4 : 8.4, density === 'compact' ? 12 : 14, 0x8b5cf6, 0x155e75);
    grid.position.y = -1.82;
    grid.rotation.y = 0.22;
    const gridMaterial = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterial.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.13;
      materials.push(material);
    });
    root.add(grid);

    const marketSignals = [
      { color: 0x34d399, radius: 2.08, height: 0.72, speed: 0.34, phase: 0 },
      { color: 0x22d3ee, radius: 2.68, height: 0.5, speed: 0.29, phase: 1.32 },
      { color: 0xfacc15, radius: 3.04, height: 0.9, speed: 0.25, phase: 2.55 },
      { color: 0xc084fc, radius: 2.38, height: 0.62, speed: 0.31, phase: 3.9 },
      ...(density === 'full' ? [{ color: 0xfb7185, radius: 3.32, height: 0.78, speed: 0.22, phase: 5.04 }] : []),
    ];

    const signalLines: SignalLine[] = [];
    const nodes = marketSignals.map((signal, index) => {
      const group = new THREE.Group();
      const node = new THREE.Mesh(
        registerGeometry(new THREE.SphereGeometry(0.17, 32, 32)),
        registerMaterial(new THREE.MeshStandardMaterial({
          color: signal.color,
          emissive: signal.color,
          emissiveIntensity: 1.1,
          roughness: 0.22,
          metalness: 0.42,
        })),
      );
      const halo = new THREE.Mesh(
        registerGeometry(new THREE.SphereGeometry(0.36, 32, 32)),
        registerMaterial(new THREE.MeshBasicMaterial({
          color: signal.color,
          transparent: true,
          opacity: 0.13,
          depthWrite: false,
        })),
      );
      const beacon = new THREE.Mesh(
        registerGeometry(new THREE.CylinderGeometry(0.045, 0.045, signal.height, 20)),
        registerMaterial(new THREE.MeshBasicMaterial({
          color: signal.color,
          transparent: true,
          opacity: 0.72,
        })),
      );
      beacon.position.y = -0.42 - signal.height / 2;

      group.add(halo, node, beacon);
      group.userData = { ...signal, index };
      root.add(group);

      const lineGeometry = registerGeometry(new THREE.BufferGeometry());
      const positions = new Float32Array(6);
      const attribute = new THREE.BufferAttribute(positions, 3);
      lineGeometry.setAttribute('position', attribute);
      const line = new THREE.Line(lineGeometry, signalMaterial);
      root.add(line);
      signalLines.push({ line, target: group, attribute });

      return group;
    });

    const ribbonPoints = Array.from({ length: density === 'compact' ? 34 : 42 }, (_, index) => {
      const progress = index / (density === 'compact' ? 33 : 41);
      const x = -3.35 + progress * 6.7;
      const y = -1.08 + Math.sin(index * 0.48) * 0.22 + progress * 0.86;
      const z = -0.52 + Math.cos(index * 0.31) * 0.24;
      return new THREE.Vector3(x, y, z);
    });
    const priceRibbon = new THREE.Line(
      registerGeometry(new THREE.BufferGeometry().setFromPoints(ribbonPoints)),
      makeLineMaterial(0x5eead4, 0.88),
    );
    priceRibbon.rotation.y = -0.2;
    root.add(priceRibbon);

    const ribbonMarkers = ribbonPoints.filter((_, index) => index % 6 === 0).map((point, index) => {
      const marker = new THREE.Mesh(
        registerGeometry(new THREE.SphereGeometry(0.045, 18, 18)),
        registerMaterial(new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? 0x5eead4 : 0xfbbf24,
          transparent: true,
          opacity: 0.9,
        })),
      );
      marker.position.copy(point);
      marker.rotation.y = priceRibbon.rotation.y;
      root.add(marker);
      return marker;
    });

    const starGeometry = registerGeometry(new THREE.BufferGeometry());
    const starCount = density === 'compact' ? 190 : 280;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const seed = Math.sin(i * 12.9898) * 43758.5453;
      const seed2 = Math.sin(i * 78.233) * 24634.6345;
      const seed3 = Math.sin(i * 37.719) * 96321.9123;
      starPositions[i * 3] = ((seed - Math.floor(seed)) - 0.5) * 12;
      starPositions[i * 3 + 1] = ((seed2 - Math.floor(seed2)) - 0.5) * 8;
      starPositions[i * 3 + 2] = ((seed3 - Math.floor(seed3)) - 0.5) * 8;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      registerMaterial(new THREE.PointsMaterial({ color: 0xd8b4fe, size: 0.018, transparent: true, opacity: 0.7 })),
    );
    scene.add(stars);

    const pointer = { x: 0, y: 0 };
    const handlePointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    host.addEventListener('pointermove', handlePointerMove);

    const resize = () => {
      const width = Math.max(host.clientWidth, 320);
      const height = Math.max(host.clientHeight, 320);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frameId = 0;
    const startTime = performance.now();
    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      root.rotation.y += ((pointer.x * 0.16) - root.rotation.y) * 0.035;
      root.rotation.x += ((-0.28 - pointer.y * 0.08) - root.rotation.x) * 0.035;

      portfolioCore.rotation.y += prefersReducedMotion ? 0 : 0.006;
      portfolioCore.rotation.x = Math.sin(elapsed * 0.55) * 0.08;
      corePulse.scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.08);

      rings.forEach((ring, index) => {
        ring.rotation.z += prefersReducedMotion ? 0 : 0.0018 + index * 0.00065;
      });

      nodes.forEach((node) => {
        const angle = node.userData.phase + elapsed * node.userData.speed;
        const radius = node.userData.radius;
        node.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 0.86 + node.userData.index * 0.42) * 0.88,
          Math.sin(angle) * radius * 0.48,
        );
        node.scale.setScalar(1 + Math.sin(elapsed * 2.2 + node.userData.phase) * 0.08);
        const beacon = node.children[2];
        beacon.scale.y = 1 + Math.sin(elapsed * 2.4 + node.userData.phase) * 0.16;
      });

      signalLines.forEach(({ target, attribute }) => {
        const positions = attribute.array as Float32Array;
        positions[0] = 0;
        positions[1] = 0;
        positions[2] = 0;
        positions[3] = target.position.x;
        positions[4] = target.position.y;
        positions[5] = target.position.z;
        attribute.needsUpdate = true;
      });

      priceRibbon.position.y = Math.sin(elapsed * 0.8) * 0.05;
      ribbonMarkers.forEach((marker, index) => {
        marker.scale.setScalar(1 + Math.sin(elapsed * 2.6 + index) * 0.18);
        marker.position.y = ribbonPoints[index * 6]?.y ?? marker.position.y;
        marker.position.y += priceRibbon.position.y;
      });
      grid.rotation.y += prefersReducedMotion ? 0 : 0.0009;
      stars.rotation.y += prefersReducedMotion ? 0 : 0.00075;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      host.removeEventListener('pointermove', handlePointerMove);
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    };
  }, [density]);

  return <div ref={hostRef} className={cn('absolute inset-0', className)} aria-hidden="true" />;
}
