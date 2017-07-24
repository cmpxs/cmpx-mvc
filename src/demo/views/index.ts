import { View, VMView } from '../../MVC';

@VMView({
    name:'test1',
    tmpl:`<div>
    <div class="head1">index</div>
    <div class="desc1">index</div>
    <div class="content1">
        {{this.name}}
    </div>
</div>`
})
export class Index extends View {
    name = 'index';

    onDispose(){
        console.log('dispose test1')
        super.onDispose();
    }
}