/* ==========================================================================
   THREE.JS 3D ANIMATED SPORTS DATA BACKGROUND
   Subtle abstract rotating geometry, particle data nodes, and depth grid
   ========================================================================== */

(function() {
  const canvas = document.getElementById('bg3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  let scene, camera, renderer, particles, geometryGroup;
  let animId = null;
  let isPaused = false;

  function init3D() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Group for geometric elements
    geometryGroup = new THREE.Group();
    scene.add(geometryGroup);

    // 1. Abstract Sports Geometry (Wireframe Icosahedron & Dodecahedron)
    const icoGeo = new THREE.IcosahedronGeometry(80, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    geometryGroup.add(icoMesh);

    const dodGeo = new THREE.DodecahedronGeometry(130, 1);
    const dodMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    const dodMesh = new THREE.Mesh(dodGeo, dodMat);
    geometryGroup.add(dodMesh);

    // 2. Floating Data Particle Nodes
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 800;
      posArray[i + 1] = (Math.random() - 0.5) * 800;
      posArray[i + 2] = (Math.random() - 0.5) * 800;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 3.5,
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.35
    });

    particles = new THREE.Points(particleGeo, particleMat);
    geometryGroup.add(particles);

    // Respect reduced motion settings
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const userAnimSetting = localStorage.getItem('bg_anim_enabled');
    
    if (prefersReducedMotion || userAnimSetting === 'false') {
      isPaused = true;
      renderer.render(scene, camera);
    } else {
      animate();
    }

    window.addEventListener('resize', onWindowResize);
  }

  function animate() {
    if (isPaused) return;
    animId = requestAnimationFrame(animate);

    if (geometryGroup) {
      geometryGroup.rotation.x += 0.0008;
      geometryGroup.rotation.y += 0.0012;
    }

    if (particles) {
      particles.rotation.y -= 0.0005;
    }

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (isPaused) renderer.render(scene, camera);
  }

  // Global toggle function
  window.toggle3DAnimation = function(enable) {
    if (enable) {
      if (isPaused) {
        isPaused = false;
        animate();
      }
    } else {
      isPaused = true;
      if (animId) cancelAnimationFrame(animId);
      if (renderer && scene && camera) renderer.render(scene, camera);
    }
  };

  // Initialize when DOM ready
  document.addEventListener('DOMContentLoaded', init3D);
})();
