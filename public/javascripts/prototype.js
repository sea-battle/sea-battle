Element.prototype.remove = function () {
    this.parentNode.removeChild(this);
};
Element.prototype.hasClass = function (className) {
    return this.className && new RegExp("(\\s|^)" + className + "(\\s|$)").test(this.className);
};
Element.prototype.getElementsNodes = function () {
    var elements = [];
    for (var i = 0; i < this.children.length; i++) {
        if (!this.children[i].hasClass('boat-selector')) {
            console.error("One or many elements or not boats elements");
            return false;
        }
        elements.push(this.children[i]);
    }
    return elements;
};
Element.prototype.getNextBoatElement = function () {
    var elements = this.getElementsNodes();
    if (elements.length > 0) {
        return elements[0];
    }
    return false;
};

String.prototype.toBool = function () {
    return (/^true$/i).test(this);
};

Array.prototype.remove = function (value) {
    var i = this.length;
    while (i--) {
        if (this[i] == value) {
            this.splice(i, 1);
        }
    }
};