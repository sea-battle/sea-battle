module.exports = {

    isEmpty: function (obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }
        return true;
    },
    sortingBy: {
        name: function (a, b) {
            var nameA = a.name.toUpperCase();
            var nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            // names must be equal
            return 0;
        },
        points: function (a, b) {
            if (a.points > b.points) {
                return 1;
            }
            if (a.points < b.points) {
                return -1;
            }
            // a must be equal to b
            return 0;
        }
    }
};