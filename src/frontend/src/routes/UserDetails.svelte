<script>
  import { users } from "../../store.js";

  const url = window.location.href;
  let current_user = url.substring(url.lastIndexOf("/") + 1);
  let user_data = $users.find(user => user["name"] == current_user);

  // user_data is all data to render from /data
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

      {#if user_data.info.companies.length > 0}
        <div class="content">
          <h1>Companies:</h1>
          <ul>
            {#each user_data.info.companies as company}
              <li>{company.name}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if user_data.info.countries.length > 0}
        <div class="content">
          <h1>Countries:</h1>
          <ul>
            {#each user_data.info.countries as country}
              <li>{country.name}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if user_data.info.cities.length > 0}
        <div class="content">
          <h1>Cities:</h1>
          <ul>
            {#each user_data.info.cities as city}
              <li>{city.name}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if user_data.links.websites.length > 0}
        <div class="content">
          <h1>Websites:</h1>
          {#each user_data.links.websites as link}
            <a href={link} target="_blank">{link}</a>
          {/each}
        </div>
      {/if}

      {#if user_data.links.linkedin}
        <div class="content">
          <h1>Linkedin:</h1>
          <a href={user_data.links.linkedin} target="_blank">
            {user_data.links.linkedin}
          </a>
        </div>
      {/if}

      {#if user_data.links.wiki}
        <div class="content">
          <h1>Wiki:</h1>
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
                <a href="#search?q={membership}">{membership}</a>
              </li>
            {/each}
          </ul>
        </footer>
      {/if}

    </article>

  </div>

</div>
