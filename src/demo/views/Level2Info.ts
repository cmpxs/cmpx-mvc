import { View, VMView } from '../../MVC';

@VMView({
    name:'Level2Info',
    tmpl:`<div>
    <div class="head1">Level2Info</div>
    <div class="desc1">Level2Info</div>
    <div class="content1">
        {{this.name}}
    </div>
</div>`
})
export class Level2Info extends View {
    name = 'Level2Info';

    onDispose(){
        console.log('dispose Level2Info')
        super.onDispose();
    }
}