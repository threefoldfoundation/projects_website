<script>
  import { users, projects } from "../../store.js";
  import * as animateScroll from "svelte-scrollto";
  animateScroll.scrollToTop();

  const url = window.location.href;
  let current_user = url.substring(url.lastIndexOf("/") + 1);
  let user_data = $users.find(user => user["name"] == current_user);

  // user_data is all data to render from /data

  function findProjects(user) {
    var res = [];
    $projects.forEach(function(proj) {
      if (proj.info.team.includes(user)) {
        res.push(proj);
      }
    });
    return res;
  }

  let userProjects = findProjects(user_data.info.name);

</script>

<!-- Wrapper -->
<div id="wrapper">

  <div id="main">

    <!-- Post -->
    <article class="post">
      <header>
        <div class="title">
          <h2>{user_data.info.name}</h2>
        </div>
      </header>

      {#if user_data.links.video != ''}
        <div class="embed-container">
          <iframe
            title=""
            width="800"
            height="530"
            class="mb-5"
            src="{user_data.links.video}?title=0&byline=0&portrait=0"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope;
            picture-in-picture"
            allowfullscreen />
        </div>
      {:else if user_data.links.image_path != ''}
        <span>
          <img src={user_data.links.image_path} alt="" />
        </span>
      {:else}
        <span class="image featured">
          <img height="auto" src="images/pic01.jpg" alt="" />
        </span>
      {/if}

      <div class="content">
        <p>{user_data.info.bio}</p>
      </div>

       {#if userProjects.length > 0}
        <div class="content">
          <h1>Projects:</h1>
          <ul>
            {#each userProjects as p}
              <li class="my-2 project">
                <a href="#/projects/{p.name}" class="author">
                  <img src={p.links.logo_path} alt="" />
                  {p.name}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if user_data.info.companies.length > 0}
        <div class="content">
          <h1 class="d-inline-block">Companies:</h1>
          <ul class="d-inline-block single">
            {#each user_data.info.companies.slice(0, -1) as company}
              <li>{company.name} ,</li>
            {/each}
            <li>{user_data.info.companies[user_data.info.companies.length-1].name}</li>
          </ul>
        </div>
      {/if}

      {#if user_data.info.countries.length > 0}
        <div class="content">
          <h1 class="d-inline-block">Countries:</h1>
          <ul class="d-inline-block single">
            {#each user_data.info.countries.slice(0, -1) as country}
              <li>{country.name} ,</li>
            {/each}
            <li>{user_data.info.countries[user_data.info.countries.length-1].name}</li>
          </ul>
        </div>
      {/if}

      {#if user_data.info.cities.length > 0}
        <div class="content">
          <h1 class="d-inline-block">Cities:</h1>
          <ul class="d-inline-block single">
            {#each user_data.info.cities.slice(0, -1) as city}
              <li>{city.name} ,</li>
            {/each}
            <li>{user_data.info.cities[user_data.info.cities.length-1].name}</li>
          </ul>
        </div>
      {/if}

      {#if user_data.links.websites.length > 0}
        <div class="content">
          <h1 class="d-inline-block">Websites:</h1>
          <ul class="d-inline-block single">
            {#each user_data.links.websites.slice(0,-1) as link}
              <li class="d-inline-block">
                <a href={link} target="_blank">{link}</a> ,
              </li>
            {/each}
            <a href={user_data.links.websites[user_data.links.websites.length-1]} target="_blank">{user_data.links.websites[user_data.links.websites.length-1]}</a>
          </ul>
        </div>
      {/if}

      {#if user_data.links.linkedin}
        <div class="content">
          <h1 class="d-inline-block">Linkedin:</h1>
          <a href={user_data.links.linkedin} target="_blank">
            {user_data.links.linkedin}
          </a>
        </div>
      {/if}

      {#if user_data.links.wiki}
        <div class="content">
          <h1 class="d-inline-block">Wiki:</h1>
          <a href={user_data.links.wiki} target="_blank">
            {user_data.links.wiki}
          </a>
        </div>
      {/if}

      {#if user_data.ecosystem.memberships.length > 0}
        <footer>
          <ul class="stats">
            {#each user_data.ecosystem.memberships as membership}
              <li>
                <a href="#/users/tags/{membership}">{membership}</a>
              </li>
            {/each}
          </ul>
        </footer>
      {/if}

    </article>

  </div>

</div>
