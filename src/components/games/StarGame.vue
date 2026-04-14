<script setup>
defineProps({
  starState: {
    type: Object,
    required: true,
  },
});

defineEmits(['play-stars', 'hit-star']);
</script>

<template>
  <section class="game-board star-board">
    <button class="game-cta" type="button" @click="$emit('play-stars')">Chơi Bắt Sao</button>

    <button
      v-for="star in starState.stars"
      :key="star.id"
      type="button"
      class="bubble star-bubble"
      :style="{
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        '--sway': star.sway,
        '--drift': star.drift,
      }"
      @click="$emit('hit-star', star)"
    >
      <span>{{ star.glyph }}</span>
    </button>

    <div v-if="!starState.running" class="game-overlay">
      <strong>{{ starState.ended ? 'Hết giờ bắt sao' : 'Sẵn sàng bắt sao' }}</strong>
      <p>{{ starState.status }}</p>
    </div>
  </section>
</template>

<style scoped>
.game-board {
  position: relative;
  min-height: 430px;
  border-radius: 26px;
  border: 1px solid rgba(255, 178, 37, 0.18);
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 220, 120, 0.24), transparent 24%),
    radial-gradient(circle at 80% 16%, rgba(255, 255, 255, 0.72), transparent 22%),
    linear-gradient(180deg, rgba(255, 250, 238, 0.98), rgba(255, 240, 214, 0.94));
  overflow: hidden;
}

.game-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 10px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.48), rgba(255, 255, 255, 0.14));
  pointer-events: none;
}

.game-overlay strong {
  color: #23160a;
  font-size: 1.45rem;
}

.game-overlay p {
  color: rgba(35, 22, 10, 0.74);
}

.game-cta {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 2;
  border: 0;
  border-radius: 999px;
  min-height: 48px;
  padding: 0 18px;
  background: linear-gradient(135deg, #ff8a1f, #ffd166);
  color: #23160a;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.bubble {
  position: absolute;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: #23160a;
  background: radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.98), rgba(255, 235, 166, 0.45) 42%, rgba(255, 138, 31, 0.86));
  box-shadow: 0 18px 34px rgba(255, 138, 31, 0.24);
  animation: floatBubble 2.8s ease-in-out infinite;
  backdrop-filter: blur(10px);
  cursor: pointer;
}

.bubble span {
  font-size: clamp(1.1rem, 2vw, 1.6rem);
  font-weight: 900;
  transform: rotate(var(--sway));
}

.star-bubble {
  animation: floatBubble 2.6s ease-in-out infinite, fadeIn 0.35s ease both;
}

@keyframes floatBubble {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0) rotate(0deg);
  }

  50% {
    transform: translate(-50%, -50%) translateY(calc(var(--drift) * -1)) rotate(var(--sway));
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.92);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
