<script>
    export let Articles

    import marked from 'marked'

   export let projects
</script>

  {#each { length: 5 } as _, i}
    <article class="post">
    <header>
        <div class="title">
            <h2><a href="single.html">{projects[i].name}</a></h2>
            <!-- <p>Lorem ipsum dolor amet nullam consequat etiam feugiat</p> -->
        <!-- </div>
            <div class="meta">
            <time class="published" datetime="2015-11-01">November 1, 2015</time>
            <a href="#" class="author"><span class="name">Jane Doe</span><img src="images/avatar.jpg" alt="" /></a>
        </div>  -->
    </header>
    <a href="single.html" class="image featured">
   <iframe width="800" height="315" src="{projects[i].links.video}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    
    </a>
    <p>{@html marked(projects[i].pages[0].content.slice(0, 120) + ".......")}</p>
    <footer>
        <ul class="actions">
            <li><a href="single.html" class="button large">Continue Reading</a></li>
        </ul>
        <ul class="stats">
            <li><a href="#">General</a></li>
            <!-- <li><a href="#" class="icon solid fa-heart">28</a></li>
            <li><a href="#" class="icon solid fa-comment">128</a></li> -->
        </ul>
    </footer>
</article>
{/each}
