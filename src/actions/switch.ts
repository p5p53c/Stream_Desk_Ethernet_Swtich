import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { getInterfaceState, connectWifi, isWifiConnected, disableInterface, sleep, enableInterface } from "./switch-action";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.p5p53c.ethernet-switch.switch" })
export class EthernetSwitch extends SingletonAction<SwitchSettings> {

	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
	 * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
	 * and action information where applicable. In this example, our action will display a counter that increments by one each press. We track the current count on the action's persisted
	 * settings using `setSettings` and `getSettings`.
	 */
	override async onKeyDown(ev: KeyDownEvent<SwitchSettings>): Promise<void> {
		const interfaceName: string = ev.payload.settings.INTERFACE_NAME ?? 'Ethernet';
		const wifiProfileName: string = ev.payload.settings.WIFI_PROFILE_NAME ?? 'DESU!!!';
		const pollIntervalMs: number = ev.payload.settings.POLL_INTERVAL_MS ?? 2000;
		const maxWaitMs: number = ev.payload.settings.MAX_WAIT_MS ?? 30000;
		streamDeck.logger.info(`Interface Name: ${interfaceName}`);
		streamDeck.logger.info(`Wi-Fi Profile Name: ${wifiProfileName}`);
		streamDeck.logger.info(`Poll Interval: ${pollIntervalMs}`);
		streamDeck.logger.info(`Max Wait Time: ${maxWaitMs}`);
		try {
			// 1) Check current administrative state of Ethernet
			streamDeck.logger.info(`Checking administrative state of "${interfaceName}"...`);
			const state: string = await getInterfaceState(interfaceName);
			streamDeck.logger.info(`Current state: ${state}`);

			if (state.toLowerCase() !== 'enabled') {
				streamDeck.logger.info(`"${interfaceName}" is not enabled. Enable now`);
				await enableInterface(interfaceName);
				return;
			}

			// 2) Attempt to connect to the specified Wi-Fi profile
			await connectWifi(wifiProfileName);

			// 3) Poll until Wi-Fi reports "connected", or time out
			const startTime: number = Date.now();
			let connected: boolean = false;

			while (Date.now() - startTime < (maxWaitMs ?? 30000)) {
				await sleep(pollIntervalMs ?? 2000);
				if (await isWifiConnected()) {
					connected = true;
					break;
				}
				process.stdout.write('.'); // progress dot
			}
			streamDeck.logger.info(); // newline after dots

			if (!connected) {
				throw new Error(`Failed to connect to Wi-Fi profile "${wifiProfileName}" within ${maxWaitMs / 1000}s.`);
			}

			streamDeck.logger.info(`Successfully connected to Wi-Fi "${wifiProfileName}".`);

			// // 4) Disable the Ethernet interface now that Wi-Fi is up
			// await disableInterface(interfaceName);
			// streamDeck.logger.info(`"${interfaceName}" has been disabled.`);

		} catch (err: unknown) {
			if (err instanceof Error) {
			streamDeck.logger.error(`Error: ${err.message}`);
			} else {
			streamDeck.logger.error('Unknown error:', err);
			}
			process.exit(1);
		}
	}
}

/**
 * Settings for {@link IncrementCounter}.
 */
type SwitchSettings = {
	INTERFACE_NAME?: string | 'Ethernet';
	WIFI_PROFILE_NAME?: string | 'DESU!!!';
	POLL_INTERVAL_MS?: number | 2000;
	MAX_WAIT_MS?: number | 30000;
};

