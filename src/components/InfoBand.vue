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
      <p class="eyebrow">Rõ ràng và dễ đọc</p>
      <h2>Thông tin cá nhân được tách riêng nên nhìn phát là hiểu, kể cả khi đang chơi game.</h2>
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
        <span>Hướng học</span>
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
  background: linear-gradient(135deg, rgba(29, 40, 63, 0.9), rgba(18, 25, 38, 0.92));
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
  color: #8fa6d4;
}

.info-band h2 {
  margin: 0;
  color: #e8efff;
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
  border: 1px solid rgba(143, 164, 206, 0.24);
  background: rgba(27, 36, 54, 0.78);
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
  color: #8fa6d4;
}

.info-stats strong {
  color: #d8e4fb;
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


