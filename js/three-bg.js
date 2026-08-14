/* ==========================================================================
   Three.js background
   A soft particle field + a few floating wireframe shapes behind the hero.
   Kept deliberately subtle: low particle count, slow drift, no heavy postfx.
   ========================================================================== */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 12;

  /* ---------- Particle field ---------- */
  const isMobile = window.innerWidth < 760;
  const particleCount = isMobile ? 260 : 450;
  const positions = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const radius = 6 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = radius * Math.cos(phi) - 6;
    speeds[i] = 0.2 + Math.random() * 0.6;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xFF8A5B,
    size: isMobile ? 0.035 : 0.045,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  /* ---------- Floating design-tool shapes ---------- */
  /* Instead of generic primitives, these read as design-software motifs:
     a layers stack, a pen-tool bezier path with anchor points, and a
     cluster of color swatches — small nods to a graphic designer's tools. */
  const shapesGroup = new THREE.Group();

  function createLayersStack(color) {
    const group = new THREE.Group();
    const layerGeo = new THREE.PlaneGeometry(1.7, 1.15);
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color, wireframe: true, transparent: true,
        opacity: 0.3 - i * 0.06, side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(layerGeo, mat);
      mesh.position.set(i * 0.16, -i * 0.13, i * 0.22);
      group.add(mesh);
    }
    return group;
  }

  function createPenPath(color) {
    const group = new THREE.Group();
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.95, -0.5, 0),
      new THREE.Vector3(0, 0.95, 0.3),
      new THREE.Vector3(0.95, -0.3, -0.2)
    );
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 }));
    group.add(line);

    // handle guides (pen-tool control lines)
    const handleMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.18 });
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([curve.v0, curve.v1]), handleMat));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([curve.v1, curve.v2]), handleMat));

    // anchor points
    const anchorGeo = new THREE.SphereGeometry(0.06, 10, 10);
    [curve.v0, curve.v1, curve.v2].forEach((pt) => {
      const anchor = new THREE.Mesh(anchorGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }));
      anchor.position.copy(pt);
      group.add(anchor);
    });
    return group;
  }

  function createColorSwatches(colors) {
    const group = new THREE.Group();
    const dotGeo = new THREE.CircleGeometry(0.16, 28);
    const ringGeo = new THREE.RingGeometry(0.16, 0.185, 28);
    colors.forEach((c, i) => {
      const x = i * 0.42;
      const y = Math.sin(i * 0.9) * 0.16;
      const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.5 }));
      dot.position.set(x, y, 0);
      group.add(dot);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
      ring.position.set(x, y, 0.001);
      group.add(ring);
    });
    group.position.x -= (colors.length - 1) * 0.21; // center the row
    return group;
  }

  const layers = createLayersStack(0xFF6B3D);
  layers.position.set(-4.2, 1.4, -2);

  const pen = createPenPath(0xFF8A5B);
  pen.position.set(2.6, 2.4, -4);

  const swatches = createColorSwatches([0xFF6B3D, 0xFF8A5B, 0xFFC98A, 0x8B5E3C]);
  swatches.position.set(4.4, -1.1, -3);

  [layers, pen, swatches].forEach((obj) => {
    obj.userData.rotSpeed = { x: (Math.random() - 0.5) * 0.001, y: (Math.random() - 0.5) * 0.0015 };
    obj.userData.floatOffset = Math.random() * Math.PI * 2;
    shapesGroup.add(obj);
  });
  scene.add(shapesGroup);

  /* ---------- Mouse parallax ---------- */
  let mouseX = 0, mouseY = 0;
  let targetRotX = 0, targetRotY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!reduceMotion) {
      particles.rotation.y = t * 0.015;
      particles.rotation.x = t * 0.005;

      shapesGroup.children.forEach((mesh) => {
        mesh.rotation.x += mesh.userData.rotSpeed.x * 16;
        mesh.rotation.y += mesh.userData.rotSpeed.y * 16;
        mesh.position.y += Math.sin(t * 0.5 + mesh.userData.floatOffset) * 0.0015;
      });
    }

    targetRotX += (mouseY * 0.15 - targetRotX) * 0.03;
    targetRotY += (mouseX * 0.15 - targetRotY) * 0.03;
    scene.rotation.x = targetRotX * 0.3;
    scene.rotation.y = targetRotY * 0.3;

    renderer.render(scene, camera);
  }

  animate();
})();