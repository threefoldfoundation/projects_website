<script>
import {password, previousPage} from "../../store.js";
import * as animateScroll from "svelte-scrollto";
animateScroll.scrollToTop();
import {Md5} from "md5-typescript";



let encrypted;
let prevPage;

previousPage.subscribe(value => {prevPage = value;});
password.subscribe(value => {encrypted = value;});

$: psswd = ''
$: {
  encrypted = Md5.init(psswd)
  console.log(psswd)
  console.log(encrypted);
  console.log(prevPage)
  if(encrypted == 'cc989606b586f33918fe0552dec367c8'){
    password.set(encrypted)
    window.location.href = "#" + prevPage

  }
}

</script>

<!-- Wrapper -->
<div id="wrapper">
  <div id="main">
    <!-- begin:: Page -->
    <div class="kt-grid kt-grid--ver kt-grid--root text-center">
      <div class="kt-grid__item kt-grid__item--fluid kt-grid kt-error-v1">
        <div class="kt-error-v1__container">
          <h1 class="kt-error-v1__number">403</h1>
          <p class="kt-error-v1__desc">OOPS! Please provide password to continue</p>
          <form>
          <label>Password</label>
          <input type="password"  bind:value={psswd}/>
          </form>
        </div>
      </div>
    </div>

    <!-- end:: Page -->
  </div>

</div>
