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
                                <h2>{user_data.info.name}</h2>
                                <p><strong>{user_data.info.bio}</strong></p>
                            </div>
                        </header>

                         {#if user_data.links.image_path != ""}
      <a href="#/users/{user_data.name}" class="image featured"><img height="250" src={user_data.links.image_path} alt="" /></a>
    {:else if user_data.links.video != ""}
      <iframe width="800" height="415" src={user_data.links.video} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    {:else}
      <a href="#/projects/{user_data.name}" class="image featured"><img height="250" src="images/pic01.jpg" alt="" /></a>
    {/if}
  

                        <div>{user_data.info.bio}</div>

                       
                       {#if user_data.info.companies.length > 0 }
                        cities : 

                         {#each user_data.info.companies as company }
                            <li>{company.name}</li>
                       {/each}

                       {/if}

                       {#if user_data.info.countries .length > 0}
                        countries : 

                         {#each user_data.info.countries as country }
                            <li>{country.name}</li>
                       {/each}

                       {/if}

                       {#if user_data.info.cities.length > 0 }
                        cities : 

                         {#each user_data.info.cities as city }
                            <li>{city.name}</li>
                       {/each}

                       {/if}


                         {#if user_data.links.websites.length > 0 }
                       websites:
                       {#each user_data.links.websites as link }
                            <a href="{link}">{link}</a>
                       {/each}

                       {/if}

                       {#if user_data.links.linkedin }
                        <div>
                        linkedin :<a href="{user_data.links.linkedin}">{user_data.links.linkedin}</a> 
                        </div>
                        {/if}
                    
                         {#if user_data.links.wiki }
                        <div>
                        wiki :<a href="{user_data.links.wiki}">{user_data.links.wiki}</a> 
                        </div>
                       {/if}


                   

                       {#if user_data.ecosystem.memberships.length > 0 }
                        categories

                         {#each user_data.ecosystem.memberships as membership }
                            <li>{membership}</li>
                       {/each}

                       {/if}
                    </article>

            </div>

    </div>