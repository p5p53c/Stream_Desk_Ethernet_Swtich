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

declare module 'wmi-client' {
    class WmiClient {
        constructor();
        query(query: string, params: any[], callback: (err: any, result: any) => void): void;
    }
    export = WmiClient;
} 