import { writable } from 'svelte/store';

let fetched_users = [];
let fetched_projects = [];


async function fetch_data(){
    let response = await fetch(`http://127.0.0.1:3000/data`);
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
})

export const users = writable(fetched_users);
export const projects = writable(fetched_projects);