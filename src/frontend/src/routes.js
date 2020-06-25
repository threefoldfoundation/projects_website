import Err403 from './routes/Err403.svelte'
import Projects from './routes/Projects.svelte'
import Home from './routes/Home.svelte'
import Users from './routes/Users.svelte'
import Search from './routes/Search.svelte'
import Join from './routes/Join.svelte'
import Council from "./routes/Council.svelte"
import ProjectDetails from './routes/ProjectDetails.svelte'
import UserDetails from './routes/UserDetails.svelte'
import Error from './routes/Error.svelte'
import * as animateScroll from "svelte-scrollto"



animateScroll.scrollToTop()

let routes

const urlParams = new URLSearchParams(window.location.search)
if (!urlParams.has('routemap')) {
    routes = {
        // Exact path
        '/': Home,
        '/projects': Projects,
        '/projects/tags/:tagname': Projects,
        '/people': Users,
        '/people/tags/:tagname': Users,
        '/projects/:name': ProjectDetails,
        '/people/:name': UserDetails,
        '/search/:keyword': Search,
        '/join': Join,
        '/council': Council,
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
    routes.set('/projects/tags/:tagname', Projects)
    routes.set('/people/tags/:tagname', Users)
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
