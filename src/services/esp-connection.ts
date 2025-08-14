import { ESPLoader, type LoaderOptions } from 'esptool-js';
import { SerialTransportService } from './serial-transport';
import { ESP_CONSTANTS } from '@/config/constants';

export class ESPConnectionService {
  private esploader: ESPLoader | null = null;
  private serialService: SerialTransportService;

  constructor() {
    this.serialService = new SerialTransportService();
  }

  async connect(): Promise<string> {
    const device = await this.serialService.requestPort();
    const transport = this.serialService.createTransport(device);

    const flashOptions: LoaderOptions = {
      transport,
      baudrate: ESP_CONSTANTS.SERIAL.BAUDRATE,
      romBaudrate: ESP_CONSTANTS.SERIAL.ROM_BAUDRATE,
      debugLogging: false,
    };

    this.esploader = new ESPLoader(flashOptions);
    const chip = await this.esploader.main();
    return chip;
  }

  async readFlash(address: number, size: number): Promise<Uint8Array> {
    if (!this.esploader) {
      throw new Error('ESP32 not connected');
    }
    return await this.esploader.readFlash(address, size);
  }

  isConnected(): boolean {
    return this.esploader !== null && this.serialService.isConnected();
  }

  disconnect(): void {
    this.esploader = null;
    this.serialService.disconnect();
  }

  getLoader(): ESPLoader | null {
    return this.esploader;
  }
}