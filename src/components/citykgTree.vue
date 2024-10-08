<template>
  <div ref="graph" id="3d-graph"></div>
</template>

<script>
import ForceGraph3D from '3d-force-graph';
import * as d3 from "d3";
import recordData from './records.json';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { toRaw } from 'vue';
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

let sprite;
let nodeEl;
let label;
const rootId = 0;

export default{
  name: 'graph',
  data() {
    return {
      myGraph: null, // 3D-graph对象
      // 3D-graph加载的图数据
      graphData: null,
    };
  },
  mounted() {
    this.initGraph ()
  },
  methods:{
    initGraph(){
      // graph config
      const NODE_REL_SIZE = 1;
      const graph = ForceGraph3D()
        .dagMode('td')
        .dagLevelDistance(200)
        .backgroundColor("black")                                                       // 背景颜色，支持内置颜色和RGB
        .width(this.$refs.graph.parentElement.offsetWidth )                             // 画布宽度(充满父级容器)
        .height(this.$refs.graph.parentElement.offsetHeight)   
        .linkColor(() => 'rgba(255,255,255,0.2)')
        .nodeRelSize(NODE_REL_SIZE)
        .nodeId('path')
        .nodeVal('size')
        .nodeLabel('path')
        .nodeAutoColorBy('module')
        .nodeOpacity(0.9)
        .linkDirectionalParticles(2)
        .linkDirectionalParticleWidth(0.8)
        .linkDirectionalParticleSpeed(0.006)
        // .d3Force('collision', d3.forceCollide(node => Math.cbrt(node.size) * NODE_REL_SIZE))
        .d3VelocityDecay(0.3);

      // Decrease repel intensity
      graph.d3Force('charge').strength(-15);

      this.myGraph = graph;

      fetch('http://localhost:5173/src/components/dataset.csv')
        .then(r => r.text())
        .then(d3.csvParse)
        .then(data => {
          const nodes = [], links = [];
          data.forEach(({ size, path }) => {
            const levels = path.split('/'),
              level = levels.length - 1,
              module = level > 0 ? levels[1] : null,
              leaf = levels.pop(),
              parent = levels.join('/');

            const node = {
              path,
              leaf,
              module,
              size: +size || 20,
              level
            };

            nodes.push(node);

            if (parent) {
              links.push({source: parent, target: path, targetNode: node});
            }
          });

      graph(document.getElementById('3d-graph'))
      .graphData({ nodes, links });

      
      // const stats = new Stats();
      // document.body.appendChild(stats.dom);
      // // console.log(THREE);
      // // 初始化场景
      // const scene = new THREE.Scene();
      
      // // console.log(d3);
      // // 创建透视相机
      // const camera = new THREE.PerspectiveCamera(
      //   90,
      //   window.innerHeight / window.innerHeight,
      //   0.1,
      //   100000
      // );
      // // 设置相机位置
      // // object3d具有position，属性是1个3维的向量
      // camera.position.set(0, 0, 1000);
      // // 更新摄像头
      // camera.aspect = window.innerWidth / window.innerHeight;
      // //   更新摄像机的投影矩阵
      // camera.updateProjectionMatrix();
      // scene.add(camera);
      
      // // 加入辅助轴，帮助我们查看3维坐标轴
      // const axesHelper = new THREE.AxesHelper(5);
      // scene.add(axesHelper);
      
      // // 加载纹理
      
      // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      // scene.add(directionalLight);
      // const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
      // scene.add(light);
      // // 初始化渲染器
      // const renderer = new THREE.WebGLRenderer({ alpha: true });
      // // renderer.shadowMap.enabled = true;
      // // renderer.shadowMap.type = THREE.BasicShadowMap;
  
      // controls.enableDamping = true;
      // // 设置自动旋转
      // // controls.autoRotate = true;
      
      // const clock = new THREE.Clock();
      // function animate(t) {
      //   controls.update();
      //   stats.update();
      //   const deltaTime = clock.getDelta();
      
      //   requestAnimationFrame(animate);
      //   // 使用渲染器渲染相机看这个场景的内容渲染出来
      //   renderer.render(scene, camera);
      // }
      
      // animate();    // renderer.shadowMap.type = THREE.VSMShadowMap;
      
      // // 设置渲染尺寸大小
      // renderer.setSize(window.innerWidth, window.innerHeight);
      
      // // 监听屏幕大小改变的变化，设置渲染的尺寸
      // window.addEventListener("resize", () => {
      //   //   console.log("resize");
      //   // 更新摄像头
      //   camera.aspect = window.innerWidth / window.innerHeight;
      //   //   更新摄像机的投影矩阵
      //   camera.updateProjectionMatrix();
      
      //   //   更新渲染器
      //   renderer.setSize(window.innerWidth, window.innerHeight);
      //   //   设置渲染器的像素比例
      //   renderer.setPixelRatio(window.devicePixelRatio);
      // });
      
      // // 将渲染器添加到body
      // document.getElementById('3d-graph').appendChild(renderer.domElement);
      // const canvas = renderer.domElement;
      
      // // 初始化控制器
      // const controls = new OrbitControls(camera, renderer.domElement);
      // // 设置控制器阻尼
      
      // // 创建纹理加载器对象
      // const textureLoader = new THREE.TextureLoader();
      
      // const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
      // const planeMaterial = new THREE.MeshLambertMaterial({color: 0xFF0000, side: THREE.DoubleSide});
    //   let points = [
    //     new THREE.Vector2(2.602686490892495 * 10, 1.6113597725424142* 10),
    //      new THREE.Vector2(-50.1, -50),

    // new THREE.Vector2(0.2312, 50.3),
    //     new THREE.Vector2(2.602181379504543* 10, 1.611277914665834* 10),
    //     new THREE.Vector2(2.6022115178865306* 10, 1.6110709436347292* 10),
    //     new THREE.Vector2(2.60272070546182* 10, 1.6111515143753365* 10),
    //     new THREE.Vector2(2.602686490892495* 10, 1.6113597725424142* 10),
    //   ]
    //   // 通过顶点定义轮廓
    //   let shape = new THREE.Shape(points);
    //   // shape可以理解为一个需要填充轮廓
    //   // 所谓填充：ShapeGeometry算法利用顶点计算出三角面face3数据填充轮廓
    //   let geometry = new THREE.ShapeGeometry(shape, 25);
    //   let material=new THREE.MeshLambertMaterial({
    //       color:0x0000ff,//三角面颜色
    //       side:THREE.DoubleSide//两面可见
    //   });//材质对象
    //   // material.wireframe = true;//线条模式渲染(查看细分数)
    //   const mesh = new THREE.Mesh(geometry, material);
    //   mesh.position.set(-100, -200, -100);
    //   mesh.rotation.set(0.5 * Math.PI, 0, 0);
    //   scene.add(mesh);
    //   console.log(mesh);
      
      const loader = new THREE.FileLoader();
      loader.load(
        'http://192.168.1.49:8080/single/房屋.json', // GeoJSON 文件的路径
        function (data) {
          const geoJson = JSON.parse(data);
          // 检查 GeoJSON 的类型
          if (geoJson.type === 'FeatureCollection') {
            geoJson.features.forEach(feature => {
              // console.log(feature);
              createBuilding(feature);
            });
          }            
        }
      );
      
      var projection = d3.geoMercator()
      //地图投影的中心位置
      .center([119, 30])
      //地图投影的偏移量
      .translate([0, 0])
      .scale(1);


      function createBuilding(feature){
        const coordinates = feature.geometry.coordinates;
        if(feature.geometry.type == "Polygon"){
            coordinates.forEach(coordinate => {
            const mesh = drawExtrudeMesh(coordinate,projection,feature.properties.height);
            mesh.position.set(-100, -400, -100);
            mesh.rotation.set(-0.5 * Math.PI, 0, 0);
            // console.log(mesh);
            graph.scene().add(mesh);
          })
        }
      };
      console.log(scene);

      function drawExtrudeMesh(coordinates, projection, height){
        // const shape = new THREE.Shape();
        let points = [];
        coordinates.forEach((coordinate, i) => {
          const [x, y] = projection(coordinate);
          // console.log(coordinate, [x, y]);
          // if(i == 0){
          //   shape.moveTo(x, -y);
          // }
          // shape.lineTo(x, -y);
          points.push(new THREE.Vector2(x * 10000000 - 170000,-y * 10000000 - 105700));
        });
        const shape = new THREE.Shape(points); 
        // console.log(points);
        const geometry = new THREE.ExtrudeGeometry(shape,{
          depth: height,
          bevelEnabled: true,
        });
        const randomColor = (0.5 + Math.random() * 0.5) * 0xffffff;
        const material = new THREE.MeshBasicMaterial({
          color: randomColor,
          transparent: true,
          opacity: 0.5,
        })
        // let material=new THREE.MeshLambertMaterial({
        //   color:0x0000ff,//三角面颜色
        //   side:THREE.DoubleSide//两面可见
        // });//材质对象
        return new THREE.Mesh(geometry, material)
      };
  });
  
    },
  }

}
</script>

<style scoped>
#graph {
  background-color: rgb(0, 0, 0);
  padding: 1rem;
  height: 95%;
  width: 100%;
  border-radius: 5px;
}
.node-label {
  font-size: 12px;
  padding: 1px 4px;
  border-radius: 4px;
  background-color: rgba(0,0,0,0.5);
  user-select: none;
} 
</style>