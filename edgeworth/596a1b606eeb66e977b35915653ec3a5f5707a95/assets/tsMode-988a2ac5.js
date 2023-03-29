import{m as j,_ as B}from"./index-adb758ab.js";var M=Object.defineProperty,U=Object.getOwnPropertyDescriptor,J=Object.getOwnPropertyNames,$=Object.prototype.hasOwnProperty,z=e=>M(e,"__esModule",{value:!0}),X=(e,t,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of J(t))!$.call(e,s)&&s!=="default"&&M(e,s,{get:()=>t[s],enumerable:!(r=U(t,s))||r.enumerable});return e},i={};z(i);X(i,j);var G=class{constructor(e,t){this._modeId=e,this._defaults=t,this._worker=null,this._client=null,this._configChangeListener=this._defaults.onDidChange(()=>this._stopWorker()),this._updateExtraLibsToken=0,this._extraLibsChangeListener=this._defaults.onDidExtraLibsChange(()=>this._updateExtraLibs())}_stopWorker(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null}dispose(){this._configChangeListener.dispose(),this._extraLibsChangeListener.dispose(),this._stopWorker()}async _updateExtraLibs(){if(!this._worker)return;const e=++this._updateExtraLibsToken,t=await this._worker.getProxy();this._updateExtraLibsToken===e&&t.updateExtraLibs(this._defaults.getExtraLibs())}_getClient(){if(!this._client){this._worker=i.editor.createWebWorker({moduleId:"vs/language/typescript/tsWorker",label:this._modeId,keepIdleModels:!0,createData:{compilerOptions:this._defaults.getCompilerOptions(),extraLibs:this._defaults.getExtraLibs(),customWorkerPath:this._defaults.workerOptions.customWorkerPath,inlayHintsOptions:this._defaults.inlayHintsOptions}});let e=this._worker.getProxy();this._defaults.getEagerModelSync()&&(e=e.then(t=>this._worker?this._worker.withSyncedResources(i.editor.getModels().filter(r=>r.getLanguageId()===this._modeId).map(r=>r.uri)):t)),this._client=e}return this._client}getLanguageServiceWorker(...e){let t;return this._getClient().then(r=>{t=r}).then(r=>{if(this._worker)return this._worker.withSyncedResources(e)}).then(r=>t)}},Q="4.4.4",C;(function(e){e[e.None=0]="None",e[e.CommonJS=1]="CommonJS",e[e.AMD=2]="AMD",e[e.UMD=3]="UMD",e[e.System=4]="System",e[e.ES2015=5]="ES2015",e[e.ESNext=99]="ESNext"})(C||(C={}));var L;(function(e){e[e.None=0]="None",e[e.Preserve=1]="Preserve",e[e.React=2]="React",e[e.ReactNative=3]="ReactNative",e[e.ReactJSX=4]="ReactJSX",e[e.ReactJSXDev=5]="ReactJSXDev"})(L||(L={}));var D;(function(e){e[e.CarriageReturnLineFeed=0]="CarriageReturnLineFeed",e[e.LineFeed=1]="LineFeed"})(D||(D={}));var O;(function(e){e[e.ES3=0]="ES3",e[e.ES5=1]="ES5",e[e.ES2015=2]="ES2015",e[e.ES2016=3]="ES2016",e[e.ES2017=4]="ES2017",e[e.ES2018=5]="ES2018",e[e.ES2019=6]="ES2019",e[e.ES2020=7]="ES2020",e[e.ESNext=99]="ESNext",e[e.JSON=100]="JSON",e[e.Latest=99]="Latest"})(O||(O={}));var A;(function(e){e[e.Classic=1]="Classic",e[e.NodeJs=2]="NodeJs"})(A||(A={}));var R=class{constructor(e,t,r,s){this._onDidChange=new i.Emitter,this._onDidExtraLibsChange=new i.Emitter,this._extraLibs=Object.create(null),this._removedExtraLibs=Object.create(null),this._eagerModelSync=!1,this.setCompilerOptions(e),this.setDiagnosticsOptions(t),this.setWorkerOptions(r),this.setInlayHintsOptions(s),this._onDidExtraLibsChangeTimeout=-1}get onDidChange(){return this._onDidChange.event}get onDidExtraLibsChange(){return this._onDidExtraLibsChange.event}get workerOptions(){return this._workerOptions}get inlayHintsOptions(){return this._inlayHintsOptions}getExtraLibs(){return this._extraLibs}addExtraLib(e,t){let r;if(typeof t>"u"?r=`ts:extralib-${Math.random().toString(36).substring(2,15)}`:r=t,this._extraLibs[r]&&this._extraLibs[r].content===e)return{dispose:()=>{}};let s=1;return this._removedExtraLibs[r]&&(s=this._removedExtraLibs[r]+1),this._extraLibs[r]&&(s=this._extraLibs[r].version+1),this._extraLibs[r]={content:e,version:s},this._fireOnDidExtraLibsChangeSoon(),{dispose:()=>{let a=this._extraLibs[r];!a||a.version===s&&(delete this._extraLibs[r],this._removedExtraLibs[r]=s,this._fireOnDidExtraLibsChangeSoon())}}}setExtraLibs(e){for(const t in this._extraLibs)this._removedExtraLibs[t]=this._extraLibs[t].version;if(this._extraLibs=Object.create(null),e&&e.length>0)for(const t of e){const r=t.filePath||`ts:extralib-${Math.random().toString(36).substring(2,15)}`,s=t.content;let a=1;this._removedExtraLibs[r]&&(a=this._removedExtraLibs[r]+1),this._extraLibs[r]={content:s,version:a}}this._fireOnDidExtraLibsChangeSoon()}_fireOnDidExtraLibsChangeSoon(){this._onDidExtraLibsChangeTimeout===-1&&(this._onDidExtraLibsChangeTimeout=window.setTimeout(()=>{this._onDidExtraLibsChangeTimeout=-1,this._onDidExtraLibsChange.fire(void 0)},0))}getCompilerOptions(){return this._compilerOptions}setCompilerOptions(e){this._compilerOptions=e||Object.create(null),this._onDidChange.fire(void 0)}getDiagnosticsOptions(){return this._diagnosticsOptions}setDiagnosticsOptions(e){this._diagnosticsOptions=e||Object.create(null),this._onDidChange.fire(void 0)}setWorkerOptions(e){this._workerOptions=e||Object.create(null),this._onDidChange.fire(void 0)}setInlayHintsOptions(e){this._inlayHintsOptions=e||Object.create(null),this._onDidChange.fire(void 0)}setMaximumWorkerIdleTime(e){}setEagerModelSync(e){this._eagerModelSync=e}getEagerModelSync(){return this._eagerModelSync}},q=Q,N=new R({allowNonTsExtensions:!0,target:99},{noSemanticValidation:!1,noSyntaxValidation:!1,onlyVisible:!1},{},{}),H=new R({allowNonTsExtensions:!0,allowJs:!0,target:99},{noSemanticValidation:!0,noSyntaxValidation:!1,onlyVisible:!1},{},{}),Y=()=>x().then(e=>e.getTypeScriptWorker()),Z=()=>x().then(e=>e.getJavaScriptWorker());i.languages.typescript={ModuleKind:C,JsxEmit:L,NewLineKind:D,ScriptTarget:O,ModuleResolutionKind:A,typescriptVersion:q,typescriptDefaults:N,javascriptDefaults:H,getTypeScriptWorker:Y,getJavaScriptWorker:Z};function x(){return B(()=>Promise.resolve().then(()=>be),void 0,import.meta.url)}i.languages.onLanguage("typescript",()=>x().then(e=>e.setupTypeScript(N)));i.languages.onLanguage("javascript",()=>x().then(e=>e.setupJavaScript(H)));var o={};o["lib.d.ts"]=!0;o["lib.dom.d.ts"]=!0;o["lib.dom.iterable.d.ts"]=!0;o["lib.es2015.collection.d.ts"]=!0;o["lib.es2015.core.d.ts"]=!0;o["lib.es2015.d.ts"]=!0;o["lib.es2015.generator.d.ts"]=!0;o["lib.es2015.iterable.d.ts"]=!0;o["lib.es2015.promise.d.ts"]=!0;o["lib.es2015.proxy.d.ts"]=!0;o["lib.es2015.reflect.d.ts"]=!0;o["lib.es2015.symbol.d.ts"]=!0;o["lib.es2015.symbol.wellknown.d.ts"]=!0;o["lib.es2016.array.include.d.ts"]=!0;o["lib.es2016.d.ts"]=!0;o["lib.es2016.full.d.ts"]=!0;o["lib.es2017.d.ts"]=!0;o["lib.es2017.full.d.ts"]=!0;o["lib.es2017.intl.d.ts"]=!0;o["lib.es2017.object.d.ts"]=!0;o["lib.es2017.sharedmemory.d.ts"]=!0;o["lib.es2017.string.d.ts"]=!0;o["lib.es2017.typedarrays.d.ts"]=!0;o["lib.es2018.asyncgenerator.d.ts"]=!0;o["lib.es2018.asynciterable.d.ts"]=!0;o["lib.es2018.d.ts"]=!0;o["lib.es2018.full.d.ts"]=!0;o["lib.es2018.intl.d.ts"]=!0;o["lib.es2018.promise.d.ts"]=!0;o["lib.es2018.regexp.d.ts"]=!0;o["lib.es2019.array.d.ts"]=!0;o["lib.es2019.d.ts"]=!0;o["lib.es2019.full.d.ts"]=!0;o["lib.es2019.object.d.ts"]=!0;o["lib.es2019.string.d.ts"]=!0;o["lib.es2019.symbol.d.ts"]=!0;o["lib.es2020.bigint.d.ts"]=!0;o["lib.es2020.d.ts"]=!0;o["lib.es2020.full.d.ts"]=!0;o["lib.es2020.intl.d.ts"]=!0;o["lib.es2020.promise.d.ts"]=!0;o["lib.es2020.sharedmemory.d.ts"]=!0;o["lib.es2020.string.d.ts"]=!0;o["lib.es2020.symbol.wellknown.d.ts"]=!0;o["lib.es2021.d.ts"]=!0;o["lib.es2021.full.d.ts"]=!0;o["lib.es2021.promise.d.ts"]=!0;o["lib.es2021.string.d.ts"]=!0;o["lib.es2021.weakref.d.ts"]=!0;o["lib.es5.d.ts"]=!0;o["lib.es6.d.ts"]=!0;o["lib.esnext.d.ts"]=!0;o["lib.esnext.full.d.ts"]=!0;o["lib.esnext.intl.d.ts"]=!0;o["lib.esnext.promise.d.ts"]=!0;o["lib.esnext.string.d.ts"]=!0;o["lib.esnext.weakref.d.ts"]=!0;o["lib.scripthost.d.ts"]=!0;o["lib.webworker.d.ts"]=!0;o["lib.webworker.importscripts.d.ts"]=!0;o["lib.webworker.iterable.d.ts"]=!0;var T;(function(e){e[e.None=0]="None",e[e.Block=1]="Block",e[e.Smart=2]="Smart"})(T||(T={}));function E(e,t,r=0){if(typeof e=="string")return e;if(e===void 0)return"";let s="";if(r){s+=t;for(let a=0;a<r;a++)s+="  "}if(s+=e.messageText,r++,e.next)for(const a of e.next)s+=E(a,t,r);return s}function _(e){return e?e.map(t=>t.text).join(""):""}var m=class{constructor(e){this._worker=e}_textSpanToRange(e,t){let r=e.getPositionAt(t.start),s=e.getPositionAt(t.start+t.length),{lineNumber:a,column:d}=r,{lineNumber:g,column:n}=s;return{startLineNumber:a,startColumn:d,endLineNumber:g,endColumn:n}}},ee=class{constructor(e){this._worker=e,this._libFiles={},this._hasFetchedLibFiles=!1,this._fetchLibFilesPromise=null}isLibFile(e){return e&&e.path.indexOf("/lib.")===0?!!o[e.path.slice(1)]:!1}getOrCreateModel(e){const t=i.Uri.parse(e),r=i.editor.getModel(t);if(r)return r;if(this.isLibFile(t)&&this._hasFetchedLibFiles)return i.editor.createModel(this._libFiles[t.path.slice(1)],"typescript",t);const s=N.getExtraLibs()[e];return s?i.editor.createModel(s.content,"typescript",t):null}_containsLibFile(e){for(let t of e)if(this.isLibFile(t))return!0;return!1}async fetchLibFilesIfNecessary(e){!this._containsLibFile(e)||await this._fetchLibFiles()}_fetchLibFiles(){return this._fetchLibFilesPromise||(this._fetchLibFilesPromise=this._worker().then(e=>e.getLibFiles()).then(e=>{this._hasFetchedLibFiles=!0,this._libFiles=e})),this._fetchLibFilesPromise}},I;(function(e){e[e.Warning=0]="Warning",e[e.Error=1]="Error",e[e.Suggestion=2]="Suggestion",e[e.Message=3]="Message"})(I||(I={}));var te=class extends m{constructor(e,t,r,s){super(s),this._libFiles=e,this._defaults=t,this._selector=r,this._disposables=[],this._listener=Object.create(null);const a=n=>{if(n.getLanguageId()!==r)return;const u=()=>{const{onlyVisible:h}=this._defaults.getDiagnosticsOptions();h?n.isAttachedToEditor()&&this._doValidate(n):this._doValidate(n)};let c;const p=n.onDidChangeContent(()=>{clearTimeout(c),c=window.setTimeout(u,500)}),f=n.onDidChangeAttached(()=>{const{onlyVisible:h}=this._defaults.getDiagnosticsOptions();h&&(n.isAttachedToEditor()?u():i.editor.setModelMarkers(n,this._selector,[]))});this._listener[n.uri.toString()]={dispose(){p.dispose(),f.dispose(),clearTimeout(c)}},u()},d=n=>{i.editor.setModelMarkers(n,this._selector,[]);const u=n.uri.toString();this._listener[u]&&(this._listener[u].dispose(),delete this._listener[u])};this._disposables.push(i.editor.onDidCreateModel(n=>a(n))),this._disposables.push(i.editor.onWillDisposeModel(d)),this._disposables.push(i.editor.onDidChangeModelLanguage(n=>{d(n.model),a(n.model)})),this._disposables.push({dispose(){for(const n of i.editor.getModels())d(n)}});const g=()=>{for(const n of i.editor.getModels())d(n),a(n)};this._disposables.push(this._defaults.onDidChange(g)),this._disposables.push(this._defaults.onDidExtraLibsChange(g)),i.editor.getModels().forEach(n=>a(n))}dispose(){this._disposables.forEach(e=>e&&e.dispose()),this._disposables=[]}async _doValidate(e){const t=await this._worker(e.uri);if(e.isDisposed())return;const r=[],{noSyntaxValidation:s,noSemanticValidation:a,noSuggestionDiagnostics:d}=this._defaults.getDiagnosticsOptions();s||r.push(t.getSyntacticDiagnostics(e.uri.toString())),a||r.push(t.getSemanticDiagnostics(e.uri.toString())),d||r.push(t.getSuggestionDiagnostics(e.uri.toString()));const g=await Promise.all(r);if(!g||e.isDisposed())return;const n=g.reduce((c,p)=>p.concat(c),[]).filter(c=>(this._defaults.getDiagnosticsOptions().diagnosticCodesToIgnore||[]).indexOf(c.code)===-1),u=n.map(c=>c.relatedInformation||[]).reduce((c,p)=>p.concat(c),[]).map(c=>c.file?i.Uri.parse(c.file.fileName):null);await this._libFiles.fetchLibFilesIfNecessary(u),!e.isDisposed()&&i.editor.setModelMarkers(e,this._selector,n.map(c=>this._convertDiagnostics(e,c)))}_convertDiagnostics(e,t){const r=t.start||0,s=t.length||1,{lineNumber:a,column:d}=e.getPositionAt(r),{lineNumber:g,column:n}=e.getPositionAt(r+s),u=[];return t.reportsUnnecessary&&u.push(i.MarkerTag.Unnecessary),t.reportsDeprecated&&u.push(i.MarkerTag.Deprecated),{severity:this._tsDiagnosticCategoryToMarkerSeverity(t.category),startLineNumber:a,startColumn:d,endLineNumber:g,endColumn:n,message:E(t.messageText,`
`),code:t.code.toString(),tags:u,relatedInformation:this._convertRelatedInformation(e,t.relatedInformation)}}_convertRelatedInformation(e,t){if(!t)return[];const r=[];return t.forEach(s=>{let a=e;if(s.file&&(a=this._libFiles.getOrCreateModel(s.file.fileName)),!a)return;const d=s.start||0,g=s.length||1,{lineNumber:n,column:u}=a.getPositionAt(d),{lineNumber:c,column:p}=a.getPositionAt(d+g);r.push({resource:a.uri,startLineNumber:n,startColumn:u,endLineNumber:c,endColumn:p,message:E(s.messageText,`
`)})}),r}_tsDiagnosticCategoryToMarkerSeverity(e){switch(e){case 1:return i.MarkerSeverity.Error;case 3:return i.MarkerSeverity.Info;case 0:return i.MarkerSeverity.Warning;case 2:return i.MarkerSeverity.Hint}return i.MarkerSeverity.Info}},k=class extends m{get triggerCharacters(){return["."]}async provideCompletionItems(e,t,r,s){const a=e.getWordUntilPosition(t),d=new i.Range(t.lineNumber,a.startColumn,t.lineNumber,a.endColumn),g=e.uri,n=e.getOffsetAt(t),u=await this._worker(g);if(e.isDisposed())return;const c=await u.getCompletionsAtPosition(g.toString(),n);return!c||e.isDisposed()?void 0:{suggestions:c.entries.map(f=>{let h=d;if(f.replacementSpan){const w=e.getPositionAt(f.replacementSpan.start),y=e.getPositionAt(f.replacementSpan.start+f.replacementSpan.length);h=new i.Range(w.lineNumber,w.column,y.lineNumber,y.column)}const S=[];return f.kindModifiers?.indexOf("deprecated")!==-1&&S.push(i.languages.CompletionItemTag.Deprecated),{uri:g,position:t,offset:n,range:h,label:f.name,insertText:f.name,sortText:f.sortText,kind:k.convertKind(f.kind),tags:S}})}}async resolveCompletionItem(e,t){const r=e,s=r.uri,a=r.position,d=r.offset,n=await(await this._worker(s)).getCompletionEntryDetails(s.toString(),d,r.label);return n?{uri:s,position:a,label:n.name,kind:k.convertKind(n.kind),detail:_(n.displayParts),documentation:{value:k.createDocumentationString(n)}}:r}static convertKind(e){switch(e){case l.primitiveType:case l.keyword:return i.languages.CompletionItemKind.Keyword;case l.variable:case l.localVariable:return i.languages.CompletionItemKind.Variable;case l.memberVariable:case l.memberGetAccessor:case l.memberSetAccessor:return i.languages.CompletionItemKind.Field;case l.function:case l.memberFunction:case l.constructSignature:case l.callSignature:case l.indexSignature:return i.languages.CompletionItemKind.Function;case l.enum:return i.languages.CompletionItemKind.Enum;case l.module:return i.languages.CompletionItemKind.Module;case l.class:return i.languages.CompletionItemKind.Class;case l.interface:return i.languages.CompletionItemKind.Interface;case l.warning:return i.languages.CompletionItemKind.File}return i.languages.CompletionItemKind.Property}static createDocumentationString(e){let t=_(e.documentation);if(e.tags)for(const r of e.tags)t+=`

${W(r)}`;return t}};function W(e){let t=`*@${e.name}*`;if(e.name==="param"&&e.text){const[r,...s]=e.text;t+=`\`${r.text}\``,s.length>0&&(t+=` — ${s.map(a=>a.text).join(" ")}`)}else Array.isArray(e.text)?t+=` — ${e.text.map(r=>r.text).join(" ")}`:e.text&&(t+=` — ${e.text}`);return t}var V=class extends m{constructor(){super(...arguments),this.signatureHelpTriggerCharacters=["(",","]}static _toSignatureHelpTriggerReason(e){switch(e.triggerKind){case i.languages.SignatureHelpTriggerKind.TriggerCharacter:return e.triggerCharacter?e.isRetrigger?{kind:"retrigger",triggerCharacter:e.triggerCharacter}:{kind:"characterTyped",triggerCharacter:e.triggerCharacter}:{kind:"invoked"};case i.languages.SignatureHelpTriggerKind.ContentChange:return e.isRetrigger?{kind:"retrigger"}:{kind:"invoked"};case i.languages.SignatureHelpTriggerKind.Invoke:default:return{kind:"invoked"}}}async provideSignatureHelp(e,t,r,s){const a=e.uri,d=e.getOffsetAt(t),g=await this._worker(a);if(e.isDisposed())return;const n=await g.getSignatureHelpItems(a.toString(),d,{triggerReason:V._toSignatureHelpTriggerReason(s)});if(!n||e.isDisposed())return;const u={activeSignature:n.selectedItemIndex,activeParameter:n.argumentIndex,signatures:[]};return n.items.forEach(c=>{const p={label:"",parameters:[]};p.documentation={value:_(c.documentation)},p.label+=_(c.prefixDisplayParts),c.parameters.forEach((f,h,S)=>{const w=_(f.displayParts),y={label:w,documentation:{value:_(f.documentation)}};p.label+=w,p.parameters.push(y),h<S.length-1&&(p.label+=_(c.separatorDisplayParts))}),p.label+=_(c.suffixDisplayParts),u.signatures.push(p)}),{value:u,dispose(){}}}},re=class extends m{async provideHover(e,t,r){const s=e.uri,a=e.getOffsetAt(t),d=await this._worker(s);if(e.isDisposed())return;const g=await d.getQuickInfoAtPosition(s.toString(),a);if(!g||e.isDisposed())return;const n=_(g.documentation),u=g.tags?g.tags.map(p=>W(p)).join(`  

`):"",c=_(g.displayParts);return{range:this._textSpanToRange(e,g.textSpan),contents:[{value:"```typescript\n"+c+"\n```\n"},{value:n+(u?`

`+u:"")}]}}},se=class extends m{async provideDocumentHighlights(e,t,r){const s=e.uri,a=e.getOffsetAt(t),d=await this._worker(s);if(e.isDisposed())return;const g=await d.getOccurrencesAtPosition(s.toString(),a);if(!(!g||e.isDisposed()))return g.map(n=>({range:this._textSpanToRange(e,n.textSpan),kind:n.isWriteAccess?i.languages.DocumentHighlightKind.Write:i.languages.DocumentHighlightKind.Text}))}},ie=class extends m{constructor(e,t){super(t),this._libFiles=e}async provideDefinition(e,t,r){const s=e.uri,a=e.getOffsetAt(t),d=await this._worker(s);if(e.isDisposed())return;const g=await d.getDefinitionAtPosition(s.toString(),a);if(!g||e.isDisposed()||(await this._libFiles.fetchLibFilesIfNecessary(g.map(u=>i.Uri.parse(u.fileName))),e.isDisposed()))return;const n=[];for(let u of g){const c=this._libFiles.getOrCreateModel(u.fileName);c&&n.push({uri:c.uri,range:this._textSpanToRange(c,u.textSpan)})}return n}},ne=class extends m{constructor(e,t){super(t),this._libFiles=e}async provideReferences(e,t,r,s){const a=e.uri,d=e.getOffsetAt(t),g=await this._worker(a);if(e.isDisposed())return;const n=await g.getReferencesAtPosition(a.toString(),d);if(!n||e.isDisposed()||(await this._libFiles.fetchLibFilesIfNecessary(n.map(c=>i.Uri.parse(c.fileName))),e.isDisposed()))return;const u=[];for(let c of n){const p=this._libFiles.getOrCreateModel(c.fileName);p&&u.push({uri:p.uri,range:this._textSpanToRange(p,c.textSpan)})}return u}},ae=class extends m{async provideDocumentSymbols(e,t){const r=e.uri,s=await this._worker(r);if(e.isDisposed())return;const a=await s.getNavigationBarItems(r.toString());if(!a||e.isDisposed())return;const d=(n,u,c)=>{let p={name:u.text,detail:"",kind:b[u.kind]||i.languages.SymbolKind.Variable,range:this._textSpanToRange(e,u.spans[0]),selectionRange:this._textSpanToRange(e,u.spans[0]),tags:[]};if(c&&(p.containerName=c),u.childItems&&u.childItems.length>0)for(let f of u.childItems)d(n,f,p.name);n.push(p)};let g=[];return a.forEach(n=>d(g,n)),g}},l=class{};l.unknown="";l.keyword="keyword";l.script="script";l.module="module";l.class="class";l.interface="interface";l.type="type";l.enum="enum";l.variable="var";l.localVariable="local var";l.function="function";l.localFunction="local function";l.memberFunction="method";l.memberGetAccessor="getter";l.memberSetAccessor="setter";l.memberVariable="property";l.constructorImplementation="constructor";l.callSignature="call";l.indexSignature="index";l.constructSignature="construct";l.parameter="parameter";l.typeParameter="type parameter";l.primitiveType="primitive type";l.label="label";l.alias="alias";l.const="const";l.let="let";l.warning="warning";var b=Object.create(null);b[l.module]=i.languages.SymbolKind.Module;b[l.class]=i.languages.SymbolKind.Class;b[l.enum]=i.languages.SymbolKind.Enum;b[l.interface]=i.languages.SymbolKind.Interface;b[l.memberFunction]=i.languages.SymbolKind.Method;b[l.memberVariable]=i.languages.SymbolKind.Property;b[l.memberGetAccessor]=i.languages.SymbolKind.Property;b[l.memberSetAccessor]=i.languages.SymbolKind.Property;b[l.variable]=i.languages.SymbolKind.Variable;b[l.const]=i.languages.SymbolKind.Variable;b[l.localVariable]=i.languages.SymbolKind.Variable;b[l.variable]=i.languages.SymbolKind.Variable;b[l.function]=i.languages.SymbolKind.Function;b[l.localFunction]=i.languages.SymbolKind.Function;var v=class extends m{static _convertOptions(e){return{ConvertTabsToSpaces:e.insertSpaces,TabSize:e.tabSize,IndentSize:e.tabSize,IndentStyle:2,NewLineCharacter:`
`,InsertSpaceAfterCommaDelimiter:!0,InsertSpaceAfterSemicolonInForStatements:!0,InsertSpaceBeforeAndAfterBinaryOperators:!0,InsertSpaceAfterKeywordsInControlFlowStatements:!0,InsertSpaceAfterFunctionKeywordForAnonymousFunctions:!0,InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis:!1,InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets:!1,InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces:!1,PlaceOpenBraceOnNewLineForControlBlocks:!1,PlaceOpenBraceOnNewLineForFunctions:!1}}_convertTextChanges(e,t){return{text:t.newText,range:this._textSpanToRange(e,t.span)}}},oe=class extends v{async provideDocumentRangeFormattingEdits(e,t,r,s){const a=e.uri,d=e.getOffsetAt({lineNumber:t.startLineNumber,column:t.startColumn}),g=e.getOffsetAt({lineNumber:t.endLineNumber,column:t.endColumn}),n=await this._worker(a);if(e.isDisposed())return;const u=await n.getFormattingEditsForRange(a.toString(),d,g,v._convertOptions(r));if(!(!u||e.isDisposed()))return u.map(c=>this._convertTextChanges(e,c))}},le=class extends v{get autoFormatTriggerCharacters(){return[";","}",`
`]}async provideOnTypeFormattingEdits(e,t,r,s,a){const d=e.uri,g=e.getOffsetAt(t),n=await this._worker(d);if(e.isDisposed())return;const u=await n.getFormattingEditsAfterKeystroke(d.toString(),g,r,v._convertOptions(s));if(!(!u||e.isDisposed()))return u.map(c=>this._convertTextChanges(e,c))}},ce=class extends v{async provideCodeActions(e,t,r,s){const a=e.uri,d=e.getOffsetAt({lineNumber:t.startLineNumber,column:t.startColumn}),g=e.getOffsetAt({lineNumber:t.endLineNumber,column:t.endColumn}),n=v._convertOptions(e.getOptions()),u=r.markers.filter(h=>h.code).map(h=>h.code).map(Number),c=await this._worker(a);if(e.isDisposed())return;const p=await c.getCodeFixesAtPosition(a.toString(),d,g,u,n);return!p||e.isDisposed()?{actions:[],dispose:()=>{}}:{actions:p.filter(h=>h.changes.filter(S=>S.isNewFile).length===0).map(h=>this._tsCodeFixActionToMonacoCodeAction(e,r,h)),dispose:()=>{}}}_tsCodeFixActionToMonacoCodeAction(e,t,r){const s=[];for(const d of r.changes)for(const g of d.textChanges)s.push({resource:e.uri,edit:{range:this._textSpanToRange(e,g.span),text:g.newText}});return{title:r.description,edit:{edits:s},diagnostics:t.markers,kind:"quickfix"}}},ue=class extends m{constructor(e,t){super(t),this._libFiles=e}async provideRenameEdits(e,t,r,s){const a=e.uri,d=a.toString(),g=e.getOffsetAt(t),n=await this._worker(a);if(e.isDisposed())return;const u=await n.getRenameInfo(d,g,{allowRenameOfImportPath:!1});if(u.canRename===!1)return{edits:[],rejectReason:u.localizedErrorMessage};if(u.fileToRename!==void 0)throw new Error("Renaming files is not supported.");const c=await n.findRenameLocations(d,g,!1,!1,!1);if(!c||e.isDisposed())return;const p=[];for(const f of c){const h=this._libFiles.getOrCreateModel(f.fileName);if(h)p.push({resource:h.uri,edit:{range:this._textSpanToRange(h,f.textSpan),text:r}});else throw new Error(`Unknown file ${f.fileName}.`)}return{edits:p}}},ge=class extends m{async provideInlayHints(e,t,r){const s=e.uri,a=s.toString(),d=e.getOffsetAt({lineNumber:t.startLineNumber,column:t.startColumn}),g=e.getOffsetAt({lineNumber:t.endLineNumber,column:t.endColumn}),n=await this._worker(s);return e.isDisposed()?[]:(await n.provideInlayHints(a,d,g)).map(c=>({...c,position:e.getPositionAt(c.position),kind:this._convertHintKind(c.kind)}))}_convertHintKind(e){switch(e){case"Parameter":return i.languages.InlayHintKind.Parameter;case"Type":return i.languages.InlayHintKind.Type;default:return i.languages.InlayHintKind.Other}}},F,P;function de(e){P=K(e,"typescript")}function pe(e){F=K(e,"javascript")}function fe(){return new Promise((e,t)=>{if(!F)return t("JavaScript not registered!");e(F)})}function he(){return new Promise((e,t)=>{if(!P)return t("TypeScript not registered!");e(P)})}function K(e,t){const r=new G(t,e),s=(...d)=>r.getLanguageServiceWorker(...d),a=new ee(s);return i.languages.registerCompletionItemProvider(t,new k(s)),i.languages.registerSignatureHelpProvider(t,new V(s)),i.languages.registerHoverProvider(t,new re(s)),i.languages.registerDocumentHighlightProvider(t,new se(s)),i.languages.registerDefinitionProvider(t,new ie(a,s)),i.languages.registerReferenceProvider(t,new ne(a,s)),i.languages.registerDocumentSymbolProvider(t,new ae(s)),i.languages.registerDocumentRangeFormattingEditProvider(t,new oe(s)),i.languages.registerOnTypeFormattingEditProvider(t,new le(s)),i.languages.registerCodeActionProvider(t,new ce(s)),i.languages.registerRenameProvider(t,new ue(a,s)),i.languages.registerInlayHintsProvider(t,new ge(s)),new te(a,e,t,s),s}const be=Object.freeze(Object.defineProperty({__proto__:null,getJavaScriptWorker:fe,getTypeScriptWorker:he,setupJavaScript:pe,setupTypeScript:de},Symbol.toStringTag,{value:"Module"}));export{fe as getJavaScriptWorker,he as getTypeScriptWorker,pe as setupJavaScript,de as setupTypeScript};
