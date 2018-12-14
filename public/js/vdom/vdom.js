/**
 * patch DOM node
 */

import VNode from "./vnode";
import DOMAPI from "./domapi";
import Validator from "./validator";

//空节点
const emptyNode = VNode('', {}, [], undefined, undefined);


//hooks
const hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

/**
 * sameVnode---------------对比两节点是否相同
 * @param {*} vnode1 
 * @param {*} vnode2 
 */
function sameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.selector === vnode2.selector;
}

/**
 * isVnode-----------------判断是否为Vnode节点
 * @param {*} vnode 
 */
function isVnode(vnode) {
  return Validator.isDef(vnode.selector);
}

/**
 * createKeyToOldIdx-------旧节点追加key
 * @param {*} children 
 * @param {*} beginIdx 
 * @param {*} endIdx 
 */
function createKeyToOldIdx(children, beginIdx, endIdx) {
  let i = 0;
  let map = {};
  let key = undefined;
  let ch = null;
  
  for (i = beginIdx; i <= endIdx; ++i) {
    ch = children[i];
    if (ch != null) {
      key = ch.key;
      if (key !== undefined) {
        map[key] = i;
      }
    }
  }
  return map;
}

function init(modules, api){
  //初始化回调函数，来存储modules的hooks
  let cbs = {};

  //默认使用DOMAPI
  if(Validator.isUndef(api)){
    api = DOMAPI;
  }

  //导入modules的hooks
  for(let i=0;i< hooks.length; ++i){
    cbs[hooks[i]] = [];
    for(let j=0;j< modules.length; ++j){
      if(Validator.isDef(modules[j][hooks[i]])){
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }

  function emptyNodeAt(elm) {
    const elmId = elm.id ? `#${elm.id}` : '';
    const elmClass = elm.className ? `.${elm.className.split(' ').join('.')}` : '';
    return VNode(api.tagName(elm).toLowerCase() + elmId + elmClass, {}, [], undefined, elm);
  }

  function createRmCb(childElm, listeners) {
    return function rmCb(){
      if (--listeners === 0) {
        const parent = api.parentNode(childElm);
        api.removeChild(parent, childElm);
      }
    }
  }

  function createElm(vnode, insertedVnodeQueue) {
    let { data } = vnode;
       
    if (Validator.isDef(data)) {
      if (Validator.isDef(i = data.hook) && Validator.isDef(i = i.init)) {
        i(vnode);
        data = vnode.data;
      }
    }
    var elm, children = vnode.children, sel = vnode.sel;
    if (Validator.isDef(sel)) {
      // Parse selector
      var hashIdx = sel.indexOf('#');
      var dotIdx = sel.indexOf('.', hashIdx);
      var hash = hashIdx > 0 ? hashIdx : sel.length;
      var dot = dotIdx > 0 ? dotIdx : sel.length;
      var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag)
                                                          : api.createElement(tag);
      if (hash < dot) elm.id = sel.slice(hash + 1, dot);
      if (dotIdx > 0) elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          api.appendChild(elm, createElm(children[i], insertedVnodeQueue));
        }
      } else if (is.primitive(vnode.text)) {
        api.appendChild(elm, api.createTextNode(vnode.text));
      }
      for (let i = 0; i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
      i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (i.create) i.create(emptyNode, vnode);
        if (i.insert) insertedVnodeQueue.push(vnode);
      }
    } else {
      elm = vnode.elm = api.createTextNode(vnode.text);
    }
    return vnode.elm;
  }

  return function patch(oldVnode,vnode){
    
  }

}


