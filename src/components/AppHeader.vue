<script setup>
import { Facebook, Github } from 'lucide-vue-next';

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
    <div class="topbar-line"></div>

    <div class="brand-lockup">
      <div class="brand-mark">VXL</div>
      <div>
        <p class="eyebrow">Hồ Sơ Arcade Cá Nhân</p>
        <strong>{{ profile.name }}</strong>
        <small>{{ profile.school }}</small>
      </div>
    </div>

    <div class="topbar-copy">
      <span>Hồ sơ cá nhân kết hợp mini game</span>
      <p>Thông tin rõ ràng, chơi vui tay, giao diện chuyển động bắt mắt.</p>
    </div>

    <div class="status-pill">
      <span class="status-dot"></span>
      <span>{{ modeName }} đang mở</span>
    </div>

    <div class="social-mini">
      <a :href="profile.social.facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <Facebook :size="15" />
      </a>
      <a :href="profile.social.github" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <Github :size="15" />
      </a>
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
  border-color: rgba(106, 241, 230, 0.36);
}

.topbar-line {
  position: absolute;
  left: -18%;
  top: 0;
  width: 44%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #7df9ff, transparent);
  animation: scanHeader 4s linear infinite;
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
  color: #e7efff;
  background: linear-gradient(135deg, #00c9a7, #00a8d8 56%, #7df9ff);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.44), inset 0 1px 0 rgba(208, 255, 250, 0.5);
}

.brand-lockup strong,
.topbar-copy span,
.status-pill span {
  color: #e8efff;
}

.brand-lockup small,
.topbar-copy p {
  color: rgba(197, 212, 240, 0.8);
}

.topbar-copy {
  text-align: center;
  justify-self: center;
}

.topbar-copy span {
  display: block;
  font-weight: 800;
  letter-spacing: 0.02em;
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
  background: linear-gradient(135deg, rgba(14, 71, 84, 0.86), rgba(11, 45, 62, 0.9));
  border: 1px solid rgba(106, 241, 230, 0.38);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #7df9ff;
  animation: pulse 2s infinite;
}

.social-mini {
  position: absolute;
  right: 18px;
  bottom: 10px;
  display: inline-flex;
  gap: 8px;
}

.social-mini a {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #cffff8;
  border: 1px solid rgba(106, 241, 230, 0.34);
  background: rgba(8, 44, 54, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.social-mini a:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 14px rgba(125, 249, 255, 0.34);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(125, 249, 255, 0.48);
  }

  70% {
    box-shadow: 0 0 0 12px rgba(125, 249, 255, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(125, 249, 255, 0);
  }
}

@keyframes scanHeader {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(320%);
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

