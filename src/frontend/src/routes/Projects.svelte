<script>
  import { onMount } from 'svelte';
  import ProjectList from "../components/ProjectList.svelte";
  import SideBar from "../components/SideBar.svelte";

  //   import Home from "./routes/Projects.svelte";
  //   import Users from "./routes/Users.svelte";
  export let url = "";

  let res = {};
  let miniProjects = [];
  let users = [];
  let projects = [];
  
  onMount(async () => {
		let response = await fetch(`http://127.0.0.1:3000/data`);
    let text = await response.text();
    let data = text;
    let obj = JSON.parse(data);
    res = { projects: obj.projects, users: obj.people };
    
    const shuffled_projects = res.projects.sort(() => 0.5 - Math.random());
    let selected_projects  = shuffled_projects.slice(0, 5);
    const shuffled_users = res.users.sort(() => 0.5 - Math.random());
    let selected_users = shuffled_users.slice(0, 5); 

    miniProjects = selected_projects;
    projects = selected_projects;
    users = selected_users;
  });

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
          <a href="" class="disabled button large previous">Previous Page</a>
        </li>
        <li>
          <a href="#" class="button large next">Next Page</a>
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
