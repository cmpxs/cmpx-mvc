var build = require('cmpx-build');

var path = require('path'),
    fs = require('fs');

//cmpx-loader
var cmpx = require('cmpx'),
    CompileRender = cmpx.CompileRender;

var _tmplRegex = /\s*@VMView\s*\((?:\n|\r|\s)*\{(?:\n|\r|.)*?tmpl\s*\:\s*(([`])[^`]*?\2)/gmi,
    _tmplRegex2 = /\s*@VMView\s*\((?:\n|\r|\s)*\{(?:\n|\r|.)*?tmpl\s*\:\s*((["']).*\2)/gmi,
    _tmplUrlRegex = /\s*@VMView\s*\((?:\n|\r|\s)*\{(?:\n|\r|.)*?tmplUrl\s*\:\s*((["']).*\2)/gmi,
    _styleUrlRegex = /\s*@VMView\s*\((?:\n|\r|\s)*\{(?:\n|\r|.)*?styleUrl\s*\:\s*((["']).*\2)/gmi,
    _webPackCtrlRegex = /new +WebpackLoaderContorllerResult\s*\(\s*(['"`])([^'"`]*)\1[^,]*\,[^'"`]*(['"`])([^'"`]*)\3\)/gmi;

var _buildRegex = /##%(tmpl|tmplUrl|styleUrl|\$render)%\$\-\[([^\]]*?)\]/gmi;

var _buildTmpl = function (tmpl) {

    return build.buildTmpl(tmpl);

}, _escapeTmpl = function (name, content) {

    return ['##%', name, "%$-[", encodeURIComponent(content), ']'].join('');

}, _escapeVM = function (resourcePath, source, encoding) {
    let files = [];
    encoding || (encoding = 'utf-8');
    if (_webPackCtrlRegex.test(source)){
        source = source.replace(_webPackCtrlRegex, function (find, split, path, split1, name) {
            return `new AsyncResult(function (cb) {
                require.ensure([], function () {
                    let controller = require('${path}')['${name}'];
                    cb(new ContorllerResult(controller));
                });
            })`;
        });
    }
    if (_tmplRegex.test(source)) {
        source = source.replace(_tmplRegex, function (find, tmpl, split) {
            find = find.replace(tmpl, _escapeTmpl('tmpl', tmpl.substr(1, tmpl.length - 2)));
            return find;
        });
    }
    if (_tmplRegex2.test(source)) {
        source = source.replace(_tmplRegex2, function (find, tmpl, split) {
            find = find.replace(tmpl, _escapeTmpl('tmpl', tmpl.substr(1, tmpl.length - 2)));
            return find;
        });
    }
    if (_tmplUrlRegex.test(source)) {
        source = source.replace(_tmplUrlRegex, (find, tmpl, split) => {
            let filePath = tmpl.substr(1, tmpl.length - 2);
            filePath = path.join(path.dirname(resourcePath), filePath);
            files.push(filePath);
            let fileContent = fs.readFileSync(filePath, encoding);
            find = find.replace(tmpl, _escapeTmpl('tmplUrl', fileContent));
            return find;
        });
    }
    if (_styleUrlRegex.test(source)) {
        source = source.replace(_styleUrlRegex, (find, tmpl, split) => {
            let filePath = tmpl.substr(1, tmpl.length - 2);
            filePath = path.join(path.dirname(resourcePath), filePath);
            files.push(filePath);
            let fileContent = fs.readFileSync(filePath, encoding);
            find = find.replace(tmpl, _escapeTmpl('styleUrl', fileContent));
            return find;
        });
    }
    return { vmSource: source, vmFiles: files };

}, _buildTypeScript = function (resourcePath, source, encoding) {
    let { content, files } = build.buildTypeScript(resourcePath, source, encoding);

    let { vmSource, vmFiles } = _escapeVM(resourcePath, content, encoding);
    vmFiles = files.concat(vmFiles);

    if (_buildRegex.test(vmSource)) {
        vmSource = vmSource.replace(_buildRegex, function (find, type, content) {
            content = decodeURIComponent(content);
            switch (type) {
                case 'tmpl':
                case 'tmplUrl':
                    return _buildTmpl(content);
                case 'styleUrl':
                    return 'function() { return `' + content + '`; }'
            }
        });
    }

    return { content: vmSource, files: vmFiles };
};

module.exports = {
    buildTmpl: _buildTmpl,
    buildTypeScript: _buildTypeScript
};
