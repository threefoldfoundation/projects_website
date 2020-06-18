<style>
  #wrapper {
    width: 100% !important;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  #wrapper .overlay {
    background: url("/images/aci-banner-big.png");
    background-size: cover;
    background-repeat: no-repeat;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    right: -40%;
  }

  #wrapper h3 {
    font-size: 1.75rem;
    line-height: 1;
    letter-spacing: 3px;
  }
  #wrapper h3 span {
    font-size: 4rem;
    letter-spacing: 1px;
    line-height: 1;
  }

  .coming_soon {
    margin-top: 2rem;
    color: #39b1a4;
    font-size: 1.5rem;
    line-height: 1;
  }

  h1 {
    font-size: 2.5rem;
  }

  input {
    margin-top: 10px;
  }

  .mail {
    color: #227b5c;
  }

  .form-text {
    display: inline-block;
  }

  small {
    line-height: 1.1;
  }

  button {
    width: 120px !important;
  }
</style>

<div id="wrapper">
  <div class="overlay" />
  <!-- Main -->
  <div id="main">
    <div class="container">
      <div class="row">
        <div class="col-sm-5">
          <h3>
            The Alliance for a
            <span class="h1 font-weight-bold text-capitalize">
              Conscious internet
            </span>
          </h3>
        </div>
      </div>

      <div class="row">
        <div class="col-sm-4">
          <p class="coming_soon text-capitalize my-5">
            A collective and open ecosystem of planet and human centric projects
            forming a new internet
          </p>
        </div>
      </div>
      <form class="form-inline mb-0">
        <div class="form-group ml-0 mb-2 mr-2">
          <label for="inputPassword2" class="sr-only">Password</label>
          <input
            type="password"
            class="form-control"
            id="inputPassword2"
            aria-describedby="passwordHelpBlock"
            placeholder="Enter secret code" />
        </div>
        
      </form>
      <small id="passwordHelpBlock" class="form-text text-muted">
        If you don't have your secret code yet
        <br />
        please contact
        <a class="mail" href="mailto:info@threefold.io">info@threefold.io</a>
      </small>
    </div>
  </div>
</div>
