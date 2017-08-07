import { Componet, CmpxLib, VMComponet, CmpxEvent, VMWatch, Browser, Bind, VMAttr, VMBind, VMEvent, VMManager, IVMContext } from 'cmpx';
export * from 'cmpx'

export abstract class ActionResult {
    readonly $location: ActionLocation;
    abstract onLayout(cb): void;
}

export class AsyncResult extends ActionResult {

    constructor(private callback: (cb: (result: ActionResult | View) => void) => void) { super(); }

    onLayout(cb) {
        this.callback(function (result: ActionResult) {
            result.onLayout(cb);
        });
    }
}

export class ViewResult extends ActionResult {
    constructor(private componetDef: typeof View, private p?:Object) { super(); }
    onLayout(cb) {
        var cp = new this.componetDef();
        this.p && CmpxLib.extend(cp, this.p);
        cb(cp);
    }
}

export class RedirectResult extends ActionResult {

    constructor(private path: string) { super(); }

    onLayout(cb) {
        this.$location.isForward = true;
        _getActionResult(this.$location.name, this.path, this.$location.$router, cb);
    }
}

export class ContorllerResult extends ActionResult {
    constructor(private controllerDef: typeof Controller) { super(); }
    onLayout(cb) {
        cb(this.controllerDef);
    }
}

export class WebpackLoaderContorllerResult extends ActionResult {
    constructor(path: string, conctrollerName:string) { super(); }
    onLayout(cb) {
        cb(null);
    }
}

