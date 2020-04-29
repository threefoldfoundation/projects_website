<script>
    import { projects } from '../../store.js'

    const url = window.location.href
    let current_project = url.substring(url.lastIndexOf('/')+1);
    let project_data = $projects.find(project => project['name'] == current_project )
    
    // project_data is all data to render

</script>

<!-- Wrapper -->
    <div id="wrapper">
         <div id="main">

                <!-- Post -->
                    <article class="post">
                        <header>
                            <div class="title">
                                <h2>{project_data['name']}</h2>
                                <p><strong>A collective and open ecosystem of planet- and human- centric projects</strong></p>
                            </div>
                        </header>
                        {#if project_data.links.image_path != ""}
      <a href="#/project_data/{project_data.name}" class="image featured"><img height="250" src={project_data.links.image_path} alt="" /></a>
    {:else if project_data.links.video != ""}
      <iframe width="800" height="415" src={project_data.links.video} frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    {:else}
      <a href="#/project_data/{project_data.name}" class="image featured"><img height="250" src="images/pic01.jpg" alt="" /></a>
    {/if}
  
                       
                        {#if project_data.info.mission }
                        mission : 
                            <div>{project_data.info.mission}</div>
                       {/if}

                       {#if project_data.info.description }
                        description : 
                            <div>{project_data.info.description}</div>
                       {/if}

                        {#if project_data.info.team.length>0 }
                        team : 

                         {#each project_data.info.team as person }
                            <li>{person}</li>
                       {/each}
                       {/if}


                       
                        {#if project_data.milestones.length>0 }
                        milestons : 

                         {#each project_data.milestones as milestone }
                            name:<li>{milestone.name}</li>
                            date: <li>{milestone.date}</li>
                              description: <li>{milestone.description}</li>
                             funding require in tft  <li>{milestone.funding_required_tft}</li>
                             funding required in usd  <li>{milestone.funding_required_usd}</li>
                       {/each}

                       {/if}

                       {#if project_data.info.countries .length > 0}
                        countries : 

                         {#each project_data.info.countries as country }
                            <li>{country.name}</li>
                       {/each}

                       {/if}

                       {#if project_data.info.cities.length > 0 }
                        cities : 

                         {#each project_data.info.cities as city }
                            <li>{city.name}</li>
                       {/each}

                       {/if}


                         {#if project_data.links.websites.length > 0 }
                       websites:
                       {#each project_data.links.websites as link }
                            <a href="{link}">{link}</a>
                       {/each}

                       {/if}

                       {#if project_data.links.linkedin }
                        <div>
                        linkedin :<a href="{project_data.links.linkedin}">{project_data.links.linkedin}</a> 
                        </div>
                        {/if}
                    
                         {#if project_data.links.wiki }
                        <div>
                        wiki :<a href="{project_data.links.wiki}">{project_data.links.wiki}</a> 
                        </div>
                       {/if}


                    {#if project_data.ecosystem.badges.length > 0 }
                        badges

                         {#each project_data.ecosystem.badges as badge }
                            <li>{badge}</li>
                       {/each}

                       {/if}


                       {#if project_data.ecosystem.categories.length > 0 }
                        categories

                         {#each project_data.ecosystem.categories as category }
                            <li>{category}</li>
                       {/each}

                       {/if}
                       
                    </article>

            </div>

    </div>