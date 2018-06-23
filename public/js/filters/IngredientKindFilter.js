angular.module('IngredientKindFilter', []).filter('kind', [IngredientKindFilter]);

function IngredientKindFilter() {

    function findIngredientKind(ingredientId, ingredients, groupName) {
        var itemsInGroup = getItemsFromGroup(ingredients, groupName);
        var ingredient = itemsInGroup.find(function (item) {
            return item.id === ingredientId;
        });
        return !!ingredient ? ingredient.kind : "n/a";
    }

    function getItemsFromGroup(ingredients, groupName) {
        return !!groupName ? ingredients[groupName].items : ingredients;
    }

    return findIngredientKind;
}
