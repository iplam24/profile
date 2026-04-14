<script setup>
defineProps({
  reactionState: {
    type: Object,
    required: true,
  },
});

defineEmits(['play-reaction', 'tap-reaction']);
</script>

<template>
  <section class="game-board reaction-board">
    <button class="game-cta" type="button" @click="$emit('play-reaction')">Chơi Phản Xạ</button>

    <button
      class="reaction-button"
      :class="{ ready: reactionState.ready, waiting: reactionState.running && !reactionState.ready }"
      type="button"
      @click="$emit('tap-reaction')"
    >
      <span>{{ reactionState.ready ? 'BẤM NGAY!' : reactionState.running ? 'Đợi tín hiệu xanh...' : 'Bắt đầu' }}</span>
    </button>

    <div class="reaction-meta">
      <div>
        <span>Lượt</span>
        <strong>{{ reactionState.attempts }}</strong>
      </div>
      <div>
        <span>Tốt nhất</span>
        <strong>{{ reactionState.bestMs ? `${reactionState.bestMs}ms` : '---' }}</strong>
      </div>
      <div>
        <span>Nhịp</span>
        <strong>{{ reactionState.ready ? 'Sẵn sàng' : 'Canh thời điểm' }}</strong>
      </div>
    </div>

    <div v-if="!reactionState.running" class="game-overlay">
      <strong>{{ reactionState.ended ? 'Hết giờ phản xạ' : 'Sẵn sàng test tốc độ' }}</strong>
      <p>{{ reactionState.status }}</p>
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
.reaction-meta span {
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

.reaction-button {
  min-height: 220px;
  border-radius: 26px;
  border: 1px solid rgba(143, 164, 206, 0.24);
  background: rgba(41, 54, 82, 0.74);
  color: #d8e4fb;
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.reaction-button.ready {
  background: linear-gradient(180deg, #4b5f88, #95abd6 56%, #3a4e78);
  color: #e7efff;
  box-shadow: 0 20px 34px rgba(0, 0, 0, 0.44), 0 0 26px rgba(163, 184, 227, 0.28);
}

.reaction-button.waiting {
  background: linear-gradient(180deg, rgba(57, 74, 110, 0.84), rgba(34, 46, 69, 0.86));
}

.reaction-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.reaction-meta > div {
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(143, 164, 206, 0.24);
  background: rgba(27, 36, 54, 0.78);
}

.reaction-meta span,
.reaction-meta strong {
  display: block;
}

.reaction-meta span {
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.74rem;
  color: #8fa6d4;
}

.reaction-meta strong {
  color: #d8e4fb;
}

@media (max-width: 720px) {
  .reaction-meta {
    grid-template-columns: 1fr;
  }
}
</style>


