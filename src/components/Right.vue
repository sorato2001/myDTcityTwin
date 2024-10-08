<template >
    <div class = 'Right'>
        <RightTop/>
        <RightMid/>
        <RightBottom/>
    </div>
</template>

<script lang="ts" setup>
import RightTop from './RightTop.vue'
import RightMid from './RightMid.vue'
import RightBottom from './RightBottom.vue'
</script>

<style scoped>
.Right{
    background-color: rgb(36, 133, 17);
    width: 300px;
    height: auto;
    right: 0;
}
@media(max-width:1000px){
    .Right{
        display: none;
    }
}
</style>