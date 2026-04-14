<script setup>
import { Component, FileJson, LayoutPanelTop, Smartphone, Sparkles, Sprout } from 'lucide-vue-next';

defineProps({
  profile: {
    type: Object,
    required: true,
  },
  facts: {
    type: Array,
    required: true,
  },
  skills: {
    type: Array,
    required: true,
  },
});

const skillIcons = {
  sprout: Sprout,
  component: Component,
  smartphone: Smartphone,
  'file-json': FileJson,
  layout: LayoutPanelTop,
  sparkles: Sparkles,
};
</script>

<template>
  <article class="card profile-card">
    <p class="eyebrow">Thông tin của tôi</p>
    <h1>{{ profile.name }}</h1>
    <p class="profile-lead">
      Sinh viên tại Học Viện Nông Nghiệp Việt Nam, đang tập trung vào Spring Boot, Vue.js và Flutter.
      Mục tiêu là làm web và app có giao diện rõ, trẻ trung và dùng được thật.
    </p>

    <div class="profile-facts">
      <div v-for="fact in facts" :key="fact.label" class="fact-card">
        <span>{{ fact.label }}</span>
        <strong>{{ fact.value }}</strong>
      </div>
    </div>

    <div class="skill-strip">
      <span v-for="skill in skills" :key="skill.name" class="skill-pill">
        <component :is="skillIcons[skill.icon]" :size="15" stroke-width="2.1" />
        {{ skill.name }}
      </span>
    </div>

    <div class="profile-actions">
      <slot name="actions" />
    </div>
  </article>
</template>

<style scoped>
.profile-card {
  display: grid;
  gap: 16px;
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(132, 157, 211, 0.16), transparent 28%),
    linear-gradient(160deg, rgba(26, 33, 48, 0.95), rgba(16, 22, 35, 0.92));
}

.profile-card h1 {
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 4.8rem);
  line-height: 0.92;
  color: #e8efff;
  text-shadow: 0 10px 26px rgba(0, 0, 0, 0.5);
}

.profile-lead {
  margin: 0;
  font-size: 1.04rem;
  line-height: 1.8;
  color: rgba(203, 218, 245, 0.86);
}

.profile-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.fact-card,
.skill-pill {
  border: 1px solid rgba(143, 164, 206, 0.22);
  background: rgba(28, 36, 52, 0.72);
}

.fact-card {
  padding: 14px;
  border-radius: 18px;
}

.fact-card span,
.fact-card strong {
  display: block;
}

.fact-card span {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  color: #8fa6d4;
}

.fact-card strong {
  color: #d8e4fb;
}

.skill-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-pill {
  padding: 10px 14px;
  border-radius: 999px;
  color: #dbe7ff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  animation: floatChip 5s ease-in-out infinite;
}

.skill-pill:nth-child(odd) {
  animation-delay: -1.1s;
}

@keyframes floatChip {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }
}

.profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
  color: #8fa6d4;
}

@media (max-width: 720px) {
  .profile-card {
    padding: 18px;
  }

  .profile-facts {
    grid-template-columns: 1fr;
  }
}
</style>


