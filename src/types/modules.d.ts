declare module 'node-wifi' {
    interface WifiInitOptions {
        iface: string | null;
    }

    interface WifiConnectOptions {
        ssid: string;
        password?: string;
    }

    interface WifiConnection {
        ssid: string;
        bssid: string;
        mac: string;
        channel: number;
        frequency: number;
        signal_level: number;
        security: string;
        security_flags: string[];
    }

    export function init(options: WifiInitOptions): void;
    export function connect(options: WifiConnectOptions): Promise<void>;
    export function getCurrentConnections(): Promise<WifiConnection[]>;
}

declare module 'node-windows' {
    interface NetworkInterface {
        name: string;
        enabled: boolean;
        enable(): Promise<void>;
        disable(): Promise<void>;
    }

    export class Network {
        static getInterfaces(): Promise<NetworkInterface[]>;
        static getInterface(name: string): Promise<NetworkInterface | null>;
    }
} 