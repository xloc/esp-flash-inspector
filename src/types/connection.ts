export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectionState {
  status: ConnectionStatus;
  chipInfo?: string;
  error?: string;
}

export interface SerialPortInfo {
  port: SerialPort;
  isOpen: boolean;
}