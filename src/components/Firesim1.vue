<template>
  <div id="app">
    <h1 class = "title">FDS Simulation Visualization</h1>
    <div ref="threeDScene"></div>
    <div class="btn">
      <div class="firesimulation">火灾模拟</div>
    </div>
  </div>
</template>

<script>
import { Color } from 'cesium';
import { onMounted, ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { FireEffect } from './FireSimulation/FireSimulation.js';
import { ElMessage } from 'element-plus';
import 'element-plus/theme-chalk/el-message.css'
let burner, scene, camera, renderer, controls;

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
    let firesimulationNode = document.querySelector('.firesimulation');

    const firesimulation = (() => {
      let status = false;

      function load(feature)
      {
        let coor = feature.geometry.coordinates[0].map(coord => new THREE.Vector3(coord[0], coord[1], coord[2]))[4];
        console.log(coor);                      
        // 创建火焰粒子系统
        let particleSystem, clock;
        const particles = new THREE.BufferGeometry();
        const particleCount = 1000;
        const positions = [];
        const sizes = [];
        const speeds = []; // 每个粒子的上升速度

        // 火焰的初始半径和高度
        const flameRadius = 0.35;
        const flameHeight = 2;

        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2; // 随机角度
          const radius = Math.random() * flameRadius; // 半径决定火焰底部的范围
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const z = Math.random() * flameHeight - flameHeight / 2; // 火焰的初始高度

          // 将粒子位置加入数组
          positions.push(x, y, z); // 注意，Y变成Z轴，因为火焰朝上的方向是Z轴

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
        particleSystem.position.set(coor.x, coor.y, coor.z)
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
            positions[i + 2] += speeds[i / 3] * delta; // Y轴上的位置 (向上)

            // 火焰逐渐扩散
            positions[i] *= 1.003; // X 轴扩散
            positions[i + 1] *= 1.003; // Z 轴扩散

            // 如果粒子到达一定高度，重置位置
            if (positions[i + 2] > flameHeight / 2) {
              positions[i + 2] = 0; // 重新回到底部
              positions[i] = (Math.random() - 0.5) * flameRadius * 2; // 重置X轴和Z轴的位置
              positions[i + 1] = (Math.random() - 0.5) * flameRadius * 2;
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
      }

      return (viewer) => {
        status = !status;
        if (status) {
          load(burner);
          ElMessage({
            message: '火灾数据加载成功',
            type: 'success',
          });
        } else {
          console.log(status);
          ElMessage({
            message: '加载数据卸载成功',
            type: 'success',
          });
        }
      };
    })();
    firesimulationNode.addEventListener('click', () => {
      firesimulation();
    });
  },

  methods: {
    initThreeJS() {
      // 初始化场景
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
      camera.position.set(0, 0, 20); // 设置相机在 X 轴上
      renderer = new THREE.WebGLRenderer();

      renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.threeDScene.appendChild(renderer.domElement);

      controls = new TrackballControls( camera, renderer.domElement);
      controls.dynamicDampingFactor = 1;
      controls.rotateSpeed = 8;
      controls.panSpeed = 2;
      controls.zoomSpeed = 2;

      window.addEventListener('resize', () => onWindowResize())
      const onWindowResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight)
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
      }
      scene.add(new THREE.AxesHelper(10000));
      this.loadGeoJson(this.geojsonData,scene, renderer, camera)

      const animate = function () {
        requestAnimationFrame( animate );

				controls.update();

				renderer.render( scene, camera );
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
                      burner = feature;
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

<style lang="scss" scoped>
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 0px;
  color: rgba(255, 255, 255, 0);
}

.btn {
  display: flex;
  position: absolute;
  top: 100px;
  right: 0px;
  z-index: 1;
  padding: 10px 0px;
  cursor: pointer;

  div {
    margin: 0 2px;
    padding: 12px 24px;
    border: none;
    border-radius: 50px;
    color: white;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    text-decoration: none;
    background: linear-gradient(45deg, #6a5acd, #00bfff);
    cursor: pointer;
    box-shadow: 0 5px 15px rgb(0 0 0 / 20%);
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(45deg, #00bfff, #6a5acd);
      box-shadow: 0 8px 20px rgb(0 0 0 / 30%);
      transform: translateY(-3px);
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 4px 10px rgb(0 0 0 / 20%);
    }
  }
}
.title{
  background: linear-gradient(45deg, #6a5acd, #00bfff);
  color: linear-gradient(45deg, #6a5acd, #00bfff);
  // font-size: 16px;
  // font-weight: bold;
  text-align: center;
}
</style>
