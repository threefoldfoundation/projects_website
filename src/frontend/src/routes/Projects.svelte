
<script>
  import { users, projects } from "../../store.js";
  import AllProjectsList from "../components/AllProjectsList.svelte";
  import SideBar from "../components/SideBar.svelte";
  import * as animateScroll from "svelte-scrollto";
  import {getRandomSlice} from "../utils.js"

  animateScroll.scrollToTop();

  export let params = {};
  export let projectsList = $projects;

  $: if (params.tagname) {
    //watch the params.id for changes
    projectsList = getProjects();
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

  let miniProjects = $projects;
  let miniusersList = []
  let results = [];
  let page = 1,
    addWith = 200;

  // const shuffled_projects = $projects.sort(() => 0.5 - Math.random());
  
</script>

<main>
  <!-- Wrapper -->
  <div id="wrapper">

    <!-- Main -->
    <div id="main">
      <AllProjectsList projects={projectsList} />
    </div>
    <SideBar {miniProjects} />
  </div>
</main>
