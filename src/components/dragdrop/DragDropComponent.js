import  React, {useLayoutEffect}  from 'react';
import { Subject, fromEvent, Observable  } from 'rxjs';
import {switchMap, map, takeUntil} from 'rxjs/operators';

function DragDropComponent (props){
    const { children } = props;


    let target =  '.device-view';
    // Drag handle
    let handle;
   // console.log('handle', handle);
        //    this.elementRef.nativeElement;
    let  delta = {x: 0, y: 0};
    let offset = {x: 0, y: 0};

    let destroy$ = new Subject();

    useLayoutEffect(()=>{

      function handleEvent() {
        let  elems  = document.querySelectorAll('.device-view tbody tr');
       // console.log('handle', elems);
          if (elems){
              elems.forEach((item)=>{
                  setupEvents(item);
              })

          } else {
            setTimeout(()=>handleEvent(), 3000);
          }

      }

      handleEvent();

    },[]);

    function setupEvents(item) {

                target =   document.querySelector(target);
                const mousedown$ = fromEvent(item, 'mousedown', false);
                const mousemove$ = fromEvent(document, 'mousemove',  false);
                const mouseup$ = fromEvent(document, 'mouseup',  false);

                const destroyObservable = destroy$.pipe(map(ev => ev));
                const mouseupObservable = mouseup$.pipe(map(ev => ev));

                const mousedrag$ = mousedown$.pipe(
                    switchMap((event) => {
                        const startX = event.clientX;
                        const startY = event.clientY;
                        return mousemove$.pipe(
                            map((ev) => {
                                ev.preventDefault();
                                delta = {
                                    x: ev.clientX - startX,
                                    y: ev.clientY - startY
                                };
                            }),
                            takeUntil(mouseupObservable)
                        );
                    }),
                    takeUntil(destroyObservable)
                );


                mousedrag$.subscribe(() => {
                    if (delta.x === 0 && delta.y === 0) {
                        return;
                    }

                    translate();
                });

                const destroyObservable2 = destroy$.pipe(map(() => {
                    offset.x += delta.x;
                    offset.y += delta.y;
                    delta = {x: 0, y: 0};
                }));

                mouseup$.pipe(takeUntil(destroyObservable2));
          }

          function translate() {
              target.style.zIndex = 2000;
              //target.style.position = 'absolute';
              target.style.top = `${offset.y + delta.y}px)`;
              target.style.transform = `
                  translate(${offset.x + delta.x}px,
                  ${offset.y + delta.y}px)
      `;

    }

    return (
      <>
      {children}
      </>
    )

}

export  default DragDropComponent;
