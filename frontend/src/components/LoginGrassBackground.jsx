import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const FIELD = 50;
const SEGS = 5;
const BLADE_COUNT = 80000;
const ACCENT_COUNT = 6000;

function buildBladeGeo() {
  const pos = [], uvs = [], idx = [];
  for (let s = 0; s <= SEGS; s++) {
    const t = s / SEGS, hw = 0.05 * (1 - t * 0.85);
    pos.push(-hw, t, 0, hw, t, 0); uvs.push(0, t, 1, t);
  }
  for (let s = 0; s < SEGS; s++) {
    const b = s * 2;
    idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function buildData(n, sm = 1) {
  const off = new Float32Array(n * 3);
  const rot = new Float32Array(n);
  const sc = new Float32Array(n);
  const rnd = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    off[i * 3] = (Math.random() - 0.5) * FIELD;
    off[i * 3 + 1] = 0;
    off[i * 3 + 2] = (Math.random() - 0.5) * FIELD;
    rot[i] = Math.random() * Math.PI * 2;
    sc[i] = (0.6 + Math.random() * 0.8) * sm;
    rnd[i * 4] = Math.random();
    rnd[i * 4 + 1] = Math.random();
    rnd[i * 4 + 2] = Math.random();
    rnd[i * 4 + 3] = Math.random();
  }
  return { off, rot, sc, rnd };
}

const vert = `precision highp float;
attribute vec3 position;
attribute vec2 uv;
attribute vec3 aOffset; attribute float aRotation,aScale; attribute vec4 aRand;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float uTime,uWS,uWF; uniform vec2 uWD; uniform vec3 uMouse; uniform float uRR,uRS;
varying float vT,vRT,vAO; varying vec3 vWP;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
void main(){
  vT=uv.y;vRT=aRand.y;
  vec3 lp=position;lp.y*=aScale*(0.85+aRand.w*0.3);
  vec2 wd=normalize(uWD);float wt=uTime*uWF,st=vT*vT*vT;
  float wn=(noise(aOffset.xz*.08+wt*wd*.7)+.5*noise(aOffset.xz*.184+wt*wd*1.2+1.7)+.25*noise(aOffset.xz*.408+wt*wd*1.8+3.3))/1.75;
  float la=wn*uWS*(0.6+aRand.z*0.4)*st+aRand.z*0.25*st;
  float lx=sin(aRotation)*la,lz=cos(aRotation)*la;
  vec2 tm=aOffset.xz-uMouse.xz;float md=length(tm);
  float rep=smoothstep(uRR,0.,md);vec2 rd=md>.001?normalize(tm):vec2(1,0);
  lx+=rd.x*rep*uRS*st;lz+=rd.y*rep*uRS*st;
  float cr=cos(aRotation),sr=sin(aRotation);
  vec3 r=vec3(lp.x*cr-lp.z*sr,lp.y,lp.x*sr+lp.z*cr);
  r.x+=lx;r.z+=lz;vWP=aOffset+r;vAO=smoothstep(0.,.35,vT);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(vWP,1.);
}`;

const frag = `precision highp float;
uniform vec3 uBase,uMid,uTip,uGold,uFogC,cameraPosition; uniform float uFogD;
varying float vT,vRT,vAO; varying vec3 vWP;
void main(){
  vec3 tip=mix(uTip,uGold,vRT*0.6);
  vec3 col=vT<.5?mix(uBase,uMid,vT*2.):mix(uMid,tip,(vT-.5)*2.);
  col*=(.55+vAO*.55);
  col+=vec3(.9,1.,.5)*pow(max(0.,vT-.7)/.3,3.)*.25*vRT;
  float ff=1.-exp(-uFogD*length(vWP-cameraPosition)*length(vWP-cameraPosition)*.5);
  gl_FragColor=vec4(mix(col,uFogC,clamp(ff,0.,.92)),1.);
}`;

export default function LoginGrassBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x0a0f08, 0.042);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.set(0, 9, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0x2a4f20, 3.8));
    const sun = new THREE.DirectionalLight(0xffe8a0, 4.0);
    sun.position.set(8, 18, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    sun.shadow.bias = -0.001;
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0x88c840, 0.9);
    rim.position.set(-5, 3, -10);
    scene.add(rim);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x0d1a08 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Uniforms
    const timeU = { value: 0 };
    const mouseU = { value: new THREE.Vector3(9999, 0, 9999) };

    function makeMesh(n, sm, bc, mc, tc, gc, ws, wf, rs) {
      const { off, rot, sc, rnd } = buildData(n, sm);
      const geo = buildBladeGeo();
      geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(off, 3));
      geo.setAttribute('aRotation', new THREE.InstancedBufferAttribute(rot, 1));
      geo.setAttribute('aScale', new THREE.InstancedBufferAttribute(sc, 1));
      geo.setAttribute('aRand', new THREE.InstancedBufferAttribute(rnd, 4));

      const mat = new THREE.RawShaderMaterial({
        uniforms: {
          uTime: timeU,
          uWS: { value: ws },
          uWF: { value: wf },
          uWD: { value: new THREE.Vector2(1, 0.3) },
          uMouse: mouseU,
          uRR: { value: 3.5 },
          uRS: { value: rs },
          uBase: { value: new THREE.Color(bc) },
          uMid: { value: new THREE.Color(mc) },
          uTip: { value: new THREE.Color(tc) },
          uGold: { value: new THREE.Color(gc) },
          uFogC: { value: new THREE.Color(0x0a0f08) },
          uFogD: { value: 0.042 },
        },
        vertexShader: vert,
        fragmentShader: frag,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.InstancedMesh(geo, mat, n);
      mesh.frustumCulled = false;
      const d = new THREE.Object3D();
      for (let i = 0; i < n; i++) {
        d.updateMatrix();
        mesh.setMatrixAt(i, d.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      return { mesh, geo, mat };
    }

    const mesh1 = makeMesh(BLADE_COUNT, 1.0, 0x4a7a30, 0x8aac50, 0xe8f860, 0xf0e060, 0.70, 0.40, 2.2);
    const mesh2 = makeMesh(ACCENT_COUNT, 1.6, 0x3a6025, 0x9acc38, 0xe8f840, 0xfce878, 0.95, 0.28, 2.8);

    scene.add(mesh1.mesh);
    scene.add(mesh2.mesh);

    // Fireflies setup
    const FF = 120;
    const ffP0 = new Float32Array(FF * 3);
    const ffPh = new Float32Array(FF);
    for (let i = 0; i < FF; i++) {
      ffP0[i * 3] = (Math.random() - 0.5) * FIELD * 0.8;
      ffP0[i * 3 + 1] = 0.5 + Math.random() * 2.5;
      ffP0[i * 3 + 2] = (Math.random() - 0.5) * FIELD * 0.8;
      ffPh[i] = Math.random() * Math.PI * 2;
    }

    const ffGeo = new THREE.BufferGeometry();
    ffGeo.setAttribute('position', new THREE.Float32BufferAttribute(ffP0.slice(), 3));
    const ffMat = new THREE.PointsMaterial({
      color: 0xdff060,
      size: 0.06,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const ffPoints = new THREE.Points(ffGeo, ffMat);
    scene.add(ffPoints);

    const ray = new THREE.Raycaster();
    const gPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const tMouse = new THREE.Vector3(9999, 0, 9999);
    const sMouse = new THREE.Vector3(9999, 0, 9999);
    const _v2 = new THREE.Vector2();

    const onPtr = (cx, cy) => {
      _v2.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
      ray.setFromCamera(_v2, camera);
      ray.ray.intersectPlane(gPlane, tMouse);
    };

    const handleMouseMove = (e) => onPtr(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      onPtr(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleMouseLeave = () => tMouse.set(9999, 0, 9999);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    const clock = new THREE.Clock();
    const ffPA = ffGeo.getAttribute('position');

    renderer.setAnimationLoop(() => {
      const t = clock.getElapsedTime();
      timeU.value = t;
      sMouse.lerp(tMouse, 0.08);
      mouseU.value.copy(sMouse);

      for (let i = 0; i < FF; i++) {
        ffPA.setX(i, ffP0[i * 3] + Math.sin(ffPh[i] + t * 0.4) * 0.6);
        ffPA.setZ(i, ffP0[i * 3 + 2] + Math.cos(ffPh[i] * 1.3 + t * 0.3) * 0.6);
      }
      ffPA.needsUpdate = true;
      ffMat.opacity = 0.5 + 0.45 * Math.sin(t * 1.5);

      camera.position.x = Math.sin(t * 0.07) * 1.2;
      camera.position.z = 14 + Math.cos(t * 0.05) * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      scene.clear();
      groundGeo.dispose();
      groundMat.dispose();
      mesh1.geo.dispose();
      mesh1.mat.dispose();
      mesh2.geo.dispose();
      mesh2.mat.dispose();
      ffGeo.dispose();
      ffMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} id="canvas-container" />;
}
