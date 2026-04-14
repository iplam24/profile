import { computed, reactive, ref } from 'vue';

const fireworksPalette = ['#7ea6ff', '#8fe3ff', '#d5e1ff', '#9ab7ff', '#75d1ff', '#ffffff'];
const royalPalette = ['#31415f', '#4a5f88', '#6b82b2', '#93abd6', '#b8c7e6', '#dbe5f7'];
const colorNames = ['Xanh đêm', 'Xanh thép', 'Xanh đá', 'Xanh dịu', 'Xanh bạc', 'Xanh băng'];
const starSymbols = ['*', '+', 'x', 'o', '@'];

const storageKeys = {
  starHigh: 'vxl-star-high-score',
  colorHigh: 'vxl-color-high-score',
  reactionHigh: 'vxl-reaction-high-score',
  reactionBest: 'vxl-reaction-best-ms',
};

export function useArcadeGames() {
  const activeGame = ref('stars');
  const celebrations = ref([]);

  const starState = reactive({
    score: 0,
    highScore: 0,
    combo: 0,
    timeLeft: 25,
    running: false,
    ended: false,
    status: 'Nhấn chơi để bắt đầu.',
    stars: [],
  });

  const colorState = reactive({
    score: 0,
    highScore: 0,
    lives: 3,
    round: 0,
    timeLeft: 20,
    running: false,
    ended: false,
    status: 'Chọn đúng ô màu được yêu cầu.',
    target: '',
    board: [],
  });

  const reactionState = reactive({
    score: 0,
    highScore: 0,
    timeLeft: 20,
    running: false,
    ended: false,
    status: 'Nhấn chơi và chờ tín hiệu xanh.',
    ready: false,
    waitStart: 0,
    bestMs: null,
    attempts: 0,
  });

  const games = [
    { id: 'stars', name: 'Bắt Sao', hint: 'Bấm sao đang di chuyển để cộng điểm nhanh.' },
    { id: 'colors', name: 'Săn Màu', hint: 'Chọn đúng ô màu mà game yêu cầu.' },
    { id: 'reaction', name: 'Phản Xạ', hint: 'Bấm thật nhanh khi tín hiệu bật sẵn sàng.' },
  ];

  const modeInfo = computed(() => games.find((game) => game.id === activeGame.value));
  const currentHighScore = computed(() => {
    if (activeGame.value === 'colors') return colorState.highScore;
    if (activeGame.value === 'reaction') return reactionState.highScore;
    return starState.highScore;
  });

  const currentScore = computed(() => {
    if (activeGame.value === 'colors') return colorState.score;
    if (activeGame.value === 'reaction') return reactionState.score;
    return starState.score;
  });

  const currentTime = computed(() => {
    if (activeGame.value === 'colors') return colorState.timeLeft;
    if (activeGame.value === 'reaction') return reactionState.timeLeft;
    return starState.timeLeft;
  });

  const currentStatus = computed(() => {
    if (activeGame.value === 'colors') return colorState.status;
    if (activeGame.value === 'reaction') return reactionState.status;
    return starState.status;
  });

  const currentProgress = computed(() => {
    const total = activeGame.value === 'colors' || activeGame.value === 'reaction' ? 20 : 25;
    return Math.max(0, (currentTime.value / total) * 100);
  });

  const starStreakLabel = computed(() => {
    if (starState.combo >= 8) return 'Bùng nổ';
    if (starState.combo >= 4) return 'Rất tốt';
    if (starState.combo >= 1) return 'Đang có chuỗi';
    return 'Khởi động';
  });

  const reactionLabel = computed(() => {
    if (!reactionState.bestMs) return 'Chưa có kỷ lục';
    if (reactionState.bestMs < 220) return 'Siêu nhanh';
    if (reactionState.bestMs < 320) return 'Rất nhanh';
    if (reactionState.bestMs < 450) return 'Ổn áp';
    return 'Cần luyện thêm';
  });

  let starSpawnTimer = null;
  let starCountdownTimer = null;
  let colorCountdownTimer = null;
  let reactionCountdownTimer = null;
  let reactionTimeoutTimer = null;
  let starSeed = 0;
  let colorSeed = 0;
  let celebrationSeed = 0;

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function triggerFireworks(count = 2) {
    const bursts = Array.from({ length: count }, () => ({
      id: ++celebrationSeed,
      x: randomBetween(14, 86),
      y: randomBetween(12, 72),
      hue: fireworksPalette[Math.floor(Math.random() * fireworksPalette.length)],
      delay: randomBetween(0, 0.25),
      particles: Array.from({ length: 20 }, (_, index) => {
        const angle = randomBetween(0, 360);
        const distance = randomBetween(72, 160);
        return {
          id: `${celebrationSeed}-${index}`,
          offsetX: `${Math.cos((Math.PI / 180) * angle) * distance}px`,
          offsetY: `${Math.sin((Math.PI / 180) * angle) * distance}px`,
          size: randomBetween(6, 12),
          color: fireworksPalette[(index + celebrationSeed) % fireworksPalette.length],
        };
      }),
    }));

    celebrations.value = [...celebrations.value, ...bursts];

    window.setTimeout(() => {
      celebrations.value = celebrations.value.filter((burst) => !bursts.some((item) => item.id === burst.id));
    }, 1800);
  }

  function clearTimer(timerRef) {
    if (timerRef) {
      window.clearTimeout(timerRef);
      window.clearInterval(timerRef);
    }
  }

  function clearAllTimers() {
    clearTimer(starSpawnTimer);
    clearTimer(starCountdownTimer);
    clearTimer(colorCountdownTimer);
    clearTimer(reactionCountdownTimer);
    clearTimer(reactionTimeoutTimer);
    starSpawnTimer = null;
    starCountdownTimer = null;
    colorCountdownTimer = null;
    reactionCountdownTimer = null;
    reactionTimeoutTimer = null;
  }

  function readStoredScores() {
    const starScore = Number(window.localStorage.getItem(storageKeys.starHigh));
    const colorScore = Number(window.localStorage.getItem(storageKeys.colorHigh));
    const reactionScore = Number(window.localStorage.getItem(storageKeys.reactionHigh));
    const bestMs = Number(window.localStorage.getItem(storageKeys.reactionBest));

    starState.highScore = Number.isFinite(starScore) && starScore > 0 ? starScore : 0;
    colorState.highScore = Number.isFinite(colorScore) && colorScore > 0 ? colorScore : 0;
    reactionState.highScore = Number.isFinite(reactionScore) && reactionScore > 0 ? reactionScore : 0;
    reactionState.bestMs = Number.isFinite(bestMs) && bestMs > 0 ? bestMs : null;
  }

  function saveStarHighScore() {
    if (starState.score > starState.highScore) {
      starState.highScore = starState.score;
      window.localStorage.setItem(storageKeys.starHigh, String(starState.score));
    }
  }

  function saveColorHighScore() {
    if (colorState.score > colorState.highScore) {
      colorState.highScore = colorState.score;
      window.localStorage.setItem(storageKeys.colorHigh, String(colorState.score));
    }
  }

  function saveReactionHighScore(reactionMs) {
    reactionState.score += 1;
    reactionState.highScore = Math.max(reactionState.highScore, reactionState.score);
    window.localStorage.setItem(storageKeys.reactionHigh, String(reactionState.highScore));

    if (!reactionState.bestMs || reactionMs < reactionState.bestMs) {
      reactionState.bestMs = reactionMs;
      window.localStorage.setItem(storageKeys.reactionBest, String(reactionMs));
    }
  }

  function resetStarGame() {
    clearTimer(starSpawnTimer);
    clearTimer(starCountdownTimer);
    starSpawnTimer = null;
    starCountdownTimer = null;
    starState.score = 0;
    starState.combo = 0;
    starState.timeLeft = 25;
    starState.running = false;
    starState.ended = false;
    starState.status = 'Nhấn Chơi để bắt đầu.';
    starState.stars = [];
  }

  function spawnStar() {
    const id = ++starSeed;
    const size = randomBetween(52, 92);

    starState.stars = [
      ...starState.stars,
      {
        id,
        x: randomBetween(8, 88),
        y: randomBetween(14, 76),
        size,
        glyph: starSymbols[Math.floor(Math.random() * starSymbols.length)],
        reward: Math.random() < 0.18 ? 3 : 1,
        sway: `${randomBetween(-12, 12).toFixed(1)}deg`,
        drift: `${randomBetween(-18, 18).toFixed(1)}px`,
      },
    ];

    window.setTimeout(() => {
      const exists = starState.stars.some((item) => item.id === id);
      if (!exists || !starState.running) return;
      starState.stars = starState.stars.filter((item) => item.id !== id);
      starState.combo = 0;
      starState.status = 'Trượt rồi, sao đã bay mất.';
    }, randomBetween(1300, 2000));
  }

  function startStarGame() {
    resetStarGame();
    starState.running = true;
    starState.status = 'Bắt sao càng nhanh càng tốt.';
    triggerFireworks(2);

    spawnStar();
    spawnStar();

    starSpawnTimer = window.setInterval(() => {
      if (!starState.running) return;
      spawnStar();
      if (Math.random() > 0.6) spawnStar();
    }, 760);

    starCountdownTimer = window.setInterval(() => {
      if (!starState.running) return;
      starState.timeLeft -= 1;
      if (starState.timeLeft <= 0) {
        starState.timeLeft = 0;
        endStarGame();
      }
    }, 1000);
  }

  function hitStar(star) {
    if (!starState.running) return;

    starState.stars = starState.stars.filter((item) => item.id !== star.id);
    const bonus = Math.min(starState.combo, 4);
    starState.score += star.reward + bonus;
    starState.combo += 1;
    starState.status = star.reward > 1 ? `Sao đặc biệt +${star.reward + bonus}` : `Đẹp đó +${star.reward + bonus}`;
    saveStarHighScore();
    triggerFireworks(star.reward > 1 ? 3 : 2);
  }

  function endStarGame() {
    starState.running = false;
    starState.ended = true;
    clearTimer(starSpawnTimer);
    clearTimer(starCountdownTimer);
    starSpawnTimer = null;
    starCountdownTimer = null;
    starState.stars = [];
    starState.combo = 0;
    starState.status = 'Hết giờ. Chơi lại để phá kỷ lục mới.';
    saveStarHighScore();
    triggerFireworks(4);
  }

  function buildColorBoard() {
    const targetIndex = Math.floor(Math.random() * royalPalette.length);
    colorState.target = colorNames[targetIndex];
    colorState.board = royalPalette
      .map((color, index) => ({
        id: `${++colorSeed}-${index}`,
        color,
        label: colorNames[index],
        isTarget: index === targetIndex,
      }))
      .sort(() => Math.random() - 0.5);
  }

  function resetColorGame() {
    clearTimer(colorCountdownTimer);
    colorCountdownTimer = null;
    colorState.score = 0;
    colorState.lives = 3;
    colorState.round = 0;
    colorState.timeLeft = 20;
    colorState.running = false;
    colorState.ended = false;
    colorState.status = 'Nhấn Chơi để mở bảng màu.';
    colorState.target = '';
    colorState.board = [];
  }

  function startColorGame() {
    resetColorGame();
    colorState.running = true;
    colorState.status = 'Chọn đúng ô màu được yêu cầu.';
    buildColorBoard();
    triggerFireworks(2);

    colorCountdownTimer = window.setInterval(() => {
      if (!colorState.running) return;
      colorState.timeLeft -= 1;
      if (colorState.timeLeft <= 0) {
        colorState.timeLeft = 0;
        endColorGame();
      }
    }, 1000);
  }

  function pickColor(tile) {
    if (!colorState.running) return;

    colorState.round += 1;
    if (tile.isTarget) {
      colorState.score += 2;
      colorState.status = `Chính xác +2 (${tile.label})`;
      triggerFireworks(2);
    } else {
      colorState.lives -= 1;
      colorState.status = `Sai rồi. Còn ${colorState.lives} mạng.`;
    }

    if (colorState.lives <= 0) {
      endColorGame();
      return;
    }

    saveColorHighScore();
    buildColorBoard();
  }

  function endColorGame() {
    colorState.running = false;
    colorState.ended = true;
    clearTimer(colorCountdownTimer);
    colorCountdownTimer = null;
    colorState.status = 'Hết lượt game màu. Chơi lại để tăng điểm.';
    saveColorHighScore();
    triggerFireworks(3);
  }

  function resetReactionGame() {
    clearTimer(reactionCountdownTimer);
    clearTimer(reactionTimeoutTimer);
    reactionCountdownTimer = null;
    reactionTimeoutTimer = null;
    reactionState.score = 0;
    reactionState.timeLeft = 20;
    reactionState.running = false;
    reactionState.ended = false;
    reactionState.status = 'Nhấn Chơi và chờ tín hiệu.';
    reactionState.ready = false;
    reactionState.waitStart = 0;
    reactionState.attempts = 0;
  }

  function scheduleReactionSignal() {
    clearTimer(reactionTimeoutTimer);
    reactionTimeoutTimer = window.setTimeout(() => {
      if (!reactionState.running) return;
      reactionState.ready = true;
      reactionState.waitStart = performance.now();
      reactionState.status = 'Bây giờ! Bấm thật nhanh!';
    }, randomBetween(900, 2400));
  }

  function startReactionGame() {
    resetReactionGame();
    reactionState.running = true;
    reactionState.status = 'Đợi tín hiệu xanh rồi bấm ngay.';
    triggerFireworks(2);

    reactionCountdownTimer = window.setInterval(() => {
      if (!reactionState.running) return;
      reactionState.timeLeft -= 1;
      if (reactionState.timeLeft <= 0) {
        reactionState.timeLeft = 0;
        endReactionGame();
      }
    }, 1000);

    scheduleReactionSignal();
  }

  function tapReaction() {
    if (!reactionState.running) return;

    if (!reactionState.ready) {
      reactionState.status = 'Bấm sớm quá. Chờ tín hiệu đã.';
      reactionState.score = Math.max(0, reactionState.score - 1);
      scheduleReactionSignal();
      return;
    }

    const reactionMs = Math.max(1, Math.round(performance.now() - reactionState.waitStart));
    reactionState.attempts += 1;
    reactionState.ready = false;
    reactionState.status = `Phản xạ ${reactionMs}ms. Rất tốt!`;
    saveReactionHighScore(reactionMs);
    triggerFireworks(reactionMs < 280 ? 3 : 2);
    scheduleReactionSignal();
  }

  function endReactionGame() {
    reactionState.running = false;
    reactionState.ended = true;
    reactionState.ready = false;
    clearTimer(reactionCountdownTimer);
    clearTimer(reactionTimeoutTimer);
    reactionCountdownTimer = null;
    reactionTimeoutTimer = null;
    reactionState.status = 'Hết giờ phản xạ. Chơi lại để cải thiện tốc độ.';
    window.localStorage.setItem(storageKeys.reactionHigh, String(reactionState.highScore));
    triggerFireworks(3);
  }

  function activateGame(gameId) {
    if (!games.some((game) => game.id === gameId)) return;
    clearAllTimers();

    if (gameId === 'stars') resetStarGame();
    if (gameId === 'colors') resetColorGame();
    if (gameId === 'reaction') resetReactionGame();

    activeGame.value = gameId;
  }

  return {
    games,
    activeGame,
    modeInfo,
    currentScore,
    currentHighScore,
    currentTime,
    currentStatus,
    currentProgress,
    starState,
    colorState,
    reactionState,
    starStreakLabel,
    reactionLabel,
    celebrations,
    triggerFireworks,
    activateGame,
    startStarGame,
    hitStar,
    startColorGame,
    pickColor,
    startReactionGame,
    tapReaction,
    readStoredScores,
  };
}
