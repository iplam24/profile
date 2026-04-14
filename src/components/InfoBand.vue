<script setup>
defineProps({
  profile: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <section class="card info-band">
    <div class="info-band-text">
      <p class="eyebrow">Rõ ràng hơn</p>
      <h2>Thông tin cá nhân được tách riêng, dễ nhìn ngay cả khi không chơi game.</h2>
    </div>

    <div class="info-stats">
      <div>
        <span>Điện thoại</span>
        <strong>{{ profile.phone }}</strong>
      </div>
      <div>
        <span>Trường</span>
        <strong>{{ profile.school }}</strong>
      </div>
      <div>
        <span>Hướng phát triển</span>
        <strong>{{ profile.focus }}</strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.info-band {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 18px;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 226, 141, 0.36), rgba(255, 255, 255, 0.94));
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
  color: #d97706;
}

.info-band h2 {
  margin: 0;
  color: #23160a;
  font-size: 1.5rem;
}

.info-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.info-stats > div {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 178, 37, 0.16);
  background: rgba(255, 249, 236, 0.94);
}

.info-stats span,
.info-stats strong {
  display: block;
}

.info-stats span {
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.74rem;
  color: #d97706;
}

@media (max-width: 1080px) {
  .info-band,
  .info-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .info-band {
    padding: 18px;
  }
}
</style>
