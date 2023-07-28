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
        label: "Mes parties sur les 30 derniers jours",
        data: props.stats?.gamesByDay.map((s) => s.count),
        backgroundColor: "white"
      }
    ]
  };
});
</script>

<template>
  <div class="grid grid-cols-4 gap-4">
    <div class="px-6 py-6 text-center rounded-xl" style="background-color: #202020">
      <h3 class="text-3xl font-bold text-white">
        {{
          props.stats?.gameStats.PRIVATE + props.stats?.gameStats.PUBLIC === 0
            ? 0
            : (props.stats?.gameStats.WIN /
                (props.stats?.gameStats.PRIVATE + props.stats?.gameStats.PUBLIC)) *
              100
        }}
        %
      </h3>
      <span class="text-xs uppercase font-medium" style="color: #818181">Taux de victoire</span>
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
      <h3 class="text-3xl font-bold text-white">{{ props.stats?.gameStats.WIN }}</h3>
      <span class="text-xs uppercase font-medium" style="color: #818181">Victoires</span>
    </div>
    <div class="px-6 py-6 text-center rounded-xl" style="background-color: #202020">
      <h3 class="text-3xl font-bold text-white">{{ props.stats?.gameStats.LOSE }}</h3>
      <span class="text-xs uppercase font-medium" style="color: #818181">Défaites</span>
    </div>
    <div class="px-6 py-6 text-center rounded-xl" style="background-color: #202020">
      <h3 class="text-3xl font-bold text-white">{{ props.stats?.gameStats.DRAW }}</h3>
      <span class="text-xs uppercase font-medium" style="color: #818181">Matchs nuls</span>
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
</template>
