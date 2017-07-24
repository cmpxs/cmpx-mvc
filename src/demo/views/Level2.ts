import { View, VMView } from '../../MVC';

@VMView({
    name:'Level2',
    tmpl:`<div>
    <div class="head1">Level2</div>
    <div class="desc1">Level2</div>
    <div class="content1">
        {{this.name}}
    </div>
</div>`
})
export class Level2 extends View {
    name = 'Level2';

    onInit(cb){
        console.log('Level2 locaction', this.$location, this.$controller, 1);
        super.onInit(cb);
    }

    onDispose(){
        console.log('dispose Level2')
        super.onDispose();
    }
    
}