Element.prototype.remove = function () {
    this.parentNode.removeChild(this);
};

Element.prototype.hasClass = function (className) {
    return this.className && new RegExp("(\\s|^)" + className + "(\\s|$)").test(this.className);
};

Element.prototype.addClass = function (className) {
    this.className += ' ' + className;
};
Element.prototype.removeClass = function (className) {
    this.className = this.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
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

Element.prototype.removeChildren = function () {
    while (this.firstChild) {
        this.removeChild(this.firstChild);
    }
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

Element.prototype.insertAfter = function (newNode) {
    this.parentNode.insertBefore(newNode, this.nextSibling);
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}