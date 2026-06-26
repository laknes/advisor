'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface MarketOrbitSceneProps {
  className?: string;
  density?: 'compact' | 'full';
}

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
    camera.position.set(0, density === 'compact' ? 1.15 : 1.4, density === 'compact' ? 7.4 : 8.2);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const root = new THREE.Group();
    root.rotation.x = -0.25;
    root.rotation.z = 0.18;
    scene.add(root);

    const ambient = new THREE.AmbientLight(0xffffff, density === 'compact' ? 1.55 : 1.8);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0x7dd3fc, density === 'compact' ? 28 : 35, 20);
    pointLight.position.set(-3, 4, 5);
    scene.add(pointLight);

    const ringMaterial = new THREE.LineBasicMaterial({
      color: 0x83e5ff,
      transparent: true,
      opacity: 0.38,
    });
    const secondaryRingMaterial = new THREE.LineBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.22,
    });

    const makeRing = (radius: number, material: THREE.Material, rotation: [number, number, number]) => {
      const points = Array.from({ length: 160 }, (_, index) => {
        const angle = (index / 159) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      });
      const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), material);
      ring.rotation.set(...rotation);
      root.add(ring);
      return ring;
    };

    const rings = [
      makeRing(2.35, ringMaterial, [0.88, 0.16, 0.15]),
      makeRing(3.05, secondaryRingMaterial, [1.1, -0.34, -0.35]),
      ...(density === 'full' ? [makeRing(3.72, secondaryRingMaterial, [0.7, 0.55, 0.42])] : []),
    ];

    const marketColors = density === 'compact'
      ? [0x34d399, 0x22d3ee, 0xfacc15, 0xc084fc]
      : [0x34d399, 0x22d3ee, 0xfacc15, 0xc084fc, 0xfb7185];
    const nodeGeometries: THREE.BufferGeometry[] = [];
    const nodeMaterials: THREE.Material[] = [];
    const nodes = marketColors.map((color, index) => {
      const group = new THREE.Group();
      const shellGeometry = new THREE.SphereGeometry(0.18, 32, 32);
      const shellMaterial = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.15,
        roughness: 0.28,
        metalness: 0.36,
      });
      const haloGeometry = new THREE.SphereGeometry(0.34, 32, 32);
      const haloMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      });
      const shell = new THREE.Mesh(
        shellGeometry,
        shellMaterial,
      );
      const halo = new THREE.Mesh(
        haloGeometry,
        haloMaterial,
      );
      nodeGeometries.push(shellGeometry, haloGeometry);
      nodeMaterials.push(shellMaterial, haloMaterial);
      group.add(shell, halo);
      group.userData.angle = index * 1.25;
      group.userData.radius = 2.38 + (index % 2) * 0.62;
      group.userData.speed = 0.35 + index * 0.035;
      root.add(group);
      return group;
    });

    const chartPoints = Array.from({ length: density === 'compact' ? 22 : 28 }, (_, index) => {
      const x = -3.3 + index * 0.25;
      const y = Math.sin(index * 0.55) * 0.32 + index * 0.032 - 0.85;
      const z = Math.cos(index * 0.28) * 0.32;
      return new THREE.Vector3(x, y, z);
    });
    const chart = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(chartPoints),
      new THREE.LineBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.82 }),
    );
    chart.rotation.y = -0.18;
    root.add(chart);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = density === 'compact' ? 180 : 260;
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
      new THREE.PointsMaterial({ color: 0xbdefff, size: 0.018, transparent: true, opacity: 0.7 }),
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
    const clock = new THREE.Clock();
    const render = () => {
      const elapsed = clock.getElapsedTime();
      root.rotation.y += ((pointer.x * 0.16) - root.rotation.y) * 0.035;
      root.rotation.x += ((-0.25 - pointer.y * 0.08) - root.rotation.x) * 0.035;
      rings.forEach((ring, index) => {
        ring.rotation.z += prefersReducedMotion ? 0 : 0.0016 + index * 0.0007;
      });
      nodes.forEach((node) => {
        const angle = node.userData.angle + elapsed * node.userData.speed;
        const radius = node.userData.radius;
        node.position.set(Math.cos(angle) * radius, Math.sin(angle * 0.92) * 0.95, Math.sin(angle) * radius * 0.44);
        node.scale.setScalar(1 + Math.sin(elapsed * 2 + node.userData.angle) * 0.08);
      });
      chart.position.y = Math.sin(elapsed * 0.8) * 0.05;
      stars.rotation.y += prefersReducedMotion ? 0 : 0.0008;
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
      starGeometry.dispose();
      (stars.material as THREE.Material).dispose();
      chart.geometry.dispose();
      (chart.material as THREE.Material).dispose();
      rings.forEach((ring) => ring.geometry.dispose());
      ringMaterial.dispose();
      secondaryRingMaterial.dispose();
      nodeGeometries.forEach((geometry) => geometry.dispose());
      nodeMaterials.forEach((material) => material.dispose());
    };
  }, [density]);

  return <div ref={hostRef} className={cn('absolute inset-0', className)} aria-hidden="true" />;
}
