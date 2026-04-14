<script setup>
defineProps({
  profile: {
    type: Object,
    required: true,
  },
  modeName: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <header class="card topbar">
    <div class="brand-lockup">
      <div class="brand-mark">VXL</div>
      <div>
        <p class="eyebrow">Blue Arcade Profile</p>
        <strong>{{ profile.name }}</strong>
        <small>{{ profile.school }}</small>
      </div>
    </div>

    <div class="topbar-copy">
      <span>Trang hồ sơ + mini game</span>
      <p>Bấm chơi, đổi game, xem thông tin rõ ràng, không phải trang tĩnh khô khan.</p>
    </div>

    <div class="status-pill">
      <span class="status-dot"></span>
      <span>{{ modeName }} đang mở</span>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #23160a;
  background: linear-gradient(135deg, #ffcf5a, #ff8a1f);
  box-shadow: 0 14px 30px rgba(255, 138, 31, 0.28);
}

.brand-lockup strong,
.topbar-copy span,
.status-pill span {
  color: #23160a;
}

.brand-lockup small,
.topbar-copy p {
  color: rgba(35, 22, 10, 0.74);
}

.topbar-copy {
  text-align: center;
  justify-self: center;
}

.topbar-copy span {
  display: block;
  font-weight: 700;
  margin-bottom: 4px;
}

.topbar-copy p {
  margin: 0;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 218, 129, 0.45), rgba(255, 132, 31, 0.18));
  border: 1px solid rgba(255, 176, 57, 0.28);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff8a1f;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 138, 31, 0.44);
  }

  70% {
    box-shadow: 0 0 0 12px rgba(255, 138, 31, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 138, 31, 0);
  }
}

@media (max-width: 1080px) {
  .topbar {
    grid-template-columns: 1fr;
  }

  .topbar-copy {
    justify-self: start;
    text-align: left;
  }
}
</style>