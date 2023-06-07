<script lang="ts">
    import { onMount } from 'svelte';

    export let message = ""
    export let login = ""
    let messages:string[] = []

    function add_msg(event : {data:string} ) {
        messages = [...messages]
        messages.push(event.data)
    }

    function send_msg(){
        fetch("./api", {
            method: 'post',
            body: message
        })
        message = ""
    }

    onMount( ()=> {
        const evtSource = new EventSource(`./api#${login}`);
        evtSource.onmessage = add_msg
    })


    function send_login(){
        // const evtSource = new EventSource(`./api#${login}`);
        // evtSource.onmessage = add_msg
    }


    function openmodal(e){
        // e.showModal()
    }

</script>

<dialog on:load={openmodal}>
    <input bind:value={login} placeholder="Chat message">
    <button on:click={send_login}>Send</button>
</dialog>

<div id="chatbox" class="chatbox">
    {#each messages as msg}
        <div class="bubble">
            <p>{msg}</p>
        </div>        
    {/each}
</div>


<div class="inputbox">
    <input bind:value={message} placeholder="Chat message">
    <button on:click={send_msg}>Send</button>
</div>

