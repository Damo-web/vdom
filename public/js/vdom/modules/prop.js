/**
 * Prop Module
 */
function updateProps(oldVnode, vnode) {
  let key, cur, old;
  let elm = vnode.elm,
      oldProps = oldVnode.data.props,
      props = vnode.data.props;

  if (!oldProps && !props) return;
  if (oldProps === props) return;
  oldProps = oldProps || {};
  props = props || {};

  for (key in oldProps) {
    if (!props[key]) {
      elm.removeAttribute(key);
    }
  }
  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
      elm.setAttribute(key, cur);
    }
  }
}

export default {
  create: updateProps, 
  update: updateProps
};