
<script>
  import { users, projects } from "../../store.js";
  import SearchResults from "../components/SearchResults.svelte";
  import SearchItem from "../components/SearchItem.svelte";
  import SideBar from "../components/SideBar.svelte";
  import * as animateScroll from "svelte-scrollto";

  export let params = {};
  
  animateScroll.scrollToTop();

  let miniProjects = []
  let miniusersList = []
  let results = [];
  let page = 1,
    addWith = 200;

  // const shuffled_projects = $projects.sort(() => 0.5 - Math.random());
  miniProjects = $projects;
  miniusersList = $users;
  
  $: if (params.keyword) { //watch the params.id for changes
      results = filter().slice(0, addWith);
  }

  
  function keywordExists(obj, keyword){
    if (obj.pages[0].content.toLowerCase().includes(keyword))
        return true

    if (obj.name.toLowerCase().includes(keyword))
        return true

    if (obj.links.linkedin.toLowerCase().includes(keyword))
        return true

    if (obj.links.video.toLowerCase().includes(keyword))
        return true

    if (obj.links.wiki.toLowerCase().includes(keyword))
        return true

    obj.links.websites.forEach(function(ws){
      if (ws.toLowerCase().includes(keyword))
          return true
    })

    // projects only
    if (obj.ecosystem.categories){
      for (const c of obj.ecosystem.categories){
        if (c.toLowerCase().includes(keyword)){
          return true
        }
      }
     
      for (const b of obj.ecosystem.badges){
        if (b.toLowerCase().includes(keyword))
            return true
      }
    
      for (const p of obj.info.team){
        if (p.toLowerCase().includes(keyword))
            return true
      }

      if (obj.info.mission.toLowerCase().includes(keyword))
        return true

      if (obj.info.description && obj.info.description.toLowerCase().includes(keyword))
        return true

      for (const ms of obj.milestones){
        if (ms.name.toLowerCase().includes(keyword))
            return true

        if (ms.date.toLowerCase().includes(keyword))
            return true

        if (ms.funding_required_tft.toLowerCase().includes(keyword))
            return true

        if (ms.funding_required_usd.toLowerCase().includes(keyword))
            return true

        if (ms.description.toLowerCase().includes(keyword))
            return true
      }
    }

    for (const c of obj.info.countries){
        if (c.name.toLowerCase().includes(keyword))
            return true
    }

    for (const c of obj.info.cities){
        if (c.name.toLowerCase().includes(keyword))
            return true
    }

    // people only

    if (obj.ecosystem.memberships){
            
        if (obj.info.name.toLowerCase().includes(keyword)){
          return true
        }
          

        for (const b of obj.ecosystem.memberships){
          if (b.toLowerCase().includes(keyword))
              return true
        }

         for (const c of obj.info.companies){
            if (c.name.toLowerCase().includes(keyword))
                return true
          }

        if (obj.info.bio.toLowerCase().includes(keyword)){
            return true
        }

        if (obj.info.name.toLowerCase().includes(keyword)){
            return true
        }
    }

    return false
  }

  function filter(){
      function findProjects(keyword) {
            var res = [];
            $projects.forEach(function(proj) {
                if (keywordExists(proj, keyword)) {
                    res.push(proj.name);
                }
            });
            return res;
        }

        function findPeople(keyword) {
            var res = [];
            $users.forEach(function(person) {
                if (keywordExists(person, keyword)) {
                    res.push(person.name);
                }
            });
            return res;
        }

        var projects_result = {}
        var people_result = {}

        var keywords = params.keyword.replace("%20", " ").split(" ")
        
        keywords.forEach(
            function(keyword){
                keyword = keyword.trim().toLowerCase()
                var projects = findProjects(keyword)
                var people = findPeople(keyword)
                
                projects.forEach(function(item){
                    if(item in projects_result){
                        projects_result[item] = projects_result[item] + 1
                    }else{
                        projects_result[item] = 1
                    }
                })

                people.forEach(function(item){
                    if(item in people_result){
                        people_result[item] = people_result[item] + 1
                    }else{
                        people_result[item] = 1
                    }
                })
            }
        )

        var finalResult = []
        var count = keywords.length

        for (var property in people_result) {
            if (people_result.hasOwnProperty(property)) {
                if(people_result[property] == count){
                    var item = $users.find(user => user["name"] == property)
                    item.isUser = true
                    item.isProject = false
                    finalResult.push(item)
                }
            }
        }

        for (var property in projects_result) {
            if (projects_result.hasOwnProperty(property)) {
                if(projects_result[property] == count){
                    var item = $projects.find(proj => proj["name"] == property)
                    item.isUser = false
                    item.isProject = true
                    finalResult.push(item)
                }
            }
            
        }
        return finalResult
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
