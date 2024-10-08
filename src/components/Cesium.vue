<template>
    <div id="CesiumContainer"></div>
</template>

<script lang="ts" setup>
    import* as Cesium from 'cesium';
    import { onMounted } from 'vue';
    onMounted(()=>{
        const viewer = new Cesium.Viewer('CesiumContainer',{
        infoBox:false,
        })
    })

</script>

<style>
html,body,#CesiumContainer{
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;

}
</style>