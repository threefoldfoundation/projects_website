<script>
  import { users, projects } from "../../store.js";
  import UserList from "../components/UserList.svelte";
  import SideBar from "../components/SideBar.svelte";
  import * as animateScroll from "svelte-scrollto";

  export let params = {};

  animateScroll.scrollToTop();

  let miniProjects = [],
    miniusersList = [];
  let usersList = [];
  let page = 1,
    addWith = 5;

  miniProjects = [];
  miniusersList = $users;
  usersList = getUsers().slice(0, 5);

  $: if (params.tagname) { //watch the params.id for changes
      usersList = getUsers().slice(0, 5);
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
    page += 1;
    updatePage();
    usersList = getUsers().slice((page-1)*addWith, ((page-1)*addWith)+addWith);
    animateScroll.scrollToTop();
  }



  function onPrevious() {
    page -= 1;
    updatePage();
    usersList = getUsers().slice((page-1)*addWith, ((page-1)*addWith)+addWith);
    animateScroll.scrollToTop();
  }
  function updatePage() {
    let btn_prev = document.getElementById("btn_prev");
    let btn_next = document.getElementById("btn_next");
    let len = getUsers().length;
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
