angular
    .module('jsonMenu', ['ui.router'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('product-list', {
                url: "/product-list",
                template: "<h1>product list </h1>"
            })
            .state('contact', {
                url: "/contact",
                template: "<h1>contact</h1><ui-view></ui-view>"
            })
            .state('contact.shops', {
                url: "/shop/:id",
                template: "<h1>id: {{id}}</h1>",
                controller: function ($scope, $stateParams) {
                    $scope.id = $stateParams.id;
                }
            })
            .state('contact.offices', {
                url: "/offices",
                template: "<h1>offices: tralal</h1>",
                controller: function ($scope) {

                }
            })

    })
    .directive('jsonMenu', function ($state) {
        return {
            template: "<h1>sdf</h1>",
            link: function (scope, container, attrs) {
                $.get(attrs.jsonMenu, function (responseData) {
                    var data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
                    container.attr('data-level', 0);
                    createMenu(data, container);
                });
                function createMenu(arr, ul) {
                    arr.forEach(function (obj) {
                        var li = $("<li>");
                        var a = $("<a>")
                            .text(obj.name)
                            .on('click', function () {
                                $(this)
                                    .parent()
                                    .siblings()
                                    .find('ul')
                                    .slideUp();
                                setActive(this);
                            });
                        var icon = $('<i>').addClass(obj.icon);
                        a.prepend(icon);
                        li.append(a);
                        $(ul).append(li);
                        if (obj.hasOwnProperty('sub')) {
                            var parentLevel = li.closest('ul').data('level');
                            var ulSub = $("<ul>")
                                .addClass('list-unstyled')
                                .attr({
                                    'data-level': parentLevel + 1,
                                    'group': obj.group,
                                    'name': obj.name
                                })
                                .hide();
                            li.append(ulSub);
                            createMenu(obj.sub, ulSub);
                        } else {
                            a.css('opacity', .9);
                            a.on('click', function () {
                                setActive(this);
                                go(a, obj);
                            });
                        }
                    });
                }

                function go(a, obj) {
                    createLink(a, [], function (linksStorage) {
                        if (a.closest('ul').attr('group')) {
                            var id = a.parent().index();
                            $state.go(linksStorage.join('.'), {id: id});
                        } else {
                            linksStorage.push(obj.name);
                            $state.go(linksStorage.join('.').replace(/\s/g, '-'));
                        }
                    });
                }

                function createLink(el, linksStorage, callback) {
                    var name = el.closest('ul').attr('name');
                    var level = el.closest('ul').data('level');
                    name && linksStorage.unshift(name);
                    if (level > 1) {
                        createLink(el.closest('ul').parent(), linksStorage, callback);
                    } else {
                        callback(linksStorage);
                    }
                }

                function setActive(el) {
                    $('.active', container).removeClass('active');
                    $(el).addClass('active');
                    $(el.nextElementSibling).slideToggle();
                    $(el.nextElementSibling).find('ul').slideUp();
                }
            }
        }
    });