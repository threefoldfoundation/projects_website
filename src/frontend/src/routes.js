// import {
//     wrap
// } from '../../Router.svelte'
import Home from './routes/Home.svelte'
import Projects from './routes/Projects.svelte'
let routes
const urlParams = new URLSearchParams(window.location.search)
if (!urlParams.has('routemap')) {

    routes = {
        // Exact path
        '/home': Home,
        '/projects': Projects,

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
    routes.set('/home', Home)
    routes.set('/projects', Projects)
}
export default routes