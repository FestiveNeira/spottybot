<script>
    import { io } from "socket.io-client";
    import { serverRunning } from "./stores";

    let ip = '192.168.1.169';
    let port = '3000';

    const socket = io(`http://${ip}:${port}`);

    // Update the store when the server status changes
    socket.on("statusUpdate", (status) => {
        serverRunning.set(status);
    });

    // Toggle server state when the checkbox is clicked
    function toggleServer() {
        fetch(`http://${ip}:${port}/webserver/toggle-server`, { method: "POST" });
    }

    // Scripting goes here

    // Test Function
    var name = "";
    var responseMessage = "";
    async function greet() {
        const response = await fetch(`http://${ip}:${port}/api/data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: name })
        });

        if (!response.ok) {
            throw new Error("Failed to fetch");
        }
        const res = await response.json();
        responseMessage = res.message;
    }
</script>

<!------------------------------ HTML Starts Here ------------------------------>
<h1>Welcome to SvelteKit</h1>
<p>
    Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the
    documentation
</p>

<label for="name">Name: </label>
<input name="name" type="text" bind:value={name} on:change={greet} />
<br />
<if out>
    <p>{responseMessage}</p>
</if>
<br />
<label>
    <input
        type="checkbox"
        bind:checked={$serverRunning}
        on:change={toggleServer}
    />
    Server is {$serverRunning ? "running" : "stopped"}
</label>
