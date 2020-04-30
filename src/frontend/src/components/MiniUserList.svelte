<script>
  import MiniUser from "./MiniUser.svelte";

  export let users = [];
</script>

<ul class="posts">
  {#each users as user}
    <li>
      <MiniUser {user} />
    </li>
  {/each}
</ul>
