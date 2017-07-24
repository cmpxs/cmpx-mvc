import { VMController, VMAction, ActionLocation, ActionResult, ViewResult, AsyncResult, ContorllerResult, Controller } from '../../MVC';
import { Level1 } from '../views/Level1';
import { Level1Info } from "../views/Level1Info";

declare let require: any;

@VMController({
    include: [Level1, Level1Info],
    index: 'index'
})
export class Level1Controller extends Controller {
    ok: any;

    @VMAction()
    index(location: ActionLocation): ActionResult {
        console.log(location);
        return new ViewResult(Level1);
    }

    @VMAction()
    info(location: ActionLocation): ActionResult {
        
        return new ViewResult(Level1Info);
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
}
