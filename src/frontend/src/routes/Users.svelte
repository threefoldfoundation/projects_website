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
  

  miniProjects = [];
  miniusersList = $users;
  usersList = getUsers();

  $: if (params.tagname) { //watch the params.id for changes
      usersList = getUsers()
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

</script>

<main>
  <!-- Wrapper -->
  <div id="wrapper">

    <!-- Main -->
    <div id="main">
      <UserList users={usersList} />
    </div>
    <SideBar users={miniusersList} />
  </div>
</main>
