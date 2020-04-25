<script>
    export let Articles

    import marked from 'marked'

   export let projects
</script>

  
{#each projects as project}
    <article class="post">
    <header>
        <div class="title">
            <h2><a href="single.html">{project.name}</a></h2>
            <!-- <p>Lorem ipsum dolor amet nullam consequat etiam feugiat</p> -->
        </div>
        <div class="meta">
            <time class="published" datetime="2015-11-01">November 1, 2015</time>
            <a href="#" class="author"><span class="name">Jane Doe</span><img src="images/avatar.jpg" alt="" /></a>
        </div>
    </header>
    <!-- <a href="single.html" class="image featured"><img src="images/pic01.jpg" alt="" /></a> -->
    <p>{@html marked(project.pages[0].content)}</p>
    <footer>
        <ul class="actions">
            <li><a href="single.html" class="button large">Continue Reading</a></li>
        </ul>
        <ul class="stats">
            <li><a href="#">General</a></li>
            <li><a href="#" class="icon solid fa-heart">28</a></li>
            <li><a href="#" class="icon solid fa-comment">128</a></li>
        </ul>
    </footer>
</article>
{/each}
