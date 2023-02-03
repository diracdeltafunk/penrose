import{m as ze}from"./index-8c94b61d.js";var Re=Object.defineProperty,Xe=Object.getOwnPropertyDescriptor,Be=Object.getOwnPropertyNames,$e=Object.prototype.hasOwnProperty,qe=e=>Re(e,"__esModule",{value:!0}),Qe=(e,n,i)=>{if(n&&typeof n=="object"||typeof n=="function")for(let r of Be(n))!$e.call(e,r)&&r!=="default"&&Re(e,r,{get:()=>n[r],enumerable:!(i=Xe(n,r))||i.enumerable});return e},d={};qe(d);Qe(d,ze);var Ge=2*60*1e3,Fe=class{constructor(e){this._defaults=e,this._worker=null,this._client=null,this._idleCheckInterval=window.setInterval(()=>this._checkIfIdle(),30*1e3),this._lastUsedTime=0,this._configChangeListener=this._defaults.onDidChange(()=>this._stopWorker())}_stopWorker(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null}dispose(){clearInterval(this._idleCheckInterval),this._configChangeListener.dispose(),this._stopWorker()}_checkIfIdle(){if(!this._worker)return;Date.now()-this._lastUsedTime>Ge&&this._stopWorker()}_getClient(){return this._lastUsedTime=Date.now(),this._client||(this._worker=d.editor.createWebWorker({moduleId:"vs/language/html/htmlWorker",createData:{languageSettings:this._defaults.options,languageId:this._defaults.languageId},label:this._defaults.languageId}),this._client=this._worker.getProxy()),this._client}getLanguageServiceWorker(...e){let n;return this._getClient().then(i=>{n=i}).then(i=>{if(this._worker)return this._worker.withSyncedResources(e)}).then(i=>n)}},G;(function(e){e.MIN_VALUE=-2147483648,e.MAX_VALUE=2147483647})(G||(G={}));var j;(function(e){e.MIN_VALUE=0,e.MAX_VALUE=2147483647})(j||(j={}));var k;(function(e){function n(r,t){return r===Number.MAX_VALUE&&(r=j.MAX_VALUE),t===Number.MAX_VALUE&&(t=j.MAX_VALUE),{line:r,character:t}}e.create=n;function i(r){var t=r;return o.objectLiteral(t)&&o.uinteger(t.line)&&o.uinteger(t.character)}e.is=i})(k||(k={}));var p;(function(e){function n(r,t,a,s){if(o.uinteger(r)&&o.uinteger(t)&&o.uinteger(a)&&o.uinteger(s))return{start:k.create(r,t),end:k.create(a,s)};if(k.is(r)&&k.is(t))return{start:r,end:t};throw new Error("Range#create called with invalid arguments["+r+", "+t+", "+a+", "+s+"]")}e.create=n;function i(r){var t=r;return o.objectLiteral(t)&&k.is(t.start)&&k.is(t.end)}e.is=i})(p||(p={}));var U;(function(e){function n(r,t){return{uri:r,range:t}}e.create=n;function i(r){var t=r;return o.defined(t)&&p.is(t.range)&&(o.string(t.uri)||o.undefined(t.uri))}e.is=i})(U||(U={}));var J;(function(e){function n(r,t,a,s){return{targetUri:r,targetRange:t,targetSelectionRange:a,originSelectionRange:s}}e.create=n;function i(r){var t=r;return o.defined(t)&&p.is(t.targetRange)&&o.string(t.targetUri)&&(p.is(t.targetSelectionRange)||o.undefined(t.targetSelectionRange))&&(p.is(t.originSelectionRange)||o.undefined(t.originSelectionRange))}e.is=i})(J||(J={}));var V;(function(e){function n(r,t,a,s){return{red:r,green:t,blue:a,alpha:s}}e.create=n;function i(r){var t=r;return o.numberRange(t.red,0,1)&&o.numberRange(t.green,0,1)&&o.numberRange(t.blue,0,1)&&o.numberRange(t.alpha,0,1)}e.is=i})(V||(V={}));var Y;(function(e){function n(r,t){return{range:r,color:t}}e.create=n;function i(r){var t=r;return p.is(t.range)&&V.is(t.color)}e.is=i})(Y||(Y={}));var Z;(function(e){function n(r,t,a){return{label:r,textEdit:t,additionalTextEdits:a}}e.create=n;function i(r){var t=r;return o.string(t.label)&&(o.undefined(t.textEdit)||x.is(t))&&(o.undefined(t.additionalTextEdits)||o.typedArray(t.additionalTextEdits,x.is))}e.is=i})(Z||(Z={}));var y;(function(e){e.Comment="comment",e.Imports="imports",e.Region="region"})(y||(y={}));var K;(function(e){function n(r,t,a,s,u){var g={startLine:r,endLine:t};return o.defined(a)&&(g.startCharacter=a),o.defined(s)&&(g.endCharacter=s),o.defined(u)&&(g.kind=u),g}e.create=n;function i(r){var t=r;return o.uinteger(t.startLine)&&o.uinteger(t.startLine)&&(o.undefined(t.startCharacter)||o.uinteger(t.startCharacter))&&(o.undefined(t.endCharacter)||o.uinteger(t.endCharacter))&&(o.undefined(t.kind)||o.string(t.kind))}e.is=i})(K||(K={}));var z;(function(e){function n(r,t){return{location:r,message:t}}e.create=n;function i(r){var t=r;return o.defined(t)&&U.is(t.location)&&o.string(t.message)}e.is=i})(z||(z={}));var ee;(function(e){e.Error=1,e.Warning=2,e.Information=3,e.Hint=4})(ee||(ee={}));var te;(function(e){e.Unnecessary=1,e.Deprecated=2})(te||(te={}));var re;(function(e){function n(i){var r=i;return r!=null&&o.string(r.href)}e.is=n})(re||(re={}));var N;(function(e){function n(r,t,a,s,u,g){var c={range:r,message:t};return o.defined(a)&&(c.severity=a),o.defined(s)&&(c.code=s),o.defined(u)&&(c.source=u),o.defined(g)&&(c.relatedInformation=g),c}e.create=n;function i(r){var t,a=r;return o.defined(a)&&p.is(a.range)&&o.string(a.message)&&(o.number(a.severity)||o.undefined(a.severity))&&(o.integer(a.code)||o.string(a.code)||o.undefined(a.code))&&(o.undefined(a.codeDescription)||o.string((t=a.codeDescription)===null||t===void 0?void 0:t.href))&&(o.string(a.source)||o.undefined(a.source))&&(o.undefined(a.relatedInformation)||o.typedArray(a.relatedInformation,z.is))}e.is=i})(N||(N={}));var I;(function(e){function n(r,t){for(var a=[],s=2;s<arguments.length;s++)a[s-2]=arguments[s];var u={title:r,command:t};return o.defined(a)&&a.length>0&&(u.arguments=a),u}e.create=n;function i(r){var t=r;return o.defined(t)&&o.string(t.title)&&o.string(t.command)}e.is=i})(I||(I={}));var x;(function(e){function n(a,s){return{range:a,newText:s}}e.replace=n;function i(a,s){return{range:{start:a,end:a},newText:s}}e.insert=i;function r(a){return{range:a,newText:""}}e.del=r;function t(a){var s=a;return o.objectLiteral(s)&&o.string(s.newText)&&p.is(s.range)}e.is=t})(x||(x={}));var C;(function(e){function n(r,t,a){var s={label:r};return t!==void 0&&(s.needsConfirmation=t),a!==void 0&&(s.description=a),s}e.create=n;function i(r){var t=r;return t!==void 0&&o.objectLiteral(t)&&o.string(t.label)&&(o.boolean(t.needsConfirmation)||t.needsConfirmation===void 0)&&(o.string(t.description)||t.description===void 0)}e.is=i})(C||(C={}));var m;(function(e){function n(i){var r=i;return typeof r=="string"}e.is=n})(m||(m={}));var E;(function(e){function n(a,s,u){return{range:a,newText:s,annotationId:u}}e.replace=n;function i(a,s,u){return{range:{start:a,end:a},newText:s,annotationId:u}}e.insert=i;function r(a,s){return{range:a,newText:"",annotationId:s}}e.del=r;function t(a){var s=a;return x.is(s)&&(C.is(s.annotationId)||m.is(s.annotationId))}e.is=t})(E||(E={}));var W;(function(e){function n(r,t){return{textDocument:r,edits:t}}e.create=n;function i(r){var t=r;return o.defined(t)&&H.is(t.textDocument)&&Array.isArray(t.edits)}e.is=i})(W||(W={}));var R;(function(e){function n(r,t,a){var s={kind:"create",uri:r};return t!==void 0&&(t.overwrite!==void 0||t.ignoreIfExists!==void 0)&&(s.options=t),a!==void 0&&(s.annotationId=a),s}e.create=n;function i(r){var t=r;return t&&t.kind==="create"&&o.string(t.uri)&&(t.options===void 0||(t.options.overwrite===void 0||o.boolean(t.options.overwrite))&&(t.options.ignoreIfExists===void 0||o.boolean(t.options.ignoreIfExists)))&&(t.annotationId===void 0||m.is(t.annotationId))}e.is=i})(R||(R={}));var F;(function(e){function n(r,t,a,s){var u={kind:"rename",oldUri:r,newUri:t};return a!==void 0&&(a.overwrite!==void 0||a.ignoreIfExists!==void 0)&&(u.options=a),s!==void 0&&(u.annotationId=s),u}e.create=n;function i(r){var t=r;return t&&t.kind==="rename"&&o.string(t.oldUri)&&o.string(t.newUri)&&(t.options===void 0||(t.options.overwrite===void 0||o.boolean(t.options.overwrite))&&(t.options.ignoreIfExists===void 0||o.boolean(t.options.ignoreIfExists)))&&(t.annotationId===void 0||m.is(t.annotationId))}e.is=i})(F||(F={}));var T;(function(e){function n(r,t,a){var s={kind:"delete",uri:r};return t!==void 0&&(t.recursive!==void 0||t.ignoreIfNotExists!==void 0)&&(s.options=t),a!==void 0&&(s.annotationId=a),s}e.create=n;function i(r){var t=r;return t&&t.kind==="delete"&&o.string(t.uri)&&(t.options===void 0||(t.options.recursive===void 0||o.boolean(t.options.recursive))&&(t.options.ignoreIfNotExists===void 0||o.boolean(t.options.ignoreIfNotExists)))&&(t.annotationId===void 0||m.is(t.annotationId))}e.is=i})(T||(T={}));var X;(function(e){function n(i){var r=i;return r&&(r.changes!==void 0||r.documentChanges!==void 0)&&(r.documentChanges===void 0||r.documentChanges.every(function(t){return o.string(t.kind)?R.is(t)||F.is(t)||T.is(t):W.is(t)}))}e.is=n})(X||(X={}));var S=function(){function e(n,i){this.edits=n,this.changeAnnotations=i}return e.prototype.insert=function(n,i,r){var t,a;if(r===void 0?t=x.insert(n,i):m.is(r)?(a=r,t=E.insert(n,i,r)):(this.assertChangeAnnotations(this.changeAnnotations),a=this.changeAnnotations.manage(r),t=E.insert(n,i,a)),this.edits.push(t),a!==void 0)return a},e.prototype.replace=function(n,i,r){var t,a;if(r===void 0?t=x.replace(n,i):m.is(r)?(a=r,t=E.replace(n,i,r)):(this.assertChangeAnnotations(this.changeAnnotations),a=this.changeAnnotations.manage(r),t=E.replace(n,i,a)),this.edits.push(t),a!==void 0)return a},e.prototype.delete=function(n,i){var r,t;if(i===void 0?r=x.del(n):m.is(i)?(t=i,r=E.del(n,i)):(this.assertChangeAnnotations(this.changeAnnotations),t=this.changeAnnotations.manage(i),r=E.del(n,t)),this.edits.push(r),t!==void 0)return t},e.prototype.add=function(n){this.edits.push(n)},e.prototype.all=function(){return this.edits},e.prototype.clear=function(){this.edits.splice(0,this.edits.length)},e.prototype.assertChangeAnnotations=function(n){if(n===void 0)throw new Error("Text edit change is not configured to manage change annotations.")},e}(),ne=function(){function e(n){this._annotations=n===void 0?Object.create(null):n,this._counter=0,this._size=0}return e.prototype.all=function(){return this._annotations},Object.defineProperty(e.prototype,"size",{get:function(){return this._size},enumerable:!1,configurable:!0}),e.prototype.manage=function(n,i){var r;if(m.is(n)?r=n:(r=this.nextId(),i=n),this._annotations[r]!==void 0)throw new Error("Id "+r+" is already in use.");if(i===void 0)throw new Error("No annotation provided for id "+r);return this._annotations[r]=i,this._size++,r},e.prototype.nextId=function(){return this._counter++,this._counter.toString()},e}();(function(){function e(n){var i=this;this._textEditChanges=Object.create(null),n!==void 0?(this._workspaceEdit=n,n.documentChanges?(this._changeAnnotations=new ne(n.changeAnnotations),n.changeAnnotations=this._changeAnnotations.all(),n.documentChanges.forEach(function(r){if(W.is(r)){var t=new S(r.edits,i._changeAnnotations);i._textEditChanges[r.textDocument.uri]=t}})):n.changes&&Object.keys(n.changes).forEach(function(r){var t=new S(n.changes[r]);i._textEditChanges[r]=t})):this._workspaceEdit={}}return Object.defineProperty(e.prototype,"edit",{get:function(){return this.initDocumentChanges(),this._changeAnnotations!==void 0&&(this._changeAnnotations.size===0?this._workspaceEdit.changeAnnotations=void 0:this._workspaceEdit.changeAnnotations=this._changeAnnotations.all()),this._workspaceEdit},enumerable:!1,configurable:!0}),e.prototype.getTextEditChange=function(n){if(H.is(n)){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var i={uri:n.uri,version:n.version},r=this._textEditChanges[i.uri];if(!r){var t=[],a={textDocument:i,edits:t};this._workspaceEdit.documentChanges.push(a),r=new S(t,this._changeAnnotations),this._textEditChanges[i.uri]=r}return r}else{if(this.initChanges(),this._workspaceEdit.changes===void 0)throw new Error("Workspace edit is not configured for normal text edit changes.");var r=this._textEditChanges[n];if(!r){var t=[];this._workspaceEdit.changes[n]=t,r=new S(t),this._textEditChanges[n]=r}return r}},e.prototype.initDocumentChanges=function(){this._workspaceEdit.documentChanges===void 0&&this._workspaceEdit.changes===void 0&&(this._changeAnnotations=new ne,this._workspaceEdit.documentChanges=[],this._workspaceEdit.changeAnnotations=this._changeAnnotations.all())},e.prototype.initChanges=function(){this._workspaceEdit.documentChanges===void 0&&this._workspaceEdit.changes===void 0&&(this._workspaceEdit.changes=Object.create(null))},e.prototype.createFile=function(n,i,r){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var t;C.is(i)||m.is(i)?t=i:r=i;var a,s;if(t===void 0?a=R.create(n,r):(s=m.is(t)?t:this._changeAnnotations.manage(t),a=R.create(n,r,s)),this._workspaceEdit.documentChanges.push(a),s!==void 0)return s},e.prototype.renameFile=function(n,i,r,t){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var a;C.is(r)||m.is(r)?a=r:t=r;var s,u;if(a===void 0?s=F.create(n,i,t):(u=m.is(a)?a:this._changeAnnotations.manage(a),s=F.create(n,i,t,u)),this._workspaceEdit.documentChanges.push(s),u!==void 0)return u},e.prototype.deleteFile=function(n,i,r){if(this.initDocumentChanges(),this._workspaceEdit.documentChanges===void 0)throw new Error("Workspace edit is not configured for document changes.");var t;C.is(i)||m.is(i)?t=i:r=i;var a,s;if(t===void 0?a=T.create(n,r):(s=m.is(t)?t:this._changeAnnotations.manage(t),a=T.create(n,r,s)),this._workspaceEdit.documentChanges.push(a),s!==void 0)return s},e})();var ie;(function(e){function n(r){return{uri:r}}e.create=n;function i(r){var t=r;return o.defined(t)&&o.string(t.uri)}e.is=i})(ie||(ie={}));var ae;(function(e){function n(r,t){return{uri:r,version:t}}e.create=n;function i(r){var t=r;return o.defined(t)&&o.string(t.uri)&&o.integer(t.version)}e.is=i})(ae||(ae={}));var H;(function(e){function n(r,t){return{uri:r,version:t}}e.create=n;function i(r){var t=r;return o.defined(t)&&o.string(t.uri)&&(t.version===null||o.integer(t.version))}e.is=i})(H||(H={}));var oe;(function(e){function n(r,t,a,s){return{uri:r,languageId:t,version:a,text:s}}e.create=n;function i(r){var t=r;return o.defined(t)&&o.string(t.uri)&&o.string(t.languageId)&&o.integer(t.version)&&o.string(t.text)}e.is=i})(oe||(oe={}));var D;(function(e){e.PlainText="plaintext",e.Markdown="markdown"})(D||(D={}));(function(e){function n(i){var r=i;return r===e.PlainText||r===e.Markdown}e.is=n})(D||(D={}));var B;(function(e){function n(i){var r=i;return o.objectLiteral(i)&&D.is(r.kind)&&o.string(r.value)}e.is=n})(B||(B={}));var l;(function(e){e.Text=1,e.Method=2,e.Function=3,e.Constructor=4,e.Field=5,e.Variable=6,e.Class=7,e.Interface=8,e.Module=9,e.Property=10,e.Unit=11,e.Value=12,e.Enum=13,e.Keyword=14,e.Snippet=15,e.Color=16,e.File=17,e.Reference=18,e.Folder=19,e.EnumMember=20,e.Constant=21,e.Struct=22,e.Event=23,e.Operator=24,e.TypeParameter=25})(l||(l={}));var $;(function(e){e.PlainText=1,e.Snippet=2})($||($={}));var se;(function(e){e.Deprecated=1})(se||(se={}));var ue;(function(e){function n(r,t,a){return{newText:r,insert:t,replace:a}}e.create=n;function i(r){var t=r;return t&&o.string(t.newText)&&p.is(t.insert)&&p.is(t.replace)}e.is=i})(ue||(ue={}));var ce;(function(e){e.asIs=1,e.adjustIndentation=2})(ce||(ce={}));var de;(function(e){function n(i){return{label:i}}e.create=n})(de||(de={}));var fe;(function(e){function n(i,r){return{items:i||[],isIncomplete:!!r}}e.create=n})(fe||(fe={}));var O;(function(e){function n(r){return r.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")}e.fromPlainText=n;function i(r){var t=r;return o.string(t)||o.objectLiteral(t)&&o.string(t.language)&&o.string(t.value)}e.is=i})(O||(O={}));var ge;(function(e){function n(i){var r=i;return!!r&&o.objectLiteral(r)&&(B.is(r.contents)||O.is(r.contents)||o.typedArray(r.contents,O.is))&&(i.range===void 0||p.is(i.range))}e.is=n})(ge||(ge={}));var le;(function(e){function n(i,r){return r?{label:i,documentation:r}:{label:i}}e.create=n})(le||(le={}));var he;(function(e){function n(i,r){for(var t=[],a=2;a<arguments.length;a++)t[a-2]=arguments[a];var s={label:i};return o.defined(r)&&(s.documentation=r),o.defined(t)?s.parameters=t:s.parameters=[],s}e.create=n})(he||(he={}));var P;(function(e){e.Text=1,e.Read=2,e.Write=3})(P||(P={}));var ve;(function(e){function n(i,r){var t={range:i};return o.number(r)&&(t.kind=r),t}e.create=n})(ve||(ve={}));var h;(function(e){e.File=1,e.Module=2,e.Namespace=3,e.Package=4,e.Class=5,e.Method=6,e.Property=7,e.Field=8,e.Constructor=9,e.Enum=10,e.Interface=11,e.Function=12,e.Variable=13,e.Constant=14,e.String=15,e.Number=16,e.Boolean=17,e.Array=18,e.Object=19,e.Key=20,e.Null=21,e.EnumMember=22,e.Struct=23,e.Event=24,e.Operator=25,e.TypeParameter=26})(h||(h={}));var pe;(function(e){e.Deprecated=1})(pe||(pe={}));var me;(function(e){function n(i,r,t,a,s){var u={name:i,kind:r,location:{uri:a,range:t}};return s&&(u.containerName=s),u}e.create=n})(me||(me={}));var _e;(function(e){function n(r,t,a,s,u,g){var c={name:r,detail:t,kind:a,range:s,selectionRange:u};return g!==void 0&&(c.children=g),c}e.create=n;function i(r){var t=r;return t&&o.string(t.name)&&o.number(t.kind)&&p.is(t.range)&&p.is(t.selectionRange)&&(t.detail===void 0||o.string(t.detail))&&(t.deprecated===void 0||o.boolean(t.deprecated))&&(t.children===void 0||Array.isArray(t.children))&&(t.tags===void 0||Array.isArray(t.tags))}e.is=i})(_e||(_e={}));var we;(function(e){e.Empty="",e.QuickFix="quickfix",e.Refactor="refactor",e.RefactorExtract="refactor.extract",e.RefactorInline="refactor.inline",e.RefactorRewrite="refactor.rewrite",e.Source="source",e.SourceOrganizeImports="source.organizeImports",e.SourceFixAll="source.fixAll"})(we||(we={}));var ke;(function(e){function n(r,t){var a={diagnostics:r};return t!=null&&(a.only=t),a}e.create=n;function i(r){var t=r;return o.defined(t)&&o.typedArray(t.diagnostics,N.is)&&(t.only===void 0||o.typedArray(t.only,o.string))}e.is=i})(ke||(ke={}));var be;(function(e){function n(r,t,a){var s={title:r},u=!0;return typeof t=="string"?(u=!1,s.kind=t):I.is(t)?s.command=t:s.edit=t,u&&a!==void 0&&(s.kind=a),s}e.create=n;function i(r){var t=r;return t&&o.string(t.title)&&(t.diagnostics===void 0||o.typedArray(t.diagnostics,N.is))&&(t.kind===void 0||o.string(t.kind))&&(t.edit!==void 0||t.command!==void 0)&&(t.command===void 0||I.is(t.command))&&(t.isPreferred===void 0||o.boolean(t.isPreferred))&&(t.edit===void 0||X.is(t.edit))}e.is=i})(be||(be={}));var Ee;(function(e){function n(r,t){var a={range:r};return o.defined(t)&&(a.data=t),a}e.create=n;function i(r){var t=r;return o.defined(t)&&p.is(t.range)&&(o.undefined(t.command)||I.is(t.command))}e.is=i})(Ee||(Ee={}));var xe;(function(e){function n(r,t){return{tabSize:r,insertSpaces:t}}e.create=n;function i(r){var t=r;return o.defined(t)&&o.uinteger(t.tabSize)&&o.boolean(t.insertSpaces)}e.is=i})(xe||(xe={}));var Ae;(function(e){function n(r,t,a){return{range:r,target:t,data:a}}e.create=n;function i(r){var t=r;return o.defined(t)&&p.is(t.range)&&(o.undefined(t.target)||o.string(t.target))}e.is=i})(Ae||(Ae={}));var Ce;(function(e){function n(r,t){return{range:r,parent:t}}e.create=n;function i(r){var t=r;return t!==void 0&&p.is(t.range)&&(t.parent===void 0||e.is(t.parent))}e.is=i})(Ce||(Ce={}));var ye;(function(e){function n(a,s,u,g){return new Je(a,s,u,g)}e.create=n;function i(a){var s=a;return!!(o.defined(s)&&o.string(s.uri)&&(o.undefined(s.languageId)||o.string(s.languageId))&&o.uinteger(s.lineCount)&&o.func(s.getText)&&o.func(s.positionAt)&&o.func(s.offsetAt))}e.is=i;function r(a,s){for(var u=a.getText(),g=t(s,function(A,M){var Q=A.range.start.line-M.range.start.line;return Q===0?A.range.start.character-M.range.start.character:Q}),c=u.length,v=g.length-1;v>=0;v--){var _=g[v],b=a.offsetAt(_.range.start),f=a.offsetAt(_.range.end);if(f<=c)u=u.substring(0,b)+_.newText+u.substring(f,u.length);else throw new Error("Overlapping edit");c=b}return u}e.applyEdits=r;function t(a,s){if(a.length<=1)return a;var u=a.length/2|0,g=a.slice(0,u),c=a.slice(u);t(g,s),t(c,s);for(var v=0,_=0,b=0;v<g.length&&_<c.length;){var f=s(g[v],c[_]);f<=0?a[b++]=g[v++]:a[b++]=c[_++]}for(;v<g.length;)a[b++]=g[v++];for(;_<c.length;)a[b++]=c[_++];return a}})(ye||(ye={}));var Je=function(){function e(n,i,r,t){this._uri=n,this._languageId=i,this._version=r,this._content=t,this._lineOffsets=void 0}return Object.defineProperty(e.prototype,"uri",{get:function(){return this._uri},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"languageId",{get:function(){return this._languageId},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"version",{get:function(){return this._version},enumerable:!1,configurable:!0}),e.prototype.getText=function(n){if(n){var i=this.offsetAt(n.start),r=this.offsetAt(n.end);return this._content.substring(i,r)}return this._content},e.prototype.update=function(n,i){this._content=n.text,this._version=i,this._lineOffsets=void 0},e.prototype.getLineOffsets=function(){if(this._lineOffsets===void 0){for(var n=[],i=this._content,r=!0,t=0;t<i.length;t++){r&&(n.push(t),r=!1);var a=i.charAt(t);r=a==="\r"||a===`
`,a==="\r"&&t+1<i.length&&i.charAt(t+1)===`
`&&t++}r&&i.length>0&&n.push(i.length),this._lineOffsets=n}return this._lineOffsets},e.prototype.positionAt=function(n){n=Math.max(Math.min(n,this._content.length),0);var i=this.getLineOffsets(),r=0,t=i.length;if(t===0)return k.create(0,n);for(;r<t;){var a=Math.floor((r+t)/2);i[a]>n?t=a:r=a+1}var s=r-1;return k.create(s,n-i[s])},e.prototype.offsetAt=function(n){var i=this.getLineOffsets();if(n.line>=i.length)return this._content.length;if(n.line<0)return 0;var r=i[n.line],t=n.line+1<i.length?i[n.line+1]:this._content.length;return Math.max(Math.min(r+n.character,t),r)},Object.defineProperty(e.prototype,"lineCount",{get:function(){return this.getLineOffsets().length},enumerable:!1,configurable:!0}),e}(),o;(function(e){var n=Object.prototype.toString;function i(f){return typeof f<"u"}e.defined=i;function r(f){return typeof f>"u"}e.undefined=r;function t(f){return f===!0||f===!1}e.boolean=t;function a(f){return n.call(f)==="[object String]"}e.string=a;function s(f){return n.call(f)==="[object Number]"}e.number=s;function u(f,A,M){return n.call(f)==="[object Number]"&&A<=f&&f<=M}e.numberRange=u;function g(f){return n.call(f)==="[object Number]"&&-2147483648<=f&&f<=2147483647}e.integer=g;function c(f){return n.call(f)==="[object Number]"&&0<=f&&f<=2147483647}e.uinteger=c;function v(f){return n.call(f)==="[object Function]"}e.func=v;function _(f){return f!==null&&typeof f=="object"}e.objectLiteral=_;function b(f,A){return Array.isArray(f)&&f.every(A)}e.typedArray=b})(o||(o={}));var Ye=class{constructor(e,n){this._worker=e,this._triggerCharacters=n}get triggerCharacters(){return this._triggerCharacters}provideCompletionItems(e,n,i,r){const t=e.uri;return this._worker(t).then(a=>a.doComplete(t.toString(),L(n))).then(a=>{if(!a)return;const s=e.getWordUntilPosition(n),u=new d.Range(n.lineNumber,s.startColumn,n.lineNumber,s.endColumn),g=a.items.map(c=>{const v={label:c.label,insertText:c.insertText||c.label,sortText:c.sortText,filterText:c.filterText,documentation:c.documentation,detail:c.detail,command:tt(c.command),range:u,kind:et(c.kind)};return c.textEdit&&(Ke(c.textEdit)?v.range={insert:w(c.textEdit.insert),replace:w(c.textEdit.replace)}:v.range=w(c.textEdit.range),v.insertText=c.textEdit.newText),c.additionalTextEdits&&(v.additionalTextEdits=c.additionalTextEdits.map(q)),c.insertTextFormat===$.Snippet&&(v.insertTextRules=d.languages.CompletionItemInsertTextRule.InsertAsSnippet),v});return{isIncomplete:a.isIncomplete,suggestions:g}})}};function L(e){if(!!e)return{character:e.column-1,line:e.lineNumber-1}}function Ze(e){if(!!e)return{start:{line:e.startLineNumber-1,character:e.startColumn-1},end:{line:e.endLineNumber-1,character:e.endColumn-1}}}function w(e){if(!!e)return new d.Range(e.start.line+1,e.start.character+1,e.end.line+1,e.end.character+1)}function Ke(e){return typeof e.insert<"u"&&typeof e.replace<"u"}function et(e){const n=d.languages.CompletionItemKind;switch(e){case l.Text:return n.Text;case l.Method:return n.Method;case l.Function:return n.Function;case l.Constructor:return n.Constructor;case l.Field:return n.Field;case l.Variable:return n.Variable;case l.Class:return n.Class;case l.Interface:return n.Interface;case l.Module:return n.Module;case l.Property:return n.Property;case l.Unit:return n.Unit;case l.Value:return n.Value;case l.Enum:return n.Enum;case l.Keyword:return n.Keyword;case l.Snippet:return n.Snippet;case l.Color:return n.Color;case l.File:return n.File;case l.Reference:return n.Reference}return n.Property}function q(e){if(!!e)return{range:w(e.range),text:e.newText}}function tt(e){return e&&e.command==="editor.action.triggerSuggest"?{id:e.command,title:e.title,arguments:e.arguments}:void 0}var Te=class{constructor(e){this._worker=e}provideHover(e,n,i){let r=e.uri;return this._worker(r).then(t=>t.doHover(r.toString(),L(n))).then(t=>{if(!!t)return{range:w(t.range),contents:nt(t.contents)}})}};function rt(e){return e&&typeof e=="object"&&typeof e.kind=="string"}function Pe(e){return typeof e=="string"?{value:e}:rt(e)?e.kind==="plaintext"?{value:e.value.replace(/[\\`*_{}[\]()#+\-.!]/g,"\\$&")}:{value:e.value}:{value:"```"+e.language+`
`+e.value+"\n```\n"}}function nt(e){if(!!e)return Array.isArray(e)?e.map(Pe):[Pe(e)]}var De=class{constructor(e){this._worker=e}provideDocumentHighlights(e,n,i){const r=e.uri;return this._worker(r).then(t=>t.findDocumentHighlights(r.toString(),L(n))).then(t=>{if(!!t)return t.map(a=>({range:w(a.range),kind:it(a.kind)}))})}};function it(e){switch(e){case P.Read:return d.languages.DocumentHighlightKind.Read;case P.Write:return d.languages.DocumentHighlightKind.Write;case P.Text:return d.languages.DocumentHighlightKind.Text}return d.languages.DocumentHighlightKind.Text}var Le=class{constructor(e){this._worker=e}provideRenameEdits(e,n,i,r){const t=e.uri;return this._worker(t).then(a=>a.doRename(t.toString(),L(n),i)).then(a=>at(a))}};function at(e){if(!e||!e.changes)return;let n=[];for(let i in e.changes){const r=d.Uri.parse(i);for(let t of e.changes[i])n.push({resource:r,edit:{range:w(t.range),text:t.newText}})}return{edits:n}}var Me=class{constructor(e){this._worker=e}provideDocumentSymbols(e,n){const i=e.uri;return this._worker(i).then(r=>r.findDocumentSymbols(i.toString())).then(r=>{if(!!r)return r.map(t=>({name:t.name,detail:"",containerName:t.containerName,kind:ot(t.kind),range:w(t.location.range),selectionRange:w(t.location.range),tags:[]}))})}};function ot(e){let n=d.languages.SymbolKind;switch(e){case h.File:return n.Array;case h.Module:return n.Module;case h.Namespace:return n.Namespace;case h.Package:return n.Package;case h.Class:return n.Class;case h.Method:return n.Method;case h.Property:return n.Property;case h.Field:return n.Field;case h.Constructor:return n.Constructor;case h.Enum:return n.Enum;case h.Interface:return n.Interface;case h.Function:return n.Function;case h.Variable:return n.Variable;case h.Constant:return n.Constant;case h.String:return n.String;case h.Number:return n.Number;case h.Boolean:return n.Boolean;case h.Array:return n.Array}return n.Function}var Se=class{constructor(e){this._worker=e}provideLinks(e,n){const i=e.uri;return this._worker(i).then(r=>r.findDocumentLinks(i.toString())).then(r=>{if(!!r)return{links:r.map(t=>({range:w(t.range),url:t.target}))}})}},je=class{constructor(e){this._worker=e}provideDocumentFormattingEdits(e,n,i){const r=e.uri;return this._worker(r).then(t=>t.format(r.toString(),null,We(n)).then(a=>{if(!(!a||a.length===0))return a.map(q)}))}},Ne=class{constructor(e){this._worker=e}provideDocumentRangeFormattingEdits(e,n,i,r){const t=e.uri;return this._worker(t).then(a=>a.format(t.toString(),Ze(n),We(i)).then(s=>{if(!(!s||s.length===0))return s.map(q)}))}};function We(e){return{tabSize:e.tabSize,insertSpaces:e.insertSpaces}}var He=class{constructor(e){this._worker=e}provideFoldingRanges(e,n,i){const r=e.uri;return this._worker(r).then(t=>t.getFoldingRanges(r.toString(),n)).then(t=>{if(!!t)return t.map(a=>{const s={start:a.startLine+1,end:a.endLine+1};return typeof a.kind<"u"&&(s.kind=st(a.kind)),s})})}};function st(e){switch(e){case y.Comment:return d.languages.FoldingRangeKind.Comment;case y.Imports:return d.languages.FoldingRangeKind.Imports;case y.Region:return d.languages.FoldingRangeKind.Region}}var Oe=class{constructor(e){this._worker=e}provideSelectionRanges(e,n,i){const r=e.uri;return this._worker(r).then(t=>t.getSelectionRanges(r.toString(),n.map(L))).then(t=>{if(!!t)return t.map(a=>{const s=[];for(;a;)s.push({range:w(a.range)}),a=a.parent;return s})})}},Ue=class extends Ye{constructor(e){super(e,[".",":","<",'"',"=","/"])}};function ct(e){const n=new Fe(e),i=(...t)=>n.getLanguageServiceWorker(...t);let r=e.languageId;d.languages.registerCompletionItemProvider(r,new Ue(i)),d.languages.registerHoverProvider(r,new Te(i)),d.languages.registerDocumentHighlightProvider(r,new De(i)),d.languages.registerLinkProvider(r,new Se(i)),d.languages.registerFoldingRangeProvider(r,new He(i)),d.languages.registerDocumentSymbolProvider(r,new Me(i)),d.languages.registerSelectionRangeProvider(r,new Oe(i)),d.languages.registerRenameProvider(r,new Le(i)),r==="html"&&(d.languages.registerDocumentFormattingEditProvider(r,new je(i)),d.languages.registerDocumentRangeFormattingEditProvider(r,new Ne(i)))}function dt(e){const n=[],i=[],r=new Fe(e);n.push(r);const t=(...s)=>r.getLanguageServiceWorker(...s);function a(){const{languageId:s,modeConfiguration:u}=e;Ve(i),u.completionItems&&i.push(d.languages.registerCompletionItemProvider(s,new Ue(t))),u.hovers&&i.push(d.languages.registerHoverProvider(s,new Te(t))),u.documentHighlights&&i.push(d.languages.registerDocumentHighlightProvider(s,new De(t))),u.links&&i.push(d.languages.registerLinkProvider(s,new Se(t))),u.documentSymbols&&i.push(d.languages.registerDocumentSymbolProvider(s,new Me(t))),u.rename&&i.push(d.languages.registerRenameProvider(s,new Le(t))),u.foldingRanges&&i.push(d.languages.registerFoldingRangeProvider(s,new He(t))),u.selectionRanges&&i.push(d.languages.registerSelectionRangeProvider(s,new Oe(t))),u.documentFormattingEdits&&i.push(d.languages.registerDocumentFormattingEditProvider(s,new je(t))),u.documentRangeFormattingEdits&&i.push(d.languages.registerDocumentRangeFormattingEditProvider(s,new Ne(t)))}return a(),n.push(Ie(i)),Ie(n)}function Ie(e){return{dispose:()=>Ve(e)}}function Ve(e){for(;e.length;)e.pop().dispose()}export{dt as setupMode,ct as setupMode1};
