//import { Browser } from "cmpx";
import { MvcBrowser } from './MVC';
import { AppController } from './demo/controllers/appController';
import App from "./demo/views/app";

console.time('boot');
//new Browser().boot(AppComponet);
new MvcBrowser().bootFromController(AppController, App);
console.timeEnd('boot');

