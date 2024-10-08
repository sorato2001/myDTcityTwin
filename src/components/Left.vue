<template >
    <div class = 'Left'></div>
    <h1></h1>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.Left{
    background-color: rgb(227, 118, 24);
    width: 300px;
    height: auto;
    left: 0;
    right: 500px;
}
@media(max-width:1000px){
    .Left{
        display: none;
    }
}
</style>