<script>
  import { users, projects } from "../../store.js";
  import UserList from "../components/UserList.svelte";
  import SideBar from "../components/SideBar.svelte";
  import * as animateScroll from "svelte-scrollto";
  import {getRandomSlice} from "../utils.js"

  export let params = {};

  animateScroll.scrollToTop();

  let miniProjects = [],
    miniusersList = [];
  let usersList = [];
  let page = 0,
    addWith = 3,
    lastpage = false;

  // const shuffled_projects = $projects.sort(() => 0.5 - Math.random());
  miniProjects = getRandomSlice($projects, 5);
  miniusersList = getRandomSlice($users, 5);
  usersList = getUsers().slice(0, 3);

  $: if (params.tagname) { //watch the params.id for changes
      usersList = getUsers().slice(0, 3);
  }

  function filterUsers(membership) {
    return $users.filter(user =>
      user.ecosystem.memberships.includes(membership)
    );
  }

  function getUsers() {
    if (params.tagname) {
      return filterUsers(params.tagname);
    } else {
      return $users;
    }
  }

  function onNext() {
    page += 3;
    updatePage();
    if (lastpage) {
      usersList = getUsers().slice(page);
    } else usersList = getUsers().slice(page, page + addWith);
    animateScroll.scrollToTop();
  }



  function onPrevious() {
    page -= 3;
    updatePage();
    usersList = getUsers().slice(page, page + addWith);
    animateScroll.scrollToTop();
  }
  function updatePage() {
    let btn_prev = document.getElementById("btn_prev");
    let btn_next = document.getElementById("btn_next");
    let len = getUsers().length;
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
      <UserList users={usersList} />
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
    <SideBar {miniProjects} users={miniusersList} />
  </div>
</main>
