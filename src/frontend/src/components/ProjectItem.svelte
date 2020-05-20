<script>
  export let item;
</script>

<article class="post search_result">
  <header>
    <div class="title">
        <h3>{item.name}</h3>
        <a class="author text-uppercase" href="#/projects/{item.name}">
        <img src={item.links.image_path} alt="" />       
      </a>
        <div>{item.info.description.split(" ").slice(0, 20).join(" ")}</div>
        <a href="#/projects/{item.name}">...</a>
    </div>
  </header>
</article>
