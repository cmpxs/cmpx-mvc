import { VMController, VMAction, ActionLocation, ActionResult, ViewResult, AsyncResult, ContorllerResult, Controller } from '../../MVC';
import { Level2 } from '../views/Level2';
import { Level2Info } from '../views/Level2Info';

declare let require: any;

@VMController({
    include: [Level2, Level2Info],
    index: 'index'
})
export class Level2Controller extends Controller {
    ok: any;

    @VMAction()
    index(location: ActionLocation): ActionResult {
        
        return new ViewResult(Level2);
    }

    @VMAction()
    info(location: ActionLocation): ActionResult {
        
        return new ViewResult(Level2Info);
    }

}
