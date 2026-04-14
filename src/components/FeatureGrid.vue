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
    <article v-for="feature in features" :key="feature.title" class="card feature-card blue-accent">
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
  color: #d97706;
}

.feature-card h3,
.feature-card p {
  color: #23160a;
}

.feature-card h3 {
  margin: 0 0 10px;
  font-size: 1.3rem;
}

.feature-card p {
  line-height: 1.7;
  margin: 0;
}

.blue-accent {
  background:
    radial-gradient(circle at top right, rgba(255, 213, 98, 0.3), transparent 24%),
    rgba(255, 255, 255, 0.94);
}

@media (max-width: 1080px) {
  .grid-three {
    grid-template-columns: 1fr;
  }
}
</style>
