import { ref, computed, type Ref } from 'vue';
import { ESPConnectionService } from '@/services/esp-connection';
import type { ConnectionState } from '@/types/connection';

export function useESPConnection() {
  const connectionState: Ref<ConnectionState> = ref({
    status: 'disconnected'
  });

  const espService = new ESPConnectionService();

  const connect = async (): Promise<void> => {
    connectionState.value = { status: 'connecting' };

    try {
      const chipInfo = await espService.connect();
      connectionState.value = {
        status: 'connected',
        chipInfo
      };
    } catch (error: any) {
      connectionState.value = {
        status: 'error',
        error: error.message
      };
      throw error;
    }
  };

  const disconnect = (): void => {
    espService.disconnect();
    connectionState.value = { status: 'disconnected' };
  };

  const readFlash = async (address: number, size: number): Promise<Uint8Array> => {
    if (!espService.isConnected()) {
      throw new Error('ESP32 not connected');
    }
    return await espService.readFlash(address, size);
  };

  const isConnecting = computed(() => connectionState.value.status === 'connecting');
  const isConnected = computed(() => espService.isConnected());

  return {
    connectionState,
    connect,
    disconnect,
    readFlash,
    isConnected,
    isConnecting
  };
}