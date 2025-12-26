import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const SunriseField: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    // Warm morning fog
    scene.fog = new THREE.FogExp2(0xffedd5, 0.025); 

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // ============ LIGHTING ============
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.6);
    scene.add(ambientLight);

    // The Sun (Directional Light)
    const sunLight = new THREE.DirectionalLight(0xffaa00, 2.5);
    sunLight.position.set(10, 5, -10); // Low angle, coming from back-right
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Fill light (Blue sky reflection)
    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.5);
    fillLight.position.set(-5, 5, 5);
    scene.add(fillLight);

    // ============ VISIBLE SUN MESH ============
    const sunGeometry = new THREE.CircleGeometry(4, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff9900, 
      transparent: true, 
      opacity: 0.8 
    });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.position.set(8, 3, -20);
    scene.add(sunMesh);

    // ============ CROPS (Wheat/Paddy) ============
    const stalkCount = 2500;
    // Tapered cylinder for stalk
    const geometry = new THREE.CylinderGeometry(0.01, 0.04, 1.2, 4);
    geometry.translate(0, 0.6, 0); // Pivot at bottom
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xfcd34d, // Golden Wheat
      roughness: 0.6,
      metalness: 0.1,
      emissive: 0xd97706, // Amber glow
      emissiveIntensity: 0.1
    });

    const mesh = new THREE.InstancedMesh(geometry, material, stalkCount);
    const dummy = new THREE.Object3D();
    const positions: {x: number, z: number, scale: number, rotationOffset: number}[] = [];

    for (let i = 0; i < stalkCount; i++) {
      const x = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 20 - 5;
      
      dummy.position.set(x, -1.5, z);
      
      const scale = 0.6 + Math.random() * 0.6;
      dummy.scale.set(scale, scale, scale);
      
      dummy.rotation.y = Math.random() * Math.PI;
      // Slight random lean
      dummy.rotation.x = (Math.random() - 0.5) * 0.2;
      dummy.rotation.z = (Math.random() - 0.5) * 0.2;

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      
      positions.push({ 
        x, z, scale,
        rotationOffset: Math.random() * 100
      });
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);

    // ============ BIRDS ============
    const birdCount = 15;
    const birdGeo = new THREE.BufferGeometry();
    // Simple V shape
    const birdVertices = new Float32Array([
      0.2, 0, 0.1,
      0, 0, -0.1,
      -0.2, 0, 0.1
    ]);
    birdGeo.setAttribute('position', new THREE.BufferAttribute(birdVertices, 3));
    const birdMat = new THREE.MeshBasicMaterial({ color: 0x4b5563, side: THREE.DoubleSide });
    
    const birds: {mesh: THREE.Mesh, speed: number, offset: number}[] = [];
    
    for(let i=0; i<birdCount; i++) {
      const bird = new THREE.Mesh(birdGeo, birdMat);
      const x = (Math.random() - 0.5) * 20;
      const y = 2 + Math.random() * 4;
      const z = -5 - Math.random() * 10;
      bird.position.set(x, y, z);
      scene.add(bird);
      birds.push({
        mesh: bird,
        speed: 0.02 + Math.random() * 0.02,
        offset: Math.random() * Math.PI * 2
      });
    }

    // ============ ANIMATION ============
    let time = 0;
    const animate = () => {
      time += 0.008;

      // 1. Animate Crops (Gentle Morning Breeze)
      for (let i = 0; i < stalkCount; i++) {
        const { x, z, scale, rotationOffset } = positions[i];
        
        // Wind wave calculation
        const wind = Math.sin(time * 0.8 + x * 0.3 + z * 0.2) * 0.15;
        
        dummy.position.set(x, -1.5, z);
        dummy.scale.set(scale, scale, scale);
        
        // Apply wind rotation
        dummy.rotation.x = wind + 0.1; // Lean into wind slightly
        dummy.rotation.z = wind * 0.5;
        dummy.rotation.y = rotationOffset; // Keep original random rotation
        
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      // 2. Animate Birds
      birds.forEach(bird => {
        bird.mesh.position.x += bird.speed;
        bird.mesh.position.y += Math.sin(time * 2 + bird.offset) * 0.005;
        // Flapping effect (simple rotation)
        bird.mesh.rotation.z = Math.sin(time * 10 + bird.offset) * 0.2;
        
        // Reset if flies off screen
        if (bird.mesh.position.x > 15) {
          bird.mesh.position.x = -15;
          bird.mesh.position.y = 2 + Math.random() * 4;
        }
      });

      // 3. Camera Drift
      camera.position.x = Math.sin(time * 0.1) * 0.5;
      camera.lookAt(0, 1, 0);

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
        // Sunrise Gradient: Deep Orange -> Soft Yellow -> Morning Blue
        background: 'linear-gradient(to top, #fff7ed 0%, #ffedd5 40%, #bae6fd 100%)'
      }}
    />
  );
};
