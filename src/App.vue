<template>
  <div class="h-screen flex flex-col justify-center items-center gap-2">

    <button class="rounded-lg bg-slate-200 hover:bg-slate-100 p-2">Connect</button>
    <pre class="bg-slate-100 w-100 p-2 rounded-lg">{{ result }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HelloWorld from './components/HelloWorld.vue'

const result = ref('hello');
</script>
