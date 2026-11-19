/* Shows fractions in lesson text as stacked fractions (3 over 4) and mixed numbers (2 with 1 over 4).
   Typed answers still use a slash: 3/4 and 2 1/4. Plain text is kept inside any element with class "nf". */
(function(){
  var css=document.createElement('style');
  css.textContent='.fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.05;margin:0 .12em;font-size:.92em;font-weight:inherit}'
   +'.fr>span{display:block;padding:0 .22em;text-align:center}.fr>span:first-child{border-bottom:2px solid currentColor;padding-bottom:.06em}.fr>span:last-child{padding-top:.06em}'
   +'.mx{display:inline-flex;align-items:center;white-space:nowrap;margin:0 .06em}.mx>.mw{font-size:1.1em;margin-right:.1em}'
   +'.fhelp{font-size:13px;color:#5a6b78;margin:4px 0 0}';
  document.head.appendChild(css);
  var RE=/(^|[^\d./])(?:(\d+)\s+)?(\d+)\/(\d+)(?![\d/])/g;
  var SKIP={INPUT:1,TEXTAREA:1,SCRIPT:1,STYLE:1,SELECT:1,OPTION:1,TITLE:1,svg:1,text:1,tspan:1,SVG:1};
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function stack(n,d){return '<span class="fr" aria-label="'+n+'/'+d+'"><span>'+n+'</span><span>'+d+'</span></span>';}
  function conv(t){
    /* sentences that tell the reader how to TYPE an answer stay plain */
    var parts=t.split(/(?<=[.?!])\s+/),out=[],i;
    for(i=0;i<parts.length;i++){
      var p=parts[i];
      if(/^(Enter|Type|Write answers)\b/.test(p)){out.push(esc(p));continue;}
      var last=0,m,h='';RE.lastIndex=0;
      while((m=RE.exec(p))){
        h+=esc(p.slice(last,m.index))+esc(m[1]);
        h+=m[2]?'<span class="mx"><span class="mw">'+m[2]+'</span>'+stack(m[3],m[4])+'</span>':stack(m[3],m[4]);
        last=RE.lastIndex;
      }
      out.push(h+esc(p.slice(last)));
    }
    return out.join(' ');
  }
  function walk(root){
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      if(!/\d\/\d/.test(n.nodeValue))return NodeFilter.FILTER_REJECT;
      for(var e=n.parentNode;e&&e!==document.body;e=e.parentNode){
        if(SKIP[e.nodeName]||(e.classList&&(e.classList.contains('nf')||e.classList.contains('fr'))))return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;}});
    var list=[],n;while((n=w.nextNode()))list.push(n);
    list.forEach(function(n){
      var h=conv(n.nodeValue);if(!/class="(fr|mx)"/.test(h))return;
      var s=document.createElement('span');s.innerHTML=h;
      var f=document.createDocumentFragment();while(s.firstChild)f.appendChild(s.firstChild);
      n.parentNode.replaceChild(f,n);
    });
  }
  function helps(){
    var ins=document.querySelectorAll('input[id^="in-"][inputmode="text"]');
    ins.forEach(function(i){
      i.placeholder='Type like 3/4 or 2 1/4';
      var host=i.parentNode;if(host.querySelector('.fhelp'))return;
      var d=document.createElement('div');d.className='fhelp nf';d.textContent='Type a fraction with a slash, like 3/4. Type a mixed number with a space, like 2 1/4.';
      i.insertAdjacentElement('afterend',d);
    });
  }
  var busy=false,obs;
  function run(){
    if(busy)return;busy=true;if(obs)obs.disconnect();
    try{walk(document.body);helps();}catch(e){}
    busy=false;if(obs)obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  var q=0;function later(){if(q)return;q=requestAnimationFrame(function(){q=0;run();});}
  function start(){obs=new MutationObserver(later);run();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
(function(){var c=document.createElement('style');c.textContent='.fin{display:inline-flex;flex-direction:column;align-items:center;gap:5px;margin:0 4px}.fin i{display:block;width:100%;height:3px;background:#2B3A44;border-radius:2px}.fin input.num{width:66px;text-align:center}.fin input.num[disabled]{background:#EEF3F6;color:#2B3A44;opacity:1}.row input.num.whole{width:66px;text-align:center}';document.head.appendChild(c);})();
