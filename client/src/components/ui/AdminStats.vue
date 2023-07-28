<script setup>
import { Bar } from "vue-chartjs";

const props = defineProps(["stats"]);

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";
import { computed } from "vue";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const chartOptions = {
  responsive: true
};

const gamesByDay = computed(function () {
  return {
    labels: props.stats?.gamesByDay.map((s) => s.date),
    datasets: [
      {
        label: "Parties sur les 30 derniers jours",
        data: props.stats?.gamesByDay.map((s) => s.count),
        backgroundColor: "white"
      }
    ]
  };
});

const registrationsByDay = computed(function () {
  return {
    labels: props.stats?.registrationsByDay.map((s) => s.date),
    datasets: [
      {
        label: "Inscriptions sur les 30 derniers jours",
        data: props.stats?.registrationsByDay.map((s) => s.count),
        backgroundColor: "white"
      }
    ]
  };
});
</script>

<template>
  <div class="grid grid-cols-4 gap-4">
    <div class="px-6 py-6 text-center rounded-xl" style="background-color: #202020">
      <h3 class="text-3xl font-bold text-white">{{ props.stats?.userStats.PLAYER }}</h3>
      <span class="text-xs uppercase font-medium" style="color: #818181">N. de joueurs</span>
    </div>
    <div class="px-6 py-6 text-center rounded-xl" style="background-color: #202020">
      <h3 class="text-3xl font-bold text-white">
        {{ props.stats?.gameStats.PUBLIC + props.stats?.gameStats.PRIVATE }}
      </h3>
      <span class="text-xs uppercase font-medium" style="color: #818181">N. de parties</span>
    </div>
    <div class="px-6 py-6 text-center rounded-xl" style="background-color: #202020">
      <h3 class="text-3xl font-bold text-white">{{ props.stats?.gameStats.WAITING }}</h3>
      <span class="text-xs uppercase font-medium" style="color: #818181">Parties en attente</span>
    </div>
    <div class="px-6 py-6 text-center rounded-xl" style="background-color: #202020">
      <h3 class="text-3xl font-bold text-white">{{ props.stats?.gameStats.PLAYING }}</h3>
      <span class="text-xs uppercase font-medium" style="color: #818181">Parties en cours</span>
    </div>
    <div class="px-6 py-6 text-center rounded-xl" style="background-color: #202020">
      <h3 class="text-3xl font-bold text-white">{{ props.stats?.gameStats.DONE }}</h3>
      <span class="text-xs uppercase font-medium" style="color: #818181">Parties terminées</span>
    </div>
    <div class="px-6 py-6 text-center rounded-xl" style="background-color: #202020">
      <h3 class="text-3xl font-bold text-white">{{ props.stats?.gameStats.CANCELED }}</h3>
      <span class="text-xs uppercase font-medium" style="color: #818181">Parties annulées</span>
    </div>
    <div class="px-6 py-6 text-center rounded-xl" style="background-color: #202020">
      <h3 class="text-3xl font-bold text-white">{{ props.stats?.gameStats.PUBLIC }}</h3>
      <span class="text-xs uppercase font-medium" style="color: #818181">Parties publiques</span>
    </div>
    <div class="px-6 py-6 text-center rounded-xl" style="background-color: #202020">
      <h3 class="text-3xl font-bold text-white">{{ props.stats?.gameStats.PRIVATE }}</h3>
      <span class="text-xs uppercase font-medium" style="color: #818181">Parties privées</span>
    </div>
  </div>

  <div class="mt-8 p-8 rounded-xl" style="background-color: #202020">
    <Bar :options="chartOptions" :data="gamesByDay" />
  </div>

  <div class="mt-8 p-8 rounded-xl" style="background-color: #202020">
    <Bar :options="chartOptions" :data="registrationsByDay" />
  </div>
</template>
