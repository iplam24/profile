<script setup>
import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, StopCircle, Volume2 } from 'lucide-vue-next';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const audio = ref(null);
const isPlaying = ref(false);
const volume = ref(0.7);
const currentIndex = ref(0);
const autoplayBlocked = ref(false);
const duration = ref(0);
const currentTime = ref(0);
const isShuffle = ref(false);
const repeatMode = ref('off');
const visualizerBars = ref(Array.from({ length: 24 }, () => 0.12));
const visualizerMode = ref('wave');
const isPartyMode = ref(true);
const energyLevel = ref(0);
const beatPulse = ref(0);
const partyHue = ref(188);
const musicCardRef = ref(null);
const showLyricEditor = ref(false);
const lyricDraft = ref('');
const karaokeMap = ref({});
const karaokeLines = ref([]);
const currentLyricIndex = ref(-1);

const WAVE_WIDTH = 1000;
const WAVE_HEIGHT = 180;
const KARAOKE_STORAGE_KEY = 'music-karaoke-lrc-map-v1';

let audioContext = null;
let analyser = null;
let sourceNode = null;
let animationFrameId = null;

const tracks = [
  { name: 'Buông Bỏ Sự Phụ Thuộc', src: '/music/[Vietsub + Pinyin] Buông Bỏ Sự Phụ Thuộc Nơi Anh - Vương Diễm Vi - 离开我的依赖 - 王艳薇 Evangeline.mp3' },
  { name: 'Giày cao gót màu đỏ', src: '/music/Giày cao gót màu đỏ 红色高跟鞋 - Học tiếng Trung qua bài hát - Vietsub - Phiên âm - Từ mới.mp3' },
  { name: 'Jumping Machine', src: '/music/Jumping Machine (跳楼机) (1.1x).mp3' },
  { name: 'Justin Bieber Baby', src: '/music/Justin Bieber - Baby ft. Ludacris.mp3' },
  { name: 'Like Sunny Days', src: '/music/Like Sunny Days, Like Rainy Days 像晴天像雨天 (電視劇難哄The First Frost心動曲) - 汪蘇瀧Silence.W.mp3' },
  { name: 'Tri Ngã Hiểu Ta', src: '/music/[Vietsub + Pinyin] Tri Ngã (Hiểu Ta) - Nga Lâu __ 知我 - 哦漏 (OST Kiếm Lai).mp3' },
  { name: 'Vietsub Đông Miên', src: '/music/[Vietsub] Đông Miên - 2023 - A Nguyệt Nguyệt, Lưu Triệu Vũ - 冬眠 - 2023 - 阿YueYue, 刘兆宇.mp3' },
].sort((a, b) => a.name.localeCompare(b.name, 'vi'));

const hasTracks = computed(() => tracks.length > 0);
const currentTrack = computed(() => tracks[currentIndex.value] ?? null);
const currentLyric = computed(() => karaokeLines.value[currentLyricIndex.value]?.text ?? '');
const nextLyric = computed(() => {
  const nextIndex = currentLyricIndex.value + 1;
  return karaokeLines.value[nextIndex]?.text ?? '';
});
const wavePath = computed(() => {
  const points = visualizerBars.value.map((bar, index) => {
    const x = (index / Math.max(visualizerBars.value.length - 1, 1)) * WAVE_WIDTH;
    const normalized = Math.max(0, (bar - 0.08) / 0.92);
    const y = WAVE_HEIGHT * 0.5 - normalized * WAVE_HEIGHT * 0.36;
    return { x, y };
  });

  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    const cy = (prev.y + curr.y) / 2;
    path += ` Q ${prev.x} ${prev.y}, ${cx} ${cy}`;
  }
  const last = points[points.length - 1];
  path += ` T ${last.x} ${last.y}`;
  return path;
});
const repeatLabel = computed(() => {
  if (repeatMode.value === 'one') return 'Lặp 1 bài';
  if (repeatMode.value === 'all') return 'Lặp playlist';
  return 'Không lặp';
});
const currentLabel = computed(() => {
  if (!hasTracks.value) return 'Chưa có bài nhạc';
  if (autoplayBlocked.value && !isPlaying.value) return 'Trình duyệt đang chặn tự phát';
  return isPlaying.value ? 'Đang phát' : 'Tạm dừng';
});

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const timeLabel = computed(() => `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`);

