/**
 * 虚拟DOM creator
 */
import VNode from "./vnode";
import Validator from "./validator";

/**
 * addNameSpace(data, children, selector)
 * 针对svg元素需要添加namespace
 * @param {*} data 
 * @param {*} children 
 * @param {*} selector 
 */
const addNameSpace = (data, children, selector) => {
  data.namespace = 'http://www.w3.org/2000/svg';
  if (selector !== 'foreignObject' && Validator.isDef(children)) {
    for (let i = 0; i < children.length; ++i) {
      let childData = children[i].data;
      if(Validator.isDef(childData)){
        addNameSpace(childData, children[i].children, children[i].selector);
      }
    }
  }
}


/** 
  * createVNode(selector, b, c)
  *       
  * example:  
  *    createVNode('div',{
  *      style:{color: red}
  *    },[
  *      createVNode('div', 'demo')
  *    ])
  * 
  * @param {*} b     可选String(Number)、Array、Object
  *                  String(Number)-------->@type text（文本节点）      
  *                  Array----------------->@type children（子元素）
  *                  Object---------------->@type property（元素属性）
  * 
  * @param {*} c     可选String(Number)、Array
  *                  String(Number)-------->@type text（文本节点）      
  *                  Array----------------->@type children（子元素）
  *          
  * 
  */

const createVNode = (selector, b, c) => {
  let data = {};
  let children = undefined;
  let text = undefined;

  /**
   * isDef(b)           
   * example:  
   *   createVNode('div',{style:{'color': 'red'}},[createVNode('div', 'demo')]) 
   *   createVNode('div',{'key': 2},'this is example') 
   *    
   * isDef(b) && isUndef(c)             
   * example:  
   *   createVNode('div',[createVNode('div', 'demo')]) 
   *   createVNode('div','this is example') 
   *   createVNode('div',{'key': 2}}) 
   * 
   * isUndef(c) && isUndef(b) 
   * example:  
   *   createVNode('div')
   * 
   */
  if (Validator.isDef(c)) {
    data = b;
    if (Validator.isArray(c)) {
      children = c;
    }else if (Validator.isStrOrNum(c)) {
      text = c;
    }else if( c && c.selector ){
      children = [c];
    }
  } else if (Validator.isDef(b)) {
    if (Validator.isArray(b)) {
      children = b;
    } else if (Validator.isStrOrNum(b)) {
      text = b;
    } else if( b && b.selector ){
      children = [b];
    } else {
      data = b;
    }
  }

  if (Validator.isDef(children)) {
    for (let i = 0; i < children.length; ++i) {
      if (Validator.isStrOrNum(children[i])){
        children[i] = VNode(undefined, undefined, undefined, children[i], undefined)
      }
    }
  }
  
  if (selector[0] === 's' && selector[1] === 'v' && selector[2] === 'g' &&
  (selector === 3 || selector[3] === '.' || selector[3] === '#')) {
    addNameSpace(data, children, selector);
  }

  return VNode(selector, data, children, text, undefined);
}

export default createVNode;