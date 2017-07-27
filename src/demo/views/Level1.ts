import { View, VMView } from '../../MVC';

@VMView({
    name:'Level1',
    tmplUrl:`Level1.html`
})
export class Level1 extends View {
    name = 'Level1';

    onDispose(){
        console.log('dispose Level1')
        super.onDispose();
    }
}