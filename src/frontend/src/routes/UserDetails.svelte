<script>
    import { users } from '../../store.js'

    console.log($users)
    const url = window.location.href
    let current_user = url.substring(url.lastIndexOf('/')+1);
    let user_data = $users.find(user => user['name'] == current_user )
    
    // user_data is all data to render

</script>

<!-- Wrapper -->
    <div id="wrapper">
    
        <div id="main">

                <!-- Post -->
                    <article class="post">
                        <header>
                            <div class="title">
                                <h2>{user_data['name']}</h2>
                                <p><strong>A collective and open ecosystem of planet- and human- centric projects</strong></p>
                            </div>
                        </header>
                        <span class="image featured"><img src="images/pic01.png" alt="" /></span>
                        <p>We are the Threefold Network, and have built a new peer-to-peer internet that empowers equality, freedom and sustainability. As we launch the ThreeFold Grid and many other experiences on top, the time has come for us to make our world peer-to-peer.</p>
                        <p>As of the 29th of April 2020, the ThreeFold Network will enter a rolling launch with many exciting announcements for the world. This will start with the announcement of our Grid 2.0 upgrade and the availability of the ThreeFold Token on Stellar Exchange.</p>
        <p>The time has come to start building our peer-to-peer world together, and it goes without saying that a collective and equal approach is needed. Many beautiful projects have joined the Planet First Ecosystem, and together we aim to empower a better future for humanity and our planet.</p>
        <p>If not us, who? If not now, when?</p>
                        <p>Interested to learn more? Explore the first projects living on the ThreeFold Network</p>
                        <!-- <footer>
                            <ul class="stats">
                                <li><a href="#">General</a></li>
                                <li><a href="#" class="icon solid fa-heart">28</a></li>
                                <li><a href="#" class="icon solid fa-comment">128</a></li>
                            </ul>
                        </footer> -->
                    </article>

            </div>

    </div>