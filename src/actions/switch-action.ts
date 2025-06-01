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
import * as WmiClient from 'wmi-client';

// Type declarations for modules without TypeScript definitions
declare module 'node-wifi';
declare module 'wmi-client';

const execAsync = util.promisify(exec);
const wmi = new WmiClient();

// Initialize wifi
wifi.init({
    iface: null // auto-select interface
});

/**
 * Gets the administrative state of a network interface using WMI
 */
export async function getInterfaceState(interfaceName: string): Promise<string> {
    return new Promise((resolve, reject) => {
        wmi.query('SELECT NetEnabled FROM Win32_NetworkAdapter WHERE NetConnectionID = ?', [interfaceName], (err: any, result: any) => {
            if (err) {
                reject(new Error(`Failed to get interface state: ${err.message}`));
                return;
            }
            if (!result || result.length === 0) {
                reject(new Error(`Interface "${interfaceName}" not found`));
                return;
            }
            resolve(result[0].NetEnabled ? 'Enabled' : 'Disabled');
        });
    });
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
 * Disables a network interface using WMI
 */
export async function disableInterface(interfaceName: string): Promise<void> {
    console.log(`Disabling interface "${interfaceName}"...`);
    return new Promise((resolve, reject) => {
        wmi.query('SELECT * FROM Win32_NetworkAdapter WHERE NetConnectionID = ?', [interfaceName], (err: any, result: any) => {
            if (err) {
                reject(new Error(`Failed to disable interface: ${err.message}`));
                return;
            }
            if (!result || result.length === 0) {
                reject(new Error(`Interface "${interfaceName}" not found`));
                return;
            }
            const adapter = result[0];
            adapter.Disable((err: any) => {
                if (err) {
                    reject(new Error(`Failed to disable interface: ${err.message}`));
                    return;
                }
                resolve();
            });
        });
    });
}

/**
 * Enables a network interface using WMI
 */
export async function enableInterface(interfaceName: string): Promise<void> {
    console.log(`Enabling interface "${interfaceName}"...`);
    return new Promise((resolve, reject) => {
        wmi.query('SELECT * FROM Win32_NetworkAdapter WHERE NetConnectionID = ?', [interfaceName], (err: any, result: any) => {
            if (err) {
                reject(new Error(`Failed to enable interface: ${err.message}`));
                return;
            }
            if (!result || result.length === 0) {
                reject(new Error(`Interface "${interfaceName}" not found`));
                return;
            }
            const adapter = result[0];
            adapter.Enable((err: any) => {
                if (err) {
                    reject(new Error(`Failed to enable interface: ${err.message}`));
                    return;
                }
                resolve();
            });
        });
    });
}

/**
 * Simple sleep helper
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}