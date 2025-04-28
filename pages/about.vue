<template>
    <div class="container">
        <h1>เกี่ยวกับเรา</h1>
        <img src="../public/images/RRBล่าสุด.jpg" />
    </div>
</template>

<script setup>
useHead({
    title: "เกี่ยวกับเรา",
    meta: [
        { name: "description", content: "ร้านค้า,อุปกรณ์คอมพิวเตอร์,เสื้อผ้า" },
    ],
});
</script>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

img {
    width: 500px;
    height: 550px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
