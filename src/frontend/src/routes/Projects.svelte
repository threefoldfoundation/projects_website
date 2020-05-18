<script>
  import { users, projects } from "../../store.js";
  import ProjectList from "../components/ProjectList.svelte";
  import SideBar from "../components/SideBar.svelte";
  import * as animateScroll from "svelte-scrollto";
  import {getRandomSlice} from "../utils.js"
  import { onMount } from 'svelte';

  animateScroll.scrollToTop();

  export let params = {};

  let miniProjects = [];
  let projectsList = [];
  let filteredProjects = [];
  let page = 1,
    addWith = 5



  let selected_users = getRandomSlice($users, 5);
  projectsList = getProjects().slice(0, 5);
  miniProjects = getRandomSlice($projects, 10);

   $: if (params.tagname) { //watch the params.id for changes
      projectsList = getProjects().slice(0, 5);
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
    page += 1;
    updatePage();
    projectsList = getProjects().slice((page-1)*addWith, ((page-1)*addWith)+addWith);
    animateScroll.scrollToTop();
  }

  function onPrevious() {
    page -= 1;
    updatePage();
    projectsList = getProjects().slice((page-1)*addWith, ((page-1)*addWith)+addWith);
    animateScroll.scrollToTop();
  }

  function updatePage() {
    let btn_prev = document.getElementById("btn_prev");
    let btn_next = document.getElementById("btn_next");
    let len = getProjects().length;

    let noPages = Math.ceil(len/addWith)

    if (noPages > page){
      btn_next.classList.remove("disabled");
      if (page !== 1){
          btn_prev.classList.remove("disabled");
      }
    }


    else if (noPages = page)
      btn_next.classList.add("disabled");
      btn_prev.classList.remove("disabled");

    if (page == 1)
      btn_prev.classList.add("disabled");
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
