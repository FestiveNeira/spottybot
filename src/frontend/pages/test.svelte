<!------------------------------ TypeScript Starts Here ------------------------------>

<script>
	import { io } from "socket.io-client";
	import { onMount } from "svelte";

	// temporary - todo: make this use a global variable storred in local memory
	let ip = '192.168.1.169';
	let port = '8888';
	
	const socket = io(`http://${ip}:${port}`);
	
	onMount(async () => {
		// Run once when page loads
	})

	import Home from "../components/Home.svelte";
	import History from "../components/History.svelte";
	import Playlist from "../components/Playlist.svelte";
	import Settings from "../components/Settings.svelte";

	let selectedOption = "Home";

	const sidebarOptions = ["Home", "History", "Playlist", "Settings"];

	const components = {
		Home: Home,
		History: History,
		Playlist: Playlist,
		Settings: Settings,
	};

	function changeOption(option) {
		selectedOption = option;
	}


</script>

<!------------------------------ HTML Starts Here ------------------------------>

<div class="container">
	<div class="sidebar left">
		{#each sidebarOptions as option}
			<button on:click={() => changeOption(option)}>{option}</button>
		{/each}
	</div>
	<div class="content">
		<svelte:component this={components[selectedOption]} />
	</div>
	<div class="sidebar right">
		<p>Ratings Sidebar</p>
	</div>
</div>

<!------------------------------ CSS Starts Here ------------------------------>

<style>
</style>
