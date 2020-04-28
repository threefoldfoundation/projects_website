<script>
  import Project from "./Project.svelte"

  export let projects = [];

</script>

<div>
	{#each projects as project}
			<Project {project} />
	{/each}
</div>
