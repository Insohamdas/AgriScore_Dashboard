import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const CropField: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.03); // Deep slate fog

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.0);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x10b981, 1.5); // Emerald moonlight
    moonLight.position.set(5, 10, 5);
    scene.add(moonLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2, 20); // Golden glow
    goldLight.position.set(-5, 2, -5);
    scene.add(goldLight);

    // Crop Field (Instanced Mesh)
    const stalkCount = 2000;
    const geometry = new THREE.CylinderGeometry(0.02, 0.05, 1.5, 4);
    geometry.translate(0, 0.75, 0); // Pivot at bottom
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x34d399, // Emerald-400
      roughness: 0.4,
      metalness: 0.1,
      emissive: 0x064e3b,
      emissiveIntensity: 0.2
    });

    const mesh = new THREE.InstancedMesh(geometry, material, stalkCount);
    const dummy = new THREE.Object3D();
    const positions: {x: number, z: number}[] = [];

    // Distribute stalks
    for (let i = 0; i < stalkCount; i++) {
      const x = (Math.random() - 0.5) * 25;
      const z = (Math.random() - 0.5) * 15 - 2; // Push back slightly
      
      dummy.position.set(x, -1, z);
      
      // Random scale for variety
      const scale = 0.5 + Math.random() * 0.8;
      dummy.scale.set(scale, scale, scale);
      
      // Random initial rotation
      dummy.rotation.y = Math.random() * Math.PI;
      
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      
      // Store position for animation
      positions.push({ x, z });
    }
    
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);

    // Floating Particles (Pollen/Fireflies)
    const particleCount = 50;
    const pGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const pMaterial = new THREE.MeshBasicMaterial({ color: 0xfcd34d }); // Amber-300
    const particles = new THREE.InstancedMesh(pGeometry, pMaterial, particleCount);
    const pDummy = new THREE.Object3D();
    const pData: {x: number, y: number, z: number, speed: number, offset: number}[] = [];

    for(let i=0; i<particleCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = Math.random() * 4;
      const z = (Math.random() - 0.5) * 10;
      pData.push({
        x, y, z,
        speed: 0.01 + Math.random() * 0.02,
        offset: Math.random() * Math.PI * 2
      });
      pDummy.position.set(x, y, z);
      pDummy.updateMatrix();
      particles.setMatrixAt(i, pDummy.matrix);
    }
    scene.add(particles);

    // Animation
    let time = 0;
    const animate = () => {
      time += 0.005;

      // Animate Crops (Wind effect)
      for (let i = 0; i < stalkCount; i++) {
        const { x, z } = positions[i];
        
        // Wind calculation using sine waves
        const windX = Math.sin(time * 1.5 + x * 0.5 + z * 0.3) * 0.15;
        const windZ = Math.cos(time * 1.2 + x * 0.3 + z * 0.5) * 0.1;
        
        dummy.position.set(x, -1, z);
        // Re-apply scale (simplified, assuming uniform scale from init, but for perf we just use 1 or store it. 
        // To keep it simple and fast, we skip re-scaling or assume 1. 
        // If we want to keep scale, we need to store it. Let's just use a fixed scale variation based on index)
        const scale = 0.8 + (i % 5) * 0.1; 
        dummy.scale.set(scale, scale, scale);

        // Apply rotation
        dummy.rotation.x = windZ + 0.1; // Slight lean forward
        dummy.rotation.z = windX;
        dummy.rotation.y = (i * 132.1) % 3; // Restore random Y rotation
        
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      // Animate Particles
      for(let i=0; i<particleCount; i++) {
        const p = pData[i];
        p.y += Math.sin(time + p.offset) * 0.01;
        p.x += Math.cos(time * 0.5 + p.offset) * 0.01;
        
        pDummy.position.set(p.x, p.y, p.z);
        pDummy.updateMatrix();
        particles.setMatrixAt(i, pDummy.matrix);
      }
      particles.instanceMatrix.needsUpdate = true;

      // Gentle Camera Movement
      camera.position.x = Math.sin(time * 0.2) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ 
        background: 'linear-gradient(to bottom, #0f172a 0%, #064e3b 100%)',
        opacity: 0.9
      }}
    />
  );
};
