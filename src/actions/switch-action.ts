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

const execAsync = util.promisify(exec);

/**
 * Runs a netsh command to get the Administrative state of the given interface.
 * Resolves to either 'Enabled', 'Disabled', or rejects if not found.
 */
export async function getInterfaceState(interfaceName: string): Promise<string> {
  // Example output line: "Administrative state : Enabled"
  const cmd: string = `netsh interface show interface name="${interfaceName}"`;
  const { stdout } = await execAsync(cmd);
  const line: string | undefined = stdout
    .split(/\r?\n/)
    .find((l: string) => /Administrative state/i.test(l));

  if (!line) {
    throw new Error(`Unable to find "Administrative state" for interface "${interfaceName}".`);
  }

  const match: RegExpMatchArray | null = line.match(/Administrative state\s*:\s*(\w+)/i);
  if (!match) {
    throw new Error(`Cannot parse administrative state from line: ${line}`);
  }

  return Promise.resolve(match[1]); // e.g. "Enabled" or "Disabled" 
}

/**
 * Attempts to connect to the specified Wi-Fi profile.
 * Returns a Promise that resolves immediately after issuing the connect command.
 */
export async function connectWifi(profileName: string): Promise<void> {
  console.log(`Attempting to connect to Wi-Fi profile "${profileName}"...`);
  await execAsync(`netsh wlan connect name="${profileName}"`);
}

/**
 * Checks whether the Wi-Fi adapter is currently connected to any SSID.
 * Resolves to true if connected, false otherwise.
 */
export async function isWifiConnected(): Promise<boolean> {
  // "State                   : connected" and "SSID                   : <network-name>"
  const { stdout } = await execAsync(`netsh wlan show interfaces`);
  const stateLine: string | undefined = stdout
    .split(/\r?\n/)
    .find((l: string) => /State\s*:/i.test(l));

  if (!stateLine) {
    return false;
  }

  const match: RegExpMatchArray | null = stateLine.match(/State\s*:\s*(\w+)/i);
  if (!match) {
    return false;
  }

  return match[1].toLowerCase() === 'connected';
}

/**
 * Disables the given interface via netsh.
 */
export async function disableInterface(interfaceName: string): Promise<void> {
  console.log(`Disabling interface "${interfaceName}"...`);
  await execAsync(`netsh interface set interface name="${interfaceName}" admin=disable`);
}

export async function enableInterface(interfaceName:string) {
  console.log(`Disabling interface "${interfaceName}"...`);
  await execAsync(`netsh interface set interface name="${interfaceName}" admin=disable`);
}

/**
 * Simple sleep helper.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}