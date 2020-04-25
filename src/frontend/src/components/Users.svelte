<script>
export let Users
export let users
</script>

<section>


<ul class="posts">
	{#each users as user}
	<li>
		<article>
			<header>
				<h3><a href="single.html">{user.name}</a></h3>
				<time class="published" datetime="2015-10-20">October 20, 2015</time>
			</header>
			<a href="single.html" class="image"><img src="images/pic08.jpg" alt="" /></a>
		</article>
	</li>
	{/each}
</ul>

</section>
