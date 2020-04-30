import { writable } from 'svelte/store';

let fetched_users = [];
let fetched_projects = [];
let categories = []


async function fetch_data(){
    let response = await fetch(`${window.location.origin}/data`);
    let text = await response.text();
    let data = text;
    let obj = JSON.parse(data);
    return { projects: obj.projects, users: obj.people };
}

fetch_data().then((data)=>{
    fetched_users = data['users']
    fetched_projects = data['projects']
    users.set(fetched_users)
    projects.set(fetched_projects)
    loading.set(false)

    data['projects'].map(function(p){
        p.ecosystem.categories.forEach(function(item){
            if (! categories.includes(item)){
                categories.push(item)
            }
        })
    })
    tags.set(categories)
})

export const users = writable(fetched_users);
export const projects = writable(fetched_projects);
export let loading = writable(true)
export const tags = writable(categories)