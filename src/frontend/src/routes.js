import Err403 from './routes/Err403.svelte'
import Home from './routes/Home.svelte'
import Projects from './routes/Projects.svelte'
import Users from './routes/Users.svelte'
import Search from './routes/Search.svelte'
import Join from './routes/Join.svelte'
import Council from "./routes/Council.svelte"
import ProjectDetails from './routes/ProjectDetails.svelte'
import UserDetails from './routes/UserDetails.svelte'
import Error from './routes/Error.svelte'
import * as animateScroll from "svelte-scrollto"
import {wrap} from 'svelte-spa-router'
import {password, previousPage} from "../store.js";
import {location} from 'svelte-spa-router'

let encrypted;
let page;
let prevPage;

password.subscribe(value => {encrypted = value;});
location.subscribe(value => {page = value;});
previousPage.subscribe(value => {prevPage = value;});



animateScroll.scrollToTop()

let routes

function logged_in(details){
    previousPage.set(page)
    if(encrypted != 'cc989606b586f33918fe0552dec367c8')
        window.location.href = "#/403"
    else
        return true
}

const urlParams = new URLSearchParams(window.location.search)
if (!urlParams.has('routemap')) {
    routes = {
        // Exact path
        '/': Home,
        '/projects': wrap(Projects, logged_in),
        '/projects/tags/:tagname': wrap(Projects, logged_in),
        '/people': wrap(Users, logged_in),
        '/people/tags/:tagname': wrap(Users, logged_in),
        '/projects/:name': wrap(ProjectDetails, logged_in), 
        '/people/:name': wrap(UserDetails, logged_in),
        '/search/:keyword': wrap(Search, logged_in),
        '/join': wrap(Join, logged_in),
        '/council': wrap(Council, logged_in),
        '/error': Error,
        '/403': Err403

        // // Using named parameters, with last being optional
        // '/author/:first/:last?': Author,

        // // Wildcard parameter
        // '/book/*': Book,

        // // Catch-all
        // // This is optional, but if present it must be the last
        // '*': NotFound,
    }
} else {
    routes = new Map()
    // Exact path
    routes.set('/', Home)
    routes.set('/projects', Projects)
    routes.set('/people', Users)
    routes.set( '/projects/tags/:tagname', Projects)
    routes.set( '/people/tags/:tagname', Users)
    routes.set('/projects/:name', ProjectDetails)
    routes.set('/people/:name', UserDetails)
    routes.set('/search/:keyword', Search)
    routes.set('/join', Join)
    routes.set('/council', Council)
    routes.set('/allprojects', AllProjects)
    routes.set('/error', Error)
    routes.set('/403', Err403)
}
export default routes


