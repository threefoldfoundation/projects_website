<script>
  import { onMount } from "svelte";
  import ProjectList from "../components/ProjectList.svelte";
  import SideBar from "../components/SideBar.svelte";

  //   import Home from "./routes/Projects.svelte";
  //   import Users from "./routes/Users.svelte";
  export let url = "";

  let res = { projects: [], users: [] };
  let miniProjects = [];
  let users = [];
  let projects = [];
  let page = 0;

  function onNext() {
    page += 5;
    projects = res.projects.slice(page, page + 5);
    updatePage();
  }

  function onPrevious() {
    page -= 5;
    projects = res.projects.slice(page, page + 5);
    updatePage();
  }

  onMount(async () => {
    let response = await fetch(`${window.location.origin}/data`);
    let text = await response.text();
    let data = text;
    let obj = JSON.parse(data);
    res = { projects: obj.projects, users: obj.people };

    // const shuffled_projects = res.projects.sort(() => 0.5 - Math.random());
    let selected_projects = res.projects;

    // const shuffled_users = res.users.sort(() => 0.5 - Math.random());
    let selected_users = res.users.slice(0, 5);

    miniProjects = selected_projects;
    projects = res.projects.slice(0, 5);
    users = selected_users;
  });

  function updatePage() {
    let btn_prev = document.getElementById("btn_prev");
    let btn_next = document.getElementById("btn_next");
    if (page > 0) {
      btn_prev.classList.remove("disabled");
    }
    if (page > res.projects.length - 5) {
      btn_next.classList.add("disabled");
    }
    if (page <= 0) {
      btn_prev.classList.add("disabled");
    }
    if (page < res.projects.length - 5) {
      btn_next.classList.remove("disabled");
    }
  }
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
          <ProjectList {projects} />
        {:catch error}
          {error.message}
        {/await}
      {/if}

      <!-- Pagination -->
      <ul class="actions pagination">
        <li>
          <button
            id="btn_prev"
            class="disabled button large previous"
            on:click={onPrevious}>
            Previous Page
          </button>
        </li>
        <li>
          <button id="btn_next" class="button large next" on:click={onNext}>
            Next Page
          </button>
        </li>
      </ul>

    </div>
    {#if res === undefined}
      <p />
    {:else}
      {#await res}

        <p>Loading...</p>

      {:then items}
        <SideBar {miniProjects} {users} />
      {:catch error}
        {error.message}
      {/await}
    {/if}

  </div>
</main>
