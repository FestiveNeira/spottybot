<!------------------------------ TypeScript Starts Here ------------------------------>

<script lang="ts">
    let serverip = "127.0.0.1"; // Local host
    let serverport = "3000"; // Default port

    function updateIp(event) {
        serverip = event.target.value; // todo: Don't actually need to do this, it'll update automatically this will be used to send the data later
    }
    function updatePort(event) {
        serverport = event.target.value; // todo: Don't actually need to do this, it'll update automatically this will be used to send the data later
    }
</script>

<!------------------------------ HTML Starts Here ------------------------------>

<div class="container">
    <label for="ipbox">Enter Server IP and Port:</label>
    <input type="text" bind:value={serverip} on:input={updateIp} /> :
    <input type="text" bind:value={serverport} on:input={updatePort} />

    <div class="ui-box">
        <h2>Dynamic UI</h2>
        <p>Connected to {serverip}:{serverport}</p>
    </div>
</div>
<button>Save Settings</button>

<!------------------------------ CSS Starts Here ------------------------------>

<style>
</style>
