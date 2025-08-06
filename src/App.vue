<template>
  <div class="h-screen relative bg-slate-200 flex items-center justify-center">
    <button @click="connectToESP32" :disabled="isConnecting"
      class="absolute right-0 top-0 m-4 rounded-lg shadow-lg bg-white p-2 disabled:cursor-not-allowed">
      {{ isConnecting ? 'Connecting...' : 'Connect to ESP32' }}
    </button>
    <section class="p-4 flex flex-col justify-center items-center gap-2 h-100 w-200 overflow-hidden max-y-full">
      <pre class="bg-white p-2 rounded-lg text-sm text-wrap overflow-y-auto">{{ result }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ESPLoader, Transport, type LoaderOptions } from 'esptool-js';

const result = ref('Click "Connect to ESP32" to start connection...');
const isConnecting = ref(false);

let esploader: ESPLoader | null = null;
let device: any = null;
let transport: Transport | null = null;

const espLoaderTerminal = {
  clean() {
    result.value = '';
  },
  writeLine(data: string) {
    result.value += data + '\n';
  },
  write(data: string) {
    result.value += data;
  }
};

interface Partition {
  name: string;
  type: number;
  subtype: number;
  offset: number;
  size: number;
  flags: number;
}

function parsePartitionTable(binaryData: Uint8Array): Partition[] {
  const partitions: Partition[] = [];
  const entrySize = 32;

  for (let i = 0; i < binaryData.length; i += entrySize) {
    if (i + entrySize > binaryData.length) break;

    const entry = binaryData.slice(i, i + entrySize);
    const dataView = new DataView(entry.buffer);

    const magic = dataView.getUint16(0, true);
    if (magic !== 0x50AA) continue;

    const partition: Partition = {
      type: dataView.getUint8(2),
      subtype: dataView.getUint8(3),
      offset: dataView.getUint32(4, true),
      size: dataView.getUint32(8, true),
      name: new TextDecoder().decode(entry.slice(12, 28)).replace(/\0.*$/g, ''),
      flags: dataView.getUint32(28, true)
    };

    if (partition.name || partition.type !== 0) {
      partitions.push(partition);
    }
  }

  return partitions;
}

function getPartitionTypeName(type: number, subtype: number): string {
  const types = {
    0: { name: 'App', subtypes: { 0: 'Factory', 16: 'OTA_0', 17: 'OTA_1', 32: 'Test' } },
    1: { name: 'Data', subtypes: { 1: 'OTA Data', 2: 'PHY', 129: 'NVS', 130: 'NVS Keys', 131: 'EFUSE_EM', 132: 'Undefined', 133: 'ESPHTTPD', 134: 'FAT', 135: 'SPIFFS' } }
  };

  const typeInfo = types[type as keyof typeof types];
  if (!typeInfo) return `Unknown(${type})`;

  const subtypeInfo = typeInfo.subtypes[subtype as keyof typeof typeInfo.subtypes];
  return subtypeInfo ? `${typeInfo.name}/${subtypeInfo}` : `${typeInfo.name}/Unknown(${subtype})`;
}

async function readPartitionTable(esploader: ESPLoader) {
  try {
    const partitionAddress = 0x8000;
    const partitionSize = 0xC00;

    result.value += `Reading ${partitionSize} bytes from address 0x${partitionAddress.toString(16)}...\n`;
    const partitionData = await esploader.readFlash(partitionAddress, partitionSize);

    result.value += 'Parsing partition table...\n';
    const partitions = parsePartitionTable(partitionData);

    if (partitions.length === 0) {
      result.value += 'No valid partitions found.\n';
      return;
    }

    result.value += `\nFound ${partitions.length} partition(s):\n`;
    result.value += '='.repeat(80) + '\n';

    partitions.forEach((partition, index) => {
      result.value += `${index + 1}. ${partition.name || 'Unnamed'}\n`;
      result.value += `   Type: ${getPartitionTypeName(partition.type, partition.subtype)}\n`;
      result.value += `   Offset: 0x${partition.offset.toString(16).padStart(6, '0')} (${partition.offset})\n`;
      result.value += `   Size: 0x${partition.size.toString(16).padStart(6, '0')} (${(partition.size / 1024).toFixed(1)} KB)\n`;
      if (partition.flags) {
        result.value += `   Flags: 0x${partition.flags.toString(16)}\n`;
      }
      result.value += '\n';
    });

    result.value += 'Partition table read successfully!\n';

  } catch (error: any) {
    result.value += `Error reading partition table: ${error.message}\n`;
    console.error('Partition table error:', error);
  }
}

async function connectToESP32() {
  isConnecting.value = true;
  result.value = 'Starting connection process...\n';

  try {
    if (!('serial' in navigator)) {
      throw new Error('WebSerial API not supported in this browser. Use Chrome/Edge.');
    }

    result.value += 'Requesting serial port...\n';
    device = await (navigator as any).serial.requestPort({});

    result.value += 'Creating transport...\n';
    transport = new Transport(device, true);

    const flashOptions: LoaderOptions = {
      transport,
      baudrate: 115200,
      romBaudrate: 115200,
      terminal: espLoaderTerminal,
      debugLogging: false,
    };

    result.value += 'Initializing ESPLoader...\n';
    esploader = new ESPLoader(flashOptions);

    result.value += 'Connecting to ESP32 chip...\n';
    const chip = await esploader.main();

    result.value += `\nSuccessfully connected!\n`;
    result.value += `Chip: ${chip}\n`;

    result.value += '\nReading partition table...\n';
    await readPartitionTable(esploader);

  } catch (error: any) {
    result.value += `\nError: ${error.message}\n`;
    console.error('Connection error:', error);
  } finally {
    isConnecting.value = false;
  }
}
</script>
