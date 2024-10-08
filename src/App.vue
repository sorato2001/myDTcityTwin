//html模板
<template>
  <div class="app">
  <left/> 
  <!-- <Center/>
  <Cesium/>
  <Right/>  -->
  <FS />
  </div>
</template>

//逻辑代码
<script lang="ts" setup>//指明语言为ts
import left from './components/Left.vue';//导入组件
//import Center from './components/Center.vue';
import Cesium from './components/Cesium.vue';
import Right from './components/Right.vue';
import KG from './components/KnowledgeGraph.vue';
import CK from './components/citykg.vue';
import CKT from './components/citykgTree.vue';
import FS from './components/Firesim1.vue';
</script>
<style>
html,body{
    margin: 0%;
    padding: 0%;
    width: 100%;
    height: auto;}
.app{
    display: flex;
    width: 100%;
    height: 100vh;
}
</style>