function syncVolume() {
  if (audio.value) {
    audio.value.volume = volume.value;
  }
}

function handleLoadedMetadata() {
  if (!audio.value) return;
  duration.value = Number.isFinite(audio.value.duration) ? audio.value.duration : 0;
}

function handleTimeUpdate() {
  if (!audio.value) return;
  currentTime.value = audio.value.currentTime;
  syncCurrentLyric();
}

function parseLrc(lrcText) {
  const lines = lrcText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed = [];
  for (const line of lines) {
    const matches = [...line.matchAll(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,2}))?\]/g)];
    if (!matches.length) continue;
    const text = line.replace(/\[[^\]]+\]/g, '').trim();
    for (const match of matches) {
      const min = Number(match[1]);
      const sec = Number(match[2]);
      const cent = Number(match[3] ?? 0);
      const time = min * 60 + sec + cent / 100;
      parsed.push({ time, text: text || '...' });
    }
  }

  return parsed.sort((a, b) => a.time - b.time);
}

function getTrackLyricKey() {
  return currentTrack.value?.src ?? '';
}

function syncCurrentLyric() {
  if (!karaokeLines.value.length) {
    currentLyricIndex.value = -1;
    return;
  }
  let activeIndex = -1;
  for (let i = 0; i < karaokeLines.value.length; i += 1) {
    if (karaokeLines.value[i].time <= currentTime.value) {
      activeIndex = i;
    } else {
      break;
    }
  }
  currentLyricIndex.value = activeIndex;
}

function loadKaraokeForCurrentTrack() {
  const key = getTrackLyricKey();
  const lrcText = key ? (karaokeMap.value[key] ?? '') : '';
  lyricDraft.value = lrcText;
  karaokeLines.value = lrcText ? parseLrc(lrcText) : [];
  syncCurrentLyric();
}

function saveKaraoke() {
  const key = getTrackLyricKey();
  if (!key) return;
  karaokeMap.value[key] = lyricDraft.value;
  window.localStorage.setItem(KARAOKE_STORAGE_KEY, JSON.stringify(karaokeMap.value));
  karaokeLines.value = lyricDraft.value ? parseLrc(lyricDraft.value) : [];
  syncCurrentLyric();
}

function clearKaraoke() {
  const key = getTrackLyricKey();
  if (!key) return;
  delete karaokeMap.value[key];
  lyricDraft.value = '';
  karaokeLines.value = [];
  currentLyricIndex.value = -1;
  window.localStorage.setItem(KARAOKE_STORAGE_KEY, JSON.stringify(karaokeMap.value));
}

function pickRandomIndex() {
  if (tracks.length <= 1) return currentIndex.value;
  let randomIndex = currentIndex.value;
  while (randomIndex === currentIndex.value) {
    randomIndex = Math.floor(Math.random() * tracks.length);
  }
  return randomIndex;
}

function loadTrack(index, shouldAutoPlay = true) {
  if (!hasTracks.value || !audio.value) return;

  const total = tracks.length;
  const normalized = (index + total) % total;
  currentIndex.value = normalized;
  audio.value.src = tracks[normalized].src;
  audio.value.currentTime = 0;
  currentTime.value = 0;
  duration.value = 0;
  loadKaraokeForCurrentTrack();

  if (!shouldAutoPlay) {
    isPlaying.value = false;
    return;
  }

  audio.value.play().then(() => {
    isPlaying.value = true;
    autoplayBlocked.value = false;
  }).catch(() => {
    isPlaying.value = false;
    autoplayBlocked.value = true;
  });
}

function togglePlayback() {
  if (!audio.value || !hasTracks.value) return;

  if (isPlaying.value) {
    audio.value.pause();
    isPlaying.value = false;
    return;
  }

  audio.value.play().then(() => {
    isPlaying.value = true;
    autoplayBlocked.value = false;
  }).catch(() => {
    isPlaying.value = false;
    autoplayBlocked.value = true;
  });
}

