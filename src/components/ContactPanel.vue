<script setup>
import { Facebook, Github } from 'lucide-vue-next';

defineProps({
  profile: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <section id="contact" class="card contact-card">
    <div>
      <p class="eyebrow">Liên hệ</p>
      <h3>Kết nối nhanh</h3>
    </div>

    <div class="contact-list">
      <div>
        <span>Tên</span>
        <strong>{{ profile.name }}</strong>
      </div>
      <div>
        <span>Điện thoại</span>
        <strong>{{ profile.phone }}</strong>
      </div>
      <div>
        <span>Trường</span>
        <strong>{{ profile.school }}</strong>
      </div>
    </div>

    <div class="social-links">
      <a class="social-btn" :href="profile.social.facebook" target="_blank" rel="noopener noreferrer">
        <Facebook :size="16" />
        Facebook
      </a>
      <a class="social-btn" :href="profile.social.github" target="_blank" rel="noopener noreferrer">
        <Github :size="16" />
        GitHub
      </a>
    </div>
  </section>
</template>

<style scoped>
.contact-card {
  display: grid;
  gap: 16px;
  padding: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
  color: #8fa6d4;
}

.contact-card h3 {
  margin: 0;
  color: #e8efff;
}

.contact-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.contact-list > div {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(143, 164, 206, 0.24);
  background: rgba(27, 36, 54, 0.78);
}

.contact-list span,
.contact-list strong {
  display: block;
}

.contact-list span {
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.74rem;
  color: #8fa6d4;
}

.contact-list strong {
  color: #d8e4fb;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.social-btn {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(106, 241, 230, 0.34);
  background: linear-gradient(135deg, rgba(0, 201, 167, 0.2), rgba(0, 212, 255, 0.2));
  color: #dffffb;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.28), 0 0 20px rgba(125, 249, 255, 0.22);
}

@media (max-width: 1080px) {
  .contact-list {
    grid-template-columns: 1fr;
  }
}
</style>


