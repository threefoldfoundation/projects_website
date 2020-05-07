<script>
  import marked from "marked";
  export let item;
  console.log(item);
</script>

<article class="post search_result">
  <header>
    <div class="title">
      <h2>
        <a class="author text-uppercase" href="#/projects/{item.name}">
          <img src={item.links.image_path} alt="" />
          {item.name}
        </a>
      </h2>
    </div>
  </header>
</article>
