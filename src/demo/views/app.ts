
import { View, VMView } from '../../MVC';

@VMView({
    name:'app',
    include:[],
    tmpl:`<div class="app">
    <div>{{this.name}}</div>
    <div class="head">
        <a href="javascript:void(0)" router-link="/index">首页</a>
        <a href="javascript:void(0)" router-link="/test">test</a>
        <a href="javascript:void(0)" router-link="/level1?aaa=1&bbb=222#asdfasd/adsf" router-target="main">level1</a>
        <a href="javascript:void(0)" router-link="{{: this.level2}}" router-target="main">level2</a>
        <a href="javascript:void(0)" router-link="/level2/info">level2Info</a>
    </div>
    <div class="content">
        <router path="/level1" name="main" params="{{this.name}}" />
    </div>
</div>`,
    style:`
        .app .head {
            margin: 5px 10px;
            font-size: 18px;
        }
        .app .head a {
            margin-right: 10px;
        }
        .app .content {
            border: solid 1px;
            padding: 6px;
        }
        .app .content .row {margin: 3px 3px;}
        .app .content .text {
            margin-right: 10px;
            width: 120px;
            text-align: right;
            display: inline-block;
            vertical-align: top;
        }
        .app .content .input {}

        .app .head1 {
            font-weight: bold;
            margin: 8px 5px;
        }
        .app .desc1 {
            margin: 6px 25px;
            font-size: 14px
        }
        .app .toolbar1 {
            margin: 5px 5px;
        }
        .app .content1 {
            margin: 5px 10px 30px 10px;
        }
    `
})
export default class App extends View {
    name = "app demo"

    constructor(){
        super();
    }

    level2:string = '/level2';

    onInit(cb){
        super.onInit(cb);
    }


}