export function CustomGetElement(id, getter) {
    if (getter = 'id') {
        return document.getElementById(id)
    } else if (getter = "className") {
        return document.getElementsByClassName(id)
    }
}