<!------------------------------ TypeScript Starts Here ------------------------------>

<script lang="ts">
    let themeColor = "#3498db"; // Default color

    function updateTheme(event) {
        themeColor = event.target.value; // todo: Don't actually need to do this, it'll update automatically this will be used to send the data later
    }
</script>

<!------------------------------ HTML Starts Here ------------------------------>

<div class="container" style="--theme-color: {themeColor}">
    <label for="colorPicker">Select a theme color:</label>
    <input
        type="color"
        id="colorPicker"
        bind:value={themeColor}
        on:input={updateTheme}
    />

    <div class="ui-box">
        <h2>Dynamic UI</h2>
        <p>The UI updates based on your selected color!</p>
    </div>
</div>
<button>Save Settings</button>

<!------------------------------ CSS Starts Here ------------------------------>

<style>
</style>
