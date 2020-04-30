<script>
  import User from "./User.svelte";

  export let users = [];
</script>

<div>
  {#each users as user}
    <User {user} />
  {/each}
</div>
