<template>
  <div ref="graph" id="3d-graph"></div>
</template>

<script>
import * as d3 from "d3";
import ForceGraph3D from '3d-force-graph';
import recordData from './records.json'
import SpriteText from 'three-spritetext';
// import * as THREE from 'three';
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
      const NODE_REL_SIZE = 1;
      let graph_info =this.ReadData();
      /** 构造3D-Graph数据的边 */
      const links = Object.values(graph_info.rel_info);
      /** 构造3D-Graph数据的节点 */
      const nodes = Object.values(graph_info.node_info);
      //向节点添加属性collapsed和childlinks  
      nodes.forEach(v => {
        Object.assign(v, { collapsed: v.id !== rootId , childLinks: [] });    //&& v.id !== 3 && v.id !== 4 && v.id !== 5
      });
      this.graphData = {
        nodes: nodes, 
        links: links
      };   
      const nodesById = Object.fromEntries(this.graphData.nodes.map(node => [node.id, node]));
      this.graphData.links.forEach(link => {
        nodesById[link.target].childLinks.push(link);
      });
      // //用于获取当前显示的节点
      const getPrunedTree = () => {
        const visibleNodes = [];
        const visibleLinks = [];
        (function traverseTree(node = nodesById[rootId]) {
          visibleNodes.push(node);
          if (node.collapsed) return;
          visibleLinks.push(...node.childLinks);
          node.childLinks
            .map(link => ((typeof link.source) === 'object') ? link.source : nodesById[link.source]) // get child node
            .forEach(traverseTree);
        })(); // IIFE
        return { nodes: visibleNodes, links: visibleLinks };
      };  
        debugger;
      const elem = document.getElementById('3d-graph');
      this.myGraph = ForceGraph3D({
      extraRenderers: [new CSS2DRenderer()]
    })(elem)
      .graphData(getPrunedTree())
      .backgroundColor("black")                                                       // 背景颜色，支持内置颜色和RGB
      .width(this.$refs.graph.parentElement.offsetWidth )                             // 画布宽度(充满父级容器)
      .height(this.$refs.graph.parentElement.offsetHeight)   
      .cameraPosition((node) => {
				debugger;
        return [this.getposition(node), this.getNode(nodes), 3000];
      })      
      //node
      .nodeLabel(node => node.labels[0])
      .nodeAutoColorBy(node => node.labels[0])
      // .nodeThreeObject(node => {
      //   // sprite = new SpriteText(node.properties.name);  //需要下载import SpriteText from 'three-spritetext'
      //   // sprite.material.depthWrite = false; // make sprite background transparent
      //   // sprite.color = node.color;
      //   // sprite.textHeight = 6;
      //   // sprite.backgroundColor = 'white';
      //   // return toRaw(sprite);
      // })
      .nodeThreeObject(node => {
        const nodeEl = document.createElement('div');
        nodeEl.textContent = node.properties.name;
        nodeEl.style.color = node.color;
        nodeEl.className = 'node-label';
        nodeEl.style.fontSize = '20px';
        nodeEl.style.backgroundColor =' rgba(0,0,0,0.5)';
        nodeEl.style.padding = '1px 4px';
        nodeEl.style.borderRadius = '4px';
        nodeEl.style.userSelect = 'none';
        // label = new CSS2DObject(nodeEl);
        return new CSS2DObject(nodeEl);
      })
      .nodeThreeObjectExtend(true)
      .nodeOpacity(1)
      .onNodeHover(node => elem.style.cursor = node && node.childLinks.length ? 'pointer' : null)
      .onNodeClick(node => {
        if (node.childLinks.length) {         //花城汇北区展开有bug
          if(node.properties.name == "花城汇北区"){
            return;
          }
          else{
            node.collapsed = !node.collapsed; // toggle collapse state
            this.myGraph.graphData(getPrunedTree());
          }
        }
      })
      .onNodeRightClick(node => {
          // Aim at node from outside it
          const distance = 40;
          const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

          const newPos = node.x || node.y || node.z
            ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
            : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

          this.myGraph.cameraPosition(
            newPos, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
          );
        })
      .onNodeDragEnd(node => {
        node.fx = node.x;
        node.fy = node.y;
        node.fz = node.z;
      })
      //link
      // .linkLabel(r => r.type)                                               // 边的标签显示（鼠标滑到边上显示）   
      .linkAutoColorBy(r => r.type)                                         // 边颜色自动化分
      .linkWidth(1)
      // 显示的文字
      // .linkThreeObject(link => {
      //   // extend link with text sprite
      //   sprite = new SpriteText(`${link.type}`)
      //   sprite.color = link.color
      //   sprite.textHeight = 6
      //   return sprite
      // })
      .linkThreeObject(link => {
        const nodeEl = document.createElement('div');
        nodeEl.textContent = link.type;
        nodeEl.style.color = link.color;
        nodeEl.className = 'link-label';
        nodeEl.style.fontSize = '20px';
        nodeEl.style.backgroundColor =' rgba(0,0,0,0.5)';
        nodeEl.style.padding = '1px 4px';
        nodeEl.style.borderRadius = '4px';
        nodeEl.style.userSelect = 'none';
        // label = new CSS2DObject(nodeEl);
        //console.log(nodeEl)
        return new CSS2DObject(nodeEl);
      })
      .linkThreeObjectExtend(true)  //不替换原来的样式只扩展 true
        //连接的位置更新
      .linkPositionUpdate((sprite, { start, end }) => {
        const middlePos = Object.assign(
          ...['x', 'y', 'z'].map(c => ({
            [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
          }))
        )
        //console.log(middlePos)
        // Position sprite
        Object.assign(sprite.position, middlePos)
      })
      //.d3Force('charge').strength(-200);
    },
    ReadData(){
      const node_info = recordData.nodes;
      const rel_info = recordData.links;
      // for (var i =0;i < node_info.length;i++){

      // }
      return {node_info,rel_info};
    },
    getposition(node1) {
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      const node = this.getNode(node1);
      const newPos =
        node.x || node.y || node.z ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio } : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)
      return newPos;
    },
    getNode(node1) {
      const node = Object.fromEntries((node1) => [node1.id, node1]);
      return node;
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