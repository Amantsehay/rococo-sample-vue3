<template>
  <q-page class="flex flex-center column">
    <h4>Hi, {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</h4>
    <h5>Show Future is {{ showFuture ? 'ON' : 'OFF' }}</h5>
    <img
      v-if="showFuture"
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    />
  </q-page>
</template>

<script setup>
import { useAuthStore } from 'stores/auth'
import { showFuture } from 'src/showFuture'

const authStore = useAuthStore()
</script>
