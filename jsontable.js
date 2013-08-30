angular
    .module('ui')
    .directive('jsontable', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                datasource: '=',
                document: '=',
                documentpath: '@'
            },
            transclude: true,
            compile: function (tElement, tAttr) {
                var contents = tElement.contents().remove();
                var compiledContents;

                return function (scope, iElement, iAttr) {

                    if (!compiledContents) {
                        compiledContents = $compile(contents);
                    }

                    compiledContents(scope, function (clone, scope) {
                        iElement.append(clone);
                    });

                    scope.$watch('datasource', function () {
                        if (scope.datasource != null && scope.innerState == null)
                            scope.innerState = angular.copy(scope.datasource);
                    });

                    scope.isObject = utils.isObject;

                    scope.saveValue = function () {
                        var obj = utils.getObjectByPath(scope.documentpath, scope.document);

                        if (_.isString(scope.innerState[this.key]) && scope.innerState[this.key].indexOf('int:') == 0) {
                            obj[this.key] = parseInt(scope.innerState[this.key].replace('int:', ''));
                        }
                        else if (_.isString(scope.innerState[this.key]) && scope.innerState[this.key].indexOf('bool:') == 0) {
                            obj[this.key] = /^bool:true$/i.test(scope.innerState[this.key]);
                        }
                        else if (_.isString(scope.innerState[this.key]) && scope.innerState[this.key].indexOf('date:') == 0) {
                            obj[this.key] = Date.parse(scope.innerState[this.key].replace('date:', ''));
                        } else {
                            obj[this.key] = scope.typeConverter(scope.innerState[this.key], obj[this.key]);
                        }
                    };

                    scope.typeConverter = function (val, baseObject) {
                        if (typeof (val) != typeof (baseObject)) {
                            if (_.isNumber(baseObject))
                                return parseInt(val);

                            if (_.isBoolean(baseObject))
                                return /^true$/i.test(val);

                            if (_.isDate(baseObject))
                                return Date.parse(val);
                        }
                        else
                            return val;
                    };

                    scope.cancelValue = function () {
                        scope.innerState[this.key] = this.val;
                    };

                    scope.deleteItem = function () {
                        var obj = utils.getObjectByPath(scope.documentpath, scope.document);
                        delete obj[this.key];
                    };

                    scope.getPathWithoutDot = function (documentpath, key) {
                        if (!documentpath)
                            return (key + '').split('.').join('');

                        return (documentpath + key)
                            .split('.').join('')
                            .split('$').join('');
                    };

                    scope.getColumnStatusText = function (documentpath, key) {
                        if (scope.ExpandedCols[documentpath + key])
                            return '-';

                        return '+';
                    };

                    scope.changeColumnStatus = function (documentpath, key) {
                        scope.ExpandedCols[documentpath + key] = !scope.ExpandedCols[documentpath + key];
                    };

                    scope.ExpandedCols = [];
                };
            },
            templateUrl: 'jsontable.html'
        };
    });