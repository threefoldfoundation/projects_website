<script>
  import MiniUser from "./MiniUser.svelte";

  export let users = [];
</script>

<ul class="posts">
<h1>People</h1>
  {#each users as user}
    <li>
      <MiniUser {user} />
    </li>
  {/each}
</ul>
