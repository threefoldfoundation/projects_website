<script>
   async function handleSubmit(event) {
        var body = {
				name: event.target.name.value,
                email: event.target.email.value,
                company: event.target.company.value,
                about: event.target.about.value
        }
    let response = fetch(`${window.location.origin}/join`,{
			method: 'POST',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json'}
    }
    ).then(a => alert("success"));

    }
</script>
<!-- Wrapper -->
<div id="wrapper">

  <!-- Main -->
  <div id="main">

    <!-- Post -->
    <article class="post text-center">
      <header>
        <div class="title">
          <h1>CONSCIOUS INTERNET ALLIANCE</h1>
          <p>
            <strong>
              A collective and open ecosystem of planet- and human- centric
              projects
            </strong>
          </p>
        </div>
      </header>
      <span class="image featured">
        <img src="images/pic01.png" alt="" />
      </span>

      <p class="home_tf">
        We are not meant to do anything alone. Creating a harmonic and healthy Planet requires people coming together and joining forces with a single vision of doing conscious business.
      </p>
      <p class="home_tf">
      Our world needs change! Together we can enable a new global peer-to-peer economy of human and planet centric technologies and solutions guided by universal principles.
      Everything starts with core values. From ego to love, from pyramids to equality, from marketing to transparency.
      </p>

      <p class="home_tf">We stand by
        <a href="https://www.freeflownation.org/" target="_blank">FreeFlow Nation's</a>
        vision and manifesto. If you find yourself aligning with this collective vision use the form below let us know more about you and let’s enable a better world together!
      </p>
      <div class="text-center link_wrapper my-4">
       <form on:submit|preventDefault="{handleSubmit}">
            <label for="name">Name:</label><br>
            <input type="text" id="name" name="name"><br>
            <label for="email">Email:</label><br>
            <input type="email" id="email" name="email"><br>
            <label for="company">Company:</label><br>
            <input type="company" id="company" name="company"><br>
            <label for="about">Tell us about yourself:</label><br>
            <input type="text" id="about" name="about"><br>

            <input type="submit">
            </form>
    </article>
  </div>
</div>
