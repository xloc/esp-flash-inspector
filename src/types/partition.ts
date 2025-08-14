export interface Partition {
  name: string;
  type: number;
  subtype: number;
  offset: number;
  size: number;
  flags: number;
}

export interface PartitionTypeInfo {
  name: string;
  subtypes: Record<number, string>;
}

export const PARTITION_TYPES: Record<number, PartitionTypeInfo> = {
  0: { 
    name: 'App', 
    subtypes: { 
      0: 'Factory', 
      16: 'OTA_0', 
      17: 'OTA_1', 
      32: 'Test' 
    } 
  },
  1: { 
    name: 'Data', 
    subtypes: { 
      1: 'OTA Data', 
      2: 'PHY', 
      129: 'NVS', 
      130: 'NVS Keys', 
      131: 'EFUSE_EM', 
      132: 'Undefined', 
      133: 'ESPHTTPD', 
      134: 'FAT', 
      135: 'SPIFFS' 
    } 
  }
};