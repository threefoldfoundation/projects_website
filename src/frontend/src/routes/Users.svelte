<script>
  import { users, projects } from "../../store.js";
  import UserList from "../components/UserList.svelte";
  import SideBar from "../components/SideBar.svelte";
  import * as animateScroll from "svelte-scrollto";
  animateScroll.scrollToTop();

  let miniProjects = [],
    miniusersList = [];
  let usersList = [];
  let page = 0,
    addWith = 3,
    lastpage = false;

  // const shuffled_projects = $projects.sort(() => 0.5 - Math.random());
  miniProjects = $projects.slice(0, 5);
  miniusersList = $users.slice(0, 3);
  usersList = $users.slice(0, 3);

  function onNext() {
    page += 3;
    updatePage();
    if (lastpage) {
      usersList = $users.slice(page);
    } else usersList = $users.slice(page, page + addWith);
    animateScroll.scrollToTop();
  }

  function onPrevious() {
    page -= 3;
    updatePage();
    usersList = $users.slice(page, page + addWith);
    animateScroll.scrollToTop();
  }
  function updatePage() {
    let btn_prev = document.getElementById("btn_prev");
    let btn_next = document.getElementById("btn_next");
    let len = $users.length;
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
