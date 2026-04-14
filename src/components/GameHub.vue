<script setup>
import { computed } from 'vue';
import StarGame from './games/StarGame.vue';
import ColorGame from './games/ColorGame.vue';
import ReactionGame from './games/ReactionGame.vue';

const props = defineProps({
  arcade: {
    type: Object,
    required: true,
  },
});

const currentMode = computed(() => props.arcade.modeInfo.value);
const currentTime = computed(() => props.arcade.currentTime.value);
const currentScore = computed(() => props.arcade.currentScore.value);
const currentHighScore = computed(() => props.arcade.currentHighScore.value);
const currentStatus = computed(() => props.arcade.currentStatus.value);
const currentProgress = computed(() => props.arcade.currentProgress.value);
const activeGameId = computed(() => props.arcade.activeGame.value);

const gameComponent = computed(() => {
  if (activeGameId.value === 'colors') return ColorGame;
  if (activeGameId.value === 'reaction') return ReactionGame;
  return StarGame;
});
</script>

<template>
  <article class="card hero-panel">
    <div class="hero-panel-head">
      <div>
        <p class="eyebrow">Game đang mở</p>
        <h2>{{ currentMode?.name }}</h2>
      </div>

      <div class="timer-card">
        <span>Còn lại</span>
        <strong>{{ currentTime }}s</strong>
      </div>
    </div>

    <p class="mode-hint">{{ currentMode?.hint }}</p>

    <div class="scoreboard">
      <div>
        <span>Điểm</span>
        <strong>{{ currentScore }}</strong>
      </div>
      <div>
        <span>Kỷ lục</span>
        <strong>{{ currentHighScore }}</strong>
      </div>
      <div>
        <span>Trạng thái</span>
        <strong>{{ currentStatus }}</strong>
      </div>
    </div>

    <div class="progress-wrap">
      <div class="progress-bar" :style="{ width: `${currentProgress}%` }"></div>
    </div>

    <div class="game-switcher">
      <button
        v-for="game in arcade.games"
        :key="game.id"
        class="switch-chip"
        :class="{ active: activeGameId === game.id }"
        type="button"
        @click="arcade.activateGame(game.id)"
      >
        <strong>{{ game.name }}</strong>
        <span>{{ game.hint }}</span>
      </button>
    </div>

    <component
      :is="gameComponent"
      :star-state="arcade.starState"
      :color-state="arcade.colorState"
      :reaction-state="arcade.reactionState"
      @play-stars="arcade.startStarGame"
      @hit-star="arcade.hitStar"
      @play-colors="arcade.startColorGame"
      @pick-color="arcade.pickColor"
      @play-reaction="arcade.startReactionGame"
      @tap-reaction="arcade.tapReaction"
    />

    <div class="game-footer">
      <p>{{ currentStatus }}</p>
      <button
        class="tertiary-btn"
        type="button"
        @click="activeGameId === 'stars' ? arcade.startStarGame() : activeGameId === 'colors' ? arcade.startColorGame() : arcade.startReactionGame()"
      >
        Chơi lại game này
      </button>
    </div>
  </article>
</template>

<style scoped>
.hero-panel {
  display: grid;
  gap: 16px;
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(255, 220, 120, 0.38), transparent 28%),
    rgba(255, 255, 255, 0.94);
}

.hero-panel-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
  color: #d97706;
}

.hero-panel h2 {
  margin: 0;
  color: #23160a;
  font-size: 1.55rem;
}

.timer-card {
  padding: 12px 14px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 224, 128, 0.42), rgba(255, 138, 31, 0.12));
  text-align: center;
}

.timer-card span,
.scoreboard span,
.mode-hint,
.game-footer p {
  color: rgba(35, 22, 10, 0.72);
}

.timer-card span,
.timer-card strong,
.scoreboard span,
.scoreboard strong {
  display: block;
}

.timer-card strong {
  margin-top: 4px;
  font-size: 1.35rem;
}

.mode-hint {
  margin: 0;
  line-height: 1.7;
}

.scoreboard {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.scoreboard > div {
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(255, 178, 37, 0.16);
  background: rgba(255, 249, 236, 0.94);
}

.scoreboard strong {
  margin-top: 6px;
  color: #23160a;
}

.progress-wrap {
  height: 12px;
  border-radius: 999px;
  background: rgba(23, 48, 85, 0.08);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff7a18, #ffd166, #fff1b7);
  transition: width 0.3s ease;
}

.game-switcher {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.switch-chip {
  padding: 14px;
  text-align: left;
  border-radius: 18px;
  border: 1px solid rgba(255, 178, 37, 0.16);
  background: rgba(255, 249, 236, 0.94);
  color: #23160a;
}

.switch-chip strong,
.switch-chip span {
  display: block;
}

.switch-chip strong {
  margin-bottom: 6px;
}

.switch-chip.active {
  background: linear-gradient(135deg, rgba(255, 202, 84, 0.34), rgba(255, 138, 31, 0.16));
  border-color: rgba(255, 138, 31, 0.28);
}

.game-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.tertiary-btn {
  min-height: 48px;
  padding: 0 18px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 249, 236, 0.96);
  color: #23160a;
  cursor: pointer;
}

@media (max-width: 1080px) {
  .hero-panel-head,
  .game-footer,
  .scoreboard,
  .game-switcher {
    grid-template-columns: 1fr;
  }

  .hero-panel-head,
  .game-footer {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 720px) {
  .hero-panel {
    padding: 18px;
  }

  .scoreboard,
  .game-switcher {
    grid-template-columns: 1fr;
  }
}
</style>
