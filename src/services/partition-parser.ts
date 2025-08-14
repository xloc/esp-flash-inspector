import type { Partition, PartitionTypeInfo } from '@/types/partition';
import { PARTITION_TYPES } from '@/types/partition';
import { ESP_CONSTANTS } from '@/config/constants';

export class PartitionParser {
  static parsePartitionTable(binaryData: Uint8Array): Partition[] {
    const partitions: Partition[] = [];
    const { ENTRY_SIZE, MAGIC_BYTES } = ESP_CONSTANTS.PARTITION_TABLE;
    const { MAGIC, TYPE, SUBTYPE, OFFSET, SIZE, NAME_START, NAME_END, FLAGS } = ESP_CONSTANTS.OFFSETS;

    for (let i = 0; i < binaryData.length; i += ENTRY_SIZE) {
      if (i + ENTRY_SIZE > binaryData.length) break;

      const entry = binaryData.slice(i, i + ENTRY_SIZE);
      const dataView = new DataView(entry.buffer);

      const magic = dataView.getUint16(MAGIC, true);
      if (magic !== MAGIC_BYTES) continue;

      const partition: Partition = {
        type: dataView.getUint8(TYPE),
        subtype: dataView.getUint8(SUBTYPE),
        offset: dataView.getUint32(OFFSET, true),
        size: dataView.getUint32(SIZE, true),
        name: new TextDecoder().decode(entry.slice(NAME_START, NAME_END)).replace(/\0.*$/g, ''),
        flags: dataView.getUint32(FLAGS, true)
      };

      if (partition.name || partition.type !== 0) {
        partitions.push(partition);
      }
    }

    return partitions;
  }

  static getPartitionTypeName(type: number, subtype: number): string {
    const typeInfo = PARTITION_TYPES[type];
    if (!typeInfo) return `Unknown(${type})`;

    const subtypeInfo = typeInfo.subtypes[subtype];
    return subtypeInfo ? `${typeInfo.name}/${subtypeInfo}` : `${typeInfo.name}/Unknown(${subtype})`;
  }

  static formatPartitionSize(sizeBytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = sizeBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    // Format with 3 significant digits
    let formatted: string;
    if (size >= 100) {
      formatted = size.toFixed(0);
    } else if (size >= 10) {
      formatted = size.toFixed(1);
    } else {
      formatted = size.toFixed(2);
    }

    return `${formatted} ${units[unitIndex]}`;
  }

  static formatAddress(address: number): string {
    return `0x${address.toString(16).padStart(6, '0')}`;
  }
}