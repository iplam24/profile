<script setup>
import { computed, onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import ProfilePanel from './components/ProfilePanel.vue';
import GameHub from './components/GameHub.vue';
import InfoBand from './components/InfoBand.vue';
import FeatureGrid from './components/FeatureGrid.vue';
import ContactPanel from './components/ContactPanel.vue';
import MusicControl from './components/MusicControl.vue';
import CelebrationLayer from './components/CelebrationLayer.vue';
import { facts, featureCards, profile, skills } from './data/profile';
import { useArcadeGames } from './composables/useArcadeGames';

const arcade = useArcadeGames();
const modeName = computed(() => arcade.modeInfo.value?.name ?? 'Bắt Sao');

onMounted(() => {
  arcade.readStoredScores();
});
</script>

<template>
  <main class="page-shell">
    <CelebrationLayer :bursts="arcade.celebrations" />
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>
    <div class="ambient ambient-three"></div>

    <AppHeader :profile="profile" :mode-name="modeName" />

    <section class="hero-grid">
      <ProfilePanel :profile="profile" :facts="facts" :skills="skills">
        <template #actions>
          <button class="primary-btn" type="button" @click="arcade.activateGame('stars')">Chơi ngay</button>
          <button class="secondary-btn" type="button" @click="arcade.activateGame('colors')">Đổi game khác</button>
        </template>
      </ProfilePanel>

      <GameHub :arcade="arcade" />
    </section>

    <MusicControl />

    <InfoBand :profile="profile" />

    <FeatureGrid :features="featureCards" />

    <ContactPanel :profile="profile" />
  </main>
</template>