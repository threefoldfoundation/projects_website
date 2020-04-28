<script>
  import Articles from "../components/Articles.svelte";
  import SideBar from "../components/SideBar.svelte";

  //   import Home from "./routes/Projects.svelte";
  //   import Users from "./routes/Users.svelte";
  export let url = "";

  async function getResult() {
    let response = await fetch(`http://127.0.0.1:3000/data`);
    let text = await response.text();
    let data = text;
    let obj = JSON.parse(data);
    return { projects: obj.projects, users: obj.people };
  }

  let res = getResult();
</script>

<main>

  <!-- Wrapper -->
  <div id="wrapper">

    <!-- Main -->
    <div id="main">

      {#if res === undefined}
        <p />
      {:else}
        {#await res}

          <p>Loading...</p>

        {:then items}
          <Articles projects={items.projects} />
        {:catch error}
          {error.message}
        {/await}
      {/if}

      <!-- Pagination -->
      <ul class="actions pagination">
        <li>
          <a href="" class="disabled button large previous">Previous Page</a>
        </li>
        <li>
          <a href="#" class="button large next">Next Page</a>
        </li>
      </ul>

    </div>

    <!--SideBar-->
    <SideBar />
  </div>

  <!-- Scripts -->
  <script src="assets/js/jquery.min.js">

  </script>
  <script src="assets/js/browser.min.js">

  </script>
  <script src="assets/js/breakpoints.min.js">

  </script>
  <script src="assets/js/util.js">

  </script>
  <script src="assets/js/main.js">

  </script>
</main>
