/**
 * test demo
 */
import vdom from "./vdom/vdom";
import ClassModule from "./vdom/modules/class";
import createVNode from "./vdom/creator";

let vnode;

const patch = vdom.init([
  ClassModule
])

let newVnode = createVNode('div',{
  class:{
    active: true
  },
},'This is demo!');

window.addEventListener('DOMContentLoaded', () => {
  let container = document.getElementById('container');
  vnode = patch(container, newVnode);
  console.log(vnode);
  // vnode = patch(vnode, newVnode);
});



