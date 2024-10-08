<template>
  <div id="app">
    <h1>FDS Simulation Visualization</h1>
    <div ref="threeDScene"></div>
  </div>
</template>

<script>
import * as THREE from 'three';
// import { GeoJsonGeometry } from 'three/examples/jsm/lines/GeoJsonGeometry.js'; // 如果需要额外的几何处理

export default {
  name: 'FireSim',
  data() {
    return {
      geojsonData: null
    };
  },
  created() {
    // 在这里加载 GeoJSON 数据，可以从服务器加载或直接导入
    fetch('feature/simulation.geojson')
      .then(response => response.json())
      .then(data => {
        this.geojsonData = data;
        this.initThreeJS();
        console.log(this.geojsonData)
      });
  },
  mounted() {
  },
  
  methods: {
    initThreeJS() {
      // 初始化场景
      const container = this.$refs.threeDScene;
      const scene = new THREE.Scene();
      // 创建摄像机
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 0, 5);
      // 创建渲染器
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);
      // // 添加光源
      // const light = new THREE.DirectionalLight(0xffffff, 1);
      // light.position.set(5, 10, 7.5);
      // scene.add(light);

      // 处理 GeoJSON 数据并添加到场景中
      // this.loadGeoJson(this.geojsonData);
      console.log(scene)

      // 添加简单的立方体（可替换为解析的 .smv 数据）
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      // 开始动画循环
      const animate = function () {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      };

      animate();
    },

    loadGeoJson(geojson) {
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
      geojson.features.forEach(feature => {
        const geometry = this.createGeometryFromGeoJson(feature.geometry);
        if (geometry) {
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
        }
      });
    },

    createGeometryFromGeoJson(geometry) {
      if (geometry.type === 'Polygon') {
        const vertices = geometry.coordinates[0].map(coord => new THREE.Vector3(coord[0], coord[1], coord[2]));
        const shape = new THREE.Shape(vertices);
        const extrudeSettings = { depth: 1, bevelEnabled: false };
        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
      }
      return null;
    },
    
    // animate() {
    //   requestAnimationFrame(this.animate);
    //   renderer.render(scene, this.camera);
    //   console.log('animate')
    // }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
  width: 100%;
  height: 100vh;
}
</style>
