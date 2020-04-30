<script>
  import Router from "../Router.svelte";
  import { users, projects , loading } from "../store.js";
  import routes from "./routes";
  import Navigation from "./components/Navigation.svelte";
  import Spinner from "svelte-spinner";
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="./assets/css/main.css" />
</svelte:head>

<div>
  <div>
    <Navigation />
  </div>
  <div>
  
    {#if $loading}
      <center><Spinner size="300" speed="750" color="#0a73b8" thickness="2" gap="40" /></center>
    {:else}
        <Router {routes} />
    {/if}
  </div>
</div>
