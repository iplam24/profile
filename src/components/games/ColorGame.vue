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
      <strong>{{ colorState.target || 'Nhấn Chơi để mở bảng màu' }}</strong>
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
      <strong>{{ colorState.ended ? 'Đã hết lượt game màu' : 'Sẵn sàng mở bảng màu' }}</strong>
      <p>{{ colorState.status }}</p>
    </div>
  </section>
</template>

<style scoped>
.game-board {
  position: relative;
  min-height: 430px;
  border-radius: 26px;
  border: 1px solid rgba(143, 164, 206, 0.26);
  background:
    radial-gradient(circle at 20% 20%, rgba(132, 157, 211, 0.16), transparent 24%),
    radial-gradient(circle at 80% 16%, rgba(214, 226, 250, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(24, 32, 49, 0.96), rgba(15, 21, 33, 0.94));
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
  background: linear-gradient(135deg, rgba(17, 13, 10, 0.5), rgba(17, 13, 10, 0.16));
  pointer-events: none;
}

.game-overlay strong {
  color: #e8efff;
  font-size: 1.45rem;
}

.game-overlay p,
.color-target span {
  color: rgba(203, 218, 245, 0.8);
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
  background: linear-gradient(135deg, #4b5f88, #95abd6 56%, #3a4e78);
  color: #e7efff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(214, 226, 250, 0.54);
}

.color-target {
  margin-top: 48px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(41, 54, 82, 0.74);
  border: 1px solid rgba(143, 164, 206, 0.26);
}

.color-target strong {
  color: #e8efff;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.color-tile {
  min-height: 110px;
  border-radius: 20px;
  border: 1px solid rgba(214, 226, 250, 0.32);
  color: #e9f0ff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 16px 24px rgba(0, 0, 0, 0.34);
}

@media (max-width: 720px) {
  .color-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>


