<script>
  async function handleSubmit(event) {
    var body = {
      name: event.target.name.value,
      email: event.target.email.value,
      company: event.target.company.value,
      about: event.target.about.value
    };
    let response = fetch(`${window.location.origin}/join`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    }).then(a => alert("success"));
  }
</script>

<!-- Wrapper -->
<div id="wrapper">

  <!-- Main -->
  <div id="main">

    <!-- Post -->
    <article class="container text-dark">
      <div class="row">
        <div class="col-sm-10 offset-sm-1">
          <header>
            <div class="title text-center">
              <h1 class="font-weight-bold">JOIN US</h1>
            </div>
          </header>
          <span class="image featured">
            <img src="images/join.png" alt="" />
          </span>

          <p class="home_tf">We are not meant to do anything alone.</p>
          <p class="home_tf">
            Creating a harmonious and healthy Planet requires people coming
            together and joining forces with a single vision of doing a
            conscious business.
          </p>
          <p class="home_tf">Our world needs change!</p>
          <p class="home_tf">
            Together we can enable a new global peer-to-peer economy of human
            and planet centric technologies.
          </p>
          <p class="home_tf">
            Everything starts with core values. From ego to love. From pyramids
            to equality. From marketing to transparency.
          </p>

          <p class="home_tf">
            We follow
            <a href="https://www.freeflownation.org/" target="_blank">
              FreeFlow Nation's
            </a>
            vision and manifesto. If you align with our collective vision join
            us and let’s enable a better world together!
          </p>

          <div class="text-center link_wrapper form_wrapper my-5">
            <form on:submit|preventDefault={handleSubmit}>

              <div class="firstRow">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Full Name"
                  required />
                <input
                  type="text"
                  id="company"
                  name="company"
                  placeholder="Company Name"
                  required />
              </div>
              <input
                type="text"
                id="about"
                name="about"
                placeholder="Tell us more about your project and how it serves the planet"
                required />

              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                required />

              <div class="checkDiv">
                <input
                  type="checkbox"
                  id="freeflownation"
                  name="freeflownation"
                  value="freeflownation acceptance"
                  required />
                <label for="freeflownation">
                  By continuing you agree to
                  <a href="https://www.freeflownation.org/" target="_blank">
                    <b>FreeFlow Nation</b>
                  </a>
                  values and manifesto
                </label>
              </div>

              <div class="checkDiv">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  value="terms acceptance"
                  required />
                <label for="terms">
                  By continuing you agree to our
                  <a
                    href="https://docs.google.com/document/u/1/d/e/2PACX-1vQi1xj_YnBd_NaW5BvSWwsfH0JC-1T5WWAL6QhE0SiPmcFT3GtmiiD09Z0gNookT45dHb9iSeyiNchq/pub"
                    target="_blank">
                    <b>Terms &amp; Conditions</b>
                  </a>
                  and
                  <a
                    href="https://docs.google.com/document/d/1SHLKJBdZHtGrb0p8OnfHUYsMtHPOf4sZPawpPWY8FtU/edit?usp=sharing"
                    target="_blank">
                    <b>Privacy Policy</b>
                  </a>
                </label>
              </div>

              <div class="clear-both" />

              <input type="submit" class="cta" value="Let's connect!" />
            </form>
          </div>
        </div>
      </div>

    </article>
  </div>
</div>
