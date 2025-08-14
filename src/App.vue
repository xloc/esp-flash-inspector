<template>
  <div class="h-screen relative bg-slate-200 flex items-center justify-center">
    <button @click="handleConnect" :disabled="isConnecting"
      class="absolute right-0 top-0 m-4 rounded-lg shadow-lg bg-white p-2 disabled:cursor-not-allowed">
      {{ buttonText }}
    </button>

    <section class="p-4 flex flex-col justify-center items-center gap-4 overflow-hidden max-y-full">
      <!-- Connection Status -->
      <div v-if="connectionState.status === 'connected'" class="bg-green-100 p-3 rounded-lg text-green-800">
        Connected to {{ connectionState.chipInfo }}
      </div>

      <div v-else-if="connectionState.status === 'error'" class="bg-red-100 p-3 rounded-lg text-red-800">
        Error: {{ connectionState.error }}
      </div>

      <!-- Partition Table Display -->
      <div v-if="formattedPartitions.length > 0" class="flex flex-col">
        <h3 class="text-lg font-semibold mb-3">Partition Table ({{ formattedPartitions.length }} partitions)</h3>
        <div class="w-full flex rounded-lg bg-white divide-x-2 divide-slate-300">
          <div v-for="partition in formattedPartitions" :key="partition.index" class="p-2 text-sm" :class="{}"
            :style="{ flexGrow: `${partition.size}` }">
            {{ partition.typeName }} {{ formatSize(partition.size) }}
          </div>
        </div>
        <div class="flex mt-6 gap-4">
          <div v-for="partition in formattedPartitions" :key="partition.index"
            class="border border-gray-200 p-3 rounded bg-white rounded-lg w-50">
            <div class="flex gap-2 ">
              <span class="text-slate-500">#{{ partition.index }}</span>
              <span class="font-semibold">{{ partition.name || 'Unnamed' }}</span>
            </div>
            <div class=" text-gray-600 mt-2 grid grid-cols-[min-content_auto]">
              <span class="text-slate-400">Type</span>
              <span class="text-800 font-semibold ml-2">{{ partition.typeName }}</span>

              <span class="text-slate-400">Offset</span>
              <span class="text-800 font-semibold ml-2">
                {{ partition.formattedOffset }}</span>

              <span class="text-slate-400">Size</span>
              <span class="text-800 font-semibold ml-2">{{ partition.formattedSize }}</span>

              <template v-if="partition.formattedFlags">
                <span class="text-slate-400">Flags</span>
                <span class="text-800 font-semibold ml-2">{{ partition.formattedFlags }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Initial State -->
      <div v-else-if="connectionState.status === 'disconnected'" class="bg-white p-4 rounded-lg text-center">
        Click "Connect to ESP32" to start
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useESPConnection } from '@/composables/useESPConnection';
import { usePartitionTable } from '@/composables/usePartitionTable';
import { PartitionParser } from '@/services/partition-parser';

const { connectionState, connect, disconnect, readFlash, isConnecting } = useESPConnection();
const { loadPartitionTable, clearPartitions, getFormattedPartitions } = usePartitionTable();

const buttonText = computed(() => {
  if (isConnecting.value) return 'Connecting...';
  if (connectionState.value.status === 'connected') return 'Disconnect';
  return 'Connect to ESP32';
});

const formattedPartitions = computed(() => getFormattedPartitions());

const formatSize = (sizeBytes: number): string => {
  return PartitionParser.formatPartitionSize(sizeBytes);
};

async function handleConnect() {
  if (connectionState.value.status === 'connected') {
    disconnect();
    clearPartitions();
    return;
  }

  try {
    await connect();
    await loadPartitionTable(readFlash);
  } catch (error) {
    console.error('Connection or partition loading failed:', error);
  }
}
</script>
