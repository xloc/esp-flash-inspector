export const ESP_CONSTANTS = {
  PARTITION_TABLE: {
    ADDRESS: 0x8000,
    SIZE: 0xC00,
    ENTRY_SIZE: 32,
    MAGIC_BYTES: 0x50AA,
  },
  
  SERIAL: {
    BAUDRATE: 115200,
    ROM_BAUDRATE: 115200,
  },
  
  OFFSETS: {
    MAGIC: 0,
    TYPE: 2,
    SUBTYPE: 3,
    OFFSET: 4,
    SIZE: 8,
    NAME_START: 12,
    NAME_END: 28,
    FLAGS: 28,
  }
} as const;