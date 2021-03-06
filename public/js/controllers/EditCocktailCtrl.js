angular.module('EditCocktailCtrl', ['ngDialog']).controller('EditCocktailController',
    ['$routeParams', '$filter', 'ingredients', 'MyBarService', 'ngDialog', 'Notification', EditCocktailController]);

function EditCocktailController($routeParams, $filter, ingredients, MyBarService, ngDialog, Notification) {

    var vm = this;
    vm.menuItems = [];
    vm.allKnownIngredients = ingredients;
    vm.isNew = $routeParams.id === 'new';

    vm.create = create;
    vm.reset = create;

    activate();

    function activate() {
        loadMenuItems();
        loadOrCreateCocktail();
        console.log('Activated EditCocktailCtrl');
    }

    function loadMenuItems() {
        return MyBarService.getMenuItems().then(function (data) {
            vm.menuItems = data;
            return vm.menuItems;
        });
    }

    function loadOrCreateCocktail() {
        vm.isNew ? create() : get();
    }

    function create() {
        vm.cocktail = {
            ingredients: {}
        }
    }

    function get() {
        MyBarService.getCocktailById($routeParams.id).then(function (data) {
            vm.cocktail = data;
            for (var groupName in vm.cocktail.ingredients) {
                if (vm.cocktail.ingredients.hasOwnProperty(groupName)) {
                    var arr = vm.cocktail.ingredients[groupName];
                    for (var i = 0; i < arr.length; i++) {
                        arr[i].getKind = function (groupName) {
                            return function () {
                                return $filter('kind')(this.ingredientId, ingredients, groupName);
                            }
                        }(groupName);
                        arr[i].isLiquid = function (groupName) {
                            return function () {
                                return isLiquid(groupName, this.ingredientId);
                            }
                        }(groupName);
                    }
                }
            }
        })
    }

    vm.getMeasurements = function (groupName) {
        try {
            return vm.allKnownIngredients[groupName].measurements.map(function (item) {
                return item.value;
            });
        } catch (err) {
            console.log(err.message + '.', 'Set default values.');
            return ['ML', 'PCS', 'G']; // default, mainly for dev purpose
        }
    };

    vm.showIngredients = function () {
        ngDialog.open({
            templateUrl: 'views/templates/select-ingredients.html',
            controller: ['ingredients', '$filter', function (allKnownItems, $filter) {
                this.data = allKnownItems;
                // toggle selection for a given kind
                this.toggleSelection = function toggleSelection(groupName, id) {
                    var idx;
                    vm.cocktail.ingredients[groupName].some(function (entry, i) {
                        if (entry.ingredientId === id) {
                            idx = i;
                            return true;
                        }
                    });
                    // is already selected
                    if (idx > -1) {
                        vm.cocktail.ingredients[groupName].splice(idx, 1);
                    }
                    // is newly selected
                    else {
                        var selectedIngredient = {
                            ingredientId: id,
                            volume: 0,
                            measurement: null,
                            getOriginalItem: function () {
                                return findOriginalItem(groupName, this.ingredientId);
                            },
                            isLiquid: function () {
                                return isLiquid(groupName, this.ingredientId);
                            },
                            getKind: function () {
                                return $filter('kind')(this.ingredientId, ingredients, groupName);
                            }
                        };

                        vm.cocktail.ingredients[groupName].push(selectedIngredient);
                    }
                };
                this.isChecked = function (groupName, id) {
                    if (vm.cocktail.ingredients[groupName] === undefined) {
                        vm.cocktail.ingredients[groupName] = [];
                    }
                    return vm.cocktail.ingredients[groupName].some(function (entry) {
                        if (entry.ingredientId === id) {
                            return true;
                        }
                    });
                }
            }
            ],
            controllerAs: 'selectIngredientsCtrl',
            resolve: {
                ingredients: function () {
                    return vm.allKnownIngredients;
                }
            }
        });
    };

    vm.hasIngredients = function (cocktail) {
        if (cocktail.ingredients) {
            return Object.keys(cocktail.ingredients).length > 0;
        }
        return false;
    };

    vm.save = function () {
        if (vm.isNew) {
            MyBarService.createCocktail(vm.cocktail)
                .then(onSaveSuccess)
                .catch(onError);
        } else {
            MyBarService.updateCocktail(vm.cocktail)
                .then(onUpdateSuccess)
                .catch(onError);
        }
    };

    vm.delete = function () {
        MyBarService.deleteCocktail(vm.cocktail.id)
            .then(onRemoveSuccess)
            .catch(onError);
    };

    function onUpdateSuccess() {
        Notification.success('Successfully updated.');
    }

    function onSaveSuccess() {
        Notification.success('Successfully added to cocktail list.');
    }

    function onRemoveSuccess() {
        Notification.success('Successfully removed from cocktail list.');
    }

    function onError(error) {
        Notification.error('Error: cocktail could not be removed or updated.');
    }

    function isLiquid(groupName, ingredientId) {
        var originalItem = findOriginalItem(groupName, ingredientId);
        return originalItem.hasOwnProperty('beverageType') || originalItem.hasOwnProperty('drinkType');
    }

    function findOriginalItem(groupName, ingredientId) {
        var items = vm.allKnownIngredients[groupName].items;
        var found = items.find(function (item) {
            return item.id === ingredientId;
        });
        return !!found ? found : {};
    }

}
