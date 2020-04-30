<script>
  import { users, projects } from "../../store.js";
  import UserList from "../components/UserList.svelte";
  import SideBar from "../components/SideBar.svelte";

  let miniProjects = [];
  let usersList = [];
  let page = 0;

  // const shuffled_projects = $projects.sort(() => 0.5 - Math.random());
  miniProjects = $projects.slice(0, 5);
  const shuffled_users = $users.sort(() => 0.5 - Math.random());
  usersList = shuffled_users.slice(0, 5);

  function onNext() {
    page += 3;
    usersList = $users.slice(page, page + 3);
    updatePage();
  }

  function onPrevious() {
    page -= 3;
    usersList = $users.slice(page, page + 3);
    updatePage();
  }
  function updatePage() {
    let btn_prev = document.getElementById("btn_prev");
    let btn_next = document.getElementById("btn_next");
    if (page > 0) {
      btn_prev.classList.remove("disabled");
    }
    if (page > $projects.length - 3) {
      btn_next.classList.add("disabled");
    }
    if (page <= 0) {
      btn_prev.classList.add("disabled");
    }
    if (page < $projects.length - 3) {
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
    <SideBar miniProjects={miniProjects} users={usersList} />
  </div>
</main>
