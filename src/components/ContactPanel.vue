<script setup>
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
  color: #d97706;
}

.contact-card h3 {
  margin: 0;
  color: #23160a;
}

.contact-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.contact-list > div {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 178, 37, 0.16);
  background: rgba(255, 249, 236, 0.94);
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
  color: #d97706;
}

@media (max-width: 1080px) {
  .contact-list {
    grid-template-columns: 1fr;
  }
}
</style>
