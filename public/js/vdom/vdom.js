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
  let i, map = {}, key, ch;
  
  for (i = beginIdx; i <= endIdx; ++i) {
    ch = children[i];
    if (ch != null) {
      key = ch.key;
      if (Validator.isDef(key)) {
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

  //生成空节点
  function emptyNodeAt(elm) {
    const elmId = elm.id ? `#${elm.id}` : '';
    const elmClass = elm.className ? `.${elm.className.split(' ').join('.')}` : '';
    return VNode(api.tagName(elm).toLowerCase() + elmId + elmClass, {}, [], undefined, elm);
  }

  //生成 brower DOM
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
  
  //添加节点
  function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (n = startIdx; n <= endIdx; ++n) {
      api.insertBefore(parentElm, createElm(vnodes[n], insertedVnodeQueue), before);
    }
  }

  //删除节点
  function removeVnodes(parentElm,vnodes,startIdx,endIdx){
    for (n = startIdx; n <= endIdx; ++n) {
      let i, listeners, rm, ch = vnodes[n];
      //节点存在
      if (ch != null) {
        if (Validator.isDef(ch.selector)) {
          //销毁destory hook
          invokeDestroyHook(ch);

          //移除子元素辅助函数
          listeners = cbs.remove.length + 1;
          rm = createRmCb(ch.elm, listeners);

          //销毁该节点所有modules的remove hooks
          for (i = 0; i < cbs.remove.length; ++i){
            cbs.remove[i](ch, rm);
          } 

          //若data.hook.remove存在，则执行remove hook
          //否则移除子元素
          if (Validator.isDef(i = ch.data) && Validator.isDef(i = i.hook) && Validator.isDef(i = i.remove)) {
            i(ch, rm);
          } else {
            rm();
          }
        } else { 
          // Text node
          api.removeChild(parentElm, ch.elm);
        }
      }
    }
  }

  //触发destory hook
  function invokeDestroyHook(vnode) {
    let i, j;
    let data = vnode.data,ch = vnode.children;

    if (Validator.isDef(data)) {
      //若hook.destory存在，则执行destory hook
      if (Validator.isDef(i = data.hook) && Validator.isDef(i = i.destroy)){
        i(vnode);
      } 
      //销毁该节点所有modules的destory hooks
      for (i = 0; i < cbs.destroy.length; ++i){
        cbs.destroy[i](vnode);
      } 
      //递归销毁子组件destory hooks
      if (Validator.isDef(ch)) {
        for (j = 0; j < ch.length; ++j) {
          i = ch[j];
          if (i != null && Validator.isStr(i)) {
            invokeDestroyHook(i);
          }
        }
      }
    }
  }

  //移除子元素
  function createRmCb(childElm, listeners) {
    return function rmCb(){
      if (--listeners === 0) {
        const parent = api.parentNode(childElm);
        api.removeChild(parent, childElm);
      }
    }
  }

  //patch node
  function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
    let i, hook;
    const elm = vnode.elm = oldVnode.elm;
    let oldCh = oldVnode.children,ch = vnode.children;

    //若data.hook.prepatch存在，则执行prepatch hook
    if (Validator.isDef(i = vnode.data) && Validator.isDef(hook = i.hook) && Validator.isDef(i = hook.prepatch)) {
      i(oldVnode, vnode);
    }
    
    //新旧节点完全相同
    if (oldVnode === vnode) {
      return
    };
    
    //触发update hook
    if (Validator.isDef(vnode.data)) {
      for (i = 0; i < cbs.update.length; ++i){
        cbs.update[i](oldVnode, vnode);
      }
      i = vnode.data;
      if (Validator.isDef(i = i.hook) && Validator.isDef(i = i.update)){
        i(oldVnode, vnode);
      }
    }

    if (Validator.isUndef(vnode.text)) {
      //新节点非文本节点
      if (Validator.isDef(oldCh) && Validator.isDef(ch)) {
        //新旧节点都含有子元素
        //则更新子元素
        if (oldCh !== ch) {
          updateChildren(elm, oldCh, ch, insertedVnodeQueue);
        }
      } else if (Validator.isDef(ch)) {
        //新节点有子元素，旧节点无子元素
        if (Validator.isDef(oldVnode.text)){
          api.setTextContent(elm, '');
        } 
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (Validator.isDef(oldCh)) {
        //新节点无子元素，旧节点有子元素
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (Validator.isDef(oldVnode.text)) {
        //旧节点为文本节点
        api.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      //新节点为文本节点
      if (Validator.isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      }
      api.setTextContent(elm, vnode.text);
    }

    //若data.hook.postpatch存在，则执行postpatch hook
    if (Validator.isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode);
    }
  }

  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
    //获取 oldCh, newCh 首尾index
    let oldStartIdx = 0,oldEndIdx = oldCh.length - 1;
    let newStartIdx = 0,newEndIdx = newCh.length - 1;

    //获取 oldCh, newCh 首尾node
    let oldStartVnode = oldCh[0],oldEndVnode = oldCh[oldEndIdx];
    let newStartVnode = newCh[0],newEndVnode = newCh[newEndIdx];

    let oldKeyToIdx,idxInOld,elmToMove,before;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      //确保oldStartVnode,oldEndVnode,newStartVnode,newEndVnode存在
      if (oldStartVnode == null) {
        // Vnode might have been moved
        oldStartVnode = oldCh[++oldStartIdx]; 
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx];
      } else if (newEndVnode == null) {
        newEndVnode = newCh[--newEndIdx];
      } 
      //当oldStartVnode与newStartVnode属于同一节点
      //或者oldEndVnode与newEndVnode属于同一节点
      //不进行DOM操作
      else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } 
      //当oldStartVnode与newEndVnode属于同一节点
      //Vnode 往右偏移
      else if (sameVnode(oldStartVnode, newEndVnode)) { 
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } 
      //当oldEndVnode与newStartVnode属于同一节点
      //Vnode 往左偏移
      else if (sameVnode(oldEndVnode, newStartVnode)) { 
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } 
      //当oldStartVnode,oldEndVnode,newStartVnode,newEndVnode都是不同的节点
      else {
        //oldKeyToIdx不存在，则oldCh追加key
        if (Validator.isUndef(oldKeyToIdx)) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        }
        //通过newStartVnode的key去获取idxInOld
        idxInOld = oldKeyToIdx[newStartVnode.key];
        //判断idxInOld是否存在
        if (Validator.isUndef(idxInOld)) { 
          //若idxInOld不存在，则为新元素
          //创建新元素，并插入到旧节点之前
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          //若idxInOld存在，则oldCh有相同 key 的 vnode
          elmToMove = oldCh[idxInOld];
          //判断新旧node selector是否相同
          if (elmToMove.selector !== newStartVnode.selector) {
            //若selector不同，则新建dom
            api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
          } else {
            //若selector相同,key也相同
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = undefined;
            api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
          }
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }

    //处理异常情况
    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
      if (oldStartIdx > oldEndIdx) {
        //追加newCh
        before = newCh[newEndIdx+1] == null ? null : newCh[newEndIdx+1].elm;
        addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else {
        //删除oldCh
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
      }
    }
  }

  return function patch(oldVnode,vnode){
    let elm,parent;
    let insertedVnodeQueue = [];

    for (let i = 0; i < cbs.pre.length; ++i) {
      cbs.pre[i]();
    }

    //初始化时无oldVnode
    //oldVnode即为空节点
    if(!isVnode(oldVnode)){
      oldVnode = emptyNodeAt(oldVnode);
    }

    //对比新旧节点
    if(sameVnode(oldVnode, vnode)){
      //非初始化
      patchVnode(oldVnode, vnode, insertedVnodeQueue);
    }else{
      //初始化及新旧节点diff

      //获取新旧节点及父级
      elm = oldVnode.elm;
      parent = api.parentNode(elm);
      createElm(vnode, insertedVnodeQueue);

      //倘若父级节点存在
      //在父级节点下旧节点后插入新节点
      //删除旧节点
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


export default {
  init
}