<script>
  import Router from "../Router.svelte";
  //   import Router from "svelte-spa-router";
  // Import the list of routes
  import routes from "./routes";
  import Navigation from "./components/Navigation.svelte";

  //   import { Router, Link, Route } from "svelte-routing";
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
    <Router {routes} />
  </div>
</div>
