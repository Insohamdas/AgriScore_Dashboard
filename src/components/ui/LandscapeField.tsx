import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const LandscapeField: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xfff7ed, 10, 50); // Soft white/orange fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.SoftShadowMap;
    container.appendChild(renderer.domElement);

    // ============ LIGHTING ============
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffaa00, 1.5);
    sunLight.position.set(10, 10, -10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // ============ LOW POLY TERRAIN ============
    const geometry = new THREE.PlaneGeometry(60, 60, 40, 40);
    
    // Displace vertices for rolling hills + furrows
    const posAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    const colors: number[] = [];
    const colorBase = new THREE.Color(0x5D4037); // Dark Soil
    const colorHigh = new THREE.Color(0x795548); // Lighter Soil
    const colorGreen = new THREE.Color(0x4caf50); // Grass patches

    for (let i = 0; i < posAttribute.count; i++) {
      vertex.fromBufferAttribute(posAttribute, i);
      
      // Create Furrows (Rows)
      const furrow = Math.sin(vertex.x * 2.5) * 0.15;
      
      // Create Rolling Hills
      const hill = Math.sin(vertex.x * 0.1) * Math.cos(vertex.y * 0.1) * 2;
      const detail = Math.sin(vertex.x * 0.5 + vertex.y * 0.5) * 0.5;

      vertex.z = hill + detail + furrow;
      posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);

      // Vertex Colors
      const mix = (vertex.z + 2) / 4; // Normalize roughly
      const finalColor = colorBase.clone().lerp(colorHigh, mix);
      if (vertex.z > 1.5) finalColor.lerp(colorGreen, 0.5); // Green tops
      
      colors.push(finalColor.r, finalColor.g, finalColor.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.8,
      metalness: 0.1,
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // ============ STYLIZED TREES ============
    const treeGroup = new THREE.Group();
    
    const createTree = (x: number, z: number, scale: number) => {
      const tree = new THREE.Group();
      
      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 1.5 * scale, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, flatShading: true });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.75 * scale;
      trunk.castShadow = true;
      tree.add(trunk);

      // Foliage (Low Poly Sphere/Icosahedron)
      const leavesGeo = new THREE.IcosahedronGeometry(1.2 * scale, 0);
      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, flatShading: true });
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.y = 2 * scale;
      leaves.castShadow = true;
      tree.add(leaves);

      tree.position.set(x, 0, z);
      
      // Adjust Y based on terrain height (approximate)
      const hill = Math.sin(x * 0.1) * Math.cos(-z * 0.1) * 2;
      const detail = Math.sin(x * 0.5 - z * 0.5) * 0.5;
      tree.position.y = hill + detail - 0.2;

      return tree;
    };

    // Add some trees
    treeGroup.add(createTree(-8, -5, 1.2));
    treeGroup.add(createTree(12, -8, 1.5));
    treeGroup.add(createTree(-15, -15, 2));
    treeGroup.add(createTree(5, -20, 1.8));
    treeGroup.add(createTree(-5, 5, 0.8)); // Closer small tree
    
    scene.add(treeGroup);

    // ============ SPROUTS (Crops) ============
    const sproutGeo = new THREE.ConeGeometry(0.1, 0.4, 4);
    const sproutMat = new THREE.MeshStandardMaterial({ color: 0x81c784, flatShading: true });
    const sproutMesh = new THREE.InstancedMesh(sproutGeo, sproutMat, 500);
    
    const dummy = new THREE.Object3D();
    let idx = 0;
    
    // Plant along the furrows
    for (let x = -20; x < 20; x += 0.8) {
      // Only plant on "ridges" of the sine wave
      // sin(x * 2.5) -> peaks at pi/5, etc.
      // Let's just plant in rows
      if (Math.sin(x * 2.5) > 0) {
        for (let z = -15; z < 10; z += 0.8) {
          if (idx >= 500) break;
          
          // Randomize slightly
          const rx = x + (Math.random() - 0.5) * 0.2;
          const rz = z + (Math.random() - 0.5) * 0.2;
          
          // Height calc
          const hill = Math.sin(rx * 0.1) * Math.cos(-rz * 0.1) * 2;
          const detail = Math.sin(rx * 0.5 - rz * 0.5) * 0.5;
          const furrow = Math.sin(rx * 2.5) * 0.15;
          
          dummy.position.set(rx, hill + detail + furrow + 0.2, -rz); // z is flipped in terrain rotation
          dummy.scale.setScalar(0.5 + Math.random() * 0.5);
          dummy.rotation.y = Math.random() * Math.PI;
          
          dummy.updateMatrix();
          sproutMesh.setMatrixAt(idx++, dummy.matrix);
        }
      }
    }
    sproutMesh.instanceMatrix.needsUpdate = true;
    sproutMesh.receiveShadow = true;
    sproutMesh.castShadow = true;
    scene.add(sproutMesh);


    // ============ SUN ============
    const sunGeo = new THREE.SphereGeometry(3, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(10, 8, -25);
    scene.add(sun);

    // ============ CLOUDS ============
    const cloudGroup = new THREE.Group();
    const cloudGeo = new THREE.DodecahedronGeometry(1, 0);
    const cloudMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      flatShading: true, 
      transparent: true, 
      opacity: 0.9 
    });

    const createCloud = (x: number, y: number, z: number, scale: number) => {
      const cloud = new THREE.Group();
      const main = new THREE.Mesh(cloudGeo, cloudMat);
      main.scale.setScalar(scale);
      cloud.add(main);
      
      const sub1 = new THREE.Mesh(cloudGeo, cloudMat);
      sub1.position.set(scale * 0.8, 0, 0);
      sub1.scale.setScalar(scale * 0.7);
      cloud.add(sub1);
      
      const sub2 = new THREE.Mesh(cloudGeo, cloudMat);
      sub2.position.set(-scale * 0.8, scale * 0.2, 0);
      sub2.scale.setScalar(scale * 0.6);
      cloud.add(sub2);

      cloud.position.set(x, y, z);
      return cloud;
    };

    const clouds = [
      createCloud(-10, 12, -15, 1.5),
      createCloud(5, 15, -20, 2),
      createCloud(15, 10, -10, 1.2),
    ];
    clouds.forEach(c => cloudGroup.add(c));
    scene.add(cloudGroup);


    // ============ ANIMATION ============
    let time = 0;
    const animate = () => {
      time += 0.002;

      // Rotate Clouds
      cloudGroup.children.forEach((cloud, i) => {
        cloud.position.x += 0.01 * (i + 1);
        if (cloud.position.x > 30) cloud.position.x = -30;
      });

      // Gentle Camera Sway
      camera.position.x = Math.sin(time * 0.5) * 2;
      camera.lookAt(0, 2, 0);

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
        // Soft Morning Gradient
        background: 'linear-gradient(to top, #fff7ed 0%, #ffcc80 100%)'
      }}
    />
  );
};
