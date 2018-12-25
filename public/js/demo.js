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

let newVnode = h('div',{
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
  key: 1,
  // props: {
  //   contenteditable: true
  // },
  on:{
    'click':()=>{
      vnode = patch(newVnode,Vnode);
    }
  }
},'This is demo!');

let oldVnode = h('a',{
  on:{
    'click':()=>{
      vnode = patch(vnode, newVnode);   
    }
  }
},'This is demo!');


let Vnode = h('div',{
  class:{
    active: true
  },
},[
  h('div',{
    class:{
      active: true
    },
    key: 3,
    on:{
      'click':()=>{
        vnode = patch(vnode, newVnode);   
      }
    }
  },"this is demo1"),
  h('div',{
    class:{
      active: true
    },
  },"this is demo2")
]);

window.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const container = document.createElement('div');
  vnode = patch(container, newVnode);
  app.append(vnode.elm);
});



