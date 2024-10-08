<template>
  <div ref="graph" id="graph"></div>
</template>

<script>
import ForceGraph3D from '3d-force-graph';
import jsonData from './miserables.json';
import recordData from './records.json'
import SpriteText from 'three-spritetext';

export default {
  name: 'graph',
  data() {
    return {
      myGraph: null, // 3D-graph对象
      // 3D-graph加载的图数据
      graphData1: null,
    };
  },

  mounted() {
    this.initGraph();
  },

  methods: {
    initGraph() {
      let graph_info =this.ReadData();
      /** 构造3D-Graph数据的边 */
      const links = Object.values(graph_info.rel_info);
      /** 构造3D-Graph数据的节点 */
      const nodes = Object.values(graph_info.node_info);
      // const nodes = Object.entries(graph_info.node_info).map(entry=>{
      //   return {id:entry[1].id, group:entry[1].group}
      // })
      this.graphData1 = {
        nodes: nodes, 
        links: links
      };

      this.myGraph = ForceGraph3D()
        (document.getElementById('graph'))
          .graphData(this.graphData1)
          //nodes
          .nodeLabel(node => node.properties.name)         
          .nodeAutoColorBy(node => node.labels)
          .nodeThreeObject(node => {
            const sprite = new SpriteText(node.properties.name)  //需要下载import SpriteText from 'three-spritetext'
            sprite.material.depthWrite = false; // make sprite background transparent
            sprite.color = node.color
            sprite.textHeight = 8
            return sprite
          })
          .nodeThreeObjectExtend(true)
          .nodeOpacity(1)
          //links
          .linkLabel(r => r.type)                                               // 边的标签显示（鼠标滑到边上显示）   
          .linkAutoColorBy(r => r.type)                                         // 边颜色自动化分
          // 显示的文字
          .linkThreeObject(link => {
            // extend link with text sprite
            const sprite = new SpriteText(`${link.type}`)
            sprite.color = link.color
            sprite.textHeight = 6
            return sprite
          })
          .linkThreeObjectExtend(true)  //不替换原来的样式只扩展 true
            //连接的位置更新
          .linkPositionUpdate((sprite, { start, end }) => {
            const middlePos = Object.assign(
              ...['x', 'y', 'z'].map(c => ({
                [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
              }))
            )
            console.log(middlePos)
            // Position sprite
            Object.assign(sprite.position, middlePos)
          })
          .d3Force('charge').strength(-200);
      this.myGraph.graphData(this.graphData1);
  },

  ReadData(){
    //var json = require(jsonpath)
    const node_info = recordData.nodes
    const rel_info = recordData.links
    return {node_info,rel_info}
  },
  }
};
</script>

<style scoped>
#graph {
  background-color: rgb(0, 0, 0);
  padding: 1rem;
  height: 95%;
  width: 100%;
  border-radius: 5px;
}
</style>
