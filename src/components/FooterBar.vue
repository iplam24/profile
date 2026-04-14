<script setup>
import { Facebook, Github, Heart, Music2 } from 'lucide-vue-next';

defineProps({
  profile: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <footer class="card footer-bar">
    <div class="footer-left">
      <p>
        <Heart :size="14" />
        Bởi {{ profile.name }}
      </p>
      <small>{{ profile.school }}</small>
    </div>

    <div class="footer-center">
      <span><Music2 :size="14" /> Chế độ mini game + âm nhạc</span>
    </div>

    <div class="footer-right">
      <a :href="profile.social.facebook" target="_blank" rel="noopener noreferrer">
        <Facebook :size="16" /> Facebook
      </a>
      <a :href="profile.social.github" target="_blank" rel="noopener noreferrer">
        <Github :size="16" /> GitHub
      </a>
    </div>
  </footer>
</template>

<style scoped>
.footer-bar {
  margin-top: 6px;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  align-items: center;
}

.footer-left p {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #dffffb;
  font-weight: 700;
}

.footer-left small {
  color: rgba(191, 233, 242, 0.84);
}

.footer-center span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #9df7ff;
  font-weight: 600;
}

.footer-right {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-right a {
  min-height: 38px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #dffffb;
  border: 1px solid rgba(106, 241, 230, 0.32);
  background: rgba(9, 42, 53, 0.84);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.footer-right a:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 14px rgba(125, 249, 255, 0.28);
}

@media (max-width: 960px) {
  .footer-bar {
    grid-template-columns: 1fr;
  }

  .footer-right {
    justify-content: flex-start;
  }
}
</style>
