<!------------------------------ TypeScript Starts Here ------------------------------>

<script lang="ts">
    import User from "./settings/SettingsUser.svelte";
    import Preferences from "./settings/SettingsPreferences.svelte";
    import Server from "./settings/SettingsServer.svelte";

    let selectedOption = "Home";

    const pageOptions = ["User", "Preferences", "Server"];

    let tabs = {
        User: User,
        Preferences: Preferences,
        Server: Server,
    };

    function changeTab(tab) {
        selectedOption = tab;
    }
</script>

<!------------------------------ HTML Starts Here ------------------------------>

<div class="content">
    <div class="tabs">
        {#each Object.keys(tabs) as tab}
            <button
                on:click={() => changeTab(tab)}
                class={selectedOption === tab ? "active" : ""}>{tab}</button
            >
        {/each}
    </div>
    <div class="display">
        <svelte:component this={tabs[selectedOption]} />
    </div>
</div>

<!------------------------------ CSS Starts Here ------------------------------>

<style>
</style>
