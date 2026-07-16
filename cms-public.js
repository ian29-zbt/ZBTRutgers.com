(async()=>{
  if(!window.zbtSupabase) return;
  const client = window.zbtSupabase;
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';

  const setEditableText = (el, value) => {
    if(value == null) return;
    const arrow = el.querySelector(':scope > [aria-hidden="true"]');
    if(el.dataset.cmsMultiline === 'true'){
      el.replaceChildren();
      String(value).split(/\n/).forEach((line,index)=>{
        if(index) el.appendChild(document.createElement('br'));
        el.appendChild(document.createTextNode(line));
      });
      return;
    }
    if(arrow){
      const preserved = arrow.cloneNode(true);
      el.replaceChildren(document.createTextNode(String(value)+' '),preserved);
      return;
    }
    el.textContent = value;
  };

  try{
    let blockQuery = client.from('content_blocks').select('block_key,content,link_url,status');
    let imageQuery = client.from('media_overrides').select('image_key,public_url,alt_text,status');

    if(isPreview){
      const {data:{session}} = await client.auth.getSession();
      if(session){
        const banner = document.createElement('div');
        banner.className = 'cms-preview-banner';
        banner.setAttribute('role','status');
        banner.textContent = 'Officer preview — draft content and draft images may be visible.';
        document.body.prepend(banner);
      } else {
        blockQuery = blockQuery.eq('status','published');
        imageQuery = imageQuery.eq('status','published');
      }
    } else {
      blockQuery = blockQuery.eq('status','published');
      imageQuery = imageQuery.eq('status','published');
    }

    const {data,error} = await blockQuery;
    if(error) throw error;
    (data||[]).forEach(row=>{
      document.querySelectorAll(`[data-cms-key="${CSS.escape(row.block_key)}"]`).forEach(el=>setEditableText(el,row.content));
      document.querySelectorAll(`[data-cms-link-key="${CSS.escape(row.block_key)}"]`).forEach(el=>{
        if(row.content!=null){
          const arrow = el.querySelector('[aria-hidden="true"]')?.cloneNode(true);
          el.replaceChildren(document.createTextNode(row.content+' '));
          if(arrow) el.appendChild(arrow);
          else { const s=document.createElement('span'); s.setAttribute('aria-hidden','true'); s.textContent='→'; el.appendChild(s); }
        }
        if(row.link_url) el.href=row.link_url;
      });
    });

    const imgs = await imageQuery;
    if(!imgs.error){
      (imgs.data||[]).forEach(row=>{
        document.querySelectorAll(`[data-cms-image-key="${CSS.escape(row.image_key)}"]`).forEach(img=>{
          img.src=row.public_url;
          if(row.alt_text) img.alt=row.alt_text;
        });
      });
    }
  }catch(err){
    console.info('CMS fallback: using packaged website content.',err.message);
  }
})();
