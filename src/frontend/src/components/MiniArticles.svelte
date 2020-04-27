<script>
export let MiniArticles
export let miniarticles
</script>

          <section>
		  {#each {length: 4} as _, i}
								<div class="mini-posts">

									<!-- Mini Post -->
										<article class="mini-post">
											<header>
												<h3><a href="single.html">{miniarticles[i].name}</a></h3>
												<!-- <time class="published" datetime="2015-10-20">October 20, 2015</time>
												<a href="#" class="author"><img src="images/avatar.jpg" alt="" /></a> -->
											</header>
											<a href="single.html" class="image"><img src="images/pic04.jpg" alt="" /></a>
										</article>
										</div>
										{/each}
                </section>





  