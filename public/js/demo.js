/**
 * test demo
 */
import vdom from "./vdom/vdom";
import ClassModule from "./vdom/modules/class";
import StyleModule from "./vdom/modules/style";
import EventListenerModule from "./vdom/modules/eventlistener";
import AttributeModule from "./vdom/modules/attribute";
import DatasetModule from "./vdom/modules/dataset";
import PropModule from "./vdom/modules/prop";

import h from "./vdom/creator";

let vnode;


const patch = vdom.init([
  ClassModule,
  StyleModule,
  EventListenerModule,
  AttributeModule,
  DatasetModule,
  PropModule
])

let oldVnode = h('div',{
  class:{
    warn: true
  },
  style:{
    'font-size': "18px",
  },
  attrs:{
    hello: 'world',
    // contenteditable: true
  },
  dataset:{
    action: 'reset'
  },
  // key: 1,
  // props: {
  //   contenteditable: true
  // },
  on:{
    click: function handler1(e){
      console.log('test 1',e.target);
      vnode = patch(vnode,newVnode);
    }
  }
},[
  h('div',{
    style:{
      color: "red"
    }
  },"test")
],'This is demo!');

// let oldVnode = h('a',{
//   on:{
//     'click':()=>{
//       vnode = patch(vnode, newVnode);   
//     }
//   }
// },'This is demo!');


let newVnode = h('div',{
  class:{
    active: true
  },
  key: 3,
},[
  h('div',{
    class:{
      warn: true
    },
    on:{
      click:function handler2(e){

        console.log('test 2',e.target);
        // e.stopPropagation();
        vnode = patch(vnode,oldVnode);
      }
    }
  },"this is demo1"),
  h('div',{
    class:{
      hello: true
    },
  },[
    h('span',{
      class:{
        active: true
      },
    },'demo1'),
    h('a',{
      class:{
        active: true
      },
    },'demo2')
  ])
]);

window.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const container = document.createElement('div');
  vnode = patch(container, oldVnode);
  console.log(vnode,1111);
  app.append(vnode.elm);
});



