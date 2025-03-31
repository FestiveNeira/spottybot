<!------------------------------ TypeScript Starts Here ------------------------------>

<script lang="ts">
	import { io } from "socket.io-client";
	import { onMount } from "svelte";
	let ip = "192.168.1.169";
	let port = "8888";

	const { name } = $props<{ name?: string }>();

	const socket = io(`http://${ip}:${port}`);

	let serverRunning = $state(false);

	// Upon mounting get the serverRunning state
	onMount(async () => {
		try {
			let response = await fetch(
				`http://${ip}:${port}/webserver/get-state`,
				{
					method: "GET",
				},
			);
			const data = await response.json();

			serverRunning = data.serverRunning;
		} catch (error) {
			console.error("Error fetching server state:", error);
		}
	});

	// Update the store when the server status changes (webhooks example!)
	socket.on("statusUpdate", (status) => {
		serverRunning = status;
	});

	// Toggle server state when the checkbox is clicked
	function toggleServer() {
		fetch(`http://${ip}:${port}/webserver/toggle-server`, {
			method: "POST",
		});
	}

	// Test Function
	let testname = $state("");
	let responseMessage = $state("");
	async function greet() {
		const response = await fetch(`http://${ip}:${port}/api/data`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name: testname }),
		});

		if (!response.ok) {
			throw new Error("Failed to fetch");
		}
		const res = await response.json();
		responseMessage = res.message;
	}
</script>

<!------------------------------ HTML Starts Here ------------------------------>

<main>
	<h1>Hello {name}!</h1>
	<p>
		Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn
		how to build Svelte apps.
	</p>

	<label for="testname">Name: </label>
	<input name="testname" type="text" bind:value={testname} onchange={greet} />
	<br />
	<if out>
		<p>{responseMessage}</p>
	</if>
	<br />
	<label>
		<input
			type="checkbox"
			bind:checked={serverRunning}
			onchange={toggleServer}
		/>
		Server is {serverRunning ? "running" : "stopped"}
	</label>
</main>

<!------------------------------ CSS Starts Here ------------------------------>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
