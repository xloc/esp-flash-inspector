import { ref, type Ref } from 'vue';
import type { Partition } from '@/types/partition';
import { PartitionParser } from '@/services/partition-parser';
import { ESP_CONSTANTS } from '@/config/constants';

export function usePartitionTable() {
  const partitions: Ref<Partition[]> = ref([]);
  const isLoading = ref(false);
  const error: Ref<string | null> = ref(null);

  const loadPartitionTable = async (readFlash: (address: number, size: number) => Promise<Uint8Array>): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { ADDRESS, SIZE } = ESP_CONSTANTS.PARTITION_TABLE;
      const partitionData = await readFlash(ADDRESS, SIZE);
      partitions.value = PartitionParser.parsePartitionTable(partitionData);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearPartitions = (): void => {
    partitions.value = [];
    error.value = null;
  };

  const getFormattedPartitions = () => {
    return partitions.value.map((partition, index) => ({
      ...partition,
      index: index + 1,
      typeName: PartitionParser.getPartitionTypeName(partition.type, partition.subtype),
      formattedSize: PartitionParser.formatPartitionSize(partition.size),
      formattedOffset: PartitionParser.formatAddress(partition.offset),
      formattedFlags: partition.flags ? `0x${partition.flags.toString(16)}` : undefined
    }));
  };

  return {
    partitions,
    isLoading,
    error,
    loadPartitionTable,
    clearPartitions,
    getFormattedPartitions
  };
}