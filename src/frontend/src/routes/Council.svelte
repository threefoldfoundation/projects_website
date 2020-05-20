<script>
  import { users } from "../../store.js";

  let councillors = $users.filter(user => user.ecosystem.memberships.includes("wisdomcouncil"));
</script>

<!-- Wrapper -->
<div id="wrapper">

  <!-- Main -->
  <div id="main">

    <!-- Post -->
    <article class="post_home text-center">
      <header>
        <div class="title">
          <h1>WISDOM COUNCIL</h1>
        </div>
      </header>
      <!-- <span class="image featured">
        <img src="images/join.png" alt="" />
      </span> -->

      <p class="home_tf">
        In order to make balanced, fair and effective decisions regarding Three
        Fold Foundation funds distribution, ThreeFold Foundation has adopted the
        Wisdom Council system as a resource model of harmonious communication
      </p>
      <p class="home_tf">
        This process is based upon ancient leadership practices and modern
        social science techniques as a way to consider all perspectives of the
        Members in order to make decisions that are in the greatest interest of
        the Mission and for the good of all.
      </p>
      <h3>MISSION</h3>
      <p class="home_tf">
        Financially support consciously aligned do-good projects and
        organizations.
      </p>
      <h3>MEMBERS</h3>
      <p class="home_tf">
        Wisdom Council Members are community leaders chosen by Founders Circle
        due to their honorable integrity and exemplary service related to The
        Mission. Structure and balance of Member Seats is based on one's
        personal role, strength, purpose, archetypes and other respectful
        characteristics.
      </p>
      <h3>RESPONSIBILITY</h3>
      <p class="home_tf">
        Based upon the ageless principles of the Wisdom Council equation,
        Members will converge (online or live when possible) to discuss and vote
        upon the distribution of funds from ThreeFold Foundation to pre-approved
        and/or pre-selected do-good projects and organizations.
      </p>
      <h3>PROCESS</h3>
      <p class="home_tf">
        The Wisdom Council members will be notified once per quarter as to the
        current do-good requests and account financial status to decide when to
        meet and make distribution decisions of how much, when and to whom the
        agreed funds go to.
      </p>
    </article>

    <div class="container">

      <div class="row">
       {#each councillors as c}
         <div class="col-sm-3">
          <a href="#/users/{c.name}" class="image d-block">
          {#if c.links.image_path != ''}
            <img class="mx-auto" src="{c.links.image_path}" alt="" />
            {:else}
            <img class="mx-auto" src="images/pic01.jpg" alt="" />
            {/if}
          </a>
          <h5 class="align-center">{c.name}</h5>
        </div>
      {/each}
      </div>
    </div>
  </div>
</div>
