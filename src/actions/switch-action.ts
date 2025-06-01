/**
 * autoToggleEthernet.ts
 *
 * Usage:
 *   1. Edit the INTERFACE_NAME and WIFI_PROFILE_NAME constants below.
 *   2. Compile with:
 *        tsc autoToggleEthernet.ts
 *   3. Run from an elevated (Admin) PowerShell or CMD:
 *        node autoToggleEthernet.js
 */

import { exec } from 'child_process';
import * as util from 'util';
import * as wifi from 'node-wifi';
import { Network } from 'node-windows';

// Type declarations for modules without TypeScript definitions
declare module 'node-wifi';
declare module 'node-windows';

const execAsync = util.promisify(exec);

// Initialize wifi
wifi.init({
    iface: null // auto-select interface
});

/**
 * Gets the administrative state of a network interface
 */
export async function getInterfaceState(interfaceName: string): Promise<string> {
    try {
        const networkInterface = await Network.getInterface(interfaceName);
        if (!networkInterface) {
            throw new Error(`Interface "${interfaceName}" not found`);
        }
        return networkInterface.enabled ? 'Enabled' : 'Disabled';
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Failed to get interface state: ${error.message}`);
        }
        throw new Error('Failed to get interface state: Unknown error');
    }
}

/**
 * Connects to a specified Wi-Fi network using node-wifi
 */
export async function connectWifi(profileName: string): Promise<void> {
    console.log(`Attempting to connect to Wi-Fi profile "${profileName}"...`);
    try {
        await wifi.connect({ ssid: profileName });
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Failed to connect to Wi-Fi: ${error.message}`);
        }
        throw new Error('Failed to connect to Wi-Fi: Unknown error');
    }
}

/**
 * Checks if Wi-Fi is connected using node-wifi
 */
export async function isWifiConnected(): Promise<boolean> {
    try {
        const currentConnections = await wifi.getCurrentConnections();
        return currentConnections.length > 0;
    } catch (error: unknown) {
        console.error('Error checking Wi-Fi connection:', error instanceof Error ? error.message : 'Unknown error');
        return false;
    }
}

/**
 * Disables a network interface
 */
export async function disableInterface(interfaceName: string): Promise<void> {
    console.log(`Disabling interface "${interfaceName}"...`);
    try {
        const networkInterface = await Network.getInterface(interfaceName);
        if (!networkInterface) {
            throw new Error(`Interface "${interfaceName}" not found`);
        }
        await networkInterface.disable();
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Failed to disable interface: ${error.message}`);
        }
        throw new Error('Failed to disable interface: Unknown error');
    }
}

/**
 * Enables a network interface
 */
export async function enableInterface(interfaceName: string): Promise<void> {
    console.log(`Enabling interface "${interfaceName}"...`);
    try {
        const networkInterface = await Network.getInterface(interfaceName);
        if (!networkInterface) {
            throw new Error(`Interface "${interfaceName}" not found`);
        }
        await networkInterface.enable();
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Failed to enable interface: ${error.message}`);
        }
        throw new Error('Failed to enable interface: Unknown error');
    }
}

/**
 * Simple sleep helper
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}