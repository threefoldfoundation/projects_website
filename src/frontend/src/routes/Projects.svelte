<script>
  import { users, projects } from "../../store.js";
  import ProjectList from "../components/ProjectList.svelte";
  import SideBar from "../components/SideBar.svelte";
  import * as animateScroll from "svelte-scrollto";
  import { getRandomSlice } from "../utils.js";

  animateScroll.scrollToTop();

  export let params = {};

  let miniProjects = [];
  let projectsList = [];
  let filteredProjects = [];
  let page = 0,
    addWith = 3,
    lastpage = false;

  let selected_users = getRandomSlice($users, 5);
  projectsList = getProjects().slice(0, 3);
  miniProjects = getRandomSlice($projects, 5);

  $: if (params.tagname) {
    //watch the params.id for changes
    projectsList = getProjects().slice(0, 3);
  }

  function filterProjects(category) {
    return $projects.filter(project =>
      project.ecosystem.categories.includes(category)
    );
  }

  function getProjects() {
    if (params.tagname) {
      return filterProjects(params.tagname);
    } else {
      return $projects;
    }
  }

  function onNext() {
    page += 3;
    updatePage();
    if (lastpage) projectsList = getProjects().slice(page);
    else projectsList = getProjects().slice(page, page + addWith);
    animateScroll.scrollToTop();
  }

  function onPrevious() {
    page -= 3;
    updatePage();
    projectsList = getProjects().slice(page, page + addWith);
    animateScroll.scrollToTop();
  }

  function updatePage() {
    let btn_prev = document.getElementById("btn_prev");
    let btn_next = document.getElementById("btn_next");
    let len = getProjects().length;
    if (page > 0) {
      btn_prev.classList.remove("disabled");
    }
    if (page >= len - 3) {
      lastpage = true;
      btn_next.classList.add("disabled");
    }
    if (page < 3) {
      btn_prev.classList.add("disabled");
    }
    if (page < len - 3) {
      lastpage = false;
      btn_next.classList.remove("disabled");
    }
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
