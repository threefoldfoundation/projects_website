<script>
  import { projects, users } from "../../store.js";
  import marked from "marked";

  import * as animateScroll from "svelte-scrollto";
  animateScroll.scrollToTop();

  const url = window.location.href;
  let current_project = url
    .substring(url.lastIndexOf("/") + 1)
    .split("%20").join(" ");

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

  let team = findTeam(project_data.info.team);
  let pageUrl = location.origin + location.hash.replace("#", "");
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
            {project_data['name']}
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

      {#if project_data.links.image_path != ''}
        <span class="image featured">
          <img src={project_data.links.image_path} alt="" />
        </span>
      {:else}
        <span class="image featured">
          <img height="auto" src="images/pic01.jpg" alt="" />
        </span>
      {/if}

      {@html marked(project_data.pages[0].content)}

      {#if project_data.milestones.length > 0}
        <div class="content">
          <h1>Milestones:</h1>
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
                {milestone.funding_required_tft}
              </li>
              <li>
                <b>Funding in USD:</b>
                {milestone.funding_required_usd}
              </li>
            </ul>
          {/each}
        </div>
      {/if}

      <div class="link_wrapper">
        <a
          href="https://wiki.threefold.io/#/tdeoverview"
          target="_blank"
          class="button large text-uppercase">
          Learn more
        </a>

        {#if project_data.ecosystem.badges.includes('tftgranted')}
          <a
            href="https://wiki.threefold.io/#/how_to_buy_and_sell"
            target="_blank"
            class="button large text-uppercase cta">
            Support
          </a>
        {/if}

      </div>

      {#if team.length > 0}
        <div class="content">
          <h1>Team:</h1>
          <ul>
            {#each team as person}
              <li class="my-2">
                <a href="#/people/{person.name}" class="author">
                  <img src={person.links.image_path} alt="" />
                  {person.info.name}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if project_data.info.countries.length > 0}
        <div class="content">
          <h1 class="d-inline-block">Countries:</h1>
          <ul class="d-inline-block single">
            {#each project_data.info.countries.slice(0, -1) as country}
              <li class="d-inline-block">{country.name} ,</li>
            {/each}
            <li class="d-inline-block">
              {project_data.info.countries[project_data.info.countries.length - 1].name}
            </li>
          </ul>
        </div>
      {/if}

      {#if project_data.info.cities.length > 0}
        <div class="content">
          <h1 class="d-inline-block">Cities:</h1>
          <ul class="d-inline-block single">
            {#each project_data.info.cities.slice(0, -1) as city}
              <li class="d-inline-block">{city.name} ,</li>
            {/each}
            <li class="d-inline-block">
              {project_data.info.cities[project_data.info.cities.length - 1].name}
            </li>
          </ul>
        </div>
      {/if}

      {#if project_data.links.websites.length > 0}
        <div class="content">
          <h1 class="d-inline-block">Websites:</h1>
          <ul class="d-inline-block single">
            {#each project_data.links.websites.slice(0, -1) as link}
              <li class="d-inline-block">
                <a href={link} target="_blank">{link}</a>
                ,
              </li>
            {/each}
            <a
              href={project_data.links.websites[project_data.links.websites.length - 1]}
              target="_blank">
              {project_data.links.websites[project_data.links.websites.length - 1]}
            </a>

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

      {#if project_data.links.video != ''}
        <div class="embed-container my-3">
          <iframe
            width="800"
            height="450"
            title=""
            class="mb-5"
            src="{project_data.links.video}?title=0&byline=0&portrait=0"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope;
            picture-in-picture"
            allowfullscreen />
        </div>
      {:else if project_data.links.image_path != ''}
        <span class="image featured">
          <img src={project_data.links.image_path} alt="" />
        </span>
      {:else}
        <span class="image featured">
          <img height="auto" src="images/pic01.jpg" alt="" />
        </span>
      {/if}

      <div class="social text-center">
        <div id="fb-root" />
        <script>
          (function(d, s, id) {
            var js,
              fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src =
              "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0";
            fjs.parentNode.insertBefore(js, fjs);
          })(document, "script", "facebook-jssdk");
        </script>
        <!-- Your share button code -->
        <div
          class="fb-share-button"
          data-href={pageUrl}
          data-layout="button_count" />

        <script
          src="https://platform.linkedin.com/in.js"
          type="text/javascript">
          lang: en_US;
        </script>
        <script
          class="linkedin-share-button"
          type="IN/Share"
          data-url={pageUrl}>

        </script>
        <a
          href="http://www.twitter.com/intent/tweet?url={pageUrl}"
          class="twitter-share-button"
          data-show-count="false">
          Tweet
        </a>

        <script
          async
          src="https://platform.twitter.com/widgets.js"
          charset="utf-8">

        </script>
      </div>

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
