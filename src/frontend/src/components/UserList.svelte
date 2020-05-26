<script>
  import User from "./User.svelte";

  export let users = [];
</script>

<div class="row">
  {#each users as user}
    <User {user} />
  {/each}
</div>
