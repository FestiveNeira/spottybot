<!------------------------------ TypeScript Starts Here ------------------------------>

<script lang="ts">
	import { io } from "socket.io-client";
	import { onMount } from "svelte";

	const { name } = $props<{ name?: string }>();

	// Test Function
	let testname = $state("");
	let responseMessage = $state("");
	async function greet() {
		const response = await fetch("/api/data", {
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
	<h1>Hello {name} test is test!</h1>
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
		color: #750052;
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
