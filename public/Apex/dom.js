export function render(node) {
    if (typeof node === 'string') {
        return document.createTextNode(node);
    }

    let el = document.createElement(node.tag);
    if (node.attrs) {
        updateAttrs(el, {}, node.attrs);
    }

    if (node.children) {
        node.children.forEach(child => {
            el.appendChild(render(child));
        });
    }
    return el;
}


export function update(prevVNode, newVNode, container) {

    if (!prevVNode) {
        const realDOM = render(newVNode);
        container.appendChild(realDOM);
    } else {
        diff(prevVNode, newVNode, container);
    }

    return newVNode;
}

export function diff(oldVNode, newVNode, parent) {
    if (typeof oldVNode === 'string' || typeof newVNode === 'string') {
        if (oldVNode !== newVNode) {
            const newEl = render(newVNode);
            parent.replaceWith(newEl);
        }
        return;
    }

    if (oldVNode.tag !== newVNode.tag) {
        const newEl = render(newVNode);
        parent.replaceWith(newEl);
        return;
    }

    updateAttrs(parent, oldVNode.attrs || {}, newVNode.attrs || {});

    const oldChildren = oldVNode.children || [];
    const newChildren = newVNode.children || [];
    let max = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < max; i++) {
        const oldChild = oldChildren[i];
        const newChild = newChildren[i];
        const childNode = parent.childNodes[i];
        if (!newChild) {
            if (childNode) {

                childNode.remove();
                i--
                max--
            }
        } else if (!oldChild) {
            const newEl = render(newChild);
            parent.appendChild(newEl);
        } else if (childNode) {
            diff(oldChild, newChild, childNode);
        }
    }
}
function updateAttrs(el, oldAttrs, newAttrs) {
    for (const key in oldAttrs) {
        if (!(key in newAttrs)) {

            if (key.startsWith("on") && typeof oldAttrs[key] === "function") {                
                el[key] = null;
            }
            if (key === "checked") {
                el.checked = false;
            }
            el.removeAttribute(key);
        }
    }

    for (const key in newAttrs) {
        const newVal = newAttrs[key];
        const oldVal = oldAttrs[key];

        if (key.startsWith("on") && typeof newVal === "function") {         
            
            if (typeof oldVal === "function") {
                el[key] = null
            }

            el[key] = newVal;

            if (key == "onchange") {
                if (el.hasAttribute("checked")) {
                    el.checked = !!newVal;
                } else {
                    el.checked = false
                }
            }
        }else if (oldVal !== newVal) {
           if (key === "autofocus") {           
           }
            
            el.removeAttribute(key, oldVal)
            el.setAttribute(key, newVal);
        }
    }
}
