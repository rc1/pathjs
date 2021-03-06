var Path = {
    'map': function (path) {
        if (Path.routes.hasOwnProperty(path)) {
            return Path.routes[path];
        } else {
            return new Path.core.route(path);
        }
    },
    'root': function (path) {
        Path.routes.root = path;
    },
    'rescue': function (fn) {
        Path.routes.rescue = fn;
    },
    'match': function (path) {
        var params = {};
        var route = null;
        var i = null;
        for (route in Path.routes) {
            if (route !== null && route !== undefined) {
                var compare = path;
                if (route.search(/:/) > 0) {
                    for (i = 0; i < route.split("/").length; i++) {
                        if ((i < compare.split("/").length) && (route.split("/")[i].charAt(0) === ":")) {
                            params[route.split('/')[i].replace(/:/, '')] = compare.split("/")[i];
                            compare = compare.replace(compare.split("/")[i], route.split("/")[i]);
                        }
                    }
                }

                if (route === compare) {
                    Path.routes[route].params = params;
                    return Path.routes[route];
                }
            }
        }

        return null;
    },
    'dispatch': function () {
        if (Path.routes.current !== location.hash) {
            Path.routes.previous = Path.routes.current;
            Path.routes.current = location.hash;
            var match = Path.match(location.hash);
            if (match !== null) {
                match.run();
            } else {
                if (Path.routes.rescue !== null) {
                    if (Path.routes[Path.routes.previous].do_exit !== null) {
                        Path.routes[Path.routes.previous].do_exit();
                    }

                    Path.routes.rescue();
                }
            }
        }
    },
    'listen': function () {
        if (location.hash === "") {
            if (Path.routes.root !== null) {
                location.hash = Path.routes.root;
            }
        } else {
            Path.dispatch();
        }

        if ("onhashchange" in window) {
            window.onhashchange = Path.dispatch;
        } else {
            setInterval(Path.dispatch, 50);
        }
    },
    'core': {
        'route': function (path) {
            this.path = path;
            this.action = null;
            this.do_enter = null;
            this.do_exit = null;
            this.params = {};
            Path.routes[path] = this;
        }
    },
    'routes': {
        'current': null,
        'root': null,
        'rescue': null,
        'previous': null
    }
};
Path.core.route.prototype = {
    'to': function (fn) {
        this.action = fn;
        return this;
    },
    'enter': function (fn) {
        this.do_enter = fn;
        return this;
    },
    'exit': function (fn) {
        this.do_exit = fn;
        return this;
    },
    'run': function () {
        if (Path.routes.hasOwnProperty(Path.routes.previous)) {
            if (Path.routes[Path.routes.previous].do_exit !== null) {
                Path.routes[Path.routes.previous].do_exit();
            }
        }

        if (Path.routes[this.path].hasOwnProperty("do_enter")) {
            if (Path.routes[this.path].do_enter !== null) {
                Path.routes[this.path].do_enter();
            }
        }

        Path.routes[this.path].action();
    }
};
