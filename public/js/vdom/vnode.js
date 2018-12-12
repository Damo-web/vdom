/**
 * 虚拟DOM生成函数
 * @param {selector}                元素选择器
 * @param {data}                    元素标签属性及key
 * @param {children}                元素子元素
 * @param {text}                    元素纯文本节点                    
 * @param {elm}                     元素真实dom（render时）
 */

const VNode = (selector, data, children, text, elm) => {
  const key = data === undefined ? undefined : data.key;
  return {
    selector,
    data,
    children,
    text,
    elm,
    key
  }
}

export default VNode;