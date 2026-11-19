// Only our own shell executes JavaScript. API HTML is rebuilt using an allowlist;
// its scripts, styles, event handlers and external URLs never enter the live DOM.
export const scriptValue = (value: string) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

export function materialHtml(content: string | null, video = false) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https:; media-src https:; script-src 'nonce-mindy'; style-src 'nonce-mindy'; connect-src 'none'; base-uri 'none'; form-action 'none'">
<style nonce="mindy">body{font:16px/1.7 sans-serif;color:#173c32;margin:12px;overflow-wrap:anywhere}img,video{max-width:100%}img{min-height:40px}video{width:100%;background:#111}pre{white-space:pre-wrap}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:6px}blockquote{border-left:3px solid #ddd;padding-left:12px}</style></head>
<body><main id="content"></main><script nonce="mindy">
const send=(value)=>window.ReactNativeWebView.postMessage(JSON.stringify(value));
const root=document.getElementById('content');
if(${video}){
 const player=document.createElement('video');player.controls=true;player.preload='metadata';player.setAttribute('playsinline','');root.appendChild(player);
 player.addEventListener('error',()=>send({type:'videoError',time:player.currentTime||0}));
 window.resolveVideo=(url,time)=>{player.src=url;player.addEventListener('loadedmetadata',()=>{if(time)player.currentTime=time;},{once:true});player.load();};
 send({type:'videoReady'});
}else{
 const template=document.createElement('template');template.innerHTML=${scriptValue(content ?? '')};
 const allowed=new Set('P DIV SPAN BR HR H1 H2 H3 H4 H5 H6 STRONG B EM I U S UL OL LI BLOCKQUOTE PRE CODE TABLE THEAD TBODY TR TD TH FIGURE FIGCAPTION IMG A SUB SUP'.split(' '));
 const blocked=new Set('SCRIPT STYLE IFRAME OBJECT EMBED SVG MATH FORM INPUT BUTTON LINK META BASE AUDIO VIDEO SOURCE'.split(' '));
 function copy(node,parent){
  if(node.nodeType===3){parent.appendChild(document.createTextNode(node.textContent));return;}
  if(node.nodeType!==1||blocked.has(node.tagName))return;
  if(!allowed.has(node.tagName)){Array.from(node.childNodes).forEach(child=>copy(child,parent));return;}
  const el=document.createElement(node.tagName==='A'?'span':node.tagName);
  if(node.tagName==='IMG'){
   const id=node.getAttribute('data-file-id');if(!id)return;
   el.alt=node.getAttribute('alt')||'';el.dataset.fileId=id;
   // Duplicate occurrences share the same capability.
   el.addEventListener('error',()=>send({type:'imageError',fileId:id}));
  }
  Array.from(node.childNodes).forEach(child=>copy(child,el));parent.appendChild(el);
 }
 Array.from(template.content.childNodes).forEach(node=>copy(node,root));
 window.resolveImage=(id,url)=>{root.querySelectorAll('img').forEach(img=>{if(img.dataset.fileId===id)img.src=url;});};
 const requested=new Set();
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const id=entry.target.dataset.fileId;if(!requested.has(id)){requested.add(id);send({type:'image',fileId:id});}observer.unobserve(entry.target);}}));
 root.querySelectorAll('img').forEach(img=>observer.observe(img));
}
</script></body></html>`;
}
