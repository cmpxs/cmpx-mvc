import { View, VMView } from '../../MVC';

@VMView({
    name:'Level1Info',
    tmpl:`<div>
    <div class="head1">Level1Info</div>
    <div class="desc1">Level1Info</div>
    <div class="content1">
        {{this.name}}
    </div>
</div>`
})
export class Level1Info extends View {
    name = 'Level1Info';

    onDispose(){
        console.log('dispose Level2Info')
        super.onDispose();
    }
}