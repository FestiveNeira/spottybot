<!------------------------------ TypeScript Starts Here ------------------------------>

<script lang="ts">
    let linkedPlaylistUri = "";
    let linkedPlaylist = {};

    async function getLinkedPlaylist() {
        try {
            const response = await fetch("/api/data", {
                // should automatically access http://{webserver address}/api/data
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uri: linkedPlaylistUri }),
            });
            const data = await response.json();

            linkedPlaylist = data.playlist;
        } catch (error) {
            console.error("Error fetching server state:", error);
        }
    }
</script>

<!------------------------------ HTML Starts Here ------------------------------>

<div class="container">
    <label for="ipbox">Enter Server IP and Port:</label>
    <input
        type="text"
        bind:value={linkedPlaylistUri}
        on:input={getLinkedPlaylist}
    />
</div>
<button>Save Settings</button>

<!------------------------------ CSS Starts Here ------------------------------>

<style>
</style>
