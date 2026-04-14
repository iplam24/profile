<script setup>
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
      <span v-for="skill in skills" :key="skill" class="skill-pill">{{ skill }}</span>
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
    radial-gradient(circle at top right, rgba(255, 208, 92, 0.26), transparent 26%),
    rgba(255, 255, 255, 0.94);
}

.profile-card h1 {
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 4.8rem);
  line-height: 0.95;
  color: #23160a;
}

.profile-lead {
  margin: 0;
  font-size: 1.04rem;
  line-height: 1.8;
  color: #2a1a0c;
}

.profile-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.fact-card,
.skill-pill {
  border: 1px solid rgba(255, 178, 37, 0.16);
  background: rgba(255, 249, 236, 0.92);
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
  color: #d97706;
}

.skill-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-pill {
  padding: 10px 14px;
  border-radius: 999px;
  color: #23160a;
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
  color: #d97706;
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
