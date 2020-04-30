<script>
  import { users, projects } from "../../store.js";
  import ProjectList from "../components/ProjectList.svelte";
  import SideBar from "../components/SideBar.svelte";

  export let params = {}
  
  
  let miniProjects = [];
  let projectsList = [];
  let filteredProjects = [];
  let page = 0;

  let selected_users = $users.slice(0, 5);
  projectsList =getProjects().slice(0, 3);
  miniProjects = $projects.slice(0, 5);

  function getProjects(){
    console.log(params.tagname)
    if (params.tagname){
      console.log("filtered")
      return filterProjects(params.tagname)
    }
    else{
       console.log("all")
      return $projects;
    }
      
  }

  function onNext() {
    page += 3;
    projectsList = getProjects().slice(page, page + 3);
    updatePage();
  }

  function onPrevious() {
    page -= 3;
    projectsList = getProjects().slice(page, page + 3);
    updatePage();
  }

  function updatePage() {
    let btn_prev = document.getElementById("btn_prev");
    let btn_next = document.getElementById("btn_next");
    if (page > 0) {
      btn_prev.classList.remove("disabled");
    }
    if (page > getProjects().length - 3) {
      btn_next.classList.add("disabled");
    }
    if (page <= 0) {
      btn_prev.classList.add("disabled");
    }
    if (page < getProjects().length - 3) {
      btn_next.classList.remove("disabled");
    }
  }

  function filterProjects(category){
    return $projects.filter(project => project.ecosystem.categories.includes(category))

  }

</script>

<main>

  <!-- Wrapper -->
  <div id="wrapper">

    <!-- Main -->
    <div id="main">
      <ProjectList projects={projectsList} />
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
    <SideBar {miniProjects} users={selected_users} />
  </div>
</main>
