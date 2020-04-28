<script>
  import Project from "./Project.svelte"

  export let projects = [];
</script>

<ul>
	{#each projects as project}
		<li>
			<Project {project} />
		</li>
	{/each}
</ul>
