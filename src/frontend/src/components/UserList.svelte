<script>
	import User from './User.svelte'

	export let users = []
</script>

<section>


<ul class="posts">
	 {#each users as user}
	<li>
		<User {user} />
	</li>
	{/each}
</ul>

</section>
