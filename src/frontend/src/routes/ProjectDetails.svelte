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
<!-- <div id="wrapper">
  <div id="main">

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

</div> -->
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
          src={project_data.links.video}
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
            {#each project_data.info.team as person}
              <li>{person}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if project_data.milestones.length > 0}
        <div class="content">
          <h1>Milestons:</h1>
          {#each project_data.milestones as milestone}
            <ul>
              <li>
                <b>-</b>
                {milestone.name}
              </li>
              <li>
                <b>Date:</b>
                <time class="published">{milestone.date}</time>
              </li>
              <li>
                <b>Description:</b>
                {milestone.description}
              </li>
              <li>
                <b>Funding require in TFT:</b>
                {milestone.funding_required_tft}TFT
              </li>
              <li>
                <b>Funding required in USD:</b>
                {milestone.funding_required_usd}$
              </li>
            </ul>
          {/each}
        </div>
      {/if}

      {#if project_data.info.countries.length > 0}
        <div class="content">
          <h1>Countries:</h1>
          <ul>
            {#each project_data.info.countries as country}
              <li>{country.name}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if project_data.info.cities.length > 0}
        <div class="content">
          <h1>Cities:</h1>
          <ul>
            {#each project_data.info.cities as city}
              <li>{city.name}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if project_data.links.websites.length > 0}
        <div class="content">
          <h1>Websites:</h1>
          <ul>
            {#each project_data.links.websites as link}
              <li>
                <a href={link} target="_blank">{link}</a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if project_data.links.linkedin}
        <div class="content">
          <h1>Linkedin:</h1>
          <a href={project_data.links.linkedin}>
            {project_data.links.linkedin}
          </a>
        </div>
      {/if}

      {#if project_data.links.wiki}
        <div class="content">
          <h1>Wiki:</h1>
          <a href={project_data.links.wiki} target="_blank">
            {project_data.links.wiki}
          </a>
        </div>
      {/if}

      {#if project_data.ecosystem.badges.length > 0}
        <div class="content">
          <h1>Badges:</h1>
          <ul>
            {#each project_data.ecosystem.badges as badge}
              <li>{badge}</li>
            {/each}
          </ul>
        </div>
      {/if}
      
      {#if project_data.ecosystem.categories.length > 0}
        <footer>
          <ul class="stats">
            {#each project_data.ecosystem.categories as category}
              <li>
                <a href="#search?q={category}">{category}</a>
              </li>
            {/each}
          </ul>
        </footer>
      {/if}

    </article>

  </div>

  <!-- Footer -->
  <!-- <section id="footer" class="text-center">
    <ul class="icons">
      <li>
        <a href="#" class="icon brands fa-twitter">
          <span class="label">Twitter</span>
        </a>
      </li>
      <li>
        <a href="#" class="icon brands fa-facebook-f">
          <span class="label">Facebook</span>
        </a>
      </li>
      <li>
        <a href="#" class="icon brands fa-instagram">
          <span class="label">Instagram</span>
        </a>
      </li>
      <li>
        <a href="#" class="icon solid fa-rss">
          <span class="label">RSS</span>
        </a>
      </li>
      <li>
        <a href="#" class="icon solid fa-envelope">
          <span class="label">Email</span>
        </a>
      </li>
    </ul>
    <p class="copyright">
      &copy; Untitled. Design:
      <a href="http://html5up.net">HTML5 UP</a>
      . Images:
      <a href="http://unsplash.com">Unsplash</a>
      .
    </p>
  </section> -->

</div>
