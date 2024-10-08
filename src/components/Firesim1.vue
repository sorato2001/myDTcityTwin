<template>
  <div id="app">
    <h1>FDS Simulation Visualization</h1>
    <div ref="threeDScene"></div>
  </div>
</template>

<script>
import { Color } from 'cesium';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FireEffect } from './FireSimulation/FireSimulation.js';

export default {
  name: 'App',
  created() {
    // 在这里加载 GeoJSON 数据，可以从服务器加载或直接导入
    fetch('feature/test5.geojson')
      .then(response => response.json())
      .then(data => {
        this.geojsonData = data;
        this.initThreeJS();
        // console.log(this.geojsonData)
      });
  },
  mounted() {
    // this.initThreeJS();
  },
  methods: {
    initThreeJS() {
      // 初始化场景
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
      const renderer = new THREE.WebGLRenderer();

      renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.threeDScene.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true; // 启用阻尼感，使运动更加平滑
      controls.dampingFactor = 0.25;
      controls.screenSpacePanning = true;
      // controls.minDistance = 2;
      // // controls.maxDistance = 10;
      // controls.maxPolarAngle = Math.PI ; // 限制垂直旋转
      scene.add(new THREE.AxesHelper(10000));
      this.loadGeoJson(this.geojsonData,scene, renderer, camera)

      camera.position.z = 20;

      const animate = function () {
        requestAnimationFrame(animate);
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      };

      animate();
    },
    
    loadGeoJson(geojson, scene, renderer, camera) {
      let material;
      let mesh;
      geojson.features.forEach(feature => {
        switch (feature.properties.type)
          {
            case "OBST":
              if(feature.properties.hasOwnProperty('SURF_ID'))
                {
                  switch (feature.properties.SURF_ID){
                      case "'wood'":
                      material = new THREE.MeshBasicMaterial({ color: 0x8B4513, wireframe: false});
                      mesh = this.createGeometryFromGeoJson(feature.geometry, material);
                      break;

                      case "'burner'":
                      let coor = feature.geometry.coordinates[0].map(coord => new THREE.Vector3(coord[0], coord[1], coord[2]))[4];
                      // const loader = new THREE.TextureLoader();
                      // loader.load('feature/fire.png', texture => {
                      //   const fireMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
                      //   const fire = new THREE.Sprite(fireMaterial);
                      //   fire.position.set(coor.x, coor.y, coor.z);
                      //   fire.scale.set(2, 2, 2); // 调整火焰的大小
                      //   scene.add(fire);
                      // });
                      
                      // const loader = new THREE.TextureLoader();
                      // loader.load('feature/fire.png', (texture) => {
                      //   const fireMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
                      //   const fireSprite = new THREE.Sprite(fireMaterial);
                      //   fireSprite.position.set(coor.x, coor.y, coor.z);
                      //   fireSprite.scale.set(2, 3, 2); // 调整火焰大小
                      //   scene.add(fireSprite);
                        
                      //   this.animateFire(fireSprite, texture);
                      // });

                      // 创建锥形几何体来表示火焰
                      // const fireGeometry = new THREE.ConeGeometry(1, 3, 32);
                      // const fireMaterial = new THREE.MeshBasicMaterial({
                      //   color: 0xff5500, // 初始火焰的橙色
                      //   opacity: 0.8,
                      //   transparent: true,
                      //   side: THREE.DoubleSide
                      // });

                      // // 创建火焰 Mesh
                      // const fireMesh = new THREE.Mesh(fireGeometry, fireMaterial);
                      // scene.add(fireMesh);

                      // // 设置火焰的初始位置
                      // fireMesh.position.set(coor.x, coor.y, coor.z); // 你可以根据需要调整位置

                      // function animateFire() {
                      //   // 模拟火焰的动态拉伸
                      //   fireMesh.scale.y = 1 + Math.sin(Date.now() * 0.005) * 0.1; // 动态调整火焰高度
                      //   fireMesh.scale.x = 1 + Math.random() * 0.02; // 模拟火焰宽度的微小波动
                      //   fireMesh.scale.z = fireMesh.scale.x; // 保证火焰的横截面是圆形

                      //   // 动态调整火焰颜色，模拟由橙色到黄色的渐变
                      //   const colorValue = 0xff5500 + Math.floor(Math.random() * 0x10000); // 随机微调颜色
                      //   fireMesh.material.color.setHex(colorValue);

                      //   requestAnimationFrame(animateFire);
                      // }

                      // // 启动火焰动画
                      // animateFire();

                      // 创建火焰粒子系统
                      let particleSystem, clock;
                      const particles = new THREE.BufferGeometry();
                      const particleCount = 1000;
                      const positions = [];
                      const sizes = [];
                      const speeds = []; // 每个粒子的上升速度

                      // 火焰的初始半径和高度
                      const flameRadius = 0.5;
                      const flameHeight = 1.5;

                      for (let i = 0; i < particleCount; i++) {
                        const angle = Math.random() * Math.PI * 2; // 随机角度
                        const radius = Math.random() * flameRadius; // 半径决定火焰底部的范围
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        const z = Math.random() * flameHeight - flameHeight / 2; // 火焰的初始高度

                        // 将粒子位置加入数组
                        positions.push(x, z, y); // 注意，Y变成Z轴，因为火焰朝上的方向是Z轴

                        // 粒子的大小
                        sizes.push(Math.random() * 1 + 0.05);

                        // 粒子的上升速度
                        speeds.push(0.5 + Math.random() * 0.5); // 每个粒子随机速度
                      }

                      particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                      particles.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

                      // 创建粒子材质
                      const particleMaterial = new THREE.ShaderMaterial({
                        transparent: true,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false,
                        uniforms: {
                          pointTexture: { value: new THREE.TextureLoader().load('feature/fire.png') }
                        },
                        vertexShader: `
                          attribute float size;
                          varying vec3 vColor;
                          void main() {
                            vColor = vec3(1.0, 0.5, 0.0); // 火焰的橙色调
                            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                            gl_PointSize = size * (300.0 / -mvPosition.z);
                            gl_Position = projectionMatrix * mvPosition;
                          }
                        `,
                        fragmentShader: `
                          varying vec3 vColor;
                          uniform sampler2D pointTexture;
                          void main() {
                            gl_FragColor = vec4(vColor, 1.0);
                            gl_FragColor *= texture2D(pointTexture, gl_PointCoord);
                          }
                        `
                      });

                      // 创建点模型
                      particleSystem = new THREE.Points(particles, particleMaterial);
                      particleSystem .position.set(coor.x, coor.y, coor.z)
                      scene.add(particleSystem);

                      // 动画时钟
                      clock = new THREE.Clock();

                      function animate() {
                        requestAnimationFrame(animate);

                        const delta = clock.getDelta();
                        const positions = particleSystem.geometry.attributes.position.array;
                        const sizes = particleSystem.geometry.attributes.size.array;

                        for (let i = 0; i < positions.length; i += 3) {
                          // 粒子上升
                          positions[i + 1] += speeds[i / 3] * delta; // Y轴上的位置 (向上)

                          // 火焰逐渐扩散
                          positions[i] *= 1.01; // X 轴扩散
                          positions[i + 2] *= 1.01; // Z 轴扩散

                          // 如果粒子到达一定高度，重置位置
                          if (positions[i + 1] > flameHeight / 2) {
                            positions[i + 1] = -flameHeight / 2; // 重新回到底部
                            positions[i] = (Math.random() - 0.5) * flameRadius * 2; // 重置X轴和Z轴的位置
                            positions[i + 2] = (Math.random() - 0.5) * flameRadius * 2;
                          }

                          // 模拟火焰粒子逐渐变大和消失
                          sizes[i / 3] *= 1.01; // 粒子逐渐变大
                          if (sizes[i / 3] > 2) sizes[i / 3] = Math.random() * 1 + 0.05; // 重置粒子大小
                        }

                        // 更新几何体数据
                        particleSystem.geometry.attributes.position.needsUpdate = true;
                        particleSystem.geometry.attributes.size.needsUpdate = true;

                        // 渲染场景
                        renderer.render(scene, camera);
                      }

                      animate();

                      material = new THREE.MeshBasicMaterial({ color: 0xFF0000 , wireframe: false});
                      mesh = this.createGeometryFromGeoJson(feature.geometry, material);
                      // mesh.position.set(coor.x, coor.y, coor.z)
                      break;
                    
                      case "'INERT'":
                      material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF , wireframe: true});
                      mesh = this.createGeometryFromGeoJson(feature.geometry, material);
                      break;
                  }
                }
            break;
            case "HOLE":
            material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false});
            mesh = this.createGeometryFromGeoJson(feature.geometry, material);
            break;
            case "VENT":
            break;
          }
          if (mesh) {             
              scene.add(mesh);
        }
      });
    },


    createGeometryFromGeoJson(geometry, material) {
      if (geometry.type === 'Polygon') {
        const vertices = geometry.coordinates[0].map(coord => new THREE.Vector3(coord[0], coord[1], coord[2]));
        const shape = new THREE.Shape(vertices)
        // 计算高度（depth）可以通过坐标点的 Z 值的差来决定
        const zStart = geometry.coordinates[0][0][2] || 0; // 起始高度
        const zEnd = geometry.coordinates[0][4][2] || 0;   // 结束高度

        // 计算 extrudeSettings 中的 depth，也就是对象的高度
        const extrudeSettings = { 
          depth: Math.abs(zStart - zEnd), // 取 Z 轴差值的绝对值作为高度
          bevelEnabled: false 
        };

        // 使用 shape 和 extrudeSettings 创建三维几何体
        const geometry3D = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const mesh = new THREE.Mesh(geometry3D, material);

        // 设置 mesh 在 Z 轴上的位置
        mesh.position.z = Math.min(zStart, zEnd); // 根据 zStart 和 zEnd 中的较小值设置 Z 轴位置

        return mesh; // 返回带有位置设置的网格对象
      }
      return null;
    },
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
}
</style>
