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
    var sc=window.FRACTION_SCOPE;
    if(sc&&root===document.body){document.querySelectorAll(sc.join(',')).forEach(function(el){walk(el);});return;}
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
    try{if(window.__fracEnhance)window.__fracEnhance();walk(document.body);helps();}catch(e){}
    busy=false;if(obs)obs.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['disabled']});
  }
  var q=0;function later(){if(q)return;q=requestAnimationFrame(function(){q=0;run();});}
  function start(){obs=new MutationObserver(later);run();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
(function(){var c=document.createElement('style');c.textContent='.fin{display:inline-flex;flex-direction:column;align-items:center;gap:5px;margin:0 4px}.fin i{display:block;width:100%;height:3px;background:#2B3A44;border-radius:2px}.fin input.num{width:66px;text-align:center}.fin input.num[disabled]{background:#EEF3F6;color:#2B3A44;opacity:1}.row input.num.whole{width:66px;text-align:center}';document.head.appendChild(c);})();

/* ---- stacked answer boxes: a top box over a bottom box (and a whole-number box for mixed numbers) ---- */
(function(){
  var c=document.createElement('style');
  c.textContent='.fwid{display:inline-flex;align-items:center;gap:8px;margin:2px 0}.fwid .fin{margin:0}'
   +'.fbx{font:600 22px Jost,system-ui,sans-serif;width:66px;padding:8px 4px;border:2px solid #C9D3DC;border-radius:10px;background:#fff;color:#2B3A44;text-align:center;box-sizing:border-box}'
   +'.fbx:focus{outline:none;border-color:#17607A}.fbx:disabled{background:#EEF3F6}';
  document.head.appendChild(c);
  function kindOf(el){
    if(el.dataset.fk)return el.dataset.fk;
    var m=/^in-(.+)$/.exec(el.id||'');if(!m||typeof QS==='undefined'||!QS[m[1]])return '';
    var a=String(QS[m[1]].q.a);
    if(/^\d+ \d+\/\d+$/.test(a))return 'mixed';
    if(/^\d+\/\d+$/.test(a))return 'frac';
    return '';
  }
  function mk(cls,ph){var i=document.createElement('input');i.type='text';i.className='fbx '+cls;i.inputMode='numeric';i.autocomplete='off';i.maxLength=4;if(ph)i.setAttribute('aria-label',ph);return i;}
  function build(el,kind){
    var w=null,n=mk('fn','top number'),d=mk('fd','bottom number');
    var wrap=document.createElement('span');wrap.className='fwid nf';
    if(kind!=='frac'){w=mk('fw','whole number');wrap.appendChild(w);}
    var fin=document.createElement('span');fin.className='fin';fin.appendChild(n);fin.appendChild(document.createElement('i'));fin.appendChild(d);wrap.appendChild(fin);
    var m=/^\s*(?:(\d+)\s+)?(\d+)\/(\d+)\s*$/.exec(el.value||'');if(m){if(w&&m[1])w.value=m[1];n.value=m[2];d.value=m[3];}
    else if(w&&/^\s*\d+\s*$/.test(el.value||''))w.value=el.value.trim();
    function compose(){
      var W=w?w.value:'',N=n.value,D=d.value,v='';
      if(N&&D)v=(W?W+' ':'')+N+'/'+D;else if(W&&!N&&!D)v=W;
      el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));
    }
    [w,n,d].forEach(function(b){if(!b)return;
      b.addEventListener('input',function(){var x=b.value.replace(/[^0-9]/g,'');if(x!==b.value)b.value=x;compose();});
      b.addEventListener('keydown',function(e){if(e.key==='Enter'){var row=el.parentNode,btn=row&&row.querySelector('.btn');if(btn)btn.click();}});
    });
    el.style.display='none';el.setAttribute('data-fdone','1');
    el.parentNode.insertBefore(wrap,el);
    var old=el.parentNode.querySelector('.fhelp');if(old)old.remove();
    var h=document.createElement('div');h.className='fhelp nf';h.textContent=kind==='frac'?'Type the top number in the top box and the bottom number in the bottom box.':'Whole number in the left box. Top and bottom numbers in the two stacked boxes.';
    wrap.parentNode.insertBefore(h,wrap.nextSibling);
    el._fboxes=[w,n,d];
  }
  window.__fracEnhance=function(){
    var list=document.querySelectorAll('input[id^="in-"],input.qans[data-fk]');
    for(var i=0;i<list.length;i++){var el=list[i];if(el.getAttribute('data-fdone'))continue;var k=kindOf(el);if(k)build(el,k==='either'?'mixed':k);}
    /* lock boxes when the app locks the real input */
    var done=document.querySelectorAll('input[data-fdone]');
    for(i=0;i<done.length;i++){var e=done[i];if(e._fboxes)e._fboxes.forEach(function(b){if(b)b.disabled=e.disabled;});}
  };
})();
