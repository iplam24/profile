<script setup>
defineProps({
  features: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <section class="grid-three">
    <article v-for="feature in features" :key="feature.title" class="card feature-card luxe-accent">
      <p class="eyebrow">{{ feature.eyebrow }}</p>
      <h3>{{ feature.title }}</h3>
      <p>{{ feature.text }}</p>
    </article>
  </section>
</template>

<style scoped>
.grid-three {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.feature-card {
  padding: 24px;
  border-radius: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
  color: #8fa6d4;
}

.feature-card h3,
.feature-card p {
  color: #d8e4fb;
}

.feature-card h3 {
  margin: 0 0 10px;
  font-size: 1.3rem;
}

.feature-card p {
  line-height: 1.7;
  margin: 0;
}

.luxe-accent {
  background:
    radial-gradient(circle at top right, rgba(132, 157, 211, 0.16), transparent 30%),
    linear-gradient(155deg, rgba(27, 36, 54, 0.92), rgba(17, 23, 35, 0.92));
}

@media (max-width: 1080px) {
  .grid-three {
    grid-template-columns: 1fr;
  }
}
</style>


