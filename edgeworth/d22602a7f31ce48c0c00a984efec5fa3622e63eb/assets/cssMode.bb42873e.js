import{m as De}from"./index.3145d8e0.js";import"./vendor.b9e365d2.js";/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.31.1(337587859b1c171314b40503171188b6cea6a32a)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/var Me=Object.defineProperty,Le=Object.getOwnPropertyDescriptor,Se=Object.getOwnPropertyNames,je=Object.prototype.hasOwnProperty,Fe=t=>Me(t,"__esModule",{value:!0}),Ne=(t,n,i)=>{if(n&&typeof n=="object"||typeof n=="function")for(let r of Se(n))!je.call(t,r)&&r!=="default"&&Me(t,r,{get:()=>n[r],enumerable:!(i=Le(n,r))||i.enumerable});return t},c={};Fe(c);Ne(c,De);var We=2*60*1e3,Ue=class{constructor(t){this._defaults=t,this._worker=null,this._client=null,this._idleCheckInterval=window.setInterval(()=>this._checkIfIdle(),30*1e3),this._lastUsedTime=0,this._configChangeListener=this._defaults.onDidChange(()=>this._stopWorker())}_stopWorker(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null}dispose(){clearInterval(this._idleCheckInterval),this._configChangeListener.dispose(),this._stopWorker()}_checkIfIdle(){if(!this._worker)return;Date.now()-this._lastUsedTime>We&&this._stopWorker()}_getClient(){return this._lastUsedTime=Date.now(),this._client||(this._worker=c.editor.createWebWorker({moduleId:"vs/language/css/cssWorker",label:this._defaults.languageId,createData:{options:this._defaults.options,languageId:this._defaults.languageId}}),this._client=this._worker.getProxy()),this._client}getLanguageServiceWorker(...t){let n;return this._getClient().then(i=>{n=i}).then(i=>{if(this._worker)return this._worker.withSyncedResources(t)}).then(i=>n)}},J;(function(t){t.MIN_VALUE=-2147483648,t.MAX_VALUE=2147483647})(J||(J={}));var N;(function(t){t.MIN_VALUE=0,t.MAX_VALUE=2147483647})(N||(N={}));var k;(function(t){function n(r,e){return r===Number.MAX_VALUE&&(r=N.MAX_VALUE),e===Number.MAX_VALUE&&(e=N.MAX_VALUE),{line:r,character:e}}t.create=n;function i(r){var e=r;return o.objectLiteral(e)&&o.uinteger(e.line)&&o.uinteger(e.character)}t.is=i})(k||(k={}));var p;(function(t){function n(r,e,a,s){if(o.uinteger(r)&&o.uinteger(e)&&o.uinteger(a)&&o.uinteger(s))return{start:k.create(r,e),end:k.create(a,s)};if(k.is(r)&&k.is(e))return{start:r,end:e};throw new Error("Range#create called with invalid arguments["+r+", "+e+", "+a+", "+s+"]")}t.create=n;function i(r){var e=r;return o.objectLiteral(e)&&k.is(e.start)&&k.is(e.end)}t.is=i})(p||(p={}));var H;(function(t){function n(r,e){return{uri:r,range:e}}t.create=n;function i(r){var e=r;return o.defined(e)&&p.is(e.range)&&(o.string(e.uri)||o.undefined(e.uri))}t.is=i})(H||(H={}));var Y;(function(t){function n(r,e,a,s){return{targetUri:r,targetRange:e,targetSelectionRange:a,originSelectionRange:s}}t.create=n;function i(r){var e=r;return o.defined(e)&&p.is(e.targetRange)&&o.string(e.targetUri)&&(p.is(e.targetSelectionRange)||o.undefined(e.targetSelectionRange))&&(p.is(e.originSelectionRange)||o.undefined(e.originSelectionRange))}t.is=i})(Y||(Y={}));var z;(function(t){function n(r,e,a,s){return{red:r,green:e,blue:a,alpha:s}}t.create=n;function i(r){var e=r;return o.numberRange(e.red,0,1)&&o.numberRange(e.green,0,1)&&o.numberRange(e.blue,0,1)&&o.numberRange(e.alpha,0,1)}t.is=i})(z||(z={}));var Z;(function(t){function n(r,e){return{range:r,color:e}}t.create=n;function i(r){var e=r;return p.is(e.range)&&z.is(e.color)}t.is=i})(Z||(Z={}));var K;(function(t){function n(r,e,a){return{label:r,textEdit:e,additionalTextEdits:a}}t.create=n;function i(r){var e=r;return o.string(e.label)&&(o.undefined(e.textEdit)||x.is(e))&&(o.undefined(e.additionalTextEdits)||o.typedArray(e.additionalTextEdits,x.is))}t.is=i})(K||(K={}));var R;(function(t){t.Comment="comment",t.Imports="imports",t.Region="region"})(R||(R={}));var ee;(function(t){function n(r,e,a,s,u){var g={startLine:r,endLine:e};return o.defined(a)&&(g.startCharacter=a),o.defined(s)&&(g.endCharacter=s),o.defined(u)&&(g.kind=u),g}t.create=n;function i(r){var e=r;return o.uinteger(e.startLine)&&o.uinteger(e.startLine)&&(o.undefined(e.startCharacter)||o.uinteger(e.startCharacter))&&(o.undefined(e.endCharacter)||o.uinteger(e.endCharacter))&&(o.undefined(e.kind)||o.string(e.kind))}t.is=i})(ee||(ee={}));var X;(function(t){function n(r,e){return{location:r,message:e}}t.create=n;function i(r){var e=r;return o.defined(e)&&H.is(e.location)&&o.string(e.message)}t.is=i})(X||(X={}));var y;(function(t){t.Error=1,t.Warning=2,t.Information=3,t.Hint=4})(y||(y={}));var te;(function(t){t.Unnecessary=1,t.Deprecated=2})(te||(te={}));var re;(function(t){function n(i){var r=i;return r!=null&&o.string(r.href)}t.is=n})(re||(re={}));var W;(function(t){function n(r,e,a,s,u,g){var d={range:r,message:e};return o.defined(a)&&(d.severity=a),o.defined(s)&&(d.code=s),o.defined(u)&&(d.source=u),o.defined(g)&&(d.relatedInformation=g),d}t.create=n;function i(r){var e,a=r;return o.defined(a)&&p.is(a.range)&&o.string(a.message)&&(o.number(a.severity)||o.undefined(a.severity))&&(o.integer(a.code)||o.string(a.code)||o.undefined(a.code))&&(o.undefined(a.codeDescription)||o.string((e=a.codeDescription)===null||e===void 0?void 0:e.href))&&(o.string(a.source)||o.undefined(a.source))&&(o.undefined(a.relatedInformation)||o.typedArray(a.relatedInformation,X.is))}t.is=i})(W||(W={}));var P;(function(t){function n(r,e){for(var a=[],s=2;s<arguments.length;s++)a[s-2]=arguments[s];var u={title:r,command:e};return o.defined(a)&&a.length>0&&(u.arguments=a),u}t.create=n;function i(r){var e=r;return o.defined(e)&&o.string(e.title)&&o.string(e.command)}t.is=i})(P||(P={}));var x;(function(t){function n(a,s){return{range:a,newText:s}}t.replace=n;function i(a,s){return{range:{start:a,end:a},newText:s}}t.insert=i;function r(a){return{range:a,newText:""}}t.del=r;function e(a){var s=a;return o.objectLiteral(s)&&o.string(s.newText)&&p.is(s.range)}t.is=e})(x||(x={}));var I;(function(t){function n(r,e,a){var s={label:r};return e!==void 0&&(s.needsConfirmation=e),a!==void 0&&(s.description=a),s}t.create=n;function i(r){var e=r;return e!==void 0&&o.objectLiteral(e)&&o.string(e.label)&&(o.boolean(e.needsConfirmation)||e.needsConfirmation===void 0)&&(o.string(e.description)||e.description===void 0)}t.is=i})(I||(I={}));var _;(function(t){function n(i){var r=i;return typeof r=="string"}t.is=n})(_||(_={}));var E;(function(t){function n(a,s,u){return{range:a,newText:s,annotationId:u}}t.replace=n;function i(a,s,u){return{range:{start:a,end:a},newText:s,annotationId:u}}t.insert=i;function r(a,s){return{range:a,newText:"",annotationId:s}}t.del=r;function e(a){var s=a;return x.is(s)&&(I.is(s.annotationId)||_.is(s.annotationId))}t.is=e})(E||(E={}));var U;(function(t){function n(r,e){return{textDocument:r,edits:e}}t.create=n;function i(r){var e=r;return o.defined(e)&&V.is(e.textDocument)&&Array.isArray(e.edits)}t.is=i})(U||(U={}));var T;(function(t){function n(r,e,a){var s={kind:"create",uri:r};return e!==void 0&&(e.overwrite!==void 0||e.ignoreIfExists!==void 0)&&(s.options=e),a!==void 0&&(s.annotationId=a),s}t.create=n;function i(r){var e=r;return e&&e.kind==="create"&&o.string(e.uri)&&(e.options===void 0||(e.options.overwrite===void 0||o.boolean(e.options.overwrite))&&(e.options.ignoreIfExists===void 0||o.boolean(e.options.ignoreIfExists)))&&(e.annotationId===void 0||_.is(e.annotationId))}t.is=i})(T||(T={}));var D;(function(t){function n(r,e,a,s){var u={kind:"rename",oldUri:r,newUri:e};return a!==void 0&&(a.overwrite!==void 0||a.ignoreIfExists!==void 0)&&(u.options=a),s!==void 0&&(u.annotationId=s),u}t.create=n;function i(r){var e=r;return e&&e.kind==="rename"&&o.string(e.oldUri)&&o.string(e.newUri)&&(e.options===void 0||(e.options.overwrite===void 0||o.boolean(e.options.overwrite))&&(e.options.ignoreIfExists===void 0||o.boolean(e.options.ignoreIfExists)))&&(e.annotationId===void 0||_.is(e.annotationId))}t.is=i})(D||(D={}));var L;(function(t){function n(r,e,a){var s={kind:"delete",uri:r};return e!==void 0&&(e.recursive!==void 0||e.ignoreIfNotExists!==void 0)&&(s.options=e),a!==void 0&&(s.annotationId=a),s}t.create=n;function i(r){var e=r;return e&&e.kind==="delete"&&o.string(e.uri)&&(e.options===void 0||(e.options.recursive===void 0||o.boolean(e.options.recursive))&&(e.options.ignoreIfNotExists===void 0||o.boolean(e.options.ignoreIfNotExists)))&&(e.annotationId===void 0||_.is(e.annotationId))}t.is=i})(L||(L={}));var B;(function(t){function n(i){var r=i;return r&&(r.changes!==void 0||r.documentChanges!==void 0)&&(r.documentChanges===void 0||r.documentChanges.every(function(e){return o.string(e.kind)?T.is(e)||D.is(e)||L.is(e):U.is(e)}))}t.is=n})(B||(B={}));var F=function(){function t(n,i){this.edits=n,this.changeAnnotations=i}return t.prototype.insert=function(n,i,r){var e,a;if(r===void 0?e=x.insert(n,i):_.is(r)?(a=r,e=E.insert(n,i,r)):(this.assertChangeAnnotations(this.changeAnnotations),a=this.changeAnnotations.manage(r),e=E.insert(n,i,a)),this.edits.push(e),a!==void 0)return a},t.prototype.replace=function(n,i,r){var e,a;if(r===void 0?e=x.replace(n,i):_.is(r)?(a=r,e=E.replace(n,i,r)):(this.assertChangeAnnotations(this.changeAnnotations),a=this.changeAnnotations.manage(r),e=E.replace(n,i,a)),this.edits.push(e),a!==void 0)return a},t.prototype.delete=function(n,i){var r,e;if(i===void 0?r=x.del(n):_.is(i)?(e=i,r=E.del(n,i)):(this.assertChangeAnnotations(this.changeAnnotations),e=this.changeAnnotations.manage(i),r=E.del(n,e)),this.edits.push(r),e!==void 0)return e},t.prototype.add=function(n){this.edits.push(n)},t.prototype.all=function(){return this.edits},t.prototype.clear=function(){this.edits.splice(0,this.edits.length)},t.prototype.assertChangeAnnotations=function(n){if(n===void 0)throw new Error("Text edit change is not configured to manage change annotations.")},t}(),ne=function(){function t(n){this._annotations=n===void 0?Object.create(null):n,this._counter=0,this._size=0}return t.prototype.all=function(){return this._annotations},Object.defineProperty(t.prototype,"size",{get:function(){return this._size},enumerable:!1,configurable:!0}),t.prototype.manage=function(n,i){var r;if(_.is(n)?r=n:(r=this.nextId(),i=n),this._annotations[r]!==void 0)throw new Error("Id "+r+" is already in use.");if(i===void 0)throw new Error("No annotation provided for id "+r);return this._annotations[r]=i,this._size++,r},t.prototype.nextId=function(){return this._counter++,this._counter.toString()},t}();(function(){function t(n){var i=this;this._textEditChanges=Object.create(null),n!==void 0?(this._workspaceEdit=n,n.documentChanges?(this._changeAnnotations=new ne(n.changeAnnotations),n.changeAnnotations=this._changeAnnotations.all(),n.documentChanges.forEach(function(r){if(U.is(r)){var e=new F(r.edits,i._changeAnnotations);i._textEditChanges[r.textDocument.uri]=e}})):n.changes&&Object.keys(n.changes).forEach(function(r){var e=new F(n.changes[r]);i._textEditChanges[r]=e})):this._workspaceEdit={}}return Object.defineProperty(t.prototype,"edit",{get:function(){return this.initDocumentChanges(),this._changeAnnotations!==void 0&&(this._changeAnnotations.size===0?this._workspaceEdit.changeAnnotations=void 0:this._workspaceEdit.changeAnnotations=this._changeAnnotations.all()),this._workspaceEdit},enumerable:!1,configurable:!0}),t.prototype.getTextEditChange=function(n){if(V.is(n)){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var i={uri:n.uri,version:n.version},r=this._textEditChanges[i.uri];if(!r){var e=[],a={textDocument:i,edits:e};this._workspaceEdit.documentChanges.push(a),r=new F(e,this._changeAnnotations),this._textEditChanges[i.uri]=r}return r}else{if(this.initChanges(),this._workspaceEdit.changes===void 0)throw new Error("Workspace edit is not configured for normal text edit changes.");var r=this._textEditChanges[n];if(!r){var e=[];this._workspaceEdit.changes[n]=e,r=new F(e),this._textEditChanges[n]=r}return r}},t.prototype.initDocumentChanges=function(){this._workspaceEdit.documentChanges===void 0&&this._workspaceEdit.changes===void 0&&(this._changeAnnotations=new ne,this._workspaceEdit.documentChanges=[],this._workspaceEdit.changeAnnotations=this._changeAnnotations.all())},t.prototype.initChanges=function(){this._workspaceEdit.documentChanges===void 0&&this._workspaceEdit.changes===void 0&&(this._workspaceEdit.changes=Object.create(null))},t.prototype.createFile=function(n,i,r){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var e;I.is(i)||_.is(i)?e=i:r=i;var a,s;if(e===void 0?a=T.create(n,r):(s=_.is(e)?e:this._changeAnnotations.manage(e),a=T.create(n,r,s)),this._workspaceEdit.documentChanges.push(a),s!==void 0)return s},t.prototype.renameFile=function(n,i,r,e){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var a;I.is(r)||_.is(r)?a=r:e=r;var s,u;if(a===void 0?s=D.create(n,i,e):(u=_.is(a)?a:this._changeAnnotations.manage(a),s=D.create(n,i,e,u)),this._workspaceEdit.documentChanges.push(s),u!==void 0)return u},t.prototype.deleteFile=function(n,i,r){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var e;I.is(i)||_.is(i)?e=i:r=i;var a,s;if(e===void 0?a=L.create(n,r):(s=_.is(e)?e:this._changeAnnotations.manage(e),a=L.create(n,r,s)),this._workspaceEdit.documentChanges.push(a),s!==void 0)return s},t})();var ie;(function(t){function n(r){return{uri:r}}t.create=n;function i(r){var e=r;return o.defined(e)&&o.string(e.uri)}t.is=i})(ie||(ie={}));var ae;(function(t){function n(r,e){return{uri:r,version:e}}t.create=n;function i(r){var e=r;return o.defined(e)&&o.string(e.uri)&&o.integer(e.version)}t.is=i})(ae||(ae={}));var V;(function(t){function n(r,e){return{uri:r,version:e}}t.create=n;function i(r){var e=r;return o.defined(e)&&o.string(e.uri)&&(e.version===null||o.integer(e.version))}t.is=i})(V||(V={}));var se;(function(t){function n(r,e,a,s){return{uri:r,languageId:e,version:a,text:s}}t.create=n;function i(r){var e=r;return o.defined(e)&&o.string(e.uri)&&o.string(e.languageId)&&o.integer(e.version)&&o.string(e.text)}t.is=i})(se||(se={}));var S;(function(t){t.PlainText="plaintext",t.Markdown="markdown"})(S||(S={}));(function(t){function n(i){var r=i;return r===t.PlainText||r===t.Markdown}t.is=n})(S||(S={}));var $;(function(t){function n(i){var r=i;return o.objectLiteral(i)&&S.is(r.kind)&&o.string(r.value)}t.is=n})($||($={}));var l;(function(t){t.Text=1,t.Method=2,t.Function=3,t.Constructor=4,t.Field=5,t.Variable=6,t.Class=7,t.Interface=8,t.Module=9,t.Property=10,t.Unit=11,t.Value=12,t.Enum=13,t.Keyword=14,t.Snippet=15,t.Color=16,t.File=17,t.Reference=18,t.Folder=19,t.EnumMember=20,t.Constant=21,t.Struct=22,t.Event=23,t.Operator=24,t.TypeParameter=25})(l||(l={}));var q;(function(t){t.PlainText=1,t.Snippet=2})(q||(q={}));var oe;(function(t){t.Deprecated=1})(oe||(oe={}));var ue;(function(t){function n(r,e,a){return{newText:r,insert:e,replace:a}}t.create=n;function i(r){var e=r;return e&&o.string(e.newText)&&p.is(e.insert)&&p.is(e.replace)}t.is=i})(ue||(ue={}));var ce;(function(t){t.asIs=1,t.adjustIndentation=2})(ce||(ce={}));var de;(function(t){function n(i){return{label:i}}t.create=n})(de||(de={}));var fe;(function(t){function n(i,r){return{items:i||[],isIncomplete:!!r}}t.create=n})(fe||(fe={}));var O;(function(t){function n(r){return r.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")}t.fromPlainText=n;function i(r){var e=r;return o.string(e)||o.objectLiteral(e)&&o.string(e.language)&&o.string(e.value)}t.is=i})(O||(O={}));var ge;(function(t){function n(i){var r=i;return!!r&&o.objectLiteral(r)&&($.is(r.contents)||O.is(r.contents)||o.typedArray(r.contents,O.is))&&(i.range===void 0||p.is(i.range))}t.is=n})(ge||(ge={}));var le;(function(t){function n(i,r){return r?{label:i,documentation:r}:{label:i}}t.create=n})(le||(le={}));var he;(function(t){function n(i,r){for(var e=[],a=2;a<arguments.length;a++)e[a-2]=arguments[a];var s={label:i};return o.defined(r)&&(s.documentation=r),o.defined(e)?s.parameters=e:s.parameters=[],s}t.create=n})(he||(he={}));var M;(function(t){t.Text=1,t.Read=2,t.Write=3})(M||(M={}));var ve;(function(t){function n(i,r){var e={range:i};return o.number(r)&&(e.kind=r),e}t.create=n})(ve||(ve={}));var h;(function(t){t.File=1,t.Module=2,t.Namespace=3,t.Package=4,t.Class=5,t.Method=6,t.Property=7,t.Field=8,t.Constructor=9,t.Enum=10,t.Interface=11,t.Function=12,t.Variable=13,t.Constant=14,t.String=15,t.Number=16,t.Boolean=17,t.Array=18,t.Object=19,t.Key=20,t.Null=21,t.EnumMember=22,t.Struct=23,t.Event=24,t.Operator=25,t.TypeParameter=26})(h||(h={}));var pe;(function(t){t.Deprecated=1})(pe||(pe={}));var _e;(function(t){function n(i,r,e,a,s){var u={name:i,kind:r,location:{uri:a,range:e}};return s&&(u.containerName=s),u}t.create=n})(_e||(_e={}));var me;(function(t){function n(r,e,a,s,u,g){var d={name:r,detail:e,kind:a,range:s,selectionRange:u};return g!==void 0&&(d.children=g),d}t.create=n;function i(r){var e=r;return e&&o.string(e.name)&&o.number(e.kind)&&p.is(e.range)&&p.is(e.selectionRange)&&(e.detail===void 0||o.string(e.detail))&&(e.deprecated===void 0||o.boolean(e.deprecated))&&(e.children===void 0||Array.isArray(e.children))&&(e.tags===void 0||Array.isArray(e.tags))}t.is=i})(me||(me={}));var we;(function(t){t.Empty="",t.QuickFix="quickfix",t.Refactor="refactor",t.RefactorExtract="refactor.extract",t.RefactorInline="refactor.inline",t.RefactorRewrite="refactor.rewrite",t.Source="source",t.SourceOrganizeImports="source.organizeImports",t.SourceFixAll="source.fixAll"})(we||(we={}));var ke;(function(t){function n(r,e){var a={diagnostics:r};return e!=null&&(a.only=e),a}t.create=n;function i(r){var e=r;return o.defined(e)&&o.typedArray(e.diagnostics,W.is)&&(e.only===void 0||o.typedArray(e.only,o.string))}t.is=i})(ke||(ke={}));var be;(function(t){function n(r,e,a){var s={title:r},u=!0;return typeof e=="string"?(u=!1,s.kind=e):P.is(e)?s.command=e:s.edit=e,u&&a!==void 0&&(s.kind=a),s}t.create=n;function i(r){var e=r;return e&&o.string(e.title)&&(e.diagnostics===void 0||o.typedArray(e.diagnostics,W.is))&&(e.kind===void 0||o.string(e.kind))&&(e.edit!==void 0||e.command!==void 0)&&(e.command===void 0||P.is(e.command))&&(e.isPreferred===void 0||o.boolean(e.isPreferred))&&(e.edit===void 0||B.is(e.edit))}t.is=i})(be||(be={}));var Ee;(function(t){function n(r,e){var a={range:r};return o.defined(e)&&(a.data=e),a}t.create=n;function i(r){var e=r;return o.defined(e)&&p.is(e.range)&&(o.undefined(e.command)||P.is(e.command))}t.is=i})(Ee||(Ee={}));var xe;(function(t){function n(r,e){return{tabSize:r,insertSpaces:e}}t.create=n;function i(r){var e=r;return o.defined(e)&&o.uinteger(e.tabSize)&&o.boolean(e.insertSpaces)}t.is=i})(xe||(xe={}));var Ce;(function(t){function n(r,e,a){return{range:r,target:e,data:a}}t.create=n;function i(r){var e=r;return o.defined(e)&&p.is(e.range)&&(o.undefined(e.target)||o.string(e.target))}t.is=i})(Ce||(Ce={}));var Ae;(function(t){function n(r,e){return{range:r,parent:e}}t.create=n;function i(r){var e=r;return e!==void 0&&p.is(e.range)&&(e.parent===void 0||t.is(e.parent))}t.is=i})(Ae||(Ae={}));var ye;(function(t){function n(a,s,u,g){return new Ve(a,s,u,g)}t.create=n;function i(a){var s=a;return!!(o.defined(s)&&o.string(s.uri)&&(o.undefined(s.languageId)||o.string(s.languageId))&&o.uinteger(s.lineCount)&&o.func(s.getText)&&o.func(s.positionAt)&&o.func(s.offsetAt))}t.is=i;function r(a,s){for(var u=a.getText(),g=e(s,function(A,j){var G=A.range.start.line-j.range.start.line;return G===0?A.range.start.character-j.range.start.character:G}),d=u.length,v=g.length-1;v>=0;v--){var w=g[v],b=a.offsetAt(w.range.start),f=a.offsetAt(w.range.end);if(f<=d)u=u.substring(0,b)+w.newText+u.substring(f,u.length);else throw new Error("Overlapping edit");d=b}return u}t.applyEdits=r;function e(a,s){if(a.length<=1)return a;var u=a.length/2|0,g=a.slice(0,u),d=a.slice(u);e(g,s),e(d,s);for(var v=0,w=0,b=0;v<g.length&&w<d.length;){var f=s(g[v],d[w]);f<=0?a[b++]=g[v++]:a[b++]=d[w++]}for(;v<g.length;)a[b++]=g[v++];for(;w<d.length;)a[b++]=d[w++];return a}})(ye||(ye={}));var Ve=function(){function t(n,i,r,e){this._uri=n,this._languageId=i,this._version=r,this._content=e,this._lineOffsets=void 0}return Object.defineProperty(t.prototype,"uri",{get:function(){return this._uri},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"languageId",{get:function(){return this._languageId},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"version",{get:function(){return this._version},enumerable:!1,configurable:!0}),t.prototype.getText=function(n){if(n){var i=this.offsetAt(n.start),r=this.offsetAt(n.end);return this._content.substring(i,r)}return this._content},t.prototype.update=function(n,i){this._content=n.text,this._version=i,this._lineOffsets=void 0},t.prototype.getLineOffsets=function(){if(this._lineOffsets===void 0){for(var n=[],i=this._content,r=!0,e=0;e<i.length;e++){r&&(n.push(e),r=!1);var a=i.charAt(e);r=a==="\r"||a===`
`,a==="\r"&&e+1<i.length&&i.charAt(e+1)===`
`&&e++}r&&i.length>0&&n.push(i.length),this._lineOffsets=n}return this._lineOffsets},t.prototype.positionAt=function(n){n=Math.max(Math.min(n,this._content.length),0);var i=this.getLineOffsets(),r=0,e=i.length;if(e===0)return k.create(0,n);for(;r<e;){var a=Math.floor((r+e)/2);i[a]>n?e=a:r=a+1}var s=r-1;return k.create(s,n-i[s])},t.prototype.offsetAt=function(n){var i=this.getLineOffsets();if(n.line>=i.length)return this._content.length;if(n.line<0)return 0;var r=i[n.line],e=n.line+1<i.length?i[n.line+1]:this._content.length;return Math.max(Math.min(r+n.character,e),r)},Object.defineProperty(t.prototype,"lineCount",{get:function(){return this.getLineOffsets().length},enumerable:!1,configurable:!0}),t}(),o;(function(t){var n=Object.prototype.toString;function i(f){return typeof f<"u"}t.defined=i;function r(f){return typeof f>"u"}t.undefined=r;function e(f){return f===!0||f===!1}t.boolean=e;function a(f){return n.call(f)==="[object String]"}t.string=a;function s(f){return n.call(f)==="[object Number]"}t.number=s;function u(f,A,j){return n.call(f)==="[object Number]"&&A<=f&&f<=j}t.numberRange=u;function g(f){return n.call(f)==="[object Number]"&&-2147483648<=f&&f<=2147483647}t.integer=g;function d(f){return n.call(f)==="[object Number]"&&0<=f&&f<=2147483647}t.uinteger=d;function v(f){return n.call(f)==="[object Function]"}t.func=v;function w(f){return f!==null&&typeof f=="object"}t.objectLiteral=w;function b(f,A){return Array.isArray(f)&&f.every(A)}t.typedArray=b})(o||(o={}));var Oe=class{constructor(t,n,i){this._languageId=t,this._worker=n,this._disposables=[],this._listener=Object.create(null);const r=a=>{let s=a.getLanguageId();if(s!==this._languageId)return;let u;this._listener[a.uri.toString()]=a.onDidChangeContent(()=>{window.clearTimeout(u),u=window.setTimeout(()=>this._doValidate(a.uri,s),500)}),this._doValidate(a.uri,s)},e=a=>{c.editor.setModelMarkers(a,this._languageId,[]);let s=a.uri.toString(),u=this._listener[s];u&&(u.dispose(),delete this._listener[s])};this._disposables.push(c.editor.onDidCreateModel(r)),this._disposables.push(c.editor.onWillDisposeModel(e)),this._disposables.push(c.editor.onDidChangeModelLanguage(a=>{e(a.model),r(a.model)})),this._disposables.push(i(a=>{c.editor.getModels().forEach(s=>{s.getLanguageId()===this._languageId&&(e(s),r(s))})})),this._disposables.push({dispose:()=>{c.editor.getModels().forEach(e);for(let a in this._listener)this._listener[a].dispose()}}),c.editor.getModels().forEach(r)}dispose(){this._disposables.forEach(t=>t&&t.dispose()),this._disposables.length=0}_doValidate(t,n){this._worker(t).then(i=>i.doValidation(t.toString())).then(i=>{const r=i.map(a=>ze(t,a));let e=c.editor.getModel(t);e&&e.getLanguageId()===n&&c.editor.setModelMarkers(e,n,r)}).then(void 0,i=>{console.error(i)})}};function He(t){switch(t){case y.Error:return c.MarkerSeverity.Error;case y.Warning:return c.MarkerSeverity.Warning;case y.Information:return c.MarkerSeverity.Info;case y.Hint:return c.MarkerSeverity.Hint;default:return c.MarkerSeverity.Info}}function ze(t,n){let i=typeof n.code=="number"?String(n.code):n.code;return{severity:He(n.severity),startLineNumber:n.range.start.line+1,startColumn:n.range.start.character+1,endLineNumber:n.range.end.line+1,endColumn:n.range.end.character+1,message:n.message,code:i,source:n.source}}var Xe=class{constructor(t,n){this._worker=t,this._triggerCharacters=n}get triggerCharacters(){return this._triggerCharacters}provideCompletionItems(t,n,i,r){const e=t.uri;return this._worker(e).then(a=>a.doComplete(e.toString(),C(n))).then(a=>{if(!a)return;const s=t.getWordUntilPosition(n),u=new c.Range(n.lineNumber,s.startColumn,n.lineNumber,s.endColumn),g=a.items.map(d=>{const v={label:d.label,insertText:d.insertText||d.label,sortText:d.sortText,filterText:d.filterText,documentation:d.documentation,detail:d.detail,command:Qe(d.command),range:u,kind:qe(d.kind)};return d.textEdit&&($e(d.textEdit)?v.range={insert:m(d.textEdit.insert),replace:m(d.textEdit.replace)}:v.range=m(d.textEdit.range),v.insertText=d.textEdit.newText),d.additionalTextEdits&&(v.additionalTextEdits=d.additionalTextEdits.map(Q)),d.insertTextFormat===q.Snippet&&(v.insertTextRules=c.languages.CompletionItemInsertTextRule.InsertAsSnippet),v});return{isIncomplete:a.isIncomplete,suggestions:g}})}};function C(t){if(!!t)return{character:t.column-1,line:t.lineNumber-1}}function Be(t){if(!!t)return{start:{line:t.startLineNumber-1,character:t.startColumn-1},end:{line:t.endLineNumber-1,character:t.endColumn-1}}}function m(t){if(!!t)return new c.Range(t.start.line+1,t.start.character+1,t.end.line+1,t.end.character+1)}function $e(t){return typeof t.insert<"u"&&typeof t.replace<"u"}function qe(t){const n=c.languages.CompletionItemKind;switch(t){case l.Text:return n.Text;case l.Method:return n.Method;case l.Function:return n.Function;case l.Constructor:return n.Constructor;case l.Field:return n.Field;case l.Variable:return n.Variable;case l.Class:return n.Class;case l.Interface:return n.Interface;case l.Module:return n.Module;case l.Property:return n.Property;case l.Unit:return n.Unit;case l.Value:return n.Value;case l.Enum:return n.Enum;case l.Keyword:return n.Keyword;case l.Snippet:return n.Snippet;case l.Color:return n.Color;case l.File:return n.File;case l.Reference:return n.Reference}return n.Property}function Q(t){if(!!t)return{range:m(t.range),text:t.newText}}function Qe(t){return t&&t.command==="editor.action.triggerSuggest"?{id:t.command,title:t.title,arguments:t.arguments}:void 0}var Ge=class{constructor(t){this._worker=t}provideHover(t,n,i){let r=t.uri;return this._worker(r).then(e=>e.doHover(r.toString(),C(n))).then(e=>{if(!!e)return{range:m(e.range),contents:Ye(e.contents)}})}};function Je(t){return t&&typeof t=="object"&&typeof t.kind=="string"}function Ie(t){return typeof t=="string"?{value:t}:Je(t)?t.kind==="plaintext"?{value:t.value.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")}:{value:t.value}:{value:"```"+t.language+`
`+t.value+"\n```\n"}}function Ye(t){if(!!t)return Array.isArray(t)?t.map(Ie):[Ie(t)]}var Ze=class{constructor(t){this._worker=t}provideDocumentHighlights(t,n,i){const r=t.uri;return this._worker(r).then(e=>e.findDocumentHighlights(r.toString(),C(n))).then(e=>{if(!!e)return e.map(a=>({range:m(a.range),kind:Ke(a.kind)}))})}};function Ke(t){switch(t){case M.Read:return c.languages.DocumentHighlightKind.Read;case M.Write:return c.languages.DocumentHighlightKind.Write;case M.Text:return c.languages.DocumentHighlightKind.Text}return c.languages.DocumentHighlightKind.Text}var et=class{constructor(t){this._worker=t}provideDefinition(t,n,i){const r=t.uri;return this._worker(r).then(e=>e.findDefinition(r.toString(),C(n))).then(e=>{if(!!e)return[Pe(e)]})}};function Pe(t){return{uri:c.Uri.parse(t.uri),range:m(t.range)}}var tt=class{constructor(t){this._worker=t}provideReferences(t,n,i,r){const e=t.uri;return this._worker(e).then(a=>a.findReferences(e.toString(),C(n))).then(a=>{if(!!a)return a.map(Pe)})}},rt=class{constructor(t){this._worker=t}provideRenameEdits(t,n,i,r){const e=t.uri;return this._worker(e).then(a=>a.doRename(e.toString(),C(n),i)).then(a=>nt(a))}};function nt(t){if(!t||!t.changes)return;let n=[];for(let i in t.changes){const r=c.Uri.parse(i);for(let e of t.changes[i])n.push({resource:r,edit:{range:m(e.range),text:e.newText}})}return{edits:n}}var it=class{constructor(t){this._worker=t}provideDocumentSymbols(t,n){const i=t.uri;return this._worker(i).then(r=>r.findDocumentSymbols(i.toString())).then(r=>{if(!!r)return r.map(e=>({name:e.name,detail:"",containerName:e.containerName,kind:at(e.kind),range:m(e.location.range),selectionRange:m(e.location.range),tags:[]}))})}};function at(t){let n=c.languages.SymbolKind;switch(t){case h.File:return n.Array;case h.Module:return n.Module;case h.Namespace:return n.Namespace;case h.Package:return n.Package;case h.Class:return n.Class;case h.Method:return n.Method;case h.Property:return n.Property;case h.Field:return n.Field;case h.Constructor:return n.Constructor;case h.Enum:return n.Enum;case h.Interface:return n.Interface;case h.Function:return n.Function;case h.Variable:return n.Variable;case h.Constant:return n.Constant;case h.String:return n.String;case h.Number:return n.Number;case h.Boolean:return n.Boolean;case h.Array:return n.Array}return n.Function}var st=class{constructor(t){this._worker=t}provideDocumentColors(t,n){const i=t.uri;return this._worker(i).then(r=>r.findDocumentColors(i.toString())).then(r=>{if(!!r)return r.map(e=>({color:e.color,range:m(e.range)}))})}provideColorPresentations(t,n,i){const r=t.uri;return this._worker(r).then(e=>e.getColorPresentations(r.toString(),n.color,Be(n.range))).then(e=>{if(!!e)return e.map(a=>{let s={label:a.label};return a.textEdit&&(s.textEdit=Q(a.textEdit)),a.additionalTextEdits&&(s.additionalTextEdits=a.additionalTextEdits.map(Q)),s})})}},ot=class{constructor(t){this._worker=t}provideFoldingRanges(t,n,i){const r=t.uri;return this._worker(r).then(e=>e.getFoldingRanges(r.toString(),n)).then(e=>{if(!!e)return e.map(a=>{const s={start:a.startLine+1,end:a.endLine+1};return typeof a.kind<"u"&&(s.kind=ut(a.kind)),s})})}};function ut(t){switch(t){case R.Comment:return c.languages.FoldingRangeKind.Comment;case R.Imports:return c.languages.FoldingRangeKind.Imports;case R.Region:return c.languages.FoldingRangeKind.Region}}var ct=class{constructor(t){this._worker=t}provideSelectionRanges(t,n,i){const r=t.uri;return this._worker(r).then(e=>e.getSelectionRanges(r.toString(),n.map(C))).then(e=>{if(!!e)return e.map(a=>{const s=[];for(;a;)s.push({range:m(a.range)}),a=a.parent;return s})})}};function gt(t){const n=[],i=[],r=new Ue(t);n.push(r);const e=(...s)=>r.getLanguageServiceWorker(...s);function a(){const{languageId:s,modeConfiguration:u}=t;Te(i),u.completionItems&&i.push(c.languages.registerCompletionItemProvider(s,new Xe(e,["/","-",":"]))),u.hovers&&i.push(c.languages.registerHoverProvider(s,new Ge(e))),u.documentHighlights&&i.push(c.languages.registerDocumentHighlightProvider(s,new Ze(e))),u.definitions&&i.push(c.languages.registerDefinitionProvider(s,new et(e))),u.references&&i.push(c.languages.registerReferenceProvider(s,new tt(e))),u.documentSymbols&&i.push(c.languages.registerDocumentSymbolProvider(s,new it(e))),u.rename&&i.push(c.languages.registerRenameProvider(s,new rt(e))),u.colors&&i.push(c.languages.registerColorProvider(s,new st(e))),u.foldingRanges&&i.push(c.languages.registerFoldingRangeProvider(s,new ot(e))),u.diagnostics&&i.push(new Oe(s,e,t.onDidChange)),u.selectionRanges&&i.push(c.languages.registerSelectionRangeProvider(s,new ct(e)))}return a(),n.push(Re(i)),Re(n)}function Re(t){return{dispose:()=>Te(t)}}function Te(t){for(;t.length;)t.pop().dispose()}export{gt as setupMode};
