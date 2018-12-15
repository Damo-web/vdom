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
    let i;
    let data = vnode.data,
    children = vnode.children, 
    selector = vnode.selector;
       
    //判断是否为init 
    //若为init，则调用init hook
    if (Validator.isDef(data)) {
      if (Validator.isDef(i = data.hook) && Validator.isDef(i = i.init)) {
        i(vnode);
        data = vnode.data;
      }
    }

    //判断是否为Comment
    if (selector === '!') {
      if (Validator.isUndef(vnode.text)) {
        vnode.text = '';
      }
      vnode.elm = api.createComment(vnode.text);
    } else if (Validator.isDef(selector)) {
      //解析selector
      const hashIdx = selector.indexOf('#');
      const dotIdx = selector.indexOf('.', hashIdx);
      const hash = hashIdx > 0 ? hashIdx : selector.length;
      const dot = dotIdx > 0 ? dotIdx : selector.length;
      const tag = hashIdx !== -1 || dotIdx !== -1 ? selector.slice(0, Math.min(hash, dot)) : selector;
      //创建tag标签
      const elm = vnode.elm = Validator.isDef(data) && Validator.isDef(i = data.namespace) ? api.createElementNS(i, tag): api.createElement(tag);
      //设置tag id属性
      if (hash < dot){
        elm.setAttribute('id', sel.slice(hash + 1, dot));
      } 
      //设置tag class属性
      if (dotIdx > 0){
        elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '));
      } 
      //插入 create hook
      for (i = 0; i < cbs.create.length; ++i){
        cbs.create[i](emptyNode, vnode);
      }
      //针对children和text区别添加
      if (Validator.isArray(children)) {
        for (i = 0; i < children.length; ++i) {
          const ch = children[i];
          if (ch != null) {
            api.appendChild(elm, createElm(ch, insertedVnodeQueue));
          }
        }
      } else if (Validator.isStrOrNum(vnode.text)) {
        api.appendChild(elm, api.createTextNode(vnode.text));
      }

      i = vnode.data.hook; // Reuse variable

      //判断hook是否存在
      //若存在则调用create hook
      //若insert hook存在，则存入insertedVnodeQueue 队列
      if (Validator.isDef(i)) {
        if (i.create){
          i.create(emptyNode, vnode);
        }
        if (i.insert) {
          insertedVnodeQueue.push(vnode);
        }
      }
    }

    return vnode.elm;
  }

  return function patch(oldVnode,vnode){
    let elm = null;
    let parent = null;
    let insertedVnodeQueue = [];

    for (let i = 0; i < cbs.pre.length; ++i) {
      cbs.pre[i]();
    }

    //初始化时无oldVnode
    if(!isVnode(oldVnode)){
      oldVnode = emptyNode(oldVnode);
    }

    //对比新旧节点
    if(sameVnode(oldVnode, vnode)){
      patchVnode(oldVnode, vnode, insertedVnodeQueue);
    }else{
      elm = oldVnode.elm;
      parent = api.parentNode(elm);
      createElm(vnode, insertedVnodeQueue);
      if (parent !== null) {
        api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
        removeVnodes(parent, [oldVnode], 0, 0);
      }
    }

    for (let i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
    }

    for (let i = 0; i < cbs.post.length; ++i) {
      cbs.post[i]();
    }

    return vnode;
  }

}


