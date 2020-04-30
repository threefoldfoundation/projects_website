<script>
  import { projects, users } from "../../store.js";

  const url = window.location.href;
  let current_project = url.substring(url.lastIndexOf("/") + 1);
  let project_data = $projects.find(
    project => project["name"] == current_project
  );

  function findTeam(team) {
    var res = [];
    team.forEach(function(person) {
      var p = $users.find(user => user.info.name == person);
      if (p) {
        res.push(p);
      }
    });
    return res;
  }

  // project_data is all data to render from /data
</script>

<!-- Wrapper -->

<div id="wrapper">
  <!-- Main -->
  <div id="main">

    <!-- Post -->
    <article class="post">
      <header>
        <div class="title">
          <h2>
            <a href>{project_data['name']}</a>
          </h2>
        </div>
        <!-- <div class="meta">
          <time class="published" datetime="2015-11-01">November 1, 2015</time>
          <a href="#" class="author">
            <span class="name">Jane Doe</span>
            <img src="images/avatar.jpg" alt="" />
          </a>
        </div> -->
      </header>

      {#if project_data.links.video != ''}
        <iframe
          width="800"
          height="450"
          title=""
          src="{project_data.links.video}?title=0&byline=0&portrait=0"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope;
          picture-in-picture"
          allowfullscreen />
      {:else if project_data.links.image_path != ''}
        <span class="image featured">
          <img src={project_data.links.image_path} alt="" />
        </span>
      {:else}
        <span class="image featured">
          <img height="auto" src="images/pic01.jpg" alt="" />
        </span>
      {/if}

      {#if project_data.info.mission}
        <div class="content">
          <h1>Mission:</h1>
          <p>{project_data.info.mission}</p>
        </div>
      {/if}
      {#if project_data.info.description}
        <div class="content">
          <h1>Description:</h1>
          <p>{project_data.info.description}</p>
        </div>
      {/if}

      {#if project_data.info.team.length > 0}
        <div class="content">
          <h1>Team:</h1>
          <ul>
            {#each findTeam(project_data.info.team) as person}
              <li>
                <a href="#/users/{person.name}" class="author">
                  <img src={person.links.image_path} alt="" />
                  {person.info.name}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if project_data.milestones.length > 0}
        <div class="content">
          <h1>Milestons:</h1>
          {#each project_data.milestones as milestone}
            <ul class="card">
              <li>
                <h3>
                  {milestone.name} -
                  <time class="published" datetime={milestone.date}>
                    {milestone.date}
                  </time>
                </h3>
              </li>
              <li>
                <b>Description:</b>
                {milestone.description}
              </li>
              <li>
                <b>Funding in TFT:</b>
                {milestone.funding_required_tft}TFT
              </li>
              <li>
                <b>Funding in USD:</b>
                {milestone.funding_required_usd}
              </li>
            </ul>
          {/each}
        </div>
      {/if}

      {#if project_data.info.countries.length > 0}
        <div class="content">
          <h1 class="d-inline-block">Countries:</h1>
          <ul class="d-inline-block single">
            {#each project_data.info.countries as country}
              <li class="d-inline-block">{country.name}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if project_data.info.cities.length > 0}
        <div class="content ">
          <h1 class="d-inline-block">Cities:</h1>
          <ul class="d-inline-block single">
            {#each project_data.info.cities as city}
              <li class="d-inline-block">{city.name}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if project_data.links.websites.length > 0}
        <div class="content">
          <h1 class="d-inline-block">Websites:</h1>
          <ul class="d-inline-block single">
            {#each project_data.links.websites as link}
              <li class="d-inline-block">
                <a href={link} target="_blank">{link}</a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if project_data.links.linkedin}
        <div class="content">
          <h1 class="d-inline-block">Linkedin:</h1>
          <a href={project_data.links.linkedin}>
            {project_data.links.linkedin}
          </a>
        </div>
      {/if}

      {#if project_data.links.wiki}
        <div class="content">
          <h1 class="d-inline-block">Wiki:</h1>
          <a href={project_data.links.wiki} target="_blank">
            {project_data.links.wiki}
          </a>
        </div>
      {/if}

      {#if project_data.ecosystem.badges.length > 0}
        <div class="content">
          <h1 class="d-inline-block">Badges:</h1>
          <ul class="d-inline-block single">
            {#each project_data.ecosystem.badges as badge}
              <li class="d-inline-block">{badge}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if project_data.ecosystem.categories.length > 0}
        <footer>
          <ul class="stats">
            {#each project_data.ecosystem.categories as category}
              <li>
                <a href="#/projects/tags/{category}">{category}</a>
              </li>
            {/each}
          </ul>
        </footer>
      {/if}

    </article>

  </div>

</div>
