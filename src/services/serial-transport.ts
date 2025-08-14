import { Transport } from 'esptool-js';

export class SerialTransportService {
  private device: SerialPort | null = null;
  private transport: Transport | null = null;

  async requestPort(): Promise<SerialPort> {
    if (!('serial' in navigator)) {
      throw new Error('WebSerial API not supported in this browser. Use Chrome/Edge.');
    }

    this.device = await (navigator as any).serial.requestPort({});
    return this.device;
  }

  createTransport(device: SerialPort): Transport {
    this.transport = new Transport(device, true);
    return this.transport;
  }

  isConnected(): boolean {
    return this.device !== null && this.transport !== null;
  }

  disconnect(): void {
    this.device = null;
    this.transport = null;
  }

  getTransport(): Transport | null {
    return this.transport;
  }

  getDevice(): SerialPort | null {
    return this.device;
  }
}