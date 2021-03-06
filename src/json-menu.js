angular
    .module('jsonMenu', [])
    .directive('jsonMenu', function ($state, $timeout) {
        return {
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
                            .text(" " + obj.text)
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
                                });
                            li.append(ulSub);
                            $timeout(function () {
                                var reg = new RegExp(obj.name);
                                var ok = reg.test($state.current.name);
                                if (ok) {
                                    ulSub.show();
                                } else {
                                    ulSub.hide();
                                }
                            });
                            createMenu(obj.sub, ulSub);
                        } else {
                            a.css('opacity', .9);
                            a.on('click', function () {
                                setActive(this);
                                go(a, obj);
                            });
                            $timeout(function () {
                                var idx = a.parent().index();
                                createLink(a, [], function (linksStorage) {
                                    !a.closest('ul').attr('group') && linksStorage.push(obj.name);
                                    if (linksStorage.join('.') == $state.current.name) {
                                        if ($state.params.id && $state.params.id == idx) {
                                            setActive(a);
                                        }
                                        if (!$state.params.id) {
                                            setActive(a);
                                        }
                                    }
                                });
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
                            $state.go(linksStorage.join('.'));
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