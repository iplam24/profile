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
      <span>{{ reactionState.ready ? 'BẤM NGAY!' : reactionState.running ? 'Chờ đèn xanh...' : 'Bắt đầu' }}</span>
    </button>

    <div class="reaction-meta">
      <div>
        <span>Lượt</span>
        <strong>{{ reactionState.attempts }}</strong>
      </div>
      <div>
        <span>Best</span>
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
.reaction-meta span {
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

.reaction-button {
  min-height: 220px;
  border-radius: 26px;
  border: 0;
  background: rgba(255, 202, 84, 0.14);
  color: #23160a;
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.reaction-button.ready {
  background: linear-gradient(180deg, #ff8a1f, #ffd166);
  box-shadow: 0 20px 34px rgba(255, 138, 31, 0.32);
}

.reaction-button.waiting {
  background: linear-gradient(180deg, rgba(255, 234, 170, 0.18), rgba(255, 160, 54, 0.18));
}

.reaction-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.reaction-meta > div {
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(255, 178, 37, 0.16);
  background: rgba(255, 249, 236, 0.94);
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
  color: #d97706;
}

@media (max-width: 720px) {
  .reaction-meta {
    grid-template-columns: 1fr;
  }
}
</style>
