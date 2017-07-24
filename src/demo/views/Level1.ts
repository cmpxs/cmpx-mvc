import { View, VMView } from '../../MVC';

@VMView({
    name:'Level1',
    tmpl:`<div>
    <div class="head1">Level1</div>
    <div class="desc1">Level1</div>
    <div class="content1">
        {{this.name}}
    </div>
</div>`
})
export class Level1 extends View {
    name = 'Level1';

    onDispose(){
        console.log('dispose Level1')
        super.onDispose();
    }
}