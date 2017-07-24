import { VMController, VMAction, ActionLocation, ActionResult, ViewResult, AsyncResult, ContorllerResult, Controller, RedirectResult, WebpackLoaderContorllerResult } from '../../MVC';
import { Index } from '../views/index';

declare let require: any;

class MyLocation extends ActionLocation{

    onNavigateBefore(cb){
        super.onNavigateBefore(cb);
    }

    onNavigate(){
        //console.log('location', this.isForward, this.href);
        
        super.onNavigate();
    }
}

@VMController({
    include: [Index],
    index: 'index',
    location:MyLocation
})
export class AppController extends Controller {
    ok: any;

    @VMAction()
    index(location: ActionLocation): ActionResult {
        
        return new ViewResult(Index);
    }

    @VMAction()
    level1(location: ActionLocation): ActionResult {

        return new WebpackLoaderContorllerResult('./Level1Controller', 'Level1Controller');

    }

    @VMAction()
    level2(location: ActionLocation): ActionResult {
        return new AsyncResult(function (cb) {
            require.ensure([], function () {
                let controller = require('./Level2Controller')['Level2Controller'];
                cb(new ContorllerResult(controller));
            });
        });
    }
    
    @VMAction()
    test(location: ActionLocation): ActionResult {
        
        return new RedirectResult('/level2/info');
    }

}
