<script setup>
defineProps({
  bursts: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="celebration-layer" aria-hidden="true">
    <div
      v-for="burst in bursts"
      :key="burst.id"
      class="firework"
      :style="{ left: `${burst.x}%`, top: `${burst.y}%`, animationDelay: `${burst.delay}s` }"
    >
      <span class="burst-core" :style="{ background: burst.hue }"></span>
      <span
        v-for="particle in burst.particles"
        :key="particle.id"
        class="spark"
        :style="{
            '--dx': particle.offsetX,
            '--dy': particle.offsetY,
          '--size': `${particle.size}px`,
          background: particle.color,
        }"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.celebration-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 40;
}

.firework {
  position: absolute;
  width: 1px;
  height: 1px;
  filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.8));
}

.burst-core {
  position: absolute;
  left: 0;
  top: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow:
    0 0 16px rgba(255, 255, 255, 0.95),
    0 0 30px rgba(255, 162, 40, 0.68),
    0 0 54px rgba(255, 211, 91, 0.42);
  animation: coreFlash 1.15s ease-out forwards;
}

.spark {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.9);
  transform: translate(-50%, -50%);
  animation: burst 1.2s ease-out forwards;
}

@keyframes burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2);
  }

  15% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.15);
  }
}

@keyframes coreFlash {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }

  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.6);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(2.4);
  }
}
</style>