function stopPlayback() {
  if (!audio.value) return;
  audio.value.pause();
  audio.value.currentTime = 0;
  currentTime.value = 0;
  isPlaying.value = false;
}

function nextTrack() {
  if (isShuffle.value) {
    loadTrack(pickRandomIndex(), true);
    return;
  }
  loadTrack(currentIndex.value + 1, true);
}

function previousTrack() {
  loadTrack(currentIndex.value - 1, true);
}

function handleTrackEnded() {
  if (!hasTracks.value || !audio.value) return;

  if (repeatMode.value === 'one') {
    audio.value.currentTime = 0;
    audio.value.play().catch(() => {
      isPlaying.value = false;
    });
    return;
  }

  if (isShuffle.value) {
    loadTrack(pickRandomIndex(), true);
    return;
  }

  const isLast = currentIndex.value >= tracks.length - 1;
  if (!isLast) {
    loadTrack(currentIndex.value + 1, true);
    return;
  }

  if (repeatMode.value === 'all') {
    loadTrack(0, true);
    return;
  }

  stopPlayback();
}

function chooseTrack(event) {
  loadTrack(Number(event.target.value), true);
}

function seekTrack(event) {
  if (!audio.value) return;
  const target = Number(event.target.value);
  audio.value.currentTime = target;
  currentTime.value = target;
  syncCurrentLyric();
}

function jumpBy(seconds) {
  if (!audio.value) return;
  const nextTime = Math.min(Math.max(0, audio.value.currentTime + seconds), duration.value || 0);
  audio.value.currentTime = nextTime;
  currentTime.value = nextTime;
  syncCurrentLyric();
}

function toggleShuffle() {
  isShuffle.value = !isShuffle.value;
}

function setVisualizerMode(mode) {
  visualizerMode.value = mode;
}

function togglePartyMode() {
  isPartyMode.value = !isPartyMode.value;
}

function applyPartyEffects() {
  if (!musicCardRef.value || !isPartyMode.value) return;
  const energy = Math.max(0, Math.min(1, energyLevel.value));
  const pulse = Math.max(0, Math.min(1, beatPulse.value));
  partyHue.value = (partyHue.value + 0.35 + energy * 1.9) % 360;
  const card = musicCardRef.value;
  card.style.setProperty('--party-hue', `${partyHue.value.toFixed(1)}`);
  card.style.setProperty('--party-energy', `${(0.22 + energy * 0.78).toFixed(3)}`);
  card.style.setProperty('--party-pulse', `${(0.08 + pulse * 0.92).toFixed(3)}`);
}

function cycleRepeatMode() {
  if (repeatMode.value === 'off') {
    repeatMode.value = 'one';
    return;
  }
  if (repeatMode.value === 'one') {
    repeatMode.value = 'all';
    return;
  }
  repeatMode.value = 'off';
}

function changeVolume(event) {
  volume.value = Number(event.target.value);
  syncVolume();
}

function tryAutoplayAfterInteraction() {
  if (!audio.value || !hasTracks.value || isPlaying.value) return;
  audio.value.play().then(() => {
    isPlaying.value = true;
    autoplayBlocked.value = false;
  }).catch(() => {
    isPlaying.value = false;
  });
}

function animateVisualizer() {
  if (!analyser) {
    animationFrameId = window.requestAnimationFrame(animateVisualizer);
    return;
  }

  const bins = analyser.frequencyBinCount;
  const data = new Uint8Array(bins);
  analyser.getByteFrequencyData(data);

  const chunkSize = Math.floor(bins / visualizerBars.value.length);
  visualizerBars.value = visualizerBars.value.map((_, barIndex) => {
    let sum = 0;
    const start = barIndex * chunkSize;
    const end = Math.min(start + chunkSize, bins);
    for (let i = start; i < end; i += 1) {
      sum += data[i];
    }
    const avg = end > start ? sum / (end - start) : 0;
    const normalized = avg / 255;
    const boosted = normalized * (0.45 + volume.value * 0.85);
    return Math.max(0.08, Math.min(1, boosted));
  });

  let sum = 0;
  let peak = 0;
  for (let i = 0; i < bins; i += 1) {
    sum += data[i];
    if (data[i] > peak) peak = data[i];
  }
  energyLevel.value = sum / bins / 255;
  const peakNorm = peak / 255;
  if (peakNorm > 0.78 && energyLevel.value > 0.2) {
    beatPulse.value = 1;
  } else {
    beatPulse.value *= 0.9;
  }
  applyPartyEffects();

  animationFrameId = window.requestAnimationFrame(animateVisualizer);
}

