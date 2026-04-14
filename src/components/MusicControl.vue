<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';

const audio = ref(null);
const isPlaying = ref(false);
const fileName = ref('Chưa chọn file nhạc');
const volume = ref(0.7);

const currentLabel = computed(() => (isPlaying.value ? 'Đang phát' : 'Đã dừng'));

function syncVolume() {
  if (audio.value) {
    audio.value.volume = volume.value;
  }
}

function handleFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const source = URL.createObjectURL(file);
  fileName.value = file.name;

  if (!audio.value) {
    audio.value = new Audio(source);
  } else {
    audio.value.pause();
    audio.value.src = source;
  }

  audio.value.loop = true;
  audio.value.volume = volume.value;

  audio.value.play().then(() => {
    isPlaying.value = true;
  }).catch(() => {
    isPlaying.value = false;
  });
}

function togglePlayback() {
  if (!audio.value) return;

  if (isPlaying.value) {
    audio.value.pause();
    isPlaying.value = false;
    return;
  }

  audio.value.play().then(() => {
    isPlaying.value = true;
  }).catch(() => {
    isPlaying.value = false;
  });
}

function stopPlayback() {
  if (!audio.value) return;
  audio.value.pause();
  audio.value.currentTime = 0;
  isPlaying.value = false;
}

function changeVolume(event) {
  volume.value = Number(event.target.value);
  syncVolume();
}

onBeforeUnmount(() => {
  if (audio.value) {
    audio.value.pause();
    audio.value.src = '';
  }
});
</script>

<template>
  <section class="card music-card">
    <div class="music-head">
      <div>
        <p class="eyebrow">Âm nhạc</p>
        <h3>Ghép nhạc riêng của bạn</h3>
      </div>
      <span class="music-status">{{ currentLabel }}</span>
    </div>

    <p class="music-note">
      Chỉ dùng file MP3/WAV bạn có quyền sử dụng. Nếu muốn nhạc nền, chọn file âm thanh của bạn ở đây.
    </p>

    <div class="music-controls">
      <label class="upload-btn">
        Chọn file nhạc
        <input type="file" accept="audio/*" @change="handleFile" />
      </label>

      <button class="music-btn" type="button" @click="togglePlayback">Phát / Tạm dừng</button>
      <button class="music-btn secondary" type="button" @click="stopPlayback">Dừng</button>
    </div>

    <div class="music-meta">
      <span>{{ fileName }}</span>
      <label>
        <span>Volume</span>
        <input type="range" min="0" max="1" step="0.05" :value="volume" @input="changeVolume" />
      </label>
    </div>
  </section>
</template>

<style scoped>
.music-card {
  padding: 22px;
  display: grid;
  gap: 14px;
}

.music-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
  color: #d97706;
}

.music-head h3 {
  margin: 0;
  color: #23160a;
}

.music-status {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 202, 84, 0.18);
  color: #23160a;
  font-weight: 700;
}

.music-note,
.music-meta span {
  color: rgba(35, 22, 10, 0.74);
}

.music-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.upload-btn,
.music-btn {
  min-height: 46px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 178, 37, 0.16);
  background: rgba(255, 249, 236, 0.96);
  color: #23160a;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.music-btn.secondary {
  background: rgba(255, 202, 84, 0.18);
}

.upload-btn input {
  display: none;
}

.music-meta {
  display: grid;
  gap: 10px;
}

.music-meta span,
.music-meta label {
  display: block;
}

.music-meta input[type='range'] {
  width: 100%;
}

@media (max-width: 720px) {
  .music-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>