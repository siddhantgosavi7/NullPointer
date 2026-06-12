import React, { useEffect, useRef } from 'react';
import * as THREE from 'three/webgpu';
import {
  Fn, uniform, float, vec3, instancedArray, instanceIndex, uv,
  positionGeometry, positionWorld, sin, cos, pow, smoothstep, mix,
  sqrt, select, hash, time, deltaTime, PI, mx_noise_float,
  pass, mrt, output, transformedNormalView,
} from 'three/tsl';
import { dof } from 'three/addons/tsl/display/DepthOfFieldNode.js';

const FIELD_SIZE = 30;
const BACKGROUND_HEX = '#000000';
const GROUND_HEX = '#000000';
const BLADE_BASE_HEX = '#0e1e04';
const BLADE_TIP_HEX = '#c8b840';

// Sky Gradient
const skyColors = {
  top:     new THREE.Color('#000000'),
  midHigh: new THREE.Color('#000000'),
  midLow:  new THREE.Color('#000000'),
  horizon: new THREE.Color('#000000'),
};

function buildSkyTexture() {
  const w = 2, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0.0,  '#' + skyColors.top.getHexString());
  grad.addColorStop(0.35, '#' + skyColors.midHigh.getHexString());
  grad.addColorStop(0.65, '#' + skyColors.midLow.getHexString());
  grad.addColorStop(1.0,  '#' + skyColors.horizon.getHexString());
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export default function HomeGrassBackground({ activeStageState }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const BLADE_COUNT = 120000;
    const isMobile = window.innerWidth < 768;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = buildSkyTexture();
    scene.fog = new THREE.FogExp2('#000000', 0.035);

    const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 8, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGPURenderer({ antialias: true });
    const maxDPR = window.innerWidth < 1200 ? 1.5 : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(maxDPR);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);

    let animationFrameId;
    let initialized = false;

    // GPU Buffers
    const bladeData = instancedArray(BLADE_COUNT, 'vec4');
    const bendState = instancedArray(BLADE_COUNT, 'vec4');
    const bladeBound = instancedArray(BLADE_COUNT, 'float');

    // Uniforms
    const mouseWorld = uniform(new THREE.Vector3(99999, 0, 99999));
    const mouseRadius = uniform(6.1);
    const mouseStrength = uniform(4.0);
    const outerRadius = uniform(9.4);
    const outerStrength = uniform(1.45);
    const camSphereWorld = uniform(new THREE.Vector3(99999, 0, 99999));
    const camSphereRadius = uniform(15.0);
    const camSphereStrength = uniform(5.9);

    const grassDensity = uniform(1.0);
    const windSpeed = uniform(1.3);
    const windAmplitude = uniform(0.21);
    const bladeWidth = uniform(4.0);
    const bladeTipWidth = uniform(0.19);
    const bladeHeight = uniform(1.6);
    const bladeHeightVariation = uniform(0.5);
    const bladeLean = uniform(1.1);
    const noiseAmplitude = uniform(1.85);
    const noiseFrequency = uniform(0.3);
    const noise2Amplitude = uniform(0.2);
    const noise2Frequency = uniform(15);
    const bladeColorVariation = uniform(0.93);
    const groundRadius = uniform(13.8);
    const groundFalloff = uniform(2.4);
    const bladeBaseColor = uniform(new THREE.Color(BLADE_BASE_HEX));
    const bladeTipColor = uniform(new THREE.Color(BLADE_TIP_HEX));
    const backgroundColor = uniform(new THREE.Color(BACKGROUND_HEX));
    const groundColor = uniform(new THREE.Color(GROUND_HEX));
    const fogStart = uniform(6.5);
    const fogEnd = uniform(12.0);
    const fogIntensity = uniform(1.0);
    const fogColor = uniform(new THREE.Color('#000000'));
    let fogEnabled = true;
    const goldenTipColor = uniform(new THREE.Color('#d4b838'));
    const greenTipColor = uniform(new THREE.Color('#4a7a14'));
    const midColor = uniform(new THREE.Color('#2d4e0e'));

    // DoF Uniforms
    const focusDistanceU = uniform(31.83);
    const focalLengthU = uniform(10.0);
    const bokehScaleU = uniform(12.5);
    let dofEnabled = true;

    // Mouse-world distance for auto-focus
    let mouseFocusDist = 10.0;
    let autoFocusSmoothed = 10.0;

    const noise2D = Fn(([x, z]) => mx_noise_float(vec3(x, float(0), z)).mul(0.5).add(0.5));

    // Compute Init
    const computeInit = Fn(() => {
      const blade = bladeData.element(instanceIndex);
      const jx = hash(instanceIndex).sub(0.5);
      const jz = hash(instanceIndex.add(7919)).sub(0.5);
      const col = instanceIndex.mod(283);
      const row = instanceIndex.div(283);
      const wx = col.toFloat().add(jx).div(float(283)).sub(0.5).mul(FIELD_SIZE);
      const wz = row.toFloat().add(jz).div(float(283)).sub(0.5).mul(FIELD_SIZE);
      blade.x.assign(wx);
      blade.y.assign(wz);
      blade.z.assign(hash(instanceIndex.add(1337)).mul(PI.mul(2)));
      const n1 = noise2D(wx.mul(noiseFrequency), wz.mul(noiseFrequency));
      const n2 = noise2D(wx.mul(noiseFrequency.mul(noise2Frequency)).add(50), wz.mul(noiseFrequency.mul(noise2Frequency)).add(50));
      const clump = n1.mul(noiseAmplitude).sub(noise2Amplitude).add(n2.mul(noise2Amplitude).mul(2)).max(0);
      blade.w.assign(clump);
      const dist = sqrt(wx.mul(wx).add(wz.mul(wz)));
      const edgeNoise = noise2D(wx.mul(0.25).add(100), wz.mul(0.25).add(100));
      const maxR = float(12.0).add(edgeNoise.sub(0.5).mul(6.0));
      const boundary = float(1).sub(smoothstep(maxR.sub(1.5), maxR, dist));
      bladeBound.element(instanceIndex).assign(select(boundary.lessThan(0.05), float(0), boundary));
    })().compute(BLADE_COUNT);

    // Compute Update
    const computeUpdate = Fn(() => {
      const blade = bladeData.element(instanceIndex);
      const bend = bendState.element(instanceIndex);
      const bx = blade.x;
      const bz = blade.y;

      const w1 = sin(bx.mul(0.35).add(bz.mul(0.12)).add(time.mul(windSpeed)));
      const w2 = sin(bx.mul(0.18).add(bz.mul(0.28)).add(time.mul(windSpeed.mul(0.67))).add(1.7));
      const windX = w1.add(w2).mul(windAmplitude);
      const windZ = w1.sub(w2).mul(windAmplitude.mul(0.55));

      const lw = deltaTime.mul(4.0).saturate();
      bend.x.assign(mix(bend.x, windX, lw));
      bend.y.assign(mix(bend.y, windZ, lw));

      // Mouse push
      const dx = bx.sub(mouseWorld.x);
      const dz = bz.sub(mouseWorld.z);
      const dist = sqrt(dx.mul(dx).add(dz.mul(dz))).add(0.0001);
      const falloff = float(1).sub(dist.div(mouseRadius).saturate());
      const influence = falloff.mul(falloff).mul(mouseStrength);
      const pushX = dx.div(dist).mul(influence);
      const pushZ = dz.div(dist).mul(influence);

      // Outer mouse sphere
      const odx = bx.sub(mouseWorld.x);
      const odz = bz.sub(mouseWorld.z);
      const odist = sqrt(odx.mul(odx).add(odz.mul(odz))).add(0.0001);
      const ofalloff = float(1).sub(odist.div(outerRadius).saturate());
      const oinfluence = ofalloff.mul(ofalloff).mul(outerStrength);
      const opushX = odx.div(odist).mul(oinfluence);
      const opushZ = odz.div(odist).mul(oinfluence);

      // Camera sphere push
      const cdx = bx.sub(camSphereWorld.x);
      const cdz = bz.sub(camSphereWorld.z);
      const cdist = sqrt(cdx.mul(cdx).add(cdz.mul(cdz))).add(0.0001);
      const cfalloff = float(1).sub(cdist.div(camSphereRadius).saturate());
      const cinfluence = cfalloff.mul(cfalloff).mul(camSphereStrength);
      const cpushX = cdx.div(cdist).mul(cinfluence);
      const cpushZ = cdz.div(cdist).mul(cinfluence);

      const totalPushX = pushX.add(opushX).add(cpushX);
      const totalPushZ = pushZ.add(opushZ).add(cpushZ);

      const targetMag = sqrt(totalPushX.mul(totalPushX).add(totalPushZ.mul(totalPushZ)));
      const currentMag = sqrt(bend.z.mul(bend.z).add(bend.w.mul(bend.w)));
      const lm = select(targetMag.greaterThan(currentMag), deltaTime.mul(12.0), deltaTime.mul(1)).saturate();
      bend.z.assign(mix(bend.z, totalPushX, lm));
      bend.w.assign(mix(bend.w, totalPushZ, lm));
    })().compute(BLADE_COUNT);

    // Blade Geometry
    function createBladeGeometry() {
      const segs = 5, W = 0.055, H = 1.0;
      const verts = [], norms = [], uvArr = [], idx = [];
      for (let i = 0; i <= segs; i++) {
        const t = i / segs, y = t * H, hw = W * 0.5 * (1.0 - t * 0.82);
        verts.push(-hw, y, 0, hw, y, 0);
        norms.push(0, 0, 1, 0, 0, 1);
        uvArr.push(0, t, 1, t);
      }
      for (let i = 0; i < segs; i++) { const b = i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
      geo.setIndex(idx);
      return geo;
    }

    const grassMat = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide, fog: true });

    grassMat.positionNode = Fn(() => {
      const blade = bladeData.element(instanceIndex);
      const bend = bendState.element(instanceIndex);
      const worldX = blade.x, worldZ = blade.y, rotY = blade.z;
      const boundary = bladeBound.element(instanceIndex);
      const visible = select(hash(instanceIndex.add(9999)).lessThan(grassDensity.mul(0.5)), float(1), float(0));
      const hVar = hash(instanceIndex.add(5555)).mul(bladeHeightVariation);
      const heightScale = float(0.35).add(blade.w).add(hVar).mul(boundary).mul(visible);
      const taper = float(1).sub(uv().y.mul(float(1).sub(bladeTipWidth)));
      const lx = positionGeometry.x.mul(bladeWidth).mul(taper).mul(heightScale.sign());
      const ly = positionGeometry.y.mul(heightScale).mul(bladeHeight);
      const cY = cos(rotY), sY = sin(rotY);
      const rx = lx.mul(cY), rz = lx.mul(sY);
      const t = uv().y;
      const bendFactor = pow(t, 1.8);
      const staticBendX = hash(instanceIndex.add(7777)).sub(0.5).mul(bladeLean);
      const staticBendZ = hash(instanceIndex.add(8888)).sub(0.5).mul(bladeLean);
      const bendX = staticBendX.add(bend.x).add(bend.z);
      const bendZ = staticBendZ.add(bend.y).add(bend.w);
      const relX = rx.add(bendX.mul(bendFactor).mul(bladeHeight));
      const relY = ly;
      const relZ = rz.add(bendZ.mul(bendFactor).mul(bladeHeight));
      const origLen = sqrt(rx.mul(rx).add(ly.mul(ly)).add(rz.mul(rz)));
      const newLen = sqrt(relX.mul(relX).add(relY.mul(relY)).add(relZ.mul(relZ)));
      const scale = origLen.div(newLen.max(0.0001));
      return vec3(worldX.add(relX.mul(scale)), relY.mul(scale), worldZ.add(relZ.mul(scale)));
    })();

    grassMat.colorNode = Fn(() => {
      const t = uv().y;
      const clump = bladeData.element(instanceIndex).w.saturate();
      const bladeHash = hash(instanceIndex.add(4242));
      const isGolden = bladeHash.lessThan(0.4);
      const lowerGrad = smoothstep(float(0.0), float(0.45), t);
      const upperGrad = smoothstep(float(0.4), float(0.85), t);
      const tipMix = float(1).sub(bladeColorVariation).add(clump.mul(bladeColorVariation));
      const greenTip = mix(greenTipColor, bladeTipColor, tipMix);
      const warmTip = mix(greenTipColor, goldenTipColor, tipMix);
      const tipFinal = mix(greenTip, warmTip, select(isGolden, float(1), float(0)));
      const lowerColor = mix(bladeBaseColor, midColor, lowerGrad);
      const grassColor = mix(lowerColor, tipFinal, upperGrad);
      const blade = bladeData.element(instanceIndex);
      const dist = sqrt(blade.x.mul(blade.x).add(blade.y.mul(blade.y)));
      const fogFactor = smoothstep(fogStart, fogEnd, dist).mul(fogIntensity);
      return mix(grassColor, fogColor, fogFactor);
    })();

    grassMat.opacityNode = Fn(() => {
      const blade = bladeData.element(instanceIndex);
      const dist = sqrt(blade.x.mul(blade.x).add(blade.y.mul(blade.y)));
      const fadeEnd = select(fogIntensity.greaterThan(0.01), fogEnd.add(2.0), float(15.0));
      const fadeFactor = float(1).sub(smoothstep(fadeEnd.sub(5.0), fadeEnd, dist));
      return smoothstep(float(0.0), float(0.1), uv().y).mul(fadeFactor);
    })();
    grassMat.transparent = true;

    // Instances
    const bladeGeo = createBladeGeometry();
    const grass = new THREE.InstancedMesh(bladeGeo, grassMat, BLADE_COUNT);
    grass.frustumCulled = false;
    scene.add(grass);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < BLADE_COUNT; i++) grass.setMatrixAt(i, dummy.matrix);
    grass.instanceMatrix.needsUpdate = true;

    // Ground
    const groundMat = new THREE.MeshBasicNodeMaterial();
    groundMat.colorNode = Fn(() => {
      const wx = positionWorld.x, wz = positionWorld.z;
      const dist = sqrt(wx.mul(wx).add(wz.mul(wz)));
      const edgeNoise = noise2D(wx.mul(0.25).add(100), wz.mul(0.25).add(100));
      const maxR = groundRadius.add(edgeNoise.sub(0.5).mul(4.0));
      const t = smoothstep(maxR.sub(groundFalloff), maxR, dist);
      return mix(groundColor, backgroundColor, t);
    })();
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(FIELD_SIZE * 5, FIELD_SIZE * 5), groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xfff4e0, 1.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Post Processing (DoF)
    const postProcessing = new THREE.PostProcessing(renderer);
    const scenePass = pass(scene, camera);
    scenePass.setMRT(mrt({
      output: output,
      normal: transformedNormalView,
    }));
    const sceneColor = scenePass.getTextureNode('output');
    const sceneViewZ = scenePass.getViewZNode();
    const dofOutput = dof(sceneColor, sceneViewZ, focusDistanceU, focalLengthU, bokehScaleU);

    postProcessing.outputNode = isMobile ? sceneColor : dofOutput;
    if (isMobile) dofEnabled = false;
    postProcessing.needsUpdate = true;

    function rebuildPipeline() {
      if (dofEnabled) {
        postProcessing.outputNode = dofOutput;
      } else {
        postProcessing.outputNode = sceneColor;
      }
      postProcessing.needsUpdate = true;
    }

    // Mouse
    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();
    const grassPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPoint = new THREE.Vector3();

    const handleMouseMove = (e) => {
      mouseNDC.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(mouseNDC, camera);
      if (raycaster.ray.intersectPlane(grassPlane, hitPoint)) {
        mouseWorld.value.copy(hitPoint);
        mouseFocusDist = camera.position.distanceTo(hitPoint);
      }
    };
    const handleMouseLeave = () => mouseWorld.value.set(99999, 0, 99999);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Resize
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        const dpr = window.innerWidth < 1200 ? 1.5 : Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 100);
    };
    window.addEventListener('resize', handleResize);

    // Camera paths & params
    const cameraPath = [
      [0.00, -2.8,  7.2, 19.6,  0.5, 1.5,  0.4, 22.0, 1, 1, 10.0, 12.5, 5.0, 1.0, 40.0],  // Hero
      [0.14,  0,    2.2, 14.0,  0,  -2.0,   0,   15.0, 1, 1,  8.0, 10.0, 5.0, 1.0, 30.0],  // Manifesto
      [0.28,  7.5, 10.9, 15.8,  0,   0.0,   0.7, 10.0, 1, 1,  6.0,  8.0, 5.0, 0.5, 20.0],  // Pillars
      [0.43, -8.0,  6.8, 21.6,  0,   0.2,   0,    7.0, 1, 1,  5.0, 10.0, 5.0, 0.5, 15.0],  // Stats
      [0.57, -1.0,  5.3, 25.0, -1.2, 3.0,   0,    5.0, 1, 1,  4.0, 14.0, 6.0, 1.1, 21.5],  // Quote
      [0.78, -1.6,  2.4,  0.0, -1.2, -2.0,   0.0, 16.4, 1, 0, 20.0, 18.0, 19.0, 2.8, 12.5],  // CTA
      [1.00,  0,   15.0,  0.0, -5,   3.0,  -5,    9.8, 1, 1, 13.8,  0.0, 17.5, 1.2,  9.0],  // Footer
    ];

    const stageParamKeys = [
      'fogStart', 'fogEnd', 'fogIntensity', 'fogR', 'fogG', 'fogB',
      'grassDensity', 'bladeWidth', 'bladeTipWidth', 'bladeHeight', 'bladeHeightVar', 'bladeLean',
      'windSpeed', 'windAmplitude',
      'noiseAmp', 'noiseFreq', 'noise2Amp', 'noise2Freq',
      'mouseRadius', 'mouseStrength', 'outerRadius', 'outerStrength',
      'camSphereRadius', 'camSphereStrength',
      'bladeBaseR', 'bladeBaseG', 'bladeBaseB',
      'bladeTipR', 'bladeTipG', 'bladeTipB',
      'goldenTipR', 'goldenTipG', 'goldenTipB',
      'greenTipR', 'greenTipG', 'greenTipB',
      'midR', 'midG', 'midB',
      'colorVar'
    ];

    const colorUniformMap = {
      fogColor, bladeBaseColor, bladeTipColor, goldenTipColor, greenTipColor, midColor
    };

    function getDefaultParams() {
      const p = {};
      const stageParamDefs = {
        fogStart: 6.5, fogEnd: 12.0, fogIntensity: 1.0, fogR: 0, fogG: 0, fogB: 0,
        grassDensity: 1.0, bladeWidth: 4.0, bladeTipWidth: 0.19, bladeHeight: 1.6, bladeHeightVar: 0.5, bladeLean: 1.1,
        windSpeed: 1.3, windAmplitude: 0.21,
        noiseAmp: 1.85, noiseFreq: 0.3, noise2Amp: 0.2, noise2Freq: 15,
        mouseRadius: 6.1, mouseStrength: 4.0, outerRadius: 9.4, outerStrength: 1.45,
        camSphereRadius: 15.0, camSphereStrength: 5.9,
        bladeBaseR: 0.055, bladeBaseG: 0.118, bladeBaseB: 0.016,
        bladeTipR: 0.784, bladeTipG: 0.722, bladeTipB: 0.251,
        goldenTipR: 0.831, goldenTipG: 0.722, goldenTipB: 0.220,
        greenTipR: 0.290, greenTipG: 0.478, greenTipB: 0.078,
        midR: 0.176, midG: 0.306, midB: 0.055,
        colorVar: 0.93
      };
      stageParamKeys.forEach(k => {
        p[k] = stageParamDefs[k];
      });
      return p;
    }

    const stageParams = cameraPath.map(() => getDefaultParams());

    // Apply exact overrides
    const exported = [
      { bladeBaseR:0.004391442035325718, bladeBaseG:0.012983032338510335, bladeBaseB:0.001214107934117647, bladeTipR:0.5775804404214573, bladeTipG:0.4793201830913402, bladeTipB:0.05126945836711539, goldenTipR:0.6583748172725346, goldenTipG:0.4793201830913402, goldenTipB:0.03954623527052923, greenTipR:0.06847816983662762, greenTipG:0.19461783043107173, greenTipB:0.0069954101845983935, midR:0.026241221889696346, midG:0.07618538147321911, midB:0.004391442035325718 },
      { bladeBaseR:0.004391442035325718, bladeBaseG:0.012983032338510335, bladeBaseB:0.001214107934117647, bladeTipR:0.5775804404214573, bladeTipG:0.4793201830913402, bladeTipB:0.05126945836711539, goldenTipR:0.6583748172725346, goldenTipG:0.4793201830913402, goldenTipB:0.03954623527052923, greenTipR:0.06847816983662762, greenTipG:0.19461783043107173, greenTipB:0.0069954101845983935, midR:0.026241221889696346, midG:0.07618538147321911, midB:0.004391442035325718 },
      { bladeBaseR:0, bladeBaseG:0.012983032338510335, bladeBaseB:0.001214107934117647, bladeTipR:0.8980392156862745, bladeTipG:0.803921568627451, bladeTipB:0.803921568627451, goldenTipR:0.6627450980392157, goldenTipG:0.28627450980392155, goldenTipB:0.0392156862745098, greenTipR:0.19215686274509805, greenTipG:0.15294117647058825, greenTipB:0.00784313725490196, midR:0.07450980392156863, midG:0.00784313725490196, midB:0.00392156862745098, colorVar:1 },
      { fogStart:0, fogEnd:12.5, bladeHeight:2, bladeHeightVar:1, bladeLean:0, windSpeed:1.3, windAmplitude:0.21, bladeBaseR:0.004391442035325718, bladeBaseG:0.012983032338510335, bladeBaseB:0.001214107934117647, bladeTipR:0.5775804404214573, bladeTipG:0.4793201830913402, bladeTipB:0.05126945836711539, goldenTipR:0.6583748172725346, goldenTipG:0.4793201830913402, goldenTipB:0.03954623527052923, greenTipR:0.06847816983662762, greenTipG:0.19461783043107173, greenTipB:0.0069954101845983935, midR:0.026241221889696346, midG:0.07618538147321911, midB:0.004391442035325718 },
      { bladeBaseR:0.004391442035325718, bladeBaseG:0.012983032338510335, bladeBaseB:0.001214107934117647, bladeTipR:0.5775804404214573, bladeTipG:0.4793201830913402, bladeTipB:0.05126945836711539, goldenTipR:0.6583748172725346, goldenTipG:0.4793201830913402, goldenTipB:0.03954623527052923, greenTipR:0.06847816983662762, greenTipG:0.19461783043107173, greenTipB:0.0069954101845983935, midR:0.026241221889696346, midG:0.07618538147321911, midB:0.004391442035325718 },
      { fogStart:7, bladeTipWidth:0.27, bladeHeight:0.9, bladeHeightVar:0, bladeLean:0, bladeBaseR:0.004391442035325718, bladeBaseG:0.012983032338510335, bladeBaseB:0.001214107934117647, bladeTipR:0.5775804404214573, bladeTipG:0.4793201830913402, bladeTipB:0.05126945836711539, goldenTipR:0.6583748172725346, goldenTipG:0.4793201830913402, goldenTipB:0.03954623527052923, greenTipR:0.06847816983662762, greenTipG:0.19461783043107173, greenTipB:0.0069954101845983935, midR:0.026241221889696346, midG:0.07618538147321911, midB:0.004391442035325718 },
      { fogStart:2, fogEnd:10, bladeHeight:2, bladeHeightVar:0, bladeLean:0, windSpeed:1.3, windAmplitude:0.21, bladeBaseR:0, bladeBaseG:0.012983032338510335, bladeBaseB:0.001214107934117647, bladeTipR:0.32941176470588235, bladeTipG:0.3058823529411765, bladeTipB:0.050980392156862744, goldenTipR:0.6588235294117647, goldenTipG:0.47843137254901963, goldenTipB:0.0392156862745098, greenTipR:0.06666666666666667, greenTipG:0.19607843137254902, greenTipB:0.00784313725490196, midR:0, midG:0, midB:0 },
    ];
    exported.forEach((overrides, i) => {
      Object.keys(overrides).forEach(k => {
        if (k in stageParams[i]) stageParams[i][k] = overrides[k];
      });
    });

    function lerpCam(scrollT) {
      const snapThreshold = 0.005;
      for (let j = 0; j < cameraPath.length; j++) {
        if (Math.abs(cameraPath[j][0] - scrollT) < snapThreshold) {
          const kf = cameraPath[j];
          return {
            px: kf[1], py: kf[2], pz: kf[3],
            lx: kf[4], ly: kf[5], lz: kf[6],
            fd: kf[7], af: kf[8], dofOn: kf[9],
            fl: kf[10], bk: kf[11],
            afSpd: kf[12], afMin: kf[13], afMax: kf[14],
            params: { ...stageParams[j] },
          };
        }
      }

      let i = 0;
      for (let j = 1; j < cameraPath.length; j++) {
        if (cameraPath[j][0] >= scrollT) { i = j - 1; break; }
        if (j === cameraPath.length - 1) i = j - 1;
      }
      const a = cameraPath[i], b = cameraPath[Math.min(i + 1, cameraPath.length - 1)];
      const range = b[0] - a[0];
      const t = range > 0 ? Math.max(0, Math.min(1, (scrollT - a[0]) / range)) : 0;
      const ease = t * t * (3 - 2 * t);

      const iB = Math.min(i + 1, cameraPath.length - 1);
      const pA = stageParams[i], pB = stageParams[iB];
      const lerpedParams = {};
      stageParamKeys.forEach(k => {
        lerpedParams[k] = pA[k] + (pB[k] - pA[k]) * ease;
      });

      return {
        px: a[1] + (b[1] - a[1]) * ease,
        py: a[2] + (b[2] - a[2]) * ease,
        pz: a[3] + (b[3] - a[3]) * ease,
        lx: a[4] + (b[4] - a[4]) * ease,
        ly: a[5] + (b[5] - a[5]) * ease,
        lz: a[6] + (b[6] - a[6]) * ease,
        fd: a[7] + (b[7] - a[7]) * ease,
        af: a[8] + (b[8] - a[8]) * ease,
        dofOn: a[9] + (b[9] - a[9]) * ease,
        fl: a[10] + (b[10] - a[10]) * ease,
        bk: a[11] + (b[11] - a[11]) * ease,
        afSpd: a[12] + (b[12] - a[12]) * ease,
        afMin: a[13] + (b[13] - a[13]) * ease,
        afMax: a[14] + (b[14] - a[14]) * ease,
        params: lerpedParams,
      };
    }

    let currentScrollT = 0;
    let targetScrollT = 0;

    function getScrollProgress() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = docHeight - winHeight;
      return scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;
    }

    function syncCameraPathToDOM() {
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = docHeight - winHeight;
      if (scrollable <= 0) return;
      cameraPath.forEach((kf, i) => {
        const section = document.querySelector(`.section[data-stage="${i}"]`);
        if (section) {
          const sectionTop = section.offsetTop;
          kf[0] = Math.min(1, Math.max(0, sectionTop / scrollable));
        }
      });
      cameraPath[cameraPath.length - 1][0] = 1.0;
    }

    syncCameraPathToDOM();

    let _scrollDirty = false;
    const handleScroll = () => { _scrollDirty = true; };
    const handleTouchMove = () => { _scrollDirty = true; };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Wind burst
    let windBurst = 0;
    let _baseWindSpeed = 1.3;
    let _baseWindAmp = 0.21;
    let globalDofEnabled = !isMobile;

    const handleWindBurst = () => {
      windBurst = 4.0;
    };
    window.addEventListener('wind_burst_trigger', handleWindBurst);

    // Settings overrides exposed globally for legacy helper functions
    window._getCameraOverride = () => {
      return activeStageState.overrideStage;
    };

    // Prepare settings panel reference
    // In React, buildSettings can read and modify the THREE uniforms from these scope bindings.
    // To wire settings properly, we expose uniforms and structures on a global hook so
    // our Home.jsx settings panel can tweak them live!
    window._homeGrassUniforms = {
      backgroundColor, groundColor, skyColors, buildSkyTexture, scene,
      cameraPath, stageParams, stageNames, stageParamKeys, rebuildPipeline,
      focusDistanceU, focalLengthU, bokehScaleU,
      fogStart, fogEnd, fogIntensity, fogColor,
      grassDensity, bladeWidth, bladeTipWidth, bladeHeight, bladeHeightVariation, bladeLean,
      windSpeed, windAmplitude, noiseAmplitude, noiseFrequency, noise2Amplitude, noise2Frequency,
      mouseRadius, mouseStrength, outerRadius, outerStrength,
      camSphereRadius, camSphereStrength,
      bladeBaseColor, bladeTipColor, goldenTipColor, greenTipColor, midColor, bladeColorVariation,
      globalDofEnabled: () => globalDofEnabled,
      setGlobalDofEnabled: (val) => { globalDofEnabled = val; },
      dofEnabled: () => dofEnabled,
      setDofEnabled: (val) => { dofEnabled = val; }
    };

    // Main animation loop
    const clock = new THREE.Clock();
    const lookTarget = new THREE.Vector3();

    const _siteFooter = document.querySelector('.site-footer');
    const _scrollHint = document.querySelector('.scroll-hint');
    const progressBar = document.getElementById('progressBar');
    const navFloat = document.getElementById('navFloat');

    async function initMesh() {
      await renderer.init();
      await renderer.computeAsync(computeInit);

      // Pre-warm
      renderer.domElement.style.opacity = '0';
      renderer.domElement.style.transition = 'opacity 0.4s ease';
      for (let i = 0; i < 3; i++) {
        renderer.compute(computeUpdate);
        postProcessing.render();
        await new Promise(r => requestAnimationFrame(r));
      }
      renderer.domElement.style.opacity = '1';
      initialized = true;
      renderer.setAnimationLoop(animate);
    }

    function animate() {
      const dt = Math.min(clock.getDelta(), 0.05);

      if (_scrollDirty) {
        targetScrollT = getScrollProgress();
        _scrollDirty = false;
      }

      currentScrollT += (targetScrollT - currentScrollT) * Math.min(1, dt * 6);

      const override = window._getCameraOverride ? window._getCameraOverride() : -1;
      let cam;
      if (override >= 0 && override < cameraPath.length) {
        const kf = cameraPath[override];
        cam = {
          px: kf[1], py: kf[2], pz: kf[3],
          lx: kf[4], ly: kf[5], lz: kf[6],
          fd: kf[7], af: kf[8], dofOn: kf[9],
          fl: kf[10], bk: kf[11],
          afSpd: kf[12], afMin: kf[13], afMax: kf[14],
          params: stageParams[override],
        };
      } else {
        cam = lerpCam(currentScrollT);
      }
      camera.position.set(cam.px, cam.py, cam.pz);
      lookTarget.set(cam.lx, cam.ly, cam.lz);
      camera.lookAt(lookTarget);

      if (_siteFooter) {
        const footerTop = _siteFooter.getBoundingClientRect().top;
        if (footerTop < window.innerHeight) {
          renderer.domElement.style.transform = `translateY(-${window.innerHeight - footerTop}px)`;
        } else {
          renderer.domElement.style.transform = '';
        }
      }

      if (progressBar) {
        progressBar.style.width = (currentScrollT * 100) + '%';
      }

      if (navFloat) {
        navFloat.classList.toggle('visible', currentScrollT > 0.08);
      }

      if (_scrollHint) {
        _scrollHint.style.opacity = Math.max(0, 1 - currentScrollT * 15);
      }

      camSphereWorld.value.set(camera.position.x, 0, camera.position.z);

      if (cam.params) {
        const p = cam.params;
        fogStart.value = p.fogStart;
        fogEnd.value = p.fogEnd;
        fogIntensity.value = p.fogIntensity;
        fogColor.value.setRGB(p.fogR, p.fogG, p.fogB);
        if (scene.fog) scene.fog.color.setRGB(p.fogR, p.fogG, p.fogB);

        grassDensity.value = p.grassDensity;
        bladeWidth.value = p.bladeWidth;
        bladeTipWidth.value = p.bladeTipWidth;
        bladeHeight.value = p.bladeHeight;
        bladeHeightVariation.value = p.bladeHeightVar;
        bladeLean.value = p.bladeLean;

        _baseWindSpeed = p.windSpeed;
        _baseWindAmp = p.windAmplitude;

        noiseAmplitude.value = p.noiseAmp;
        noiseFrequency.value = p.noiseFreq;
        noise2Amplitude.value = p.noise2Amp;
        noise2Frequency.value = p.noise2Freq;

        mouseRadius.value = p.mouseRadius;
        mouseStrength.value = p.mouseStrength;
        outerRadius.value = p.outerRadius;
        outerStrength.value = p.outerStrength;

        bladeBaseColor.value.setRGB(p.bladeBaseR, p.bladeBaseG, p.bladeBaseB);
        bladeTipColor.value.setRGB(p.bladeTipR, p.bladeTipG, p.bladeTipB);
        goldenTipColor.value.setRGB(p.goldenTipR, p.goldenTipG, p.goldenTipB);
        greenTipColor.value.setRGB(p.greenTipR, p.greenTipG, p.greenTipB);
        midColor.value.setRGB(p.midR, p.midG, p.midB);
        bladeColorVariation.value = p.colorVar;

        const baseCamR = p.camSphereRadius;
        const baseCamS = p.camSphereStrength;
        camSphereRadius.value = baseCamR;
        camSphereStrength.value = baseCamS;
      }

      const camHeight = camera.position.y;
      const proximityT = Math.max(0, 1 - camHeight / 10);
      const proxCurve = proximityT * proximityT;
      camSphereRadius.value = Math.min(15, camSphereRadius.value * (0.3 + proxCurve * 0.7));
      camSphereStrength.value = camSphereStrength.value * (0.1 + proxCurve * 0.9);

      windSpeed.value = _baseWindSpeed;
      windAmplitude.value = _baseWindAmp;

      if (windBurst > 0) {
        windBurst -= dt * 0.6;
        const burstT = Math.max(0, windBurst / 4.0);
        const eased = burstT * burstT * (3 - 2 * burstT);
        windSpeed.value += eased * 4.5;
        windAmplitude.value += eased * 0.45;
      }

      {
        const dofWeight = typeof cam.dofOn === 'number' ? cam.dofOn : 1;
        const shouldDof = globalDofEnabled && dofWeight > 0.5;

        if (shouldDof !== dofEnabled) {
          dofEnabled = shouldDof;
          rebuildPipeline();
        }

        if (dofEnabled) {
          const autoWeight = typeof cam.af === 'number' ? Math.max(0, Math.min(1, cam.af)) : 0;
          const mouseOnField = mouseWorld.value.x < 9000;
          const afSpeed = cam.afSpd || 5.0;
          const afMin = cam.afMin || 0.5;
          const afMax = cam.afMax || 40.0;

          let rawAutoFocus;
          if (mouseOnField) {
            rawAutoFocus = mouseFocusDist;
          } else {
            rawAutoFocus = Math.max(0.5, Math.sqrt(cam.py * cam.py + cam.pz * cam.pz) * 0.9);
          }

          rawAutoFocus = Math.max(afMin, Math.min(afMax, rawAutoFocus));
          autoFocusSmoothed += (rawAutoFocus - autoFocusSmoothed) * Math.min(1, dt * afSpeed);
          const targetFocus = cam.fd * (1 - autoWeight) + autoFocusSmoothed * autoWeight;

          focusDistanceU.value += (targetFocus - focusDistanceU.value) * Math.min(1, dt * 8);
          focalLengthU.value += (cam.fl - focalLengthU.value) * Math.min(1, dt * 6);
          bokehScaleU.value += (cam.bk - bokehScaleU.value) * Math.min(1, dt * 6);
        }

        // Live stats update if stage overlay is editing
        const ovr = activeStageState.overrideStage;
        if (ovr >= 0 && cameraPath[ovr][8] && dofEnabled) {
          const fdEl = document.getElementById(`cp_${ovr}_fd_v`);
          if (fdEl) fdEl.textContent = focusDistanceU.value.toFixed(1);
        }
      }

      renderer.compute(computeUpdate);
      postProcessing.render();
    }

    initMesh();

    return () => {
      if (initialized) {
        renderer.setAnimationLoop(null);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wind_burst_trigger', handleWindBurst);
      
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      scene.clear();
      groundMat.dispose();
      grassMat.dispose();
      bladeGeo.dispose();
      renderer.dispose();
      
      // Clear global scopes
      window._getCameraOverride = null;
      window._homeGrassUniforms = null;
    };
  }, [activeStageState]);

  return <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }} />;
}
