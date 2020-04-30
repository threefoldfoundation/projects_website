<script>
  import { projects } from "../../store.js";

  const url = window.location.href;
  let current_project = url.substring(url.lastIndexOf("/") + 1);
  let project_data = $projects.find(
    project => project["name"] == current_project
  );

  // project_data is all data to render from /data
</script>

<!-- Wrapper -->
<div id="wrapper">
  <div id="main">

    <!-- Post -->
    <div class="container">
      <article class="post">
        <header>
          <div class="title">
            <h2>{project_data['name']}</h2>
            <p>
              <strong>
                A collective and open ecosystem of planet- and human- centric
                projects
              </strong>
            </p>
          </div>
        </header>

        {#if project_data.links.video != ''}
          <iframe
            width="800"
            height="415"
            title=""
            class="d-block mx-auto my-5"
            src={project_data.links.video}
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope;
            picture-in-picture"
            allowfullscreen />
        {:else if project_data.links.image_path != ''}
          <a href="#/project_data/{project_data.name}" class="image featured">
            <img src={project_data.links.image_path} alt="" />
          </a>
        {:else}
          <a href="#/project_data/{project_data.name}" class="image featured">
            <img src="images/pic01.jpg" alt="" />
          </a>
        {/if}

        {#if project_data.info.mission}
          <div class="content">
            <h1 class="my-0">Mission:</h1>
            <p style="margin-bottom:1em;">{project_data.info.mission}</p>
          </div>
        {/if}

        {#if project_data.info.description}
          <h1 class="my-0">Description:</h1>
          <p style="margin-bottom:1em;">{project_data.info.description}</p>
        {/if}

        {#if project_data.info.team.length > 0}
          <h1 class="my-0">Team:</h1>
          {#each project_data.info.team as person}
            <li>{person}</li>
          {/each}
        {/if}

        {#if project_data.milestones.length > 0}
          <h1 class="my-0">Milestons:</h1>
          {#each project_data.milestones as milestone}
            <h1 class="my-0">Name:</h1>
            <li>{milestone.name}</li>
            <h1 class="my-0">Date:</h1>
            <li>{milestone.date}</li>
            <h1 class="my-0">Description:</h1>
            <li>{milestone.description}</li>
            <h1 class="my-0">Funding require in TFT:</h1>
            <li>{milestone.funding_required_tft}</li>
            <h1 class="my-0">Funding required in USD:</h1>
            <li>{milestone.funding_required_usd}$</li>
          {/each}
        {/if}

        {#if project_data.info.countries.length > 0}
          <h1 class="my-0">Countries:</h1>
          {#each project_data.info.countries as country}
            <li>{country.name}</li>
          {/each}
        {/if}

        {#if project_data.info.cities.length > 0}
          <h1 class="my-0">Cities:</h1>
          {#each project_data.info.cities as city}
            <li>{city.name}</li>
          {/each}
        {/if}

        {#if project_data.links.websites.length > 0}
          <h1 class="my-0">Websites:</h1>
          {#each project_data.links.websites as link}
            <a href={link}>{link}</a>
          {/each}
        {/if}

        {#if project_data.links.linkedin}
          <div>
            <h1 class="my-0">Linkedin:</h1>
            <a href={project_data.links.linkedin}>
              {project_data.links.linkedin}
            </a>
          </div>
        {/if}

        {#if project_data.links.wiki}
          <div>
            <h1 class="my-0">Wiki:</h1>
            <a href={project_data.links.wiki}>{project_data.links.wiki}</a>
          </div>
        {/if}

        {#if project_data.ecosystem.badges.length > 0}
          <h1 class="my-0">Badges:</h1>

          {#each project_data.ecosystem.badges as badge}
            <li>{badge}</li>
          {/each}
        {/if}

        {#if project_data.ecosystem.categories.length > 0}
          <h1 class="my-0">Categories:</h1>

          {#each project_data.ecosystem.categories as category}
            <li>{category}</li>
          {/each}
        {/if}

      </article>
    </div>

  </div>

</div>
