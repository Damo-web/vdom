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


import createVNode from "./vdom/creator";


let vnode;

const patch = vdom.init([
  ClassModule,
  StyleModule,
  EventListenerModule,
  AttributeModule,
  DatasetModule,
  PropModule
])

let newVnode = createVNode('div',{
  class:{
    active: true
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
  // props: {
  //   contenteditable: true
  // },
  on:{
    'click':()=>{
      patch(newVnode,Vnode);
    }
  }
},'This is demo!');

// let newVnode = createVNode('a',{
//   props: {href: 'http://www.baidu.com'}
// },'This is demo!');


let Vnode = createVNode('div',{
  class:{
    active: true
  },
},[
  createVNode('div',{
    class:{
      active: true
    },
    on:{
      'click':()=>{
        let container = document.querySelector('.container');
        patch(container, newVnode);
      }
    }
  },"this is demo1"),
  createVNode('div',{
    class:{
      active: true
    },
  },"this is demo2")
]);

window.addEventListener('DOMContentLoaded', () => {
  let container = document.getElementById('container');
  vnode = patch(container, newVnode);
});



