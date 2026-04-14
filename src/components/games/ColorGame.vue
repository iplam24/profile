<script setup>
defineProps({
  colorState: {
    type: Object,
    required: true,
  },
});

defineEmits(['play-colors', 'pick-color']);
</script>

<template>
  <section class="game-board color-board">
    <button class="game-cta" type="button" @click="$emit('play-colors')">Chơi Săn Màu</button>

    <div class="color-target">
      <span>Màu cần chọn</span>
      <strong>{{ colorState.target || 'Nhấn chơi để mở bảng màu' }}</strong>
    </div>

    <div class="color-grid">
      <button
        v-for="tile in colorState.board"
        :key="tile.id"
        type="button"
        class="color-tile"
        :style="{ background: tile.color }"
        @click="$emit('pick-color', tile)"
      >
        {{ tile.label }}
      </button>
    </div>

    <div v-if="!colorState.running" class="game-overlay">
      <strong>{{ colorState.ended ? 'Game màu đã kết thúc' : 'Sẵn sàng mở bảng màu' }}</strong>
      <p>{{ colorState.status }}</p>
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
    radial-gradient(circle at 20% 20%, rgba(255, 219, 117, 0.22), transparent 24%),
    radial-gradient(circle at 80% 16%, rgba(255, 255, 255, 0.7), transparent 22%),
    linear-gradient(180deg, rgba(255, 250, 238, 0.98), rgba(255, 240, 214, 0.94));
  overflow: hidden;
  padding: 18px;
  display: grid;
  gap: 14px;
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

.game-overlay p,
.color-target span {
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

.color-target {
  margin-top: 48px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 202, 84, 0.14);
}

.color-target strong {
  color: #23160a;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.color-tile {
  min-height: 110px;
  border-radius: 20px;
  border: 0;
  color: #23160a;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 16px 24px rgba(255, 138, 31, 0.16);
}

@media (max-width: 720px) {
  .color-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
