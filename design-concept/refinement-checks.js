async page => {
 const errors=[],failedRequests=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('response',response=>{if(response.url().startsWith('http://127.0.0.1:4178')&&response.status()>=400)failedRequests.push(response.url())});
 const assert=(ok,message)=>{if(!ok)throw new Error(message)};
 const assets=()=>page.evaluate(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images).filter(i=>i.hasAttribute('src')).map(i=>{i.loading='eager';return i.decode()}))});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://127.0.0.1:4178/');await assets();
 const fonts=await page.evaluate(()=>Array.from(document.fonts).map(f=>({family:f.family,weight:f.weight,status:f.status})));
 assert(fonts.length===2&&fonts.every(f=>f.status==='loaded'),'Fonts not loaded');
 assert(await page.locator('.brand img').count()===2,'Original logos missing');
 const widths=[];
 for(const width of [320,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:900});
  await page.evaluate(()=>window.scrollTo(0,1500));
  await page.waitForFunction(()=>document.querySelector('.site-header').classList.contains('scrolled'));
  const metrics=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,headerTop:document.querySelector('.site-header').getBoundingClientRect().top,headerHeight:document.querySelector('.header').offsetHeight}));
  assert(metrics.scroll<=metrics.viewport,'Overflow at '+width);assert(Math.abs(metrics.headerTop)<1,'Header not pinned at '+width);widths.push(metrics);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('.header nav a[href="#projects"]').click();
 await page.waitForFunction(()=>document.querySelector('#projects').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom);
 const anchor=await page.locator('#projects').evaluate(el=>el.getBoundingClientRect().top);
 await page.waitForFunction(()=>document.querySelector('.header nav a[href="#projects"]').getAttribute('aria-current')==='location');
 await page.locator('[data-filter="business"]').click();assert(await page.locator('.project-card').count()===1,'Business filter');
 await page.locator('[data-filter="sport"]').click();assert(await page.locator('.project-card').count()===3,'Sport filter');
 await page.locator('[href="#project/ohl"]').click();await page.locator('#case-title').waitFor({state:'visible'});
 assert(await page.locator('#case-title').evaluate(el=>el.getBoundingClientRect().top)>=90,'Case title underneath header');
 await page.locator('.gallery-photo').first().click();assert(await page.locator('#lightbox').evaluate(el=>el.open),'Gallery did not open');
 await page.keyboard.press('Escape');assert(!await page.locator('#lightbox').evaluate(el=>el.open),'Gallery did not close');
 await page.locator('.back').click();assert(await page.locator('.project-card').count()===3,'Filter state lost');
 await page.locator('[data-filter="all"]').click();
 await page.goto('http://127.0.0.1:4178/');
 for(const scene of ['1','2','0']){await page.locator(`[data-scene="${scene}"]`).click();await page.waitForFunction(s=>document.querySelector(`[data-scene="${s}"]`).getAttribute('aria-pressed')==='true',scene)}
 await page.setViewportSize({width:390,height:844});
 await page.locator('.menu-toggle').click();assert(!await page.locator('#mobile-menu').isHidden(),'Mobile menu missing');
 await page.locator('#mobile-menu a[href="#agency"]').click();assert(await page.locator('#mobile-menu').isHidden(),'Mobile menu did not close');
 assert(await page.locator('#agency').evaluate(el=>el.getBoundingClientRect().top)>=76,'Mobile anchor hidden');
 await page.locator('.menu-toggle').click();await page.keyboard.press('Escape');assert(await page.locator('#mobile-menu').isHidden(),'Menu Escape');
 await page.goto('http://127.0.0.1:4178/#project/torpedo');assert((await page.locator('#case-title').textContent()).includes('Победа'),'Deep link broken');
 await page.goto('http://127.0.0.1:4178/');await assets();
 assert(await page.locator('.hero-copy').evaluate(el=>getComputedStyle(el).animationName)==='none','Reduced motion not respected');
 await page.screenshot({path:'artifacts/visual-review/after-mobile.png'});
 await page.screenshot({path:'artifacts/visual-review/after-mobile-full.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('http://127.0.0.1:4178/');await assets();
 await page.locator('.hero-copy').evaluate(async el=>Promise.all(el.getAnimations().map(a=>a.finished)));
 await page.screenshot({path:'artifacts/visual-review/after-desktop.png'});
 await page.screenshot({path:'artifacts/visual-review/after-full.png',fullPage:true});
 await page.evaluate(()=>scrollTo({top:1550,behavior:'instant'}));
 await page.waitForFunction(()=>document.querySelector('.site-header').classList.contains('scrolled'));
 await page.screenshot({path:'artifacts/visual-review/after-sticky.png'});
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 assert(errors.length===0,errors.join('\n'));assert(failedRequests.length===0,failedRequests.join('\n'));
 return {passed:true,widths,anchorTop:anchor,fonts,errors,failedRequests,checks:['sticky header','anchor clearance','active section','filters','case routing','gallery and Escape','filter retention','scene changes','mobile menu','reduced motion','original logo loaded']};
}
