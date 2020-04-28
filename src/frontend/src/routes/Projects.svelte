<script>
  import ProjectList from "../components/ProjectList.svelte";
  import SideBar from "../components/SideBar.svelte";

  //   import Home from "./routes/Projects.svelte";
  //   import Users from "./routes/Users.svelte";
  export let url = "";

  let miniProjects = [1,2,3]
  let users = [1,2,3]
  let projects = [1,2,3]

  async function getResult() {
    let response = await fetch(`http://127.0.0.1:3000/data`);
    let text = await response.text();
    let data = text;
    let obj = JSON.parse(data);
    return { projects: obj.projects, users: obj.people };
  }

  let res = getResult();

  // PorjectList, ProjectSummary
</script>

<main>

  <!-- Wrapper -->
  <div id="wrapper">

    <!-- Main -->
    <div id="main">

      <ProjectList {projects} />
     

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

    <SideBar {miniProjects}{users} />
  </div>
</main>