let _hashReg = /(#[^#]*)$/,
    _qsRegx = /[\?]([^#]*)(?:#[^#]*)*$/,
    _urlPartRegx = /^([^?&#]*)/;
export class ActionLocation {
    /**
     * 将query部分转成Object
     * @param url
     * @param defaultValue 
     */
    static qureyStringToObject(url: string, defaultValue?: Object): Object {
        let qs = ActionLocation.getQueryString(url);
        if (qs) {
            let objs = {},
                qList = qs.split('&'),
                itemList;
            CmpxLib.each(qList, function (item, index) {
                if (item) {
                    itemList = item.split('=');
                    objs[itemList[0]] = decodeURIComponent(itemList[1]);
                }
            });
            return defaultValue ? CmpxLib.extend({}, defaultValue, objs) : objs;
        } else
            return defaultValue || {};
    }

    /**
     * 将Object部分转成query
     * @param url
     * @param obj 
     */
    static qureyStringFromObject(url: string, obj: Object): string {
        let qsObj = CmpxLib.extend(ActionLocation.qureyStringToObject(url), obj),
            hash = ActionLocation.getHash(url);

        url = ActionLocation.getUrlPart(url);

        let t, qsList = [];
        CmpxLib.eachProp(qsObj, function (item, name) {
            t = (CmpxLib.isObject(item) || CmpxLib.isArray(item)) ? JSON.stringify(item) : item;
            qsList.push([name, '=', t ? encodeURIComponent(t) : '']);
        });
        t = qsList.length > 0 ? ('?' + qsList.join('&')) : ''
        return [url, t, hash].join('');
    }

    /**
     * 获取query项
     * @param url
     * @param name 如果空为全部query
     */
    static getQueryString(url: string, name?: string): string {
        return name ? ActionLocation.qureyStringToObject(url)[name] :
            (_qsRegx.test(url) ? RegExp.$1 : '');
    }

    /**
     * 取得hash值, 返回#hash
     * @param url 
     */
    static getHash(url: string): string {
        return _hashReg.test(url) ? RegExp.$1 : '';
    }

    //只取url部
    static getUrlPart(url: string): string {
        return _urlPartRegx.test(url) ? RegExp.$1 : '';
    }

    /**
     * query项
     * @param url 
     * @param name 
     * @param value 
     */
    static setQueryString(url: string, name: string, value: string): string {
        if (!name) return url;
        let qsObj = ActionLocation.qureyStringToObject(url);
        qsObj[name] = value ? encodeURIComponent(value) : '';
        return ActionLocation.qureyStringFromObject(url, qsObj);
    }

    static navigate(href: string, target:string, params?:any[]) {
        let router = _getRouter(target);
        router && router.navigate(href, params);
    }

    static reload(target:string) {
        let router = _getRouter(target);
        router && router.reload();
    }

    readonly $router: RouterComponet;
    hash: string;
    search: string;
    //是否跳转
    isForward = false;
    constructor(public href: string, public name?: string, router?: RouterComponet) {
        this.hash = ActionLocation.getHash(href);
        this.search = ActionLocation.getQueryString(href);
        this.$router = router;
    }

    navigate(href: string, target?:string, params?:any[]) {
        this.href = href;
        if (this.$router){
            this.$router.navigate(href, params);
        }
        else
            window.location.replace(href);
    }

    reload() {
        if (this.$router)
            this.$router.reload();
        else
            window.location.reload(true);
    }

    private _qureyParams: Object;
    qureyParams(): Object {
        return this._qureyParams || (this._qureyParams = ActionLocation.qureyStringToObject(this.href));
    }

    onNavigateBefore(cb:(err?:any)=>void){
        cb();
    }

    onNavigate(){
    }

    // private p: any;
    // params(p: any) {
    //     if (arguments.length == 0)
    //         return this.p;
    //     else
    //         this.p = p;
    // }
}

VMManager.parent = function(target:any, context:IVMContext){
    switch(context.type){
        case "Componet":
            return target.$controller;
        case "Controller":
            return target.$parent;
    }
}

export let VMView = VMComponet;

export class View extends Componet {
    static RootView:View;
    readonly $location: ActionLocation;
    readonly $parentView: View;
    readonly $controller:Controller;
    readonly $root:View;
}

/**
 * 声明按需加
 */
declare let require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void, chunckName?: string) => void;
};

// export function WebpackModuleLoader(moduleFile: any, moduleName: string, cb: any): void {
//     if (!CmpxLib.isString(moduleFile)) {
//         moduleFile(cb)
//     }

// }

//router内容
interface IRouterMap {
    [path: string]: IRouter;
}

interface IRouter {
    controller: Controller;
    propertyKey: string;
    path: string;
    action: Function;
    init: boolean;
    childs: IRouterMap;
}

let _rmPathSplit2 = /[\\\/]{2,}/g,
    _pathSplit = /\//g,
    _mergePath = function (path1, path2) {
        let path = [path1, path2].join('/').replace(_rmPathSplit2, '/');
        return CmpxLib.trim(path).replace(/\/$/, '');
    },
    _buildAction = function (controllerDef: typeof Controller, parent?:Controller, appView?:typeof View): IRouterMap {
        let routers: { [path: string]: IRouter } = {},
            actionDec = _getAtionDec(controllerDef.prototype);

        CmpxLib.eachProp(actionDec, function (item: IActionDec, n: string) {
            if (!item.controller.$parent)
                (item.controller as any).$parent = parent;
            else if (item.controller.$parent != parent)
                throw new Error('此controller已经存在');
            if (appView && !appView.prototype.$controller){
                var target:any = appView.prototype;
                _rootController = target.$controller = item.controller;
                target.$location = new ActionLocation(window.location+'', '');
            }

            routers[n] = {
                controller: item.controller,
                propertyKey: item.propertyKey,
                path: item.path,
                action: item.action,
                init: false,
                childs: null
            };
            item.index && (routers['&index'] = routers[n]);
        });

        return routers;
    },
    _getActionResult = function (name: string, path: string, routerCP: RouterComponet, cb: (view: View) => void) {

        let pathList: string[] = ActionLocation.getUrlPart(path).replace(_rmPathSplit2, '/').replace(/^\s*\//, '').split(_pathSplit),
            pathCount = pathList.length,
            maxPos = pathCount - 1,
            location = new _rootLoactionDef(path, name, routerCP);

        let fn = function (routers: IRouterMap, pathIndex: number, cb) {
            if (!routers) cb(null);

            let isEnd = (pathIndex == pathCount), //最后并找index
                path: string = isEnd ? '&index' : pathList[pathIndex],
                rItem = routers[path],
                controller = rItem.controller,
                result: ActionResult = rItem ? rItem.action.call(rItem.controller, location) : null;
            if (result) {
                (result as any).$location = location;
                result.onLayout(function (result: any) {
                    if (result) {
                        if (isEnd) {
                            initResult(result, controller);
                            cb(result);
                        } else if (CmpxLib.isClass(result, Controller)) {
                            if (rItem.init) {
                                fn(rItem.childs, pathIndex + 1, cb);
                            } else {
                                rItem.init = true;
                                rItem.childs = _buildAction(result, rItem.controller);
                                fn(rItem.childs, pathIndex + 1, cb);
                            }
                        } else {
                            //如果不是最后的path返回无效资源
                            if (maxPos == pathIndex) {
                                initResult(result, controller);
                                cb(result);
                            } else
                                cb(null);
                        }
                    } else
                        cb(null);
                });
            } else
                cb(null);
        },
        initResult = function (result: any, controller:Controller) {
            if (result instanceof View) {
                let resultV:any = result;
                resultV['$location'] = location;
                resultV['$parentView'] = routerCP && routerCP.$parent;
                resultV['$controller'] = controller;
                resultV['$root'] = _root;
            }
        };
        location.onNavigateBefore(function(err:any){
            let endFn = function(res:any){
                cb.apply(this, arguments);
                location.onNavigate();
            };
            if (err)
                endFn(null);
            else
                fn(_routerAction, 0, endFn);
        });
    };

/**
 * 每个action的内容描述
 */
interface IActionDec {
    propertyKey: string;
    path: string;
    action: Function;
    index: boolean;
    controller:Controller;
}

let _actionDecName = '__CtrlActionDecName',
    _setActionDec = function (target: any, p: IActionDec) {
        let actionDec = target[_actionDecName] || (target[_actionDecName] = {});
        actionDec[p.path] = p;
    },
    _getAtionDec = function (controller: Controller, path?: string): IActionDec {
        let actionDec = controller[_actionDecName];
        return arguments.length <= 1 ? actionDec : (actionDec[path] || actionDec[actionDec.index]);
    };

/**
 * 注入模块配置信息
 * @param config 
 */
export function VMAction(path?: string) {
    let hasPath = arguments.length > 0;
    return function (target: any, propertyKey: string) {
        hasPath || (path = propertyKey);
        _setActionDec(target, {
            path: path,
            propertyKey: propertyKey,
            action: target[propertyKey],
            index:false,
            controller:null
        });
    };
}

export interface ICtrlConfig {
    include?: any[];
    index?: string;
    location?:typeof ActionLocation;
}

/**
 * 注入模块配置信息
 * @param config 
 */
export function VMController(config?: ICtrlConfig) {
    config || (config = {});
    return function (constructor: typeof Controller) {
        let target = constructor.prototype,
            include = config.include || [];
        include = include.concat([RouterComponet, RouterLink]);

        VMManager.setConfig(target, config);
        VMManager.include(target, {
            name:'',type:'Controller',
            def:constructor
        }, include);
        config.location && VMManager.setVM(target, 'location', config.location);

        let actionDec = _getAtionDec(target),
            index = config.index || '',
            controller = new constructor();

        CmpxLib.eachProp(actionDec, function (item: IActionDec) {
            item.index = item.path == index;
            item.controller = controller;
        });
    };
}

export class Controller {
    readonly $parent:Controller;
}

let _routers = {},
    _getRouter = function (name: string): RouterComponet {
        return _routers[name];
    },
    _removeRouter = function (name: string) {
        _routers[name] = null;
    },
    /**
     * 如果routerName为空，取第一个router
     */
    _getRouterByCP = function (component: Componet, routerName?:string): RouterComponet {
        let childs = component.$children,
            router:RouterComponet;
        CmpxLib.each(childs, function(item){
            if (item instanceof RouterComponet){
                if (!routerName || item.name == routerName){
                    router = item;
                    return false;
                }
            }
        });
        return router;
    },
    _setRouter = function (name: string, router: RouterComponet) {
        _routers[name] = router;
    };

@VMComponet({
    name: 'router',
    tmpl: function (CmpxLib, Compile, componet, element, subject) {
        Compile.includeRender(function () { return this.render }, null, componet, element, true, subject, null);
    }
})
export class RouterComponet extends Componet {
    render: any;
    path: string;
    params:any[];

    @VMAttr('name')
    name: string;

    constructor() {
        super();
    }

    navigate(path: string, params?:any[]) {
        this.params = params;
        this.path = path;
        this.$update();
    }

    reload() {
        this._path += '_';
        this.navigate(this.path);
    }

    private _path: string;
    private updateRender() {
        this.setRouter();
        this.path && _getActionResult(this.name, this.path, this, (view: View) => {
            if (view){
                this.render = this.$render(view);
                this.$update();
            }
        });
    }

    private _init = false;
    private setRouter(){
        if(this._init) return;
        this._init = true;
        this.name && _setRouter(this.name, this);
    }


    @VMWatch('this.path')
    private change(path){
        this.updateRender();
    }

    onDispose() {
        this.name && _removeRouter(this.name);
        super.onDispose();
    }
}

let _routerAction: IRouterMap,
    _rootController:Controller,
    _rootLoactionDef:typeof ActionLocation,
    _root:View;
export class MvcBrowser extends Browser {
    bootFromController(controllerDef: typeof Controller, appView: typeof View) {
        //let ctrl = new controllerDef();
        //console.log(ctrl);
        _rootLoactionDef = VMManager.getVM(controllerDef.prototype, 'location');
        _routerAction = _buildAction(controllerDef, null, appView);
        //appView.prototype.$controller
        let app  = View.RootView =  _root = new appView();
        super.boot(app);
    }
}

@VMBind({ name: 'router-link' })
export class RouterLink extends Bind {
    constructor(element: HTMLElement) {
        super(element);
    }

    // onRead(){
    //     super.onRead();
    // }
    @VMAttr('router-link')
    link:string;

    @VMAttr('router-target')
    targetName:string;

    @VMEvent()
    click() {
        let routerName = this.targetName,
            router;
        if (routerName) {
            router = _getRouter(routerName);
        } else {
            router = _getRouterByCP(this.$componet);
        }
        if (router) {
            router.path = this.link;
            router.$update();
        }
    }
}