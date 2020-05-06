
<script>
  import { users, projects } from "../../store.js";
  import SearchResults from "../components/SearchResults.svelte";
  import SearchItem from "../components/SearchItem.svelte";
  import SideBar from "../components/SideBar.svelte";
  import * as animateScroll from "svelte-scrollto";
  import {getRandomSlice} from "../utils.js"

  export let params = {};
  params.keyword

  animateScroll.scrollToTop();

  let miniProjects = []
  let miniusersList = []
  let results = [];
  let page = 1,
    addWith = 200;

  // const shuffled_projects = $projects.sort(() => 0.5 - Math.random());
  miniProjects = getRandomSlice($projects, 5);
  miniusersList = getRandomSlice($users, 5);
  results = filter().slice(0, addWith);

  function filter() {
    var res = []

    var users = $users.slice(0, 3)
    var projects = $projects.slice(0, 3)

    users.forEach(function(item){
        item.isUser = true
        item.isProject = false
    })

    projects.forEach(function(item){
        item.isProject = true
        item.isUser = false
    })


    res.push(...users)    
    res.push(...projects)
    return res
  }

  function onNext() {
    page += 1;
    updatePage();
    results = filter().slice((page-1)*addWith, ((page-1)*addWith)+addWith);
    animateScroll.scrollToTop();
  }



  function onPrevious() {
    page -= 1;
    updatePage();
    results = filter().slice((page-1)*addWith, ((page-1)*addWith)+addWith);
    animateScroll.scrollToTop();
  }
  function updatePage() {
    let btn_prev = document.getElementById("btn_prev");
    let btn_next = document.getElementById("btn_next");
    let len = filter().length;
    let noPages = Math.ceil(len/3)
    
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
      <SearchResults searchResults={results} />
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
