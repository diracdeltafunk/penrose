var c=Object.defineProperty;var d=(i,e,s)=>e in i?c(i,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):i[e]=s;var t=(i,e,s)=>(d(i,typeof e!="symbol"?e+"":e,s),s);import{b as h,p as m,s as u,d as f,e as S,r as v,R as y,f as g,g as C}from"./PenrosePrograms.b9c01514.js";import{R as o}from"./index.b8d87d4b.js";import{j as a,a as l}from"./jsx-runtime.ae1cdb03.js";async function p(i){const e=await fetch(i);if(!e.ok){console.error(`could not fetch ${i}`);return}return await e.text()}class r extends o.Component{constructor(e){super(e);t(this,"canvasRef",o.createRef());t(this,"penroseState");t(this,"timerID");t(this,"compile",async()=>{this.penroseState=void 0;const e=h(this.props);e.isOk()?this.penroseState=await m(e.value):this.setState({error:e.error})});t(this,"converge",async()=>{if(this.penroseState){const e=u(this.penroseState);e.isOk()?this.penroseState=e.value:this.setState({error:e.error})}});t(this,"tick",()=>{this.props.animate&&this.penroseState&&!f(this.penroseState)&&(this.penroseState=S(this.penroseState,1),this.renderCanvas())});t(this,"componentDidMount",async()=>{await this.compile(),this.props.animate||await this.converge(),this.renderCanvas(),this.timerID=window.setInterval(()=>this.tick(),1e3/60)});t(this,"componentDidUpdate",async e=>{(this.props.domain!==e.domain||this.props.substance!==e.substance||this.props.style!==e.style)&&(await this.compile(),this.props.animate||await this.converge(),this.renderCanvas()),this.penroseState&&!this.state.error&&(this.props.variation!==e.variation||this.props.animate!==e.animate?(this.penroseState.variation=this.props.variation,this.penroseState=v(this.penroseState),this.props.animate||await this.converge(),this.renderCanvas()):this.props.interactive!==e.interactive&&this.renderCanvas())});t(this,"componentWillUnmount",()=>{clearInterval(this.timerID)});t(this,"renderCanvas",async()=>{if(this.canvasRef.current===null)return a("div",{children:"rendering..."});{const e=this.canvasRef.current;if(this.penroseState){const s=await(this.props.interactive===!1?y(this.penroseState,p):g(this.penroseState,async n=>{this.penroseState=n,this.props.animate||await this.converge(),this.renderCanvas()},p));e.firstChild!==null?e.replaceChild(s,e.firstChild):e.appendChild(s)}else console.log("state is undefined")}});t(this,"render",()=>{const{error:e}=this.state;return l("div",{style:{width:"100%",height:"100%"},children:[!e&&a("div",{style:{width:"100%",height:"100%"},ref:this.canvasRef}),e&&l("div",{style:{padding:"1em",height:"100%"},children:[a("div",{style:{fontWeight:700},children:"1 error:"}),a("div",{style:{fontFamily:"monospace"},children:C(e).toString().split(`
`).map((s,n)=>a("p",{style:{margin:0},children:s},`err-ln-${n}`))})]})]})});this.state={error:void 0}}}try{r.displayName="Simple",r.__docgenInfo={description:"",displayName:"Simple",props:{domain:{defaultValue:null,description:"",name:"domain",required:!0,type:{name:"string"}},substance:{defaultValue:null,description:"",name:"substance",required:!0,type:{name:"string"}},style:{defaultValue:null,description:"",name:"style",required:!0,type:{name:"string"}},variation:{defaultValue:null,description:"",name:"variation",required:!0,type:{name:"string"}},interactive:{defaultValue:null,description:"",name:"interactive",required:!1,type:{name:"boolean"}},animate:{defaultValue:null,description:"",name:"animate",required:!1,type:{name:"boolean"}}}},typeof STORYBOOK_REACT_CLASSES!="undefined"&&(STORYBOOK_REACT_CLASSES["src/Simple.tsx#Simple"]={docgenInfo:r.__docgenInfo,name:"Simple",path:"src/Simple.tsx#Simple"})}catch{}export{r as S};
//# sourceMappingURL=Simple.3029c536.js.map
