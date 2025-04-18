<!------------------------------ TypeScript Starts Here ------------------------------>

<script lang="ts">
	import { onMount } from "svelte";
	import { ipcRenderer } from 'electron'; // getting this working was a special kinda hell

	let ip: string = "";
	let port: string = "";

	// Fetch current settings on mount
	onMount(async () => {
		const settings = await ipcRenderer.invoke('get-settings');
		ip = settings.ip || "";
		port = settings.port || "";
	});

	const loadApp = async (): Promise<void> => {
		ipcRenderer.send('load-window');
	};

	// Handle the form submission to save settings
	const saveSettings = async (): Promise<void> => {
		const settings = { ip, port };
		ipcRenderer.send('save-settings', settings);
	};
</script>

<!------------------------------ HTML Starts Here ------------------------------>

<h2>Settings</h2>

<div>
	<label for="ip">IP Address:</label>
	<input type="text" id="ip" bind:value={ip} />
</div>

<div>
	<label for="port">Port:</label>
	<input type="text" id="port" bind:value={port} />
</div>

<!-- In theory if a user clicked this fast enough they would end up on thier previous server rather than a new one, they could just reload to fix the issue though -->
<button on:click={loadApp}>Back</button>

<button on:click={saveSettings}>Save Settings</button>