function setupAudioAnalyser() {
  if (!audio.value || sourceNode) return;

  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioContext = new Ctx();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    sourceNode = audioContext.createMediaElementSource(audio.value);
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);
    animateVisualizer();
  } catch {
    // Skip visualizer gracefully if browser blocks AudioContext.
  }
}

onMounted(() => {
  try {
    const saved = window.localStorage.getItem(KARAOKE_STORAGE_KEY);
    karaokeMap.value = saved ? JSON.parse(saved) : {};
  } catch {
    karaokeMap.value = {};
  }

  audio.value = new Audio();
  audio.value.volume = volume.value;
  audio.value.loop = false;
  audio.value.addEventListener('ended', handleTrackEnded);
  audio.value.addEventListener('loadedmetadata', handleLoadedMetadata);
  audio.value.addEventListener('timeupdate', handleTimeUpdate);

  setupAudioAnalyser();

  if (hasTracks.value) {
    loadTrack(0, true);
  }

  window.addEventListener('pointerdown', tryAutoplayAfterInteraction, { once: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', tryAutoplayAfterInteraction);
  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (audio.value) {
    audio.value.removeEventListener('ended', handleTrackEnded);
    audio.value.removeEventListener('loadedmetadata', handleLoadedMetadata);
    audio.value.removeEventListener('timeupdate', handleTimeUpdate);
    audio.value.pause();
    audio.value.src = '';
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  analyser = null;
  sourceNode = null;
});
</script>

<template>
  <section ref="musicCardRef" class="card music-card" :class="{ 'party-on': isPartyMode }">
    <div class="music-head">
      <div>
        <p class="eyebrow">Âm nhạc</p>
        <h3>Tự phát nhạc từ thư mục + Karaoke local</h3>
      </div>
      <span class="music-status">{{ currentLabel }}</span>
    </div>

    <p class="music-note">
      XUÂN LÂM MP3 - Chúc Bạn nghe nhạc vui vẻ
    </p>

    <div v-if="hasTracks" class="visualizer-toolbar">
      <span>Kiểu visualizer:</span>
      <button class="mode-btn" :class="{ active: visualizerMode === 'bars' }" type="button" @click="setVisualizerMode('bars')">
        Cột
      </button>
      <button class="mode-btn" :class="{ active: visualizerMode === 'wave' }" type="button" @click="setVisualizerMode('wave')">
        Sóng mềm
      </button>
      <button class="mode-btn" :class="{ active: isPartyMode }" type="button" @click="togglePartyMode">
        Party tự động
      </button>
    </div>

    <div class="visualizer" v-if="hasTracks && visualizerMode === 'bars'" aria-hidden="true">
      <span v-for="(bar, idx) in visualizerBars" :key="idx" class="bar" :style="{ transform: `scaleY(${bar})` }"></span>
    </div>

    <div class="visualizer wave-mode" v-if="hasTracks && visualizerMode === 'wave'" aria-hidden="true">
      <svg class="wave-svg" :viewBox="`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#7df9ff" />
            <stop offset="52%" stop-color="#00d4ff" />
            <stop offset="100%" stop-color="#00c9a7" />
          </linearGradient>
        </defs>
        <path class="wave-track" :d="wavePath" />
      </svg>
    </div>

    <div v-if="hasTracks" class="music-controls">
      <button class="music-btn" type="button" @click="previousTrack">
        <SkipBack :size="16" />
        Bài trước
      </button>
      <button class="music-btn" type="button" @click="jumpBy(-10)">Tua -10s</button>
      <button class="music-btn" type="button" @click="togglePlayback">
        <Play v-if="!isPlaying" :size="16" />
        <Pause v-else :size="16" />
        {{ isPlaying ? 'Tạm dừng' : 'Phát' }}
      </button>
      <button class="music-btn" type="button" @click="jumpBy(10)">Tua +10s</button>
      <button class="music-btn" :class="{ active: isShuffle }" type="button" @click="toggleShuffle">
        <Shuffle :size="16" />
        Shuffle
      </button>
      <button class="music-btn" :class="{ active: repeatMode !== 'off' }" type="button" @click="cycleRepeatMode">
        <Repeat1 v-if="repeatMode === 'one'" :size="16" />
        <Repeat v-else :size="16" />
        {{ repeatLabel }}
      </button>
      <button class="music-btn" type="button" @click="nextTrack">
        <SkipForward :size="16" />
        Bài sau
      </button>
      <button class="music-btn secondary" type="button" @click="stopPlayback">
        <StopCircle :size="16" />
        Dừng
      </button>
    </div>

    <div class="seek-wrap" v-if="hasTracks">
      <label>
        <span>Tiến độ: {{ timeLabel }}</span>
        <input type="range" min="0" :max="duration || 0" step="0.1" :value="currentTime" @input="seekTrack" />
      </label>
    </div>

    <div class="music-meta">
      <span>{{ currentTrack?.name ?? 'Thư mục nhạc đang trống' }}</span>
      <label v-if="hasTracks">
        <span>Đổi bài</span>
        <select class="track-select" :value="currentIndex" @change="chooseTrack">
          <option v-for="(track, index) in tracks" :key="track.src" :value="index">{{ track.name }}</option>
        </select>
      </label>
      <label>
        <span><Volume2 :size="15" /> Âm lượng</span>
        <input type="range" min="0" max="1" step="0.05" :value="volume" @input="changeVolume" />
      </label>
    </div>

    <div class="karaoke" v-if="hasTracks">
      <p class="karaoke-title">Karaoke đồng bộ (không cần tải nguồn)</p>
      <p class="karaoke-line" :class="{ active: !!currentLyric }">
        {{ currentLyric || 'Chưa có lyric cho bài này. Dán LRC bên dưới để chạy karaoke.' }}
      </p>
      <p class="karaoke-next" v-if="nextLyric">Tiếp theo: {{ nextLyric }}</p>

      <button class="music-btn" type="button" @click="showLyricEditor = !showLyricEditor">
        {{ showLyricEditor ? 'Ẩn khung lyric' : 'Mở khung dán lyric LRC' }}
      </button>

      <div class="lyric-editor" v-if="showLyricEditor">
        <p class="lyric-tip">Mẫu: [00:12.00] Câu hát đầu tiên</p>
        <textarea v-model="lyricDraft" rows="7" placeholder="[00:10.00] Xin chào&#10;[00:15.30] Đây là lyric đồng bộ"></textarea>
        <div class="lyric-actions">
          <button class="music-btn" type="button" @click="saveKaraoke">Lưu lyric bài này</button>
          <button class="music-btn secondary" type="button" @click="clearKaraoke">Xóa lyric bài này</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.music-card {
  padding: 22px;
  display: grid;
  gap: 14px;
  --party-hue: 188;
  --party-energy: 0.22;
  --party-pulse: 0.08;
}

.music-card.party-on {
  background:
    radial-gradient(circle at 18% 20%, hsla(var(--party-hue), 86%, 63%, calc(0.1 + var(--party-pulse) * 0.22)), transparent 42%),
    radial-gradient(circle at 82% 78%, hsla(calc(var(--party-hue) + 34), 90%, 59%, calc(0.1 + var(--party-energy) * 0.3)), transparent 45%),
    linear-gradient(170deg, rgba(9, 21, 33, 0.92), rgba(7, 18, 28, 0.95));
  box-shadow: 0 12px 38px rgba(0, 0, 0, 0.28), 0 0 calc(12px + var(--party-pulse) * 18px) rgba(0, 212, 255, 0.2);
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
  color: #8fa6d4;
}

.music-head h3 {
  margin: 0;
  color: #e8efff;
}

.music-status {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(36, 44, 66, 0.88);
  color: #d8e4fb;
  border: 1px solid rgba(143, 164, 206, 0.34);
  font-weight: 700;
}

.music-note,
.music-meta span {
  color: rgba(203, 218, 245, 0.82);
}

.music-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.visualizer {
  height: 64px;
  border-radius: 14px;
  padding: 10px;
  border: 1px solid rgba(143, 164, 206, 0.26);
  background: linear-gradient(180deg, rgba(14, 41, 51, 0.84), rgba(10, 28, 41, 0.9));
  display: grid;
  grid-template-columns: repeat(24, minmax(0, 1fr));
  align-items: end;
  gap: 4px;
}

.visualizer-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: #c9d7f0;
}

.mode-btn {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(143, 164, 206, 0.28);
  background: rgba(24, 31, 48, 0.78);
  color: #dbe7ff;
  cursor: pointer;
}

.mode-btn.active {
  border-color: rgba(125, 249, 255, 0.58);
  background: linear-gradient(135deg, rgba(0, 201, 167, 0.22), rgba(0, 212, 255, 0.24));
}

.wave-mode {
  display: block;
  height: 90px;
  padding: 0;
  overflow: hidden;
}

.wave-svg {
  width: 100%;
  height: 100%;
}

.wave-track {
  fill: none;
  stroke: url(#waveGradient);
  stroke-width: 5;
  stroke-linecap: round;
  filter: drop-shadow(0 0 8px rgba(125, 249, 255, 0.4));
}

.bar {
  height: 100%;
  border-radius: 999px;
  transform-origin: bottom center;
  background: linear-gradient(180deg, #7df9ff, #00d4ff 56%, #00c9a7);
  box-shadow: 0 0 10px rgba(125, 249, 255, 0.22);
  transition: transform 0.08s linear;
}

.music-btn {
  min-height: 46px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(143, 164, 206, 0.28);
  background: rgba(24, 31, 48, 0.86);
  color: #dbe7ff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.music-btn.active {
  border-color: rgba(125, 249, 255, 0.58);
  background: linear-gradient(135deg, rgba(0, 201, 167, 0.22), rgba(0, 212, 255, 0.24));
  box-shadow: 0 0 16px rgba(125, 249, 255, 0.24);
}

.music-btn.secondary {
  background: linear-gradient(135deg, rgba(75, 95, 136, 0.9), rgba(58, 78, 120, 0.85));
}

.seek-wrap label {
  display: grid;
  gap: 8px;
  color: #c9d7f0;
}

.seek-wrap input[type='range'] {
  width: 100%;
}

.music-meta {
  display: grid;
  gap: 10px;
}

.music-meta span,
.music-meta label {
  display: block;
  color: #c9d7f0;
}

.music-meta label span {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.music-meta input[type='range'] {
  width: 100%;
}

.track-select {
  width: 100%;
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(143, 164, 206, 0.3);
  background: rgba(22, 30, 46, 0.86);
  color: #dbe7ff;
  padding: 0 10px;
}

.karaoke {
  display: grid;
  gap: 8px;
  border-top: 1px solid rgba(143, 164, 206, 0.24);
  padding-top: 12px;
}

.karaoke-title {
  margin: 0;
  color: #b9d9ff;
  font-weight: 700;
}

.karaoke-line {
  margin: 0;
  min-height: 28px;
  font-size: 1.02rem;
  color: #9db3d8;
  transition: color 0.2s ease, text-shadow 0.2s ease;
}

.karaoke-line.active {
  color: #e7f8ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.42);
}

.karaoke-next {
  margin: 0;
  color: #89a7d6;
  font-size: 0.92rem;
}

.lyric-editor {
  display: grid;
  gap: 8px;
}

.lyric-tip {
  margin: 0;
  color: #8ca0c3;
  font-size: 0.84rem;
}

.lyric-editor textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(143, 164, 206, 0.3);
  background: rgba(22, 30, 46, 0.86);
  color: #dbe7ff;
  padding: 10px;
  resize: vertical;
}

.lyric-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 720px) {
  .music-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
