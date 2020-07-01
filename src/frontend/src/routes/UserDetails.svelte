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
  let pageUrl = location.origin + location.hash.replace("#", "");

  const firstName = () => {
    return user_data.info.name.replace(/ .*/, "");
  };

  const urlsLink = url => {
    return url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0];
  };

  const openVideo = () => {
    window
      .$(
        "#video-popup-overlay,#video-popup-iframe-container,#video-popup-container,#video-popup-close"
      )
      .show();

    var srchref = "",
      autoplay = "",
      srchref = user_data.links.video;

    if (window.$(this).data("autoplay") == true) autoplay = "?autoplay=1";

    window.$("#video-popup-iframe").attr("src", srchref + autoplay);

    window.$("#video-popup-iframe").on("load", function() {
      window.$("#video-popup-container").show();
    });
  };

  const closeVideo = () => {
    window
      .$(
        "#video-popup-iframe-container,#video-popup-container,#video-popup-close,#video-popup-overlay"
      )
      .hide();
    window.$("#video-popup-iframe").attr("src", "");
  };
</script>

<!-- Wrapper -->
<div class="user_profile container my-3">
  <div class="row">
    <div class="col-sm-5">
      <img src={user_data.links.image_path} alt="" class="img-thumbnail" />
    </div>
    <div class="offset-sm-1 col-sm-6">
      <h1 class="h1 font-weight-bold">{user_data.info.name}</h1>
      <p class="lead">{user_data.info.bio}</p>
      {#if user_data.links.video}
        <div
          class="button large text-uppercase cta vpop"
          on:click|preventDefault={openVideo}
          data-autoplay="true">
          Message from {firstName()}
          <i class="fas fa-play" />
        </div>
      {/if}
      <div class="data mt-1">
        {#if user_data.info.companies.length > 0}
          <span class="font-weight-bold text-capitalize">
            <i class="fas fa-briefcase mr-2" />
          </span>
          <ul class="d-inline-block m-0 px-0">
            {#each user_data.info.companies as company}
              <li class="px-0">{company.name}</li>
            {/each}
          </ul>
        {/if}
      </div>
      <div class="data">
        {#if user_data.info.countries.length > 0}
          <span class="font-weight-bold text-capitalize">
            <i class="fas fa-map-marker-alt mr-3" />
          </span>
          <ul class="d-inline-block m-0 px-0">
            {#each user_data.info.countries as country}
              <li class="px-0">{country.name}</li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="data">
        {#if user_data.info.cities.length > 0}
          <span class="font-weight-bold text-capitalize">
            <i class="fas fa-home mr-2" />
          </span>
          <ul class="d-inline-block m-0 px-0">
            {#each user_data.info.cities as city}
              <li class="px-0">{city.name}</li>
            {/each}
          </ul>
        {/if}
      </div>

      <div class="data mb-1">
        {#if user_data.links.websites.length > 0}
          <span class="font-weight-bold text-capitalize">
            <i class="fas fa-external-link-alt mr-2" />
          </span>
          <ul class="d-inline-block m-0 px-0">
            {#each user_data.links.websites as website}
              <li class="px-0">
                <a href={website} target="_blank">{urlsLink(website)}</a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      <!-- share btns -->
      <div class="social justify-content-start">
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
      {#if user_data.ecosystem.memberships.length > 0}
        <footer>
          <ul class="stats">
            {#each user_data.ecosystem.memberships as membership}
              <li>
                <a href="#/people/tags/{membership}">{membership}</a>
              </li>
            {/each}
          </ul>
        </footer>
      {/if}

    </div>
  </div>
</div>

<!-- copy this stuff and down -->
<div id="video-popup-overlay" on:click={closeVideo}>
  <div id="video-popup-close" class="fade" on:click={closeVideo}>&#10006;</div>
</div>

<div id="video-popup-container">
  <div id="video-popup-iframe-container">
    <iframe
      id="video-popup-iframe"
      src=""
      title=""
      width="100%"
      height="100%"
      frameborder="0" />
  </div>
</div>
