<script>
	import MiniUser from './MiniUser.svelte'

	export let users = []
</script>

<section>


<ul class="posts">
	 {#each users as user}
	<li>
		<MiniUser {user} />
	</li>
	{/each}
</ul>

</section>
