/*
Copyright(c) 2010 Sencha Inc.
licensing@sencha.com
http://www.sencha.com/touchlicense
*/

// for old browsers
window.undefined = window.undefined;

/**
 * @class Ext
 * Ext core utilities and functions.
 * @singleton
 */
Ext = {
    /**
     * The version of the framework
     * @type String
     */
    version : '0.9.1',
    versionDetail : {
        major : 0,
        minor : 9,
        patch : 1
    }
};

/**
 * Sets up a page for use on a mobile device.
 * @param {Object} config
 *
 * Valid configurations are:
 * <ul>
 *  <li>fullscreen - Boolean - Sets an appropriate meta tag for Apple devices to run in full-screen mode.</li>
 *  <li>tabletStartupScreen - String - Startup screen to be used on an iPad. The image must be 768x1004 and in portrait orientation.</li>
 *  <li>phoneStartupScreen - String - Startup screen to be used on an iPhone or iPod touch. The image must be 320x460 and in portrait orientation.</li>
 *  <li>icon - Default icon to use. This will automatically apply to both tablets and phones. These should be 72x72.</li>
 *  <li>tabletIcon - String - An icon for only tablets. (This config supersedes icon.) These should be 72x72.</li>
 *  <li>phoneIcon - String - An icon for only phones. (This config supersedes icon.) These should be 57x57.</li>
 *  <li>glossOnIcon - Boolean - Add gloss on icon on iPhone, iPad and iPod Touch</li>
 *  <li>statusBarStyle - String - Sets the status bar style for fullscreen iPhone OS web apps. Valid options are default, black, or black-translucent.</li>
 *  <li>preloadImages - Array - An array of urls of images to be loaded.</li>
 *  <li>onReady - Function - Function to be run when the DOM is ready.<li>
 *  <li>scope - Scope - Scope for the onReady configuraiton to be run in.</li>
 * </ul>
 */
Ext.setup = function(config) {
    if (Ext.isObject(config)) {
        if (config.addMetaTags !== false) {
            var viewport = Ext.get(document.createElement('meta')),
                app = Ext.get(document.createElement('meta')),
                statusBar = Ext.get(document.createElement('meta')),
                startupScreen = Ext.get(document.createElement('link')),
                appIcon = Ext.get(document.createElement('link'));

            viewport.set({
                name: 'viewport',
                content: 'width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0;'
            });

            if (config.fullscreen !== false) {
                app.set({
                    name: 'apple-mobile-web-app-capable',
                    content: 'yes'
                });

                if (Ext.isString(config.statusBarStyle)) {
                    statusBar.set({
                        name: 'apple-mobile-web-app-status-bar-style',
                        content: config.statusBarStyle
                    });
                }
            }

            if (Ext.isString(config.tabletStartupScreen) && Ext.platform.isTablet) {
                startupScreen.set({
                    rel: 'apple-touch-startup-image',
                    href: config.tabletStartupScreen
                });
            } else if (Ext.isString(config.phoneStartupScreen) && Ext.platform.isPhone) {
                startupScreen.set({
                    rel: 'apple-touch-startup-image',
                    href: config.phoneStartupScreen
                });
            }

            if (config.icon) {
                config.phoneIcon = config.tabletIcon = config.icon;
            }

            var precomposed = (config.glossOnIcon == false) ? '-precomposed' : '';
            if (Ext.isString(config.tabletIcon) && Ext.platform.isTablet) {
                appIcon.set({
                    rel: 'apple-touch-icon' + precomposed,
                    href: config.tabletIcon
                });
            } else if (Ext.isString(config.phoneIcon) && Ext.platform.isPhone) {
                appIcon.set({
                    el: 'apple-touch-icon' + precomposed,
                    href: config.phoneIcon
                });
            }

            var head = Ext.get(document.getElementsByTagName('head')[0]);
            head.appendChild(viewport);
            if (app.getAttribute('name')) head.appendChild(app);
            if (statusBar.getAttribute('name')) head.appendChild(statusBar);

            if (appIcon.getAttribute('href')) head.appendChild(appIcon);
            if (startupScreen.getAttribute('href')) head.appendChild(startupScreen);
        }

        if (Ext.isArray(config.preloadImages)) {
            for (var i = config.preloadImages.length - 1; i >= 0; i--) {
                (new Image()).src = config.preloadImages[i];
            };
        }

        if (Ext.isFunction(config.onReady)) {
            Ext.onReady(config.onReady, config.scope || window);
        }
    }
};

/**
 * Copies all the properties of config to obj.
 * @param {Object} object The receiver of the properties
 * @param {Object} config The source of the properties
 * @param {Object} defaults A different object that will also be applied for default values
 * @return {Object} returns obj
 * @member Ext apply
 */
Ext.apply = function(object, config, defaults) {
    // no "this" reference for friendly out of scope calls
    if (defaults) {
        Ext.apply(object, defaults);
    }
    if (object && config && typeof config == 'object') {
        for (var key in config) {
            object[key] = config[key];
        }
    }
    return object;
};

Ext.apply(Ext, {
    userAgent: navigator.userAgent.toLowerCase(),
    cache: {},
    idSeed: 1000,
    BLANK_IMAGE_URL : 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
    isStrict: document.compatMode == "CSS1Compat",

    /**
    * A reusable empty function
    * @property
    * @type Function
    */
    emptyFn : function(){},

    /**
     * True if the page is running over SSL
     * @type Boolean
     */
    isSecure : /^https/i.test(window.location.protocol),
    /**
     * True when the document is fully initialized and ready for action
     * @type Boolean
     */
    isReady : false,

    /**
     * True to automatically uncache orphaned Ext.Elements periodically (defaults to true)
     * @type Boolean
     */
    enableGarbageCollector : true,

    /**
     * True to automatically purge event listeners during garbageCollection (defaults to true).
     * @type Boolean
     */
    enableListenerCollection : true,

    /**
     * Copies all the properties of config to obj if they don't already exist.
     * @param {Object} obj The receiver of the properties
     * @param {Object} config The source of the properties
     * @return {Object} returns obj
     */
    applyIf : function(object, config) {
        var property, undefined;
        if (object) {
            for (property in config) {
                if (object[property] === undefined) {
                    object[property] = config[property];
                }
            }
        }
        return object;
    },

    /**
     * Repaints the whole page. This fixes frequently encountered painting issues in mobile Safari.
     */
    repaint : function() {
        var mask = Ext.getBody().createChild({
            cls: 'x-mask x-mask-transparent'
        });        
        setTimeout(function() {
            mask.remove();
        }, 0);
    },

    /**
     * Generates unique ids. If the element already has an id, it is unchanged
     * @param {Mixed} el (optional) The element to generate an id for
     * @param {String} prefix (optional) Id prefix (defaults "ext-gen")
     * @return {String} The generated Id.
     */
    id : function(el, prefix) {
        return (el = Ext.getDom(el) || {}).id = el.id || (prefix || "ext-gen") + (++Ext.idSeed);
    },

    /**
     * <p>Extends one class to create a subclass and optionally overrides members with the passed literal. This method
     * also adds the function "override()" to the subclass that can be used to override members of the class.</p>
     * For example, to create a subclass of Ext GridPanel:
     * <pre><code>
MyGridPanel = Ext.extend(Ext.grid.GridPanel, {
constructor: function(config) {

//      Create configuration for this Grid.
    var store = new Ext.data.Store({...});
    var colModel = new Ext.grid.ColumnModel({...});

//      Create a new config object containing our computed properties
//      *plus* whatever was in the config parameter.
    config = Ext.apply({
        store: store,
        colModel: colModel
    }, config);

    MyGridPanel.superclass.constructor.call(this, config);

//      Your postprocessing here
},

yourMethod: function() {
    // etc.
}
});
       </code></pre>
     *
     * <p>This function also supports a 3-argument call in which the subclass's constructor is
     * passed as an argument. In this form, the parameters are as follows:</p>
     * <div class="mdetail-params"><ul>
     * <li><code>subclass</code> : Function <div class="sub-desc">The subclass constructor.</div></li>
     * <li><code>superclass</code> : Function <div class="sub-desc">The constructor of class being extended</div></li>
     * <li><code>overrides</code> : Object <div class="sub-desc">A literal with members which are copied into the subclass's
     * prototype, and are therefore shared among all instances of the new class.</div></li>
     * </ul></div>
     *
     * @param {Function} superclass The constructor of class being extended.
     * @param {Object} overrides <p>A literal with members which are copied into the subclass's
     * prototype, and are therefore shared between all instances of the new class.</p>
     * <p>This may contain a special member named <tt><b>constructor</b></tt>. This is used
     * to define the constructor of the new class, and is returned. If this property is
     * <i>not</i> specified, a constructor is generated and returned which just calls the
     * superclass's constructor passing on its parameters.</p>
     * <p><b>It is essential that you call the superclass constructor in any provided constructor. See example code.</b></p>
     * @return {Function} The subclass constructor from the <code>overrides</code> parameter, or a generated one if not provided.
     */
    extend : function() {
        // inline overrides
        var inlineOverrides = function(o){
            for(var m in o){
                this[m] = o[m];
            }
        };

        var objectConstructor = Object.prototype.constructor;

        return function(subclass, superclass, overrides){
            // First we check if the user passed in just the superClass with overrides
            if(Ext.isObject(superclass)){
                overrides = superclass;
                superclass = subclass;
                subclass = overrides.constructor != objectConstructor
                    ? overrides.constructor
                    : function(){ superclass.apply(this, arguments); };
            }

            // We create a new temporary class
            var F = function(){},
                subclassProto,
                superclassProto = superclass.prototype;

            F.prototype = superclassProto;
            subclassProto = subclass.prototype = new F();
            subclassProto.constructor = subclass;
            subclass.superclass = superclassProto;

            if(superclassProto.constructor == objectConstructor){
                superclassProto.constructor = superclass;
            }

            subclass.override = function(overrides){
                Ext.override(subclass, overrides);
            };

            subclassProto.superclass = subclassProto.supr = (function(){
                return superclassProto;
            });

            subclassProto.override = inlineOverrides;
            subclass.override(overrides);
            subclass.extend = function(o){return Ext.extend(subclass, o);};
            return subclass;
        };
    }(),

    /**
     * Adds a list of functions to the prototype of an existing class, overwriting any existing methods with the same name.
     * Usage:<pre><code>
Ext.override(MyClass, {
newMethod1: function(){
    // etc.
},
newMethod2: function(foo){
    // etc.
}
});
       </code></pre>
     * @param {Object} origclass The class to override
     * @param {Object} overrides The list of functions to add to origClass.  This should be specified as an object literal
     * containing one or more methods.
     * @method override
     */
    override : function(origclass, overrides) {
        if (overrides) {
            Ext.apply(origclass.prototype, overrides);
        }
    },


    /**
     * Creates namespaces to be used for scoping variables and classes so that they are not global.
     * Specifying the last node of a namespace implicitly creates all other nodes. Usage:
     * <pre><code>
Ext.namespace('Company', 'Company.data');
Ext.namespace('Company.data'); // equivalent and preferable to above syntax
Company.Widget = function() { ... }
Company.data.CustomStore = function(config) { ... }
       </code></pre>
     * @param {String} namespace1
     * @param {String} namespace2
     * @param {String} etc
     * @return {Object} The namespace object. (If multiple arguments are passed, this will be the last namespace created)
     * @method namespace
     */
    namespace : function() {
        var ln = arguments.length,
            i, value, split, x, xln;

        for (i = 0; i < ln; i++) {
            value = arguments[i];
            parts = value.split(".");
            object = window[parts[0]] = Object(window[parts[0]]);
            for (x = 1, xln = parts.length; x < xln; x++) {
                object = object[parts[x]] = Object(object[parts[x]]);
            }
        }
        return object;
    },

    /**
     * Takes an object and converts it to an encoded URL. e.g. Ext.urlEncode({foo: 1, bar: 2}); would return "foo=1&bar=2".  Optionally, property values can be arrays, instead of keys and the resulting string that's returned will contain a name/value pair for each array value.
     * @param {Object} o
     * @param {String} pre (optional) A prefix to add to the url encoded string
     * @return {String}
     */
    urlEncode : function(o, pre){
        var empty,
            buf = [],
            e = encodeURIComponent;

        Ext.iterate(o, function(key, item){
            empty = Ext.isEmpty(item);
            Ext.each(empty ? key : item, function(val){
                buf.push('&', e(key), '=', (!Ext.isEmpty(val) && (val != key || !empty)) ? (Ext.isDate(val) ? Ext.encode(val).replace(/"/g, '') : e(val)) : '');
            });
        });
        if(!pre){
            buf.shift();
            pre = '';
        }
        return pre + buf.join('');
    },

    /**
     * Takes an encoded URL and and converts it to an object. Example:
     * <pre><code>
Ext.urlDecode("foo=1&bar=2"); // returns {foo: "1", bar: "2"}
Ext.urlDecode("foo=1&bar=2&bar=3&bar=4", false); // returns {foo: "1", bar: ["2", "3", "4"]}
       </code></pre>
     * @param {String} string
     * @param {Boolean} overwrite (optional) Items of the same name will overwrite previous values instead of creating an an array (Defaults to false).
     * @return {Object} A literal with members
     */
    urlDecode : function(string, overwrite){
        if(Ext.isEmpty(string)){
            return {};
        }
        var obj = {},
            pairs = string.split('&'),
            d = decodeURIComponent,
            name,
            value;
        Ext.each(pairs, function(pair) {
            pair = pair.split('=');
            name = d(pair[0]);
            value = d(pair[1]);
            obj[name] = overwrite || !obj[name] ? value : [].concat(obj[name]).concat(value);
        });
        return obj;
    },

    /**
     * Convert certain characters (&, <, >, and ') to their HTML character equivalents for literal display in web pages.
     * @param {String} value The string to encode
     * @return {String} The encoded text
     */
    htmlEncode : function(value){
        return Ext.util.Format.htmlEncode(value);
    },

    /**
     * Convert certain characters (&, <, >, and ') from their HTML character equivalents.
     * @param {String} value The string to decode
     * @return {String} The decoded text
     */
    htmlDecode : function(value){
         return Ext.util.Format.htmlDecode(value);
    },

    /**
     * Appends content to the query string of a URL, handling logic for whether to place
     * a question mark or ampersand.
     * @param {String} url The URL to append to.
     * @param {String} s The content to append to the URL.
     * @return (String) The resulting URL
     */
    urlAppend : function(url, s){
        if(!Ext.isEmpty(s)){
            return url + (url.indexOf('?') === -1 ? '?' : '&') + s;
        }
        return url;
    },

    /**
     * Converts any iterable (numeric indices and a length property) into a true array
     * Don't use this on strings. IE doesn't support "abc"[0] which this implementation depends on.
     * For strings, use this instead: "abc".match(/./g) => [a,b,c];
     * @param {Iterable} the iterable object to be turned into a true Array.
     * @return (Array) array
     */
     toArray : function(array, start, end){
        return Array.prototype.slice.call(array, start || 0, end || array.length);
     },

     /**
      * Iterates an array calling the supplied function.
      * @param {Array/NodeList/Mixed} array The array to be iterated. If this
      * argument is not really an array, the supplied function is called once.
      * @param {Function} fn The function to be called with each item. If the
      * supplied function returns false, iteration stops and this method returns
      * the current <code>index</code>. This function is called with
      * the following arguments:
      * <div class="mdetail-params"><ul>
      * <li><code>item</code> : <i>Mixed</i>
      * <div class="sub-desc">The item at the current <code>index</code>
      * in the passed <code>array</code></div></li>
      * <li><code>index</code> : <i>Number</i>
      * <div class="sub-desc">The current index within the array</div></li>
      * <li><code>allItems</code> : <i>Array</i>
      * <div class="sub-desc">The <code>array</code> passed as the first
      * argument to <code>Ext.each</code>.</div></li>
      * </ul></div>
      * @param {Object} scope The scope (<code>this</code> reference) in which the specified function is executed.
      * Defaults to the <code>item</code> at the current <code>index</code>util
      * within the passed <code>array</code>.
      * @return See description for the fn parameter.
      */
     each : function(array, fn, scope) {
         if (Ext.isEmpty(array, true)) {
             return 0;
         }
         if (!Ext.isIterable(array) || Ext.isPrimitive(array)) {
             array = [array];
         }
         for (var i = 0, len = array.length; i < len; i++) {
             if (fn.call(scope || array[i], array[i], i, array) === false) {
                 return i;
             };
         }
         return true;
     },

     /**
      * Iterates either the elements in an array, or each of the properties in an object.
      * <b>Note</b>: If you are only iterating arrays, it is better to call {@link #each}.
      * @param {Object/Array} object The object or array to be iterated
      * @param {Function} fn The function to be called for each iteration.
      * The iteration will stop if the supplied function returns false, or
      * all array elements / object properties have been covered. The signature
      * varies depending on the type of object being interated:
      * <div class="mdetail-params"><ul>
      * <li>Arrays : <tt>(Object item, Number index, Array allItems)</tt>
      * <div class="sub-desc">
      * When iterating an array, the supplied function is called with each item.</div></li>
      * <li>Objects : <tt>(String key, Object value, Object)</tt>
      * <div class="sub-desc">
      * When iterating an object, the supplied function is called with each key-value pair in
      * the object, and the iterated object</div></li>
      * </ul></divutil>
      * @param {Object} scope The scope (<code>this</code> reference) in which the specified function is executed. Defaults to
      * the <code>object</code> being iterated.
      */
     iterate : function(obj, fn, scope){
         if(Ext.isEmpty(obj)){
             return;
         }
         if (Ext.isIterable(obj)) {
             Ext.each(obj, fn, scope);
             return;
         }
         else if(Ext.isObject(obj)) {
             for (var prop in obj) {
                 if (obj.hasOwnProperty(prop)) {
                     if (fn.call(scope || obj, prop, obj[prop], obj) === false) {
                         return;
                     };
                 }
             }
         }
     },

     /**
      * Return the dom node for the passed String (id), dom node, or Ext.Element.
      * Here are some examples:
      * <pre><code>
// gets dom node based on id
var elDom = Ext.getDom('elId');
// gets dom node based on the dom node
var elDom1 = Ext.getDom(elDom);

// If we don&#39;t know if we are working with an
// Ext.Element or a dom node use Ext.getDom
function(el){
 var dom = Ext.getDom(el);
 // do something with the dom node
}
       </code></pre>
     * <b>Note</b>: the dom node to be found actually needs to exist (be rendered, etc)
     * when this method is called to be successful.
     * @param {Mixed} el
     * @return HTMLElement
     */
    getDom : function(el) {
        if (!el || !document) {
            return null;
        }
        return el.dom ? el.dom : (typeof el == 'string' ? document.getElementById(el) : el);
    },

    /**
     * Returns the current document body as an {@link Ext.Element}.
     * @return Ext.Element The document body
     */
    getBody : function(){
        return Ext.get(document.body || false);
    },

    /**
     * Returns the current HTML document object as an {@link Ext.Element}.
     * @return Ext.Element The document
     */
    getDoc : function(){
        return Ext.get(document);
    },

    /**
     * This is shorthand reference to {@link Ext.ComponentMgr#get}.
     * Looks up an existing {@link Ext.Component Component} by {@link Ext.Component#id id}
     * @param {String} id The component {@link Ext.Component#id id}
     * @return Ext.Component The Component, <tt>undefined</tt> if not found, or <tt>null</tt> if a
     * Class was found.
    */
    getCmp : function(id){
        return Ext.ComponentMgr.get(id);
    },

    /**
     * Returns the current orientation of the mobile device
     * @return {String} Either 'portrait' or 'landscape'
     */
    getOrientation: function() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    },

    /**
     * <p>Removes this element from the document, removes all DOM event listeners, and deletes the cache reference.
     * All DOM event listeners are removed from this element. If {@link Ext#enableNestedListenerRemoval} is
     * <code>true</code>, then DOM event listeners are also removed from all child nodes. The body node
     * will be ignored if passed in.</p>
     * @param {HTMLElement} node The node to remove
     */
    removeNode : function(n){
        if (n && n.parentNode && n.tagName != 'BODY') {
            Ext.EventManager.removeAll(n);
            n.parentNode.removeChild(n);
            delete Ext.cache[n.id];
        }
    },

    /**
     * Attempts to destroy any objects passed to it by removing all event listeners, removing them from the
     * DOM (if applicable) and calling their destroy functions (if available).  This method is primarily
     * intended for arguments of type {@link Ext.Element} and {@link Ext.Component}, but any subclass of
     * {@link Ext.util.Observable} can be passed in.  Any number of elements and/or components can be
     * passed into this function in a single call as separate arguments.
     * @param {Mixed} arg1 An {@link Ext.Element}, {@link Ext.Component}, or an Array of either of these to destroy
     * @param {Mixed} arg2 (optional)
     * @param {Mixed} etc... (optional)
     */
    destroy : function() {
        var ln = arguments.length,
            i, arg;
        for (i = 0; i < ln; i++) {
            arg = arguments[i];
            if (arg) {
                if (Ext.isArray(arg)) {
                    this.destroy.apply(this, arg);
                }
                else if (Ext.isFunction(arg.destroy)) {
                    arg.destroy();
                }
                else if (arg.dom) {
                    arg.remove();
                }
            }
        }
    },

    isIterable : function(v){
        //check for array or arguments
        if(Ext.isArray(v) || v.callee){
            return true;
        }
        //check for node list type
        if(/NodeList|HTMLCollection/.test(Object.prototype.toString.call(v))){
            return true;
        }
        //NodeList has an item and length property
        //IXMLDOMNodeList has nextNode method, needs to be checked first.
        return ((typeof v.nextNode != 'undefined' || v.item) && Ext.isNumber(v.length));
    },

    /**
     * Utility method for validating that a value is numeric, returning the specified default value if it is not.
     * @param {Mixed} value Should be a number, but any type will be handled appropriately
     * @param {Number} defaultValue The value to return if the original value is non-numeric
     * @return {Number} Value, if numeric, else defaultValue
     */
    num : function(v, defaultValue){
        v = Number(Ext.isEmpty(v) || Ext.isArray(v) || typeof v == 'boolean' || (typeof v == 'string' && v.trim().length == 0) ? NaN : v);
        return isNaN(v) ? defaultValue : v;
    },

    /**
     * <p>Returns true if the passed value is empty.</p>
     * <p>The value is deemed to be empty if it is<div class="mdetail-params"><ul>
     * <li>null</li>
     * <li>undefined</li>
     * <li>an empty array</li>
     * <li>a zero length string (Unless the <tt>allowBlank</tt> parameter is <tt>true</tt>)</li>
     * </ul></div>
     * @param {Mixed} value The value to test
     * @param {Boolean} allowBlank (optional) true to allow empty strings (defaults to false)
     * @return {Boolean}
     */
    isEmpty : function(v, allowBlank) {
        return v == null || ((Ext.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
    },

    /**
     * Returns true if the passed value is a JavaScript array, otherwise false.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isArray : function(v) {
        return Object.prototype.toString.apply(v) === '[object Array]';
    },

    /**
     * Returns true if the passed object is a JavaScript date object, otherwise false.
     * @param {Object} object The object to test
     * @return {Boolean}
     */
    isDate : function(v) {
        return Object.prototype.toString.apply(v) === '[object Date]';
    },

    /**
     * Returns true if the passed value is a JavaScript Object, otherwise false.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isObject : function(v) {
        return !!v && Object.prototype.toString.call(v) === '[object Object]';
    },

    /**
     * Returns true if the passed value is a JavaScript 'primitive', a string, number or boolean.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isPrimitive : function(v) {
        return Ext.isString(v) || Ext.isNumber(v) || Ext.isBoolean(v);
    },

    /**
     * Returns true if the passed value is a JavaScript Function, otherwise false.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isFunction : function(v) {
        return Object.prototype.toString.apply(v) === '[object Function]';
    },

    /**
     * Returns true if the passed value is a number. Returns false for non-finite numbers.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isNumber : function(v) {
        return Object.prototype.toString.apply(v) === '[object Number]' && isFinite(v);
    },

    /**
     * Returns true if the passed value is a string.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isString : function(v) {
        return Object.prototype.toString.apply(v) === '[object String]';
    },

    /**util
     * Returns true if the passed value is a boolean.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isBoolean : function(v) {
        return Object.prototype.toString.apply(v) === '[object Boolean]';
    },

    /**
     * Returns true if the passed value is an HTMLElement
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isElement : function(v) {
        return !!v && v.tagName;
    },

    /**
     * Returns true if the passed value is not undefined.
     * @param {Mixed} value The value to test
     * @return {Boolean}
     */
    isDefined : function(v){
        return typeof v !== 'undefined';
    },

    /**
     * Escapes the passed string for use in a regular expression
     * @param {String} str
     * @return {String}
     */
    escapeRe : function(s) {
        return s.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
    }
});

/**
 * URL to a blank file used by Ext when in secure mode for iframe src and onReady src to prevent
 * the IE insecure content warning (<tt>'about:blank'</tt>, except for IE in secure mode, which is <tt>'javascript:""'</tt>).
 * @type String
 */
Ext.SSL_SECURE_URL = Ext.isSecure && 'about:blank';

Ext.ns = Ext.namespace;

Ext.ns(
    'Ext.util',
    'Ext.data',
    'Ext.list',
    'Ext.form',
    'Ext.menu',
    'Ext.state',
    'Ext.layout',
    'Ext.app',
    'Ext.ux',
    'Ext.plugins',
    'Ext.direct'
);

/**
 * @class Function
 * These functions are available on every Function object (any JavaScript function).
 */
Ext.apply(Function.prototype, {
     /**
     * Creates an interceptor function. The passed function is called before the original one. If it returns false,
     * the original one is not called. The resulting function returns the results of the original function.
     * The passed function is called with the parameters of the original function. Example usage:
     * <pre><code>
var sayHi = function(name){
    alert('Hi, ' + name);
}

sayHi('Fred'); // alerts "Hi, Fred"

// create a new function that validates input without
// directly modifying the original function:
var sayHiToFriend = sayHi.createInterceptor(function(name){
    return name == 'Brian';
});

sayHiToFriend('Fred');  // no alert
sayHiToFriend('Brian'); // alerts "Hi, Brian"
       </code></pre>
     * @param {Function} fcn The function to call before the original
     * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the passed function is executed.
     * <b>If omitted, defaults to the scope in which the original function is called or the browser window.</b>
     * @return {Function} The new function
     */
    createInterceptor : function(fn, scope) {
        if (!Ext.isFunction(fn)) {
            return this;
        }
        else {
            var method = this;
            return function() {
                var me = this,
                    args = arguments;

                fn.target = me;
                fn.method = method;

                if (fn.apply(scope || me || window, args) !== false) {
                    return method.apply(me || window, args);
                }

                return null;
            };
        }
    },

    /**
     * Creates a delegate (callback) that sets the scope to obj.
     * Call directly on any function. Example: <code>this.myFunction.createDelegate(this, [arg1, arg2])</code>
     * Will create a function that is automatically scoped to obj so that the <tt>this</tt> variable inside the
     * callback points to obj. Example usage:
     * <pre><code>
var sayHi = function(name){
    // Note this use of "this.text" here.  This function expects to
    // execute within a scope that contains a text property.  In this
    // example, the "this" variable is pointing to the btn object that
    // was passed in createDelegate below.
    alert('Hi, ' + name + '. You clicked the "' + this.text + '" button.');
}

var btn = new Ext.Button({
    text: 'Say Hi',
    renderTo: Ext.getBody()
});

// This callback will execute in the scope of the
// button instance. Clicking the button alerts
// "Hi, Fred. You clicked the "Say Hi" button."
btn.on('click', sayHi.createDelegate(btn, ['Fred']));
       </code></pre>
     * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the function is executed.
     * <b>If omitted, defaults to the browser window.</b>
     * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
     * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
     * if a number the args are inserted at the specified position
     * @return {Function} The new function
     */
    createDelegate : function(obj, args, appendArgs) {
        var method = this;
        return function() {
            var callArgs = args || arguments;
            if (appendArgs === true) {
                callArgs = Array.prototype.slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }
            else if (Ext.isNumber(appendArgs)) {
                callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
                var applyArgs = [appendArgs, 0].concat(args); // create method call params
                Array.prototype.splice.apply(callArgs, applyArgs); // splice them in
            }
            return method.apply(obj || window, callArgs);
        };
    },

    /**
     * Calls this function after the number of millseconds specified, optionally in a specific scope. Example usage:
     * <pre><code>
var sayHi = function(name){
    alert('Hi, ' + name);
}

// executes immediately:
sayHi('Fred');

// executes after 2 seconds:
sayHi.defer(2000, this, ['Fred']);

// this syntax is sometimes useful for deferring
// execution of an anonymous function:
(function(){
    alert('Anonymous');
}).defer(100);
       </code></pre>
     * @param {Number} millis The number of milliseconds for the setTimeout call (if less than or equal to 0 the function is executed immediately)
     * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the function is executed.
     * <b>If omitted, defaults to the browser window.</b>
     * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
     * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
     * if a number the args are inserted at the specified position
     * @return {Number} The timeout id that can be used with clearTimeout
     */
    defer : function(millis, obj, args, appendArgs) {
        var fn = this.createDelegate(obj, args, appendArgs);
        if (millis > 0) {
            return setTimeout(fn, millis);
        }
        fn();
        return 0;
    }
});

/**
 * @class String
 * These functions are available on every String object.
 */
Ext.applyIf(String.prototype, {
    /**
     * Escapes the passed string for ' and \
     * @param {String} string The string to escape
     * @return {String} The escaped string
     * @static
     */
    escape : function(string) {
        return string.replace(/('|\\)/g, "\\$1");
    },

    /**
     * Utility function that allows you to easily switch a string between two alternating values.  The passed value
     * is compared to the current string, and if they are equal, the other value that was passed in is returned.  If
     * they are already different, the first value passed in is returned.  Note that this method returns the new value
     * but does not change the current string.
     * <pre><code>
    // alternate sort directions
    sort = sort.toggle('ASC', 'DESC');

    // instead of conditional logic:
    sort = (sort == 'ASC' ? 'DESC' : 'ASC');
       </code></pre>
     * @param {String} value The value to compare to the current string
     * @param {String} other The new value to use if the string already equals the first value passed in
     * @return {String} The new value
     */
    toggle : function(value, other){
        return this == value ? other : value;
    },

    /**
     * Trims whitespace from either end of a string, leaving spaces within the string intact.  Example:
     * <pre><code>
    var s = '  foo bar  ';
    alert('-' + s + '-');         //alerts "- foo bar -"
    alert('-' + s.trim() + '-');  //alerts "-foo bar-"
       </code></pre>
     * @return {String} The trimmed string
     */
    trim : function() {
        var re = /^\s+|\s+$/g;
        return function() {
            return this.replace(re, "");
        };
    }()
});

/**
 * @class String
 * These functions are available on every String object.
 */
Ext.applyIf(String, {
    /**
     * Escapes the passed string for ' and \
     * @param {String} string The string to escape
     * @return {String} The escaped string
     * @static
     */
    escape : function(string) {
        return string.replace(/('|\\)/g, "\\$1");
    },

    /**
     * Pads the left side of a string with a specified character.  This is especially useful
     * for normalizing number and date strings.  Example usage:
     *
     * <pre><code>
var s = String.leftPad('123', 5, '0');
// s now contains the string: '00123'
       </code></pre>
     * @param {String} string The original string
     * @param {Number} size The total length of the output string
     * @param {String} char (optional) The character with which to pad the original string (defaults to empty string " ")
     * @return {String} The padded string
     * @static
     */
    leftPad : function (val, size, ch) {
        var result = String(val);
        if(!ch) {
            ch = " ";
        }
        while (result.length < size) {
            result = ch + result;
        }
        return result;
    },

    /**
     * Allows you to define a tokenized string and pass an arbitrary number of arguments to replace the tokens.  Each
     * token must be unique, and must increment in the format {0}, {1}, etc.  Example usage:
     * <pre><code>
var cls = 'my-class', text = 'Some text';
var s = String.format('&lt;div class="{0}">{1}&lt;/div>', cls, text);
// s now contains the string: '&lt;div class="my-class">Some text&lt;/div>'
       </code></pre>
     * @param {String} string The tokenized string to be formatted
     * @param {String} value1 The value to replace token {0}
     * @param {String} value2 Etc...
     * @return {String} The formatted string
     * @static
     */
    format : function(format){
        var args = Ext.toArray(arguments, 1);
        return format.replace(/\{(\d+)\}/g, function(m, i){
            return args[i];
        });
    }
});

/**
 Returns the number of milliseconds between this date and date
 @param {Date} date (optional) Defaults to now
 @return {Number} The diff in milliseconds
 @member Date getElapsed
 */
Ext.applyIf(Date.prototype, {
    getElapsed: function(date) {
        return Math.abs((date || new Date()).getTime()-this.getTime());
    }
});

/**
 * @class Array
 */
Ext.applyIf(Array.prototype, {
    /**
     * Checks whether or not the specified object exists in the array.
     * @param {Object} o The object to check for
     * @param {Number} from (Optional) The index at which to begin the search
     * @return {Number} The index of o in the array (or -1 if it is not found)
     */
    indexOf : function(o, from) {
        var len = this.length;
        from = from || 0;
        from += (from < 0) ? len : 0;
        for (; from < len; ++from){
            if(this[from] === o){
                return from;
            }
        }
        return -1;
    },

    /**
     * Removes the specified object from the array.  If the object is not found nothing happens.
     * @param {Object} o The object to remove
     * @return {Array} this array
     */
    remove : function(o) {
        var index = this.indexOf(o);
        if(index != -1){
            this.splice(index, 1);
        }
        return this;
    },

    contains : function(o){
        return this.indexOf(o) !== -1;
    }
});

/**
 * @class Number
 */
Ext.applyIf(Number.prototype, {
    /**
     * Checks whether or not the current number is within a desired range.  If the number is already within the
     * range it is returned, otherwise the min or max value is returned depending on which side of the range is
     * exceeded.  Note that this method returns the constrained value but does not change the current number.
     * @param {Number} min The minimum number in the range
     * @param {Number} max The maximum number in the range
     * @return {Number} The constrained value if outside the range, otherwise the current value
     */
    constrain : function(min, max) {
        var number = parseInt(this, 10);
        if (typeof min == 'number') {
            number = Math.max(number, min);
        }
        if (typeof max == 'number') {
            number = Math.min(number, max);
        }
        return number;
    }
});

/**
 * @class Ext.Element
 * <p>Encapsulates a DOM element, adding simple DOM manipulation facilities, normalizing for browser differences.</p>
 * <p>All instances of this class inherit the methods of {@link Ext.Fx} making visual effects easily available to all DOM elements.</p>
 * <p>Note that the events documented in this class are not Ext events, they encapsulate browser events. To
 * access the underlying browser event, see {@link Ext.EventObject#browserEvent}. Some older
 * browsers may not support the full range of events. Which events are supported is beyond the control of ExtJs.</p>
 * Usage:<br>
<pre><code>
// by id
var el = Ext.get("my-div");

// by DOM element reference
var el = Ext.get(myDivElement);
</code></pre>
 * <b>Animations</b><br />
 * <p>When an element is manipulated, by default there is no animation.</p>
 * <pre><code>
var el = Ext.get("my-div");

// no animation
el.setWidth(100);
 * </code></pre>
 * <p>Many of the functions for manipulating an element have an optional "animate" parameter.  This
 * parameter can be specified as boolean (<tt>true</tt>) for default animation effects.</p>
 * <pre><code>
// default animation
el.setWidth(100, true);
 * </code></pre>
 *
 * <p>To configure the effects, an object literal with animation options to use as the Element animation
 * configuration object can also be specified. Note that the supported Element animation configuration
 * options are a subset of the {@link Ext.Fx} animation options specific to Fx effects.  The supported
 * Element animation configuration options are:</p>
<pre>
Option    Default   Description
--------- --------  ---------------------------------------------
{@link Ext.Fx#duration duration}  .35       The duration of the animation in seconds
{@link Ext.Fx#easing easing}    easeOut   The easing method
{@link Ext.Fx#callback callback}  none      A function to execute when the anim completes
{@link Ext.Fx#scope scope}     this      The scope (this) of the callback function
</pre>
 *
 * <pre><code>
// Element animation options object
var opt = {
    {@link Ext.Fx#duration duration}: 1,
    {@link Ext.Fx#easing easing}: 'elasticIn',
    {@link Ext.Fx#callback callback}: this.foo,
    {@link Ext.Fx#scope scope}: this
};
// animation with some options set
el.setWidth(100, opt);
 * </code></pre>
 * <p>The Element animation object being used for the animation will be set on the options
 * object as "anim", which allows you to stop or manipulate the animation. Here is an example:</p>
 * <pre><code>
// using the "anim" property to get the Anim object
if(opt.anim.isAnimated()){
    opt.anim.stop();
}
 * </code></pre>
 * <p>Also see the <tt>{@link #animate}</tt> method for another animation technique.</p>
 * <p><b> Composite (Collections of) Elements</b></p>
 * <p>For working with collections of Elements, see {@link Ext.CompositeElement}</p>
 * @constructor Create a new Element directly.
 * @param {String/HTMLElement} element
 * @param {Boolean} forceNew (optional) By default the constructor checks to see if there is already an instance of this element in the cache and if there is it returns the same instance. This will skip that check (useful for extending this class).
 */

(function() {
Ext.Element = Ext.extend(Object, {
    /**
     * The default unit to append to CSS values where a unit isn't provided (defaults to px).
     * @type String
     */
    defaultUnit : "px",

    constructor : function(element, forceNew) {
        var dom = typeof element == 'string'
                ? document.getElementById(element)
                : element,
            id;

        if (!dom) {
            return null;
        }

        id = dom.id;
        if (!forceNew && id && Ext.cache[id]) {
            return Ext.cache[id].el;
        }

        /**
         * The DOM element
         * @type HTMLElement
         */
        this.dom = dom;

        /**
         * The DOM element ID
         * @type String
         */
        this.id = id || Ext.id(dom);
        return this;
    },

    /**
     * Sets the passed attributes as attributes of this element (a style attribute can be a string, object or function)
     * @param {Object} o The object with the attributes
     * @param {Boolean} useSet (optional) false to override the default setAttribute to use expandos.
     * @return {Ext.Element} this
     */
    set : function(o, useSet) {
        var el = this.dom,
            attr,
            value;

        for (attr in o) {
            if (o.hasOwnProperty(attr)) {
                value = o[attr];
                if (attr == 'style') {
                    this.applyStyles(value);
                }
                else if (attr == 'cls') {
                    el.className = value;
                }
                else if (useSet !== false) {
                    el.setAttribute(attr, value);
                }
                else {
                    el[attr] = value;
                }
            }
        }
        return this;
    },

    /**
     * Returns true if this element matches the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String} selector The simple selector to test
     * @return {Boolean} True if this element matches the selector, else false
     */
    is : function(simpleSelector) {
        return Ext.DomQuery.is(this.dom, simpleSelector);
    },

    /**
     * Returns the value of the "value" attribute
     * @param {Boolean} asNumber true to parse the value as a number
     * @return {String/Number}
     */
    getValue : function(asNumber){
        var val = this.dom.value;
        return asNumber ? parseInt(val, 10) : val;
    },

    /**
     * Appends an event handler to this element.  The shorthand version {@link #on} is equivalent.
     * @param {String} eventName The name of event to handle.
     * @param {Function} fn The handler function the event invokes. This function is passed
     * the following parameters:<ul>
     * <li><b>evt</b> : EventObject<div class="sub-desc">The {@link Ext.EventObject EventObject} describing the event.</div></li>
     * <li><b>el</b> : HtmlElement<div class="sub-desc">The DOM element which was the target of the event.
     * Note that this may be filtered by using the <tt>delegate</tt> option.</div></li>
     * <li><b>o</b> : Object<div class="sub-desc">The options object from the addListener call.</div></li>
     * </ul>
     * @param {Object} scope (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to this Element.</b>.
     * @param {Object} options (optional) An object containing handler configuration properties.
     * This may contain any of the following properties:<ul>
     * <li><b>scope</b> Object : <div class="sub-desc">The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to this Element.</b></div></li>
     * <li><b>delegate</b> String: <div class="sub-desc">A simple selector to filter the target or look for a descendant of the target. See below for additional details.</div></li>
     * <li><b>stopEvent</b> Boolean: <div class="sub-desc">True to stop the event. That is stop propagation, and prevent the default action.</div></li>
     * <li><b>preventDefault</b> Boolean: <div class="sub-desc">True to prevent the default action</div></li>
     * <li><b>stopPropagation</b> Boolean: <div class="sub-desc">True to prevent event propagation</div></li>
     * <li><b>normalized</b> Boolean: <div class="sub-desc">False to pass a browser event to the handler function instead of an Ext.EventObject</div></li>
     * <li><b>target</b> Ext.Element: <div class="sub-desc">Only call the handler if the event was fired on the target Element, <i>not</i> if the event was bubbled up from a child node.</div></li>
     * <li><b>delay</b> Number: <div class="sub-desc">The number of milliseconds to delay the invocation of the handler after the event fires.</div></li>
     * <li><b>single</b> Boolean: <div class="sub-desc">True to add a handler to handle just the next firing of the event, and then remove itself.</div></li>
     * <li><b>buffer</b> Number: <div class="sub-desc">Causes the handler to be scheduled to run in an {@link Ext.util.DelayedTask} delayed
     * by the specified number of milliseconds. If the event fires again within that time, the original
     * handler is <em>not</em> invoked, but the new handler is scheduled in its place.</div></li>
     * </ul><br>
     * <p>
     * <b>Combining Options</b><br>
     * In the following examples, the shorthand form {@link #on} is used rather than the more verbose
     * addListener.  The two are equivalent.  Using the options argument, it is possible to combine different
     * types of listeners:<br>
     * <br>
     * A delayed, one-time listener that auto stops the event and adds a custom argument (forumId) to the
     * options object. The options object is available as the third parameter in the handler function.<div style="margin: 5px 20px 20px;">
     * Code:<pre><code>
el.on('tap', this.onTap, this, {
    single: true,
    delay: 100,
    stopEvent : true
});</code></pre></p>
     * <p>
     * <b>Attaching multiple handlers in 1 call</b><br>
     * The method also allows for a single argument to be passed which is a config object containing properties
     * which specify multiple handlers.</p>
     * <p>
     * Code:<pre><code>
el.on({
    'tap' : {
        fn: this.onTap,
        scope: this
    },
    'doubletap' : {
        fn: this.onDoubleTap,
        scope: this
    },
    'swipe' : {
        fn: this.onSwipe,
        scope: this
    }
});</code></pre>
     * <p>
     * Or a shorthand syntax:<br>
     * Code:<pre><code></p>
el.on({
    'tap' : this.onTap,
    'doubletap' : this.onDoubleTap,
    'swipe' : this.onSwipe,
    scope: this
});
     * </code></pre></p>
     * <p><b>delegate</b></p>
     * <p>This is a configuration option that you can pass along when registering a handler for
     * an event to assist with event delegation. Event delegation is a technique that is used to
     * reduce memory consumption and prevent exposure to memory-leaks. By registering an event
     * for a container element as opposed to each element within a container. By setting this
     * configuration option to a simple selector, the target element will be filtered to look for
     * a descendant of the target.
     * For example:<pre><code>
// using this markup:
&lt;div id='elId'>
    &lt;p id='p1'>paragraph one&lt;/p>
    &lt;p id='p2' class='clickable'>paragraph two&lt;/p>
    &lt;p id='p3'>paragraph three&lt;/p>
&lt;/div>
// utilize event delegation to registering just one handler on the container element:
el = Ext.get('elId');
el.on(
    'tap',
    function(e,t) {
        // handle click
        console.info(t.id); // 'p2'
    },
    this,
    {
        // filter the target element to be a descendant with the class 'tappable'
        delegate: '.tappable'
    }
);
     * </code></pre></p>
     * @return {Ext.Element} this
     */
    addListener : function(eventName, fn, scope, options){
        Ext.EventManager.on(this.dom,  eventName, fn, scope || this, options);
        return this;
    },

    /**
     * Removes an event handler from this element.  The shorthand version {@link #un} is equivalent.
     * <b>Note</b>: if a <i>scope</i> was explicitly specified when {@link #addListener adding} the
     * listener, the same scope must be specified here.
     * Example:
     * <pre><code>
el.removeListener('tap', this.handlerFn);
// or
el.un('tap', this.handlerFn);
</code></pre>
     * @param {String} eventName The name of the event from which to remove the handler.
     * @param {Function} fn The handler function to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
     * @param {Object} scope If a scope (<b><code>this</code></b> reference) was specified when the listener was added,
     * then this must refer to the same object.
     * @return {Ext.Element} this
     */
    removeListener : function(eventName, fn, scope) {
        Ext.EventManager.un(this.dom, eventName, fn, scope);
        return this;
    },

    /**
     * Removes all previous added listeners from this element
     * @return {Ext.Element} this
     */
    removeAllListeners : function(){
        Ext.EventManager.removeAll(this.dom);
        return this;
    },

    /**
     * Recursively removes all previous added listeners from this element and its children
     * @return {Ext.Element} this
     */
    purgeAllListeners : function() {
        Ext.EventManager.purgeElement(this, true);
        return this;
    },

    /**
     * <p>Removes this element's dom reference.  Note that event and cache removal is handled at {@link Ext#removeNode}</p>
     */
    remove : function() {
        var me = this,
            dom = me.dom;

        if (dom) {
            delete me.dom;
            Ext.removeNode(dom);
        }
    },

    isAncestor : function(c) {
        var p = this.dom;
        c = Ext.getDom(c);
        if (p && c) {
            return p.contains(c);
        }
        return false;
    },

    /**
     * Determines if this element is a descendent of the passed in Element.
     * @param {Mixed} element An Ext.Element, HTMLElement or string linking to an id of an Element.
     * @returns {Boolean}
     */
    isDescendent : function(p) {
        return Ext.fly(p).isAncestorOf(this);
    },

    /**
     * Returns true if this element is an ancestor of the passed element
     * @param {HTMLElement/String} el The element to check
     * @return {Boolean} True if this element is an ancestor of el, else false
     */
    contains : function(el) {
        return !el ? false : this.isAncestor(el);
    },

    /**
     * Returns the value of an attribute from the element's underlying DOM node.
     * @param {String} name The attribute name
     * @param {String} namespace (optional) The namespace in which to look for the attribute
     * @return {String} The attribute value
     */
    getAttribute : function(name, ns) {
        var d = this.dom;
        return d.getAttributeNS(ns, name) || d.getAttribute(ns + ":" + name) || d.getAttribute(name) || d[name];
    },

    /**
    * Set the innerHTML of this element
    * @param {String} html The new HTML
    * @return {Ext.Element} this
     */
    setHTML : function(html) {
        if(this.dom) {
            this.dom.innerHTML = html;
        }
        return this;
    },

    /**
     * Returns the innerHTML of an Element or an empty string if the element's
     * dom no longer exists.
     */
    getHTML : function() {
        return this.dom ? this.dom.innerHTML : '';
    },

    /**
     * Hide this element - Uses display mode to determine whether to use "display" or "visibility". See {@link #setVisible}.
     * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    hide : function() {
        this.setVisible(false);
        return this;
    },

    /**
    * Show this element - Uses display mode to determine whether to use "display" or "visibility". See {@link #setVisible}.
    * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    show : function() {
        this.setVisible(true);
        return this;
    },

    /**
     * Sets the visibility of the element (see details). If the visibilityMode is set to Element.DISPLAY, it will use
     * the display property to hide the element, otherwise it uses visibility. The default is to hide and show using the visibility property.
     * @param {Boolean} visible Whether the element is visible
     * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
     * @return {Ext.Element} this
     */
     setVisible : function(visible, animate) {
        var me = this,
            dom = me.dom,
            mode = this.getVisibilityMode();

        switch (mode) {
            case Ext.Element.VISIBILITY:
                this.removeClass(['x-hidden-display', 'x-hidden-offsets']);
                this[visible ? 'removeClass' : 'addClass']('x-hidden-visibility');
            break;

            case Ext.Element.DISPLAY:
                this.removeClass(['x-hidden-visibility', 'x-hidden-offsets']);
                this[visible ? 'removeClass' : 'addClass']('x-hidden-display');
            break;

            case Ext.Element.OFFSETS:
                this.removeClass(['x-hidden-visibility', 'x-hidden-display']);
                this[visible ? 'removeClass' : 'addClass']('x-hidden-offsets');
            break;
        }

        return me;
    },

    getVisibilityMode: function() {
        var dom = this.dom,
            mode = Ext.Element.data(dom, 'visibilityMode');

        if (mode === undefined) {
            Ext.Element.data(dom, 'visibilityMode', mode = Ext.Element.DISPLAY);
        }

        return mode;
    },

    setDisplayMode : function(mode) {
        Ext.Element.data(this.dom, 'visibilityMode', mode);
        return this;
    }
});

var El = Ext.Element;

/**
 * Visibility mode constant for use with {@link #setVisibilityMode}. Use visibility to hide element
 * @static
 * @type Number
 */
El.VISIBILITY = 1;
/**
 * Visibility mode constant for use with {@link #setVisibilityMode}. Use display to hide element
 * @static
 * @type Number
 */
El.DISPLAY = 2;
/**
 * Visibility mode constant for use with {@link #setVisibilityMode}. Use offsets to hide element
 * @static
 * @type Number
 */
El.OFFSETS = 3;


El.addMethods = function(o){
   Ext.apply(El.prototype, o);
};


El.prototype.on = El.prototype.addListener;
El.prototype.un = El.prototype.removeListener;

// Alias for people used to Ext JS and Ext Core
El.prototype.update = El.prototype.setHTML;

/**
 * Retrieves Ext.Element objects.
 * <p><b>This method does not retrieve {@link Ext.Component Component}s.</b> This method
 * retrieves Ext.Element objects which encapsulate DOM elements. To retrieve a Component by
 * its ID, use {@link Ext.ComponentMgr#get}.</p>
 * <p>Uses simple caching to consistently return the same object. Automatically fixes if an
 * object was recreated with the same id via AJAX or DOM.</p>
 * @param {Mixed} el The id of the node, a DOM Node or an existing Element.
 * @return {Element} The Element object (or null if no matching element was found)
 * @static
 * @member Ext.Element
 * @method get
 */
El.get = function(el){
    var extEl,
        dom,
        id;

    if(!el){
        return null;
    }

    if (typeof el == "string") { // element id
        if (!(dom = document.getElementById(el))) {
            return null;
        }
        if (Ext.cache[el] && Ext.cache[el].el) {
            extEl = Ext.cache[el].el;
            extEl.dom = dom;
        } else {
            extEl = El.addToCache(new El(dom));
        }
        return extEl;
    } else if (el.tagName) { // dom element
        if(!(id = el.id)){
            id = Ext.id(el);
        }
        if (Ext.cache[id] && Ext.cache[id].el) {
            extEl = Ext.cache[id].el;
            extEl.dom = el;
        } else {
            extEl = El.addToCache(new El(el));
        }
        return extEl;
    } else if (el instanceof El) {
        if(el != El.docEl){
            // refresh dom element in case no longer valid,
            // catch case where it hasn't been appended
            el.dom = document.getElementById(el.id) || el.dom;
        }
        return el;
    } else if(el.isComposite) {
        return el;
    } else if(Ext.isArray(el)) {
        return El.select(el);
    } else if(el == document) {
        // create a bogus element object representing the document object
        if(!El.docEl){
            var F = function(){};
            F.prototype = El.prototype;
            El.docEl = new F();
            El.docEl.dom = document;
        }
        return El.docEl;
    }
    return null;
};

// private
El.addToCache = function(el, id){
    id = id || el.id;
    Ext.cache[id] = {
        el:  el,
        data: {},
        events: {}
    };
    return el;
};

// private method for getting and setting element data
El.data = function(el, key, value) {
    el = El.get(el);
    if (!el) {
        return null;
    }
    var c = Ext.cache[el.id].data;
    if(arguments.length == 2) {
        return c[key];
    }
    else {
        return (c[key] = value);
    }
};

// private
// Garbage collection - uncache elements/purge listeners on orphaned elements
// so we don't hold a reference and cause the browser to retain them
El.garbageCollect = function(){
    if(!Ext.enableGarbageCollector){
        clearInterval(El.collectorThreadId);
    } else {
        var id,
            el,
            dom,
            o;

        for(id in Ext.cache){
            o = Ext.cache[id];
            if(o.skipGarbageCollection){
                continue;
            }
            el = o.el;
            dom = el.dom;
            if(!dom || !dom.parentNode || (!dom.offsetParent && !document.getElementById(id))){
                if(Ext.enableListenerCollection){
                    Ext.EventManager.removeAll(dom);
                }
                delete Ext.cache[eid];
            }
        }
    }
};
//El.collectorThreadId = setInterval(El.garbageCollect, 20000);

// dom is optional
El.Flyweight = function(dom) {
    this.dom = dom;
};

var F = function(){};
F.prototype = El.prototype;

El.Flyweight.prototype = new F;
El.Flyweight.prototype.isFlyweight = true;

El._flyweights = {};

/**
 * <p>Gets the globally shared flyweight Element, with the passed node as the active element. Do not store a reference to this element -
 * the dom node can be overwritten by other code. Shorthand of {@link Ext.Element#fly}</p>
 * <p>Use this to make one-time references to DOM elements which are not going to be accessed again either by
 * application code, or by Ext's classes. If accessing an element which will be processed regularly, then {@link Ext#get}
 * will be more appropriate to take advantage of the caching provided by the Ext.Element class.</p>
 * @param {String/HTMLElement} el The dom node or id
 * @param {String} named (optional) Allows for creation of named reusable flyweights to prevent conflicts
 * (e.g. internally Ext uses "_global")
 * @return {Element} The shared Element object (or null if no matching element was found)
 * @member Ext.Element
 * @method fly
 */
El.fly = function(el, named) {
    var ret = null;
    named = named || '_global';

    el = Ext.getDom(el);
    if (el) {
        (El._flyweights[named] = El._flyweights[named] || new El.Flyweight()).dom = el;
        ret = El._flyweights[named];
    }

    return ret;
};

/**
 * Retrieves Ext.Element objects.
 * <p><b>This method does not retrieve {@link Ext.Component Component}s.</b> This method
 * retrieves Ext.Element objects which encapsulate DOM elements. To retrieve a Component by
 * its ID, use {@link Ext.ComponentMgr#get}.</p>
 * <p>Uses simple caching to consistently return the same object. Automatically fixes if an
 * object was recreated with the same id via AJAX or DOM.</p>
 * Shorthand of {@link Ext.Element#get}
 * @param {Mixed} el The id of the node, a DOM Node or an existing Element.
 * @return {Element} The Element object (or null if no matching element was found)
 * @member Ext
 * @method get
 */
Ext.get = El.get;

/**
 * <p>Gets the globally shared flyweight Element, with the passed node as the active element. Do not store a reference to this element -
 * the dom node can be overwritten by other code. Shorthand of {@link Ext.Element#fly}</p>
 * <p>Use this to make one-time references to DOM elements which are not going to be accessed again either by
 * application code, or by Ext's classes. If accessing an element which will be processed regularly, then {@link Ext#get}
 * will be more appropriate to take advantage of the caching provided by the Ext.Element class.</p>
 * @param {String/HTMLElement} el The dom node or id
 * @param {String} named (optional) Allows for creation of named reusable flyweights to prevent conflicts
 * (e.g. internally Ext uses "_global")
 * @return {Element} The shared Element object (or null if no matching element was found)
 * @member Ext
 * @method fly
 */
Ext.fly = El.fly;

/*Ext.EventManager.on(window, 'unload', function(){
    delete Ext.cache;
    delete El._flyweights;
});*/

})();

Ext.applyIf(Ext.Element, {
    unitRe: /\d+(px|em|%|en|ex|pt|in|cm|mm|pc)$/i,
    camelRe: /(-[a-z])/gi,
    opacityRe: /alpha\(opacity=(.*)\)/i,
    propertyCache: {},
    borders: {l: 'border-left-width', r: 'border-right-width', t: 'border-top-width', b: 'border-bottom-width'},
    paddings: {l: 'padding-left', r: 'padding-right', t: 'padding-top', b: 'padding-bottom'},
    margins: {l: 'margin-left', r: 'margin-right', t: 'margin-top', b: 'margin-bottom'},

    addUnits : function(size) {
        if (size === "" || size == "auto" || size === undefined) {
            size = size || '';
        }
        else if (!isNaN(size) || !this.unitRe.test(size)) {
            size = size + (this.defaultUnit || 'px');
        }
        return size;
    },

    /**
     * Parses a number or string representing margin sizes into an object. Supports CSS-style margin declarations
     * (e.g. 10, "10", "10 10", "10 10 10" and "10 10 10 10" are all valid options and would return the same result)
     * @param {Number|String} v The encoded margins
     * @return {Object} An object with margin sizes for top, right, bottom and left
     */
    parseBox : function(box) {
        if (typeof box != 'string') {
            box = box.toString();
        }
        var parts  = box.split(' '),
            ln = parts.length;

        if (ln == 1) {
            parts[1] = parts[2] = parts[3] = parts[0];
        }
        else if (ln == 2) {
            parts[2] = parts[0];
            parts[3] = parts[1];
        }
        else if (ln == 3) {
            parts[3] = parts[1];
        }

        return {
            top   :parseInt(parts[0], 10) || 0,
            right :parseInt(parts[1], 10) || 0,
            bottom:parseInt(parts[2], 10) || 0,
            left  :parseInt(parts[3], 10) || 0
        };
    },

    // private
    camelReplaceFn : function(m, a) {
        return a.charAt(1).toUpperCase();
    },

    /**
     * Normalizes CSS property keys from dash delimited to camel case JavaScript Syntax.
     * For example:
     * <ul>
     *  <li>border-width -> borderWidth</li>
     *  <li>padding-top -> paddingTop</li>
     * </ul>
     */
    normalize : function(prop) {
        return this.propertyCache[prop] || (this.propertyCache[prop] = prop == 'float' ? 'cssFloat' : prop.replace(this.camelRe, this.camelReplaceFn));
    },

    /**
     * Retrieves the document height
     * @returns {Number} documentHeight
     */
    getDocumentHeight: function() {
        return Math.max(!Ext.isStrict ? document.body.scrollHeight : document.documentElement.scrollHeight, this.getViewportHeight());
    },

    /**
     * Retrieves the document width
     * @returns {Number} documentWidth
     */
    getDocumentWidth: function() {
        return Math.max(!Ext.isStrict ? document.body.scrollWidth : document.documentElement.scrollWidth, this.getViewportWidth());
    },

    /**
     * Retrieves the viewport height of the window.
     * @returns {Number} viewportHeight
     */
    getViewportHeight: function(){
        return window.innerHeight;
    },

    /**
     * Retrieves the viewport width of the window.
     * @returns {Number} viewportWidth
     */
    getViewportWidth : function() {
        return window.innerWidth;
    },

    /**
     * Retrieves the viewport size of the window.
     * @returns {Object} object containing width and height properties
     */
    getViewSize : function() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    },

    /**
     * Retrieves the current orientation of the window. This is calculated by
     * determing if the height is greater than the width.
     * @returns {String} Orientation of window: 'portrait' or 'landscape'
     */
    getOrientation : function() {
        return (window.innerHeight > window.innerWidth) ? 'portrait' : 'landscape';
    },

    /** Returns the top Element that is located at the passed coordinates
     * Function description
     * @param {Number} x The x coordinate
     * @param {Number} x The y coordinate
     * @return {String} The found Element
     */
    fromPoint: function(x, y) {
        return Ext.get(document.elementFromPoint(x, y));
    }
});

/**
 * @class Ext.Element
 */
Ext.Element.addMethods({
    /**
      * Gets the current Y position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
      * @return {Number} The Y position of the element
      */
    getY : function(el) {
        return this.getXY(el)[1];
    },

    /**
      * Gets the current X position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
      * @return {Number} The X position of the element
      */
    getX : function(el) {
        return this.getXY(el)[0];
    },

    /**
      * Gets the current position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
      * @return {Array} The XY position of the element
      */
    getXY : (function() {
        // if(Ext.platform.hasGetBoundingClientRect) {
        //     return function() {
        //         var dom = this.dom,
        //             box, scroll;
        //
        //         if (!dom || !dom.ownerDocument || dom.ownerDocument.body === dom) {
        //             return [0, 0];
        //         }
        //
        //         box = dom.getBoundingClientRect();
        //         scroll = Ext.fly(document).getScroll();
        //         return [Math.round(box.left + scroll.left), Math.round(box.top + scroll.top)];
        //     };
        // }
        // else {
            return function() {
                var body = document.body || document.documentElement,
                    dom = parent = this.dom,
                    x = y = 0;

                if (!dom || dom === body) {
                    return [0, 0];
                }

                while (parent) {
                    x += parent.offsetLeft;
                    y += parent.offsetTop;

                    if(parent != dom) {
                        // For webkit, we need to add parent's clientLeft/Top as well.
                        x += parent.clientLeft || 0;
                        y += parent.clientTop || 0;
                    }

                    parent = parent.offsetParent;
                }

                // Safari absolute incorrectly account for body offsetTop.
                if (Ext.platform.isWebkit && this.isStyle('position', 'absolute')) {
                    y -= body.offsetTop;
                }

                parent = dom.parentNode;
                while (parent && parent != body) {
                    x -= parent.scrollLeft;
                    y -= parent.scrollTop;
                    parent = parent.parentNode;
                }

                return [x, y];
            };
        // }
    })(),

    /**
      * Returns the offsets of this element from the passed element. Both element must be part of the DOM tree and not have display:none to have page coordinates.
      * @param {Mixed} element The element to get the offsets from.
      * @return {Array} The XY page offsets (e.g. [100, -200])
      */
    getOffsetsTo : function(el){
        var o = this.getXY(),
            e = Ext.fly(el, '_internal').getXY();
        return [o[0]-e[0],o[1]-e[1]];
    },

    /**
     * Sets the position of the element in page coordinates, regardless of how the element is positioned.
     * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @param {Array} pos Contains X & Y [x, y] values for new position (coordinates are page-based)
     * @return {Ext.Element} this
     */
    setXY : function(pos) {
        var me = this;

        if(arguments.length > 1) {
            pos = [pos, arguments[1]];
        }

        // me.position();
        var pts = me.translatePoints(pos),
            style = me.dom.style;

        for (pos in pts) {
            if(!isNaN(pts[pos])) style[pos] = pts[pos] + "px";
        }
        return me;
    },

    /**
     * Sets the X position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @param {Number} The X position of the element
     * @return {Ext.Element} this
     */
    setX : function(x){
        return this.setXY([x, this.getY()]);
    },

    /**
     * Sets the Y position of the element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     * @param {Number} The Y position of the element
     * @param {Boolean/Object} animate (optional) True for the default animation, or a standard Element animation config object
     * @return {Ext.Element} this
     */
    setY : function(y) {
        return this.setXY([this.getX(), y]);
    },

    /**
     * Sets the element's left position directly using CSS style (instead of {@link #setX}).
     * @param {String} left The left CSS property value
     * @return {Ext.Element} this
     */
    setLeft : function(left) {
        this.setStyle('left', Ext.Element.addUnits(left));
        return this;
    },

    /**
     * Sets the element's top position directly using CSS style (instead of {@link #setY}).
     * @param {String} top The top CSS property value
     * @return {Ext.Element} this
     */
    setTop : function(top) {
        this.setStyle('top', Ext.Element.addUnits(top));
        return this;
    },

    /**
     * Sets the element's top and left positions directly using CSS style (instead of {@link #setXY})
     * @param {String} top The top CSS property value
     * @param {String} left The left CSS property value
     */
    setTopLeft: function(top, left) {
        var addUnits = Ext.Element.addUnits;

        this.setStyle('top', addUnits(top));
        this.setStyle('left', addUnits(left));

        return this;
    },

    /**
     * Sets the element's CSS right style.
     * @param {String} right The right CSS property value
     * @return {Ext.Element} this
     */
    setRight : function(right) {
        this.setStyle('right', Ext.Element.addUnits(right));
        return this;
    },

    /**
     * Sets the element's CSS bottom style.
     * @param {String} bottom The bottom CSS property value
     * @return {Ext.Element} this
     */
    setBottom : function(bottom) {
        this.setStyle('bottom', Ext.Element.addUnits(bottom));
        return this;
    },

    /**
     * Gets the left X coordinate
     * @param {Boolean} local True to get the local css position instead of page coordinate
     * @return {Number}
     */
    getLeft : function(local) {
        return parseInt(this.getStyle('left'), 10) || 0;
    },

    /**
     * Gets the right X coordinate of the element (element X position + element width)
     * @param {Boolean} local True to get the local css position instead of page coordinate
     * @return {Number}
     */
    getRight : function(local) {
        return parseInt(this.getStyle('right'), 10) || 0;
    },

    /**
     * Gets the top Y coordinate
     * @param {Boolean} local True to get the local css position instead of page coordinate
     * @return {Number}
     */
    getTop : function(local) {
        return parseInt(this.getStyle('top'), 10) || 0;
    },

    /**
     * Gets the bottom Y coordinate of the element (element Y position + element height)
     * @param {Boolean} local True to get the local css position instead of page coordinate
     * @return {Number}
     */
    getBottom : function(local) {
        return parseInt(this.getStyle('bottom'), 10) || 0;
    },

    /**
     * Sets the element's box. Use getBox() on another element to get a box obj. If animate is true then width, height, x and y will be animated concurrently.
     * @param {Object} box The box to fill {x, y, width, height}
     * @return {Ext.Element} this
     */
    setBox : function(left, top, width, height) {
        var undefined;
        if (Ext.isObject(left)) {
            width = left.width;
            height = left.height;
            top = left.top;
            left = left.left;
        }
        if (left !== undefined || top !== undefined || width !== undefined || height !== undefined) {
            if (left !== undefined) {
                this.setLeft(left);
            }
            if (top !== undefined) {
                this.setTop(top);
            }
            if (width !== undefined) {
                this.setWidth(width);
            }
            if (height !== undefined) {
                this.setHeight(height);
            }
        }
        return this;
    },

    /**
     * Return an object defining the area of this Element which can be passed to {@link #setBox} to
     * set another Element's size/location to match this element.
     * @param {Boolean} contentBox (optional) If true a box for the content of the element is returned.
     * @param {Boolean} local (optional) If true the element's left and top are returned instead of page x/y.
     * @return {Object} box An object in the format<pre><code>
{
    x: &lt;Element's X position>,
    y: &lt;Element's Y position>,
    width: &lt;Element's width>,
    height: &lt;Element's height>,
    bottom: &lt;Element's lower bound>,
    right: &lt;Element's rightmost bound>
}
</code></pre>
     * The returned object may also be addressed as an Array where index 0 contains the X position
     * and index 1 contains the Y position. So the result may also be used for {@link #setXY}
     */
    getBox : function(contentBox, local) {
        var me = this,
            dom = me.dom,
            width = dom.offsetWidth,
            height = dom.offsetHeight,
            xy, box, l, r, t, b;

        if (!local) {
            xy = me.getXY();
        }
        else if (contentBox) {
            xy = [0,0];
        }
        else {
            xy = [parseInt(me.getStyle("left"), 10) || 0, parseInt(me.getStyle("top"), 10) || 0];
        }

        if (!contentBox) {
            box = {
                x: xy[0],
                y: xy[1],
                0: xy[0],
                1: xy[1],
                width: width,
                height: height
            };
        }
        else {
            l = me.getBorderWidth.call(me, "l") + me.getPadding.call(me, "l");
            r = me.getBorderWidth.call(me, "r") + me.getPadding.call(me, "r");
            t = me.getBorderWidth.call(me, "t") + me.getPadding.call(me, "t");
            b = me.getBorderWidth.call(me, "b") + me.getPadding.call(me, "b");
            box = {
                x: xy[0] + l,
                y: xy[1] + t,
                0: xy[0] + l,
                1: xy[1] + t,
                width: width - (l + r),
                height: height - (t + b)
            };
        }

        box.left = box.x;
        box.top = box.y;
        box.right = box.x + box.width;
        box.bottom = box.y + box.height;

        return box;
    },

    /**
     * Return an object defining the area of this Element which can be passed to {@link #setBox} to
     * set another Element's size/location to match this element.
     * @param {Boolean} asRegion(optional) If true an Ext.util.Region will be returned
     * @return {Object} box An object in the format<pre><code>
{
    x: &lt;Element's X position>,
    y: &lt;Element's Y position>,
    width: &lt;Element's width>,
    height: &lt;Element's height>,
    bottom: &lt;Element's lower bound>,
    right: &lt;Element's rightmost bound>
}
</code></pre>
     * The returned object may also be addressed as an Array where index 0 contains the X position
     * and index 1 contains the Y position. So the result may also be used for {@link #setXY}
     */
    getPageBox : function(getRegion) {
        var me = this,
            el = me.dom,
            w = el.offsetWidth,
            h = el.offsetHeight,
            xy = me.getXY(),
            t = xy[1],
            r = xy[0] + w,
            b = xy[1] + h,
            l = xy[0];

        if (getRegion) {
            return new Ext.util.Region(t, r, b, l);
        }
        else {
            return {
                left: l,
                top: t,
                width: w,
                height: h,
                right: r,
                bottom: b
            };
        }
    },

    /**
     * Translates the passed page coordinates into left/top css values for this element
     * @param {Number/Array} x The page x or an array containing [x, y]
     * @param {Number} y (optional) The page y, required if x is not an array
     * @return {Object} An object with left and top properties. e.g. {left: (value), top: (value)}
     */
    translatePoints : function(x, y) {
        y = isNaN(x[1]) ? y : x[1];
        x = isNaN(x[0]) ? x : x[0];
        var me = this,
            relative = me.isStyle('position', 'relative'),
            o = me.getXY(),
            l = parseInt(me.getStyle('left'), 10),
            t = parseInt(me.getStyle('top'), 10);

        l = !isNaN(l) ? l : (relative ? 0 : me.dom.offsetLeft);
        t = !isNaN(t) ? t : (relative ? 0 : me.dom.offsetTop);

        return {left: (x - o[0] + l), top: (y - o[1] + t)};
    }
});

/**
 * @class Ext.Element
 */
Ext.Element.classReCache = {};

Ext.Element.addMethods({
    marginRightRe: /marginRight/i,
    trimRe: /^\s+|\s+$/g,
    spacesRe: /\s+/,

    /**
     * Adds one or more CSS classes to the element. Duplicate classes are automatically filtered out.
     * @param {String/Array} className The CSS class to add, or an array of classes
     * @return {Ext.Element} this
     */
    addClass: function(className) {
        var me = this,
            i,
            len,
            v,
            cls = [];

        if (!Ext.isArray(className)) {
            if (className && !this.hasClass(className)) {
                me.dom.className += " " + className;
            }
        }
        else {
            for (i = 0, len = className.length; i < len; i++) {
                v = className[i];
                if (v && !me.hasClass(v)) {
                    cls.push(v);
                }
            }
            if (cls.length) {
                me.dom.className += " " + cls.join(" ");
            }
        }
        return me;
    },

    /**
     * Removes one or more CSS classes from the element.
     * @param {String/Array} className The CSS class to remove, or an array of classes
     * @return {Ext.Element} this
     */
    removeClass: function(className) {
        var me = this,
            i,
            idx,
            len,
            cls,
            elClasses;
        if (!Ext.isArray(className)) {
            className = [className];
        }
        if (me.dom && me.dom.className) {
            elClasses = me.dom.className.replace(this.trimRe, '').split(this.spacesRe);
            for (i = 0, len = className.length; i < len; i++) {
                cls = className[i];
                if (typeof cls == 'string') {
                    cls = cls.replace(this.trimRe, '');
                    idx = elClasses.indexOf(cls);
                    if (idx != -1) {
                        elClasses.splice(idx, 1);
                    }
                }
            }
            me.dom.className = elClasses.join(" ");
        }
        return me;
    },

    /**
     * Masks the element.
     */
    mask: function(transparent, html) {
        var me = this,
            dom = me.dom,
            el = Ext.Element.data(dom, 'mask'),
            mask;

        me.addClass('x-masked');
        if (me.getStyle("position") == "static") {
            me.addClass('x-masked-relative');
        }
        if (el) {
            el.remove();
        }
        mask = me.createChild({
            cls: 'x-mask' + (transparent ? ' x-mask-transparent': ''),
            html: html || ''
        });
        Ext.Element.data(dom, 'mask', mask);
    },

    /**
     * Removes a previously applied mask.
     */
    unmask: function() {
        var me = this,
            dom = me.dom,
        mask = Ext.Element.data(dom, 'mask');

        if (mask) {
            mask.remove();
            Ext.Element.data(dom, 'mask', undefined);
        }
        me.removeClass(['x-masked', 'x-masked-relative']);
    },

    /**
     * Adds one or more CSS classes to this element and removes the same class(es) from all siblings.
     * @param {String/Array} className The CSS class to add, or an array of classes
     * @return {Ext.Element} this
     */
    radioClass: function(className) {
        var cn = this.dom.parentNode.childNodes,
            v;
        className = Ext.isArray(className) ? className: [className];
        for (var i = 0, len = cn.length; i < len; i++) {
            v = cn[i];
            if (v && v.nodeType == 1) {
                Ext.fly(v, '_internal').removeClass(className);
            }
        };
        return this.addClass(className);
    },

    /**
     * Toggles the specified CSS class on this element (removes it if it already exists, otherwise adds it).
     * @param {String} className The CSS class to toggle
     * @return {Ext.Element} this
     */
    toggleClass: function(className) {
        return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
    },

    /**
     * Checks if the specified CSS class exists on this element's DOM node.
     * @param {String} className The CSS class to check for
     * @return {Boolean} True if the class exists, else false
     */
    hasClass: function(className) {
        return className && (' ' + this.dom.className + ' ').indexOf(' ' + className + ' ') != -1;
    },

    /**
     * Replaces a CSS class on the element with another.  If the old name does not exist, the new name will simply be added.
     * @param {String} oldClassName The CSS class to replace
     * @param {String} newClassName The replacement CSS class
     * @return {Ext.Element} this
     */
    replaceClass: function(oldClassName, newClassName) {
        return this.removeClass(oldClassName).addClass(newClassName);
    },

    isStyle: function(style, val) {
        return this.getStyle(style) == val;
    },

    /**
     * Normalizes currentStyle and computedStyle.
     * @param {String} property The style property whose value is returned.
     * @return {String} The current value of the style property for this element.
     */
    getStyle: function(prop) {
        var dom = this.dom,
            value,
            computedStyle,
            result,
            display;

        if (dom == document) {
            return null;
        }

        prop = Ext.Element.normalize(prop);

        result = (value = dom.style[prop]) ? value : (computedStyle = window.getComputedStyle(dom, null)) ? computedStyle[prop] : null;

        // Fix bug caused by this: https://bugs.webkit.org/show_bug.cgi?id=13343
        if (Ext.platform.hasRightMarginBug && marginRightRe.test(prop) && out != '0px') {
            display = this.getStyle('display');
            el.style.display = 'inline-block';
            result = view.getComputedStyle(el, '');
            el.style.display = display;
        }

        // Webkit returns rgb values for transparent.
        if (result == 'rgba(0, 0, 0, 0)') {
            result = 'transparent';
        }

        return result;
    },

    /**
     * Wrapper for setting style properties, also takes single object parameter of multiple styles.
     * @param {String/Object} property The style property to be set, or an object of multiple styles.
     * @param {String} value (optional) The value to apply to the given property, or null if an object was passed.
     * @return {Ext.Element} this
     */
    setStyle: function(prop, value) {
        var tmp,
            style;

        if (!Ext.isObject(prop)) {
            tmp = {};
            tmp[prop] = value;
            prop = tmp;
        }

        for (style in prop) {
            value = prop[style];
            style = Ext.Element.normalize(style);
            this.dom.style[style] = value;
        }

        return this;
    },

    /**
     * Applies a style specification to an element.
     * @param {String/HTMLElement} el The element to apply styles to
     * @param {String/Object/Function} styles A style specification string e.g. 'width:100px', or object in the form {width:'100px'}, or
     * a function which returns such a specification.
     */
    applyStyles: function(styles) {
        if (styles) {
            var i,
                len;
            if (typeof styles == 'function') {
                styles = styles.call();
            }
            if (typeof styles == 'string') {
                styles = styles.trim().split(/\s*(?::|;)\s*/);
                for (i = 0, len = styles.length; i < len;) {
                    this.setStyle(styles[i++], styles[i++]);
                }
            }
            else if (Ext.isObject(styles)) {
                this.setStyle(styles);
            }
        }
    },

    /**
     * Returns the offset height of the element
     * @param {Boolean} contentHeight (optional) true to get the height minus borders and padding
     * @return {Number} The element's height
     */
    getHeight: function(contentHeight) {
        var dom = this.dom,
            height = contentHeight ? (dom.clientHeight - this.getPadding("tb")) : dom.offsetHeight;
        return height > 0 ? height: 0;
    },

    /**
     * Returns the offset width of the element
     * @param {Boolean} contentWidth (optional) true to get the width minus borders and padding
     * @return {Number} The element's width
     */
    getWidth: function(contentWidth) {
        var dom = this.dom,
            width = contentWidth ? (dom.clientWidth - this.getPadding("lr")) : dom.offsetWidth;
        return width > 0 ? width: 0;
    },

    /**
     * Set the width of this Element.
     * @param {Mixed} width The new width. This may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new width in this Element's {@link #defaultUnit}s (by default, pixels).</li>
     * <li>A String used to set the CSS width style. Animation may <b>not</b> be used.
     * </ul></div>
     * @return {Ext.Element} this
     */
    setWidth: function(width) {
        var me = this;
            me.dom.style.width = Ext.Element.addUnits(width);
        return me;
    },

    /**
     * Set the height of this Element.
     * <pre><code>
    // change the height to 200px and animate with default configuration
    Ext.fly('elementId').setHeight(200, true);

    // change the height to 150px and animate with a custom configuration
    Ext.fly('elId').setHeight(150, {
    duration : .5, // animation will have a duration of .5 seconds
    // will change the content to "finished"
    callback: function(){ this.{@link #update}("finished"); }
    });
     * </code></pre>
     * @param {Mixed} height The new height. This may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new height in this Element's {@link #defaultUnit}s (by default, pixels.)</li>
     * <li>A String used to set the CSS height style. Animation may <b>not</b> be used.</li>
     * </ul></div>
     * @return {Ext.Element} this
     */
    setHeight: function(height) {
        var me = this;
            me.dom.style.height = Ext.Element.addUnits(height);
        return me;
    },

    /**
     * Set the size of this Element. If animation is true, both width and height will be animated concurrently.
     * @param {Mixed} width The new width. This may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new width in this Element's {@link #defaultUnit}s (by default, pixels).</li>
     * <li>A String used to set the CSS width style. Animation may <b>not</b> be used.
     * <li>A size object in the format <code>{width: widthValue, height: heightValue}</code>.</li>
     * </ul></div>
     * @param {Mixed} height The new height. This may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new height in this Element's {@link #defaultUnit}s (by default, pixels).</li>
     * <li>A String used to set the CSS height style. Animation may <b>not</b> be used.</li>
     * </ul></div>
     * @param {Boolean/Object} animate (optional) true for the default animation or a standard Element animation config object
     * @return {Ext.Element} this
     */
    setSize: function(width, height) {
        var me = this;
        if (Ext.isObject(width)) {
            // in case of object from getSize()
            height = width.height;
            width = width.width;
        }
        me.dom.style.width = Ext.Element.addUnits(width);
        me.dom.style.height = Ext.Element.addUnits(height);
        return me;
    },

    /**
     * Gets the width of the border(s) for the specified side(s)
     * @param {String} side Can be t, l, r, b or any combination of those to add multiple values. For example,
     * passing <tt>'lr'</tt> would get the border <b><u>l</u></b>eft width + the border <b><u>r</u></b>ight width.
     * @return {Number} The width of the sides passed added together
     */
    getBorderWidth: function(side) {
        return this.sumStyles(side, Ext.Element.borders);
    },

    /**
     * Gets the size of the padding(s) for the specified side(s)
     * @param {String} side Can be t, l, r, b or any combination of those to add multiple values. For example,
     * passing <tt>'lr'</tt> would get the padding <b><u>l</u></b>eft + the padding <b><u>r</u></b>ight.
     * @return {Number} The padding of the sides passed added together
     */
    getPadding: function(side) {
        return this.sumStyles(side, Ext.Element.paddings);
    },

    /**
     * Gets the size of the margins(s) for the specified side(s)
     * @param {String} side Can be t, l, r, b or any combination of those to add multiple values. For example,
     * passing <tt>'lr'</tt> would get the margin <b><u>l</u></b>eft + the margin <b><u>r</u></b>ight.
     * @return {Number} The margin of the sides passed added together
     */
    getMargin: function(side) {
        return this.sumStyles(side, Ext.Element.margins);
    },

    /**
     * <p>Returns the dimensions of the element available to lay content out in.<p>
     * <p>If the element (or any ancestor element) has CSS style <code>display : none</code>, the dimensions will be zero.</p>
     */
    getViewSize: function() {
        var doc = document,
            dom = this.dom;

        if (dom == doc || dom == doc.body) {
            return {
                width: Ext.Element.getViewportWidth(),
                height: Ext.Element.getViewportHeight()
            };
        }
        else {
            return {
                width: dom.clientWidth,
                height: dom.clientHeight
            };
        }
    },

    /**
     * Returns the size of the element.
     * @param {Boolean} contentSize (optional) true to get the width/size minus borders and padding
     * @return {Object} An object containing the element's size {width: (element width), height: (element height)}
     */
    getSize: function(contentSize) {
        return {
            width: this.getWidth(contentSize),
            height: this.getHeight(contentSize)
        };
    },

    /**
     * Forces the browser to repaint this element
     * @return {Ext.Element} this
     */
    repaint: function() {
        var dom = this.dom;
        this.addClass("x-repaint");
        dom.style.background = 'transparent none';
        setTimeout(function() {
            dom.style.background = null;
            Ext.get(dom).removeClass("x-repaint");
        },
        1);
        return this;
    },

    /**
     * Retrieves the width of the element accounting for the left and right
     * margins.
     */
    getOuterWidth: function() {
        return this.getWidth() + this.getMargin('lr');
    },

    /**
     * Retrieves the height of the element account for the top and bottom
     * margins.
     */
    getOuterHeight: function() {
        return this.getHeight() + this.getMargin('tb');
    },

    // private
    sumStyles: function(sides, styles) {
        var val = 0,
            m = sides.match(/\w/g),
            len = m.length,
            s,
            i;

        for (i = 0; i < len; i++) {
            s = m[i] && parseInt(this.getStyle(styles[m[i]]), 10);
            if (s) {
                val += Math.abs(s);
            }
        }
        return val;
    }
});

/**
 * @class Ext.Element
 */
Ext.Element.addMethods({
    /**
     * Looks at this node and then at parent nodes for a match of the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String} selector The simple selector to test
     * @param {Number/Mixed} maxDepth (optional) The max depth to search as a number or element (defaults to 50 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement} The matching DOM node (or null if no match was found)
     */
    findParent : function(simpleSelector, maxDepth, returnEl) {
        var p = this.dom,
            b = document.body,
            depth = 0,
            stopEl;

        maxDepth = maxDepth || 50;
        if (isNaN(maxDepth)) {
            stopEl = Ext.getDom(maxDepth);
            maxDepth = Number.MAX_VALUE;
        }
        while (p && p.nodeType == 1 && depth < maxDepth && p != b && p != stopEl) {
            if (Ext.DomQuery.is(p, simpleSelector)) {
                return returnEl ? Ext.get(p) : p;
            }
            depth++;
            p = p.parentNode;
        }
        return null;
    },

    /**
     * Looks at parent nodes for a match of the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String} selector The simple selector to test
     * @param {Number/Mixed} maxDepth (optional) The max depth to
            search as a number or element (defaults to 10 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLElement} The matching DOM node (or null if no match was found)
     */
    findParentNode : function(simpleSelector, maxDepth, returnEl) {
        var p = Ext.fly(this.dom.parentNode, '_internal');
        return p ? p.findParent(simpleSelector, maxDepth, returnEl) : null;
    },

    /**
     * Walks up the dom looking for a parent node that matches the passed simple selector (e.g. div.some-class or span:first-child).
     * This is a shortcut for findParentNode() that always returns an Ext.Element.
     * @param {String} selector The simple selector to test
     * @param {Number/Mixed} maxDepth (optional) The max depth to
            search as a number or element (defaults to 10 || document.body)
     * @return {Ext.Element} The matching DOM node (or null if no match was found)
     */
    up : function(simpleSelector, maxDepth) {
        return this.findParentNode(simpleSelector, maxDepth, true);
    },

    /**
     * Creates a {@link Ext.CompositeElement} for child nodes based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @return {CompositeElement/CompositeElement} The composite element
     */
    select : function(selector, composite) {
        return Ext.Element.select(selector, this.dom, composite);
    },

    /**
     * Selects child nodes based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @return {Array} An array of the matched nodes
     */
    query : function(selector) {
        return Ext.DomQuery.select(selector, this.dom);
    },

    /**
     * Selects a single child at any depth below this element based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @param {Boolean} returnDom (optional) True to return the DOM node instead of Ext.Element (defaults to false)
     * @return {HTMLElement/Ext.Element} The child Ext.Element (or DOM node if returnDom = true)
     */
    down : function(selector, returnDom) {
        var n = Ext.DomQuery.selectNode(selector, this.dom);
        return returnDom ? n : Ext.get(n);
    },

    /**
     * Selects a single *direct* child based on the passed CSS selector (the selector should not contain an id).
     * @param {String} selector The CSS selector
     * @param {Boolean} returnDom (optional) True to return the DOM node instead of Ext.Element (defaults to false)
     * @return {HTMLElement/Ext.Element} The child Ext.Element (or DOM node if returnDom = true)
     */
    child : function(selector, returnDom) {
        var node,
            me = this,
            id;
        id = Ext.get(me).id;
        // Escape . or :
        id = id.replace(/[\.:]/g, "\\$0");
        node = Ext.DomQuery.selectNode('#' + id + " > " + selector, me.dom);
        return returnDom ? node : Ext.get(node);
    },

     /**
     * Gets the parent node for this element, optionally chaining up trying to match a selector
     * @param {String} selector (optional) Find a parent node that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The parent node or null
     */
    parent : function(selector, returnDom) {
        return this.matchNode('parentNode', 'parentNode', selector, returnDom);
    },

     /**
     * Gets the next sibling, skipping text nodes
     * @param {String} selector (optional) Find the next sibling that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The next sibling or null
     */
    next : function(selector, returnDom) {
        return this.matchNode('nextSibling', 'nextSibling', selector, returnDom);
    },

    /**
     * Gets the previous sibling, skipping text nodes
     * @param {String} selector (optional) Find the previous sibling that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The previous sibling or null
     */
    prev : function(selector, returnDom) {
        return this.matchNode('previousSibling', 'previousSibling', selector, returnDom);
    },


    /**
     * Gets the first child, skipping text nodes
     * @param {String} selector (optional) Find the next sibling that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The first child or null
     */
    first : function(selector, returnDom) {
        return this.matchNode('nextSibling', 'firstChild', selector, returnDom);
    },

    /**
     * Gets the last child, skipping text nodes
     * @param {String} selector (optional) Find the previous sibling that matches the passed simple selector
     * @param {Boolean} returnDom (optional) True to return a raw dom node instead of an Ext.Element
     * @return {Ext.Element/HTMLElement} The last child or null
     */
    last : function(selector, returnDom) {
        return this.matchNode('previousSibling', 'lastChild', selector, returnDom);
    },

    matchNode : function(dir, start, selector, returnDom) {
        var n = this.dom[start];
        while (n) {
            if (n.nodeType == 1 && (!selector || Ext.DomQuery.is(n, selector))) {
                return !returnDom ? Ext.get(n) : n;
            }
            n = n[dir];
        }
        return null;
    }
});

/**
 * @class Ext.Element
 */
Ext.Element.addMethods({
    /**
     * Appends the passed element(s) to this element
     * @param {String/HTMLElement/Array/Element/CompositeElement} el
     * @return {Ext.Element} this
     */
    appendChild : function(el) {
        return Ext.get(el).appendTo(this);
    },

    /**
     * Appends this element to the passed element
     * @param {Mixed} el The new parent element
     * @return {Ext.Element} this
     */
    appendTo : function(el) {
        Ext.getDom(el).appendChild(this.dom);
        return this;
    },

    /**
     * Inserts this element before the passed element in the DOM
     * @param {Mixed} el The element before which this element will be inserted
     * @return {Ext.Element} this
     */
    insertBefore : function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el);
        return this;
    },

    /**
     * Inserts this element after the passed element in the DOM
     * @param {Mixed} el The element to insert after
     * @return {Ext.Element} this
     */
    insertAfter : function(el) {
        el = Ext.getDom(el);
        el.parentNode.insertBefore(this.dom, el.nextSibling);
        return this;
    },

    /**
     * Inserts (or creates) an element (or DomHelper config) as the first child of this element
     * @param {Mixed/Object} el The id or element to insert or a DomHelper config to create and insert
     * @return {Ext.Element} The new child
     */
    insertFirst : function(el, returnDom) {
        el = el || {};
        if (el.nodeType || el.dom || typeof el == 'string') { // element
            el = Ext.getDom(el);
            this.dom.insertBefore(el, this.dom.firstChild);
            return !returnDom ? Ext.get(el) : el;
        }
        else { // dh config
            return this.createChild(el, this.dom.firstChild, returnDom);
        }
    },

    /**
     * Inserts (or creates) the passed element (or DomHelper config) as a sibling of this element
     * @param {Mixed/Object/Array} el The id, element to insert or a DomHelper config to create and insert *or* an array of any of those.
     * @param {String} where (optional) 'before' or 'after' defaults to before
     * @param {Boolean} returnDom (optional) True to return the raw DOM element instead of Ext.Element
     * @return {Ext.Element} The inserted Element. If an array is passed, the last inserted element is returned.
     */
    insertSibling: function(el, where, returnDom){
        var me = this, rt,
        isAfter = (where || 'before').toLowerCase() == 'after',
        insertEl;

        if(Ext.isArray(el)){
            insertEl = me;
            Ext.each(el, function(e) {
                rt = Ext.fly(insertEl, '_internal').insertSibling(e, where, returnDom);
                if(isAfter){
                    insertEl = rt;
                }
            });
            return rt;
        }

        el = el || {};

        if(el.nodeType || el.dom){
            rt = me.dom.parentNode.insertBefore(Ext.getDom(el), isAfter ? me.dom.nextSibling : me.dom);
            if (!returnDom) {
                rt = Ext.get(rt);
            }
        }else{
            if (isAfter && !me.dom.nextSibling) {
                rt = Ext.DomHelper.append(me.dom.parentNode, el, !returnDom);
            } else {
                rt = Ext.DomHelper[isAfter ? 'insertAfter' : 'insertBefore'](me.dom, el, !returnDom);
            }
        }
        return rt;
    },

    /**
     * Replaces the passed element with this element
     * @param {Mixed} el The element to replace
     * @return {Ext.Element} this
     */
    replace : function(el) {
        el = Ext.get(el);
        this.insertBefore(el);
        el.remove();
        return this;
    },

    /**
     * Creates the passed DomHelper config and appends it to this element or optionally inserts it before the passed child element.
     * @param {Object} config DomHelper element config object.  If no tag is specified (e.g., {tag:'input'}) then a div will be
     * automatically generated with the specified attributes.
     * @param {HTMLElement} insertBefore (optional) a child element of this element
     * @param {Boolean} returnDom (optional) true to return the dom node instead of creating an Element
     * @return {Ext.Element} The new child element
     */
    createChild : function(config, insertBefore, returnDom) {
        config = config || {tag:'div'};
        if (insertBefore) {
            return Ext.DomHelper.insertBefore(insertBefore, config, returnDom !== true);
        }
        else {
            return Ext.DomHelper[!this.dom.firstChild ? 'overwrite' : 'append'](this.dom, config,  returnDom !== true);
        }
    },

    /**
     * Creates and wraps this element with another element
     * @param {Object} config (optional) DomHelper element config object for the wrapper element or null for an empty div
     * @param {Boolean} returnDom (optional) True to return the raw DOM element instead of Ext.Element
     * @return {HTMLElement/Element} The newly created wrapper element
     */
    wrap : function(config, returnDom) {
        var newEl = Ext.DomHelper.insertBefore(this.dom, config || {tag: "div"}, !returnDom);
        newEl.dom ? newEl.dom.appendChild(this.dom) : newEl.appendChild(this.dom);
        return newEl;
    },

    /**
     * Inserts an html fragment into this element
     * @param {String} where Where to insert the html in relation to this element - beforeBegin, afterBegin, beforeEnd, afterEnd.
     * @param {String} html The HTML fragment
     * @param {Boolean} returnEl (optional) True to return an Ext.Element (defaults to false)
     * @return {HTMLElement/Ext.Element} The inserted node (or nearest related if more than 1 inserted)
     */
    insertHtml : function(where, html, returnEl) {
        var el = Ext.DomHelper.insertHtml(where, this.dom, html);
        return returnEl ? Ext.get(el) : el;
    }
});

/**
 * @class Ext.platform
 * @singleton
 *
 * Determines information about the current platform the application is running
 * on.
 */
Ext.platform = {
    /**
     * Returns true if the application is running on a webkit browser.
     * @return Boolean
     */
    isWebkit: /webkit/i.test(Ext.userAgent),

    /**
     * Returns true if the application is running on a phone.
     * @return {Boolean} true if the application is running on a phone.
     */
    isPhone: /android|iphone/i.test(Ext.userAgent) && !(/ipad/i.test(Ext.userAgent)),

    /**
     * Returns true if the application is running on an iPad.
     * @return {Boolean} true if the application is running on an iPad.
     */
    isTablet: /ipad/i.test(Ext.userAgent),

    /**
     * Returns true if the application is running on Chrome.
     * @return {Boolean} true if the application is running on Chrome.
     */
    isChrome: /chrome/i.test(Ext.userAgent),

    /**
     * Returns true if the application is running on the Android OS.
     * @return {Boolean} true if the application is running on a phone.
     */
    isAndroidOS: /android/i.test(Ext.userAgent),

    /**
     * Returns true if the application is running on the iPhone OS.
     * @return {Boolean} true if the application is running on a phone.
     */
    isIPhoneOS: /iphone|ipad/i.test(Ext.userAgent),

    /**
     * Returns true if the browser has the 'orientationchange' event.
     * @return {Boolean} true if the browser has the 'orientationchange' event.
     */
    hasOrientationChange: ('onorientationchange' in window),

    /**
     * Returns true if the browser has the 'ontouchstart' event.
      * @return {Boolean} true if the browser has the 'ontouchstart' event.
     */
    hasTouch: ('ontouchstart' in window)
};
/**
 * @class Ext.util.Observable
 * Base class that provides a common interface for publishing events. Subclasses are expected to
 * to have a property "events" with all the events defined, and, optionally, a property "listeners"
 * with configured listeners defined.<br>
 * For example:
 * <pre><code>
Employee = Ext.extend(Ext.util.Observable, {
    constructor: function(config){
        this.name = config.name;
        this.addEvents({
            "fired" : true,
            "quit" : true
        });

        // Copy configured listeners into *this* object so that the base class&#39;s
        // constructor will add them.
        this.listeners = config.listeners;

        // Call our superclass constructor to complete construction process.
        Employee.superclass.constructor.call(this, config)
    }
});
</code></pre>
 * This could then be used like this:<pre><code>
var newEmployee = new Employee({
    name: employeeName,
    listeners: {
        quit: function() {
            // By default, "this" will be the object that fired the event.
            alert(this.name + " has quit!");
        }
    }
});
</code></pre>
 */

Ext.util.Observable = Ext.extend(Object, {
   /**
    * @cfg {Object} listeners (optional) <p>A config object containing one or more event handlers to be added to this
    * object during initialization.  This should be a valid listeners config object as specified in the
    * {@link #addListener} example for attaching multiple handlers at once.</p>
    * <br><p><b><u>DOM events from ExtJs {@link Ext.Component Components}</u></b></p>
    * <br><p>While <i>some</i> ExtJs Component classes export selected DOM events (e.g. "click", "mouseover" etc), this
    * is usually only done when extra value can be added. For example the {@link Ext.DataView DataView}'s
    * <b><code>{@link Ext.DataView#click click}</code></b> event passing the node clicked on. To access DOM
    * events directly from a Component's HTMLElement, listeners must be added to the <i>{@link Ext.Component#getEl Element}</i> after the Component
    * has been rendered. A plugin can simplify this step:
      <pre><code>
// Plugin is configured with a listeners config object.
// The Component is appended to the argument list of all handler functions.
Ext.DomObserver = Ext.extend(Object, {
    constructor: function(config) {
        this.listeners = config.listeners ? config.listeners : config;
    },

    // Component passes itself into plugin&#39;s init method
    init: function(c) {
        var p, l = this.listeners;
        for (p in l) {
            if (Ext.isFunction(l[p])) {
                l[p] = this.createHandler(l[p], c);
            } else {
                l[p].fn = this.createHandler(l[p].fn, c);
            }
        }

        // Add the listeners to the Element immediately following the render call
        c.render = c.render.{@link Function#createSequence createSequence}(function() {
            var e = c.getEl();
            if (e) {
                e.on(l);
            }
        });
    },

    createHandler: function(fn, c) {
        return function(e) {
            fn.call(this, e, c);
        };
    }
});

var text = new Ext.form.TextField({

    // Collapse combo when its element is clicked on
    plugins: [ new Ext.DomObserver({
        click: function(evt, comp) {
            comp.collapse();
        }
    })]
});
      </code></pre></p>
    */
    // @private
    isObservable: true,

    constructor : function(config) {
        var me = this, e = me.events;

                Ext.apply(me, config);
            if (me.listeners){
                me.on(me.listeners);
                delete me.listeners;
            }
            me.events = e || {};
        },

    // @private
    filterOptRe : /^(?:scope|delay|buffer|single)$/,

    /**
     * <p>Fires the specified event with the passed parameters (minus the event name).</p>
     * <p>An event may be set to bubble up an Observable parent hierarchy (See {@link Ext.Component#getBubbleTarget})
     * by calling {@link #enableBubble}.</p>
     * @param {String} eventName The name of the event to fire.
     * @param {Object...} args Variable number of parameters are passed to handlers.
     * @return {Boolean} returns false if any of the handlers return false otherwise it returns true.
     */
    fireEvent : function() {
        var me = this,
            a = Ext.toArray(arguments),
            ename = a[0].toLowerCase(),
            ret = true,
            ev = me.events[ename],
            queue = me.eventQueue,
            parent;

        if (me.eventsSuspended === true && queue) {
            queue.push(a);
        }
        else if(Ext.isObject(ev) && ev.bubble) {
            if(ev.fire.apply(ev, a.slice(1)) === false) {
                return false;
            }
            parent = me.getBubbleTarget && me.getBubbleTarget();
            if(parent && parent.isObservable) {
                if(!parent.events[ename] || !Ext.isObject(parent.events[ename]) || !parent.events[ename].bubble) {
                    parent.enableBubble(ename);
                }
                return parent.fireEvent.apply(parent, a);
            }
        }
        else {
            if (Ext.isObject(ev)) {
                a.shift();
                ret = ev.fire.apply(ev, a);
            }
        }
        return ret;
    },

    /**
     * Appends an event handler to this object.
     * @param {String}   eventName The name of the event to listen for.
     * @param {Function} handler The method the event invokes.
     * @param {Object}   scope (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b>
     * @param {Object}   options (optional) An object containing handler configuration.
     * properties. This may contain any of the following properties:<ul>
     * <li><b>scope</b> : Object<div class="sub-desc">The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b></div></li>
     * <li><b>delay</b> : Number<div class="sub-desc">The number of milliseconds to delay the invocation of the handler after the event fires.</div></li>
     * <li><b>single</b> : Boolean<div class="sub-desc">True to add a handler to handle just the next firing of the event, and then remove itself.</div></li>
     * <li><b>buffer</b> : Number<div class="sub-desc">Causes the handler to be scheduled to run in an {@link Ext.util.DelayedTask} delayed
     * by the specified number of milliseconds. If the event fires again within that time, the original
     * handler is <em>not</em> invoked, but the new handler is scheduled in its place.</div></li>
     * <li><b>target</b> : Observable<div class="sub-desc">Only call the handler if the event was fired on the target Observable, <i>not</i>
     * if the event was bubbled up from a child Observable.</div></li>
     * </ul><br>
     * <p>
     * <b>Combining Options</b><br>
     * Using the options argument, it is possible to combine different types of listeners:<br>
     * <br>
     * A delayed, one-time listener.
     * <pre><code>
myPanel.on('hide', this.onClick, this, {
single: true,
delay: 100
});</code></pre>
     * <p>
     * <b>Attaching multiple handlers in 1 call</b><br>
     * The method also allows for a single argument to be passed which is a config object containing properties
     * which specify multiple handlers.
     * <p>
     */
    addListener : function(ename, fn, scope, o) {
        var me = this,
            config,
            ev;

        if (Ext.isObject(ename)) {
            o = ename;
            for (ename in o) {
                config = o[ename];
                if (!me.filterOptRe.test(ename)) {
                    me.addListener(ename, config.fn || config, config.scope || o.scope, config.fn ? config : o);
                }
            }
        }
        else {
            ename = ename.toLowerCase();
            me.events[ename] = me.events[ename] || true;
            ev = me.events[ename] || true;
            if (Ext.isBoolean(ev)) {
                me.events[ename] = ev = new Ext.util.Event(me, ename);
            }
            ev.addListener(fn, scope, Ext.isObject(o) ? o : {});
        }
    },

    /**
     * Removes an event handler.
     * @param {String}   eventName The type of event the handler was associated with.
     * @param {Function} handler   The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
     * @param {Object}   scope     (optional) The scope originally specified for the handler.
     */
    removeListener : function(ename, fn, scope) {
        var me = this,
            config,
            ev;

        if (Ext.isObject(ename)) {
            o = ename;
            for (ename in o) {
                config = o[ename];
                if (!me.filterOptRe.test(ename)) {
                    me.removeListener(ename, config.fn || config, config.scope || o.scope);
                }
            }
        }
        else {
            ename = ename.toLowerCase();
            ev = me.events[ename];
            if (ev.isEvent) {
                ev.removeListener(fn, scope);
            }
        }
    },

    /**
     * Removes all listeners for this object
     */
    purgeListeners : function(){
        var events = this.events,
            ev,
            key;

        for(key in events){
            ev = events[key];
            if(ev.isEvent){
                ev.clearListeners();
            }
        }
    },

    /**
     * Adds the specified events to the list of events which this Observable may fire.
     * @param {Object|String} o Either an object with event names as properties with a value of <code>true</code>
     * or the first event name string if multiple event names are being passed as separate parameters.
     * @param {string} Optional. Event name if multiple event names are being passed as separate parameters.
     * Usage:<pre><code>
this.addEvents('storeloaded', 'storecleared');
</code></pre>
     */
    addEvents : function(o){
        var me = this;
        me.events = me.events || {};
        if (Ext.isString(o)) {
            var a = arguments,
                i = a.length;
            while(i--) {
                me.events[a[i]] = me.events[a[i]] || true;
            }
        } else {
            Ext.applyIf(me.events, o);
        }
    },

    /**
     * Checks to see if this object has any listeners for a specified event
     * @param {String} eventName The name of the event to check for
     * @return {Boolean} True if the event is being listened for, else false
     */
    hasListener : function(ename){
        var e = this.events[ename];
        return e.isEvent && e.listeners.length > 0;
    },

    /**
     * Suspend the firing of all events. (see {@link #resumeEvents})
     * @param {Boolean} queueSuspended Pass as true to queue up suspended events to be fired
     * after the {@link #resumeEvents} call instead of discarding all suspended events;
     */
    suspendEvents : function(queueSuspended) {
        this.eventsSuspended = true;
        if (queueSuspended && !this.eventQueue){
            this.eventQueue = [];
        }
    },

    /**
     * Resume firing events. (see {@link #suspendEvents})
     * If events were suspended using the <tt><b>queueSuspended</b></tt> parameter, then all
     * events fired during event suspension will be sent to any listeners now.
     */
    resumeEvents : function(){
        var me = this,
            queued = me.eventQueue || [];

        me.eventsSuspended = false;
        delete me.eventQueue;

        Ext.each(queued, function(e) {
            me.fireEvent.apply(me, e);
        });
    },

    /**
     * Relays selected events from the specified Observable as if the events were fired by <tt><b>this</b></tt>.
     * @param {Object} o The Observable whose events this object is to relay.
     * @param {Array} events Array of event names to relay.
     */
    relayEvents : function(o, events) {
        var me = this;
        function createHandler(ename) {
            return function(){
                return me.fireEvent.apply(me, [ename].concat(Ext.toArray(arguments)));
            };
        }
        Ext.each(events, function(ename) {
            me.events[ename] = me.events[ename] || true;
            o.on(ename, createHandler(ename), me);
        });
    },

    /**
     * <p>Enables events fired by this Observable to bubble up an owner hierarchy by calling
     * <code>this.getBubbleTarget()</code> if present. There is no implementation in the Observable base class.</p>
     * <p>This is commonly used by Ext.Components to bubble events to owner Containers. See {@link Ext.Component.getBubbleTarget}. The default
     * implementation in Ext.Component returns the Component's immediate owner. But if a known target is required, this can be overridden to
     * access the required target more quickly.</p>
     * <p>Example:</p><pre><code>
Ext.override(Ext.form.Field, {
//  Add functionality to Field&#39;s initComponent to enable the change event to bubble
initComponent : Ext.form.Field.prototype.initComponent.createSequence(function() {
    this.enableBubble('change');
}),

//  We know that we want Field&#39;s events to bubble directly to the FormPanel.
getBubbleTarget : function() {
    if (!this.formPanel) {
        this.formPanel = this.findParentByType('form');
    }
    return this.formPanel;
}
});

var myForm = new Ext.formPanel({
title: 'User Details',
items: [{
    ...
}],
listeners: {
    change: function() {
        // Title goes red if form has been modified.
        myForm.header.setStyle('color', 'red');
    }
}
});
</code></pre>
     * @param {String/Array} events The event name to bubble, or an Array of event names.
     */
    enableBubble : function(events){
        var me = this;
        if(!Ext.isEmpty(events)){
            events = Ext.isArray(events) ? events : Ext.toArray(arguments);
            Ext.each(events, function(ename){
                ename = ename.toLowerCase();
                var ce = me.events[ename] || true;
                if (Ext.isBoolean(ce)) {
                    ce = new Ext.util.Event(me, ename);
                    me.events[ename] = ce;
                }
                ce.bubble = true;
            });
        }
    }
});

Ext.override(Ext.util.Observable, {
    /**
     * Appends an event handler to this object (shorthand for {@link #addListener}.)
     * @param {String}   eventName     The type of event to listen for
     * @param {Function} handler       The method the event invokes
     * @param {Object}   scope         (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b>
     * @param {Object}   options       (optional) An object containing handler configuration.
     * @method
     */
    on: Ext.util.Observable.prototype.addListener,
    /**
     * Removes an event handler (shorthand for {@link #removeListener}.)
     * @param {String}   eventName     The type of event the handler was associated with.
     * @param {Function} handler       The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
     * @param {Object}   scope         (optional) The scope originally specified for the handler.
     * @method
     */
    un: Ext.util.Observable.prototype.removeListener
});

/**
 * Removes <b>all</b> added captures from the Observable.
 * @param {Observable} o The Observable to release
 * @static
 */
Ext.util.Observable.releaseCapture = function(o){
    o.fireEvent = Ext.util.Observable.prototype.fireEvent;
};

/**
 * Starts capture on the specified Observable. All events will be passed
 * to the supplied function with the event name + standard signature of the event
 * <b>before</b> the event is fired. If the supplied function returns false,
 * the event will not fire.
 * @param {Observable} o The Observable to capture events from.
 * @param {Function} fn The function to call when an event is fired.
 * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the Observable firing the event.
 * @static
 */
Ext.util.Observable.capture = function(o, fn, scope) {
    o.fireEvent = o.fireEvent.createInterceptor(fn, scope);
};

/**
 * Sets observability on the passed class constructor.<p>
 * <p>This makes any event fired on any instance of the passed class also fire a single event through
 * the <i>class</i> allowing for central handling of events on many instances at once.</p>
 * <p>Usage:</p><pre><code>
Ext.util.Observable.observe(Ext.data.Connection);
Ext.data.Connection.on('beforerequest', function(con, options) {
    console.log('Ajax request made to ' + options.url);
});</code></pre>
 * @param {Function} c The class constructor to make observable.
 * @param {Object} listeners An object containing a series of listeners to add. See {@link #addListener}.
 * @static
 */
Ext.util.Observable.observe = function(cls, listeners) {
    if (cls) {
        if (!cls.fireEvent) {
            Ext.applyIf(cls, new Ext.util.Observable());
            Ext.util.Observable.capture(cls.prototype, cls.fireEvent, cls);
        }
        if (typeof listeners == 'object') {
            cls.on(listeners);
        }
        return cls;
    }
};

Ext.util.Event = Ext.extend(Object, (function() {
    function createBuffered(handler, listener, o, scope){
        listener.task = new Ext.util.DelayedTask();
        return function(){
            listener.task.delay(o.buffer, handler, scope, Ext.toArray(arguments));
        };
    };

    function createDelayed(handler, listener, o, scope){
        return function(){
            var task = new Ext.util.DelayedTask();
            if(!listener.tasks) {
                listener.tasks = [];
            }
            listener.tasks.push(task);
            task.delay(o.delay || 10, handler, scope, Ext.toArray(arguments));
        };
    };

    function createSingle(handler, listener, o, scope){
        return function(){
            listener.ev.removeListener(listener.fn, scope);
            return handler.apply(scope, arguments);
        };
    };

    return {
            constructor : function(observable, name) {
                this.name = name;
                this.observable = observable;
                this.listeners = [];
            },

        addListener : function(fn, scope, options){
            var me = this,
                listener;
            scope = scope || me.observable;

            if(!me.isListening(fn, scope)){
                listener = me.createListener(fn, scope, options);
                if(me.firing){
                                    // if we are currently firing this event, don't disturb the listener loop
                    me.listeners = me.listeners.slice(0);
                }
                me.listeners.push(listener);
            }
        },

        createListener: function(fn, scope, o){
            o = o || {};
            scope = scope || this.observable;

            var listener = {
                    fn: fn,
                scope: scope,
                o: o,
                            ev: this
            }, handler = fn;

            if(o.delay){
                handler = createDelayed(handler, listener, o, scope);
            }
            if(o.buffer){
                handler = createBuffered(handler, listener, o, scope);
            }
                    if(o.single){
                    handler = createSingle(handler, listener, o, scope);
                }

            listener.fireFn = handler;
            return listener;
        },

        findListener : function(fn, scope){
            var listeners = this.listeners,
                i = listeners.length,
                listener, s;

            while(i--) {
                listener = listeners[i];
                if(listener) {
                    s = listener.scope;
                    if(listener.fn == fn && (s == scope || s == this.observable)){
                        return i;
                    }
                }
            }

            return -1;
        },

        isListening : function(fn, scope){
            return this.findListener(fn, scope) !== -1;
        },

        removeListener : function(fn, scope){
            var me = this,
                            index,
                listener,
                k;

            if((index = me.findListener(fn, scope)) != -1){
                            listener = me.listeners[index];

                if (me.firing) {
                    me.listeners = me.listeners.slice(0);
                }

                            // cancel and remove a buffered handler that hasn't fired yet
                if(listener.task) {
                    listener.task.cancel();
                    delete l.task;
                }

                            // cancel and remove all delayed handlers that haven't fired yet
                k = listener.tasks && listener.tasks.length;
                if(k) {
                    while(k--) {
                        listener.tasks[k].cancel();
                    }
                    delete listener.tasks;
                }

                            // remove this listener from the listeners array
                me.listeners.splice(index, 1);
                return true;
            }

                    return false;
        },

        // Iterate to stop any buffered/delayed events
        clearListeners : function(){
            var listeners = me.listeners,
                i = listeners.length;

            while(i--) {
                this.removeListener(listeners[i].fn, listeners[i].scope);
            }
        },

        fire : function() {
            var me = this,
                listeners = me.listeners,
                count = listeners.length,
                i, args, listener;

            if(count > 0){
                me.firing = true;
                for (i = 0; i < count; i++) {
                    listener = listeners[i];
                args = arguments.length ? Array.prototype.slice.call(arguments, 0) : [];
                if (listener.o) {
                    args.push(listener.o);
                }
                    if(listener && listener.fireFn.apply(listener.scope || me.observable, args) === false) {
                        return (me.firing = false);
                    }
                }
            }
            me.firing = false;
            return true;
        }
    };
})());

/**
 * @class Ext.EventManager
 * Registers event handlers that want to receive a normalized EventObject instead of the standard browser event and provides
 * several useful events directly.
 * See {@link Ext.EventObject} for more details on normalized event objects.
 * @singleton
 */
Ext.EventManager = {
    optionsRe: /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate|horizontal|vertical)$/,
    touchRe: /^(?:pinch|pinchstart|tap|doubletap|swipe|swipeleft|swiperight|scroll|scrollstart|scrollend|touchstart|touchmove|touchend|taphold|tapstart|tapcancel)$/i,

    windowId: 'ext-window',
    documentId: 'ext-document',

    /**
    * Appends an event handler to an element.  The shorthand version {@link #on} is equivalent.  Typically you will
    * use {@link Ext.Element#addListener} directly on an Element in favor of calling this version.
    * @param {String/HTMLElement} el The html element or id to assign the event handler to.
    * @param {String} eventName The name of the event to listen for.
    * @param {Function} handler The handler function the event invokes. This function is passed
    * the following parameters:<ul>
    * <li>evt : EventObject<div class="sub-desc">The {@link Ext.EventObject EventObject} describing the event.</div></li>
    * <li>t : Element<div class="sub-desc">The {@link Ext.Element Element} which was the target of the event.
    * Note that this may be filtered by using the <tt>delegate</tt> option.</div></li>
    * <li>o : Object<div class="sub-desc">The options object from the addListener call.</div></li>
    * </ul>
    * @param {Object} scope (optional) The scope (<b><code>this</code></b> reference) in which the handler function is executed. <b>Defaults to the Element</b>.
    * @param {Object} options (optional) An object containing handler configuration properties.
    * This may contain any of the following properties:<ul>
    * <li>scope : Object<div class="sub-desc">The scope (<b><code>this</code></b> reference) in which the handler function is executed. <b>Defaults to the Element</b>.</div></li>
    * <li>delegate : String<div class="sub-desc">A simple selector to filter the target or look for a descendant of the target</div></li>
    * <li>stopEvent : Boolean<div class="sub-desc">True to stop the event. That is stop propagation, and prevent the default action.</div></li>
    * <li>preventDefault : Boolean<div class="sub-desc">True to prevent the default action</div></li>
    * <li>stopPropagation : Boolean<div class="sub-desc">True to prevent event propagation</div></li>
    * <li>normalized : Boolean<div class="sub-desc">False to pass a browser event to the handler function instead of an Ext.EventObject</div></li>
    * <li>delay : Number<div class="sub-desc">The number of milliseconds to delay the invocation of the handler after te event fires.</div></li>
    * <li>single : Boolean<div class="sub-desc">True to add a handler to handle just the next firing of the event, and then remove itself.</div></li>
    * <li>buffer : Number<div class="sub-desc">Causes the handler to be scheduled to run in an {@link Ext.util.DelayedTask} delayed
    * by the specified number of milliseconds. If the event fires again within that time, the original
    * handler is <em>not</em> invoked, but the new handler is scheduled in its place.</div></li>
    * <li>target : Element<div class="sub-desc">Only call the handler if the event was fired on the target Element, <i>not</i> if the event was bubbled up from a child node.</div></li>
    * </ul><br>
    * <p>See {@link Ext.Element#addListener} for examples of how to use these options.</p>
    */
    addListener : function(element, eventName, fn, scope, o){
        // handle our listener config object syntax
        if (Ext.isObject(eventName)) {
            this.handleListenerConfig(element, eventName);
            return;
        }

        var dom = Ext.getDom(element);

        // if the element doesnt exist throw an error
        if (!dom){
            throw "Error listening for \"" + eventName + '\". Element "' + element + '" doesn\'t exist.';
        }

        if (!fn) {
            throw 'Error listening for "' + eventName + '". No handler function specified';
        }

        var touch = this.touchRe.test(eventName);

        // create the wrapper function
        var wrap = this.createListenerWrap(dom, eventName, fn, scope, o, touch);

        // add all required data into the event cache
        this.getEventListenerCache(dom, eventName).push({
            fn: fn,
            wrap: wrap,
            scope: scope
        });

        if (touch) {
            Ext.TouchEventManager.addEventListener(dom, eventName, wrap, o);
        }
        else {
            // now add the event listener to the actual element!
            dom.addEventListener(eventName, wrap, false);
        }
    },

    /**
    * Removes an event handler from an element.  The shorthand version {@link #un} is equivalent.  Typically
    * you will use {@link Ext.Element#removeListener} directly on an Element in favor of calling this version.
    * @param {String/HTMLElement} el The id or html element from which to remove the listener.
    * @param {String} eventName The name of the event.
    * @param {Function} fn The handler function to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
    * @param {Object} scope If a scope (<b><code>this</code></b> reference) was specified when the listener was added,
    * then this must refer to the same object.
    */
    removeListener : function(element, eventName, fn, scope) {
        // handle our listener config object syntax
        if (Ext.isObject(eventName)) {
            this.handleListenerConfig(element, eventName, true);
            return;
        }

        var dom = Ext.getDom(element),
            cache = this.getEventListenerCache(dom, eventName),
            i = cache.length, j,
            listener, wrap, tasks;

        while (i--) {
            listener = cache[i];

            if (listener && (!fn || listener.fn == fn) && (!scope || listener.scope === scope)) {
                wrap = listener.wrap;

                // clear buffered calls
                if (wrap.task) {
                    clearTimeout(wrap.task);
                    delete wrap.task;
                }

                // clear delayed calls
                j = wrap.tasks && wrap.tasks.length;
                if (j) {
                    while (j--) {
                        clearTimeout(wrap.tasks[j]);
                    }
                    delete wrap.tasks;
                }

                if (this.touchRe.test(eventName)) {
                    Ext.TouchEventManager.removeEventListener(dom, eventName, wrap);
                }
                else {
                    // now add the event listener to the actual element!
                    dom.removeEventListener(eventName, wrap, false);
                }

                // remove listener from cache
                cache.splice(i, 1);
            }
        }
    },

    /**
    * Removes all event handers from an element.  Typically you will use {@link Ext.Element#removeAllListeners}
    * directly on an Element in favor of calling this version.
    * @param {String/HTMLElement} el The id or html element from which to remove all event handlers.
    */
    removeAll : function(element){
        var dom = Ext.getDom(element),
            cache = this.getElementEventCache(dom),
            ev;

        for(ev in cache) {
            this.removeListener(ev);
        }
        Ext.cache[dom.id].events = {};
    },

    purgeElement : function(element, recurse, eventName) {
        var dom = Ext.getDom(element),
            i = 0, len;

        if(eventName) {
            this.removeListener(dom, eventName);
        }
        else {
            this.removeAll(dom);
        }

        if(recurse && dom && dom.childNodes) {
            for(len = element.childNodes.length; i < len; i++) {
                this.purgeElement(element.childNodes[i], recurse, eventName);
            }
        }
    },

    handleListenerConfig : function(element, config, remove) {
        var key, value;

        // loop over all the keys in the object
        for (key in config) {
            // if the key is something else then an event option
            if (!this.optionsRe.test(key)) {
                value = config[key];
                // if the value is a function it must be something like click: function(){}, scope: this
                // which means that there might be multiple event listeners with shared options
                if (Ext.isFunction(value)) {
                    // shared options
                    this[(remove ? 'remove' : 'add') + 'Listener'](element, key, value, config.scope, config);
                }
                // if its not a function, it must be an object like click: {fn: function(){}, scope: this}
                else {
                    // individual options
                    this[(remove ? 'remove' : 'add') + 'Listener'](element, key, config.fn, config.scope, config);
                }
            }
        }
    },

    getId : function(element) {
        // if we bind listeners to either the document or the window
        // we have to put them in their own id cache since they both
        // can't get id's on the actual element
        var skip = true, id;
        element = Ext.getDom(element);

        if(element === document) {
            id = this.documentId;
        }
        else if(element === window) {
            id = this.windowId;
        }
        else {
            id = Ext.id(element);
            skip = false;
        }
        if(!Ext.cache[id]){
            Ext.Element.addToCache(new Ext.Element(element), id);
            if(skip){
                Ext.cache[id].skipGarbageCollection = true;
            }
        }
        return id;
    },

    // private
    createListenerWrap : function(dom, ename, fn, scope, o, touch) {
        o = !Ext.isObject(o) ? {} : o;

        var f = ["if(!window.Ext) {return;}"];

        if(touch) {
            f.push('e = new Ext.TouchEventObjectImpl(e);');
        }
        else {
            if(o.buffer || o.delay) {
                f.push('e = new Ext.EventObjectImpl(e);');
            } else {
                f.push('e = Ext.EventObject.setEvent(e);');
            }
        }

        if(o.delegate) {
            f.push('var t = e.getTarget("' + o.delegate + '", this);');
            f.push('if(!t) {return;}');
        } else {
            f.push('var t = e.target;');
        }

        if(o.target) {
            f.push('if(e.target !== o.target) {return;}');
        }

        if(o.stopEvent) {
            f.push('e.stopEvent();');
        } else {
            if(o.preventDefault) {
                f.push('e.preventDefault();');
            }
            if(o.stopPropagation) {
                f.push('e.stopPropagation();');
            }
        }

        if(o.normalized) {
            f.push('e = e.browserEvent;');
        }

        if(o.buffer) {
            f.push('(wrap.task && clearTimeout(wrap.task));');
            f.push('wrap.task = setTimeout(function(){');
        }

        if(o.delay) {
            f.push('wrap.tasks = wrap.tasks || [];');
            f.push('wrap.tasks.push(setTimeout(function(){');
        }

        // finally call the actual handler fn
        f.push('fn.call(scope || dom, e, t, o);');

        if(o.single) {
            f.push('Ext.EventManager.removeListener(dom, ename, fn, scope);');
        }

        if(o.delay) {
            f.push('}, ' + o.delay + '));');
        }

        if(o.buffer) {
            f.push('}, ' + o.buffer + ');');
        }

        var gen = new Function('e', 'o', 'fn', 'scope', 'ename', 'dom', 'wrap', f.join("\n"));

        return function(e) {
            gen.call(dom, e, o, fn, scope, ename, dom, arguments.callee);
        };
    },

    getEventListenerCache : function(element, eventName) {
        var eventCache = this.getElementEventCache(element);
        return eventCache[eventName] || (eventCache[eventName] = []);
    },

    getElementEventCache : function(element) {
        var elementCache = Ext.cache[this.getId(element)];
        return elementCache.events || (elementCache.events = {});
    },

    /**
    * Adds a listener to be notified when the document is ready (before onload and before images are loaded). Can be
    * accessed shorthanded as Ext.onReady().
    * @param {Function} fn The method the event invokes.
    * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the handler function executes. Defaults to the browser window.
    * @param {boolean} options (optional) Options object as passed to {@link Ext.Element#addListener}. It is recommended that the options
    * <code>{single: true}</code> be used so that the handler is removed on first invocation.
    */
    onDocumentReady : function(fn, scope, options){
        var me = this,
            readyEvent = me.readyEvent;

        if(Ext.isReady){ // if it already fired
            readyEvent || (readyEvent = new Ext.util.Event());
            readyEvent.addListener(fn, scope, options);
            readyEvent.fire();
            readyEvent.listeners = []; // clearListeners no longer compatible.  Force single: true?
        }
        else {
            if(!readyEvent) {
                readyEvent = me.readyEvent = new Ext.util.Event();

                // the method that will actually fire the event and clean up any listeners and intervals
                var fireReady = function() {
                    Ext.isReady = true;

                    Ext.TouchEventManager.init();

                    // remove listeners
                    document.removeEventListener('DOMContentLoaded', arguments.callee, false);
                    window.removeEventListener('load', arguments.callee, false);

                    // remove interval if there is one
                    if(intervalId) {
                        clearInterval(intervalId);
                    }

                    var w = Ext.Element.getViewportWidth(),
                        h = Ext.Element.getViewportHeight();
                    Ext.orientation = Ext.Element.getOrientation();
                    
                    // fire the ready event!!
                    readyEvent.fire({
                        orientation: Ext.orientation,
                        width: w,
                        height: h
                    });
                    readyEvent.listeners = [];
                };

                // for browsers that support DOMContentLoaded
                document.addEventListener('DOMContentLoaded', fireReady, false);

                // even though newer versions support DOMContentLoaded, we have to be sure
                if(Ext.platform.isWebKit) {
                    var intervalId = setInterval(function(){
                        if(/loaded|complete/.test(document.readyState)) {
                            clearInterval(intervalId);
                            intervalId = null;
                            fireReady();
                        }
                    }, 10);
                }

                // final fallback method
                window.addEventListener('load', fireReady, false);
            }

            options = options || {};
            options.delay = options.delay || 1;
            readyEvent.addListener(fn, scope, options);
        }
    },

    /**
     * Adds a listener to be notified when the browser window is resized and provides resize event buffering (50 milliseconds),
     * passes new viewport width and height to handlers.
     * @param {Function} fn      The handler function the window resize event invokes.
     * @param {Object}   scope   The scope (<code>this</code> reference) in which the handler function executes. Defaults to the browser window.
     * @param {boolean}  options Options object as passed to {@link Ext.Element#addListener}
     */
    onWindowResize : function(fn, scope, options) {
        var me = this,
            resizeEvent = me.resizeEvent;

        if(!resizeEvent){
            me.resizeEvent = resizeEvent = new Ext.util.Event();
            var onResize = function() {
                resizeEvent.fire(Ext.Element.getViewportWidth(), Ext.Element.getViewportHeight());
            };
            this.addListener(window, 'resize', onResize, this);
        }

        resizeEvent.addListener(fn, scope, options);
    },

    onOrientationChange : function(fn, scope, options) {
        var me = this,
            orientationEvent = me.orientationEvent;

        if (!orientationEvent) {
            me.orientationEvent = orientationEvent = new Ext.util.Event();
            var onOrientationChange = function(e) {
                var w = Ext.Element.getViewportWidth(),
                    h = Ext.Element.getViewportHeight(),
                    orientation = Ext.Element.getOrientation();

                if (orientation != Ext.orientation) {
                    Ext.orientation = orientation;
                    orientationEvent.fire(orientation, w, h);
                }
                return orientation;
            };

            if (Ext.platform.hasOrientationChange && !Ext.platform.isAndroidOS) {
                this.addListener(window, 'orientationchange', onOrientationChange, this, {delay: 50});
            }
            else {
                 this.addListener(window, 'resize', onOrientationChange, this, {buffer: 10});
            }
        }

        orientationEvent.addListener(fn, scope, options);
    }
};

/**
* Appends an event handler to an element.  Shorthand for {@link #addListener}.
* @param {String/HTMLElement} el The html element or id to assign the event handler to
* @param {String} eventName The name of the event to listen for.
* @param {Function} handler The handler function the event invokes.
* @param {Object} scope (optional) (<code>this</code> reference) in which the handler function executes. <b>Defaults to the Element</b>.
* @param {Object} options (optional) An object containing standard {@link #addListener} options
* @member Ext.EventManager
* @method on
*/
Ext.EventManager.on = Ext.EventManager.addListener;

/**
 * Removes an event handler from an element.  Shorthand for {@link #removeListener}.
 * @param {String/HTMLElement} el The id or html element from which to remove the listener.
 * @param {String} eventName The name of the event.
 * @param {Function} fn The handler function to remove. <b>This must be a reference to the function passed into the {@link #on} call.</b>
 * @param {Object} scope If a scope (<b><code>this</code></b> reference) was specified when the listener was added,
 * then this must refer to the same object.
 * @member Ext.EventManager
 * @method un
 */
Ext.EventManager.un = Ext.EventManager.removeListener;

/**
  * Adds a listener to be notified when the document is ready (before onload and before images are loaded). Shorthand of {@link Ext.EventManager#onDocumentReady}.
  * @param {Function} fn The method the event invokes.
  * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the handler function executes. Defaults to the browser window.
  * @param {boolean} options (optional) Options object as passed to {@link Ext.Element#addListener}. It is recommended that the options
  * <code>{single: true}</code> be used so that the handler is removed on first invocation.
  * @member Ext
  * @method onReady
 */
Ext.onReady = Ext.EventManager.onDocumentReady;

Ext.EventObjectImpl = Ext.extend(Object, {
    constructor : function(e) {
        if(e) {
            this.setEvent(e.browserEvent || e);
        }
    },

    /** @private */
    setEvent : function(e){
        var me = this;
        if(e == me || (e && e.browserEvent)){ // already wrapped
            return e;
        }
        me.browserEvent = e;
        if(e){
            me.type = e.type;

            // cache the target for the delayed and or buffered events
            var node = e.target;
            me.target = node && node.nodeType == 3 ? node.parentNode : node;

            // same for XY
            me.xy = [e.pageX, e.pageY];
            me.timestamp = e.timeStamp;
        } else {
            me.target = null;
            me.xy = [0, 0];
        }
        return me;
    },

    /**
     * Stop the event (preventDefault and stopPropagation)
     */
    stopEvent : function(){
        this.stopPropagation();
        this.preventDefault();
    },

    /**
     * Prevents the browsers default handling of the event.
     */
    preventDefault : function(){
        if(this.browserEvent) {
            this.browserEvent.preventDefault();
        }
    },

    /**
     * Cancels bubbling of the event.
     */
    stopPropagation : function() {
        if(this.browserEvent) {
            this.browserEvent.stopPropagation();
        }
    },

    /**
     * Gets the x coordinate of the event.
     * @return {Number}
     */
    getPageX : function(){
        return this.xy[0];
    },

    /**
     * Gets the y coordinate of the event.
     * @return {Number}
     */
    getPageY : function(){
        return this.xy[1];
    },

    /**
     * Gets the page coordinates of the event.
     * @return {Array} The xy values like [x, y]
     */
    getXY : function(){
        return this.xy;
    },

    /**
     * Gets the target for the event.
     * @param {String} selector (optional) A simple selector to filter the target or look for an ancestor of the target
     * @param {Number/Mixed} maxDepth (optional) The max depth to
            search as a number or element (defaults to 10 || document.body)
     * @param {Boolean} returnEl (optional) True to return a Ext.Element object instead of DOM node
     * @return {HTMLelement}
     */
    getTarget : function(selector, maxDepth, returnEl) {
        return selector ? Ext.fly(this.target).findParent(selector, maxDepth, returnEl) : (returnEl ? Ext.get(this.target) : this.target);
    },

    getTime : function() {
        return this.timestamp;
    }
});

/**
 * @class Ext.EventObject
 * Just as {@link Ext.Element} wraps around a native DOM node, Ext.EventObject
 * wraps the browser's native event-object normalizing cross-browser differences,
 * such as which mouse button is clicked, keys pressed, mechanisms to stop
 * event-propagation along with a method to prevent default actions from taking place.
 * <p>For example:</p>
 * <pre><code>
function handleClick(e, t){ // e is not a standard event object, it is a Ext.EventObject
    e.preventDefault();
    var target = e.getTarget(); // same as t (the target HTMLElement)
    ...
}
var myDiv = {@link Ext#get Ext.get}("myDiv");  // get reference to an {@link Ext.Element}
myDiv.on(         // 'on' is shorthand for addListener
    "click",      // perform an action on click of myDiv
    handleClick   // reference to the action handler
);
// other methods to do the same:
Ext.EventManager.on("myDiv", 'click', handleClick);
Ext.EventManager.addListener("myDiv", 'click', handleClick);
 </code></pre>
 * @singleton
 */
Ext.EventObject = new Ext.EventObjectImpl();

//Initialize doc classes
(function(){

    var initExtCss = function(){
        // find the body element
        var bd = Ext.getBody(),
            cls = [];
        if (!bd) {
            return false;
        }

        if (Ext.platform.isPhone) {
            cls.push('x-phone');
        }
        if (Ext.platform.isTablet) {
            cls.push('x-tablet');
        }
        if (Ext.platform.isIPhoneOS) {
            cls.push('x-iphone-os');
        }
        if (Ext.platform.isAndroidOS) {
            cls.push('x-android-os');
        }
        if (cls.length) {
            bd.addClass(cls);
        }

        return true;
    };

    if (!initExtCss()) {
        Ext.onReady(initExtCss);
    }
})();

Ext.TouchEventManager = Ext.apply({}, {
    swipeThreshold: 35,
    scrollThreshold: 10,
    touchEndThreshold: 25,
    tapThreshold: 8,
    tapHoldInterval: 250,
    swipeTime: 1000,
    scrollResetTime: 300,
    doubleTapThreshold: 800,
    multiTouchendThreshold: 50,

    init : function() {
        this.targets = {
            all: [],
            touchstart: [],
            touchmove: [],
            touchend: [],
            tap: [],
            tapstart: [],
            taphold: [],
            tapcancel: [],
            doubletap: [],
            swipe: [],
            scrollstart: [],
            scroll: [],
            scrollend: [],
            pinch: [],
            pinchstart: []
        };

        this.listeners = {};
        this.tracks = {};
        this.doubleTapTargets = {};
        this.pinchTargets = {};

        this.useTouch = Ext.platform.hasTouch && !Ext.platform.isChrome;

        if (this.useTouch) {
            var target = Ext.platform.isAndroidOS ? document.body : document;
            target.addEventListener('touchstart', this.onTouchStart, false);
            target.addEventListener('touchmove', this.onTouchMove, false);
            target.addEventListener('touchend', this.onTouchEnd, false);
        }
        else {
            document.addEventListener('mousedown', this.onTouchStart, false);
            document.addEventListener('mousemove', this.onTouchMove, false);
            document.addEventListener('mouseup', this.onTouchEnd, false);
        }
    },
    
    onTouchStart : function(e) {
        var me = Ext.TouchEventManager,
            touches = me.useTouch ? (e.touches || e.touch && [e.touch] || null) : [e],
            ln = touches.length,
            i, touch;

        for (i = 0; i < ln; i++) {
            touch = touches[i];
            if (!me.tracks[touch.identifier || Ext.id()]) {
                me.startTrack(touch, e);
            }
        }
        
        if (Ext.platform.isAndroidOS) {
            e.preventDefault();
            e.stopPropagation();
        }

        me.multiTouch = (ln > 1);
        me.currentTouches = e.touches;
    },

    startTrack : function(touch, e) {
        var me = this,
            target = (touch.target.nodeType == 3) ? touch.target.parentNode : touch.target,
            parent = target,
            targets = me.targets,
            touchId = touch.identifier,
            listeners, ename, id, track;

        track = me.tracks[touchId] = {
            browserEvent: e,
            startTime: e.timeStamp,
            previousTime: e.timeStamp,
            startX: touch.pageX,
            startY: touch.pageY,
            previousX: touch.pageX,
            previousY: touch.pageY,
            touch: touch,
            target: target,
            scrolling: false,
            end: false,
            move: false,
            targets: {}
        };
        
        // We are going to bubble up and see if anyone is listening for touch events
        while (parent) {
            // Check if there are any touch events bound to this parent
            if (me.targets.all.indexOf(parent) !== -1) {
                id = parent.id;

                // Get all the listeners for this parent
                listeners = me.listeners[id];

                // Create an event collection cache
                track.events = track.events || {};

                for (ename in listeners) {
                    track.events[ename] = track.events[ename] || {};
                    track.events[ename][id] = listeners[ename];
                    track.targets[id] = listeners[ename];
                }
            }
            parent = parent.parentNode;
        }

        me.lastTouchId = touchId;

        if (track.events) {
            e = {
                time: e.timeStamp,
                pageX: touch.pageX,
                pageY: touch.pageY,
                touch: touch,
                touches: e.touches ? e.touches : [e.touch],
                browserEvent: e
            };

            if (track.events.touchstart && me.fireListeners('touchstart', track, e) === false) {
                track.end = true;
                return;
            }

            if (track.events.tapstart && me.fireListeners('tapstart', track, e) === false) {
                track.end = true;
                return;
            }

            if (track.events.taphold) {
                track.tapHoldIntervalId = setInterval(me.tapHoldHandler.createDelegate(track), me.tapHoldInterval);
            }

            track.move = track.end = true;
        }
    },

    onTouchMove : function(e) {
        var me = Ext.TouchEventManager,
            touches = me.useTouch ? e.changedTouches : [e],
            ln = touches.length,
            i, touch, track, id;

        e.preventDefault();
        e.stopPropagation();
            
        for (i = 0; i < ln; i++) {
            touch = touches[i];
            track = me.tracks[touch.identifier];

            if (!track || !track.move) {
                continue;
            }

            var startX = track.startX,
                startY = track.startY,
                pageX = touch.pageX,
                pageY = touch.pageY,
                previousX = track.previousX,
                previousY = track.previousY,
                deltaX = pageX - startX,
                deltaY = pageY - startY,
                absDeltaX = Math.abs(deltaX),
                absDeltaY = Math.abs(deltaY),
                previousDeltaX = pageX - previousX,
                previousDeltaY = pageY - previousY,
                time = e.timeStamp,
                startTime = track.startTime,
                previousTime = track.previousTime,
                deltaTime = time - startTime,
                previousDeltaTime = time - previousTime,
                browserEvent = e;

            if (absDeltaX > me.tapThreshold || absDeltaY > me.tapThreshold) {
                if (track.events.taphold) {
                    clearInterval(track.tapHoldIntervalId);
                    track.tapHoldIntervalId = null;
                    delete track.events.taphold;
                }

                if (track.events.tapcancel) {
                    me.fireListeners('tapcancel', track, {originalEvent: e});
                    // tap cancel will only fire once
                    delete track.events.tapcancel;
                }

                if (track.events.doubletap) {
                    delete track.events.doubletap;
                }

                // If we have moved, a tap is not possible anymore
                delete track.events.tap;
            }

            e = {
                pageX: pageX,
                pageY: pageY,
                touches: browserEvent.touches,
                startX: startX,
                startY: startY,
                previousX: track.previousX,
                previousY: track.previousY,
                deltaX: deltaX,
                deltaY: deltaY,
                previousDeltaX: previousDeltaX,
                previousDeltaY: previousDeltaY,
                time: time,
                startTime: startTime,
                previousTime: previousTime,
                deltaTime: deltaTime,
                previousDeltaTime: previousDeltaTime,
                browserEvent: browserEvent
            };

            if (track.events.touchmove && me.fireListeners('touchmove', track, e) === false) {
                // We want to reset the start values because of the scrollThreshold
                track.previousTime = time;
                track.previousX = pageX;
                track.previousY = pageY;
                track.previousDeltaX = previousDeltaX;
                track.previousDeltaY = previousDeltaY;
                return;
            }

            // If we are not tracking a scrolling motion, we have to check if this is a swipe
            if (!track.scrolling && track.events.swipe) {
                // If the swipeTime is over, we are not gonna check for it again
                if (absDeltaY - absDeltaX > 2 || deltaTime > me.swipeTime) {
                    delete track.events.swipe;
                }
                else if (absDeltaX > me.swipeThreshold && absDeltaX > absDeltaY) {
                    // If this is a swipe, a scroll is not possible anymore
                    delete track.events.scroll;
                    delete track.events.scrollstart;
                    delete track.events.scrollend;

                    // End all this madness
                    me.fireListeners('swipe', track, {
                        browserEvent: browserEvent,
                        direction: (deltaX < 0) ? 'left' : 'right',
                        distance: absDeltaX,
                        time: time,
                        deltaTime: deltaTime
                    });

                    delete track.events.swipe;
                }
                return;
            }

            if (me.multiTouch && !track.scrolling && track.events.pinch) {
                var anchor, distance, scale,
                    pinch = me.pinch;

                if (!track.pinching && !pinch) {
                    for (id in track.events.pinch) {
                        anchor = me.pinchTargets[id];

                        if (anchor && anchor != track) {
                            delete track.events.scroll;
                            delete track.events.scrollstart;
                            delete track.events.scrollend;
                            delete track.events.swipe;
                            delete anchor.events.scroll;
                            delete anchor.events.scrollstart;
                            delete anchor.events.scrollend;
                            delete anchor.events.swipe;

                            e = pinch = me.pinch = {
                                browserEvent: browserEvent,
                                touches: [track.touch, anchor.touch],
                                distance: Math.sqrt(
                                    Math.pow(Math.abs(track.touch.pageX - anchor.touch.pageX), 2) +
                                    Math.pow(Math.abs(track.touch.pageY - anchor.touch.pageY), 2)
                                )
                            };
                            track.pinching = anchor.pinching = true;

                            me.fireListeners('pinchstart', track, e);

                            pinch.previousDistance = pinch.distance;
                            pinch.previousScale = 1;
                            return;
                        }
                        else {
                            me.pinchTargets[id] = track;
                        }
                    }
                }

                if (track.pinching && pinch) {
                    distance = Math.sqrt(
                        Math.pow(Math.abs(pinch.touches[0].pageX - pinch.touches[1].pageX), 2) +
                        Math.pow(Math.abs(pinch.touches[0].pageY - pinch.touches[1].pageY), 2)
                    );
                    scale = distance / pinch.distance;

                    e = {
                        browserEvent: track.browserEvent,
                        time: time,
                        touches: pinch.touches,
                        scale: scale,
                        deltaScale: scale - 1,
                        previousScale: pinch.previousScale,
                        previousDeltaScale: scale - pinch.previousScale,
                        distance: distance,
                        deltaDistance: distance - pinch.distance,
                        startDistance: pinch.distance,
                        previousDistance: pinch.previousDistance,
                        previousDeltaDistance: distance - pinch.previousDistance
                    };

                    me.fireListeners('pinch', track, e);

                    pinch.previousScale = scale;
                    pinch.previousDistance = distance;

                    return;
                }
            }

            // If this wasnt a swipe, and we arent scrolling yet
            if (track.events.scroll || track.events.scrollstart || track.events.scrollend) {
                if (!track.scrolling && (absDeltaX >= me.scrollThreshold || absDeltaY >= me.scrollThreshold)) {
                    // Set the proper flags
                    track.scrolling = true;

                    // No more swipeing after scrolling!
                    delete track.events.swipe;

                    // The following code manages the fact that if a target is only interested in
                    // one direction scrolls, and there are multiple targets listening for scroll events
                    // we will cancel listening for the events till the end of this scroll if the
                    // direction is different from the intial scroll direction.
                    var targets = track.targets,
                        options, ename, x, xln;

                    xln = 0;
                    for (id in targets) {
                        xln++;
                    }

                    if (xln > 1) {
                        for (id in targets) {
                            for (x = 0, xln = targets[id].length; x < xln; x++) {
                                options = targets[id][x].options;
                                if (!options) {
                                    continue;
                                }
                                if (options &&
                                    (options.vertical === true && options.horizontal === false && absDeltaX >= absDeltaY) ||
                                    (options.vertical === false && options.horizontal === true && absDeltaX <= absDeltaY)
                                ) {
                                    for (ename in track.events) {
                                        delete track.events[ename][id];
                                    }
                                }
                            }
                        }
                    }

                    // We want to decide the scrollBounds so we can do bound checking
                    track.scrollBounds = {
                        right : Ext.Element.getViewportWidth(),
                        bottom : Ext.Element.getViewportHeight()
                    };

                    if (track.events.scrollstart) {
                        // Create the scroll event
                        me.fireListeners('scrollstart', track, {
                            browserEvent: track.browserEvent,
                            time: time,
                            pageX: pageX,
                            pageY: pageY
                        });
                    }
                }
                else if (track.scrolling) {
                    me.fireListeners('scroll', track, e);

                    // We want to do bounds checking to make sure
                    if (absDeltaX > absDeltaY) {
                        if (deltaX > 0) {
                            // If we are scrolling down we want to check how close we are to the bottom
                            if(track.scrollBounds.right - pageX < me.touchEndThreshold) {
                                me.onTouchEnd(browserEvent);
                            }
                        }
                        else if (pageX < me.touchEndThreshold) {
                            me.onTouchEnd(browserEvent);
                        }
                    }
                    else {
                        // We want to do bounds checking to make sure
                        if (deltaY > 0) {
                            // If we are scrolling down we want to check how close we are to the bottom
                            if(track.scrollBounds.bottom - pageY < me.touchEndThreshold) {
                                me.onTouchEnd(browserEvent);
                            }
                        }
                        else if (pageY < me.touchEndThreshold) {
                            me.onTouchEnd(browserEvent);
                        }
                    }
                }
            }

            // We want to reset the start values because of the scrollThreshold
            track.previousTime = time;
            track.previousX = pageX;
            track.previousY = pageY;
            track.previousDeltaX = previousDeltaX;
            track.previousDeltaY = previousDeltaY;
        }
    },

    onTouchEnd : function(e) {
        var me = Ext.TouchEventManager,
            tracks = me.tracks,
            touches = me.useTouch ? e.changedTouches : [e],
            ln = touches.length,
            touch, track, i,
            targetId, touchEvent;

        for (i = 0; i < ln; i++) {
            touch = touches[i];
            track = tracks[touch.identifier];

            if (!track || !track.end) {
                continue;
            }

            touchEvent = {
                browserEvent: e,
                pageX: track.previousX,
                pageY: track.previousY,
                deltaX: track.previousX - track.startX,
                deltaY: track.previousY - track.startY,
                previousDeltaX: track.previousDeltaX,
                previousDeltaY: track.previousDeltaY,
                deltaTime: e.timeStamp - track.startTime,
                previousDeltaTime: e.timeStamp - track.previousTime,
                time: e.timeStamp
            };

            if (track.events.touchend && me.fireListeners('touchend', track, touchEvent) === false) {
                break;
            }

            if (track.events.taphold) {
                clearInterval(track.tapHoldIntervalId);
                me.tapHoldIntervalId = null;
            }

            if (track.scrolling && track.events.scrollend) {
                me.fireListeners('scrollend', track, touchEvent);
            }
            else if (track.events.tap) {
                me.fireListeners('tap', track, {
                    browserEvent: e,
                    time: e.timeStamp,
                    pageX: track.startX,
                    pageY: track.startY,
                    touch: track.touch
                });
            }

            if (track.events.doubletap && !me.multiTouch) {
                targetId = track.target.id;

                if (!me.doubleTapTargets[targetId]) {
                    me.doubleTapTargets[targetId] = e.timeStamp;
                }
                else {
                    if (e.timeStamp - me.doubleTapTargets[targetId] <= me.doubleTapThreshold) {
                        me.fireListeners('doubletap', track, {
                            browserEvent: e,
                            time: e.timeStamp,
                            pageX: track.startX,
                            pageY: track.startY,
                            touch: track.touch
                        });
                        delete me.doubleTapTargets[targetId];
                    }
                    else {
                        me.doubleTapTargets[targetId] = e.timeStamp;
                    }
                }
            }

            //delete tracks[touch.identifier];
        }

        me.tracks = {};

        me.pinchTargets = {};
        me.pinch = null;
    },

    tapHoldHandler : function() {
        var me = Ext.TouchEventManager,
            track = this,
            time = (new Date()).getTime();

        me.fireListeners('taphold', track, {
            time: time,
            startTime: track.startTime,
            deltaTime: time - track.startTime,
            pageX: track.startX,
            pageY: track.startY,
            touch: track.touch
        });
    },

    addEventListener : function(dom, ename, fn, o) {
        if(!this.targets[ename]) {
            return;
        }

        if(!this.targets.all.contains(dom)) {
            this.targets.all.push(dom);
        }

        if(!this.targets[ename].contains(dom)) {
            this.targets[ename].push(dom);
        }

        var id = Ext.id(dom),
            track;

        fn.options = o;
        fn.ename = ename;

        this.listeners[id] = this.listeners[id] || {};
        this.listeners[id][ename] = this.listeners[id][ename] || [];
        this.listeners[id][ename].push(fn);

        for (id in this.tracks) {
            track = this.tracks[id];

            if (track && (dom == document || dom === track.target || Ext.get(dom).contains(track.target))) {
                track.events[ename] = track.events[ename] || {};
                track.events[ename][id] = track.events[ename][id] || [];
                track.events[ename][id].push(fn);

                if (/touchmove|scroll|swipe|tap|doubletap/i.test(ename)) {
                    track.move = true;
                }

                if (/touchend|scrollend|tapcancel|tap|doubletap|/i.test(ename)) {
                    track.end = true;
                }
            }
        }
    },

    removeEventListener : function(dom, ename, fn) {
        if (!this.targets[ename]) {
            return;
        }

        this.targets[ename].remove(dom);

        var id = Ext.id(dom),
            listeners = this.listeners[id],
            ev, hasListeners = false;

        if (listeners && listeners[ename]) {
            listeners[ename].remove(fn);

            for (ev in listeners) {
                hasListeners = true;
                break;
            }

            if (!listeners[ename].length) {
                delete listeners[ename];
            }

            if (!hasListeners) {
                this.targets.all.remove(dom);
                delete listeners[id];
            }
        }
    },

    fireListeners : function(ename, track, e) {
        var me = Ext.TouchEventManager;

        e.type = ename;
        e.target = track.target;
        e.touch = track.touch;
        e.identifier = track.touch.identifier;

        var targets = track.events[ename],
            target, listeners, listener,
            id, i, ln;

        if (targets) {
            for (id in targets) {
                listeners = targets[id];
                for (i = 0, ln = listeners.length; i < ln; i++) {
                    listener = listeners[i];
                    if (listener.call(Ext.getDom(id), e) === false || e.cancel === true) {
                        if (e.browserEvent) {
                            //e.browserEvent.stopPropagation();
                            //e.browserEvent.preventDefault();
                        }
                        return false;
                    }
                }
            }
        }

        return true;
    },

    // private
    createListenerWrap : Ext.EventManager.createListenerWrap
});

Ext.TouchEventObjectImpl = Ext.extend(Object, {
    constructor : function(e) {
        if(e) {
            this.setEvent(e);
        }
    },

    setEvent : function(e) {
        this.event = e;
        Ext.apply(this, e);
        return this;
    },

    stopEvent : function() {
        this.stopPropagation();
        this.preventDefault();
    },

    stopPropagation : function() {
        this.event.cancel = true;
    },

    preventDefault : function() {
        this.event.prevent = true;
    },

    getTarget : function(selector, maxDepth, returnEl) {
        if(selector) {
            return Ext.fly(this.target).findParent(selector, maxDepth, returnEl);
        }
        else {
            return returnEl ? Ext.get(this.target) : this.target;
        }
    }
});

Ext.TouchEventObject = new Ext.TouchEventObjectImpl();

/**
*  @private
 * @class Ext.util.OfflineDebug
 * @singleton
 *
 * Helper class to implement cache manifest.
 *
 * Exposes a number of events and prints them out to the console to help
 * troubleshoot potential problems with CacheManifests.
 */
Ext.util.OfflineDebug = function() {
    var cacheStatuses = ['uncached', 'idle', 'checking', 'downloading', 'updateready', 'obsolete'],
        cacheEvents = ['cached', 'checking', 'downloading', 'error', 'noupdate', 'obsolete', 'progress', 'updateready'],
        appcache = window.applicationCache;

    logEvent = function(e){
        var online = (navigator.onLine) ? 'yes' : 'no',
            status = cacheStatuses[appcache.status],
            type = e.type;

        var message = 'online: ' + online;
        message += ', event: ' + type;
        message += ', status: ' + status;

        if (type == 'error' && navigator.onLine) {
            message += ' There was an unknown error, check your Cache Manifest.';
        }
        console.log(message);
    };

    // First add event listeners to the application cache
    for (var i = cacheEvents.length - 1; i >= 0; i--) {
        appcache.addEventListener(cacheEvents[i], logEvent, false);
    }

    appcache.addEventListener('updateready', function(e) {
        // Don't perform "swap" if this is the first cache
        if (cacheStatuses[cache.status] != 'idle') {
            cache.swapCache();
            console.log('Swapped/updated the Cache Manifest.');
        }
    }, false);

    checkForUpdates = function(){
        appcache.update();
    };

    return {
        checkForUpdates: checkForUpdates
    };
};

/**
 * @class Ext.util.GeoLocation
 * @extends Ext.util.Observable
 *
 * Provides a cross-browser wrapper around the W3C Geolocation Spec.
 * http://dev.w3.org/geo/api/spec-source.html
 */
Ext.util.GeoLocation = Ext.extend(Ext.util.Observable, {
    /**
     * @type Object
     * Latitude and Longitude Coordinates
     * An object with the following properties:
     * <ul>
     * <li>latitude</li>
     * <li>longitude</li>
     * <li>original - The original browser location object.</li>
     * </ul>
     */
    coords: null,

    /**
     * @type Boolean
     * Determines whether the browser has GeoLocation or not.
     */
    hasGeoLocation: false,

    /**
     * @cfg {Boolean} autoUpdate
     * When set to true, continually monitor the location of the device
     * and fire update events. (Defaults to true.)
     */
    autoUpdate: true,

    /**
     * @constructor
     * @param config {Object}
     */
    constructor : function(config) {
        config = config || {};
        Ext.apply(this, config);

        this.hasGeoLocation = !!navigator.geolocation;

        /**
         * @event update
         * @param {Cooridinates} coord A coordinate object as defined by the coords property. Will return false if geolocation is disabled or denied access.
         * @param {Ext.util.GeoLocation} this
         */
        this.addEvents('beforeupdate','update');

        Ext.util.GeoLocation.superclass.constructor.call(this);

        if (this.autoUpdate) {
            this.updateLocation();
        }
    },

    /**
     * Returns cached coordinates, and updates if there are no cached coords yet.
     */
    getLocation : function(callback, scope) {
        var me = this;
        if (me.hasGeoLocation && !me.coords) {
            me.updateLocation(callback, scope);
        }
        else if (me.hasGeoLocation && callback) {
            setTimeout(function() {
                callback.call(scope || me, me.coords, me);
            }, 0);
        }
        else if (callback) {
            setTimeout(function() {
                callback.call(scope || me, null, me);
            }, 0);
        }
    },

    /**
     * Forces an update of the coords.
     */
    updateLocation : function(callback, scope) {
        var me = this;
        if (me.hasGeoLocation) {
            me.fireEvent('beforeupdate', me);
            navigator.geolocation.getCurrentPosition(function(position) {
                me.coords = me.parseCoords(position);
                if (callback) {
                    callback.call(scope || me, me.coords, me);
                }
                me.fireEvent('update', me.coords, me);
            });
        }
        else {
            setTimeout(function() {
                if (callback) {
                    callback.call(scope || me, null, me);
                }
                me.fireEvent('update', false, me);
            }, 0);
        }
    },

    // @private
    parseCoords : function(location) {
        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            original: location
        };
    }
});

/**
 * @class Ext.util.MixedCollection
 * @extends Ext.util.Observable
 * A Collection class that maintains both numeric indexes and keys and exposes events.
 * @constructor
 * @param {Boolean} allowFunctions Specify <tt>true</tt> if the {@link #addAll}
 * function should add function references to the collection. Defaults to
 * <tt>false</tt>.
 * @param {Function} keyFn A function that can accept an item of the type(s) stored in this MixedCollection
 * and return the key value for that item.  This is used when available to look up the key on items that
 * were passed without an explicit key parameter to a MixedCollection method.  Passing this parameter is
 * equivalent to providing an implementation for the {@link #getKey} method.
 */
Ext.util.MixedCollection = function(allowFunctions, keyFn) {
    this.items = [];
    this.map = {};
    this.keys = [];
    this.length = 0;
    this.addEvents(
        /**
         * @event clear
         * Fires when the collection is cleared.
         */
        'clear',
        /**
         * @event add
         * Fires when an item is added to the collection.
         * @param {Number} index The index at which the item was added.
         * @param {Object} o The item added.
         * @param {String} key The key associated with the added item.
         */
        'add',
        /**
         * @event replace
         * Fires when an item is replaced in the collection.
         * @param {String} key he key associated with the new added.
         * @param {Object} old The item being replaced.
         * @param {Object} new The new item.
         */
        'replace',
        /**
         * @event remove
         * Fires when an item is removed from the collection.
         * @param {Object} o The item being removed.
         * @param {String} key (optional) The key associated with the removed item.
         */
        'remove',
        'sort'
    );
    this.allowFunctions = allowFunctions === true;
    if(keyFn){
        this.getKey = keyFn;
    }
    Ext.util.MixedCollection.superclass.constructor.call(this);
};

Ext.extend(Ext.util.MixedCollection, Ext.util.Observable, {

    /**
     * @cfg {Boolean} allowFunctions Specify <tt>true</tt> if the {@link #addAll}
     * function should add function references to the collection. Defaults to
     * <tt>false</tt>.
     */
    allowFunctions : false,

    /**
     * Adds an item to the collection. Fires the {@link #add} event when complete.
     * @param {String} key <p>The key to associate with the item, or the new item.</p>
     * <p>If a {@link #getKey} implementation was specified for this MixedCollection,
     * or if the key of the stored items is in a property called <tt><b>id</b></tt>,
     * the MixedCollection will be able to <i>derive</i> the key for the new item.
     * In this case just pass the new item in this parameter.</p>
     * @param {Object} o The item to add.
     * @return {Object} The item added.
     */
    add : function(key, o){
        if(arguments.length == 1){
            o = arguments[0];
            key = this.getKey(o);
        }
        if(typeof key != 'undefined' && key !== null){
            var old = this.map[key];
            if(typeof old != 'undefined'){
                return this.replace(key, o);
            }
            this.map[key] = o;
        }
        this.length++;
        this.items.push(o);
        this.keys.push(key);
        this.fireEvent('add', this.length-1, o, key);
        return o;
    },

    /**
      * MixedCollection has a generic way to fetch keys if you implement getKey.  The default implementation
      * simply returns <b><code>item.id</code></b> but you can provide your own implementation
      * to return a different value as in the following examples:<pre><code>
// normal way
var mc = new Ext.util.MixedCollection();
mc.add(someEl.dom.id, someEl);
mc.add(otherEl.dom.id, otherEl);
//and so on

// using getKey
var mc = new Ext.util.MixedCollection();
mc.getKey = function(el){
   return el.dom.id;
};
mc.add(someEl);
mc.add(otherEl);

// or via the constructor
var mc = new Ext.util.MixedCollection(false, function(el){
   return el.dom.id;
});
mc.add(someEl);
mc.add(otherEl);
     * </code></pre>
     * @param {Object} item The item for which to find the key.
     * @return {Object} The key for the passed item.
     */
    getKey : function(o){
         return o.id;
    },

    /**
     * Adds all elements of an Array or an Object to the collection.
     * @param {Object/Array} objs An Object containing properties which will be added
     * to the collection, or an Array of values, each of which are added to the collection.
     * Functions references will be added to the collection if <code>{@link #allowFunctions}</code>
     * has been set to <tt>true</tt>.
     */
    addAll : function(objs){
        if(arguments.length > 1 || Ext.isArray(objs)){
            var args = arguments.length > 1 ? arguments : objs;
            for(var i = 0, len = args.length; i < len; i++){
                this.add(args[i]);
            }
        }else{
            for(var key in objs){
                if(this.allowFunctions || typeof objs[key] != 'function'){
                    this.add(key, objs[key]);
                }
            }
        }
    },

    /**
     * Executes the specified function once for every item in the collection, passing the following arguments:
     * <div class="mdetail-params"><ul>
     * <li><b>item</b> : Mixed<p class="sub-desc">The collection item</p></li>
     * <li><b>index</b> : Number<p class="sub-desc">The item's index</p></li>
     * <li><b>length</b> : Number<p class="sub-desc">The total number of items in the collection</p></li>
     * </ul></div>
     * The function should return a boolean value. Returning false from the function will stop the iteration.
     * @param {Function} fn The function to execute for each item.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current item in the iteration.
     */
    each : function(fn, scope){
        var items = [].concat(this.items); // each safe for removal
        for(var i = 0, len = items.length; i < len; i++){
            if(fn.call(scope || items[i], items[i], i, len) === false){
                break;
            }
        }
    },

    /**
     * Executes the specified function once for every key in the collection, passing each
     * key, and its associated item as the first two parameters.
     * @param {Function} fn The function to execute for each item.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the browser window.
     */
    eachKey : function(fn, scope){
        for(var i = 0, len = this.keys.length; i < len; i++){
            fn.call(scope || window, this.keys[i], this.items[i], i, len);
        }
    },

    /**
     * Replaces an item in the collection. Fires the {@link #replace} event when complete.
     * @param {String} key <p>The key associated with the item to replace, or the replacement item.</p>
     * <p>If you supplied a {@link #getKey} implementation for this MixedCollection, or if the key
     * of your stored items is in a property called <tt><b>id</b></tt>, then the MixedCollection
     * will be able to <i>derive</i> the key of the replacement item. If you want to replace an item
     * with one having the same key value, then just pass the replacement item in this parameter.</p>
     * @param o {Object} o (optional) If the first parameter passed was a key, the item to associate
     * with that key.
     * @return {Object}  The new item.
     */
    replace : function(key, o){
        if(arguments.length == 1){
            o = arguments[0];
            key = this.getKey(o);
        }
        var old = this.map[key];
        if(typeof key == 'undefined' || key === null || typeof old == 'undefined'){
             return this.add(key, o);
        }
        var index = this.indexOfKey(key);
        this.items[index] = o;
        this.map[key] = o;
        this.fireEvent('replace', key, old, o);
        return o;
    },

    /**
     * Returns the first item in the collection which elicits a true return value from the
     * passed selection function.
     * @param {Function} fn The selection function to execute for each item.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the browser window.
     * @return {Object} The first item in the collection which returned true from the selection function.
     */
    find : function(fn, scope){
        for(var i = 0, len = this.items.length; i < len; i++){
            if(fn.call(scope || window, this.items[i], this.keys[i])){
                return this.items[i];
            }
        }
        return null;
    },

    /**
     * Inserts an item at the specified index in the collection. Fires the {@link #add} event when complete.
     * @param {Number} index The index to insert the item at.
     * @param {String} key The key to associate with the new item, or the item itself.
     * @param {Object} o (optional) If the second parameter was a key, the new item.
     * @return {Object} The item inserted.
     */
    insert : function(index, key, o){
        if(arguments.length == 2){
            o = arguments[1];
            key = this.getKey(o);
        }
        if(this.containsKey(key)){
            this.suspendEvents();
            this.removeKey(key);
            this.resumeEvents();
        }
        if(index >= this.length){
            return this.add(key, o);
        }
        this.length++;
        this.items.splice(index, 0, o);
        if(typeof key != 'undefined' && key !== null){
            this.map[key] = o;
        }
        this.keys.splice(index, 0, key);
        this.fireEvent('add', index, o, key);
        return o;
    },

    /**
     * Remove an item from the collection.
     * @param {Object} o The item to remove.
     * @return {Object} The item removed or false if no item was removed.
     */
    remove : function(o){
        return this.removeAt(this.indexOf(o));
    },

    /**
     * Remove an item from a specified index in the collection. Fires the {@link #remove} event when complete.
     * @param {Number} index The index within the collection of the item to remove.
     * @return {Object} The item removed or false if no item was removed.
     */
    removeAt : function(index){
        if(index < this.length && index >= 0){
            this.length--;
            var o = this.items[index];
            this.items.splice(index, 1);
            var key = this.keys[index];
            if(typeof key != 'undefined'){
                delete this.map[key];
            }
            this.keys.splice(index, 1);
            this.fireEvent('remove', o, key);
            return o;
        }
        return false;
    },

    /**
     * Removed an item associated with the passed key fom the collection.
     * @param {String} key The key of the item to remove.
     * @return {Object} The item removed or false if no item was removed.
     */
    removeKey : function(key){
        return this.removeAt(this.indexOfKey(key));
    },

    /**
     * Returns the number of items in the collection.
     * @return {Number} the number of items in the collection.
     */
    getCount : function(){
        return this.length;
    },

    /**
     * Returns index within the collection of the passed Object.
     * @param {Object} o The item to find the index of.
     * @return {Number} index of the item. Returns -1 if not found.
     */
    indexOf : function(o){
        return this.items.indexOf(o);
    },

    /**
     * Returns index within the collection of the passed key.
     * @param {String} key The key to find the index of.
     * @return {Number} index of the key.
     */
    indexOfKey : function(key){
        return this.keys.indexOf(key);
    },

    /**
     * Returns the item associated with the passed key OR index.
     * Key has priority over index.  This is the equivalent
     * of calling {@link #key} first, then if nothing matched calling {@link #itemAt}.
     * @param {String/Number} key The key or index of the item.
     * @return {Object} If the item is found, returns the item.  If the item was not found, returns <tt>undefined</tt>.
     * If an item was found, but is a Class, returns <tt>null</tt>.
     */
    item : function(key){
        var mk = this.map[key],
            item = mk !== undefined ? mk : (typeof key == 'number') ? this.items[key] : undefined;
        return !Ext.isFunction(item) || this.allowFunctions ? item : null; // for prototype!
    },

    /**
     * Returns the item at the specified index.
     * @param {Number} index The index of the item.
     * @return {Object} The item at the specified index.
     */
    itemAt : function(index){
        return this.items[index];
    },

    /**
     * Returns the item associated with the passed key.
     * @param {String/Number} key The key of the item.
     * @return {Object} The item associated with the passed key.
     */
    key : function(key){
        return this.map[key];
    },

    /**
     * Returns true if the collection contains the passed Object as an item.
     * @param {Object} o  The Object to look for in the collection.
     * @return {Boolean} True if the collection contains the Object as an item.
     */
    contains : function(o){
        return this.indexOf(o) != -1;
    },

    /**
     * Returns true if the collection contains the passed Object as a key.
     * @param {String} key The key to look for in the collection.
     * @return {Boolean} True if the collection contains the Object as a key.
     */
    containsKey : function(key){
        return typeof this.map[key] != 'undefined';
    },

    /**
     * Removes all items from the collection.  Fires the {@link #clear} event when complete.
     */
    clear : function(){
        this.length = 0;
        this.items = [];
        this.keys = [];
        this.map = {};
        this.fireEvent('clear');
    },

    /**
     * Returns the first item in the collection.
     * @return {Object} the first item in the collection..
     */
    first : function(){
        return this.items[0];
    },

    /**
     * Returns the last item in the collection.
     * @return {Object} the last item in the collection..
     */
    last : function(){
        return this.items[this.length-1];
    },

    /**
     * @private
     * Performs the actual sorting based on a direction and a sorting function. Internally,
     * this creates a temporary array of all items in the MixedCollection, sorts it and then writes
     * the sorted array data back into this.items and this.keys
     * @param {String} property Property to sort by ('key', 'value', or 'index')
     * @param {String} dir (optional) Direction to sort 'ASC' or 'DESC'. Defaults to 'ASC'.
     * @param {Function} fn (optional) Comparison function that defines the sort order.
     * Defaults to sorting by numeric value.
     */
    _sort : function(property, dir, fn){
        var i, len,
            dsc = String(dir).toUpperCase() == 'DESC' ? -1 : 1,

            //this is a temporary array used to apply the sorting function
            c     = [],
            keys  = this.keys,
            items = this.items;

        //default to a simple sorter function if one is not provided
        fn = fn || function(a, b) {
            return a - b;
        };

        //copy all the items into a temporary array, which we will sort
        for (i = 0, len = items.length; i < len; i++) {
            c[c.length] = {
                key  : keys[i],
                value: items[i],
                index: i
            };
        }

        //sort the temporary array
        c.sort(function(a, b) {
            var v = fn(a[property], b[property]) * dsc;
            if (v === 0) {
                v = (a.index < b.index ? -1 : 1);
            }
            return v;
        });

        //copy the temporary array back into the main this.items and this.keys objects
        for (i = 0, len = c.length; i < len; i++) {
            items[i] = c[i].value;
            keys[i]  = c[i].key;
        }

        this.fireEvent('sort', this);
    },

    /**
     * Sorts this collection by <b>item</b> value with the passed comparison function.
     * @param {String} direction (optional) 'ASC' or 'DESC'. Defaults to 'ASC'.
     * @param {Function} fn (optional) Comparison function that defines the sort order.
     * Defaults to sorting by numeric value.
     */
    sort : function(dir, fn) {
        this._sort('value', dir, fn);
    },

    /**
     * Returns a range of items in this collection
     * @param {Number} startIndex (optional) The starting index. Defaults to 0.
     * @param {Number} endIndex (optional) The ending index. Defaults to the last item.
     * @return {Array} An array of items
     */
    getRange : function(start, end){
        var items = this.items;
        if(items.length < 1){
            return [];
        }
        start = start || 0;
        end = Math.min(typeof end == 'undefined' ? this.length-1 : end, this.length-1);
        var i, r = [];
        if(start <= end){
            for(i = start; i <= end; i++) {
                r[r.length] = items[i];
            }
        }else{
            for(i = start; i >= end; i--) {
                r[r.length] = items[i];
            }
        }
        return r;
    },

    /**
     * Filter the <i>objects</i> in this collection by a specific property.
     * Returns a new collection that has been filtered.
     * @param {String} property A property on your objects
     * @param {String/RegExp} value Either string that the property values
     * should start with or a RegExp to test against the property
     * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning
     * @param {Boolean} caseSensitive (optional) True for case sensitive comparison (defaults to False).
     * @return {MixedCollection} The new filtered collection
     */
    filter : function(property, value, anyMatch, caseSensitive, exactMatch) {
        //we can accept an array of filter objects, or a single filter object - normalize them here
        if (Ext.isObject(property)) {
            property = [property];
        }

        if (Ext.isArray(property)) {
            var filters = [];

            //normalize the filters passed into an array of filter functions
            for (var i=0, j = property.length; i < j; i++) {
                var filter = property[i],
                    func   = filter.fn,
                    scope  = filter.scope || this;

                //if we weren't given a filter function, construct one now
                if (typeof func != 'function') {
                    func = this.createFilterFn(filter.property, filter.value, filter.anyMatch, filter.caseSensitive, filter.exactMatch);
                }

                filters.push({fn: func, scope: scope});
            }

            var fn = this.createMultipleFilterFn(filters);
        } else {
            //classic single property filter
            var fn = this.createFilterFn(property, value, anyMatch, caseSensitive, exactMatch);
        }

        return (fn === false ? this : this.filterBy(fn));
    },

    /**
     * Filter by a function. Returns a <i>new</i> collection that has been filtered.
     * The passed function will be called with each object in the collection.
     * If the function returns true, the value is included otherwise it is filtered.
     * @param {Function} fn The function to be called, it will receive the args o (the object), k (the key)
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this MixedCollection.
     * @return {MixedCollection} The new filtered collection
     */
    filterBy : function(fn, scope){
        var r = new Ext.util.MixedCollection();
        r.getKey = this.getKey;
        var k = this.keys, it = this.items;
        for(var i = 0, len = it.length; i < len; i++){
            if(fn.call(scope||this, it[i], k[i])){
                r.add(k[i], it[i]);
            }
        }
        return r;
    },

    /**
     * Finds the index of the first matching object in this collection by a specific property/value.
     * @param {String} property The name of a property on your objects.
     * @param {String/RegExp} value A string that the property values
     * should start with or a RegExp to test against the property.
     * @param {Number} start (optional) The index to start searching at (defaults to 0).
     * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning.
     * @param {Boolean} caseSensitive (optional) True for case sensitive comparison.
     * @return {Number} The matched index or -1
     */
    findIndex : function(property, value, start, anyMatch, caseSensitive){
        if(Ext.isEmpty(value, false)){
            return -1;
        }
        value = this.createValueMatcher(value, anyMatch, caseSensitive);
        return this.findIndexBy(function(o){
            return o && value.test(o[property]);
        }, null, start);
    },

    /**
     * Find the index of the first matching object in this collection by a function.
     * If the function returns <i>true</i> it is considered a match.
     * @param {Function} fn The function to be called, it will receive the args o (the object), k (the key).
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this MixedCollection.
     * @param {Number} start (optional) The index to start searching at (defaults to 0).
     * @return {Number} The matched index or -1
     */
    findIndexBy : function(fn, scope, start){
        var k = this.keys, it = this.items;
        for(var i = (start||0), len = it.length; i < len; i++){
            if(fn.call(scope||this, it[i], k[i])){
                return i;
            }
        }
        return -1;
    },

    /**
     * @private
     * Returns a filter function used to test a the given property's value. Defers most of the work to createValueMatcher
     * @param {String} property The property to create the filter function for
     * @param {String/RegExp} value The string/regex to compare the property value to
     * @param {Boolean} anyMatch True if we don't care if the filter value is not the full value (defaults to false)
     * @param {Boolean} caseSensitive True to create a case-sensitive regex (defaults to false)
     * @param {Boolean} exactMatch True to force exact match (^ and $ characters added to the regex). Defaults to false. Ignored if anyMatch is true.
     */
    createFilterFn : function(property, value, anyMatch, caseSensitive, exactMatch) {
        if (Ext.isEmpty(value, false)) {
            return false;
        }
        value = this.createValueMatcher(value, anyMatch, caseSensitive, exactMatch);
        return function(r) {
            return value.test(r[property]);
        };
    },

    /**
     * @private
     * Given an array of filter functions (each with optional scope), constructs and returns a single function that returns
     * the result of all of the filters ANDed together
     * @param {Array} filters The array of filter objects (each object should contain an 'fn' and optional scope)
     * @return {Function} The multiple filter function
     */
    createMultipleFilterFn: function(filters) {
        return function(record) {
            var isMatch = true;

            for (var i=0, j = filters.length; i < j; i++) {
                var filter = filters[i],
                    fn     = filter.fn,
                    scope  = filter.scope;

                isMatch = isMatch && fn.call(scope, record);

                //break here to avoid unnecessary calculations - if not true here the record is already rejected
                if (isMatch !== true) {
                    break;
                }
            }

            return isMatch;
        };
    },

    /**
     * Returns a regular expression based on the given value and matching options. This is used internally for finding and filtering,
     * and by Ext.data.Store#filter
     * @private
     * @param {String} value The value to create the regex for. This is escaped using Ext.escapeRe
     * @param {Boolean} anyMatch True to allow any match - no regex start/end line anchors will be added. Defaults to false
     * @param {Boolean} caseSensitive True to make the regex case sensitive (adds 'i' switch to regex). Defaults to false.
     * @param {Boolean} exactMatch True to force exact match (^ and $ characters added to the regex). Defaults to false. Ignored if anyMatch is true.
     */
    createValueMatcher : function(value, anyMatch, caseSensitive, exactMatch) {
        if (!value.exec) { // not a regex
            var er = Ext.escapeRe;
            value = String(value);

            if (anyMatch === true) {
                value = er(value);
            } else {
                value = '^' + er(value);
                if (exactMatch === true) {
                    value += '$';
                }
            }
            value = new RegExp(value, caseSensitive ? '' : 'i');
         }
         return value;
    },

    /**
     * Creates a shallow copy of this collection
     * @return {MixedCollection}
     */
    clone : function(){
        var r = new Ext.util.MixedCollection();
        var k = this.keys, it = this.items;
        for (var i = 0, len = it.length; i < len; i++) {
            r.add(k[i], it[i]);
        }
        r.getKey = this.getKey;
        return r;
    }
});
/**
 * This method calls {@link #item item()}.
 * Returns the item associated with the passed key OR index. Key has priority
 * over index.  This is the equivalent of calling {@link #key} first, then if
 * nothing matched calling {@link #itemAt}.
 * @param {String/Number} key The key or index of the item.
 * @return {Object} If the item is found, returns the item.  If the item was
 * not found, returns <tt>undefined</tt>. If an item was found, but is a Class,
 * returns <tt>null</tt>.
 */
Ext.util.MixedCollection.prototype.get = Ext.util.MixedCollection.prototype.item;
/**
 * @class Ext.util.TapRepeater
 * @extends Ext.util.Observable
 *
 * A wrapper class which can be applied to any element. Fires a "tap" event while the
 * mouse is pressed. The interval between firings may be specified in the config but
 * defaults to 20 milliseconds.
 *
 * @constructor
 * @param {Mixed} el The element to listen on
 * @param {Object} config
 */
Ext.util.TapRepeater = Ext.extend(Ext.util.Observable, {

    constructor: function(el, config) {
        this.el = Ext.get(el);

        Ext.apply(this, config);

        this.addEvents(
        /**
         * @event mousedown
         * Fires when the mouse button is depressed.
         * @param {Ext.util.ClickRepeater} this
         * @param {Ext.EventObject} e
         */
        "touchstart",
        /**
         * @event click
         * Fires on a specified interval during the time the element is pressed.
         * @param {Ext.util.ClickRepeater} this
         * @param {Ext.EventObject} e
         */
        "tap",
        /**
         * @event mouseup
         * Fires when the mouse key is released.
         * @param {Ext.util.ClickRepeater} this
         * @param {Ext.EventObject} e
         */
        "touchend"
        );

        this.el.on({
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            scope: this
        });

        if (this.preventDefault || this.stopDefault) {
            this.el.on('tap', this.eventOptions, this);
        }

        Ext.util.TapRepeater.superclass.constructor.call(this);
    },

    interval: 10,
    delay: 250,
    preventDefault: true,
    stopDefault: false,
    timer: 0,

    // @private
    eventOptions: function(e) {
        if (this.preventDefault) {
            e.preventDefault();
        }
        if (this.stopDefault) {
            e.stopEvent();
        }
    },

    // @private
    destroy: function() {
        Ext.destroy(this.el);
        this.purgeListeners();
    },

    // @private
    onTouchStart: function(e) {
        clearTimeout(this.timer);
        if (this.pressClass) {
            this.el.addClass(this.pressClass);
        }
        this.tapStartTime = new Date();

        this.fireEvent("touchstart", this, e);
        this.fireEvent("tap", this, e);

        // Do not honor delay or interval if acceleration wanted.
        if (this.accelerate) {
            this.delay = 400;
        }
        this.timer = this.tap.defer(this.delay || this.interval, this, [e]);
    },

    // @private
    tap: function(e) {
        this.fireEvent("tap", this, e);
        this.timer = this.tap.defer(this.accelerate ? this.easeOutExpo(this.tapStartTime.getElapsed(),
            400,
            -390,
            12000) : this.interval, this, [e]);
    },

    // Easing calculation
    // @private
    easeOutExpo: function(t, b, c, d) {
        return (t == d) ? b + c : c * ( - Math.pow(2, -10 * t / d) + 1) + b;
    },

    // @private
    onTouchEnd: function(e) {
        clearTimeout(this.timer);
        this.el.removeClass(this.pressClass);
        this.fireEvent("touchend", this, e);
    }
});

/**
 * @class Ext.util.Region
 * @extends Object
 *
 * Represents a rectanglular region and provides a number of utility methods
 * to compare regions.
 */
Ext.util.Region = Ext.extend(Object, {
    /**
     * @constructor
     * @param {Number} top Top
     * @param {Number} right Right
     * @param {Number} bottom Bottom
     * @param {Number} left Left
     */
    constructor : function(t, r, b, l) {
        var me = this;
        me.top = t;
        me[1] = t;
        me.right = r;
        me.bottom = b;
        me.left = l;
        me[0] = l;
    },

    /**
     * Checks if this region completely contains the region that is passed in.
     * @param {Ext.util.Region} region
     */
    contains : function(region) {
        var me = this;
        return (region.left >= me.left &&
                region.right <= me.right &&
                region.top >= me.top &&
                region.bottom <= me.bottom);

    },

    /**
     * Checks if this region intersects the region passed in.
     * @param {Ext.util.Region} region
     * @returns {Ext.util.Region/Boolean} Returns the intersected region or false if there is no intersection.
     */
    intersect : function(region) {
        var me = this,
            t = Math.max(me.top, region.top),
            r = Math.min(me.right, region.right),
            b = Math.min(me.bottom, region.bottom),
            l = Math.max(me.left, region.left);

        if (b >= t && r >= l) {
            return new Ext.util.Region(t, r, b, l);
        }
        else {
            return false;
        }
    },

    /**
     * Returns the smallest region that contains the current AND targetRegion.
     * @param {Ext.util.Region} targetRegion
     */
    union : function(region) {
        var me = this,
            t = Math.min(me.top, region.top),
            r = Math.max(me.right, region.right),
            b = Math.max(me.bottom, region.bottom),
            l = Math.min(me.left, region.left);

        return new Ext.util.Region(t, r, b, l);
    },

    /**
     * Modifies the current region to be constrained to the targetRegion.
     * @param {Ext.util.Region} targetRegion
     */
    constrainTo : function(r) {
        var me = this;
        me.top = me.top.constrain(r.top, r.bottom);
        me.bottom = me.bottom.constrain(r.top, r.bottom);
        me.left = me.left.constrain(r.left, r.right);
        me.right = me.right.constrain(r.left, r.right);
        return me;
    },

    /**
     * Modifies the current region to be adjusted by offsets.
     * @param {Number} top top offset
     * @param {Number} right right offset
     * @param {Number} bottom bottom offset
     * @param {Number} left left offset
     */
    adjust : function(t, r, b, l) {
        var me = this;
        me.top += t;
        me.left += l;
        me.right += r;
        me.bottom += b;
        return me;
    }
});

/**
 * @static
 * @param {Mixed} el A string, DomElement or Ext.Element representing an element
 * on the page.
 * @returns {Ext.util.Region} region
 * Retrieves an Ext.util.Region for a particular element.
 */
Ext.util.Region.getRegion = function(el) {
    return Ext.fly(el).getPageBox(true);
};
/**
 * @class Ext.CompositeElement
 * <p>This class encapsulates a <i>collection</i> of DOM elements, providing methods to filter
 * members, or to perform collective actions upon the whole set.</p>
 *
 * Example:<pre><code>
var els = Ext.select("#some-el div.some-class");
// or select directly from an existing element
var el = Ext.get('some-el');
el.select('div.some-class');

els.setWidth(100); // all elements become 100 width
els.hide(true); // all elements fade out and hide
// or
els.setWidth(100).hide(true);
</code>
 */
Ext.CompositeElement = function(els, root) {
    /**
     * <p>The Array of DOM elements which this CompositeElement encapsulates. Read-only.</p>
     * <p>This will not <i>usually</i> be accessed in developers' code, but developers wishing
     * to augment the capabilities of the CompositeElement class may use it when adding
     * methods to the class.</p>
     * <p>For example to add the <code>nextAll</code> method to the class to <b>add</b> all
     * following siblings of selected elements, the code would be</p><code><pre>
Ext.override(Ext.CompositeElement, {
    nextAll: function() {
        var els = this.elements, i, l = els.length, n, r = [], ri = -1;

//      Loop through all elements in this Composite, accumulating
//      an Array of all siblings.
        for (i = 0; i < l; i++) {
            for (n = els[i].nextSibling; n; n = n.nextSibling) {
                r[++ri] = n;
            }
        }

//      Add all found siblings to this Composite
        return this.add(r);
    }
});</pre></code>
     * @type Array
     * @property elements
     */
    this.elements = [];
    this.add(els, root);
    this.el = new Ext.Element.Flyweight();
};

Ext.CompositeElement.prototype = {
    isComposite: true,

    // private
    getElement : function(el) {
        // Set the shared flyweight dom property to the current element
        var e = this.el;
        e.dom = el;
        e.id = el.id;
        return e;
    },

    // private
    transformElement : function(el) {
        return Ext.getDom(el);
    },

    /**
     * Returns the number of elements in this Composite.
     * @return Number
     */
    getCount : function() {
        return this.elements.length;
    },

    /**
     * Adds elements to this Composite object.
     * @param {Mixed} els Either an Array of DOM elements to add, or another Composite object who's elements should be added.
     * @return {CompositeElement} This Composite object.
     */
    add : function(els, root) {
        var me = this,
            elements = me.elements;
        if (!els) {
            return this;
        }
        if (typeof els == 'string') {
            els = Ext.Element.selectorFunction(els, root);
        }
        else if (els.isComposite) {
            els = els.elements;
        }
        else if (!Ext.isIterable(els)) {
            els = [els];
        }

        for (var i = 0, len = els.length; i < len; ++i) {
            elements.push(me.transformElement(els[i]));
        }

        return me;
    },

    invoke : function(fn, args) {
        var me = this,
            els = me.elements,
            len = els.length,
            e,
            i;

        for (i = 0; i < len; i++) {
            e = els[i];
            if (e) {
                Ext.Element.prototype[fn].apply(me.getElement(e), args);
            }
        }
        return me;
    },
    /**
     * Returns a flyweight Element of the dom element object at the specified index
     * @param {Number} index
     * @return {Ext.Element}
     */
    item : function(index) {
        var me = this,
            el = me.elements[index],
            out = null;

        if (el){
            out = me.getElement(el);
        }
        return out;
    },

    // fixes scope with flyweight
    addListener : function(eventName, handler, scope, opt) {
        var els = this.elements,
            len = els.length,
            i, e;

        for (i = 0; i<len; i++) {
            e = els[i];
            if (e) {
                Ext.EventManager.on(e, eventName, handler, scope || e, opt);
            }
        }
        return this;
    },

    /**
     * <p>Calls the passed function for each element in this composite.</p>
     * @param {Function} fn The function to call. The function is passed the following parameters:<ul>
     * <li><b>el</b> : Element<div class="sub-desc">The current Element in the iteration.
     * <b>This is the flyweight (shared) Ext.Element instance, so if you require a
     * a reference to the dom node, use el.dom.</b></div></li>
     * <li><b>c</b> : Composite<div class="sub-desc">This Composite object.</div></li>
     * <li><b>idx</b> : Number<div class="sub-desc">The zero-based index in the iteration.</div></li>
     * </ul>
     * @param {Object} scope (optional) The scope (<i>this</i> reference) in which the function is executed. (defaults to the Element)
     * @return {CompositeElement} this
     */
    each : function(fn, scope) {
        var me = this,
            els = me.elements,
            len = els.length,
            i, e;

        for (i = 0; i<len; i++) {
            e = els[i];
            if (e) {
                e = this.getElement(e);
                if(fn.call(scope || e, e, me, i)){
                    break;
                }
            }
        }
        return me;
    },

    /**
    * Clears this Composite and adds the elements passed.
    * @param {Mixed} els Either an array of DOM elements, or another Composite from which to fill this Composite.
    * @return {CompositeElement} this
    */
    fill : function(els) {
        var me = this;
        me.elements = [];
        me.add(els);
        return me;
    },

    /**
     * Filters this composite to only elements that match the passed selector.
     * @param {String/Function} selector A string CSS selector or a comparison function.
     * The comparison function will be called with the following arguments:<ul>
     * <li><code>el</code> : Ext.Element<div class="sub-desc">The current DOM element.</div></li>
     * <li><code>index</code> : Number<div class="sub-desc">The current index within the collection.</div></li>
     * </ul>
     * @return {CompositeElement} this
     */
    filter : function(selector) {
        var els = [],
            me = this,
            elements = me.elements,
            fn = Ext.isFunction(selector) ? selector
                : function(el){
                    return el.is(selector);
                };

        me.each(function(el, self, i){
            if(fn(el, i) !== false){
                els[els.length] = me.transformElement(el);
            }
        });
        me.elements = els;
        return me;
    },

    /**
     * Returns the first Element
     * @return {Ext.Element}
     */
    first : function() {
        return this.item(0);
    },

    /**
     * Returns the last Element
     * @return {Ext.Element}
     */
    last : function() {
        return this.item(this.getCount()-1);
    },

    /**
     * Returns true if this composite contains the passed element
     * @param {Mixed} el The id of an element, or an Ext.Element, or an HtmlElement to find within the composite collection.
     * @return Boolean
     */
    contains : function(el) {
        return this.indexOf(el) != -1;
    },

    /**
     * Find the index of the passed element within the composite collection.
     * @param {Mixed} el The id of an element, or an Ext.Element, or an HtmlElement to find within the composite collection.
     * @return Number The index of the passed Ext.Element in the composite collection, or -1 if not found.
     */
    indexOf : function(el) {
        return this.elements.indexOf(this.transformElement(el));
    },

    /**
     * Removes all elements.
     */
    clear : function() {
        this.elements = [];
    }
};

Ext.CompositeElement.prototype.on = Ext.CompositeElement.prototype.addListener;

(function(){
var fnName,
    ElProto = Ext.Element.prototype,
    CelProto = Ext.CompositeElement.prototype;

for (fnName in ElProto) {
    if (Ext.isFunction(ElProto[fnName])) {
        (function(fnName) {
            CelProto[fnName] = CelProto[fnName] || function(){
                return this.invoke(fnName, arguments);
            };
        }).call(CelProto, fnName);

    }
}
})();

if(Ext.DomQuery) {
    Ext.Element.selectorFunction = Ext.DomQuery.select;
}

/**
 * Selects elements based on the passed CSS selector to enable {@link Ext.Element Element} methods
 * to be applied to many related elements in one statement through the returned {@link Ext.CompositeElement CompositeElement} or
 * {@link Ext.CompositeElement CompositeElement} object.
 * @param {String/Array} selector The CSS selector or an array of elements
 * @param {HTMLElement/String} root (optional) The root element of the query or id of the root
 * @return {CompositeElement}
 * @member Ext.Element
 * @method select
 */
Ext.Element.select = function(selector, root, composite) {
    var els;
    composite = (composite === false) ? false : true;
    if (typeof selector == "string") {
        els = Ext.Element.selectorFunction(selector, root);
    } else if (selector.length !== undefined) {
        els = selector;
    } else {
        throw "Invalid selector";
    }
    return composite ? new Ext.CompositeElement(els) : els;
};
/**
 * Selects elements based on the passed CSS selector to enable {@link Ext.Element Element} methods
 * to be applied to many related elements in one statement through the returned {@link Ext.CompositeElement CompositeElement} or
 * {@link Ext.CompositeElement CompositeElement} object.
 * @param {String/Array} selector The CSS selector or an array of elements
 * @param {HTMLElement/String} root (optional) The root element of the query or id of the root
 * @return {CompositeElement}
 * @member Ext
 * @method select
 */
Ext.select = Ext.Element.select;

// Backwards compatibility with desktop
Ext.CompositeElementLite = Ext.CompositeElement;

/**
 * @class Ext.CompositeElementLite
 */
Ext.apply(Ext.CompositeElementLite.prototype, {
    addElements : function(els, root){
        if(!els){
            return this;
        }
        if(typeof els == "string"){
            els = Ext.Element.selectorFunction(els, root);
        }
        var yels = this.elements;
        Ext.each(els, function(e) {
            yels.push(Ext.get(e));
        });
        return this;
    },

    /**
     * Returns the first Element
     * @return {Ext.Element}
     */
    first : function(){
        return this.item(0);
    },

    /**
     * Returns the last Element
     * @return {Ext.Element}
     */
    last : function(){
        return this.item(this.getCount()-1);
    },

    /**
     * Returns true if this composite contains the passed element
     * @param el {Mixed} The id of an element, or an Ext.Element, or an HtmlElement to find within the composite collection.
     * @return Boolean
     */
    contains : function(el){
        return this.indexOf(el) != -1;
    },

    /**
    * Removes the specified element(s).
    * @param {Mixed} el The id of an element, the Element itself, the index of the element in this composite
    * or an array of any of those.
    * @param {Boolean} removeDom (optional) True to also remove the element from the document
    * @return {CompositeElement} this
    */
    removeElement : function(keys, removeDom){
        var me = this,
            els = this.elements,
            el;
        Ext.each(keys, function(val){
            if ((el = (els[val] || els[val = me.indexOf(val)]))) {
                if(removeDom){
                    if(el.dom){
                        el.remove();
                    }else{
                        Ext.removeNode(el);
                    }
                }
                els.splice(val, 1);
            }
        });
        return this;
    },

    /**
    * Replaces the specified element with the passed element.
    * @param {Mixed} el The id of an element, the Element itself, the index of the element in this composite
    * to replace.
    * @param {Mixed} replacement The id of an element or the Element itself.
    * @param {Boolean} domReplace (Optional) True to remove and replace the element in the document too.
    * @return {CompositeElement} this
    */
    replaceElement : function(el, replacement, domReplace){
        var index = !isNaN(el) ? el : this.indexOf(el),
            d;
        if(index > -1){
            replacement = Ext.getDom(replacement);
            if(domReplace){
                d = this.elements[index];
                d.parentNode.insertBefore(replacement, d);
                Ext.removeNode(d);
            }
            this.elements.splice(index, 1, replacement);
        }
        return this;
    }
});

/**
 * @class Ext.DomHelper
 * <p>The DomHelper class provides a layer of abstraction from DOM and transparently supports creating
 * elements via DOM or using HTML fragments. It also has the ability to create HTML fragment templates
 * from your DOM building code.</p>
 *
 * <p><b><u>DomHelper element specification object</u></b></p>
 * <p>A specification object is used when creating elements. Attributes of this object
 * are assumed to be element attributes, except for 4 special attributes:
 * <div class="mdetail-params"><ul>
 * <li><b><tt>tag</tt></b> : <div class="sub-desc">The tag name of the element</div></li>
 * <li><b><tt>children</tt></b> : or <tt>cn</tt><div class="sub-desc">An array of the
 * same kind of element definition objects to be created and appended. These can be nested
 * as deep as you want.</div></li>
 * <li><b><tt>cls</tt></b> : <div class="sub-desc">The class attribute of the element.
 * This will end up being either the "class" attribute on a HTML fragment or className
 * for a DOM node, depending on whether DomHelper is using fragments or DOM.</div></li>
 * <li><b><tt>html</tt></b> : <div class="sub-desc">The innerHTML for the element</div></li>
 * </ul></div></p>
 *
 * <p><b><u>Insertion methods</u></b></p>
 * <p>Commonly used insertion methods:
 * <div class="mdetail-params"><ul>
 * <li><b><tt>{@link #append}</tt></b> : <div class="sub-desc"></div></li>
 * <li><b><tt>{@link #insertBefore}</tt></b> : <div class="sub-desc"></div></li>
 * <li><b><tt>{@link #insertAfter}</tt></b> : <div class="sub-desc"></div></li>
 * <li><b><tt>{@link #overwrite}</tt></b> : <div class="sub-desc"></div></li>
 * <li><b><tt>{@link #createTemplate}</tt></b> : <div class="sub-desc"></div></li>
 * <li><b><tt>{@link #insertHtml}</tt></b> : <div class="sub-desc"></div></li>
 * </ul></div></p>
 *
 * <p><b><u>Example</u></b></p>
 * <p>This is an example, where an unordered list with 3 children items is appended to an existing
 * element with id <tt>'my-div'</tt>:<br>
 <pre><code>
var dh = Ext.DomHelper; // create shorthand alias
// specification object
var spec = {
    id: 'my-ul',
    tag: 'ul',
    cls: 'my-list',
    // append children after creating
    children: [     // may also specify 'cn' instead of 'children'
        {tag: 'li', id: 'item0', html: 'List Item 0'},
        {tag: 'li', id: 'item1', html: 'List Item 1'},
        {tag: 'li', id: 'item2', html: 'List Item 2'}
    ]
};
var list = dh.append(
    'my-div', // the context element 'my-div' can either be the id or the actual node
    spec      // the specification object
);
 </code></pre></p>
 * <p>Element creation specification parameters in this class may also be passed as an Array of
 * specification objects. This can be used to insert multiple sibling nodes into an existing
 * container very efficiently. For example, to add more list items to the example above:<pre><code>
dh.append('my-ul', [
    {tag: 'li', id: 'item3', html: 'List Item 3'},
    {tag: 'li', id: 'item4', html: 'List Item 4'}
]);
 * </code></pre></p>
 *
 * <p><b><u>Templating</u></b></p>
 * <p>The real power is in the built-in templating. Instead of creating or appending any elements,
 * <tt>{@link #createTemplate}</tt> returns a Template object which can be used over and over to
 * insert new elements. Revisiting the example above, we could utilize templating this time:
 * <pre><code>
// create the node
var list = dh.append('my-div', {tag: 'ul', cls: 'my-list'});
// get template
var tpl = dh.createTemplate({tag: 'li', id: 'item{0}', html: 'List Item {0}'});

for(var i = 0; i < 5, i++){
    tpl.append(list, [i]); // use template to append to the actual node
}
 * </code></pre></p>
 * <p>An example using a template:<pre><code>
var html = '<a id="{0}" href="{1}" class="nav">{2}</a>';

var tpl = new Ext.DomHelper.createTemplate(html);
tpl.append('blog-roll', ['link1', 'http://www.tommymaintz.com/', "Tommy&#39;s Site"]);
tpl.append('blog-roll', ['link2', 'http://www.avins.org/', "Jamie&#39;s Site"]);
 * </code></pre></p>
 *
 * <p>The same example using named parameters:<pre><code>
var html = '<a id="{id}" href="{url}" class="nav">{text}</a>';

var tpl = new Ext.DomHelper.createTemplate(html);
tpl.append('blog-roll', {
    id: 'link1',
    url: 'http://www.tommymaintz.com/',
    text: "Tommy&#39;s Site"
});
tpl.append('blog-roll', {
    id: 'link2',
    url: 'http://www.avins.org/',
    text: "Jamie&#39;s Site"
});
 * </code></pre></p>
 *
 * <p><b><u>Compiling Templates</u></b></p>
 * <p>Templates are applied using regular expressions. The performance is great, but if
 * you are adding a bunch of DOM elements using the same template, you can increase
 * performance even further by {@link Ext.Template#compile "compiling"} the template.
 * The way "{@link Ext.Template#compile compile()}" works is the template is parsed and
 * broken up at the different variable points and a dynamic function is created and eval'ed.
 * The generated function performs string concatenation of these parts and the passed
 * variables instead of using regular expressions.
 * <pre><code>
var html = '<a id="{id}" href="{url}" class="nav">{text}</a>';

var tpl = new Ext.DomHelper.createTemplate(html);
tpl.compile();

//... use template like normal
 * </code></pre></p>
 *
 * <p><b><u>Performance Boost</u></b></p>
 * <p>DomHelper will transparently create HTML fragments when it can. Using HTML fragments instead
 * of DOM can significantly boost performance.</p>
 * <p>Element creation specification parameters may also be strings. If {@link #useDom} is <tt>false</tt>,
 * then the string is used as innerHTML. If {@link #useDom} is <tt>true</tt>, a string specification
 * results in the creation of a text node. Usage:</p>
 * <pre><code>
Ext.DomHelper.useDom = true; // force it to use DOM; reduces performance
 * </code></pre>
 * @singleton
 */
Ext.DomHelper = {
    emptyTags : /^(?:br|frame|hr|img|input|link|meta|range|spacer|wbr|area|param|col)$/i,
    confRe : /tag|children|cn|html$/i,
    endRe : /end/i,

    /**
     * Returns the markup for the passed Element(s) config.
     * @param {Object} o The DOM object spec (and children)
     * @return {String}
     */
    markup : function(o) {
        var b = '',
            attr,
            val,
            key,
            keyVal,
            cn;

        if (typeof o == "string") {
            b = o;
        }
        else if (Ext.isArray(o)) {
            for (var i=0; i < o.length; i++) {
                if (o[i]) {
                    b += this.markup(o[i]);
                }
            };
        }
        else {
            b += '<' + (o.tag = o.tag || 'div');
            for (attr in o) {
                val = o[attr];
                if (!this.confRe.test(attr)) {
                    if (typeof val == "object") {
                        b += ' ' + attr + '="';
                        for (key in val) {
                            b += key + ':' + val[key] + ';';
                        };
                        b += '"';
                    }
                    else {
                        b += ' ' + ({cls : 'class', htmlFor : 'for'}[attr] || attr) + '="' + val + '"';
                    }
                }
            };

            // Now either just close the tag or try to add children and close the tag.
            if (this.emptyTags.test(o.tag)) {
                b += '/>';
            }
            else {
                b += '>';
                if ((cn = o.children || o.cn)) {
                    b += this.markup(cn);
                }
                else if (o.html) {
                    b += o.html;
                }
                b += '</' + o.tag + '>';
            }
        }
        return b;
    },

    /**
     * Applies a style specification to an element.
     * @param {String/HTMLElement} el The element to apply styles to
     * @param {String/Object/Function} styles A style specification string e.g. 'width:100px', or object in the form {width:'100px'}, or
     * a function which returns such a specification.
     */
    applyStyles : function(el, styles) {
        if (styles) {
            var i = 0,
                len,
                style;

            el = Ext.fly(el);
            if (typeof styles == 'function') {
                styles = styles.call();
            }
            if (typeof styles == 'string'){
                styles = styles.trim().split(/\s*(?::|;)\s*/);
                for(len = styles.length; i < len;){
                    el.setStyle(styles[i++], styles[i++]);
                }
            } else if (Ext.isObject(styles)) {
                el.setStyle(styles);
            }
        }
    },

    /**
     * Inserts an HTML fragment into the DOM.
     * @param {String} where Where to insert the html in relation to el - beforeBegin, afterBegin, beforeEnd, afterEnd.
     * @param {HTMLElement} el The context element
     * @param {String} html The HTML fragment
     * @return {HTMLElement} The new node
     */
    insertHtml : function(where, el, html) {
        var hash = {},
            hashVal,
            setStart,
            range,
            frag,
            rangeEl,
            rs;

        where = where.toLowerCase();

        // add these here because they are used in both branches of the condition.
        hash['beforebegin'] = ['BeforeBegin', 'previousSibling'];
        hash['afterend'] = ['AfterEnd', 'nextSibling'];

        range = el.ownerDocument.createRange();
        setStart = 'setStart' + (this.endRe.test(where) ? 'After' : 'Before');
        if (hash[where]) {
            range[setStart](el);
            frag = range.createContextualFragment(html);
            el.parentNode.insertBefore(frag, where == 'beforebegin' ? el : el.nextSibling);
            return el[(where == 'beforebegin' ? 'previous' : 'next') + 'Sibling'];
        }
        else {
            rangeEl = (where == 'afterbegin' ? 'first' : 'last') + 'Child';
            if (el.firstChild) {
                range[setStart](el[rangeEl]);
                frag = range.createContextualFragment(html);
                if (where == 'afterbegin') {
                    el.insertBefore(frag, el.firstChild);
                }
                else {
                    el.appendChild(frag);
                }
            }
            else {
                el.innerHTML = html;
            }
            return el[rangeEl];
        }

        throw 'Illegal insertion point -> "' + where + '"';
    },

    /**
     * Creates new DOM element(s) and inserts them before el.
     * @param {Mixed} el The context element
     * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
     * @param {Boolean} returnElement (optional) true to return a Ext.Element
     * @return {HTMLElement/Ext.Element} The new node
     */
    insertBefore : function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'beforebegin');
    },

    /**
     * Creates new DOM element(s) and inserts them after el.
     * @param {Mixed} el The context element
     * @param {Object} o The DOM object spec (and children)
     * @param {Boolean} returnElement (optional) true to return a Ext.Element
     * @return {HTMLElement/Ext.Element} The new node
     */
    insertAfter : function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'afterend', 'nextSibling');
    },

    /**
     * Creates new DOM element(s) and inserts them as the first child of el.
     * @param {Mixed} el The context element
     * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
     * @param {Boolean} returnElement (optional) true to return a Ext.Element
     * @return {HTMLElement/Ext.Element} The new node
     */
    insertFirst : function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'afterbegin', 'firstChild');
    },

    /**
     * Creates new DOM element(s) and appends them to el.
     * @param {Mixed} el The context element
     * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
     * @param {Boolean} returnElement (optional) true to return a Ext.Element
     * @return {HTMLElement/Ext.Element} The new node
     */
    append : function(el, o, returnElement) {
        return this.doInsert(el, o, returnElement, 'beforeend', '', true);
    },

    /**
     * Creates new DOM element(s) and overwrites the contents of el with them.
     * @param {Mixed} el The context element
     * @param {Object/String} o The DOM object spec (and children) or raw HTML blob
     * @param {Boolean} returnElement (optional) true to return a Ext.Element
     * @return {HTMLElement/Ext.Element} The new node
     */
    overwrite : function(el, o, returnElement) {
        el = Ext.getDom(el);
        el.innerHTML = this.markup(o);
        return returnElement ? Ext.get(el.firstChild) : el.firstChild;
    },

    doInsert : function(el, o, returnElement, pos, sibling, append) {
        var newNode = this.insertHtml(pos, Ext.getDom(el), this.markup(o));
        return returnElement ? Ext.get(newNode, true) : newNode;
    }
};

/**
 * @class Ext.DomQuery
 * Provides functionality to select elements on the page based on a CSS selector.
 *
<p>
All selectors, attribute filters and pseudos below can be combined infinitely in any order. For example "div.foo:nth-child(odd)[@foo=bar].bar:first" would be a perfectly valid selector.
</p>
<h4>Element Selectors:</h4>
<ul class="list">
    <li> <b>*</b> any element</li>
    <li> <b>E</b> an element with the tag E</li>
    <li> <b>E F</b> All descendent elements of E that have the tag F</li>
    <li> <b>E > F</b> or <b>E/F</b> all direct children elements of E that have the tag F</li>
    <li> <b>E + F</b> all elements with the tag F that are immediately preceded by an element with the tag E</li>
    <li> <b>E ~ F</b> all elements with the tag F that are preceded by a sibling element with the tag E</li>
</ul>
<h4>Attribute Selectors:</h4>
<p>The use of &#64; and quotes are optional. For example, div[&#64;foo='bar'] is also a valid attribute selector.</p>
<ul class="list">
    <li> <b>E[foo]</b> has an attribute "foo"</li>
    <li> <b>E[foo=bar]</b> has an attribute "foo" that equals "bar"</li>
    <li> <b>E[foo^=bar]</b> has an attribute "foo" that starts with "bar"</li>
    <li> <b>E[foo$=bar]</b> has an attribute "foo" that ends with "bar"</li>
    <li> <b>E[foo*=bar]</b> has an attribute "foo" that contains the substring "bar"</li>
    <li> <b>E[foo%=2]</b> has an attribute "foo" that is evenly divisible by 2</li>
    <li> <b>E[foo!=bar]</b> has an attribute "foo" that does not equal "bar"</li>
</ul>
<h4>Pseudo Classes:</h4>
<ul class="list">
    <li> <b>E:first-child</b> E is the first child of its parent</li>
    <li> <b>E:last-child</b> E is the last child of its parent</li>
    <li> <b>E:nth-child(<i>n</i>)</b> E is the <i>n</i>th child of its parent (1 based as per the spec)</li>
    <li> <b>E:nth-child(odd)</b> E is an odd child of its parent</li>
    <li> <b>E:nth-child(even)</b> E is an even child of its parent</li>
    <li> <b>E:only-child</b> E is the only child of its parent</li>
    <li> <b>E:checked</b> E is an element that is has a checked attribute that is true (e.g. a radio or checkbox) </li>
    <li> <b>E:first</b> the first E in the resultset</li>
    <li> <b>E:last</b> the last E in the resultset</li>
    <li> <b>E:nth(<i>n</i>)</b> the <i>n</i>th E in the resultset (1 based)</li>
    <li> <b>E:odd</b> shortcut for :nth-child(odd)</li>
    <li> <b>E:even</b> shortcut for :nth-child(even)</li>
    <li> <b>E:contains(foo)</b> E's innerHTML contains the substring "foo"</li>
    <li> <b>E:nodeValue(foo)</b> E contains a textNode with a nodeValue that equals "foo"</li>
    <li> <b>E:not(S)</b> an E element that does not match simple selector S</li>
    <li> <b>E:has(S)</b> an E element that has a descendent that matches simple selector S</li>
    <li> <b>E:next(S)</b> an E element whose next sibling matches simple selector S</li>
    <li> <b>E:prev(S)</b> an E element whose previous sibling matches simple selector S</li>
    <li> <b>E:any(S1|S2|S2)</b> an E element which matches any of the simple selectors S1, S2 or S3//\\</li>
</ul>
<h4>CSS Value Selectors:</h4>
<ul class="list">
    <li> <b>E{display=none}</b> css value "display" that equals "none"</li>
    <li> <b>E{display^=none}</b> css value "display" that starts with "none"</li>
    <li> <b>E{display$=none}</b> css value "display" that ends with "none"</li>
    <li> <b>E{display*=none}</b> css value "display" that contains the substring "none"</li>
    <li> <b>E{display%=2}</b> css value "display" that is evenly divisible by 2</li>
    <li> <b>E{display!=none}</b> css value "display" that does not equal "none"</li>
</ul>
 * @singleton
 */
Ext.DomQuery = {
    /**
     * Selects a group of elements.
     * @param {String} selector The selector/xpath query (can be a comma separated list of selectors)
     * @param {Node/String} root (optional) The start of the query (defaults to document).
     * @return {Array} An Array of DOM elements which match the selector. If there are
     * no matches, and empty Array is returned.
     */
    select : function(q, root) {
        var results = [],
            nodes,
            i,
            j,
            qlen,
            nlen;

        root = root || document;
        if (typeof root == 'string') {
            root = document.getElementById(root);
        }

        q = q.split(",");
        for (i = 0, qlen = q.length; i < qlen; i++) {
            if (typeof q[i] == 'string') {
                nodes = root.querySelectorAll(q[i]);

                for (j = 0, nlen = nodes.length; j < nlen; j++) {
                    results.push(nodes[j]);
                }
            }
        }

        return results;
    },

    /**
     * Selects a single element.
     * @param {String} selector The selector/xpath query
     * @param {Node} root (optional) The start of the query (defaults to document).
     * @return {HtmlElement} The DOM element which matched the selector.
     */
    selectNode : function(q, root) {
        return Ext.DomQuery.select(q, root)[0];
    },

    /**
     * Returns true if the passed element(s) match the passed simple selector (e.g. div.some-class or span:first-child)
     * @param {String/HTMLElement/Array} el An element id, element or array of elements
     * @param {String} selector The simple selector to test
     * @return {Boolean}
     */
    is : function(el, q) {
        if (typeof el == "string") {
            el = document.getElementById(el);
        }
        return Ext.DomQuery.select(q).indexOf(el) !== -1;
    }
};

Ext.Element.selectorFunction = Ext.DomQuery.select;
Ext.query = Ext.DomQuery.select;

/**
 * @class Ext.Anim
 * @extends Object
 *
 * Defines a type of Animation to be used for transitions.
 */
Ext.Anim = Ext.extend(Object, {
    defaultConfig: {
        /**
         * @cfg {Object} from
         */
        from: {},

        /**
         * @cfg {Object} to
         */
        to: {},

        /**
         * @cfg {Number} duration
         * Time in milliseconds for the animation to last. Defaults to 250.
         */
        duration: 250,

        /**
         * @cfg {Number} delay Time to delay before starting the animation. Defaults to 0.
         */
        delay: 0,

        /**
         * @cfg {String} easing
         * Valid values are 'ease', 'linear', ease-in', 'ease-out', 'ease-in-out' or a cubic-bezier curve as defined by CSS
         * Defaults to 'ease-in-out'
         */
        easing: 'ease-in-out',

        /**
         * @cfg {Boolean} autoClear
         * Defaults to true.
         */
        autoClear: true,

        /**
         * @cfg {Boolean} autoReset
         * Defaults to false
         */
        autoReset: false,

        /**
         * @cfg {Boolean} autoShow
         * Defaults to true.
         */
        autoShow: true,

        /**
         * @cfg {Boolean} out
         * Defaults to true
         */
        out: true,

        /**
         * @cfg {String} direction
         * Valid values are 'left', 'right', 'up', 'down' and null. Defaults to null.
         */
        direction: null,

        /**
         * @cfg {Boolean} reverse
         * Defaults to false.
         */
        reverse: false
    },

    /**
     * @cfg {Function} before
     * Code to execute before starting the animation.
     */

    /**
     * @cfg {Scope} scope
     * Scope to run the before function in.
     */

    opposites: {
        'left': 'right',
        'right': 'left',
        'up': 'down',
        'down': 'up'
    },

    constructor: function(config) {
        config = Ext.apply({}, config || {}, this.defaultConfig);
        this.config = config;

        Ext.Anim.superclass.constructor.call(this);

        this.running = [];
    },

    initConfig : function(el, runConfig) {
        var me = this,
            runtime = {},
            config = Ext.apply({}, runConfig || {}, me.config);

        config.el = el = Ext.get(el);

        if (config.reverse && me.opposites[config.direction]) {
            config.direction = me.opposites[config.direction];
        }

        if (me.config.before) {
            me.config.before.call(config, el, config);
        }

        if (runConfig.before) {
            runConfig.before.call(config.scope || config, el, config);
        }

        return config;
    },

    run: function(el, config) {
        el = Ext.get(el);
        config = config || {};

        var me = this,
            style = el.dom.style,
            property,
            after = config.after;

        config = this.initConfig(el, config);

        if (me.running[el.id]) {
            el.un('webkitTransitionEnd', me.onTransitionEnd, me);
        }

        style.webkitTransitionDuration = '0ms';
        for (property in config.from) {
            style[property] = config.from[property];
        }

        setTimeout(function() {
            // If this is a 3d animation we have to set the perspective on the parent
            if (config.is3d === true) {
                el.parent().setStyle({
                    // TODO: Ability to set this with 3dConfig
                    '-webkit-perspective': '1200',
                    '-webkit-transform-style': 'preserve-3d'
                });
            }

            style.webkitTransitionDuration = config.duration + 'ms';
            style.webkitTransitionProperty = 'all';
            style.webkitTransitionTimingFunction = config.easing;

            // Bind our listener that fires after the animation ends
            el.on('webkitTransitionEnd', me.onTransitionEnd, me, {
                single: true,
                config: config,
                after: after
            });

            for (property in config.to) {
                style[property] = config.to[property];
            }
        }, config.delay || 5);

        me.running[el.id] = config;
        return me;
    },

    onTransitionEnd: function(ev, el, o) {
        el = Ext.get(el);

        var style = el.dom.style,
            config = o.config,
            property,
            me = this;

        if (me.config.after) {
            me.config.after.call(config, el, config);
        }

        if (o.after) {
            o.after.call(config.scope || me, el, config);
        }

        if (config.autoClear) {
            for (property in config.to) {
                style[property] = '';
            }
        }

        style.webkitTransitionDuration = null;
        style.webkitTransitionProperty = null;
        style.webkitTransitionTimingFunction = null;

        if (config.is3d) {
            el.parent().setStyle({
                '-webkit-perspective': '',
                '-webkit-transform-style': ''
            });
        }

        delete me.running[el.id];
    }
});

Ext.Anim.seed = 1000;

/**
 * @class Ext.anims
 * @singleton
 *
 * Contains a collection of predefined Ext.Anim's to be used between
 * transitions.
 */
Ext.anims = {
    /**
     * Fade Animation
     */
    fade: new Ext.Anim({
        before: function(el) {
            var fromOpacity = 1,
                toOpacity = 1,
                curZ = el.getStyle('z-index') == 'auto' ? 0 : el.getStyle('z-index'),
                zIndex = curZ;

            if (this.out) {
                toOpacity = 0;
            } else {
                zIndex = curZ + 1;
                fromOpacity = 0;
            }

            this.from = {
                'opacity': fromOpacity,
                'z-index': zIndex
            };
            this.to = {
                'opacity': toOpacity,
                'z-index': zIndex
            };
        }
    }),

    /**
     * Slide Animation
     */
    slide: new Ext.Anim({
        direction: 'left',
        cover: false,

        before: function(el) {
            var curZ = el.getStyle('z-index') == 'auto' ? 0 : el.getStyle('z-index'),
                zIndex = curZ + 1,
                toX = 0,
                toY = 0,
                fromX = 0,
                fromY = 0,
                elH = el.getHeight(),
                elW = el.getWidth();

            if (this.direction == 'left' || this.direction == 'right') {
                if (this.out == true) {
                    toX = -elW;
                }
                else {
                    fromX = elW;
                }
            }
            else if (this.direction == 'up' || this.direction == 'down') {
                if (this.out == true) {
                    toY = -elH;
                }
                else {
                    fromY = elH;
                }
            }

            if (this.direction == 'right' || this.direction == 'down') {
                toY *= -1;
                toX *= -1;
                fromY *= -1;
                fromX *= -1;
            }

            if (this.cover && this.out) {
                toX = 0;
                toY = 0;
                zIndex = curZ;
            }
            else if (this.reveal && !this.out) {
                fromX = 0;
                fromY = 0;
                zIndex = curZ;
            }

            this.from = {
                '-webkit-transform': 'translate3d(' + fromX + 'px, ' + fromY + 'px, 0)',
                'z-index': zIndex,
                'opacity': 0.99
            };
            this.to = {
                '-webkit-transform': 'translate3d(' + toX + 'px, ' + toY + 'px, 0)',
                'z-index': zIndex,
                'opacity': 1
            };
        }
    }),

    /**
     * Flip Animation
     */
    flip: new Ext.Anim({
        is3d: true,
        direction: 'left',
        before: function(el) {
            var rotateProp = 'Y',
                fromScale = 1,
                toScale = 1,
                fromRotate = 0,
                toRotate = 0;

            if (this.out) {
                toRotate = -180;
                toScale = 0.8;
            }
            else {
                fromRotate = 180;
                fromScale = 0.8;
            }

            if (this.direction == 'up' || this.direction == 'down') {
                rotateProp = 'X';
            }

            if (this.direction == 'right' || this.direction == 'down') {
                toRotate *= -1;
                fromRotate *= -1;
            }

            this.from = {
                '-webkit-transform': 'rotate' + rotateProp + '(' + fromRotate + 'deg) scale(' + fromScale + ')',
                '-webkit-backface-visibility': 'hidden'
            };
            this.to = {
                '-webkit-transform': 'rotate' + rotateProp + '(' + toRotate + 'deg) scale(' + toScale + ')',
                '-webkit-backface-visibility': 'hidden'
            };
        }
    }),

    /**
     * Cube Animation
     */
    cube: new Ext.Anim({
        is3d: true,
        direction: 'left',
        style: 'outer',
        before: function(el) {
            var origin = '0% 0%',
                fromRotate = 0,
                toRotate = 0,
                rotateProp = 'Y',
                fromZ = 0,
                toZ = 0,
                fromOpacity = 1,
                toOpacity = 1,
                zDepth,
                elW = el.getWidth(),
                elH = el.getHeight(),
                showTranslateZ = true,
                fromTranslate = ' translateX(0)',
                toTranslate = '';

            if (this.direction == 'left' || this.direction == 'right') {
                if (this.out) {
                    origin = '100% 100%';
                    toZ = elW;
                    toOpacity = 0.5;
                    toRotate = -90;
                } else {
                    origin = '0% 0%';
                    fromZ = elW;
                    fromOpacity = 0.5;
                    fromRotate = 90;
                }
            } else if (this.direction == 'up' || this.direction == 'down') {
                rotateProp = 'X';
                if (this.out) {
                    origin = '100% 100%';
                    toZ = elH;
                    toRotate = 90;
                } else {
                    origin = '0% 0%';
                    fromZ = elH;
                    fromRotate = -90;
                }
            }

            if (this.direction == 'down' || this.direction == 'right') {
                fromRotate *= -1;
                toRotate *= -1;
                origin = (origin == '0% 0%') ? '100% 100%': '0% 0%';
            }

            if (this.style == 'inner') {
                fromZ *= -1;
                toZ *= -1;
                fromRotate *= -1;
                toRotate *= -1;

                if (!this.out) {
                    toTranslate = ' translateX(0px)';
                    origin = '0% 50%';
                } else {
                    toTranslate = fromTranslate;
                    origin = '100% 50%';
                }
            }

            this.from = {
                '-webkit-transform': 'rotate' + rotateProp + '(' + fromRotate + 'deg)' + (showTranslateZ ? ' translateZ(' + fromZ + 'px)': '') + fromTranslate,
                '-webkit-transform-origin': origin
            };
            this.to = {
                '-webkit-transform': 'rotate' + rotateProp + '(' + toRotate + 'deg) translateZ(' + toZ + 'px)' + toTranslate,
                '-webkit-transform-origin': origin
            };
        },
        duration: 250
    }),

    /**
     * Pop Animation
     */
    pop: new Ext.Anim({
        scaleOnExit: false,
        before: function(el) {
            var fromScale = 1,
                toScale = 1,
                fromOpacity = 1,
                toOpacity = 1,
                curZ = el.getStyle('z-index') == 'auto' ? 0 : el.getStyle('z-index'),
                fromZ = curZ,
                toZ = curZ;

            if (!this.out) {
                fromScale = .01;
                fromZ = curZ + 1;
                toZ = curZ + 1;
                fromOpacity = 0;
            }
            else {
                if (this.scaleOnExit) {
                    toScale = .01
                    toOpacity = 0;
                } else {
                    toOpacity = 0.8;
                }
            }

            this.from = {
                '-webkit-transform': 'scale(' + fromScale + ')',
                '-webkit-transform-origin': '50% 50%',
                'opacity': fromOpacity,
                'z-index': fromZ
            };

            this.to = {
                '-webkit-transform': 'scale(' + toScale + ')',
                '-webkit-transform-origin': '50% 50%',
                'opacity': toOpacity,
                'z-index': toZ
            };
        }
    }),

    /**
     * Wipe Animation.
     * <p>Because of the amount of calculations involved, this animation is best used on small display
     * changes or specifically for phone environments. Does not currently accept any parameters.</p>
     */
    wipe: new Ext.Anim({
        before: function(el) {
            var curZ = el.getStyle('z-index'),
                mask = '',
                toSize = '100%',
                fromSize = '100%';

            if (!this.out) {
                zindex = curZ + 1;
                mask = '-webkit-gradient(linear, left bottom, right bottom, from(transparent), to(#000), color-stop(66%, #000), color-stop(33%, transparent))';
                toSize = el.getHeight() * 100 + 'px';
                fromSize = el.getHeight();

                this.from = {
                    '-webkit-mask-image': mask,
                    '-webkit-mask-size': el.getWidth() * 3 + 'px ' + el.getHeight() + 'px',
                    'z-index': zIndex,
                    '-webkit-mask-position-x': 0
                };
                this.to = {
                    '-webkit-mask-image': mask,
                    '-webkit-mask-size': el.getWidth() * 3 + 'px ' + el.getHeight() + 'px',
                    'z-index': zIndex,
                    '-webkit-mask-position-x': -el.getWidth() * 2 + 'px'
                };
            }
        },
        duration: 500
    })
};

/*
    http://www.JSON.org/json2.js
    2010-03-20

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

/**
 * @class Ext.util.JSON
 * Modified version of Douglas Crockford"s json.js that doesn"t
 * mess with the Object prototype
 * http://www.json.org/js.html
 * @singleton
 */
Ext.util.JSON = {
    encode : function(o) {
        return JSON.stringify(o);
    },

    decode : function(s) {
        return JSON.parse(s);
    }
};

/**
 * Shorthand for {@link Ext.util.JSON#encode}
 * @param {Mixed} o The variable to encode
 * @return {String} The JSON string
 * @member Ext
 * @method encode
 */
Ext.encode = Ext.util.JSON.encode;
/**
 * Shorthand for {@link Ext.util.JSON#decode}
 * @param {String} json The JSON string
 * @param {Boolean} safe (optional) Whether to return null or throw an exception if the JSON is invalid.
 * @return {Object} The resulting object
 * @member Ext
 * @method decode
 */
Ext.decode = Ext.util.JSON.decode;
/**
 * @class Ext.util.JSONP
 *
 * Provides functionality to make cross-domain requests with JSONP (JSON with Padding).
 * http://en.wikipedia.org/wiki/JSON#JSONP
 * <p>
 * <b>Note that if you are retrieving data from a page that is in a domain that is NOT the same as the originating domain
 * of the running page, you must use this class, because of the same origin policy.</b><br>
 * <p>
 * The content passed back from a server resource requested by a JSONP request<b>must</b> be executable JavaScript
 * source code because it is used as the source inside a &lt;script> tag.<br>
 * <p>
 * In order for the browser to process the returned data, the server must wrap the data object
 * with a call to a callback function, the name of which is passed as a parameter callbackKey
 * Below is a Java example for a servlet which returns data for either a ScriptTagProxy, or an HttpProxy
 * depending on whether the callback name was passed:
 * <p>
 * <pre><code>
boolean scriptTag = false;
String cb = request.getParameter("callback");
if (cb != null) {
    scriptTag = true;
    response.setContentType("text/javascript");
} else {
    response.setContentType("application/x-json");
}
Writer out = response.getWriter();
if (scriptTag) {
    out.write(cb + "(");
}
out.print(dataBlock.toJsonString());
if (scriptTag) {
    out.write(");");
}
</code></pre>
 * <p>Below is a PHP example to do the same thing:</p><pre><code>
$callback = $_REQUEST['callback'];

// Create the output object.
$output = array('a' => 'Apple', 'b' => 'Banana');

//start output
if ($callback) {
    header('Content-Type: text/javascript');
    echo $callback . '(' . json_encode($output) . ');';
} else {
    header('Content-Type: application/x-json');
    echo json_encode($output);
}
</code></pre>
 * <p>Below is the ASP.Net code to do the same thing:</p><pre><code>
String jsonString = "{success: true}";
String cb = Request.Params.Get("callback");
String responseString = "";
if (!String.IsNullOrEmpty(cb)) {
    responseString = cb + "(" + jsonString + ")";
} else {
    responseString = jsonString;
}
Response.Write(responseString);
</code></pre>
 * @singleton
 */
Ext.util.JSONP = {

    /**
     * Read-only queue
     * @type Array
     */
    queue: [],

    /**
     * Read-only current executing request
     * @type Object
     */
    current: null,

    /**
     * Make a cross-domain request using JSONP.
     * @param {Object} config
     * Valid configurations are:
     * <ul>
     *  <li>url - {String} - Url to request data from. (required) </li>
     *  <li>params - {Object} - A set of key/value pairs to be url encoded and passed as GET parameters in the request.</li>
     *  <li>callbackKey - {String} - Key specified by the server-side provider.</li>
     *  <li>callback - {Function} - Will be passed a single argument of the result of the request.</li>
     *  <li>scope - {Scope} - Scope to execute your callback in.</li>
     * </ul>
     */
    request : function(o) {
        o = o || {};
        if (!o.url) {
            return;
        }

        var me = this;
        o.params = o.params || {};
        if (o.callbackKey) {
            o.params[o.callbackKey] = 'Ext.util.JSONP.callback';
        }
        var params = Ext.urlEncode(o.params);

        var script = document.createElement('script');
        script.type = 'text/javascript';

        this.queue.push({
            url: o.url,
            script: script,
            callback: o.callback || function(){},
            scope: o.scope || window,
            params: params || null
        });

        if (!this.current) {
            this.next();
        }
    },

    // private
    next : function() {
        this.current = null;
        if (this.queue.length) {
            this.current = this.queue.shift();
            this.current.script.src = this.current.url + '?' + this.current.params;
            document.getElementsByTagName('head')[0].appendChild(this.current.script);
        }
    },

    // @private
    callback: function(json) {
        this.current.callback.call(this.current.scope, json);
        document.getElementsByTagName('head')[0].removeChild(this.current.script);
        this.next();
    }
};

/**
 * @class Ext.util.Scroller
 * @extends Ext.util.Observable
 */
Ext.util.Scroller = Ext.extend(Ext.util.Observable, {
    /**
     * @cfg {Boolean/String} bounces
     * Enable bouncing during scrolling past the bounds. Defaults to true. (Which is 'both').
     * You can also specify 'vertical', 'horizontal', or 'both'
     */
    bounces: true,

    momentumResetTime: 200,

    /**
     * @cfg {Number} friction
     * The friction of the scroller.
     * By raising this value the length that momentum scrolls becomes shorter. This value is best kept
     * between 0 and 1. The default value is 0.3
     */
    friction: 0.3,
    acceleration: 20,

    /**
     * @cfg {Boolean} momentum
     * Enable momentum scrolling. Defaults to true.
     */
    momentum: true,

    /**
     * @cfg {Boolean} horizontal
     * Enable horizontal scrolling. Defaults to false.
     */
    horizontal: false,

    /**
     * @cfg {Boolean} vertical
     * Enables vertical scrolling. Defaults to true.
     */
    vertical: true,

    /**
     * @cfg {Boolean/Number/Object} snap
     * Snaps to to a grid after each scroll. Defaults to false.
     * This can either be a number in which case it will be used for both horizontal and vertical snapping.
     * You can also pass an object with x and y properties.
     * By passing true the snapping value will default to 50.
     */
    snap: false,

    /**
     * @cfg {Boolean} scrollbars
     * Turn on a visual ui indicator for scrolling. Defaults to true.
     */
    scrollbars: true,

    /**
     * @cfg {Number} fps
     * The desired fps of the deceleration. Defaults to 80.
     */
    fps: 60,

    /**
     * @cfg {Number} springTension
     * The tension of the spring that is attached to the scroller when it bounces.
     * By raising this value the bounce becomes shorter. This value is best kept
     * between 0 and 1. The default value is 0.2
     */
    springTension: 0.2,

    /**
     * @cfg {String} ui
     * The ui you want to use for this scroller. This affects the scrollbar colors.
     * Can be dark or light. Defaults to dark.
     */
    ui: 'dark',

    /**
     * @cfg {String} scrollToEasing
     * The default easing to use when calling scrollTo with animate true.
     * Defaults to cubic-bezier(0.4, .75, 0.5, .95).
     */
    scrollToEasing : 'cubic-bezier(0.4, .75, 0.5, .95)',
    /**
     * @cfg {Number} scrollToDuration
     * The default duration of the transition when calling scrollTo with animate true.
     * Defaults to 500.
     */
    scrollToDuration: 500,

    /**
     * @constructor
     * @param {Mixed} el An Ext.Element, HTMLElement or string linking to the id
     * of an Element.
     * @param {Object} config
     */
    constructor : function(el, config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event scrollstart
             * @param {Ext.EventObject} e
             * @param {Ext.Scroller} this
             */
            'scrollstart',
            /**
             * @event scrollend
             * @param {Ext.Scroller} this
             */
            'scrollend',
            /**
             * @event touchstart
             * @param {Ext.EventObject} e
             * @param {Ext.Scroller} this
             */
            'touchstart',
            /**
             * @event touchend
             * @param {Ext.EventObject} e
             * @param {Ext.Scroller} this
             */
            'touchend'
        );

        Ext.util.Scroller.superclass.constructor.call(this);

        var scroller = this.scroller = Ext.get(el);

        scroller.addClass('x-scroller');
        this.parent = scroller.parent();
        this.parent.addClass('x-scroller-parent');

        this.offset = {x: 0, y: 0};

        // Set up the touch start event handler.
        // On touch start we will cancel any running transitions
        this.parent.on({
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            scrollstart: this.onScrollStart,
            scrollend: this.onScrollEnd,
            scroll: this.onScroll,
            horizontal: this.horizontal,
            vertical: this.vertical,
            scope: this
        });

        if (this.bounces !== false) {
            var both = this.bounces === 'both' || this.bounces === true,
                horizontal = both || this.bounces === 'horizontal',
                vertical = both || this.bounces === 'vertical';

            this.bounces = {
                horizontal: horizontal,
                vertical: vertical
            };
        }

        this.scrollTask = new Ext.util.DelayedTask(this.handleScrollFrame, this);

        if (this.scrollbars) {
            if (this.horizontal) {
                this.scrollbarX = new Ext.util.Scroller.Scrollbar(this, 'horizontal');
            }

            if (this.vertical) {
                this.scrollbarY = new Ext.util.Scroller.Scrollbar(this, 'vertical');
            }
        }

        this.scroller.on('webkitTransitionEnd', this.onTransitionEnd, this);
    },

    // @private
    onTouchStart : function(e) {
        var scroller = this.scroller,
            style = scroller.dom.style,
            transform;

        if (Ext.platform.isAndroidOS) {
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
        }

        if (e.touches.length > 1) {
            return;
        }

        this.followTouch = e.touch;

        this.omega = 1 - (this.friction / 10);

        if (this.animating) {
            // Stop the current transition.
            if (this.inTransition) {
                style.webkitTransitionDuration = '0ms';
                transform = new WebKitCSSMatrix(window.getComputedStyle(scroller.dom).webkitTransform);
                style.webkitTransform = 'translate3d(' + transform.m41 + 'px, ' + transform.m42 + 'px, 0)';

                this.offset = {
                    x: transform.m41,
                    y: transform.m42
                };
                this.inTransition = false;
            }

            this.scrollTask.cancel();

            this.snapToBounds(false);

            if (this.scrollbarX) {
                this.scrollbarX.stop();
            }
            if (this.scrollbarY) {
                this.scrollbarY.stop();
            }

            this.animating = false;
            this.fireEvent('scrollend', this, this.offset);
        }

        this.updateBounds();
        if (this.momentum) {
            this.resetMomentum(e);
        }

        this.fireEvent('touchstart', e, this);
    },

    // @private
    onScrollStart : function(e, t) {
        // This will prevent the click event to be fired during the scroll operation
        Ext.getDoc().on('click', function(e) {
            e.preventDefault();
        }, this, {single: true});

        if (e.touch != this.followTouch) {
            return;
        }

        if (this.momentum) {
            this.addMomentum(e);
        }

        this.fireEvent('scrollstart', e, this);
    },

    // @private
    onScroll : function(e, t) {
        if (e.touch != this.followTouch) {
            return;
        }

        e.stopPropagation();

        var previousDeltaX = e.previousDeltaX,
            previousDeltaY = e.previousDeltaY,
            newX = this.horizontal ? (this.offset.x + previousDeltaX) : 0,
            newY = this.vertical ? (this.offset.y + previousDeltaY) : 0,
            pos = {x: newX, y: newY},
            boundsPos = this.constrainToBounds(pos);

        // If bounces is enabled, we want to slow down the drag
        if (this.bounces) {
            if (this.bounces.horizontal) {
                if (newX < this.bounds.x) {
                    newX = this.offset.x + (previousDeltaX / 2);
                }
                else if (newX > 0) {
                    newX = this.offset.x + (previousDeltaX / 2);
                }
            }
            else {
                newX = boundsPos.x;
            }
            if (this.bounces.vertical) {
                if (newY < this.bounds.y) {
                    newY = this.offset.y + (previousDeltaY / 2);
                }
                else if (newY > 0) {
                    newY = this.offset.y + (previousDeltaY / 2);
                }
            }
            else {
                newY = boundsPos.y;
            }

            pos = {x: newX, y: newY};
        }
        else {
            pos = boundsPos;
        }

        // Perform the actual scroll
        this._scrollTo(pos);

        if (this.momentum) {
            // Add the current offset as a momentum point
            this.addMomentum(e);
        }
    },

    // @private
    onTouchEnd : function(e, t) {
        if (e.touch != this.followTouch) {
            return;
        }
        this.fireEvent('touchend', e, this);
    },

    // We are going to decelerate based on the momentum
    // @private
    onScrollEnd : function(e, t) {
        if (e.touch != this.followTouch) {
            return;
        }

        // This will clear out all momentum points that arent valid anymore
        if (this.momentum) {
            this.validateMomentum();
            if (this.momentumPoints.length > 1) {
                var momentum = this.momentumPoints,
                    offset = this.offset,
                    bounds = this.bounds,

                    // Get the first and last points that are within the momentum
                    oldestMomentum = momentum.shift(),
                    latestMomentum = momentum.pop(),

                    // The distance we have dragged within this momentum
                    distance = {
                        x: latestMomentum.offset.x - oldestMomentum.offset.x,
                        y: latestMomentum.offset.y - oldestMomentum.offset.y
                    },

                    // Determine the duration of the momentum
                    duration = (latestMomentum.time - oldestMomentum.time),

                    // Determine the deceleration velocity
                    velocity = {
                        x: distance.x / (duration / this.acceleration),
                        y: distance.y / (duration / this.acceleration)
                    };

                this.applyVelocity(velocity);
            }
        }

        // If there is no animation or deceleration going on, then make sure we are within bounds
        if (!this.animating) {
            this.snapToBounds(true);
        }

        // If the snapToBounds call above has been fired we can suddenly be animating again which
        // means the scroll has not ended yet
        if (!this.animating) {
            this.fireEvent('scrollend', this, this.offset);
        }
    },

    // @private
    onTransitionEnd : function() {
        if (this.inTransition) {
            this.scroller.dom.style.webkitTransitionDuration = '0ms';
            this.inTransition = false;
            this.fireEvent('scrollend', this, this.offset);
        }
    },

    /**
     * Scroll to a position with optional animation
     * @param {Object} pos An object with x and y scroll position
     * @param {Mixed} animate Time in ms or an animation config object
     * @param {String} easing Type of easing
     */
    scrollTo : function(pos, animate, easing) {
        this.updateBounds();

        // store the actual position in a private variable
        pos = this.constrainToBounds({x: Math.round(-pos.x), y: Math.round(-pos.y)});

        this.scrollTask.cancel();
        if (animate) {
            this.animating = true;
            this.inTransition = true;

            // We scroll using webkit transforms in combination with the translate property.
            // This is much faster then animating the top and left values
            var style = this.scroller.dom.style;
            style.webkitTransitionTimingFunction = easing || this.scrollToEasing;
            style.webkitTransitionDuration = (typeof animate == 'number') ? (animate + 'ms') : (this.scrollToDuration + 'ms');
            style.webkitTransform = 'translate3d(' + pos.x + 'px, ' + pos.y + 'px, 0)';

            this.offset = pos;

            if (this.scrollbarX) {
                this.scrollbarX.scrollTo(pos, animate, easing || this.scrollToEasing);
            }

            if (this.scrollbarY) {
                this.scrollbarY.scrollTo(pos, animate, easing || this.scrollToEasing);
            }
        }
        else {
            this._scrollTo({x: pos.x, y: pos.y});
        }
    },

    /**
     * @private
     * Handles the actual transformation to scroll
     */
    _scrollTo : function(pos) {
        this.offset = {x: Math.round(pos.x), y: Math.round(pos.y)};

        var style = this.scroller.dom.style;
        style.webkitTransitionDuration = '0ms';
        style.webkitTransform = 'translate3d(' + this.offset.x + 'px, ' + this.offset.y + 'px, 0)';

        if (this.scrollbarX) {
            this.scrollbarX.scrollTo(this.offset);
        }

        if (this.scrollbarY) {
            this.scrollbarY.scrollTo(this.offset);
        }

        this.fireEvent('scroll', this, this.offset);
    },

    /**
     * Handle scroll is being passed a velocity and based on that will decelerate etc.
     * @private
     */
    applyVelocity : function(velocity) {
        velocity = velocity || {x: 0, y: 0};

        var offset = this.offset,
            currentTime = (new Date()).getTime(),
            deceleration = this.deceleration = {
                startTime: currentTime,
                startOffset: {
                    x: offset.x,
                    y: offset.y
                },
                logFriction: Math.log(this.omega),
                startVelocity: velocity
            },
            // Constrain the current offset to the bounds
            pos = this.constrainToBounds(offset),
            bounce = this.bounce = {};

        if (this.bounces && this.bounces.horizontal && pos.x != offset.x) {
            bounce.horizontal = {
                startTime: currentTime - ((1 / this.springTension) * this.acceleration),
                startOffset: pos.x,
                startVelocity: (offset.x - pos.x) * this.springTension * Math.E
            };
            velocity.x = 0;
            this.bouncing = true;
        }

        if (this.bounces && this.bounces.vertical && pos.y != offset.y) {
            bounce.vertical = {
                startTime: currentTime - ((1 / this.springTension) * this.acceleration),
                startOffset: pos.y,
                startVelocity: (offset.y - pos.y) * this.springTension * Math.E
            };
            velocity.y = 0;
            this.bouncing = true;
        }

        this.animating = true;
        this.decelerating = true;
        this.scrollTask.delay(0);
    },

    // @private
    handleScrollFrame : function() {
        var deceleration = this.deceleration,
            bounce = this.bounce = this.bounce || {},
            offset = this.offset,

            currentTime = (new Date()).getTime(),
            deltaTime = (currentTime - deceleration.startTime),
            powFriction = Math.pow(this.omega, deltaTime / this.acceleration),

            currentVelocity = {
                x: deceleration.startVelocity.x * powFriction,
                y: deceleration.startVelocity.y * powFriction
            },

            newPos = {x: offset.x, y: offset.y},
            deltaOffset = {},
            powTime, startOffset, boundsPos;

        if (Math.abs(currentVelocity.x) < 1 && Math.abs(currentVelocity.y) < 1) {
            this.decelerating = false;
        }

        if (!bounce.horizontal && Math.abs(currentVelocity.x) >= 1) {
            deltaOffset.x = (
                (deceleration.startVelocity.x / deceleration.logFriction) -
                (deceleration.startVelocity.x * (powFriction / deceleration.logFriction))
            );
            newPos.x = deceleration.startOffset.x - deltaOffset.x;
        }

        if (!bounce.vertical && Math.abs(currentVelocity.y) >= 1) {
            deltaOffset.y = (
                (deceleration.startVelocity.y / deceleration.logFriction) -
                (deceleration.startVelocity.y * (powFriction / deceleration.logFriction))
            );
            newPos.y = deceleration.startOffset.y - deltaOffset.y;
        }

        boundsPos = this.constrainToBounds(newPos);

        if (boundsPos.x != newPos.x) {
            if (this.bounces && this.bounces.horizontal) {
                if (!bounce.horizontal) {
                    bounce.horizontal = {
                        startTime: currentTime,
                        startOffset: boundsPos.x,
                        startVelocity: currentVelocity.x
                    };
                    this.bouncing = true;
                }
            }
            else {
                newPos.x = boundsPos.x;
            }
            deceleration.startVelocity.x = 0;
        }

        if (boundsPos.y != newPos.y) {
            if (this.bounces && this.bounces.vertical) {
                if (!bounce.vertical) {
                    bounce.vertical = {
                        startTime: currentTime,
                        startOffset: boundsPos.y,
                        startVelocity: currentVelocity.y
                    };
                    this.bouncing = true;
                }
            }
            else {
                newPos.y = boundsPos.y;
            }
            deceleration.startVelocity.y = 0;
        }

        if (bounce.horizontal && bounce.horizontal.startTime != currentTime) {
            deltaTime = (currentTime - bounce.horizontal.startTime);
            powTime = (deltaTime / this.acceleration) * Math.pow(Math.E, -this.springTension * (deltaTime / this.acceleration));
            deltaOffset.x = bounce.horizontal.startVelocity * powTime;
            startOffset = bounce.horizontal.startOffset;

            if (Math.abs(deltaOffset.x) <= 1) {
                deltaOffset.x = 0;
                delete bounce.horizontal;
            }
            newPos.x = startOffset + deltaOffset.x;
        }

        if (bounce.vertical && bounce.vertical.startTime != currentTime) {
            deltaTime = (currentTime - bounce.vertical.startTime);
            powTime = (deltaTime / this.acceleration) * Math.pow(Math.E, -this.springTension * (deltaTime / this.acceleration));
            deltaOffset.y = bounce.vertical.startVelocity * powTime;
            startOffset = bounce.vertical.startOffset;

            if (Math.abs(deltaOffset.y) <= 1) {
                deltaOffset.y = 0;
                delete bounce.vertical;
            }
            newPos.y = startOffset + deltaOffset.y;
        }

        if (!bounce.vertical && !bounce.horizontal) {
            this.bouncing = false;
        }

        if ((!this.bounces || !this.bouncing) && !this.decelerating) {
            this.animating = false;
            this.snapToBounds(false);
            this.fireEvent('scrollend', this, this.offset);
            return;
        }

        this.scrollTask.delay(1000 / this.fps);
        this._scrollTo(newPos);
    },

    // @private
    snapToBounds : function(animate, easing) {
        var pos = this.constrainToBounds(this.offset);
        if (this.snap) {
            if (this.snap === true) {
                this.snap = {
                    x: 50,
                    y: 50
                };
            }
            else if (Ext.isNumber(this.snap)) {
                this.snap = {
                    x: this.snap,
                    y: this.snap
                };
            }
            if (this.snap.y) {
                pos.y = Math.round(pos.y / this.snap.y) * this.snap.y;
            }
            if (this.snap.x) {
                pos.x = Math.round(pos.x / this.snap.x) * this.snap.x;
            }
        }

        if (pos.x != this.offset.x || pos.y != this.offset.y) {
            if (this.snap) {
                this.scrollTo({x: -pos.x, y: -pos.y}, 150, 'ease-in-out');
            }
            else if (animate) {
                this.applyVelocity();
            }
            else {
                this._scrollTo(pos);
            }
        }
    },

    // @private
    updateBounds : function() {
        this.parentSize = {
            width: this.parent.getWidth(true),
            height: this.parent.getHeight(true)
        };

        this.contentSize = {
            width: this.scroller.dom.scrollWidth,
            height: this.scroller.dom.scrollHeight
        };

        // Get the scrollable view size
        this.size = {
            width: Math.max(this.contentSize.width, this.parentSize.width),
            height: Math.max(this.contentSize.height, this.parentSize.height)
        };

        // Determine the boundaries that we can drag between
        this.bounds = {
            x: this.parentSize.width - this.size.width,
            y: this.parentSize.height - this.size.height
        };

        if (this.scrollbarX) {
            this.scrollbarX.update();
        }

        if (this.scrollbarY) {
            this.scrollbarY.update();
        }
    },

    // @private
    constrainToBounds : function(pos) {
        if (!this.bounds) {
            this.updateBounds();
        }
        return {
            x: Math.min(Math.max(this.bounds.x, pos.x), 0),
            y: Math.min(Math.max(this.bounds.y, pos.y), 0)
        };
    },

    // @private
    resetMomentum : function(e) {
        this.momentumPoints = [];
        if (e) {
            this.addMomentum(e);
        }
    },

    // @private
    addMomentum : function(e) {
        this.validateMomentum(e);
        this.momentumPoints.push({
            time: e ? e.time : (new Date()).getTime(),
            offset: {x: this.offset.x, y: this.offset.y}
        });
    },

    // @private
    validateMomentum : function(e) {
        var momentum = this.momentumPoints,
            time = e ? e.time : (new Date()).getTime();

        while (momentum.length) {
            if (time - momentum[0].time <= this.momentumResetTime) {
                break;
            }
            momentum.shift();
        }
    },

    destroy : function() {
        this.scroller.removeClass('x-scroller');
        this.parent.removeClass('x-scroller-parent');

        this.parent.un({
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            scrollstart: this.onScrollStart,
            scrollend: this.onScrollEnd,
            scroll: this.onScroll,
            horizontal: this.horizontal,
            vertical: this.vertical,
            scope: this
        });

        this.scrollTask.cancel();

        if (this.scrollbars) {
            if (this.horizontal) {
                this.scrollbarX.destroy();
            }

            if (this.vertical) {
                this.scrollbaY.destroy();
            }
        }

        this.scroller.un('webkitTransitionEnd', this.onTransitionEnd, this);
    }
});

if (Ext.platform.isAndroidOS) {
    Ext.apply(Ext.util.Scroller.prototype, {
        momentumResetTime: 600,
        friction: 0.2,
        bounces: false
    });
}

/**
 * @class Ext.util.Scroller.Scrollbar
 * @extends Object
 * @private
 */
Ext.util.Scroller.Scrollbar = Ext.extend(Object, {
    minSize: 4,
    size: 0,
    offset: 10,

    /**
     * @constructor
     * @private
     * @param {Ext.util.Scroller} scroller
     * @param {String} direction 'vertical' or 'horizontal'
     */
    constructor : function(scroller, direction) {
        this.scroller = scroller;
        this.container = scroller.parent;
        this.direction = direction;
        this.bar = this.container.createChild({
            cls: 'x-scrollbar x-scrollbar-' + direction + ' x-scrollbar-' + scroller.ui
        });
        this.hide();
    },

    destroy : function() {
        this.bar.remove();
    },

    // @private
    update : function() {
        var scroller = this.scroller,
            contentSize = scroller.contentSize,
            parentSize = scroller.parentSize,
            size = scroller.size,
            height, width;

        if (this.direction == 'vertical') {
            // make sure the scrollbar only shows when the content is higher then the parent
            if (contentSize.height > parentSize.height) {
                this.size = Math.round((parentSize.height * parentSize.height) / size.height);
                this.autoShow = true;
            }
            else {
                this.autoShow = false;
            }
        }
        else {
            if (contentSize.width > parentSize.width) {
                this.size = Math.round((parentSize.width * parentSize.width) / size.width);
                this.autoShow = true;
            }
            else {
                this.autoShow = false;
            }
        }
    },

    // @private
    scrollTo : function(pos, animate, easing) {
        var me = this,
            scroller = me.scroller,
            style = me.bar.dom.style,
            transformX = 0,
            transformY = 0,
            size = me.size,
            boundsPos = scroller.constrainToBounds(pos);

        if (!me.autoShow) {
            return;
        }

        clearTimeout(me.hideTimeout);
        me.hideTimeout = setTimeout(function() {
            me.hide();
        }, 800);

        if (me.hidden) {
            me.show();
        }

        if (me.direction == 'horizontal') {
            if (pos.x != boundsPos.x) {
                size = Math.max(size - Math.abs(pos.x - boundsPos.x), me.minSize);
                if (pos.x > boundsPos.x) {
                    transformX = boundsPos.x + me.offset;
                }
                else if (pos.x < boundsPos.x) {
                    transformX = scroller.parentSize.width - size - me.offset;
                }
            }
            else {
                transformX = ((scroller.parentSize.width - size - (me.offset * 2)) / scroller.bounds.x * scroller.offset.x) + me.offset;
            }
            style.width = size + 'px';
        }
        else {
            if (pos.y != boundsPos.y) {
                size = Math.max(size - Math.abs(pos.y - boundsPos.y), me.minSize);
                if (pos.y > boundsPos.y) {
                    transformY = boundsPos.y + me.offset;
                }
                else if (pos.y < boundsPos.y) {
                    transformY = scroller.parentSize.height - size - me.offset;
                }
            }
            else {
                transformY = ((scroller.parentSize.height - size - (me.offset * 2)) / scroller.bounds.y * scroller.offset.y) + me.offset;
            }
            style.height = size + 'px';
        }

        if (animate) {
            style.webkitTransitionDuration = (typeof animate == 'number' ? animate : scroller.scrollToDuration) + 'ms, 500ms';
            style.webkitTransitionTimingFunction = easing;
        }
        else {
            style.webkitTransitionDuration = '0ms, 500ms';
        }

        style.webkitTransform = 'translate3d(' + transformX + 'px, ' + transformY + 'px, 0px)';
    },

    /**
     * Hide the scrollbar
     * @private
     */
    hide : function() {
        this.bar.setStyle('opacity', '0');
        this.hidden = true;
    },

    /**
     * Show the scrollbar
     * @private
     */
    show : function() {
        this.bar.setStyle('opacity', '1');
        this.hidden = false;
    },

    /**
     * Stop the scrollbar animation
     * @private
     */
    stop : function() {
        var style = this.bar.dom.style,
            transform;

        style.webkitTransitionDuration = '0ms';
        transform = new WebKitCSSMatrix(window.getComputedStyle(this.bar.dom).webkitTransform);
        style.webkitTransform = 'translate3d(' + transform.m41 + 'px, ' + transform.m42 + 'px, 0)';
    }
});

/**
 * @class Ext.util.Draggable
 * @extends Ext.util.Observable
 *
 *
 */

Ext.util.Draggable = Ext.extend(Ext.util.Observable, {
    baseCls: 'x-draggable',
    dragCls: 'x-dragging',
    proxyCls: 'x-draggable-proxy',

    /**
     * @cfg {String} direction
     * Possible values: 'vertical', 'horizontal', or 'both'
     * Defaults to 'both'
     */
    direction: 'both',

    /**
     * @cfg {Number} delay
     * How many milliseconds a user must hold the draggable before starting a
     * drag operation. Defaults to 0 or immediate.
     */
    delay: 0,

    /**
     * @cfg {String} cancelSelector
     * A simple CSS selector that represents elements within the draggable
     * that should NOT initiate a drag.
     */
    cancelSelector: null,

    /**
     * @cfg {Boolean} disabled
     */
    disabled: false,

    /**
     * @cfg {Boolean} revert
     */
    revert: false,

    /**
     * @cfg {Element} constrain
     */
    constrain: window,

    /**
     * @cfg {String} group
     * Draggable and Droppable objects can participate in a group which are
     * capable of interacting. Defaults to 'base'
     */
    group: 'base',

    // not implemented yet.
    grid: null,
    snap: null,
    proxy: null,
    stack: false,


    // Properties
    /**
     * Read-only Property representing the region that the Draggable
     * is constrained to.
     * @type Ext.util.Region
     */
    constrainRegion: null,

    /**
     * Read-only Property representing whether or not the Draggable is currently
     * dragging or not.
     * @type Boolean
     */
    dragging: false,

    /**
     * Read-only value representing whether the Draggable can be moved vertically.
     * This is automatically calculated by Draggable by the direction configuration.
     * @type Boolean
     */
    vertical: false,

    /**
     * Read-only value representing whether the Draggable can be moved horizontally.
     * This is automatically calculated by Draggable by the direction configuration.
     * @type Boolean
     */
    horizontal: false,

    /**
     * The amount of pixels you have to move before the drag operation starts.
     * Defaults to 0.
     * @type Number
     */
    threshold: 0,

    /**
     * @constructor
     * @param {Mixed} el String, HtmlElement or Ext.Element representing an
     * element on the page.
     * @param {Object} config Configuration options for this class.
     */
    constructor : function(el, config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event dragstart
             * @param {Ext.Draggable} this
             * @param {Ext.EventObject} e
             */
            'dragstart',
            'beforedragend',
            /**
             * @event dragend
             * @param {Ext.Draggable} this
             * @param {Ext.EventObject} e
             */
            'dragend',
            /**
             * @event drag
             * @param {Ext.Draggable} this
             * @param {Ext.EventObject} e
             */
            'drag'
        );

        this.el = Ext.get(el);

        Ext.util.Draggable.superclass.constructor.call(this);

        if (this.direction == 'both') {
            this.horizontal = true;
            this.vertical = true;
        }
        else if (this.direction == 'horizontal') {
            this.horizontal = true;
        }
        else {
            this.vertical = true;
        }

        this.el.addClass(this.baseCls);

        this.tapEvent = (this.delay > 0) ? 'taphold' : 'tapstart';

        if (!this.disabled) {
            this.enable();
        }
    },

    // @private
    onTapEvent : function(e, t) {
        if (Ext.platform.isAndroidOS) {
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
        }

        if (this.cancelSelector && e.getTarget(this.cancelSelector)) {
            return;
        }
        if (!this.dragging && (e.type === 'tapstart' || e.deltaTime >= this.delay)) {
            this.canDrag = true;
        }
    },

    // @private
    prepareDrag : function(e) {
        this.reset();

        if (this.constrain) {
            if (this.constrain === window) {
                var w = window.innerWidth,
                    h = window.innerHeight;
                this.constrainRegion = new Ext.util.Region(0, w, h, 0);
            }
            else {
                this.constrainRegion = Ext.fly(this.constrain).getPageBox(true);
            }
        }

        this.startRegion = this.getProxyEl().getPageBox(true);

        this.offsetToCorner = {
            x: e.pageX - this.startRegion.left,
            y: e.pageY - this.startRegion.top
        };
    },

    // @private
    onDragStart : function(e) {
        this.prepareDrag(e);

        if (!this.dragging) {
            this.el.addClass(this.dragCls);
            this.dragging = true;
            this.fireEvent('dragstart', this, e);
        }
    },

    // @private
    onTouchMove : function(e) {
        e.stopEvent();

        if (!this.canDrag) {
            return;
        }

        if (!this.dragging) {
            if (Math.abs(e.deltaX) >= this.threshold || Math.abs(e.deltaY) >= this.threshold) {
                this.onDragStart(e);
            }
            else {
                return;
            }
        }

        var x = 0,
            y = 0,
            initialRegion = this.initialRegion,
            constrainRegion = this.constrainRegion;

        if (this.horizontal) {
            x = e.pageX - this.initialRegion.left - this.offsetToCorner.x;
        }
        if (this.vertical) {
            y = e.pageY - this.initialRegion.top - this.offsetToCorner.y;
        }

        if (this.constrain) {
            if (initialRegion.left + x < constrainRegion.left) {
                x = constrainRegion.left - initialRegion.left;
            }
            if (initialRegion.right + x > constrainRegion.right) {
                x = constrainRegion.right - initialRegion.right;
            }
            if (initialRegion.top + y < constrainRegion.top) {
                y = constrainRegion.top - initialRegion.top;
            }
            if (initialRegion.bottom + y > constrainRegion.bottom) {
                y = constrainRegion.bottom - initialRegion.bottom;
            }
        }

        this.transformTo(x, y);
        this.fireEvent('drag', this, e);
    },

    // @private
    transformTo : function(x, y) {
        var proxyEl       = this.getProxyEl(),
            initialRegion = this.initialRegion,
            startPos      = this.startPosition || {x: 0, y: 0};

        proxyEl.dom.style.webkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0px)';

        this.transform = {x: x, y: y};
        this.position = {
            x: startPos.x + x,
            y: startPos.y + y
        };

        this.region = new Ext.util.Region(
            initialRegion.top + y,
            initialRegion.right + x,
            initialRegion.bottom + y,
            initialRegion.left + x
        );
    },

    /**
     * @private
     * moveTo is used to absolute page co-ordinates
     * @param x {Number}
     * @param y {Number}
     */
    moveTo : function(x, y) {
        this.transformTo(x - this.initialRegion.left, y - this.initialRegion.top);
    },

    /**
     * @private
     * Resets an element back to where it initially started dragging.
     * Note, a drag must be initiated before you can call this method.
     */
    reset : function() {
        var proxyEl = this.getProxyEl();

        this.startPosition = this.position = {
            x: proxyEl.getLeft() || 0,
            y: proxyEl.getTop() || 0
        };

        this.initialRegion = this.region = proxyEl.getPageBox(true);
        this.transform = {x: 0, y: 0};
    },

    // @private
    onTouchEnd : function(e) {
        this.canDrag = false;
        this.dragging = false;
        this.fireEvent('beforedragend', this, e);
        var proxyEl = this.getProxyEl();

        if (this.revert && !this.cancelRevert && this.transform) {
            new Ext.Anim({
                from: {
                    '-webkit-transform': 'translate3d(' + this.transform.x + 'px, ' + this.transform.y + 'px, 0px)'
                },
                to: {
                    '-webkit-transform': 'translate3d(0px, 0px, 0px)'
                },
                duration: 200
            }).run(proxyEl);
        }
        else if (this.transform) {
            var style    = proxyEl.dom.style,
                position = this.position;

            style.webkitTransform = null;
            style.left = position.x + 'px';
            style.top = position.y + 'px';
        }

        this.transform = this.startPosition = null;
        this.el.removeClass(this.dragCls);
        this.fireEvent('dragend', this, e);
    },

    /**
     * Enable dragging.
     * This is invoked immediately after constructing a Draggable, if the
     * disabled parameter is NOT set to true.
     */
    enable : function() {
        this.el.on(this.tapEvent, this.onTapEvent, this, {
            horizontal: this.horizontal,
            vertical  : this.vertical
        });

        this.el.on({
            touchmove: this.onTouchMove,
            touchend: this.onTouchEnd,
            scope: this
        });

        this.disabled = false;
    },

    /**
     * Disable dragging.
     */
    disable : function() {
        this.el.un(this.tapEvent, this.onTapEvent, this);
        this.disabled = true;
    },

    /**
     * Remove the draggable functionality from the bound element.
     */
    destroy : function() {
        this.el.removeClass(this.baseCls);
        this.purgeListeners();
        this.el.un(this.tapEvent, this.onTapEvent, this);
        this.el.un({
            touchmove: this.onTouchMove,
            touchend: this.onTouchEnd,
            scope: this
        });
    },

    /**
     * @returns {Ext.Element}
     * Returns the Proxy element
     */
    getProxyEl: function() {
        return this.proxy || this.el;
    }
});

/**
 * @class Ext.util.Droppable
 * @extends Ext.util.Observable
 *
 */
Ext.util.Droppable = Ext.extend(Ext.util.Observable, {
    baseCls: 'x-droppable',
    /**
     * @cfg {String} activeCls
     * The CSS added to a Droppable when a Draggable in the same group is being
     * dragged. Defaults to 'x-drop-active'.
     */
    activeCls: 'x-drop-active',
    /**
     * @cfg {String} invalidCls
     * The CSS class to add to the droppable when dragging a draggable that is
     * not in the same group. Defaults to 'x-drop-invalid'.
     */
    invalidCls: 'x-drop-invalid',
    /**
     * @cfg {String} hoverCls
     * The CSS class to add to the droppable when hovering over a valid drop. (Defaults to 'x-drop-hover')
     */
    hoverCls: 'x-drop-hover',

    /**
     * @cfg {String} validDropMode
     * Determines when a drop is considered 'valid' whether it simply need to
     * intersect the region or if it needs to be contained within the region.
     * Valid values are: 'intersects' or 'contains'
     */
    validDropMode: 'intersect',

    /**
     * @cfg {Boolean} disabled
     */
    disabled: false,

    /**
     * @cfg {String} group
     * Draggable and Droppable objects can participate in a group which are
     * capable of interacting. Defaults to 'base'
     */
    group: 'base',

    // not yet implemented
    tolerance: null,


    /**
     * @constructor
     * @param el {Mixed} String, HtmlElement or Ext.Element representing an
     * element on the page.
     * @param config {Object} Configuration options for this class.
     */
    constructor : function(el, config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event dropactivate
             * @param {Ext.Droppable} this
             * @param {Ext.Draggable} draggable
             * @param {Ext.EventObject} e
             */
            'dropactivate',

            /**
             * @event dropdeactivate
             * @param {Ext.Droppable} this
             * @param {Ext.Draggable} draggable
             * @param {Ext.EventObject} e
             */
            'dropdeactivate',

            /**
             * @event dropenter
             * @param {Ext.Droppable} this
             * @param {Ext.Draggable} draggable
             * @param {Ext.EventObject} e
             */
            'dropenter',

            /**
             * @event dropleave
             * @param {Ext.Droppable} this
             * @param {Ext.Draggable} draggable
             * @param {Ext.EventObject} e
             */
            'dropleave',

            /**
             * @event drop
             * @param {Ext.Droppable} this
             * @param {Ext.Draggable} draggable
             * @param {Ext.EventObject} e
             */
            'drop'
        );

        this.el = Ext.get(el);
        Ext.util.Droppable.superclass.constructor.call(this);

        if (!this.disabled) {
            this.enable();
        }

        this.el.addClass(this.baseCls);
    },

    // @private
    onDragStart : function(draggable, e) {
        if (draggable.group === this.group) {
            this.monitoring = true;
            this.el.addClass(this.activeCls);
            this.region = this.el.getPageBox(true);

            draggable.on({
                drag: this.onDrag,
                beforedragend: this.onBeforeDragEnd,
                dragend: this.onDragEnd,
                scope: this
            });

            if (this.isDragOver(draggable)) {
                this.setCanDrop(true, draggable, e);
            }

            this.fireEvent('dropactivate', this, draggable, e);
        }
        else {
            draggable.on({
                dragend: function() {
                    this.el.removeClass(this.invalidCls);
                },
                scope: this,
                single: true
            });
            this.el.addClass(this.invalidCls);
        }
    },

    // @private
    isDragOver : function(draggable, region) {
        return this.region[this.validDropMode](draggable.region);
    },

    // @private
    onDrag : function(draggable, e) {
        this.setCanDrop(this.isDragOver(draggable), draggable, e);
    },

    // @private
    setCanDrop : function(canDrop, draggable, e) {
        if (canDrop && !this.canDrop) {
            this.canDrop = true;
            this.el.addClass(this.hoverCls);
            this.fireEvent('dropenter', this, draggable, e);
        }
        else if (!canDrop && this.canDrop) {
            this.canDrop = false;
            this.el.removeClass(this.hoverCls);
            this.fireEvent('dropleave', this, draggable, e);
        }
    },

    // @private
    onBeforeDragEnd: function(draggable, e) {
        draggable.cancelRevert = this.canDrop;
    },

    // @private
    onDragEnd : function(draggable, e) {
        this.monitoring = false;
        this.el.removeClass(this.activeCls);

        draggable.un({
            drag: this.onDrag,
            beforedragend: this.onBeforeDragEnd,
            dragend: this.onDragEnd,
            scope: this
        });


        if (this.canDrop) {
            this.canDrop = false;
            this.el.removeClass(this.hoverCls);
            this.fireEvent('drop', this, draggable, e);
        }

        this.fireEvent('dropdeactivate', this, draggable, e);
    },

    /**
     * Enable the Droppable target.
     * This is invoked immediately after constructing a Droppable if the
     * disabled parameter is NOT set to true.
     */
    enable : function() {
        if (!this.mgr) {
            this.mgr = Ext.util.Observable.observe(Ext.util.Draggable);
        }
        this.mgr.on({
            dragstart: this.onDragStart,
            scope: this
        });
        this.disabled = false;
    },

    /**
     * Disable the Droppable target.
     */
    disable : function() {
        this.mgr.un({
            dragstart: this.onDragStart,
            scope: this
        });
        this.disabled = true;
    }
});

/**
 * @class Ext.util.Sortable
 * @extends Ext.util.Observable
 * @constructor
 * @param {Mixed} el
 * @param {Object} config
 */
Ext.util.Sortable = Ext.extend(Ext.util.Observable, {
    baseCls: 'x-sortable',

    /**
     * @cfg {String} direction
     * Possible values: 'vertical', 'horizontal'
     * Defaults to 'vertical'
     */
    direction: 'vertical',

    /**
     * @cfg {String} cancelSelector
     * A simple CSS selector that represents elements within the draggable
     * that should NOT initiate a drag.
     */
    cancelSelector: null,

    // not yet implemented
    //indicator: true,
    //proxy: true,
    //tolerance: null,

    /**
     * @cfg {Element} constrain
     * An Element to constrain the Sortable dragging to. Defaults to window.
     */
    constrain: window,
    /**
     * @cfg {String} group
     * Draggable and Droppable objects can participate in a group which are
     * capable of interacting. Defaults to 'base'
     */
    group: 'base',

    /**
     * @cfg {Boolean} revert
     * This should NOT be changed.
     * @private
     */
    revert: true,

    /**
     * @cfg {String} itemSelector
     * A simple CSS selector that represents individual items within the Sortable.
     */
    itemSelector: null,

    /**
     * @cfg {String} handleSelector
     * A simple CSS selector to indicate what is the handle to drag the Sortable.
     */
    handleSelector: null,

    /**
     * @cfg {Boolean} disabled
     * Passing in true will disable this Sortable.
     */
    disabled: false,

    /**
     * @cfg {Number} delay
     * How many milliseconds a user must hold the draggable before starting a
     * drag operation. Defaults to 0 or immediate.
     */
    delay: 0,

    // Properties

    /**
     * Read-only property that indicates whether a Sortable is currently sorting.
     * @type Boolean
     */
    sorting: false,

    /**
     * Read-only value representing whether the Draggable can be moved vertically.
     * This is automatically calculated by Draggable by the direction configuration.
     * @type Boolean
     */
    vertical: false,

    /**
     * Read-only value representing whether the Draggable can be moved horizontally.
     * This is automatically calculated by Draggable by the direction configuration.
     * @type Boolean
     */
    horizontal: false,

    constructor : function(el, config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event sortstart
             * @param {Ext.Sortable} this
             * @param {Ext.EventObject} e
             */
            'sortstart',
            /**
             * @event sortend
             * @param {Ext.Sortable} this
             * @param {Ext.EventObject} e
             */
            'sortend',
            /**
             * @event sortchange
             * @param {Ext.Sortable} this
             * @param {Ext.Element} el The Element being dragged.
             * @param {Number} index The index of the element after the sort change.
             */
            'sortchange'

            // not yet implemented.
            // 'sortupdate',
            // 'sortreceive',
            // 'sortremove',
            // 'sortenter',
            // 'sortleave',
            // 'sortactivate',
            // 'sortdeactivate'
        );

        this.el = Ext.get(el);
        Ext.util.Sortable.superclass.constructor.call(this);

        if (this.direction == 'horizontal') {
            this.horizontal = true;
        }
        else if (this.direction == 'vertical') {
            this.vertical = true;
        }
        else {
            this.horizontal = this.vertical = true;
        }

        this.el.addClass(this.baseCls);
        this.tapEvent = (this.delay > 0) ? 'taphold' : 'tapstart';
        if (!this.disabled) {
            this.enable();
        }
    },

    // @private
    onTapEvent : function(e, t) {
        if (this.cancelSelector && e.getTarget(this.cancelSelector)) {
            return;
        }

        if (this.handleSelector && !e.getTarget(this.handleSelector)) {
            return;
        }

        if (!this.sorting && (e.type === 'tapstart' || e.deltaTime >= this.delay)) {
            var item = e.getTarget(this.itemSelector);
            if ( item ) {
                this.onSortStart(e, item);
            }
        }
    },

    // @private
    onSortStart : function(e, t) {
        this.sorting = true;
        var draggable = new Ext.util.Draggable(t, {
            delay: this.delay,
            revert: this.revert,
            direction: this.direction,
            constrain: this.constrain === true ? this.el : this.constrain
        });
        draggable.on({
            drag: this.onDrag,
            dragend: this.onDragEnd,
            scope: this
        });

        this.dragEl = t;
        this.calculateBoxes();
        draggable.canDrag = true;
        this.fireEvent('sortstart', this, e);
    },

    // @private
    calculateBoxes : function() {
        this.items = [];
        var els = this.el.select(this.itemSelector, false),
            ln = els.length, i, item, el, box;

        for (i = 0; i < ln; i++) {
            el = els[i];
            if (el != this.dragEl) {
                item = Ext.fly(el).getPageBox(true);
                item.el = el;
                this.items.push(item);
            }
        }
    },

    // @private
    onDrag : function(draggable, e) {
        var items = this.items,
            ln = items.length,
            region = draggable.region,
            sortChange = false,
            i, intersect, overlap, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            intersect = region.intersect(item);
            if (intersect) {
                if (this.vertical && Math.abs(intersect.top - intersect.bottom) > (region.bottom - region.top) / 2) {
                    if (region.bottom > item.top && item.top > region.top) {
                        draggable.el.insertAfter(item.el);
                    }
                    else {
                        draggable.el.insertBefore(item.el);
                    }
                    sortChange = true;
                }
                else if (this.horizontal && Math.abs(intersect.left - intersect.right) > (region.right - region.left) / 2) {
                    if (region.right > item.left && item.left > region.left) {
                        draggable.el.insertAfter(item.el);
                    }
                    else {
                        draggable.el.insertBefore(item.el);
                    }
                    sortChange = true;
                }

                if (sortChange) {
                    // We reset the draggable (initializes all the new start values)
                    draggable.reset();

                    // Move the draggable to its current location (since the transform is now
                    // different)
                    draggable.moveTo(region.left, region.top);

                    // Finally lets recalculate all the items boxes
                    this.calculateBoxes();
                    this.fireEvent('sortchange', this, draggable.el, this.el.select(this.itemSelector, false).indexOf(draggable.el.dom));
                    return;
                }
            }
        }
    },

    // @private
    onDragEnd : function(draggable, e) {
        draggable.destroy();
        this.sorting = false;
        this.fireEvent('sortend', this, draggable, e);
    },

    /**
     * Enables sorting for this Sortable.
     * This method is invoked immediately after construction of a Sortable unless
     * the disabled configuration is set to true.
     */
    enable : function() {
        this.el.on(this.tapEvent, this.onTapEvent, this);
        this.disabled = false;
    },

    /**
     * Disables sorting for this Sortable.
     */
    disable : function() {
        this.el.un(this.tapEvent, this.onTapEvent, this);
        this.disabled = true;
    }
});

/**
 * @class Ext.util.Format
 * Reusable data formatting functions
 * @singleton
 */
Ext.util.Format = function() {
    return {
        /**
         * Truncate a string and add an ellipsis ('...') to the end if it exceeds the specified length
         * @param {String} value The string to truncate
         * @param {Number} length The maximum length to allow before truncating
         * @param {Boolean} word True to try to find a common work break
         * @return {String} The converted text
         */
        ellipsis: function(value, len, word) {
            if (value && value.length > len) {
                if (word) {
                    var vs = value.substr(0, len - 2),
                    index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
                    if (index == -1 || index < (len - 15)) {
                        return value.substr(0, len - 3) + "...";
                    } else {
                        return vs.substr(0, index) + "...";
                    }
                } else {
                    return value.substr(0, len - 3) + "...";
                }
            }
            return value;
        },

        /**
         * Convert certain characters (&, <, >, and ') to their HTML character equivalents for literal display in web pages.
         * @param {String} value The string to encode
         * @return {String} The encoded text
         */
        htmlEncode: function(value) {
            return ! value ? value: String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        },

        /**
         * Convert certain characters (&, <, >, and ') from their HTML character equivalents.
         * @param {String} value The string to decode
         * @return {String} The decoded text
         */
        htmlDecode: function(value) {
            return ! value ? value: String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
        },

        /**
         * Parse a value into a formatted date using the specified format pattern.
         * @param {String/Date} value The value to format (Strings must conform to the format expected by the javascript Date object's <a href="http://www.w3schools.com/jsref/jsref_parse.asp">parse()</a> method)
         * @param {String} format (optional) Any valid date format string (defaults to 'm/d/Y')
         * @return {String} The formatted date string
         */
        date: function(v, format) {
            if (!v) {
                return "";
            }
            if (!Ext.isDate(v)) {
                v = new Date(Date.parse(v));
            }
            return v.dateFormat(format || "m/d/Y");
        }
    };
}();

/**
 * @class Date
 *
 * The date parsing and formatting syntax contains a subset of
 * <a href="http://www.php.net/date">PHP's date() function</a>, and the formats that are
 * supported will provide results equivalent to their PHP versions.
 *
 * The following is a list of all currently supported formats:
 * <pre>
Format  Description                                                               Example returned values
------  -----------------------------------------------------------------------   -----------------------
  d     Day of the month, 2 digits with leading zeros                             01 to 31
  D     A short textual representation of the day of the week                     Mon to Sun
  j     Day of the month without leading zeros                                    1 to 31
  l     A full textual representation of the day of the week                      Sunday to Saturday
  N     ISO-8601 numeric representation of the day of the week                    1 (for Monday) through 7 (for Sunday)
  S     English ordinal suffix for the day of the month, 2 characters             st, nd, rd or th. Works well with j
  w     Numeric representation of the day of the week                             0 (for Sunday) to 6 (for Saturday)
  z     The day of the year (starting from 0)                                     0 to 364 (365 in leap years)
  W     ISO-8601 week number of year, weeks starting on Monday                    01 to 53
  F     A full textual representation of a month, such as January or March        January to December
  m     Numeric representation of a month, with leading zeros                     01 to 12
  M     A short textual representation of a month                                 Jan to Dec
  n     Numeric representation of a month, without leading zeros                  1 to 12
  t     Number of days in the given month                                         28 to 31
  L     Whether it's a leap year                                                  1 if it is a leap year, 0 otherwise.
  o     ISO-8601 year number (identical to (Y), but if the ISO week number (W)    Examples: 1998 or 2004
        belongs to the previous or next year, that year is used instead)
  Y     A full numeric representation of a year, 4 digits                         Examples: 1999 or 2003
  y     A two digit representation of a year                                      Examples: 99 or 03
  a     Lowercase Ante meridiem and Post meridiem                                 am or pm
  A     Uppercase Ante meridiem and Post meridiem                                 AM or PM
  g     12-hour format of an hour without leading zeros                           1 to 12
  G     24-hour format of an hour without leading zeros                           0 to 23
  h     12-hour format of an hour with leading zeros                              01 to 12
  H     24-hour format of an hour with leading zeros                              00 to 23
  i     Minutes, with leading zeros                                               00 to 59
  s     Seconds, with leading zeros                                               00 to 59
  u     Decimal fraction of a second                                              Examples:
        (minimum 1 digit, arbitrary number of digits allowed)                     001 (i.e. 0.001s) or
                                                                                  100 (i.e. 0.100s) or
                                                                                  999 (i.e. 0.999s) or
                                                                                  999876543210 (i.e. 0.999876543210s)
  O     Difference to Greenwich time (GMT) in hours and minutes                   Example: +1030
  P     Difference to Greenwich time (GMT) with colon between hours and minutes   Example: -08:00
  T     Timezone abbreviation of the machine running the code                     Examples: EST, MDT, PDT ...
  Z     Timezone offset in seconds (negative if west of UTC, positive if east)    -43200 to 50400
  c     ISO 8601 date
        Notes:                                                                    Examples:
        1) If unspecified, the month / day defaults to the current month / day,   1991 or
           the time defaults to midnight, while the timezone defaults to the      1992-10 or
           browser's timezone. If a time is specified, it must include both hours 1993-09-20 or
           and minutes. The "T" delimiter, seconds, milliseconds and timezone     1994-08-19T16:20+01:00 or
           are optional.                                                          1995-07-18T17:21:28-02:00 or
        2) The decimal fraction of a second, if specified, must contain at        1996-06-17T18:22:29.98765+03:00 or
           least 1 digit (there is no limit to the maximum number                 1997-05-16T19:23:30,12345-0400 or
           of digits allowed), and may be delimited by either a '.' or a ','      1998-04-15T20:24:31.2468Z or
        Refer to the examples on the right for the various levels of              1999-03-14T20:24:32Z or
        date-time granularity which are supported, or see                         2000-02-13T21:25:33
        http://www.w3.org/TR/NOTE-datetime for more info.                         2001-01-12 22:26:34
  U     Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)                1193432466 or -2138434463
  M$    Microsoft AJAX serialized dates                                           \/Date(1238606590509)\/ (i.e. UTC milliseconds since epoch) or
                                                                                  \/Date(1238606590509+0800)\/
</pre>
 *
 * Example usage (note that you must escape format specifiers with '\\' to render them as character literals):
 * <pre><code>
// Sample date:
// 'Wed Jan 10 2007 15:05:01 GMT-0600 (Central Standard Time)'

var dt = new Date('1/10/2007 03:05:01 PM GMT-0600');
document.write(dt.format('Y-m-d'));                           // 2007-01-10
document.write(dt.format('F j, Y, g:i a'));                   // January 10, 2007, 3:05 pm
document.write(dt.format('l, \\t\\he jS \\of F Y h:i:s A'));  // Wednesday, the 10th of January 2007 03:05:01 PM
</code></pre>
 *
 * Here are some standard date/time patterns that you might find helpful.  They
 * are not part of the source of Date.js, but to use them you can simply copy this
 * block of code into any script that is included after Date.js and they will also become
 * globally available on the Date object.  Feel free to add or remove patterns as needed in your code.
 * <pre><code>
Date.patterns = {
    ISO8601Long:"Y-m-d H:i:s",
    ISO8601Short:"Y-m-d",
    ShortDate: "n/j/Y",
    LongDate: "l, F d, Y",
    FullDateTime: "l, F d, Y g:i:s A",
    MonthDay: "F d",
    ShortTime: "g:i A",
    LongTime: "g:i:s A",
    SortableDateTime: "Y-m-d\\TH:i:s",
    UniversalSortableDateTime: "Y-m-d H:i:sO",
    YearMonth: "F, Y"
};
</code></pre>
 *
 * Example usage:
 * <pre><code>
var dt = new Date();
document.write(dt.format(Date.patterns.ShortDate));
</code></pre>
 * <p>Developer-written, custom formats may be used by supplying both a formatting and a parsing function
 * which perform to specialized requirements. The functions are stored in {@link #parseFunctions} and {@link #formatFunctions}.</p>
 */

/*
 * Most of the date-formatting functions below are the excellent work of Baron Schwartz.
 * (see http://www.xaprb.com/blog/2005/12/12/javascript-closures-for-runtime-efficiency/)
 * They generate precompiled functions from format patterns instead of parsing and
 * processing each pattern every time a date is formatted. These functions are available
 * on every Date object.
 */

 (function() {

    /**
 * Global flag which determines if strict date parsing should be used.
 * Strict date parsing will not roll-over invalid dates, which is the
 * default behaviour of javascript Date objects.
 * (see {@link #parseDate} for more information)
 * Defaults to <tt>false</tt>.
 * @static
 * @type Boolean
*/
    Date.useStrict = false;


    // create private copy of Ext's String.format() method
    // - to remove unnecessary dependency
    // - to resolve namespace conflict with M$-Ajax's implementation
    function xf(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/\{(\d+)\}/g,
        function(m, i) {
            return args[i];
        });
    }


    // private
    Date.formatCodeToRegex = function(character, currentGroup) {
        // Note: currentGroup - position in regex result array (see notes for Date.parseCodes below)
        var p = Date.parseCodes[character];

        if (p) {
            p = typeof p == 'function' ? p() : p;
            Date.parseCodes[character] = p;
            // reassign function result to prevent repeated execution
        }

        return p ? Ext.applyIf({
            c: p.c ? xf(p.c, currentGroup || "{0}") : p.c
        },
        p) : {
            g: 0,
            c: null,
            s: Ext.escapeRe(character)
            // treat unrecognised characters as literals
        };
    };

    // private shorthand for Date.formatCodeToRegex since we'll be using it fairly often
    var $f = Date.formatCodeToRegex;

    Ext.apply(Date, {
        /**
     * <p>An object hash in which each property is a date parsing function. The property name is the
     * format string which that function parses.</p>
     * <p>This object is automatically populated with date parsing functions as
     * date formats are requested for Ext standard formatting strings.</p>
     * <p>Custom parsing functions may be inserted into this object, keyed by a name which from then on
     * may be used as a format string to {@link #parseDate}.<p>
     * <p>Example:</p><pre><code>
Date.parseFunctions['x-date-format'] = myDateParser;
</code></pre>
     * <p>A parsing function should return a Date object, and is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>date</code> : String<div class="sub-desc">The date string to parse.</div></li>
     * <li><code>strict</code> : Boolean<div class="sub-desc">True to validate date strings while parsing
     * (i.e. prevent javascript Date "rollover") (The default must be false).
     * Invalid date strings should return null when parsed.</div></li>
     * </ul></div></p>
     * <p>To enable Dates to also be <i>formatted</i> according to that format, a corresponding
     * formatting function must be placed into the {@link #formatFunctions} property.
     * @property parseFunctions
     * @static
     * @type Object
     */
        parseFunctions: {
            "M$": function(input, strict) {
                // note: the timezone offset is ignored since the M$ Ajax server sends
                // a UTC milliseconds-since-Unix-epoch value (negative values are allowed)
                var re = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/');
                var r = (input || '').match(re);
                return r ? new Date(((r[1] || '') + r[2]) * 1) : null;
            }
        },
        parseRegexes: [],

        /**
     * <p>An object hash in which each property is a date formatting function. The property name is the
     * format string which corresponds to the produced formatted date string.</p>
     * <p>This object is automatically populated with date formatting functions as
     * date formats are requested for Ext standard formatting strings.</p>
     * <p>Custom formatting functions may be inserted into this object, keyed by a name which from then on
     * may be used as a format string to {@link #format}. Example:</p><pre><code>
Date.formatFunctions['x-date-format'] = myDateFormatter;
</code></pre>
     * <p>A formatting function should return a string representation of the passed Date object, and is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>date</code> : Date<div class="sub-desc">The Date to format.</div></li>
     * </ul></div></p>
     * <p>To enable date strings to also be <i>parsed</i> according to that format, a corresponding
     * parsing function must be placed into the {@link #parseFunctions} property.
     * @property formatFunctions
     * @static
     * @type Object
     */
        formatFunctions: {
            "M$": function() {
                // UTC milliseconds since Unix epoch (M$-AJAX serialized date format (MRSF))
                return '\\/Date(' + this.getTime() + ')\\/';
            }
        },

        y2kYear: 50,

        /**
     * Date interval constant
     * @static
     * @type String
     */
        MILLI: "ms",

        /**
     * Date interval constant
     * @static
     * @type String
     */
        SECOND: "s",

        /**
     * Date interval constant
     * @static
     * @type String
     */
        MINUTE: "mi",

        /** Date interval constant
     * @static
     * @type String
     */
        HOUR: "h",

        /**
     * Date interval constant
     * @static
     * @type String
     */
        DAY: "d",

        /**
     * Date interval constant
     * @static
     * @type String
     */
        MONTH: "mo",

        /**
     * Date interval constant
     * @static
     * @type String
     */
        YEAR: "y",

        /**
     * <p>An object hash containing default date values used during date parsing.</p>
     * <p>The following properties are available:<div class="mdetail-params"><ul>
     * <li><code>y</code> : Number<div class="sub-desc">The default year value. (defaults to undefined)</div></li>
     * <li><code>m</code> : Number<div class="sub-desc">The default 1-based month value. (defaults to undefined)</div></li>
     * <li><code>d</code> : Number<div class="sub-desc">The default day value. (defaults to undefined)</div></li>
     * <li><code>h</code> : Number<div class="sub-desc">The default hour value. (defaults to undefined)</div></li>
     * <li><code>i</code> : Number<div class="sub-desc">The default minute value. (defaults to undefined)</div></li>
     * <li><code>s</code> : Number<div class="sub-desc">The default second value. (defaults to undefined)</div></li>
     * <li><code>ms</code> : Number<div class="sub-desc">The default millisecond value. (defaults to undefined)</div></li>
     * </ul></div></p>
     * <p>Override these properties to customize the default date values used by the {@link #parseDate} method.</p>
     * <p><b>Note: In countries which experience Daylight Saving Time (i.e. DST), the <tt>h</tt>, <tt>i</tt>, <tt>s</tt>
     * and <tt>ms</tt> properties may coincide with the exact time in which DST takes effect.
     * It is the responsiblity of the developer to account for this.</b></p>
     * Example Usage:
     * <pre><code>
// set default day value to the first day of the month
Date.defaults.d = 1;

// parse a February date string containing only year and month values.
// setting the default day value to 1 prevents weird date rollover issues
// when attempting to parse the following date string on, for example, March 31st 2009.
Date.parseDate('2009-02', 'Y-m'); // returns a Date object representing February 1st 2009
</code></pre>
     * @property defaults
     * @static
     * @type Object
     */
        defaults: {},

        /**
     * An array of textual day names.
     * Override these values for international dates.
     * Example:
     * <pre><code>
Date.dayNames = [
    'SundayInYourLang',
    'MondayInYourLang',
    ...
];
</code></pre>
     * @type Array
     * @static
     */
        dayNames: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
        ],

        /**
     * An array of textual month names.
     * Override these values for international dates.
     * Example:
     * <pre><code>
Date.monthNames = [
    'JanInYourLang',
    'FebInYourLang',
    ...
];
</code></pre>
     * @type Array
     * @static
     */
        monthNames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
        ],

        /**
     * An object hash of zero-based javascript month numbers (with short month names as keys. note: keys are case-sensitive).
     * Override these values for international dates.
     * Example:
     * <pre><code>
Date.monthNumbers = {
    'ShortJanNameInYourLang':0,
    'ShortFebNameInYourLang':1,
    ...
};
</code></pre>
     * @type Object
     * @static
     */
        monthNumbers: {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11
        },

        /**
     * Get the short month name for the given month number.
     * Override this function for international dates.
     * @param {Number} month A zero-based javascript month number.
     * @return {String} The short month name.
     * @static
     */
        getShortMonthName: function(month) {
            return Date.monthNames[month].substring(0, 3);
        },

        /**
     * Get the short day name for the given day number.
     * Override this function for international dates.
     * @param {Number} day A zero-based javascript day number.
     * @return {String} The short day name.
     * @static
     */
        getShortDayName: function(day) {
            return Date.dayNames[day].substring(0, 3);
        },

        /**
     * Get the zero-based javascript month number for the given short/full month name.
     * Override this function for international dates.
     * @param {String} name The short/full month name.
     * @return {Number} The zero-based javascript month number.
     * @static
     */
        getMonthNumber: function(name) {
            // handle camel casing for english month names (since the keys for the Date.monthNumbers hash are case sensitive)
            return Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
        },

        /**
     * The base format-code to formatting-function hashmap used by the {@link #format} method.
     * Formatting functions are strings (or functions which return strings) which
     * will return the appropriate value when evaluated in the context of the Date object
     * from which the {@link #format} method is called.
     * Add to / override these mappings for custom date formatting.
     * Note: Date.format() treats characters as literals if an appropriate mapping cannot be found.
     * Example:
     * <pre><code>
Date.formatCodes.x = "String.leftPad(this.getDate(), 2, '0')";
(new Date()).format("X"); // returns the current day of the month
</code></pre>
     * @type Object
     * @static
     */
        formatCodes: {
            d: "String.leftPad(this.getDate(), 2, '0')",
            D: "Date.getShortDayName(this.getDay())",
            // get localised short day name
            j: "this.getDate()",
            l: "Date.dayNames[this.getDay()]",
            N: "(this.getDay() ? this.getDay() : 7)",
            S: "this.getSuffix()",
            w: "this.getDay()",
            z: "this.getDayOfYear()",
            W: "String.leftPad(this.getWeekOfYear(), 2, '0')",
            F: "Date.monthNames[this.getMonth()]",
            m: "String.leftPad(this.getMonth() + 1, 2, '0')",
            M: "Date.getShortMonthName(this.getMonth())",
            // get localised short month name
            n: "(this.getMonth() + 1)",
            t: "this.getDaysInMonth()",
            L: "(this.isLeapYear() ? 1 : 0)",
            o: "(this.getFullYear() + (this.getWeekOfYear() == 1 && this.getMonth() > 0 ? +1 : (this.getWeekOfYear() >= 52 && this.getMonth() < 11 ? -1 : 0)))",
            Y: "this.getFullYear()",
            y: "('' + this.getFullYear()).substring(2, 4)",
            a: "(this.getHours() < 12 ? 'am' : 'pm')",
            A: "(this.getHours() < 12 ? 'AM' : 'PM')",
            g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)",
            G: "this.getHours()",
            h: "String.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",
            H: "String.leftPad(this.getHours(), 2, '0')",
            i: "String.leftPad(this.getMinutes(), 2, '0')",
            s: "String.leftPad(this.getSeconds(), 2, '0')",
            u: "String.leftPad(this.getMilliseconds(), 3, '0')",
            O: "this.getGMTOffset()",
            P: "this.getGMTOffset(true)",
            T: "this.getTimezone()",
            Z: "(this.getTimezoneOffset() * -60)",

            c: function() {
                // ISO-8601 -- GMT format
                for (var c = "Y-m-dTH:i:sP", code = [], i = 0, l = c.length; i < l; ++i) {
                    var e = c.charAt(i);
                    code.push(e == "T" ? "'T'": Date.getFormatCode(e));
                    // treat T as a character literal
                }
                return code.join(" + ");
            },
            /*
        c: function() { // ISO-8601 -- UTC format
            return [
              "this.getUTCFullYear()", "'-'",
              "String.leftPad(this.getUTCMonth() + 1, 2, '0')", "'-'",
              "String.leftPad(this.getUTCDate(), 2, '0')",
              "'T'",
              "String.leftPad(this.getUTCHours(), 2, '0')", "':'",
              "String.leftPad(this.getUTCMinutes(), 2, '0')", "':'",
              "String.leftPad(this.getUTCSeconds(), 2, '0')",
              "'Z'"
            ].join(" + ");
        },
        */

            U: "Math.round(this.getTime() / 1000)"
        },

        /**
     * Checks if the passed Date parameters will cause a javascript Date "rollover".
     * @param {Number} year 4-digit year
     * @param {Number} month 1-based month-of-year
     * @param {Number} day Day of month
     * @param {Number} hour (optional) Hour
     * @param {Number} minute (optional) Minute
     * @param {Number} second (optional) Second
     * @param {Number} millisecond (optional) Millisecond
     * @return {Boolean} true if the passed parameters do not cause a Date "rollover", false otherwise.
     * @static
     */
        isValid: function(y, m, d, h, i, s, ms) {
            // setup defaults
            h = h || 0;
            i = i || 0;
            s = s || 0;
            ms = ms || 0;

            var dt = new Date(y, m - 1, d, h, i, s, ms);

            return y == dt.getFullYear() &&
            m == dt.getMonth() + 1 &&
            d == dt.getDate() &&
            h == dt.getHours() &&
            i == dt.getMinutes() &&
            s == dt.getSeconds() &&
            ms == dt.getMilliseconds();
        },

        /**
     * Parses the passed string using the specified date format.
     * Note that this function expects normal calendar dates, meaning that months are 1-based (i.e. 1 = January).
     * The {@link #defaults} hash will be used for any date value (i.e. year, month, day, hour, minute, second or millisecond)
     * which cannot be found in the passed string. If a corresponding default date value has not been specified in the {@link #defaults} hash,
     * the current date's year, month, day or DST-adjusted zero-hour time value will be used instead.
     * Keep in mind that the input date string must precisely match the specified format string
     * in order for the parse operation to be successful (failed parse operations return a null value).
     * <p>Example:</p><pre><code>
//dt = Fri May 25 2007 (current date)
var dt = new Date();

//dt = Thu May 25 2006 (today&#39;s month/day in 2006)
dt = Date.parseDate("2006", "Y");

//dt = Sun Jan 15 2006 (all date parts specified)
dt = Date.parseDate("2006-01-15", "Y-m-d");

//dt = Sun Jan 15 2006 15:20:01
dt = Date.parseDate("2006-01-15 3:20:01 PM", "Y-m-d g:i:s A");

// attempt to parse Sun Feb 29 2006 03:20:01 in strict mode
dt = Date.parseDate("2006-02-29 03:20:01", "Y-m-d H:i:s", true); // returns null
</code></pre>
     * @param {String} input The raw date string.
     * @param {String} format The expected date string format.
     * @param {Boolean} strict (optional) True to validate date strings while parsing (i.e. prevents javascript Date "rollover")
                        (defaults to false). Invalid date strings will return null when parsed.
     * @return {Date} The parsed Date.
     * @static
     */
        parseDate: function(input, format, strict) {
            var p = Date.parseFunctions;
            if (p[format] == null) {
                Date.createParser(format);
            }
            return p[format](input, Ext.isDefined(strict) ? strict: Date.useStrict);
        },

        // private
        getFormatCode: function(character) {
            var f = Date.formatCodes[character];

            if (f) {
                f = typeof f == 'function' ? f() : f;
                Date.formatCodes[character] = f;
                // reassign function result to prevent repeated execution
            }

            // note: unknown characters are treated as literals
            return f || ("'" + String.escape(character) + "'");
        },

        // private
        createFormat: function(format) {
            var code = [],
            special = false,
            ch = '';

            for (var i = 0; i < format.length; ++i) {
                ch = format.charAt(i);
                if (!special && ch == "\\") {
                    special = true;
                } else if (special) {
                    special = false;
                    code.push("'" + String.escape(ch) + "'");
                } else {
                    code.push(Date.getFormatCode(ch));
                }
            }
            Date.formatFunctions[format] = new Function("return " + code.join('+'));
        },

        // private
        createParser: function() {
            var code = [
            "var dt, y, m, d, h, i, s, ms, o, z, zz, u, v,",
            "def = Date.defaults,",
            "results = String(input).match(Date.parseRegexes[{0}]);",
            // either null, or an array of matched strings
            "if(results){",
            "{1}",

            "if(u != null){",
            // i.e. unix time is defined
            "v = new Date(u * 1000);",
            // give top priority to UNIX time
            "}else{",
            // create Date object representing midnight of the current day;
            // this will provide us with our date defaults
            // (note: clearTime() handles Daylight Saving Time automatically)
            "dt = (new Date()).clearTime();",

            // date calculations (note: these calculations create a dependency on Ext.num())
            "y = Ext.num(y, Ext.num(def.y, dt.getFullYear()));",
            "m = Ext.num(m, Ext.num(def.m - 1, dt.getMonth()));",
            "d = Ext.num(d, Ext.num(def.d, dt.getDate()));",

            // time calculations (note: these calculations create a dependency on Ext.num())
            "h  = Ext.num(h, Ext.num(def.h, dt.getHours()));",
            "i  = Ext.num(i, Ext.num(def.i, dt.getMinutes()));",
            "s  = Ext.num(s, Ext.num(def.s, dt.getSeconds()));",
            "ms = Ext.num(ms, Ext.num(def.ms, dt.getMilliseconds()));",

            "if(z >= 0 && y >= 0){",
            // both the year and zero-based day of year are defined and >= 0.
            // these 2 values alone provide sufficient info to create a full date object
            // create Date object representing January 1st for the given year
            "v = new Date(y, 0, 1, h, i, s, ms);",

            // then add day of year, checking for Date "rollover" if necessary
            "v = !strict? v : (strict === true && (z <= 364 || (v.isLeapYear() && z <= 365))? v.add(Date.DAY, z) : null);",
            "}else if(strict === true && !Date.isValid(y, m + 1, d, h, i, s, ms)){",
            // check for Date "rollover"
            "v = null;",
            // invalid date, so return null
            "}else{",
            // plain old Date object
            "v = new Date(y, m, d, h, i, s, ms);",
            "}",
            "}",
            "}",

            "if(v){",
            // favour UTC offset over GMT offset
            "if(zz != null){",
            // reset to UTC, then add offset
            "v = v.add(Date.SECOND, -v.getTimezoneOffset() * 60 - zz);",
            "}else if(o){",
            // reset to GMT, then add offset
            "v = v.add(Date.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));",
            "}",
            "}",

            "return v;"
            ].join('\n');

            return function(format) {
                var regexNum = Date.parseRegexes.length,
                currentGroup = 1,
                calc = [],
                regex = [],
                special = false,
                ch = "";

                for (var i = 0; i < format.length; ++i) {
                    ch = format.charAt(i);
                    if (!special && ch == "\\") {
                        special = true;
                    } else if (special) {
                        special = false;
                        regex.push(String.escape(ch));
                    } else {
                        var obj = $f(ch, currentGroup);
                        currentGroup += obj.g;
                        regex.push(obj.s);
                        if (obj.g && obj.c) {
                            calc.push(obj.c);
                        }
                    }
                }

                Date.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$");
                Date.parseFunctions[format] = new Function("input", "strict", xf(code, regexNum, calc.join('')));
            };
        }(),

        // private
        parseCodes: {
            /*
         * Notes:
         * g = {Number} calculation group (0 or 1. only group 1 contributes to date calculations.)
         * c = {String} calculation method (required for group 1. null for group 0. {0} = currentGroup - position in regex result array)
         * s = {String} regex pattern. all matches are stored in results[], and are accessible by the calculation mapped to 'c'
         */
            d: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                // day of month with leading zeroes (01 - 31)
            },
            j: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,2})"
                // day of month without leading zeroes (1 - 31)
            },
            D: function() {
                for (var a = [], i = 0; i < 7; a.push(Date.getShortDayName(i)), ++i);
                // get localised short day names
                return {
                    g: 0,
                    c: null,
                    s: "(?:" + a.join("|") + ")"
                };
            },
            l: function() {
                return {
                    g: 0,
                    c: null,
                    s: "(?:" + Date.dayNames.join("|") + ")"
                };
            },
            N: {
                g: 0,
                c: null,
                s: "[1-7]"
                // ISO-8601 day number (1 (monday) - 7 (sunday))
            },
            S: {
                g: 0,
                c: null,
                s: "(?:st|nd|rd|th)"
            },
            w: {
                g: 0,
                c: null,
                s: "[0-6]"
                // javascript day number (0 (sunday) - 6 (saturday))
            },
            z: {
                g: 1,
                c: "z = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,3})"
                // day of the year (0 - 364 (365 in leap years))
            },
            W: {
                g: 0,
                c: null,
                s: "(?:\\d{2})"
                // ISO-8601 week number (with leading zero)
            },
            F: function() {
                return {
                    g: 1,
                    c: "m = parseInt(Date.getMonthNumber(results[{0}]), 10);\n",
                    // get localised month number
                    s: "(" + Date.monthNames.join("|") + ")"
                };
            },
            M: function() {
                for (var a = [], i = 0; i < 12; a.push(Date.getShortMonthName(i)), ++i);
                // get localised short month names
                return Ext.applyIf({
                    s: "(" + a.join("|") + ")"
                },
                $f("F"));
            },
            m: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(\\d{2})"
                // month number with leading zeros (01 - 12)
            },
            n: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(\\d{1,2})"
                // month number without leading zeros (1 - 12)
            },
            t: {
                g: 0,
                c: null,
                s: "(?:\\d{2})"
                // no. of days in the month (28 - 31)
            },
            L: {
                g: 0,
                c: null,
                s: "(?:1|0)"
            },
            o: function() {
                return $f("Y");
            },
            Y: {
                g: 1,
                c: "y = parseInt(results[{0}], 10);\n",
                s: "(\\d{4})"
                // 4-digit year
            },
            y: {
                g: 1,
                c: "var ty = parseInt(results[{0}], 10);\n"
                + "y = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",
                // 2-digit year
                s: "(\\d{1,2})"
            },
            a: {
                g: 1,
                c: "if (results[{0}] == 'am') {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
                s: "(am|pm)"
            },
            A: {
                g: 1,
                c: "if (results[{0}] == 'AM') {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
                s: "(AM|PM)"
            },
            g: function() {
                return $f("G");
            },
            G: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,2})"
                // 24-hr format of an hour without leading zeroes (0 - 23)
            },
            h: function() {
                return $f("H");
            },
            H: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                //  24-hr format of an hour with leading zeroes (00 - 23)
            },
            i: {
                g: 1,
                c: "i = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                // minutes with leading zeros (00 - 59)
            },
            s: {
                g: 1,
                c: "s = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
                // seconds with leading zeros (00 - 59)
            },
            u: {
                g: 1,
                c: "ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
                s: "(\\d+)"
                // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
            },
            O: {
                g: 1,
                c: [
                "o = results[{0}];",
                "var sn = o.substring(0,1),",
                // get + / - sign
                "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),",
                // get hours (performs minutes-to-hour conversion also, just in case)
                "mn = o.substring(3,5) % 60;",
                // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + String.leftPad(hr, 2, '0') + String.leftPad(mn, 2, '0')) : null;\n"
                // -12hrs <= GMT offset <= 14hrs
                ].join("\n"),
                s: "([+\-]\\d{4})"
                // GMT offset in hrs and mins
            },
            P: {
                g: 1,
                c: [
                "o = results[{0}];",
                "var sn = o.substring(0,1),",
                // get + / - sign
                "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),",
                // get hours (performs minutes-to-hour conversion also, just in case)
                "mn = o.substring(4,6) % 60;",
                // get minutes
                "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + String.leftPad(hr, 2, '0') + String.leftPad(mn, 2, '0')) : null;\n"
                // -12hrs <= GMT offset <= 14hrs
                ].join("\n"),
                s: "([+\-]\\d{2}:\\d{2})"
                // GMT offset in hrs and mins (with colon separator)
            },
            T: {
                g: 0,
                c: null,
                s: "[A-Z]{1,4}"
                // timezone abbrev. may be between 1 - 4 chars
            },
            Z: {
                g: 1,
                c: "zz = results[{0}] * 1;\n"
                // -43200 <= UTC offset <= 50400
                + "zz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
                s: "([+\-]?\\d{1,5})"
                // leading '+' sign is optional for UTC offset
            },
            c: function() {
                var calc = [],
                arr = [
                $f("Y", 1),
                // year
                $f("m", 2),
                // month
                $f("d", 3),
                // day
                $f("h", 4),
                // hour
                $f("i", 5),
                // minute
                $f("s", 6),
                // second
                {
                    c: "ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"
                },
                // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
                {
                    c: [
                    // allow either "Z" (i.e. UTC) or "-0530" or "+08:00" (i.e. UTC offset) timezone delimiters. assumes local timezone if no timezone is specified
                    "if(results[8]) {",
                    // timezone specified
                    "if(results[8] == 'Z'){",
                    "zz = 0;",
                    // UTC
                    "}else if (results[8].indexOf(':') > -1){",
                    $f("P", 8).c,
                    // timezone offset with colon separator
                    "}else{",
                    $f("O", 8).c,
                    // timezone offset without colon separator
                    "}",
                    "}"
                    ].join('\n')
                }
                ];

                for (var i = 0, l = arr.length; i < l; ++i) {
                    calc.push(arr[i].c);
                }

                return {
                    g: 1,
                    c: calc.join(""),
                    s: [
                    arr[0].s,
                    // year (required)
                    "(?:", "-", arr[1].s,
                    // month (optional)
                    "(?:", "-", arr[2].s,
                    // day (optional)
                    "(?:",
                    "(?:T| )?",
                    // time delimiter -- either a "T" or a single blank space
                    arr[3].s, ":", arr[4].s,
                    // hour AND minute, delimited by a single colon (optional). MUST be preceded by either a "T" or a single blank space
                    "(?::", arr[5].s, ")?",
                    // seconds (optional)
                    "(?:(?:\\.|,)(\\d+))?",
                    // decimal fraction of a second (e.g. ",12345" or ".98765") (optional)
                    "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?",
                    // "Z" (UTC) or "-0530" (UTC offset without colon delimiter) or "+08:00" (UTC offset with colon delimiter) (optional)
                    ")?",
                    ")?",
                    ")?"
                    ].join("")
                };
            },
            U: {
                g: 1,
                c: "u = parseInt(results[{0}], 10);\n",
                s: "(-?\\d+)"
                // leading minus sign indicates seconds before UNIX epoch
            }
        }
    });

} ());

Ext.apply(Date.prototype, {
    // private
    dateFormat: function(format) {
        if (Date.formatFunctions[format] == null) {
            Date.createFormat(format);
        }
        return Date.formatFunctions[format].call(this);
    },

    /**
     * Get the timezone abbreviation of the current date (equivalent to the format specifier 'T').
     *
     * Note: The date string returned by the javascript Date object's toString() method varies
     * between browsers (e.g. FF vs IE) and system region settings (e.g. IE in Asia vs IE in America).
     * For a given date string e.g. "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)",
     * getTimezone() first tries to get the timezone abbreviation from between a pair of parentheses
     * (which may or may not be present), failing which it proceeds to get the timezone abbreviation
     * from the GMT offset portion of the date string.
     * @return {String} The abbreviated timezone name (e.g. 'CST', 'PDT', 'EDT', 'MPST' ...).
     */
    getTimezone: function() {
        // the following list shows the differences between date strings from different browsers on a WinXP SP2 machine from an Asian locale:
        //
        // Opera  : "Thu, 25 Oct 2007 22:53:45 GMT+0800" -- shortest (weirdest) date string of the lot
        // Safari : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone (same as FF)
        // FF     : "Thu Oct 25 2007 22:55:35 GMT+0800 (Malay Peninsula Standard Time)" -- value in parentheses always gives the correct timezone
        // IE     : "Thu Oct 25 22:54:35 UTC+0800 2007" -- (Asian system setting) look for 3-4 letter timezone abbrev
        // IE     : "Thu Oct 25 17:06:37 PDT 2007" -- (American system setting) look for 3-4 letter timezone abbrev
        //
        // this crazy regex attempts to guess the correct timezone abbreviation despite these differences.
        // step 1: (?:\((.*)\) -- find timezone in parentheses
        // step 2: ([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?) -- if nothing was found in step 1, find timezone from timezone offset portion of date string
        // step 3: remove all non uppercase characters found in step 1 and 2
        return this.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
    },

    /**
     * Get the offset from GMT of the current date (equivalent to the format specifier 'O').
     * @param {Boolean} colon (optional) true to separate the hours and minutes with a colon (defaults to false).
     * @return {String} The 4-character offset string prefixed with + or - (e.g. '-0600').
     */
    getGMTOffset: function(colon) {
        return (this.getTimezoneOffset() > 0 ? "-": "+")
        + String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset()) / 60), 2, "0")
        + (colon ? ":": "")
        + String.leftPad(Math.abs(this.getTimezoneOffset() % 60), 2, "0");
    },

    /**
     * Get the numeric day number of the year, adjusted for leap year.
     * @return {Number} 0 to 364 (365 in leap years).
     */
    getDayOfYear: function() {
        var num = 0,
        d = this.clone(),
        m = this.getMonth(),
        i;

        for (i = 0, d.setDate(1), d.setMonth(0); i < m; d.setMonth(++i)) {
            num += d.getDaysInMonth();
        }
        return num + this.getDate() - 1;
    },

    /**
     * Get the numeric ISO-8601 week number of the year.
     * (equivalent to the format specifier 'W', but without a leading zero).
     * @return {Number} 1 to 53
     */
    getWeekOfYear: function() {
        // adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
        var ms1d = 864e5,
        // milliseconds in a day
        ms7d = 7 * ms1d;
        // milliseconds in a week
        return function() {
            // return a closure so constants get calculated only once
            var DC3 = Date.UTC(this.getFullYear(), this.getMonth(), this.getDate() + 3) / ms1d,
            // an Absolute Day Number
            AWN = Math.floor(DC3 / 7),
            // an Absolute Week Number
            Wyr = new Date(AWN * ms7d).getUTCFullYear();

            return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
        };
    }(),

    /**
     * Checks if the current date falls within a leap year.
     * @return {Boolean} True if the current date falls within a leap year, false otherwise.
     */
    isLeapYear: function() {
        var year = this.getFullYear();
        return !! ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
    },

    /**
     * Get the first day of the current month, adjusted for leap year.  The returned value
     * is the numeric day index within the week (0-6) which can be used in conjunction with
     * the {@link #monthNames} array to retrieve the textual day name.
     * Example:
     * <pre><code>
var dt = new Date('1/10/2007');
document.write(Date.dayNames[dt.getFirstDayOfMonth()]); //output: 'Monday'
</code></pre>
     * @return {Number} The day number (0-6).
     */
    getFirstDayOfMonth: function() {
        var day = (this.getDay() - (this.getDate() - 1)) % 7;
        return (day < 0) ? (day + 7) : day;
    },

    /**
     * Get the last day of the current month, adjusted for leap year.  The returned value
     * is the numeric day index within the week (0-6) which can be used in conjunction with
     * the {@link #monthNames} array to retrieve the textual day name.
     * Example:
     * <pre><code>
var dt = new Date('1/10/2007');
document.write(Date.dayNames[dt.getLastDayOfMonth()]); //output: 'Wednesday'
</code></pre>
     * @return {Number} The day number (0-6).
     */
    getLastDayOfMonth: function() {
        return this.getLastDateOfMonth().getDay();
    },


    /**
     * Get the date of the first day of the month in which this date resides.
     * @return {Date}
     */
    getFirstDateOfMonth: function() {
        return new Date(this.getFullYear(), this.getMonth(), 1);
    },

    /**
     * Get the date of the last day of the month in which this date resides.
     * @return {Date}
     */
    getLastDateOfMonth: function() {
        return new Date(this.getFullYear(), this.getMonth(), this.getDaysInMonth());
    },

    /**
     * Get the number of days in the current month, adjusted for leap year.
     * @return {Number} The number of days in the month.
     */
    getDaysInMonth: function() {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        return function() {
            // return a closure for efficiency
            var m = this.getMonth();

            return m == 1 && this.isLeapYear() ? 29: daysInMonth[m];
        };
    }(),

    /**
     * Get the English ordinal suffix of the current day (equivalent to the format specifier 'S').
     * @return {String} 'st, 'nd', 'rd' or 'th'.
     */
    getSuffix: function() {
        switch (this.getDate()) {
        case 1:
        case 21:
        case 31:
            return "st";
        case 2:
        case 22:
            return "nd";
        case 3:
        case 23:
            return "rd";
        default:
            return "th";
        }
    },

    /**
     * Creates and returns a new Date instance with the exact same date value as the called instance.
     * Dates are copied and passed by reference, so if a copied date variable is modified later, the original
     * variable will also be changed.  When the intention is to create a new variable that will not
     * modify the original instance, you should create a clone.
     *
     * Example of correctly cloning a date:
     * <pre><code>
//wrong way:
var orig = new Date('10/1/2006');
var copy = orig;
copy.setDate(5);
document.write(orig);  //returns 'Thu Oct 05 2006'!

//correct way:
var orig = new Date('10/1/2006');
var copy = orig.clone();
copy.setDate(5);
document.write(orig);  //returns 'Thu Oct 01 2006'
</code></pre>
     * @return {Date} The new Date instance.
     */
    clone: function() {
        return new Date(this.getTime());
    },

    /**
     * Checks if the current date is affected by Daylight Saving Time (DST).
     * @return {Boolean} True if the current date is affected by DST.
     */
    isDST: function() {
        // adapted from http://extjs.com/forum/showthread.php?p=247172#post247172
        // courtesy of @geoffrey.mcgill
        return new Date(this.getFullYear(), 0, 1).getTimezoneOffset() != this.getTimezoneOffset();
    },

    /**
     * Attempts to clear all time information from this Date by setting the time to midnight of the same day,
     * automatically adjusting for Daylight Saving Time (DST) where applicable.
     * (note: DST timezone information for the browser's host operating system is assumed to be up-to-date)
     * @param {Boolean} clone true to create a clone of this date, clear the time and return it (defaults to false).
     * @return {Date} this or the clone.
     */
    clearTime: function(clone) {
        if (clone) {
            return this.clone().clearTime();
        }

        // get current date before clearing time
        var d = this.getDate();

        // clear time
        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);

        if (this.getDate() != d) {
            // account for DST (i.e. day of month changed when setting hour = 0)
            // note: DST adjustments are assumed to occur in multiples of 1 hour (this is almost always the case)
            // refer to http://www.timeanddate.com/time/aboutdst.html for the (rare) exceptions to this rule
            // increment hour until cloned date == current date
            for (var hr = 1, c = this.add(Date.HOUR, hr); c.getDate() != d; hr++, c = this.add(Date.HOUR, hr));

            this.setDate(d);
            this.setHours(c.getHours());
        }

        return this;
    },

    /**
     * Provides a convenient method for performing basic date arithmetic. This method
     * does not modify the Date instance being called - it creates and returns
     * a new Date instance containing the resulting date value.
     *
     * Examples:
     * <pre><code>
// Basic usage:
var dt = new Date('10/29/2006').add(Date.DAY, 5);
document.write(dt); //returns 'Fri Nov 03 2006 00:00:00'

// Negative values will be subtracted:
var dt2 = new Date('10/1/2006').add(Date.DAY, -5);
document.write(dt2); //returns 'Tue Sep 26 2006 00:00:00'

// You can even chain several calls together in one line:
var dt3 = new Date('10/1/2006').add(Date.DAY, 5).add(Date.HOUR, 8).add(Date.MINUTE, -30);
document.write(dt3); //returns 'Fri Oct 06 2006 07:30:00'
</code></pre>
     *
     * @param {String} interval A valid date interval enum value.
     * @param {Number} value The amount to add to the current date.
     * @return {Date} The new Date instance.
     */
    add: function(interval, value) {
        var d = this.clone();
        if (!interval || value === 0) return d;

        switch (interval.toLowerCase()) {
        case Date.MILLI:
            d.setMilliseconds(this.getMilliseconds() + value);
            break;
        case Date.SECOND:
            d.setSeconds(this.getSeconds() + value);
            break;
        case Date.MINUTE:
            d.setMinutes(this.getMinutes() + value);
            break;
        case Date.HOUR:
            d.setHours(this.getHours() + value);
            break;
        case Date.DAY:
            d.setDate(this.getDate() + value);
            break;
        case Date.MONTH:
            var day = this.getDate();
            if (day > 28) {
                day = Math.min(day, this.getFirstDateOfMonth().add('mo', value).getLastDateOfMonth().getDate());
            }
            d.setDate(day);
            d.setMonth(this.getMonth() + value);
            break;
        case Date.YEAR:
            d.setFullYear(this.getFullYear() + value);
            break;
        }
        return d;
    },

    /**
     * Checks if this date falls on or between the given start and end dates.
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Boolean} true if this date falls on or between the given start and end dates.
     */
    between: function(start, end) {
        var t = this.getTime();
        return start.getTime() <= t && t <= end.getTime();
    }
});


/**
 * Formats a date given the supplied format string.
 * @param {String} format The format string.
 * @return {String} The formatted date.
 * @method format
 */
Date.prototype.format = Date.prototype.dateFormat;


// private
if (Ext.isSafari && (navigator.userAgent.match(/WebKit\/(\d+)/)[1] || NaN) < 420) {
    Ext.apply(Date.prototype, {
        _xMonth: Date.prototype.setMonth,
        _xDate: Date.prototype.setDate,

        // Bug in Safari 1.3, 2.0 (WebKit build < 420)
        // Date.setMonth does not work consistently if iMonth is not 0-11
        setMonth: function(num) {
            if (num <= -1) {
                var n = Math.ceil( - num),
                back_year = Math.ceil(n / 12),
                month = (n % 12) ? 12 - n % 12: 0;

                this.setFullYear(this.getFullYear() - back_year);

                return this._xMonth(month);
            } else {
                return this._xMonth(num);
            }
        },

        // Bug in setDate() method (resolved in WebKit build 419.3, so to be safe we target Webkit builds < 420)
        // The parameter for Date.setDate() is converted to a signed byte integer in Safari
        // http://brianary.blogspot.com/2006/03/safari-date-bug.html
        setDate: function(d) {
            // use setTime() to workaround setDate() bug
            // subtract current day of month in milliseconds, then add desired day of month in milliseconds
            return this.setTime(this.getTime() - (this.getDate() - d) * 864e5);
        }
    });
}



/* Some basic Date tests... (requires Firebug)

Date.parseDate('', 'c'); // call Date.parseDate() once to force computation of regex string so we can console.log() it
console.log('Insane Regex for "c" format: %o', Date.parseCodes.c.s); // view the insane regex for the "c" format specifier

// standard tests
console.group('Standard Date.parseDate() Tests');
    console.log('Date.parseDate("2009-01-05T11:38:56", "c")               = %o', Date.parseDate("2009-01-05T11:38:56", "c")); // assumes browser's timezone setting
    console.log('Date.parseDate("2009-02-04T12:37:55.001000", "c")        = %o', Date.parseDate("2009-02-04T12:37:55.001000", "c")); // assumes browser's timezone setting
    console.log('Date.parseDate("2009-03-03T13:36:54,101000Z", "c")       = %o', Date.parseDate("2009-03-03T13:36:54,101000Z", "c")); // UTC
    console.log('Date.parseDate("2009-04-02T14:35:53.901000-0530", "c")   = %o', Date.parseDate("2009-04-02T14:35:53.901000-0530", "c")); // GMT-0530
    console.log('Date.parseDate("2009-05-01T15:34:52,9876000+08:00", "c") = %o', Date.parseDate("2009-05-01T15:34:52,987600+08:00", "c")); // GMT+08:00
console.groupEnd();

// ISO-8601 format as specified in http://www.w3.org/TR/NOTE-datetime
// -- accepts ALL 6 levels of date-time granularity
console.group('ISO-8601 Granularity Test (see http://www.w3.org/TR/NOTE-datetime)');
    console.log('Date.parseDate("1997", "c")                              = %o', Date.parseDate("1997", "c")); // YYYY (e.g. 1997)
    console.log('Date.parseDate("1997-07", "c")                           = %o', Date.parseDate("1997-07", "c")); // YYYY-MM (e.g. 1997-07)
    console.log('Date.parseDate("1997-07-16", "c")                        = %o', Date.parseDate("1997-07-16", "c")); // YYYY-MM-DD (e.g. 1997-07-16)
    console.log('Date.parseDate("1997-07-16T19:20+01:00", "c")            = %o', Date.parseDate("1997-07-16T19:20+01:00", "c")); // YYYY-MM-DDThh:mmTZD (e.g. 1997-07-16T19:20+01:00)
    console.log('Date.parseDate("1997-07-16T19:20:30+01:00", "c")         = %o', Date.parseDate("1997-07-16T19:20:30+01:00", "c")); // YYYY-MM-DDThh:mm:ssTZD (e.g. 1997-07-16T19:20:30+01:00)
    console.log('Date.parseDate("1997-07-16T19:20:30.45+01:00", "c")      = %o', Date.parseDate("1997-07-16T19:20:30.45+01:00", "c")); // YYYY-MM-DDThh:mm:ss.sTZD (e.g. 1997-07-16T19:20:30.45+01:00)
    console.log('Date.parseDate("1997-07-16 19:20:30.45+01:00", "c")      = %o', Date.parseDate("1997-07-16 19:20:30.45+01:00", "c")); // YYYY-MM-DD hh:mm:ss.sTZD (e.g. 1997-07-16T19:20:30.45+01:00)
    console.log('Date.parseDate("1997-13-16T19:20:30.45+01:00", "c", true)= %o', Date.parseDate("1997-13-16T19:20:30.45+01:00", "c", true)); // strict date parsing with invalid month value
console.groupEnd();

*/

/**
 * @class Ext.Template
 * <p>Represents an HTML fragment template. Templates may be {@link #compile precompiled}
 * for greater performance.</p>
 * <p>For example usage {@link #Template see the constructor}.</p>
 *
 * @constructor
 * An instance of this class may be created by passing to the constructor either
 * a single argument, or multiple arguments:
 * <div class="mdetail-params"><ul>
 * <li><b>single argument</b> : String/Array
 * <div class="sub-desc">
 * The single argument may be either a String or an Array:<ul>
 * <li><tt>String</tt> : </li><pre><code>
var t = new Ext.Template("&lt;div>Hello {0}.&lt;/div>");
t.{@link #append}('some-element', ['foo']);
   </code></pre>
 * <li><tt>Array</tt> : </li>
 * An Array will be combined with <code>join('')</code>.
<pre><code>
var t = new Ext.Template([
    '&lt;div name="{id}"&gt;',
        '&lt;span class="{cls}"&gt;{name:trim} {value:ellipsis(10)}&lt;/span&gt;',
    '&lt;/div&gt;',
]);
t.{@link #compile}();
t.{@link #append}('some-element', {id: 'myid', cls: 'myclass', name: 'foo', value: 'bar'});
   </code></pre>
 * </ul></div></li>
 * <li><b>multiple arguments</b> : String, Object, Array, ...
 * <div class="sub-desc">
 * Multiple arguments will be combined with <code>join('')</code>.
 * <pre><code>
var t = new Ext.Template(
    '&lt;div name="{id}"&gt;',
        '&lt;span class="{cls}"&gt;{name} {value}&lt;/span&gt;',
    '&lt;/div&gt;',
    // a configuration object:
    {
        compiled: true,      // {@link #compile} immediately
    }
);
   </code></pre>
 * <p><b>Notes</b>:</p>
 * <div class="mdetail-params"><ul>
 * <li>Formatting and <code>disableFormats</code> are not applicable for Sencha Touch.</li>
 * </ul></div>
 * </div></li>
 * </ul></div>
 * @param {Mixed} config
 */
Ext.Template = function(html) {
    var me = this,
        a = arguments,
        buf = [];

    if (Ext.isArray(html)) {
        html = html.join("");
    }
    else if (a.length > 1) {
        Ext.each(a, function(v) {
            if (Ext.isObject(v)) {
                Ext.apply(me, v);
            } else {
                buf.push(v);
            }
        });
        html = buf.join('');
    }

    // @private
    me.html = html;
    /**
      * @cfg {Boolean} compiled Specify <tt>true</tt> to compile the template
      * immediately (see <code>{@link #compile}</code>).
      * Defaults to <tt>false</tt>.
      */
    if (me.compiled) {
        me.compile();
    }
};

Ext.Template.prototype = {
    /**
     * The regular expression used to match template variables
     * @type RegExp
     * @property
     * @hide repeat doc
     */
    re: /\{([\w-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,
    argsRe: /^\s*['"](.*)["']\s*$/,
    compileARe: /\\/g,
    compileBRe: /(\r\n|\n)/g,
    compileCRe: /'/g,
    /**
     * See <code>{@link #re}</code>.
     * @type RegExp
     * @property re
     */

    disableFormats: false,
    /**
      * See <code>{@link #disableFormats}</code>.
      * @type Boolean
      * @property disableFormats
      */

    /**
     * Returns an HTML fragment of this template with the specified values applied.
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @return {String} The HTML fragment
     * @hide repeat doc
     */
    applyTemplate: function(values) {
        var me = this,
            useF = me.disableFormats !== true,
            fm = Ext.util.Format,
            tpl = me,
            re,
            i,
            len;

        if (me.compiled) {
            return me.compiled(values);
        }
        function fn(m, name, format, args) {
            if (format && useF) {
                if (format.substr(0, 5) == "this.") {
                    return tpl.call(format.substr(5), values[name], values);
                }
                else {
                    if (args) {
                        // quoted values are required for strings in compiled templates,
                        // but for non compiled we need to strip them
                        // quoted reversed for jsmin
                        re = me.argsRe;
                        args = args.split(',');
                        for (i = 0, len = args.length; i < len; i++) {
                            args[i] = args[i].replace(re, "$1");
                        }
                        args = [values[name]].concat(args);
                    }
                    else {
                        args = [values[name]];
                    }
                    return fm[format].apply(fm, args);
                }
            }
            else {
                return values[name] !== undefined ? values[name] : "";
            }
        }
        return me.html.replace(me.re, fn);
    },

    /**
     * Sets the HTML used as the template and optionally compiles it.
     * @param {String} html
     * @param {Boolean} compile (optional) True to compile the template (defaults to undefined)
     * @return {Ext.Template} this
     */
    set: function(html, compile) {
        var me = this;
        me.html = html;
        me.compiled = null;
        return compile ? me.compile() : me;
    },

    /**
     * Compiles the template into an internal function, eliminating the RegEx overhead.
     * @return {Ext.Template} this
     * @hide repeat doc
     */
    compile: function() {
        var me = this,
            fm = Ext.util.Format,
            useF = me.disableFormats !== true,
            body;

        function fn(m, name, format, args) {
            if (format && useF) {
                args = args ? ',' + args: "";
                if (format.substr(0, 5) != "this.") {
                    format = "fm." + format + '(';
                }
                else {
                    format = 'this.call("' + format.substr(5) + '", ';
                    args = ", values";
                }
            }
            else {
                args = '';
                format = "(values['" + name + "'] == undefined ? '' : ";
            }
            return "'," + format + "values['" + name + "']" + args + ") ,'";
        }

        // branched to use + in gecko and [].join() in others
        if (Ext.isGecko) {
            body = "this.compiled = function(values){ return '" +
            me.html.replace(me.compileARe, '\\\\').replace(me.compileBRe, '\\n').replace(me.compileCRe, "\\'").replace(me.re, fn) +
            "';};";
        }
        else {
            body = ["this.compiled = function(values){ return ['"];
            body.push(me.html.replace(me.compileARe, '\\\\').replace(me.compileBRe, '\\n').replace(me.compileCRe, "\\'").replace(me.re, fn));
            body.push("'].join('');};");
            body = body.join('');
        }
        eval(body);
        return me;
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) as the first child of el.
     * @param {Mixed} el The context element
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @param {Boolean} returnElement (optional) true to return a Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertFirst: function(el, values, returnElement) {
        return this.doInsert('afterBegin', el, values, returnElement);
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) before el.
     * @param {Mixed} el The context element
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @param {Boolean} returnElement (optional) true to return a Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertBefore: function(el, values, returnElement) {
        return this.doInsert('beforeBegin', el, values, returnElement);
    },

    /**
     * Applies the supplied values to the template and inserts the new node(s) after el.
     * @param {Mixed} el The context element
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @param {Boolean} returnElement (optional) true to return a Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    insertAfter: function(el, values, returnElement) {
        return this.doInsert('afterEnd', el, values, returnElement);
    },

    /**
     * Applies the supplied <code>values</code> to the template and appends
     * the new node(s) to the specified <code>el</code>.
     * <p>For example usage {@link #Template see the constructor}.</p>
     * @param {Mixed} el The context element
     * @param {Object/Array} values
     * The template values. Can be an array if the params are numeric (i.e. <code>{0}</code>)
     * or an object (i.e. <code>{foo: 'bar'}</code>).
     * @param {Boolean} returnElement (optional) true to return an Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    append: function(el, values, returnElement) {
        return this.doInsert('beforeEnd', el, values, returnElement);
    },

    doInsert: function(where, el, values, returnEl) {
        el = Ext.getDom(el);
        var newNode = Ext.DomHelper.insertHtml(where, el, this.applyTemplate(values));
        return returnEl ? Ext.get(newNode, true) : newNode;
    },

    /**
     * Applies the supplied values to the template and overwrites the content of el with the new node(s).
     * @param {Mixed} el The context element
     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
     * @param {Boolean} returnElement (optional) true to return a Ext.Element (defaults to undefined)
     * @return {HTMLElement/Ext.Element} The new node or Element
     */
    overwrite: function(el, values, returnElement) {
        el = Ext.getDom(el);
        el.innerHTML = this.applyTemplate(values);
        return returnElement ? Ext.get(el.firstChild, true) : el.firstChild;
    },

    // private function used to call members
    call: function(fnName, value, allValues) {
        return this[fnName](value, allValues);
    }
};
/**
 * Alias for {@link #applyTemplate}
 * Returns an HTML fragment of this template with the specified <code>values</code> applied.
 * @param {Object/Array} values
 * The template values. Can be an array if the params are numeric (i.e. <code>{0}</code>)
 * or an object (i.e. <code>{foo: 'bar'}</code>).
 * @return {String} The HTML fragment
 * @member Ext.Template
 * @method apply
 */
Ext.Template.prototype.apply = Ext.Template.prototype.applyTemplate;

/**
 * Creates a template from the passed element's value (<i>display:none</i> textarea, preferred) or innerHTML.
 * @param {String/HTMLElement} el A DOM element or its id
 * @param {Object} config A configuration object
 * @return {Ext.Template} The created template
 * @static
 */
Ext.Template.from = function(el, config) {
    el = Ext.getDom(el);
    return new Ext.Template(el.value || el.innerHTML, config || '');
};

/**
 * @class Ext.XTemplate
 * @extends Ext.Template
 * <p>A template class that supports advanced functionality like:<div class="mdetail-params"><ul>
 * <li>Autofilling arrays using templates and sub-templates</li>
 * <li>Conditional processing with basic comparison operators</li>
 * <li>Basic math function support</li>
 * <li>Execute arbitrary inline code with special built-in template variables</li>
 * <li>Custom member functions</li>
 * <li>Many special tags and built-in operators that aren't defined as part of
 * the API, but are supported in the templates that can be created</li>
 * </ul></div></p>
 * <p>XTemplate provides the templating mechanism built into:<div class="mdetail-params"><ul>
 * <li>{@link Ext.DataView}</li>
 * </ul></div></p>
 *
 * <p>For example usage {@link #XTemplate see the constructor}.</p>
 *
 * @constructor
 * The {@link Ext.Template#Template Ext.Template constructor} describes
 * the acceptable parameters to pass to the constructor. The following
 * examples demonstrate all of the supported features.</p>
 *
 * <div class="mdetail-params"><ul>
 *
 * <li><b><u>Sample Data</u></b>
 * <div class="sub-desc">
 * <p>This is the data object used for reference in each code example:</p>
 * <pre><code>
var data = {
    name: 'Tommy Maintz',
    title: 'Lead Developer',
    company: 'Ext JS, Inc',
    email: 'tommy@extjs.com',
    address: '5 Cups Drive',
    city: 'Palo Alto',
    state: 'CA',
    zip: '44102',
    drinks: ['Coffee', 'Soda', 'Water'],
    kids: [{
        name: 'Joshua',
        age:3
    },{
        name: 'Matthew',
        age:2
    },{
        name: 'Solomon',
        age:0
    }]
};
   </code></pre>
 * </div>
 * </li>
 *
 *
 * <li><b><u>Auto filling of arrays</u></b>
 * <div class="sub-desc">
 * <p>The <b><tt>tpl</tt></b> tag and the <b><tt>for</tt></b> operator are used
 * to process the provided data object:
 * <ul>
 * <li>If the value specified in <tt>for</tt> is an array, it will auto-fill,
 * repeating the template block inside the <tt>tpl</tt> tag for each item in the
 * array.</li>
 * <li>If <tt>for="."</tt> is specified, the data object provided is examined.</li>
 * <li>While processing an array, the special variable <tt>{#}</tt>
 * will provide the current array index + 1 (starts at 1, not 0).</li>
 * </ul>
 * </p>
 * <pre><code>
&lt;tpl <b>for</b>=".">...&lt;/tpl>       // loop through array at root node
&lt;tpl <b>for</b>="foo">...&lt;/tpl>     // loop through array at foo node
&lt;tpl <b>for</b>="foo.bar">...&lt;/tpl> // loop through array at foo.bar node
   </code></pre>
 * Using the sample data above:
 * <pre><code>
var tpl = new Ext.XTemplate(
    '&lt;p>Kids: ',
    '&lt;tpl <b>for</b>=".">',       // process the data.kids node
        '&lt;p>{#}. {name}&lt;/p>',  // use current array index to autonumber
    '&lt;/tpl>&lt;/p>'
);
tpl.overwrite(panel.body, data.kids); // pass the kids property of the data object
   </code></pre>
 * <p>An example illustrating how the <b><tt>for</tt></b> property can be leveraged
 * to access specified members of the provided data object to populate the template:</p>
 * <pre><code>
var tpl = new Ext.XTemplate(
    '&lt;p>Name: {name}&lt;/p>',
    '&lt;p>Title: {title}&lt;/p>',
    '&lt;p>Company: {company}&lt;/p>',
    '&lt;p>Kids: ',
    '&lt;tpl <b>for="kids"</b>>',     // interrogate the kids property within the data
        '&lt;p>{name}&lt;/p>',
    '&lt;/tpl>&lt;/p>'
);
tpl.overwrite(panel.body, data);  // pass the root node of the data object
   </code></pre>
 * <p>Flat arrays that contain values (and not objects) can be auto-rendered
 * using the special <b><tt>{.}</tt></b> variable inside a loop.  This variable
 * will represent the value of the array at the current index:</p>
 * <pre><code>
var tpl = new Ext.XTemplate(
    '&lt;p>{name}\&#39;s favorite beverages:&lt;/p>',
    '&lt;tpl for="drinks">',
       '&lt;div> - {.}&lt;/div>',
    '&lt;/tpl>'
);
tpl.overwrite(panel.body, data);
   </code></pre>
 * <p>When processing a sub-template, for example while looping through a child array,
 * you can access the parent object's members via the <b><tt>parent</tt></b> object:</p>
 * <pre><code>
var tpl = new Ext.XTemplate(
    '&lt;p>Name: {name}&lt;/p>',
    '&lt;p>Kids: ',
    '&lt;tpl for="kids">',
        '&lt;tpl if="age > 1">',
            '&lt;p>{name}&lt;/p>',
            '&lt;p>Dad: {<b>parent</b>.name}&lt;/p>',
        '&lt;/tpl>',
    '&lt;/tpl>&lt;/p>'
);
tpl.overwrite(panel.body, data);
   </code></pre>
 * </div>
 * </li>
 *
 *
 * <li><b><u>Conditional processing with basic comparison operators</u></b>
 * <div class="sub-desc">
 * <p>The <b><tt>tpl</tt></b> tag and the <b><tt>if</tt></b> operator are used
 * to provide conditional checks for deciding whether or not to render specific
 * parts of the template. Notes:<div class="sub-desc"><ul>
 * <li>Double quotes must be encoded if used within the conditional</li>
 * <li>There is no <tt>else</tt> operator &mdash; if needed, two opposite
 * <tt>if</tt> statements should be used.</li>
 * </ul></div>
 * <pre><code>
&lt;tpl if="age &gt; 1 &amp;&amp; age &lt; 10">Child&lt;/tpl>
&lt;tpl if="age >= 10 && age < 18">Teenager&lt;/tpl>
&lt;tpl <b>if</b>="this.isGirl(name)">...&lt;/tpl>
&lt;tpl <b>if</b>="id==\'download\'">...&lt;/tpl>
&lt;tpl <b>if</b>="needsIcon">&lt;img src="{icon}" class="{iconCls}"/>&lt;/tpl>
// no good:
&lt;tpl if="name == "Tommy"">Hello&lt;/tpl>
// encode &#34; if it is part of the condition, e.g.
&lt;tpl if="name == &#38;quot;Tommy&#38;quot;">Hello&lt;/tpl>
 * </code></pre>
 * Using the sample data above:
 * <pre><code>
var tpl = new Ext.XTemplate(
    '&lt;p>Name: {name}&lt;/p>',
    '&lt;p>Kids: ',
    '&lt;tpl for="kids">',
        '&lt;tpl if="age > 1">',
            '&lt;p>{name}&lt;/p>',
        '&lt;/tpl>',
    '&lt;/tpl>&lt;/p>'
);
tpl.overwrite(panel.body, data);
   </code></pre>
 * </div>
 * </li>
 *
 *
 * <li><b><u>Basic math support</u></b>
 * <div class="sub-desc">
 * <p>The following basic math operators may be applied directly on numeric
 * data values:</p><pre>
 * + - * /
 * </pre>
 * For example:
 * <pre><code>
var tpl = new Ext.XTemplate(
    '&lt;p>Name: {name}&lt;/p>',
    '&lt;p>Kids: ',
    '&lt;tpl for="kids">',
        '&lt;tpl if="age &amp;gt; 1">',  // <-- Note that the &gt; is encoded
            '&lt;p>{#}: {name}&lt;/p>',  // <-- Auto-number each item
            '&lt;p>In 5 Years: {age+5}&lt;/p>',  // <-- Basic math
            '&lt;p>Dad: {parent.name}&lt;/p>',
        '&lt;/tpl>',
    '&lt;/tpl>&lt;/p>'
);
tpl.overwrite(panel.body, data);
   </code></pre>
 * </div>
 * </li>
 *
 *
 * <li><b><u>Execute arbitrary inline code with special built-in template variables</u></b>
 * <div class="sub-desc">
 * <p>Anything between <code>{[ ... ]}</code> is considered code to be executed
 * in the scope of the template. There are some special variables available in that code:
 * <ul>
 * <li><b><tt>values</tt></b>: The values in the current scope. If you are using
 * scope changing sub-templates, you can change what <tt>values</tt> is.</li>
 * <li><b><tt>parent</tt></b>: The scope (values) of the ancestor template.</li>
 * <li><b><tt>xindex</tt></b>: If you are in a looping template, the index of the
 * loop you are in (1-based).</li>
 * <li><b><tt>xcount</tt></b>: If you are in a looping template, the total length
 * of the array you are looping.</li>
 * </ul>
 * This example demonstrates basic row striping using an inline code block and the
 * <tt>xindex</tt> variable:</p>
 * <pre><code>
var tpl = new Ext.XTemplate(
    '&lt;p>Name: {name}&lt;/p>',
    '&lt;p>Company: {[values.company.toUpperCase() + ", " + values.title]}&lt;/p>',
    '&lt;p>Kids: ',
    '&lt;tpl for="kids">',
       '&lt;div class="{[xindex % 2 === 0 ? "even" : "odd"]}">',
        '{name}',
        '&lt;/div>',
    '&lt;/tpl>&lt;/p>'
);
tpl.overwrite(panel.body, data);
   </code></pre>
 * </div>
 * </li>
 *
 * <li><b><u>Template member functions</u></b>
 * <div class="sub-desc">
 * <p>One or more member functions can be specified in a configuration
 * object passed into the XTemplate constructor for more complex processing:</p>
 * <pre><code>
var tpl = new Ext.XTemplate(
    '&lt;p>Name: {name}&lt;/p>',
    '&lt;p>Kids: ',
    '&lt;tpl for="kids">',
        '&lt;tpl if="this.isGirl(name)">',
            '&lt;p>Girl: {name} - {age}&lt;/p>',
        '&lt;/tpl>',
        // use opposite if statement to simulate 'else' processing:
        '&lt;tpl if="this.isGirl(name) == false">',
            '&lt;p>Boy: {name} - {age}&lt;/p>',
        '&lt;/tpl>',
        '&lt;tpl if="this.isBaby(age)">',
            '&lt;p>{name} is a baby!&lt;/p>',
        '&lt;/tpl>',
    '&lt;/tpl>&lt;/p>',
    {
        // XTemplate configuration:
        compiled: true,
        // member functions:
        isGirl: function(name){
            return name == 'Sara Grace';
        },
        isBaby: function(age){
            return age < 1;
        }
    }
);
tpl.overwrite(panel.body, data);
   </code></pre>
 * </div>
 * </li>
 *
 * </ul></div>
 *
 * @param {Mixed} config
 */
Ext.XTemplate = function() {
    Ext.XTemplate.superclass.constructor.apply(this, arguments);

    var me = this,
        s = me.html,
        re = /<tpl\b[^>]*>((?:(?=([^<]+))\2|<(?!tpl\b[^>]*>))*?)<\/tpl>/,
        nameRe = /^<tpl\b[^>]*?for="(.*?)"/,
        ifRe = /^<tpl\b[^>]*?if="(.*?)"/,
        execRe = /^<tpl\b[^>]*?exec="(.*?)"/,
        m,
        id = 0,
        tpls = [],
        VALUES = 'values',
        PARENT = 'parent',
        XINDEX = 'xindex',
        XCOUNT = 'xcount',
        RETURN = 'return ',
        WITHVALUES = 'with(values){ ';

    s = ['<tpl>', s, '</tpl>'].join('');

    while ((m = s.match(re))) {
        var m2 = m[0].match(nameRe),
            m3 = m[0].match(ifRe),
            m4 = m[0].match(execRe),
            exp = null,
            fn = null,
            exec = null,
            name = m2 && m2[1] ? m2[1] : '',
            i;

        if (m3) {
            exp = m3 && m3[1] ? m3[1] : null;
            if (exp) {
                fn = new Function(VALUES, PARENT, XINDEX, XCOUNT, WITHVALUES + 'try{' + RETURN + (Ext.util.Format.htmlDecode(exp)) + ';}catch(e){return;}}');
            }
        }
        if (m4) {
            exp = m4 && m4[1] ? m4[1] : null;
            if (exp) {
                exec = new Function(VALUES, PARENT, XINDEX, XCOUNT, WITHVALUES + (Ext.util.Format.htmlDecode(exp)) + '; }');
            }
        }
        if (name) {
            switch (name) {
            case '.':
                name = new Function(VALUES, PARENT, WITHVALUES + RETURN + VALUES + '; }');
                break;
            case '..':
                name = new Function(VALUES, PARENT, WITHVALUES + RETURN + PARENT + '; }');
                break;
            default:
                name = new Function(VALUES, PARENT, WITHVALUES + RETURN + name + '; }');
            }
        }
        tpls.push({
            id: id,
            target: name,
            exec: exec,
            test: fn,
            body: m[1] || ''
        });
        s = s.replace(m[0], '{xtpl' + id + '}');
        ++id;
    }
    for (i = tpls.length - 1; i >= 0; --i) {
        me.compileTpl(tpls[i]);
    }
    me.master = tpls[tpls.length - 1];
    me.tpls = tpls;
};
Ext.extend(Ext.XTemplate, Ext.Template, {
    // @private
    re: /\{([\w-\.\#]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?(\s?[\+\-\*\\]\s?[\d\.\+\-\*\\\(\)]+)?\}/g,
    // @private
    codeRe: /\{\[((?:\\\]|.|\n)*?)\]\}/g,

    // @private
    applySubTemplate: function(id, values, parent, xindex, xcount) {
        var me = this,
            len,
            t = me.tpls[id],
            vs,
            buf = [],
            i;
        if ((t.test && !t.test.call(me, values, parent, xindex, xcount)) ||
        (t.exec && t.exec.call(me, values, parent, xindex, xcount))) {
            return '';
        }
        vs = t.target ? t.target.call(me, values, parent) : values;
        len = vs.length;
        parent = t.target ? values: parent;
        if (t.target && Ext.isArray(vs)) {
            for (i = 0, len = vs.length; i < len; i++) {
                buf[buf.length] = t.compiled.call(me, vs[i], parent, i + 1, len);
            }
            return buf.join('');
        }
        return t.compiled.call(me, vs, parent, xindex, xcount);
    },

    // @private
    compileTpl: function(tpl) {
        var fm = Ext.util.Format,
            useF = this.disableFormats !== true,
            body;

        function fn(m, name, format, args, math) {
            var v;
            // name is what is inside the {}

            // Name begins with xtpl, use a Sub Template
            if (name.substr(0, 4) == 'xtpl') {
                return "',this.applySubTemplate(" + name.substr(4) + ", values, parent, xindex, xcount),'";
            }
            // name = "." - Just use the values object.
            if (name == '.') {
                v = 'typeof values == "string" ? values : ""';
            }

            // name = "#" - Use the xindex
            else if (name == '#') {
                v = 'xindex';
            }

            // name has a . in it - Use object literal notation, starting from values
            else if (name.indexOf('.') != -1) {
                v = "values." + name;
            }

            // name is a property of values
            else {
                v = "values['" + name + "']";
            }
            if (math) {
                v = '(' + v + math + ')';
            }
            if (format && useF) {
                args = args ? ',' + args: "";
                if (format.substr(0, 5) != "this.") {
                    format = "fm." + format + '(';
                }
                else {
                    format = 'this.call("' + format.substr(5) + '", ';
                    args = ", values";
                }
            }
            else {
                args = '';
                format = "(" + v + " === undefined ? '' : ";
            }
            return "'," + format + v + args + "),'";
        }

        function codeFn(m, code) {
            // Single quotes get escaped when the template is compiled, however we want to undo this when running code.
            return "',(" + code.replace(/\\'/g, "'") + "),'";
        }
        body = ["tpl.compiled = function(values, parent, xindex, xcount){return ['"];
        body.push(tpl.body.replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.re, fn).replace(this.codeRe, codeFn));
        body.push("'].join('');};");
        body = body.join('');
        eval(body);
        return this;
    },

    /**
      * Returns an HTML fragment of this template with the specified values applied.
      * @param {Object} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
      * @return {String} The HTML fragment
      */
    applyTemplate: function(values) {
        return this.master.compiled.call(this, values, {}, 1, 1);
    },

    /**
      * Compile the template to a function for optimized performance.  Recommended if the template will be used frequently.
      * @return {Function} The compiled function
      */
    compile: function() {
        return this;
    }

    /**
      * @property re
      * @hide
      */
    /**
      * @property disableFormats
      * @hide
      */
    /**
      * @method set
      * @hide
      */

});
/**
  * Alias for {@link #applyTemplate}
  * Returns an HTML fragment of this template with the specified values applied.
  * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
  * @return {String} The HTML fragment
  * @member Ext.XTemplate
  * @method apply
  */
Ext.XTemplate.prototype.apply = Ext.XTemplate.prototype.applyTemplate;

/**
  * Creates a template from the passed element's value (<i>display:none</i> textarea, preferred) or innerHTML.
  * @param {String/HTMLElement} el A DOM element or its id
  * @return {Ext.Template} The created template
  * @static
  */
Ext.XTemplate.from = function(el, config) {
    el = Ext.getDom(el);
    return new Ext.XTemplate(el.value || el.innerHTML, config || {});
};

/**
 * @class Ext.util.DelayedTask
 * <p> The DelayedTask class provides a convenient way to "buffer" the execution of a method,
 * performing setTimeout where a new timeout cancels the old timeout. When called, the
 * task will wait the specified time period before executing. If durng that time period,
 * the task is called again, the original call will be cancelled. This continues so that
 * the function is only called a single time for each iteration.</p>
 * <p>This method is especially useful for things like detecting whether a user has finished
 * typing in a text field. An example would be performing validation on a keypress. You can
 * use this class to buffer the keypress events for a certain number of milliseconds, and
 * perform only if they stop for that amount of time.  Usage:</p><pre><code>
var task = new Ext.util.DelayedTask(function(){
    alert(Ext.getDom('myInputField').value.length);
});
// Wait 500ms before calling our function. If the user presses another key
// during that 500ms, it will be cancelled and we'll wait another 500ms.
Ext.get('myInputField').on('keypress', function(){
    task.{@link #delay}(500);
});
 * </code></pre>
 * <p>Note that we are using a DelayedTask here to illustrate a point. The configuration
 * option <tt>buffer</tt> for {@link Ext.util.Observable#addListener addListener/on} will
 * also setup a delayed task for you to buffer events.</p>
 * @constructor The parameters to this constructor serve as defaults and are not required.
 * @param {Function} fn (optional) The default function to call.
 * @param {Object} scope The default scope (The <code><b>this</b></code> reference) in which the
 * function is called. If not specified, <code>this</code> will refer to the browser window.
 * @param {Array} args (optional) The default Array of arguments.
 */
Ext.util.DelayedTask = function(fn, scope, args) {
    var me = this,
        id,
        call = function() {
            clearInterval(id);
            id = null;
            fn.apply(scope, args || []);
        };

    /**
     * Cancels any pending timeout and queues a new one
     * @param {Number} delay The milliseconds to delay
     * @param {Function} newFn (optional) Overrides function passed to constructor
     * @param {Object} newScope (optional) Overrides scope passed to constructor. Remember that if no scope
     * is specified, <code>this</code> will refer to the browser window.
     * @param {Array} newArgs (optional) Overrides args passed to constructor
     */
    this.delay = function(delay, newFn, newScope, newArgs) {
        me.cancel();
        fn = newFn || fn;
        scope = newScope || scope;
        args = newArgs || args;
        id = setInterval(call, delay);
    };

    /**
     * Cancel the last queued timeout
     */
    this.cancel = function(){
        if (id) {
            clearInterval(id);
            id = null;
        }
    };
};
/**
 * @class Ext.data.Connection
 * @extends Ext.util.Observable
 */
Ext.data.Connection = Ext.extend(Ext.util.Observable, {
    method: 'post',
    url: null,

    /**
     * @cfg {Boolean} disableCaching (Optional) True to add a unique cache-buster param to GET requests. (defaults to true)
     * @type Boolean
     */
    disableCaching: true,

    /**
     * @cfg {String} disableCachingParam (Optional) Change the parameter which is sent went disabling caching
     * through a cache buster. Defaults to '_dc'
     * @type String
     */
    disableCachingParam: '_dc',

    /**
     * @cfg {Number} timeout (Optional) The timeout in milliseconds to be used for requests. (defaults to 30000)
     */
    timeout : 30000,

    useDefaultHeader : true,
    defaultPostHeader : 'application/x-www-form-urlencoded; charset=UTF-8',
    useDefaultXhrHeader : true,
    defaultXhrHeader : 'XMLHttpRequest',

    requests: {},

    constructor : function(config) {
        config = config || {};
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event beforerequest
             * Fires before a network request is made to retrieve a data object.
             * @param {Connection} conn This Connection object.
             * @param {Object} options The options config object passed to the {@link #request} method.
             */
            'beforerequest',
            /**
             * @event requestcomplete
             * Fires if the request was successfully completed.
             * @param {Connection} conn This Connection object.
             * @param {Object} response The XHR object containing the response data.
             * See <a href="http://www.w3.org/TR/XMLHttpRequest/">The XMLHttpRequest Object</a>
             * for details.
             * @param {Object} options The options config object passed to the {@link #request} method.
             */
            'requestcomplete',
            /**
             * @event requestexception
             * Fires if an error HTTP status was returned from the server.
             * See <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html">HTTP Status Code Definitions</a>
             * for details of HTTP status codes.
             * @param {Connection} conn This Connection object.
             * @param {Object} response The XHR object containing the response data.
             * See <a href="http://www.w3.org/TR/XMLHttpRequest/">The XMLHttpRequest Object</a>
             * for details.
             * @param {Object} options The options config object passed to the {@link #request} method.
             */
            'requestexception'
        );

        Ext.data.Connection.superclass.constructor.call(this);
    },

    /**
     * <p>Sends an HTTP request to a remote server.</p>
     * <p><b>Important:</b> Ajax server requests are asynchronous, and this call will
     * return before the response has been received. Process any returned data
     * in a callback function.</p>
     * <pre><code>
Ext.Ajax.request({
url: 'ajax_demo/sample.json',
success: function(response, opts) {
  var obj = Ext.decode(response.responseText);
  console.dir(obj);
},
failure: function(response, opts) {
  console.log('server-side failure with status code ' + response.status);
}
});
     * </code></pre>
     * <p>To execute a callback function in the correct scope, use the <tt>scope</tt> option.</p>
     * @param {Object} options An object which may contain the following properties:<ul>
     * <li><b>url</b> : String/Function (Optional)<div class="sub-desc">The URL to
     * which to send the request, or a function to call which returns a URL string. The scope of the
     * function is specified by the <tt>scope</tt> option. Defaults to the configured
     * <tt>{@link #url}</tt>.</div></li>
     * <li><b>params</b> : Object/String/Function (Optional)<div class="sub-desc">
     * An object containing properties which are used as parameters to the
     * request, a url encoded string or a function to call to get either. The scope of the function
     * is specified by the <tt>scope</tt> option.</div></li>
     * <li><b>method</b> : String (Optional)<div class="sub-desc">The HTTP method to use
     * for the request. Defaults to the configured method, or if no method was configured,
     * "GET" if no parameters are being sent, and "POST" if parameters are being sent.  Note that
     * the method name is case-sensitive and should be all caps.</div></li>
     * <li><b>callback</b> : Function (Optional)<div class="sub-desc">The
     * function to be called upon receipt of the HTTP response. The callback is
     * called regardless of success or failure and is passed the following
     * parameters:<ul>
     * <li><b>options</b> : Object<div class="sub-desc">The parameter to the request call.</div></li>
     * <li><b>success</b> : Boolean<div class="sub-desc">True if the request succeeded.</div></li>
     * <li><b>response</b> : Object<div class="sub-desc">The XMLHttpRequest object containing the response data.
     * See <a href="http://www.w3.org/TR/XMLHttpRequest/">http://www.w3.org/TR/XMLHttpRequest/</a> for details about
     * accessing elements of the response.</div></li>
     * </ul></div></li>
     * <li><a id="request-option-success"></a><b>success</b> : Function (Optional)<div class="sub-desc">The function
     * to be called upon success of the request. The callback is passed the following
     * parameters:<ul>
     * <li><b>response</b> : Object<div class="sub-desc">The XMLHttpRequest object containing the response data.</div></li>
     * <li><b>options</b> : Object<div class="sub-desc">The parameter to the request call.</div></li>
     * </ul></div></li>
     * <li><b>failure</b> : Function (Optional)<div class="sub-desc">The function
     * to be called upon failure of the request. The callback is passed the
     * following parameters:<ul>
     * <li><b>response</b> : Object<div class="sub-desc">The XMLHttpRequest object containing the response data.</div></li>
     * <li><b>options</b> : Object<div class="sub-desc">The parameter to the request call.</div></li>
     * </ul></div></li>
     * <li><b>scope</b> : Object (Optional)<div class="sub-desc">The scope in
     * which to execute the callbacks: The "this" object for the callback function. If the <tt>url</tt>, or <tt>params</tt> options were
     * specified as functions from which to draw values, then this also serves as the scope for those function calls.
     * Defaults to the browser window.</div></li>
     * <li><b>timeout</b> : Number (Optional)<div class="sub-desc">The timeout in milliseconds to be used for this request. Defaults to 30 seconds.</div></li>
     * <li><b>form</b> : Element/HTMLElement/String (Optional)<div class="sub-desc">The <tt>&lt;form&gt;</tt>
     * Element or the id of the <tt>&lt;form&gt;</tt> to pull parameters from.</div></li>
     * <li><a id="request-option-isUpload"></a><b>isUpload</b> : Boolean (Optional)<div class="sub-desc"><b>Only meaningful when used
     * with the <tt>form</tt> option</b>.
     * <p>True if the form object is a file upload (will be set automatically if the form was
     * configured with <b><tt>enctype</tt></b> "multipart/form-data").</p>
     * <p>File uploads are not performed using normal "Ajax" techniques, that is they are <b>not</b>
     * performed using XMLHttpRequests. Instead the form is submitted in the standard manner with the
     * DOM <tt>&lt;form></tt> element temporarily modified to have its
     * <a href="http://www.w3.org/TR/REC-html40/present/frames.html#adef-target">target</a> set to refer
     * to a dynamically generated, hidden <tt>&lt;iframe></tt> which is inserted into the document
     * but removed after the return data has been gathered.</p>
     * <p>The server response is parsed by the browser to create the document for the IFRAME. If the
     * server is using JSON to send the return object, then the
     * <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17">Content-Type</a> header
     * must be set to "text/html" in order to tell the browser to insert the text unchanged into the document body.</p>
     * <p>The response text is retrieved from the document, and a fake XMLHttpRequest object
     * is created containing a <tt>responseText</tt> property in order to conform to the
     * requirements of event handlers and callbacks.</p>
     * <p>Be aware that file upload packets are sent with the content type <a href="http://www.faqs.org/rfcs/rfc2388.html">multipart/form</a>
     * and some server technologies (notably JEE) may require some custom processing in order to
     * retrieve parameter names and parameter values from the packet content.</p>
     * </div></li>
     * <li><b>headers</b> : Object (Optional)<div class="sub-desc">Request
     * headers to set for the request.</div></li>
     * <li><b>xmlData</b> : Object (Optional)<div class="sub-desc">XML document
     * to use for the post. Note: This will be used instead of params for the post
     * data. Any params will be appended to the URL.</div></li>
     * <li><b>jsonData</b> : Object/String (Optional)<div class="sub-desc">JSON
     * data to use as the post. Note: This will be used instead of params for the post
     * data. Any params will be appended to the URL.</div></li>
     * <li><b>disableCaching</b> : Boolean (Optional)<div class="sub-desc">True
     * to add a unique cache-buster param to GET requests.</div></li>
     * </ul></p>
     * <p>The options object may also contain any other property which might be needed to perform
     * postprocessing in a callback because it is passed to callback functions.</p>
     * @return {Object} request The request object. This may be used
     * to cancel the request.
     */
    request : function(o) {
        var me = this;
        if (me.fireEvent('beforerequest', me, o) !== false) {
            var params = o.params,
                url = o.url || me.url,
                request, data, headers,
                urlParams = o.urlParams,
                method, key, xhr;

            // allow params to be a method that returns the params object
            if (Ext.isFunction(params)) {
                params = params.call(o.scope || window, o);
            }

            // allow url to be a method that returns the actual url
            if (Ext.isFunction(url)) {
                url = url.call(o.scope || window, o);
            }

            // check for xml or json data, and make sure json data is encoded
            data = o.rawData || o.xmlData || o.jsonData || null;
            if (o.jsonData && !Ext.isPrimitive(o.jsonData)) {
                data = Ext.encode(data);
            }

            // make sure params are a url encoded string
            params = Ext.isObject(params) ? Ext.urlEncode(params) : params;
            urlParams = Ext.isObject(urlParams) ? Ext.urlEncode(urlParams) : urlParams;

            // decide the proper method for this request
            method = (o.method || me.method || ((params || data) ? 'POST' : 'GET')).toUpperCase();

            // if the method is get append date to prevent caching
            if (method === 'GET' && o.disableCaching !== false && !me.disableCaching) {
                url = Ext.urlAppend(url, o.disableCachingParam || me.disableCachingParam + '=' + (new Date().getTime()));
            }

            // if the method is get or there is json/xml data append the params to the url
            if ((method == 'GET' || data) && params){
                url = Ext.urlAppend(url, params);
                params = null;
            }

            // allow params to be forced into the url
            if (urlParams) {
                url = Ext.urlAppend(url, urlParams);
            }

            // if autoabort is set, cancel the current transactions
            if(o.autoAbort === true || me.autoAbort) {
                me.abort();
            }

            // create a connection object
            xhr = new XMLHttpRequest();

            // open the request
            xhr.open(method.toUpperCase(), url, true);

            // create all the headers
            headers = Ext.apply({}, o.headers || {}, me.defaultHeaders || {});
            if (!headers['Content-Type'] && (data || params)) {
                headers['Content-Type'] = data ? (o.rawData ? 'text/plain' : (o.xmlData ? 'text/xml' : 'application/json')) : me.defaultPostHeader;
            }
            if (me.useDefaultXhrHeader && !headers['X-Requested-With']) {
                headers['X-Requested-With'] = me.defaultXhrHeader;
            }
            // set up all the request headers on the xhr object
            for (key in headers) {
                try {
                    xhr.setRequestHeader(key, headers[key]);
                }
                catch(e) {
                    me.fireEvent('exception', key, headers[key]);
                }
            }

            // create the transaction object
            request = {
                id: ++Ext.data.Connection.requestId,
                xhr: xhr,
                headers: headers,
                options: o,
                timeout: setTimeout(function() {
                    request.timedout = true;
                    me.abort(request);
                }, o.timeout || me.timeout)
            };
            me.requests[request.id] = request;

            // bind our statechange listener
            xhr.onreadystatechange = me.onStateChange.createDelegate(me, [request]);

            // start the request!
            xhr.send(data || params || null);
            return request;
        } else {
            return o.callback ? o.callback.apply(o.scope, [o, undefined, undefined]) : null;
        }
    },

    /**
     * Determine whether this object has a request outstanding.
     * @param {Object} request (Optional) defaults to the last transaction
     * @return {Boolean} True if there is an outstanding request.
     */
    isLoading : function(r) {
        // if there is a connection and readyState is not 0 or 4
        return r && !{0:true, 4:true}[r.xhr.readyState];
    },

    /**
     * Aborts any outstanding request.
     * @param {Object} request (Optional) defaults to the last request
     */
    abort : function(r) {
        if (r && this.isLoading(r)) {
            r.xhr.abort();
            clearTimeout(r.timeout);
            delete(r.timeout);
            r.aborted = true;
            this.onComplete(r);
        }
        else if (!r) {
            var id;
            for(id in this.requests) {
                this.abort(this.requests[id]);
            }
        }
    },

    // private
    onStateChange : function(r) {
        if (r.xhr.readyState == 4) {
            clearTimeout(r.timeout);
            delete r.timeout;
            this.onComplete(r);
        }
    },

    // private
    onComplete : function(r) {
        var status = r.xhr.status,
            options = r.options,
            success = true,
            response;

        if (status >= 200 && status < 300) {
            response = this.createResponse(r);
            this.fireEvent('requestcomplete', this, response, options);
            if (options.success) {
                if (!options.scope) {
                    options.success(response, options);
                }
                else {
                    options.success.call(options.scope, response, options);
                }
            }
        }
        else {
            success = false;
            switch (status) {
                case 12002:
                case 12029:
                case 12030:
                case 12031:
                case 12152:
                case 13030:
                    response = this.createException(r);
                default:
                    response = this.createResponse(r);
            }
            this.fireEvent('requestexception', this, response, options);
            if (options.failure) {
                if (!options.scope) {
                    options.failure(response, options);
                }
                else {
                    options.failure.call(options.scope, response, options);
                }
            }
        }

        if (options.callback) {
            if (!options.scope) {
                options.callback(options, success, response);
            }
            else {
                options.callback.call(options.scope, options, success, response);
            }
        }
        
        delete this.requests[r.id];
    },

    // private
    createResponse : function(r) {
        var xhr = r.xhr,
            headers = {},
            lines = xhr.getAllResponseHeaders().replace(/\r\n/g, '\n').split('\n'),
            count = lines.length,
            line, index, key, value;

        while (count--) {
            line = lines[count];
            index = line.indexOf(':');
            if(index >= 0) {
                key = line.substr(0, index).toLowerCase();
                if (line.charAt(index + 1) == ' ') {
                    ++index;
                }
                headers[key] = line.substr(index + 1);
            }
        }

        delete r.xhr;

        return {
            request: r,
            requestId : r.id,
            status : xhr.status,
            statusText : xhr.statusText,
            getResponseHeader : function(header){ return headers[header.toLowerCase()]; },
            getAllResponseHeaders : function(){ return headers; },
            responseText : xhr.responseText,
            responseXML : xhr.responseXML
        };
    },

    // private
    createException : function(r) {
        return {
            request : r,
            requestId : r.id,
            status : r.aborted ? -1 : 0,
            statusText : r.aborted ? 'transaction aborted' : 'communication failure',
            aborted: r.aborted,
            timedout: r.timedout
        };
    }
});

Ext.data.Connection.requestId = 0;

Ext.Ajax = new Ext.data.Connection({
    /**
     * @cfg {String} url @hide
     */
    /**
     * @cfg {Object} extraParams @hide
     */
    /**
     * @cfg {Object} defaultHeaders @hide
     */
    /**
     * @cfg {String} method (Optional) @hide
     */
    /**
     * @cfg {Number} timeout (Optional) @hide
     */
    /**
     * @cfg {Boolean} autoAbort (Optional) @hide
     */

    /**
     * @cfg {Boolean} disableCaching (Optional) @hide
     */

    /**
     * @property  disableCaching
     * True to add a unique cache-buster param to GET requests. (defaults to true)
     * @type Boolean
     */
    /**
     * @property  url
     * The default URL to be used for requests to the server. (defaults to undefined)
     * If the server receives all requests through one URL, setting this once is easier than
     * entering it on every request.
     * @type String
     */
    /**
     * @property  extraParams
     * An object containing properties which are used as extra parameters to each request made
     * by this object (defaults to undefined). Session information and other data that you need
     * to pass with each request are commonly put here.
     * @type Object
     */
    /**
     * @property  defaultHeaders
     * An object containing request headers which are added to each request made by this object
     * (defaults to undefined).
     * @type Object
     */
    /**
     * @property  method
     * The default HTTP method to be used for requests. Note that this is case-sensitive and
     * should be all caps (defaults to undefined; if not set but params are present will use
     * <tt>"POST"</tt>, otherwise will use <tt>"GET"</tt>.)
     * @type String
     */
    /**
     * @property  timeout
     * The timeout in milliseconds to be used for requests. (defaults to 30000)
     * @type Number
     */

    /**
     * @property  autoAbort
     * Whether a new request should abort any pending requests. (defaults to false)
     * @type Boolean
     */
    autoAbort : false
});

/**
 * @class Ext.AbstractManager
 * @extends Object
 * Base Manager class - extended by ComponentMgr and PluginMgr
 */
Ext.AbstractManager = Ext.extend(Object, {
    typeName: 'type',

    constructor: function(config) {
        Ext.apply(this, config || {});

        /**
         * @property all
         * @type Ext.util.MixedCollection
         * Contains all of the items currently managed
         */
        this.all = new Ext.util.MixedCollection();

        this.types = {};
    },

    /**
     * Returns a component by {@link Ext.Component#id id}.
     * For additional details see {@link Ext.util.MixedCollection#get}.
     * @param {String} id The component {@link Ext.Component#id id}
     * @return Ext.Component The Component, <code>undefined</code> if not found, or <code>null</code> if a
     * Class was found.
     */
    get : function(id){
        return this.all.get(id);
    },

    /**
     * Registers an item to be managed
     * @param {Mixed} item The item to register
     */
    register: function(item) {
        this.all.add(item);
    },

    /**
     * Unregisters a component by removing it from this manager
     * @param {Mixed} item The item to unregister
     */
    unregister: function(item) {
        this.all.remove(item);
    },

    /**
     * <p>Registers a new Component constructor, keyed by a new
     * {@link Ext.Component#xtype}.</p>
     * <p>Use this method (or its alias {@link Ext#reg Ext.reg}) to register new
     * subclasses of {@link Ext.Component} so that lazy instantiation may be used when specifying
     * child Components.
     * see {@link Ext.Container#items}</p>
     * @param {String} xtype The mnemonic string by which the Component class may be looked up.
     * @param {Constructor} cls The new Component class.
     */
    registerType : function(type, cls){
        this.types[type] = cls;
        cls[this.typeName] = type;
    },

    /**
     * Checks if a Component type is registered.
     * @param {Ext.Component} xtype The mnemonic string by which the Component class may be looked up
     * @return {Boolean} Whether the type is registered.
     */
    isRegistered : function(type){
        return this.types[type] !== undefined;
    },

    /**
     * Creates and returns an instance of whatever this manager manages, based on the supplied type and config object
     * @param {Object} config The config object
     * @param {String} defaultType If no type is discovered in the config object, we fall back to this type
     * @return {Mixed} The instance of whatever this manager is managing
     */
    create: function(config, defaultType) {
        var type        = config[this.typeName] || config.type || defaultType,
            Constructor = this.types[type];

        if (Constructor == undefined) {
            throw new Error(String.format("The '{0}' type has not been registered with this manager", type));
        }

        return new Constructor(config);
    },

    /**
     * Registers a function that will be called when a Component with the specified id is added to the manager. This will happen on instantiation.
     * @param {String} id The component {@link Ext.Component#id id}
     * @param {Function} fn The callback function
     * @param {Object} scope The scope (<code>this</code> reference) in which the callback is executed. Defaults to the Component.
     */
    onAvailable : function(id, fn, scope){
        var all = this.all;

        all.on("add", function(index, o){
            if (o.id == id) {
                fn.call(scope || o, o);
                all.un("add", fn, scope);
            }
        });
    }
});

/**
 * @class Ext.PluginMgr
 * <p>Provides a registry of available Plugin <i>classes</i> indexed by a mnemonic code known as the Plugin's ptype.
 * The <code>{@link Ext.Component#xtype xtype}</code> provides a way to avoid instantiating child Components
 * when creating a full, nested config object for a complete Ext page.</p>
 * <p>A child Component may be specified simply as a <i>config object</i>
 * as long as the correct <code>{@link Ext.Component#xtype xtype}</code> is specified so that if and when the Component
 * needs rendering, the correct type can be looked up for lazy instantiation.</p>
 * <p>For a list of all available <code>{@link Ext.Component#xtype xtypes}</code>, see {@link Ext.Component}.</p>
 * @singleton
 */
Ext.PluginMgr = new Ext.AbstractManager({
    typeName: 'ptype',

    /**
     * Creates a new Plugin from the specified config object using the
     * config object's {@link Ext.component#ptype ptype} to determine the class to instantiate.
     * @param {Object} config A configuration object for the Plugin you wish to create.
     * @param {Constructor} defaultType The constructor to provide the default Plugin type if
     * the config object does not contain a <code>ptype</code>. (Optional if the config contains a <code>ptype</code>).
     * @return {Ext.Component} The newly instantiated Plugin.
     */
    create : function(config, defaultType){
        var PluginCls = this.types[config.ptype || defaultType];
        if (PluginCls.init) {
            return PluginCls;
        } else {
            return new PluginCls(config);
        }
    },

    /**
     * Returns all plugins registered with the given type. Here, 'type' refers to the type of plugin, not its ptype.
     * @param {String} type The type to search for
     * @param {Boolean} defaultsOnly True to only return plugins of this type where the plugin's isDefault property is truthy
     * @return {Array} All matching plugins
     */
    findByType: function(type, defaultsOnly) {
        var matches = [],
            types   = this.types;

        for (var name in types) {
            var item = types[name];

            if (item.type == type && (defaultsOnly === true && item.isDefault)) {
                matches.push(item);
            }
        }

        return matches;
    }
});

/**
 * Shorthand for {@link Ext.PluginMgr#registerType}
 * @param {String} ptype The {@link Ext.component#ptype mnemonic string} by which the Plugin class
 * may be looked up.
 * @param {Constructor} cls The new Plugin class.
 * @member Ext
 * @method preg
 */
Ext.preg = function() {
    return Ext.PluginMgr.registerType.apply(Ext.PluginMgr, arguments);
};

/**
 * @class Ext.ComponentMgr
 * <p>Provides a registry of all Components (instances of {@link Ext.Component} or any subclass
 * thereof) on a page so that they can be easily accessed by {@link Ext.Component component}
 * {@link Ext.Component#id id} (see {@link #get}, or the convenience method {@link Ext#getCmp Ext.getCmp}).</p>
 * <p>This object also provides a registry of available Component <i>classes</i>
 * indexed by a mnemonic code known as the Component's {@link Ext.Component#xtype xtype}.
 * The <code>{@link Ext.Component#xtype xtype}</code> provides a way to avoid instantiating child Components
 * when creating a full, nested config object for a complete Ext page.</p>
 * <p>A child Component may be specified simply as a <i>config object</i>
 * as long as the correct <code>{@link Ext.Component#xtype xtype}</code> is specified so that if and when the Component
 * needs rendering, the correct type can be looked up for lazy instantiation.</p>
 * <p>For a list of all available <code>{@link Ext.Component#xtype xtypes}</code>, see {@link Ext.Component}.</p>
 * @singleton
 */
Ext.ComponentMgr = new Ext.AbstractManager({
    typeName: 'xtype',

    /**
     * Creates a new Component from the specified config object using the
     * config object's {@link Ext.component#xtype xtype} to determine the class to instantiate.
     * @param {Object} config A configuration object for the Component you wish to create.
     * @param {Constructor} defaultType The constructor to provide the default Component type if
     * the config object does not contain a <code>xtype</code>. (Optional if the config contains a <code>xtype</code>).
     * @return {Ext.Component} The newly instantiated Component.
     */
    create : function(config, defaultType){
        return config.render ? config : new this.types[config.xtype || defaultType](config);
    }
});

/**
 * Shorthand for {@link Ext.ComponentMgr#registerType}
 * @param {String} xtype The {@link Ext.component#xtype mnemonic string} by which the Component class
 * may be looked up.
 * @param {Constructor} cls The new Component class.
 * @member Ext
 * @method reg
 */
Ext.reg = function() {
    return Ext.ComponentMgr.registerType.apply(Ext.ComponentMgr, arguments);
}; // this will be called a lot internally, shorthand to keep the bytes down

/**
 * Shorthand for {@link Ext.ComponentMgr#create}
 * Creates a new Component from the specified config object using the
 * config object's {@link Ext.component#xtype xtype} to determine the class to instantiate.
 * @param {Object} config A configuration object for the Component you wish to create.
 * @param {Constructor} defaultType The constructor to provide the default Component type if
 * the config object does not contain a <code>xtype</code>. (Optional if the config contains a <code>xtype</code>).
 * @return {Ext.Component} The newly instantiated Component.
 * @member Ext
 * @method create
 */
Ext.create = function() {
    return Ext.ComponentMgr.create.apply(Ext.ComponentMgr, arguments);
};


/*
Copyright(c) 2010 Sencha Inc.
licensing@sencha.com
http://www.sencha.com/touchlicense
*/

/**
 * @class Ext.data.Batch
 * @extends Ext.util.Observable
 * Provides a mechanism to run one or more {@link Ext.data.Operation operations} in a given order. Fires the 'operation-complete' event
 * after the completion of each Operation, and the 'complete' event when all Operations have been successfully executed. Fires an 'exception'
 * event if any of the Operations encounter an exception.
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Batch = Ext.extend(Ext.util.Observable, {
    /**
     * True to immediately start processing the batch as soon as it is constructed (defaults to false)
     * @property autoStart
     * @type Boolean
     */
    autoStart: false,
    
    /**
     * The index of the current operation being executed
     * @property current
     * @type Number
     */
    current: -1,
    
    /**
     * The total number of operations in this batch. Read only
     * @property total
     * @type Number
     */
    total: 0,
    
    /**
     * True if the batch is currently running
     * @property running
     * @type Boolean
     */
    running: false,
    
    /**
     * True if this batch has been executed completely
     * @property complete
     * @type Boolean
     */
    complete: false,
    
    /**
     * True if this batch has encountered an exception. This is cleared at the start of each operation
     * @property exception
     * @type Boolean
     */
    exception: false,
    
    /**
     * True to automatically pause the execution of the batch if any operation encounters an exception (defaults to true)
     * @property pauseOnException
     * @type Boolean
     */
    pauseOnException: true,
    
    constructor: function(config) {
        Ext.apply(this, config || {});
        
        /**
         * Ordered array of operations that will be executed by this batch
         * @property operations
         * @type Array
         */
        this.operations = [];
        
        this.addEvents(
          /**
           * @event complete
           * Fired when all operations of this batch have been completed
           * @param {Ext.data.Batch} batch The batch object
           * @param {Object} operation The last operation that was executed
           */
          'complete',
          
          /**
           * @event exception
           * Fired when a operation encountered an exception
           * @param {Ext.data.Batch} batch The batch object
           * @param {Object} operation The operation that encountered the exception
           */
          'exception',
          
          /**
           * @event operation-complete
           * Fired when each operation of the batch completes
           * @param {Ext.data.Batch} batch The batch object
           * @param {Object} operation The operation that just completed
           */
          'operation-complete'
        );
        
        Ext.data.Batch.superclass.constructor.call(this, config);
    },
    
    /**
     * Adds a new operation to this batch
     * @param {Object} operation The {@link Ext.data.Operation Operation} object
     */
    add: function(operation) {
        this.total++;
        
        operation.setBatch(this);
        
        this.operations.push(operation);
    },
    
    /**
     * Kicks off the execution of the batch, continuing from the next operation if the previous
     * operation encountered an exception, or if execution was paused
     */
    start: function() {
        this.exception = false;
        this.running = true;
        
        this.runNextOperation();
    },
    
    /**
     * @private
     * Runs the next operation, relative to this.current.
     */
    runNextOperation: function() {
        this.runOperation(this.current + 1);
    },
    
    /**
     * Pauses execution of the batch, but does not cancel the current operation
     */
    pause: function() {
        this.running = false;
    },
    
    /**
     * Executes a operation by its numeric index
     * @param {Number} index The operation index to run
     */
    runOperation: function(index) {
        var operations = this.operations,
            operation  = operations[index];
        
        if (operation == undefined) {
            this.running  = false;
            this.complete = true;
            this.fireEvent('complete', this, operations[operations.length - 1]);
        } else {
            this.current = index;
            
            var onProxyReturn = function(operation) {
                var hasException = operation.hasException();
                
                if (hasException) {
                    this.fireEvent('exception', this, operation);
                } else {
                    this.fireEvent('operation-complete', this, operation);
                }

                if (hasException && this.pauseOnException) {
                    this.pause();
                } else {
                    operation.markCompleted();
                    
                    this.runNextOperation();
                }
            };
            
            operation.markStarted();
            
            this.proxy[operation.action](operation, onProxyReturn, this);
        }
    }
});
/**
 * @class Ext.data.Model
 * @extends Ext.util.Observable
 * <p>A Model represents some object that your application manages. For example, one might define a Model for Users, Products,
 * Cars, or any other real-world object that we want to model in the system. Models are registered via the {@link Ext.ModelMgr model manager},
 * and are used by {@link Ext.data.Store stores}, which are in turn used by many of the data-bound components in Ext.</p>
 * <p>Models are defined as a set of fields and any arbitrary methods and properties relevant to the model. For example:</p>
<pre><code>
Ext.regModel('User', {
    fields: [
        {name: 'name',  type: 'string'},
        {name: 'age',   type: 'int'},
        {name: 'phone', type: 'string'},
        {name: 'alive', type: 'boolean', defaultValue: true}
    ],

    changeName: function() {
        var oldName = this.get('name'),
            newName = oldName + " The Great";

        this.set('name', newName);
    }
});
</code></pre>
* <p>The fields array is turned into a {@link Ext.util.MixedCollection MixedCollection} automatically by the {@link Ext.ModelMgr ModelMgr}, and all
* other functions and properties are copied to the new Model's prototype.</p>
* <p>Now we can create instances of our User model and call any model logic we defined:</p>
<pre><code>
var user = Ext.ModelMgr.create({
    name : 'Ed',
    age  : 24,
    phone: '555-555-5555'
}, 'User');

user.changeName();
user.get('name'); //returns "Ed The Great"
</code></pre>
 * @constructor
 * @param {Object} data An object containing keys corresponding to this model's fields, and their associated values
 * @param {Number} id Optional unique ID to assign to this model instance
 */
Ext.data.Model = Ext.extend(Ext.util.Observable, {
    evented: false,
    
    /**
     * Readonly flag - true if this Record has been modified.
     * @type Boolean
     */
    dirty : false,
    
    /**
     * <tt>true</tt> when the record does not yet exist in a server-side database (see
     * {@link #markDirty}).  Any record which has a real database pk set as its id property
     * is NOT a phantom -- it's real.
     * @property phantom
     * @type {Boolean}
     */
    phantom : false,
    
    /**
     * Internal flag used to track whether or not the model instance is currently being edited. Read-only
     * @property editing
     * @type Boolean
     */
    editing : false,
    
    /**
     * The name of the field treated as this Model's unique id (defaults to 'id').
     * @property idProperty
     * @type String
     */
    idProperty: 'id',
    
    constructor: function(data, id) {
        data = data || {};
        
        if (this.evented) {
            this.addEvents(
                
            );
        }
        
        //add default field values if present
        var fields = this.fields.items,
            length = fields.length,
            field, name, i;
        
        for (i = 0; i < length; i++) {
            field = fields[i];
            name  = field.name;
            
            if (data[name] == undefined) {
                data[name] = field.defaultValue;
            }
        }
        
        /**
         * An internal unique ID for each Model instance, used to identify Models that don't have an ID yet
         * @property internalId
         * @type String
         * @private
         */
        this.internalId = (id || id === 0) ? id : Ext.data.Model.id(this);
        
        this.data = data;
        
        /**
         * Key: value pairs of all fields whose values have changed
         * @property modified
         * @type Object
         */
        this.modified = {};
        
        Ext.data.Model.superclass.constructor.call(this, data);
    },
    
    /**
     * <p>Marks this <b>Record</b> as <code>{@link #dirty}</code>.  This method
     * is used interally when adding <code>{@link #phantom}</code> records to a
     * {@link Ext.data.Store#writer writer enabled store}.</p>
     * <br><p>Marking a record <code>{@link #dirty}</code> causes the phantom to
     * be returned by {@link Ext.data.Store#getModifiedRecords} where it will
     * have a create action composed for it during {@link Ext.data.Store#save store save}
     * operations.</p>
     */
    markDirty : function() {
        this.dirty = true;
        
        if (!this.modified) {
            this.modified = {};
        }
        
        this.fields.each(function(field) {
            this.modified[field.name] = this.data[field.name];
        }, this);
    },
    
    /**
     * Returns the unique ID allocated to this model instance as defined by {@link #idProperty}
     * @return {Number} The id
     */
    getId: function() {
        return this.get(this.idProperty);
    },
    
    /**
     * Sets the model instance's id field to the given id
     * @param {Number} id The new id
     */
    setId: function(id) {
        this.set(this.idProperty, id);
    },
    
    /**
     * Returns the value of the given field
     * @param {String} field The field to fetch the value for
     * @return {Mixed} The value
     */
    get: function(field) {
        return this.data[field];
    },
    
    /**
     * Sets the given field to the given value, marks the instance as dirty
     * @param {String} field The field to set
     * @param {Mixed} value The value to set
     */
    set: function(field, value) {
        this.data[field] = value;
        
        this.dirty = true;
        
        if (!this.editing) {
            this.afterEdit();
        }
    },
    
    /**
     * Gets a hash of only the fields that have been modified since this Model was created or commited.
     * @return Object
     */
    getChanges : function(){
        var modified = this.modified,
            changes  = {},
            field;
            
        for (field in modified) {
            if (modified.hasOwnProperty(field)){
                changes[field] = this.data[field];
            }
        }
        
        return changes;
    },
    
    /**
     * Returns <tt>true</tt> if the passed field name has been <code>{@link #modified}</code>
     * since the load or last commit.
     * @param {String} fieldName {@link Ext.data.Field#name}
     * @return {Boolean}
     */
    isModified : function(fieldName) {
        return !!(this.modified && this.modified.hasOwnProperty(fieldName));
    },
    
    /**
     * Creates a copy (clone) of this Model instance.
     * @param {String} id (optional) A new id, defaults to the id
     * of the instance being copied. See <code>{@link #id}</code>. 
     * To generate a phantom instance with a new id use:<pre><code>
var rec = record.copy(); // clone the record
Ext.data.Model.id(rec); // automatically generate a unique sequential id
     * </code></pre>
     * @return {Record}
     */
    copy : function(newId) {
        return new this.constructor(Ext.apply({}, this.data), newId || this.internalId);
    },
    
    /**
     * Usually called by the {@link Ext.data.Store} to which this model instance has been {@link #join joined}.
     * Rejects all changes made to the model instance since either creation, or the last commit operation.
     * Modified fields are reverted to their original values.
     * <p>Developers should subscribe to the {@link Ext.data.Store#update} event
     * to have their code notified of reject operations.</p>
     * @param {Boolean} silent (optional) True to skip notification of the owning
     * store of the change (defaults to false)
     */
    reject : function(silent) {
        var modified = this.modified,
            field;
            
        for (field in modified) {
            if (typeof modified[field] != "function") {
                this.data[field] = modified[field];
            }
        }
        
        this.dirty = false;
        this.editing = false;
        delete this.modified;
        
        if (silent !== true) {
            this.afterReject();
        }
    },
    
    /**
     * Usually called by the {@link Ext.data.Store} which owns the model instance.
     * Commits all changes made to the instance since either creation or the last commit operation.
     * <p>Developers should subscribe to the {@link Ext.data.Store#update} event
     * to have their code notified of commit operations.</p>
     * @param {Boolean} silent (optional) True to skip notification of the owning
     * store of the change (defaults to false)
     */
    commit : function(silent) {
        this.dirty = false;
        this.editing = false;
        
        delete this.modified;
        
        if (silent !== true) {
            this.afterCommit();
        }
    },
    
    /**
     * Tells this model instance that it has been added to a store
     * @param {Ext.data.Store} store The store that the model has been added to
     */
    join : function(store){
        /**
         * The {@link Ext.data.Store} to which this Record belongs.
         * @property store
         * @type {Ext.data.Store}
         */
        this.store = store;
    },
    
    /**
     * Tells this model instance that it has been removed from the store
     * @param {Ext.data.Store} store The store to unjoin
     */
    unjoin: function(store) {
        delete this.store;
    },
    
    /**
     * @private
     * If this Model instance has been {@link #join joined} to a {@link Ext.data.Store store}, the store's
     * afterEdit method is called
     */
    afterEdit : function() {
        this.callStore('afterEdit');
    },
    
    /**
     * @private
     * If this Model instance has been {@link #join joined} to a {@link Ext.data.Store store}, the store's
     * afterReject method is called
     */
    afterReject : function(){
        this.callStore("afterReject");
    },
    
    /**
     * @private
     * If this Model instance has been {@link #join joined} to a {@link Ext.data.Store store}, the store's
     * afterCommit method is called
     */
    afterCommit: function() {
        this.callStore('afterCommit');
    },
    
    /**
     * @private
     * Helper function used by afterEdit, afterReject and afterCommit. Calls the given method on the 
     * {@link Ext.data.Store store} that this instance has {@link #join joined}, if any. The store function
     * will always be called with the model instance as its single argument.
     * @param {String} fn The function to call on the store
     */
    callStore: function(fn) {
        var store = this.store;
        
        if (store != undefined && typeof store[fn] == "function") {
            store[fn](this);
        }
    }
});


/**
 * Generates a sequential id. This method is typically called when a record is {@link #create}d
 * and {@link #Record no id has been specified}. The returned id takes the form:
 * <tt>&#123;PREFIX}-&#123;AUTO_ID}</tt>.<div class="mdetail-params"><ul>
 * <li><b><tt>PREFIX</tt></b> : String<p class="sub-desc"><tt>Ext.data.Model.PREFIX</tt>
 * (defaults to <tt>'ext-record'</tt>)</p></li>
 * <li><b><tt>AUTO_ID</tt></b> : String<p class="sub-desc"><tt>Ext.data.Model.AUTO_ID</tt>
 * (defaults to <tt>1</tt> initially)</p></li>
 * </ul></div>
 * @param {Record} rec The record being created.  The record does not exist, it's a {@link #phantom}.
 * @return {String} auto-generated string id, <tt>"ext-record-i++'</tt>;
 */
Ext.data.Model.id = function(rec) {
    rec.phantom = true;
    return [Ext.data.Model.PREFIX, '-', Ext.data.Model.AUTO_ID++].join('');
};


//[deprecated 5.0]
Ext.ns('Ext.data.Record');

//Backwards compat
Ext.data.Record.id = Ext.data.Model.id;
//[end]

Ext.data.Model.PREFIX = 'ext-record';
Ext.data.Model.AUTO_ID = 1;
Ext.data.Model.EDIT = 'edit';
Ext.data.Model.REJECT = 'reject';
Ext.data.Model.COMMIT = 'commit';

/**
 * @class Ext.data.Field
 * <p>This class encapsulates the field definition information specified in the field definition objects
 * passed to {@link Ext.regModel}.</p>
 * <p>Developers do not need to instantiate this class. Instances are created by {@link Ext.regModel}
 * and cached in the {@link Ext.data.Model#fields fields} property of the created Model constructor's <b>prototype.</b></p>
 */
Ext.data.Field = Ext.extend(Object, {
    
    constructor : function(config) {
        if (Ext.isString(config)) {
            config = {name: config};
        }
        Ext.apply(this, config);
        
        var types = Ext.data.Types,
            st = this.sortType,
            t;

        if (this.type) {
            if (Ext.isString(this.type)) {
                this.type = Ext.data.Types[this.type.toUpperCase()] || types.AUTO;
            }
        } else {
            this.type = types.AUTO;
        }

        // named sortTypes are supported, here we look them up
        if (Ext.isString(st)) {
            this.sortType = Ext.data.SortTypes[st];
        } else if(Ext.isEmpty(st)) {
            this.sortType = this.type.sortType;
        }

        if (!this.convert) {
            this.convert = this.type.convert;
        }
    },
    
    /**
     * @cfg {String} name
     * The name by which the field is referenced within the Record. This is referenced by, for example,
     * the <code>dataIndex</code> property in column definition objects passed to {@link Ext.grid.ColumnModel}.
     * <p>Note: In the simplest case, if no properties other than <code>name</code> are required, a field
     * definition may consist of just a String for the field name.</p>
     */
    /**
     * @cfg {Mixed} type
     * (Optional) The data type for automatic conversion from received data to the <i>stored</i> value if <code>{@link Ext.data.Field#convert convert}</code>
     * has not been specified. This may be specified as a string value. Possible values are
     * <div class="mdetail-params"><ul>
     * <li>auto (Default, implies no conversion)</li>
     * <li>string</li>
     * <li>int</li>
     * <li>float</li>
     * <li>boolean</li>
     * <li>date</li></ul></div>
     * <p>This may also be specified by referencing a member of the {@link Ext.data.Types} class.</p>
     * <p>Developers may create their own application-specific data types by defining new members of the
     * {@link Ext.data.Types} class.</p>
     */
    /**
     * @cfg {Function} convert
     * (Optional) A function which converts the value provided by the Reader into an object that will be stored
     * in the Record. It is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><b>v</b> : Mixed<div class="sub-desc">The data value as read by the Reader, if undefined will use
     * the configured <code>{@link Ext.data.Field#defaultValue defaultValue}</code>.</div></li>
     * <li><b>rec</b> : Mixed<div class="sub-desc">The data object containing the row as read by the Reader.
     * Depending on the Reader type, this could be an Array ({@link Ext.data.ArrayReader ArrayReader}), an object
     *  ({@link Ext.data.JsonReader JsonReader}), or an XML element ({@link Ext.data.XMLReader XMLReader}).</div></li>
     * </ul></div>
     * <pre><code>
// example of convert function
function fullName(v, record){
    return record.name.last + ', ' + record.name.first;
}

function location(v, record){
    return !record.city ? '' : (record.city + ', ' + record.state);
}

var Dude = Ext.data.Record.create([
    {name: 'fullname',  convert: fullName},
    {name: 'firstname', mapping: 'name.first'},
    {name: 'lastname',  mapping: 'name.last'},
    {name: 'city', defaultValue: 'homeless'},
    'state',
    {name: 'location',  convert: location}
]);

// create the data store
var store = new Ext.data.Store({
    reader: new Ext.data.JsonReader(
        {
            idProperty: 'key',
            root: 'daRoot',
            totalProperty: 'total'
        },
        Dude  // recordType
    )
});

var myData = [
    { key: 1,
      name: { first: 'Fat',    last:  'Albert' }
      // notice no city, state provided in data object
    },
    { key: 2,
      name: { first: 'Barney', last:  'Rubble' },
      city: 'Bedrock', state: 'Stoneridge'
    },
    { key: 3,
      name: { first: 'Cliff',  last:  'Claven' },
      city: 'Boston',  state: 'MA'
    }
];
     * </code></pre>
     */
    /**
     * @cfg {String} dateFormat
     * <p>(Optional) Used when converting received data into a Date when the {@link #type} is specified as <code>"date"</code>.</p>
     * <p>A format string for the {@link Date#parseDate Date.parseDate} function, or "timestamp" if the
     * value provided by the Reader is a UNIX timestamp, or "time" if the value provided by the Reader is a
     * javascript millisecond timestamp. See {@link Date}</p>
     */
    dateFormat: null,
    /**
     * @cfg {Mixed} defaultValue
     * (Optional) The default value used <b>when a Record is being created by a {@link Ext.data.Reader Reader}</b>
     * when the item referenced by the <code>{@link Ext.data.Field#mapping mapping}</code> does not exist in the data
     * object (i.e. undefined). (defaults to "")
     */
    defaultValue: "",
    /**
     * @cfg {String/Number} mapping
     * <p>(Optional) A path expression for use by the {@link Ext.data.DataReader} implementation
     * that is creating the {@link Ext.data.Record Record} to extract the Field value from the data object.
     * If the path expression is the same as the field name, the mapping may be omitted.</p>
     * <p>The form of the mapping expression depends on the Reader being used.</p>
     * <div class="mdetail-params"><ul>
     * <li>{@link Ext.data.JsonReader}<div class="sub-desc">The mapping is a string containing the javascript
     * expression to reference the data from an element of the data item's {@link Ext.data.JsonReader#root root} Array. Defaults to the field name.</div></li>
     * <li>{@link Ext.data.XmlReader}<div class="sub-desc">The mapping is an {@link Ext.DomQuery} path to the data
     * item relative to the DOM element that represents the {@link Ext.data.XmlReader#record record}. Defaults to the field name.</div></li>
     * <li>{@link Ext.data.ArrayReader}<div class="sub-desc">The mapping is a number indicating the Array index
     * of the field's value. Defaults to the field specification's Array position.</div></li>
     * </ul></div>
     * <p>If a more complex value extraction strategy is required, then configure the Field with a {@link #convert}
     * function. This is passed the whole row object, and may interrogate it in whatever way is necessary in order to
     * return the desired data.</p>
     */
    mapping: null,
    /**
     * @cfg {Function} sortType
     * (Optional) A function which converts a Field's value to a comparable value in order to ensure
     * correct sort ordering. Predefined functions are provided in {@link Ext.data.SortTypes}. A custom
     * sort example:<pre><code>
// current sort     after sort we want
// +-+------+          +-+------+
// |1|First |          |1|First |
// |2|Last  |          |3|Second|
// |3|Second|          |2|Last  |
// +-+------+          +-+------+

sortType: function(value) {
   switch (value.toLowerCase()) // native toLowerCase():
   {
      case 'first': return 1;
      case 'second': return 2;
      default: return 3;
   }
}
     * </code></pre>
     */
    sortType : null,
    /**
     * @cfg {String} sortDir
     * (Optional) Initial direction to sort (<code>"ASC"</code> or  <code>"DESC"</code>).  Defaults to
     * <code>"ASC"</code>.
     */
    sortDir : "ASC",
    /**
     * @cfg {Boolean} allowBlank
     * (Optional) Used for validating a {@link Ext.data.Record record}, defaults to <code>true</code>.
     * An empty value here will cause {@link Ext.data.Record}.{@link Ext.data.Record#isValid isValid}
     * to evaluate to <code>false</code>.
     */
    allowBlank : true
});


/**
 * @class Ext.data.SortTypes
 * @singleton
 * Defines the default sorting (casting?) comparison functions used when sorting data.
 */
Ext.data.SortTypes = {
    /**
     * Default sort that does nothing
     * @param {Mixed} s The value being converted
     * @return {Mixed} The comparison value
     */
    none : function(s){
        return s;
    },
    
    /**
     * The regular expression used to strip tags
     * @type {RegExp}
     * @property
     */
    stripTagsRE : /<\/?[^>]+>/gi,
    
    /**
     * Strips all HTML tags to sort on text only
     * @param {Mixed} s The value being converted
     * @return {String} The comparison value
     */
    asText : function(s){
        return String(s).replace(this.stripTagsRE, "");
    },
    
    /**
     * Strips all HTML tags to sort on text only - Case insensitive
     * @param {Mixed} s The value being converted
     * @return {String} The comparison value
     */
    asUCText : function(s){
        return String(s).toUpperCase().replace(this.stripTagsRE, "");
    },
    
    /**
     * Case insensitive string
     * @param {Mixed} s The value being converted
     * @return {String} The comparison value
     */
    asUCString : function(s) {
    	return String(s).toUpperCase();
    },
    
    /**
     * Date sorting
     * @param {Mixed} s The value being converted
     * @return {Number} The comparison value
     */
    asDate : function(s) {
        if(!s){
            return 0;
        }
        if(Ext.isDate(s)){
            return s.getTime();
        }
    	return Date.parse(String(s));
    },
    
    /**
     * Float sorting
     * @param {Mixed} s The value being converted
     * @return {Float} The comparison value
     */
    asFloat : function(s) {
    	var val = parseFloat(String(s).replace(/,/g, ""));
    	return isNaN(val) ? 0 : val;
    },
    
    /**
     * Integer sorting
     * @param {Mixed} s The value being converted
     * @return {Number} The comparison value
     */
    asInt : function(s) {
        var val = parseInt(String(s).replace(/,/g, ""), 10);
        return isNaN(val) ? 0 : val;
    }
};
/**
 * @class Ext.data.Types
 * <p>This is s static class containing the system-supplied data types which may be given to a {@link Ext.data.Field Field}.<p/>
 * <p>The properties in this class are used as type indicators in the {@link Ext.data.Field Field} class, so to
 * test whether a Field is of a certain type, compare the {@link Ext.data.Field#type type} property against properties
 * of this class.</p>
 * <p>Developers may add their own application-specific data types to this class. Definition names must be UPPERCASE.
 * each type definition must contain three properties:</p>
 * <div class="mdetail-params"><ul>
 * <li><code>convert</code> : <i>Function</i><div class="sub-desc">A function to convert raw data values from a data block into the data
 * to be stored in the Field. The function is passed the collowing parameters:
 * <div class="mdetail-params"><ul>
 * <li><b>v</b> : Mixed<div class="sub-desc">The data value as read by the Reader, if undefined will use
 * the configured <tt>{@link Ext.data.Field#defaultValue defaultValue}</tt>.</div></li>
 * <li><b>rec</b> : Mixed<div class="sub-desc">The data object containing the row as read by the Reader.
 * Depending on the Reader type, this could be an Array ({@link Ext.data.ArrayReader ArrayReader}), an object
 * ({@link Ext.data.JsonReader JsonReader}), or an XML element ({@link Ext.data.XMLReader XMLReader}).</div></li>
 * </ul></div></div></li>
 * <li><code>sortType</code> : <i>Function</i> <div class="sub-desc">A function to convert the stored data into comparable form, as defined by {@link Ext.data.SortTypes}.</div></li>
 * <li><code>type</code> : <i>String</i> <div class="sub-desc">A textual data type name.</div></li>
 * </ul></div>
 * <p>For example, to create a VELatLong field (See the Microsoft Bing Mapping API) containing the latitude/longitude value of a datapoint on a map from a JsonReader data block
 * which contained the properties <code>lat</code> and <code>long</code>, you would define a new data type like this:</p>
 *<pre><code>
// Add a new Field data type which stores a VELatLong object in the Record.
Ext.data.Types.VELATLONG = {
    convert: function(v, data) {
        return new VELatLong(data.lat, data.long);
    },
    sortType: function(v) {
        return v.Latitude;  // When sorting, order by latitude
    },
    type: 'VELatLong'
};
</code></pre>
 * <p>Then, when declaring a Record, use <pre><code>
var types = Ext.data.Types; // allow shorthand type access
UnitRecord = Ext.data.Record.create([
    { name: 'unitName', mapping: 'UnitName' },
    { name: 'curSpeed', mapping: 'CurSpeed', type: types.INT },
    { name: 'latitude', mapping: 'lat', type: types.FLOAT },
    { name: 'latitude', mapping: 'lat', type: types.FLOAT },
    { name: 'position', type: types.VELATLONG }
]);
</code></pre>
 * @singleton
 */
Ext.data.Types = new function(){
    var st = Ext.data.SortTypes;
    Ext.apply(this, {
        /**
         * @type Regexp
         * @property stripRe
         * A regular expression for stripping non-numeric characters from a numeric value. Defaults to <tt>/[\$,%]/g</tt>.
         * This should be overridden for localization.
         */
        stripRe: /[\$,%]/g,
        
        /**
         * @type Object.
         * @property AUTO
         * This data type means that no conversion is applied to the raw data before it is placed into a Record.
         */
        AUTO: {
            convert: function(v){ return v; },
            sortType: st.none,
            type: 'auto'
        },

        /**
         * @type Object.
         * @property STRING
         * This data type means that the raw data is converted into a String before it is placed into a Record.
         */
        STRING: {
            convert: function(v){ return (v === undefined || v === null) ? '' : String(v); },
            sortType: st.asUCString,
            type: 'string'
        },

        /**
         * @type Object.
         * @property INT
         * This data type means that the raw data is converted into an integer before it is placed into a Record.
         * <p>The synonym <code>INTEGER</code> is equivalent.</p>
         */
        INT: {
            convert: function(v){
                return v !== undefined && v !== null && v !== '' ?
                    parseInt(String(v).replace(Ext.data.Types.stripRe, ''), 10) : 0;
            },
            sortType: st.none,
            type: 'int'
        },
        
        /**
         * @type Object.
         * @property FLOAT
         * This data type means that the raw data is converted into a number before it is placed into a Record.
         * <p>The synonym <code>NUMBER</code> is equivalent.</p>
         */
        FLOAT: {
            convert: function(v){
                return v !== undefined && v !== null && v !== '' ?
                    parseFloat(String(v).replace(Ext.data.Types.stripRe, ''), 10) : 0;
            },
            sortType: st.none,
            type: 'float'
        },
        
        /**
         * @type Object.
         * @property BOOL
         * <p>This data type means that the raw data is converted into a boolean before it is placed into
         * a Record. The string "true" and the number 1 are converted to boolean <code>true</code>.</p>
         * <p>The synonym <code>BOOLEAN</code> is equivalent.</p>
         */
        BOOL: {
            convert: function(v){ return v === true || v === 'true' || v == 1; },
            sortType: st.none,
            type: 'bool'
        },
        
        /**
         * @type Object.
         * @property DATE
         * This data type means that the raw data is converted into a Date before it is placed into a Record.
         * The date format is specified in the constructor of the {@link Ext.data.Field} to which this type is
         * being applied.
         */
        DATE: {
            convert: function(v){
                var df = this.dateFormat;
                if(!v){
                    return null;
                }
                if(Ext.isDate(v)){
                    return v;
                }
                if(df){
                    if(df == 'timestamp'){
                        return new Date(v*1000);
                    }
                    if(df == 'time'){
                        return new Date(parseInt(v, 10));
                    }
                    return Date.parseDate(v, df);
                }
                var parsed = Date.parse(v);
                return parsed ? new Date(parsed) : null;
            },
            sortType: st.asDate,
            type: 'date'
        }
    });
    
    Ext.apply(this, {
        /**
         * @type Object.
         * @property BOOLEAN
         * <p>This data type means that the raw data is converted into a boolean before it is placed into
         * a Record. The string "true" and the number 1 are converted to boolean <code>true</code>.</p>
         * <p>The synonym <code>BOOL</code> is equivalent.</p>
         */
        BOOLEAN: this.BOOL,
        /**
         * @type Object.
         * @property INTEGER
         * This data type means that the raw data is converted into an integer before it is placed into a Record.
         * <p>The synonym <code>INT</code> is equivalent.</p>
         */
        INTEGER: this.INT,
        /**
         * @type Object.
         * @property NUMBER
         * This data type means that the raw data is converted into a number before it is placed into a Record.
         * <p>The synonym <code>FLOAT</code> is equivalent.</p>
         */
        NUMBER: this.FLOAT    
    });
};
/**
 * @class Ext.ModelMgr
 * @extends Ext.AbstractManager
 * Creates and manages the current set of models
 */
Ext.ModelMgr = new Ext.AbstractManager({
    typeName: 'mtype',
    
    /**
     * Registers a model definition. All model plugins marked with isDefault: true are bootstrapped
     * immediately, as are any addition plugins defined in the model config.
     */
    registerType: function(name, config) {
        var PluginMgr = Ext.PluginMgr,
            plugins   = PluginMgr.findByType('model', true),
            fields    = config.fields || [],
            model     = Ext.extend(Ext.data.Model, config);
        
        var modelPlugins = config.plugins || [];
        
        for (var index = 0, length = modelPlugins.length; index < length; index++) {
            plugins.push(PluginMgr.create(modelPlugins[index]));
        }
        
        var fieldsMC = new Ext.util.MixedCollection(false, function(field) {
            return field.name;
        });
        
        for (var index = 0, length = fields.length; index < length; index++) {
            fieldsMC.add(new Ext.data.Field(fields[index]));
        }
        
        Ext.override(model, {
            fields : fieldsMC,
            plugins: plugins
        });
        
        for (var index = 0, length = plugins.length; index < length; index++) {
            plugins[index].bootstrap(model, config);
        }
        
        this.types[name] = model;
        
        return model;
    },
    
    create: function(config, name) {
        var con = typeof name == 'function' ? name : this.types[name || config.name];
        
        return new con(config);
    }
});

Ext.regModel = function() {
    return Ext.ModelMgr.registerType.apply(Ext.ModelMgr, arguments);
};
/**
 * @class Ext.data.Operation
 * @extends Object
 * <p>Represents a single read or write operation performed by a Proxy. Operation objects are used to enable communication
 * between Stores and Proxies. Application developers should rarely need to interact with Operation objects directly.</p>
 * <p>Several Operations can be batched together in a {@link Ext.data.Batch batch}.</p>
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Operation = Ext.extend(Object, {
    /**
     * @cfg {Boolean} synchronous True if this Operation is to be executed synchronously (defaults to true). This
     * property is inspected by a {@link Ext.data.Batch Batch} to see if a series of Operations can be executed in
     * parallel or not.
     */
    synchronous: true,
    
    /**
     * @cfg {String} action The action being performed by this Operation. Should be one of 'create', 'read', 'update' or 'destroy'
     */
    action: undefined,
    
    /**
     * @cfg {Array} filters Optional array of filter objects. Only applies to 'read' actions.
     */
    filters: undefined,
    
    /**
     * @cfg {Array} sorters Optional array of sorter objects. Only applies to 'read' actions.
     */
    sorters: undefined,
    
    /**
     * @cfg {Object} group Optional grouping configuration. Only applies to 'read' actions where grouping is desired.
     */
    group: undefined,
    
    /**
     * @cfg {Number} start The start index (offset), used in paging when running a 'read' action.
     */
    start: undefined,
    
    /**
     * @cfg {Number} limit The number of records to load. Used on 'read' actions when paging is being used.
     */
    limit: undefined,
    
    /**
     * @cfg {Ext.data.Batch} batch The batch that this Operation is a part of (optional)
     */
    batch: undefined,
    
        
    /**
     * Read-only property tracking the start status of this Operation. Use {@link #isStarted}.
     * @property started
     * @type Boolean
     * @private
     */
    started: false,
    
    /**
     * Read-only property tracking the run status of this Operation. Use {@link #isRunning}.
     * @property running
     * @type Boolean
     * @private
     */
    running: false,
    
    /**
     * Read-only property tracking the completion status of this Operation. Use {@link #isComplete}.
     * @property complete
     * @type Boolean
     * @private
     */
    complete: false,
    
    /**
     * Read-only property tracking whether the Operation was successful or not. This is always set to true by default and can
     * be set to false by the Proxy that is executing the Operation. It is also set to false by {@link #markException}. Use
     * {@link #wasSuccessful} to query success status.
     * @property success
     * @type Boolean
     */
    success: true,
    
    /**
     * Read-only property tracking the exception status of this Operation. Use {@link #hasException} and see {@link #getError}.
     * @property exception
     * @type Boolean
     * @private
     */
    exception: false,
    
    /**
     * The error object passed when {@link #markException} was called. This could be any object or primitive.
     * @property error
     * @type Mixed
     * @private
     */
    error: undefined,
    
    constructor: function(config) {
        Ext.apply(this, config || {});
    },
    
    /**
     * Marks the Operation as started
     */
    markStarted: function() {
        this.started = true;
        this.running = true;
    },
    
    /**
     * Marks the Operation as completed
     */
    markCompleted: function() {
        this.complete = true;
        this.running  = false;
    },
    
    /**
     * Marks the Operation as having experienced an exception. Can be supplied with an option error message/object.
     * @param {Mixed} error Optional error string/object
     */
    markException: function(error) {
        this.exception = true;
        this.successful = false;
        this.error = error;
    },
    
    /**
     * Returns true if this Operation encountered an exception (see also {@link #getError})
     * @return {Boolean} True if there was an exception
     */
    hasException: function() {
        return this.exception === true;
    },
    
    /**
     * Returns the error string or object that was set using {@link #markException}
     * @return {Mixed} The error object
     */
    getError: function() {
        return this.error;
    },
    
    /**
     * Returns an array of Ext.data.Model instances as set by the Proxy.
     * @return {Array} Any loaded Records
     */
    getRecords: function() {
        var resultSet = this.getResultSet();
        
        return (resultSet == undefined ? [] : resultSet.records);
    },
    
    /**
     * Returns the ResultSet object (if set by the Proxy). This object will contain the {@link Ext.data.Model model} instances
     * as well as meta data such as number of instances fetched, number available etc
     * @return {Ext.data.ResultSet} The ResultSet object
     */
    getResultSet: function() {
        return this.resultSet;
    },
    
    /**
     * Returns true if the Operation has been started. Note that the Operation may have started AND completed,
     * see {@link #isRunning} to test if the Operation is currently running.
     * @return {Boolean} True if the Operation has started
     */
    isStarted: function() {
        return this.started === true;
    },
    
    /**
     * Returns true if the Operation has been started but has not yet completed.
     * @return {Boolean} True if the Operation is currently running
     */
    isRunning: function() {
        return this.running === true;
    },
    
    /**
     * Returns true if the Operation has been completed
     * @return {Boolean} True if the Operation is complete
     */
    isComplete: function() {
        return this.complete === true;
    },
    
    /**
     * Returns true if the Operation has completed and was successful
     * @return {Boolean} True if successful
     */
    wasSuccessful: function() {
        return this.isComplete() && this.success === true;
    },
    
    /**
     * @private
     * Associates this Operation with a Batch
     * @param {Ext.data.Batch} batch The batch
     */
    setBatch: function(batch) {
        this.batch = batch;
    }
});
Ext.data.ProxyMgr = new Ext.AbstractManager({
    
});
/**
 * @class Ext.data.ReaderMgr
 */
Ext.data.ReaderMgr = new Ext.AbstractManager({
    typeName: 'rtype'
});
/**
 * @class Ext.data.Request
 * @extends Object
 * Simple class that represents a Request that will be made by any {@link Ext.data.ServerProxy}
subclass.
 * All this class does is standardize the representation of a Request as used by any ServerProxy subclass,
 * it does not contain any actual logic or perform the request itself.
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Request = Ext.extend(Object, {
    /**
     * @cfg {String} action The name of the action this Request represents. Usually one of 'create', 'read', 'update' or 'destroy'
     */
    action: undefined,
    
    /**
     * @cfg {Object} params HTTP request params. The Proxy and its Writer have access to and can modify this object.
     */
    params: undefined,
    
    /**
     * @cfg {String} method The HTTP method to use on this Request (defaults to 'GET'). Should be one of 'GET', 'POST', 'PUT' or 'DELETE'
     */
    method: 'GET',
    
    /**
     * @cfg {String} url The url to access on this Request
     */
    url: undefined,

    constructor: function(config) {
        Ext.apply(this, config || {});
    }
});
/**
 * @class Ext.data.ResultSet
 * @extends Object
 * Simple wrapper class that represents a set of records returned by a Proxy.
 * @constructor
 * Creates the new ResultSet
 */
Ext.data.ResultSet = Ext.extend(Object, {
    /**
     * @cfg {Boolean} loaded
     * True if the records have already been loaded. This is only meaningful when dealing with
     * SQL-backed proxies
     */
    loaded: true,
    
    /**
     * @cfg {Number} count
     * The number of records in this ResultSet. Note that total may differ from this number
     */
    count: 0,
    
    /**
     * @cfg {Number} total
     * The total number of records reported by the data source. This ResultSet may form a subset of
     * those records (see count)
     */
    total: 0,
    
    /**
     * @cfg {Boolean} success
     * True if the ResultSet loaded successfully, false if any errors were encountered
     */
    success: false,
    
    /**
     * @cfg {Array} records The array of record instances. Required
     */

    constructor: function(config) {
        Ext.apply(this, config || {});
        
        if (config.count == undefined) {
            this.count = this.records.length;
        }
    }
});
/**
 * @class Ext.data.Store
 * @extends Ext.util.Observable
 * <p>The Store class encapsulates a client side cache of {@link Ext.data.Model Model}
 * objects which provide input data for Components such as the {@link Ext.DataView DataView}.</p>
 * <p><u>Retrieving Data</u></p>
 * <p>A Store object may access a data object using:<div class="mdetail-params"><ul>
 * <li>{@link #proxy configured implementation} of {@link Ext.data.Proxy Proxy}</li>
 * <li>{@link #data} to automatically pass in data</li>
 * <li>{@link #loadData} to manually pass in data</li>
 * </ul></div></p>
 * <p><u>Reading Data</u></p>
 * <p>A Store object has no inherent knowledge of the format of the data object (it could be
 * an Array, XML, or JSON). A Store object uses an appropriate {@link #reader configured implementation}
 * of a {@link Ext.data.Reader Reader} to create {@link Ext.data.Model Model} instances from the data
 * object.</p>
 * <p><u>Store Types</u></p>
 * <p>There are several implementations of Store available which are customized for use with
 * a specific DataReader implementation.  Here is an example using an ArrayStore which implicitly
 * creates a reader commensurate to an Array data object.</p>
 * <pre><code>
var myStore = new Ext.data.ArrayStore({
    fields: ['fullname', 'first'],
    idIndex: 0 // id for each record will be the first element
});
 * </code></pre>
 * <p>For custom implementations create a basic {@link Ext.data.Store} configured as needed:</p>
 * <pre><code>
// define a {@link Ext.data.Model Model}:
Ext.regModel('User', {
  fields: [
    {name: 'fullname'},
    {name: 'first'}
  ]
});
var myStore = new Ext.data.Store({
    // explicitly create reader
    reader: new Ext.data.ArrayReader(
        {
            idIndex: 0  // id for each record will be the first element
        }
    ),
    model: 'User
});
 * </code></pre>
 * <p>Load some data into store (note the data object is an array which corresponds to the reader):</p>
 * <pre><code>
var myData = [
    [1, 'Fred Flintstone', 'Fred'],  // note that id for the record is the first element
    [2, 'Barney Rubble', 'Barney']
];
myStore.loadData(myData);
 * </code></pre>
 * <p>Records are cached and made available through accessor functions.  An example of adding
 * a record to the store:</p>
 * <pre><code>
var defaultData = {
    fullname: 'Full Name',
    first: 'First Name'
};
var r = Ext.ModelMgr.create(defaultData, 'User'); // create new record
myStore.{@link #insert}(0, r); // insert a new record into the store (also see {@link #add})
 * </code></pre>
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Store = Ext.extend(Ext.util.Observable, {
    remoteSort  : false,
    remoteFilter: false,
    
    /**
     * The (optional) field by which to group data in the store. Internally, grouping is very similar to sorting - the
     * groupField and {@link #groupDir} are injected as the first sorter (see {@link #sort}). Stores support a single 
     * level of grouping, and groups can be fetched via the {@link #getGroups} method.
     * @property groupField
     * @type String
     */
    groupField: undefined,
    
    /**
     * The direction in which sorting should be applied when grouping. Defaults to "ASC" - the other supported value is "DESC"
     * @property groupDir
     * @type String
     */
    groupDir: "ASC",
    
    /**
     * The number of records considered to form a 'page'. This is used to power the built-in
     * paging using the nextPage and previousPage functions. Defaults to 25.
     * @property pageSize
     * @type Number
     */
    pageSize: 25,
    
    /**
     * Sets the updating behavior based on batch synchronization. 'operation' (the default) will update the Store's
     * internal representation of the data after each operation of the batch has completed, 'complete' will wait until
     * the entire batch has been completed before updating the Store's data. 'complete' is a good choice for local
     * storage proxies, 'operation' is better for remote proxies, where there is a comparatively high latency.
     * @property batchUpdateMode
     * @type String
     */
    batchUpdateMode: 'operation',
    
    /**
     * If true, any filters attached to this Store will be run after loading data, before the datachanged event is fired.
     * Defaults to true.
     * @property filterOnLoad
     * @type Boolean
     */
    filterOnLoad: true,
    
    /**
     * If true, any sorters attached to this Store will be run after loading data, before the datachanged event is fired.
     * Defaults to true.
     * @property sortOnLoad
     * @type Boolean
     */
    sortOnLoad: true,
    
    /**
     * The number of the page of data currently loaded
     * @property currentPage
     * @type Number
     */
    currentPage: 1,
    
    /**
     * True if a model was created implicitly for this Store. This happens if a fields array is passed to the Store's constructor
     * instead of a model constructor or name.
     * @property implicitModel
     * @type Boolean
     * @private
     */
    implicitModel: true,
    
    /**
     * The string type of the Proxy to create if none is specified. This defaults to creating a base Proxy
     * @property defaultProxyType
     * @type String
     */
    defaultProxyType: 'proxy',
    
    //documented above
    constructor: function(config) {
        this.addEvents(
            /**
             * @event datachanged
             * Fires whenever the records in the Store have changed in some way - this could include adding or removing records,
             * or updating the data in existing records
             * @param {Ext.data.Store} this The data store
             */
            'datachanged',
          
            /**
             * @event update
             * Fires when a Record has been updated
             * @param {Store} this
             * @param {Ext.data.Model} record The Model instance that was updated
             * @param {String} operation The update operation being performed. Value may be one of:
             * <pre><code>
               Ext.data.Model.EDIT
               Ext.data.Model.REJECT
               Ext.data.Model.COMMIT
             * </code></pre>
             */
            'update'
        );
        
        /**
         * Temporary cache in which removed model instances are kept until successfully synchronised with a Proxy,
         * at which point this is cleared.
         * @private
         * @property removed
         * @type Array
         */
        this.removed = [];
        
        /**
         * Stores the current sort direction ('ASC' or 'DESC') for each field. Used internally to manage the toggling
         * of sort direction per field. Read only
         * @property sortToggle
         * @type Object
         */
        this.sortToggle = {};
        
        /**
         * The MixedCollection that holds this store's local cache of records
         * @property data
         * @type Ext.util.MixedCollection
         */
        this.data = new Ext.util.MixedCollection(false, function(record) {
            return record.id;
        });
        
        if (config.data) {
            this.inlineData = config.data;
            delete config.data;
        }
        
        Ext.data.Store.superclass.constructor.apply(this, arguments);
        
        if (typeof this.model == 'string') {
            this.model = Ext.ModelMgr.types[this.model];
        }
        
        if (!(this.proxy instanceof Ext.data.Proxy)) {
            this.proxy = this.getProxy();
        }
        
        if (this.id) {
            this.storeId = this.id;
            delete this.id;
            
            Ext.StoreMgr.register(this);
        }
        
        //Supports the 3.x style of simply passing an array of fields to the store, implicitly creating a model
        if (!this.model && config.fields) {
            this.model = Ext.regModel('ImplicitModel-' + this.storeId || Ext.id(), {
                fields: config.fields
            });
            
            delete this.fields;
            
            this.implicitModel = true;
        }
        
        if (this.proxy && this.model) {
            this.proxy.setModel(this.model);
        }
        
        if (this.inlineData) {
            this.loadData(this.inlineData);
            delete this.inlineData;
        } else if (this.autoLoad) {
            this.load.defer(10, this, [typeof this.autoLoad == 'object' ? this.autoLoad : undefined]);
        }
    },
    
    /**
     * Returns an object containing the result of applying grouping to the records in this store. See {@link #groupField}, 
     * {@link #groupDir} and {@link #getGroupString}. Example for a store containing records with a color field:
<pre><code>
var myStore = new Ext.data.Store({
    groupField: 'color',
    groupDir  : 'DESC'
});

myStore.getGroups(); //returns:
[
    {
        name: 'yellow',
        children: [
            //all records where the color field is 'yellow'
        ]
    },
    {
        name: 'red',
        children: [
            //all records where the color field is 'red'
        ]
    }
]
</code></pre>
     * @return {Array} The grouped data
     */
    getGroups: function() {
        var records  = this.data.items,
            length   = records.length,
            groups   = [],
            pointers = {},
            record, groupStr, group, i;
        
        for (i = 0; i < length; i++) {
            record = records[i];
            groupStr = this.getGroupString(record);
            group = pointers[groupStr];
            
            if (group == undefined) {
                group = {
                    name: groupStr,
                    children: []
                };
                
                groups.push(group);
                pointers[groupStr] = group;
            }
            
            group.children.push(record);
        }
        
        return groups;
    },
    
    /**
     * Returns the string to group on for a given model instance. The default implementation of this method returns the model's
     * {@link #groupField}, but this can be overridden to group by an arbitrary string. For example, to group by the first letter
     * of a model's 'name' field, use the following code:
<pre><code>
new Ext.data.Store({
    groupDir: 'ASC',
    getGroupString: function(instance) {
        return instance.get('name')[0];
    }
});
</code></pre>
     * @param {Ext.data.Model} instance The model instance
     * @return {String} The string to compare when forming groups
     */
    getGroupString: function(instance) {
        return instance.get(this.groupField);
    },
    
    /**
     * Returns the Proxy currently attached to this Store instance
     * @return {Ext.data.Proxy} The Proxy instance
     */
    getProxy: function() {
        var proxy = this.proxy;
        
        if (proxy == undefined || !(proxy instanceof Ext.data.Proxy)) {
            if (typeof proxy == 'string') {
                proxy = {
                    type: proxy
                };
            }
            
            this.proxy = Ext.data.ProxyMgr.create(proxy || {}, this.defaultProxyType);
        }
        
        return this.proxy;
    },
    
    /**
     * Inserts Model instances into the Store at the given index and fires the {@link #add} event.
     * See also <code>{@link #add}</code> and <code>{@link #addSorted}</code>.
     * @param {Number} index The start index at which to insert the passed Records.
     * @param {Ext.data.Model[]} records An Array of Ext.data.Model objects to add to the cache.
     */
    insert : function(index, records) {
        records = [].concat(records);
        for (var i = 0, len = records.length; i < len; i++) {
            this.data.insert(index, records[i]);
            records[i].join(this);
        }
        if (this.snapshot) {
            this.snapshot.addAll(records);
        }
        this.fireEvent('add', this, records, index);
    },
    
    /**
     * Adds Model instances to the Store by instantiating them based on a JavaScript object. When adding already-
     * instantiated Models, use {@link #insert} instead. The instances will be added at the end of the existing collection.
     * Sample usage:
<pre><code>
myStore.add({some: 'data'}, {some: 'other data'});
</code></pre>
     * @param {Object} data The data for each model
     * @return {Array} The array of newly created model instances
     */
    add: function() {
        var records = Array.prototype.slice.apply(arguments),
            length  = records.length,
            i;
        
        for (i = 0; i < length; i++) {
            if (!(records[i] instanceof Ext.data.Model)) {
                records[i] = Ext.ModelMgr.create(records[i], this.model);
            }
        }
        
        this.insert(this.data.length, records);
        
        return records;
    },
    
    //saves any phantom records
    create: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'create',
            records: this.getNewRecords()
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.create(operation, this.onProxyWrite, this);
    },

    /**
     * Calls the specified function for each of the {@link Ext.data.Record Records} in the cache.
     * @param {Function} fn The function to call. The {@link Ext.data.Record Record} is passed as the first parameter.
     * Returning <tt>false</tt> aborts and exits the iteration.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed.
     * Defaults to the current {@link Ext.data.Record Record} in the iteration.
     */
    each : function(fn, scope){
        this.data.each(fn, scope);
    },

    //removes records from the store
    remove: function(record) {
        if (Ext.isArray(record)) {
            for (var i = 0, length = record.length; i < length; i++) {
                this.remove(record[i]);
            }
            return;
        }
        
        this.removed.push(record);
        
        var index = this.data.indexOf(record);
        
        if (this.snapshot) {
            this.snapshot.remove(record);
        }
        
        if (index > -1) {
            record.unjoin(this);
            this.data.removeAt(index);
            
            this.fireEvent('remove', this, record, index);
            this.fireEvent('datachanged', this);
        }
    },
    
    //tells the attached proxy to destroy the given records
    destroy: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'destroy',
            records: this.getRemovedRecords()
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.destroy(operation, this.onProxyWrite, this);
    },
    
    update: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'update',
            records: this.getUpdatedRecords()
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.update(operation, this.onProxyWrite, this);
    },
    
    read: function(options) {
        options = options || {};
        
        Ext.applyIf(options, {
            action : 'read',
            filters: this.filters,
            sorters: this.sorters,
            group  : {field: this.groupField, direction: this.groupDir},
            start  : 0,
            limit  : this.pageSize,
            
            addRecords: false
        });
        
        var operation = new Ext.data.Operation(options);
        
        return this.proxy.read(operation, this.onProxyRead, this);
    },
    
    
    onProxyRead: function(operation) {
        var records = operation.getRecords();
        this.loadRecords(records, operation.addRecords);
        
        //this is a callback that would have been passed to the 'read' function and is optional
        var callback = operation.callback;
        if (typeof callback == 'function') {
            callback.call(operation.scope || this, records, operation, operation.wasSuccessful());
        }
    },
    
    onProxyWrite: function(operation) {
        var data    = this.data,
            action  = operation.action,
            records = operation.getRecords(),
            length  = records.length,
            record, i;
        
        if (action == 'create' || action == 'update') {
            for (i = 0; i < length; i++) {
                record = records[i];
                
                record.phantom = false;
                record.join(this);
                data.replace(record);
            }
        }
        
        else if (action == 'destroy') {
            for (i = 0; i < length; i++) {
                record = records[i];
                
                record.unjoin(this);
                data.remove(record);
            }
            
            this.removed = [];
        }
        
        this.fireEvent('datachanged');
        
        //this is a callback that would have been passed to the 'create', 'update' or 'destroy' function and is optional
        var callback = operation.callback;
        if (typeof callback == 'function') {
            callback.call(operation.scope || this, records, operation, operation.wasSuccessful());
        }
    },
    
    onBatchOperationComplete: function(batch, operation) {
        
    },
    
    /**
     * @private
     * Attached as the 'complete' event listener to a proxy's Batch object. Iterates over the batch operations
     * and updates the Store's internal data MixedCollection.
     */
    onBatchComplete: function(batch, operation) {
        var operations = batch.operations,
            length = operations.length,
            i;
        
        this.suspendEvents();
        
        for (i = 0; i < length; i++) {
            this.onProxyWrite(operations[i]);
        }
        
        this.resumeEvents();
        
        this.fireEvent('datachanged', this);
    },
    
    onBatchException: function(batch, operation) {
        // //decide what to do... could continue with the next operation
        // batch.start();
        // 
        // //or retry the last operation
        // batch.retry();
    },
    
    
    //returns any records that have not yet been realized
    getNewRecords: function() {
        return this.data.filter('phantom', true).items;
    },
    
    //returns any records that have been updated in the store but not yet updated on the proxy
    getUpdatedRecords: function() {
        return this.data.filter('dirty', true).items;
    },
    
    //returns any records that have been removed from the store but not yet destroyed on the proxy
    getRemovedRecords: function() {
        return this.removed;
    },
    
    /**
     * The default sort direction to use if one is not specified (defaults to "ASC")
     * @property defaultSortDirection
     * @type String
     */
    defaultSortDirection: "ASC",
    
    /**
     * Sorts the data in the Store by one or more of its properties. Example usage:
<pre><code>
//sort by a single field
myStore.sort('myField', 'DESC');

//sorting by multiple fields
myStore.sort([
    {
        field    : 'age',
        direction: 'ASC'
    },
    {
        field    : 'name',
        direction: 'DESC'
    }
]);
</code></pre>
     * @param {String|Array} sorters Either a string name of one of the fields in this Store's configured {@link Ext.data.Model Model},
     * or an Array of sorter configurations.
     * @param {String} direction The overall direction to sort the data by. Defaults to "ASC".
     * @param {Boolean} suppressEvent If true, the 'datachanged' event is not fired. Defaults to false
     */
    sort: function(sorters, direction, suppressEvent) {
        sorters = sorters || this.sorters;
        direction = (this.sortToggle[name] || this.defaultSortDirection).toggle('ASC', 'DESC');
        
        this.sortToggle[name] = direction;
        
        //first we need to normalize the arguments. This is to support the previous 2-argument
        //single sort function signature
        if (typeof sorters == 'string') {
            sorters = [{
                field    : sorters,
                direction: direction
            }];
        }
        
        this.sortInfo = {
            sorters: sorters,
            direction: direction
        };
        
        if (this.remoteSort) {
            //the read function will pick up the new sorters and request the sorted data from the proxy
            this.read();
        } else {
            if (sorters == undefined || sorters.length == 0) {
                return;
            }
            
            var sortFns = [],
                length  = sorters.length,
                i;
            
            //create a sorter function for each sorter field/direction combo
            for (i = 0; i < length; i++) {
                sortFns.push(this.createSortFunction(sorters[i].field, sorters[i].direction));
            }

            //the direction modifier is multiplied with the result of the sorting functions to provide overall sort direction
            //(as opposed to direction per field)
            var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;

            //create a function which ORs each sorter together to enable multi-sort
            var fn = function(r1, r2) {
                var result = sortFns[0].call(this, r1, r2);
               
                //if we have more than one sorter, OR any additional sorter functions together
                if (sortFns.length > 1) {
                    for (var i=1, j = sortFns.length; i < j; i++) {
                        result = result || sortFns[i].call(this, r1, r2);
                    }
                }
               
                return directionModifier * result;
            };

            //sort the data
            this.data.sort(direction, fn);
            
            if (!suppressEvent) {
                this.fireEvent('datachanged', this);
            }
        }
    },
    
    /**
     * @private
     * Creates and returns a function which sorts an array by the given field and direction
     * @param {String} field The field to create the sorter for
     * @param {String} direction The direction to sort by (defaults to "ASC")
     * @return {Function} A function which sorts by the field/direction combination provided
     */
    createSortFunction: function(field, direction) {
        direction = direction || "ASC";
        var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;

        var fields   = this.model.prototype.fields,
            sortType = fields.get(field).sortType;

        //create a comparison function. Takes 2 records, returns 1 if record 1 is greater,
        //-1 if record 2 is greater or 0 if they are equal
        return function(r1, r2) {
            var v1 = sortType(r1.data[field]),
                v2 = sortType(r2.data[field]);

            return directionModifier * (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
        };
    },
    
    /**
     * Filters the loaded set of records by a given set of filters. Optionally fires the 'datachanged' event.
     * @param {Mixed} filters The set of filters to apply to the data. These are stored internally on the store,
     * but the filtering itself is done on the Store's {@link Ext.util.MixedCollection MixedCollection}. See
     * MixedCollection's {@link Ext.util.MixedCollection#filter filter} method for filter syntax.
     * @param {Boolean} suppressEvent If true, the 'datachanged' event is not fired. Defaults to false
     */
    filter: function(filters, suppressEvent) {
        this.filters = filters || this.filters;
        
        if (this.remoteFilter) {
            //the read function will pick up the new filters and request the filtered data from the proxy
            this.read();
        } else {
            /**
             * A pristine (unfiltered) collection of the records in this store. This is used to reinstate
             * records when a filter is removed or changed
             * @property snapshot
             * @type Ext.util.MixedCollection
             */
            this.snapshot = this.snapshot || this.data;
            
            this.data = (this.snapshot || this.data).filter(this.filters);
            
            if (!suppressEvent) {
                this.fireEvent('datachanged', this);
            }
        }
    },
    
    /**
     * Revert to a view of the Record cache with no filtering applied.
     * @param {Boolean} suppressEvent If <tt>true</tt> the filter is cleared silently without firing the
     * {@link #datachanged} event.
     */
    clearFilter : function(suppressEvent){
        if (this.isFiltered()) {
            this.data = this.snapshot;
            delete this.snapshot;
            
            if (suppressEvent !== true) {
                this.fireEvent('datachanged', this);
            }
        }
    },
    
    /**
     * Returns true if this store is currently filtered
     * @return {Boolean}
     */
    isFiltered : function(){
        return !!this.snapshot && this.snapshot != this.data;
    },
    
    /**
     * Synchronizes the Store with its Proxy. This asks the Proxy to batch together any new, updated
     * and deleted records in the store, updating the Store's internal representation of the records
     * as each operation completes.
     */
    sync: function() {
        this.proxy.batch({
            create : this.getNewRecords(),
            update : this.getUpdatedRecords(),
            destroy: this.getRemovedRecords()
        }, this.getBatchListeners());
    },
    
    /**
     * @private
     * Returns an object which is passed in as the listeners argument to proxy.batch inside this.sync.
     * This is broken out into a separate function to allow for customisation of the listeners
     * @return {Object} The listeners object
     */
    getBatchListeners: function() {
        var listeners = {
            scope: this,
            exception: this.onBatchException
        };
        
        if (this.batchUpdateMode == 'operation') {
            listeners['operationComplete'] = this.onBatchOperationComplete;
        } else {
            listeners['complete'] = this.onBatchComplete;            
        }
        
        return listeners;
    },
    
    //deprecated, will be removed in 5.0
    save: function() {
        return this.sync.apply(this, arguments);
    },
    
    //pass straight through to this.read - could deprecate in 5.0
    load: function() {
        return this.read.apply(this, arguments);
    },
    
    /**
     * Loads an array of {@Ext.data.Model model} instances into the store, fires the datachanged event.
     * @param {Array} records The array of records to load
     * @param {Boolean} add True to add these records to the existing records, false to remove the Store's existing records first
     */
    loadRecords: function(records, add) {
        if (!add) {
            this.data.clear();
        }
        
        for (var i = 0, length = records.length; i < length; i++) {
            records[i].join(this);
        }
        
        this.data.addAll(records);
        
        if (this.filterOnLoad) {
            this.filter();
        }
        
        if (this.sortOnLoad) {
            this.sort();
        }
        
        this.fireEvent('datachanged', this);
    },
    
    /**
     * @private
     * A model instance should call this method on the Store it has been {@link Ext.data.Model#join joined} to.
     * @param {Ext.data.Model} record The model instance that was edited
     */
    afterEdit : function(record) {
        this.fireEvent('update', this, record, Ext.data.Model.EDIT);
    },
    
    /**
     * @private
     * A model instance should call this method on the Store it has been {@link Ext.data.Model#join joined} to..
     * @param {Ext.data.Model} record The model instance that was edited
     */
    afterReject : function(record) {
        this.fireEvent('update', this, record, Ext.data.Model.REJECT);
    },

    /**
     * @private
     * A model instance should call this method on the Store it has been {@link Ext.data.Model#join joined} to.
     * @param {Ext.data.Model} record The model instance that was edited
     */
    afterCommit : function(record) {
        this.fireEvent('update', this, record, Ext.data.Model.COMMIT);
    },
    
    /**
     * Loads an array of data straight into the Store
     * @param {Array} data Array of data to load. Any non-model instances will be cast into model instances first
     * @param {Boolean} append True to add the records to the existing records in the store, false to remove the old ones first
     */
    loadData: function(data, append) {
        var model = this.model;
        
        //make sure each data element is an Ext.data.Model instance
        for (var i = 0, length = data.length; i < length; i++) {
            var record = data[i];
            
            if (!(record instanceof Ext.data.Model)) {
                data[i] = Ext.ModelMgr.create(record, model);
            }
        }
        
        this.loadRecords(data, append);
    },
    
    
    // PAGING METHODS
    
    /**
     * Loads a given 'page' of data by setting the start and limit values appropriately
     * @param {Number} page The number of the page to load
     */
    loadPage: function(page) {
        this.currentPage = page;
        
        this.read({
            start: (page - 1) * this.pageSize,
            limit: this.pageSize
        });
    },
    
    /**
     * Loads the next 'page' in the current data set
     */
    nextPage: function() {
        this.loadPage(this.currentPage + 1);
    },
    
    /**
     * Loads the previous 'page' in the current data set
     */
    previousPage: function() {
        this.loadPage(this.currentPage - 1);
    },
    
    
    // UTILITY METHODS
    
    destroyStore: function() {
        if (!this.isDestroyed) {
            if (this.storeId) {
                Ext.StoreMgr.unregister(this);
            }
            this.clearData();
            this.data = null;
            Ext.destroy(this.proxy);
            this.reader = this.writer = null;
            this.purgeListeners();
            this.isDestroyed = true;
            
            if (this.implicitModel) {
                Ext.destroy(this.model);
            }
        }
    },
    
    // private
    clearData: function(){
        this.data.each(function(record) {
            record.unjoin();
        });
        
        this.data.clear();
    },
    
    /**
     * Finds the index of the first matching Record in this store by a specific field value.
     * @param {String} fieldName The name of the Record field to test.
     * @param {String/RegExp} value Either a string that the field value
     * should begin with, or a RegExp to test against the field.
     * @param {Number} startIndex (optional) The index to start searching at
     * @param {Boolean} anyMatch (optional) True to match any part of the string, not just the beginning
     * @param {Boolean} caseSensitive (optional) True for case sensitive comparison
     * @return {Number} The matched index or -1
     */
    find : function(property, value, start, anyMatch, caseSensitive){
        var fn = this.data.createFilterFn(property, value, anyMatch, caseSensitive);
        return fn ? this.data.findIndexBy(fn, null, start) : -1;
    },

    /**
     * Finds the index of the first matching Record in this store by a specific field value.
     * @param {String} fieldName The name of the Record field to test.
     * @param {Mixed} value The value to match the field against.
     * @param {Number} startIndex (optional) The index to start searching at
     * @return {Number} The matched index or -1
     */
    findExact: function(property, value, start){
        return this.data.findIndexBy(function(rec){
            return rec.get(property) === value;
        }, this, start);
    },

    /**
     * Find the index of the first matching Record in this Store by a function.
     * If the function returns <tt>true</tt> it is considered a match.
     * @param {Function} fn The function to be called. It will be passed the following parameters:<ul>
     * <li><b>record</b> : Ext.data.Record<p class="sub-desc">The {@link Ext.data.Record record}
     * to test for filtering. Access field values using {@link Ext.data.Record#get}.</p></li>
     * <li><b>id</b> : Object<p class="sub-desc">The ID of the Record passed.</p></li>
     * </ul>
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to this Store.
     * @param {Number} startIndex (optional) The index to start searching at
     * @return {Number} The matched index or -1
     */
    findBy : function(fn, scope, start){
        return this.data.findIndexBy(fn, scope, start);
    },
    
    /**
     * Gets the number of cached records.
     * <p>If using paging, this may not be the total size of the dataset. If the data object
     * used by the Reader contains the dataset size, then the {@link #getTotalCount} function returns
     * the dataset size.  <b>Note</b>: see the Important note in {@link #load}.</p>
     * @return {Number} The number of Records in the Store's cache.
     */
    getCount : function() {
        return this.data.length || 0;
    },
    
    /**
     * Get the Record at the specified index.
     * @param {Number} index The index of the Record to find.
     * @return {Ext.data.Model} The Record at the passed index. Returns undefined if not found.
     */
    getAt : function(index) {
        return this.data.itemAt(index);
    },

    /**
     * Returns a range of Records between specified indices.
     * @param {Number} startIndex (optional) The starting index (defaults to 0)
     * @param {Number} endIndex (optional) The ending index (defaults to the last Record in the Store)
     * @return {Ext.data.Model[]} An array of Records
     */
    getRange : function(start, end) {
        return this.data.getRange(start, end);
    },
    
    /**
     * Get the Record with the specified id.
     * @param {String} id The id of the Record to find.
     * @return {Ext.data.Record} The Record with the passed id. Returns undefined if not found.
     */
    getById : function(id) {
        return (this.snapshot || this.data).find(function(record) {
            return record.getId() === id;
        });
    },
    
    /**
     * Get the index within the cache of the passed Record.
     * @param {Ext.data.Model} record The Ext.data.Model object to find.
     * @return {Number} The index of the passed Record. Returns -1 if not found.
     */
    indexOf : function(record) {
        return this.data.indexOf(record);
    },

    /**
     * Get the index within the cache of the Record with the passed id.
     * @param {String} id The id of the Record to find.
     * @return {Number} The index of the Record. Returns -1 if not found.
     */
    indexOfId : function(id) {
        return this.data.indexOfKey(id);
    },
    
    /**
     * Returns an object describing the current sort state of this Store.
     * @return {Object} The sort state of the Store. An object with two properties:<ul>
     * <li><b>field : String<p class="sub-desc">The name of the field by which the Records are sorted.</p></li>
     * <li><b>direction : String<p class="sub-desc">The sort order, 'ASC' or 'DESC' (case-sensitive).</p></li>
     * </ul>
     * See <tt>{@link #sortInfo}</tt> for additional details.
     */
    getSortState : function() {
        return this.sortInfo;
    }
});
/**
 * @class Ext.StoreMgr
 * @extends Ext.util.MixedCollection
 * The default global group of stores.
 * @singleton
 * TODO: Make this an AbstractMgr
 */
Ext.StoreMgr = Ext.apply(new Ext.util.MixedCollection(), {
    /**
     * @cfg {Object} listeners @hide
     */

    /**
     * Registers one or more Stores with the StoreMgr. You do not normally need to register stores
     * manually.  Any store initialized with a {@link Ext.data.Store#storeId} will be auto-registered. 
     * @param {Ext.data.Store} store1 A Store instance
     * @param {Ext.data.Store} store2 (optional)
     * @param {Ext.data.Store} etc... (optional)
     */
    register : function() {
        for (var i = 0, s; (s = arguments[i]); i++) {
            this.add(s);
        }
    },

    /**
     * Unregisters one or more Stores with the StoreMgr
     * @param {String/Object} id1 The id of the Store, or a Store instance
     * @param {String/Object} id2 (optional)
     * @param {String/Object} etc... (optional)
     */
    unregister : function() {
        for (var i = 0, s; (s = arguments[i]); i++) {
            this.remove(this.lookup(s));
        }
    },

    /**
     * Gets a registered Store by id
     * @param {String/Object} id The id of the Store, or a Store instance
     * @return {Ext.data.Store}
     */
    lookup : function(id) {
        if (Ext.isArray(id)) {
            var fields = ['field1'], expand = !Ext.isArray(id[0]);
            if(!expand){
                for(var i = 2, len = id[0].length; i <= len; ++i){
                    fields.push('field' + i);
                }
            }
            return new Ext.data.ArrayStore({
                data  : id,
                fields: fields,
                expandData : expand,
                autoDestroy: true,
                autoCreated: true
            });
        }
        return Ext.isObject(id) ? (id.events ? id : Ext.create(id, 'store')) : this.get(id);
    },

    // getKey implementation for MixedCollection
    getKey : function(o) {
         return o.storeId;
    }
});
Ext.data.WriterMgr = new Ext.AbstractManager({
    
});
/**
 * @class Ext.data.Tree
 * @extends Ext.util.Observable
 * Represents a tree data structure and bubbles all the events for its nodes. The nodes
 * in the tree have most standard DOM functionality.
 * @constructor
 * @param {Node} root (optional) The root node
 */
Ext.data.Tree = Ext.extend(Ext.util.Observable, {
    
    constructor: function(root){
        this.nodeHash = {};
        /**
         * The root node for this tree
         * @type Node
         */
        this.root = null;
        if(root){
            this.setRootNode(root);
        }
        this.addEvents(
            /**
             * @event append
             * Fires when a new child node is appended to a node in this tree.
             * @param {Tree} tree The owner tree
             * @param {Node} parent The parent node
             * @param {Node} node The newly appended node
             * @param {Number} index The index of the newly appended node
             */
            "append",
            /**
             * @event remove
             * Fires when a child node is removed from a node in this tree.
             * @param {Tree} tree The owner tree
             * @param {Node} parent The parent node
             * @param {Node} node The child node removed
             */
            "remove",
            /**
             * @event move
             * Fires when a node is moved to a new location in the tree
             * @param {Tree} tree The owner tree
             * @param {Node} node The node moved
             * @param {Node} oldParent The old parent of this node
             * @param {Node} newParent The new parent of this node
             * @param {Number} index The index it was moved to
             */
            "move",
            /**
             * @event insert
             * Fires when a new child node is inserted in a node in this tree.
             * @param {Tree} tree The owner tree
             * @param {Node} parent The parent node
             * @param {Node} node The child node inserted
             * @param {Node} refNode The child node the node was inserted before
             */
            "insert",
            /**
             * @event beforeappend
             * Fires before a new child is appended to a node in this tree, return false to cancel the append.
             * @param {Tree} tree The owner tree
             * @param {Node} parent The parent node
             * @param {Node} node The child node to be appended
             */
            "beforeappend",
            /**
             * @event beforeremove
             * Fires before a child is removed from a node in this tree, return false to cancel the remove.
             * @param {Tree} tree The owner tree
             * @param {Node} parent The parent node
             * @param {Node} node The child node to be removed
             */
            "beforeremove",
            /**
             * @event beforemove
             * Fires before a node is moved to a new location in the tree. Return false to cancel the move.
             * @param {Tree} tree The owner tree
             * @param {Node} node The node being moved
             * @param {Node} oldParent The parent of the node
             * @param {Node} newParent The new parent the node is moving to
             * @param {Number} index The index it is being moved to
             */
            "beforemove",
            /**
             * @event beforeinsert
             * Fires before a new child is inserted in a node in this tree, return false to cancel the insert.
             * @param {Tree} tree The owner tree
             * @param {Node} parent The parent node
             * @param {Node} node The child node to be inserted
             * @param {Node} refNode The child node the node is being inserted before
             */
            "beforeinsert"
        );
        Ext.data.Tree.superclass.constructor.call(this);        
    },
    
    /**
     * @cfg {String} pathSeparator
     * The token used to separate paths in node ids (defaults to '/').
     */
    pathSeparator: "/",

    // private
    proxyNodeEvent : function(){
        return this.fireEvent.apply(this, arguments);
    },

    /**
     * Returns the root node for this tree.
     * @return {Node}
     */
    getRootNode : function(){
        return this.root;
    },

    /**
     * Sets the root node for this tree.
     * @param {Node} node
     * @return {Node}
     */
    setRootNode : function(node){
        this.root = node;
        node.ownerTree = this;
        node.isRoot = true;
        this.registerNode(node);
        return node;
    },

    /**
     * Gets a node in this tree by its id.
     * @param {String} id
     * @return {Node}
     */
    getNodeById : function(id){
        return this.nodeHash[id];
    },

    // private
    registerNode : function(node){
        this.nodeHash[node.id] = node;
    },

    // private
    unregisterNode : function(node){
        delete this.nodeHash[node.id];
    },

    toString : function(){
        return "[Tree"+(this.id?" "+this.id:"")+"]";
    }
});

/**
 * @class Ext.data.Node
 * @extends Ext.util.Observable
 * @cfg {Boolean} leaf true if this node is a leaf and does not have children
 * @cfg {String} id The id for this node. If one is not specified, one is generated.
 * @constructor
 * @param {Object} attributes The attributes/config for the node
 */
Ext.data.Node = Ext.extend(Ext.util.Observable, {
    
    constructor: function(attributes){
        /**
         * The attributes supplied for the node. You can use this property to access any custom attributes you supplied.
         * @type {Object}
         */
        this.attributes = attributes || {};
        this.leaf = this.attributes.leaf;
        /**
         * The node id. @type String
         */
        this.id = this.attributes.id;
        if(!this.id){
            this.id = Ext.id(null, "xnode-");
            this.attributes.id = this.id;
        }
        /**
         * All child nodes of this node. @type Array
         */
        this.childNodes = [];
        /**
         * The parent node for this node. @type Node
         */
        this.parentNode = null;
        /**
         * The first direct child node of this node, or null if this node has no child nodes. @type Node
         */
        this.firstChild = null;
        /**
         * The last direct child node of this node, or null if this node has no child nodes. @type Node
         */
        this.lastChild = null;
        /**
         * The node immediately preceding this node in the tree, or null if there is no sibling node. @type Node
         */
        this.previousSibling = null;
        /**
         * The node immediately following this node in the tree, or null if there is no sibling node. @type Node
         */
        this.nextSibling = null;

        this.addEvents({
            /**
             * @event append
             * Fires when a new child node is appended
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The newly appended node
             * @param {Number} index The index of the newly appended node
             */
            "append" : true,
            /**
             * @event remove
             * Fires when a child node is removed
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The removed node
             */
            "remove" : true,
            /**
             * @event move
             * Fires when this node is moved to a new location in the tree
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} oldParent The old parent of this node
             * @param {Node} newParent The new parent of this node
             * @param {Number} index The index it was moved to
             */
            "move" : true,
            /**
             * @event insert
             * Fires when a new child node is inserted.
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The child node inserted
             * @param {Node} refNode The child node the node was inserted before
             */
            "insert" : true,
            /**
             * @event beforeappend
             * Fires before a new child is appended, return false to cancel the append.
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The child node to be appended
             */
            "beforeappend" : true,
            /**
             * @event beforeremove
             * Fires before a child is removed, return false to cancel the remove.
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} node The child node to be removed
             */
            "beforeremove" : true,
            /**
             * @event beforemove
             * Fires before this node is moved to a new location in the tree. Return false to cancel the move.
             * @param {Tree} tree The owner tree
             * @param {Node} this This node
             * @param {Node} oldParent The parent of this node
             * @param {Node} newParent The new parent this node is moving to
             * @param {Number} index The index it is being moved to
             */
            "beforemove" : true,
             /**
              * @event beforeinsert
              * Fires before a new child is inserted, return false to cancel the insert.
              * @param {Tree} tree The owner tree
              * @param {Node} this This node
              * @param {Node} node The child node to be inserted
              * @param {Node} refNode The child node the node is being inserted before
              */
            "beforeinsert" : true
        });
        this.listeners = this.attributes.listeners;
        Ext.data.Node.superclass.constructor.call(this);    
    },
    
    // private
    fireEvent : function(evtName){
        // first do standard event for this node
        if(Ext.data.Node.superclass.fireEvent.apply(this, arguments) === false){
            return false;
        }
        // then bubble it up to the tree if the event wasn't cancelled
        var ot = this.getOwnerTree();
        if(ot){
            if(ot.proxyNodeEvent.apply(ot, arguments) === false){
                return false;
            }
        }
        return true;
    },

    /**
     * Returns true if this node is a leaf
     * @return {Boolean}
     */
    isLeaf : function(){
        return this.leaf === true;
    },

    // private
    setFirstChild : function(node){
        this.firstChild = node;
    },

    //private
    setLastChild : function(node){
        this.lastChild = node;
    },


    /**
     * Returns true if this node is the last child of its parent
     * @return {Boolean}
     */
    isLast : function(){
       return (!this.parentNode ? true : this.parentNode.lastChild == this);
    },

    /**
     * Returns true if this node is the first child of its parent
     * @return {Boolean}
     */
    isFirst : function(){
       return (!this.parentNode ? true : this.parentNode.firstChild == this);
    },

    /**
     * Returns true if this node has one or more child nodes, else false.
     * @return {Boolean}
     */
    hasChildNodes : function(){
        return !this.isLeaf() && this.childNodes.length > 0;
    },

    /**
     * Returns true if this node has one or more child nodes, or if the <tt>expandable</tt>
     * node attribute is explicitly specified as true (see {@link #attributes}), otherwise returns false.
     * @return {Boolean}
     */
    isExpandable : function(){
        return this.attributes.expandable || this.hasChildNodes();
    },

    /**
     * Insert node(s) as the last child node of this node.
     * @param {Node/Array} node The node or Array of nodes to append
     * @return {Node} The appended node if single append, or null if an array was passed
     */
    appendChild : function(node){
        var multi = false;
        if(Ext.isArray(node)){
            multi = node;
        }else if(arguments.length > 1){
            multi = arguments;
        }
        // if passed an array or multiple args do them one by one
        if(multi){
            for(var i = 0, len = multi.length; i < len; i++) {
                this.appendChild(multi[i]);
            }
        }else{
            if(this.fireEvent("beforeappend", this.ownerTree, this, node) === false){
                return false;
            }
            var index = this.childNodes.length;
            var oldParent = node.parentNode;
            // it's a move, make sure we move it cleanly
            if(oldParent){
                if(node.fireEvent("beforemove", node.getOwnerTree(), node, oldParent, this, index) === false){
                    return false;
                }
                oldParent.removeChild(node);
            }
            index = this.childNodes.length;
            if(index === 0){
                this.setFirstChild(node);
            }
            this.childNodes.push(node);
            node.parentNode = this;
            var ps = this.childNodes[index-1];
            if(ps){
                node.previousSibling = ps;
                ps.nextSibling = node;
            }else{
                node.previousSibling = null;
            }
            node.nextSibling = null;
            this.setLastChild(node);
            node.setOwnerTree(this.getOwnerTree());
            this.fireEvent("append", this.ownerTree, this, node, index);
            if(oldParent){
                node.fireEvent("move", this.ownerTree, node, oldParent, this, index);
            }
            return node;
        }
    },

    /**
     * Removes a child node from this node.
     * @param {Node} node The node to remove
     * @param {Boolean} destroy <tt>true</tt> to destroy the node upon removal. Defaults to <tt>false</tt>.
     * @return {Node} The removed node
     */
    removeChild : function(node, destroy){
        var index = this.childNodes.indexOf(node);
        if(index == -1){
            return false;
        }
        if(this.fireEvent("beforeremove", this.ownerTree, this, node) === false){
            return false;
        }

        // remove it from childNodes collection
        this.childNodes.splice(index, 1);

        // update siblings
        if(node.previousSibling){
            node.previousSibling.nextSibling = node.nextSibling;
        }
        if(node.nextSibling){
            node.nextSibling.previousSibling = node.previousSibling;
        }

        // update child refs
        if(this.firstChild == node){
            this.setFirstChild(node.nextSibling);
        }
        if(this.lastChild == node){
            this.setLastChild(node.previousSibling);
        }

        this.fireEvent("remove", this.ownerTree, this, node);
        if(destroy){
            node.destroy(true);
        }else{
            node.clear();
        }
        return node;
    },

    // private
    clear : function(destroy){
        // clear any references from the node
        this.setOwnerTree(null, destroy);
        this.parentNode = this.previousSibling = this.nextSibling = null;
        if(destroy){
            this.firstChild = this.lastChild = null;
        }
    },

    /**
     * Destroys the node.
     */
    destroy : function(/* private */ silent){
        /*
         * Silent is to be used in a number of cases
         * 1) When setRootNode is called.
         * 2) When destroy on the tree is called
         * 3) For destroying child nodes on a node
         */
        if(silent === true){
            this.purgeListeners();
            this.clear(true);
            Ext.each(this.childNodes, function(n){
                n.destroy(true);
            });
            this.childNodes = null;
        }else{
            this.remove(true);
        }
    },

    /**
     * Inserts the first node before the second node in this nodes childNodes collection.
     * @param {Node} node The node to insert
     * @param {Node} refNode The node to insert before (if null the node is appended)
     * @return {Node} The inserted node
     */
    insertBefore : function(node, refNode){
        if(!refNode){ // like standard Dom, refNode can be null for append
            return this.appendChild(node);
        }
        // nothing to do
        if(node == refNode){
            return false;
        }

        if(this.fireEvent("beforeinsert", this.ownerTree, this, node, refNode) === false){
            return false;
        }
        var index = this.childNodes.indexOf(refNode);
        var oldParent = node.parentNode;
        var refIndex = index;

        // when moving internally, indexes will change after remove
        if(oldParent == this && this.childNodes.indexOf(node) < index){
            refIndex--;
        }

        // it's a move, make sure we move it cleanly
        if(oldParent){
            if(node.fireEvent("beforemove", node.getOwnerTree(), node, oldParent, this, index, refNode) === false){
                return false;
            }
            oldParent.removeChild(node);
        }
        if(refIndex === 0){
            this.setFirstChild(node);
        }
        this.childNodes.splice(refIndex, 0, node);
        node.parentNode = this;
        var ps = this.childNodes[refIndex-1];
        if(ps){
            node.previousSibling = ps;
            ps.nextSibling = node;
        }else{
            node.previousSibling = null;
        }
        node.nextSibling = refNode;
        refNode.previousSibling = node;
        node.setOwnerTree(this.getOwnerTree());
        this.fireEvent("insert", this.ownerTree, this, node, refNode);
        if(oldParent){
            node.fireEvent("move", this.ownerTree, node, oldParent, this, refIndex, refNode);
        }
        return node;
    },

    /**
     * Removes this node from its parent
     * @param {Boolean} destroy <tt>true</tt> to destroy the node upon removal. Defaults to <tt>false</tt>.
     * @return {Node} this
     */
    remove : function(destroy){
        if (this.parentNode) {
            this.parentNode.removeChild(this, destroy);
        }
        return this;
    },

    /**
     * Removes all child nodes from this node.
     * @param {Boolean} destroy <tt>true</tt> to destroy the node upon removal. Defaults to <tt>false</tt>.
     * @return {Node} this
     */
    removeAll : function(destroy){
        var cn = this.childNodes,
            n;
        while((n = cn[0])){
            this.removeChild(n, destroy);
        }
        return this;
    },

    /**
     * Returns the child node at the specified index.
     * @param {Number} index
     * @return {Node}
     */
    item : function(index){
        return this.childNodes[index];
    },

    /**
     * Replaces one child node in this node with another.
     * @param {Node} newChild The replacement node
     * @param {Node} oldChild The node to replace
     * @return {Node} The replaced node
     */
    replaceChild : function(newChild, oldChild){
        var s = oldChild ? oldChild.nextSibling : null;
        this.removeChild(oldChild);
        this.insertBefore(newChild, s);
        return oldChild;
    },

    /**
     * Returns the index of a child node
     * @param {Node} node
     * @return {Number} The index of the node or -1 if it was not found
     */
    indexOf : function(child){
        return this.childNodes.indexOf(child);
    },

    /**
     * Returns the tree this node is in.
     * @return {Tree}
     */
    getOwnerTree : function(){
        // if it doesn't have one, look for one
        if(!this.ownerTree){
            var p = this;
            while(p){
                if(p.ownerTree){
                    this.ownerTree = p.ownerTree;
                    break;
                }
                p = p.parentNode;
            }
        }
        return this.ownerTree;
    },

    /**
     * Returns depth of this node (the root node has a depth of 0)
     * @return {Number}
     */
    getDepth : function(){
        var depth = 0;
        var p = this;
        while(p.parentNode){
            ++depth;
            p = p.parentNode;
        }
        return depth;
    },

    // private
    setOwnerTree : function(tree, destroy){
        // if it is a move, we need to update everyone
        if(tree != this.ownerTree){
            if(this.ownerTree){
                this.ownerTree.unregisterNode(this);
            }
            this.ownerTree = tree;
            // If we're destroying, we don't need to recurse since it will be called on each child node
            if(destroy !== true){
                Ext.each(this.childNodes, function(n){
                    n.setOwnerTree(tree);
                });
            }
            if(tree){
                tree.registerNode(this);
            }
        }
    },

    /**
     * Changes the id of this node.
     * @param {String} id The new id for the node.
     */
    setId: function(id){
        if(id !== this.id){
            var t = this.ownerTree;
            if(t){
                t.unregisterNode(this);
            }
            this.id = this.attributes.id = id;
            if(t){
                t.registerNode(this);
            }
            this.onIdChange(id);
        }
    },

    // private
    onIdChange: Ext.emptyFn,

    /**
     * Returns the path for this node. The path can be used to expand or select this node programmatically.
     * @param {String} attr (optional) The attr to use for the path (defaults to the node's id)
     * @return {String} The path
     */
    getPath : function(attr){
        attr = attr || "id";
        var p = this.parentNode;
        var b = [this.attributes[attr]];
        while(p){
            b.unshift(p.attributes[attr]);
            p = p.parentNode;
        }
        var sep = this.getOwnerTree().pathSeparator;
        return sep + b.join(sep);
    },

    /**
     * Bubbles up the tree from this node, calling the specified function with each node. The arguments to the function
     * will be the args provided or the current node. If the function returns false at any point,
     * the bubble is stopped.
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current Node.
     * @param {Array} args (optional) The args to call the function with (default to passing the current Node)
     */
    bubble : function(fn, scope, args){
        var p = this;
        while(p){
            if(fn.apply(scope || p, args || [p]) === false){
                break;
            }
            p = p.parentNode;
        }
    },

    /**
     * Cascades down the tree from this node, calling the specified function with each node. The arguments to the function
     * will be the args provided or the current node. If the function returns false at any point,
     * the cascade is stopped on that branch.
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current Node.
     * @param {Array} args (optional) The args to call the function with (default to passing the current Node)
     */
    cascade : function(fn, scope, args){
        if(fn.apply(scope || this, args || [this]) !== false){
            var cs = this.childNodes;
            for(var i = 0, len = cs.length; i < len; i++) {
                cs[i].cascade(fn, scope, args);
            }
        }
    },

    /**
     * Interates the child nodes of this node, calling the specified function with each node. The arguments to the function
     * will be the args provided or the current node. If the function returns false at any point,
     * the iteration stops.
     * @param {Function} fn The function to call
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the current Node in the iteration.
     * @param {Array} args (optional) The args to call the function with (default to passing the current Node)
     */
    eachChild : function(fn, scope, args){
        var cs = this.childNodes;
        for(var i = 0, len = cs.length; i < len; i++) {
            if(fn.apply(scope || this, args || [cs[i]]) === false){
                break;
            }
        }
    },

    /**
     * Finds the first child that has the attribute with the specified value.
     * @param {String} attribute The attribute name
     * @param {Mixed} value The value to search for
     * @param {Boolean} deep (Optional) True to search through nodes deeper than the immediate children
     * @return {Node} The found child or null if none was found
     */
    findChild : function(attribute, value, deep){
        return this.findChildBy(function(){
            return this.attributes[attribute] == value;
        }, null, deep);
    },

    /**
     * Finds the first child by a custom function. The child matches if the function passed returns <code>true</code>.
     * @param {Function} fn A function which must return <code>true</code> if the passed Node is the required Node.
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the function is executed. Defaults to the Node being tested.
     * @param {Boolean} deep (Optional) True to search through nodes deeper than the immediate children
     * @return {Node} The found child or null if none was found
     */
    findChildBy : function(fn, scope, deep){
        var cs = this.childNodes,
            len = cs.length,
            i = 0,
            n,
            res;
        for(; i < len; i++){
            n = cs[i];
            if(fn.call(scope || n, n) === true){
                return n;
            }else if (deep){
                res = n.findChildBy(fn, scope, deep);
                if(res != null){
                    return res;
                }
            }
            
        }
        return null;
    },

    /**
     * Sorts this nodes children using the supplied sort function.
     * @param {Function} fn A function which, when passed two Nodes, returns -1, 0 or 1 depending upon required sort order.
     * @param {Object} scope (optional)The scope (<code>this</code> reference) in which the function is executed. Defaults to the browser window.
     */
    sort : function(fn, scope){
        var cs = this.childNodes;
        var len = cs.length;
        if(len > 0){
            var sortFn = scope ? function(){fn.apply(scope, arguments);} : fn;
            cs.sort(sortFn);
            for(var i = 0; i < len; i++){
                var n = cs[i];
                n.previousSibling = cs[i-1];
                n.nextSibling = cs[i+1];
                if(i === 0){
                    this.setFirstChild(n);
                }
                if(i == len-1){
                    this.setLastChild(n);
                }
            }
        }
    },

    /**
     * Returns true if this node is an ancestor (at any point) of the passed node.
     * @param {Node} node
     * @return {Boolean}
     */
    contains : function(node){
        return node.isAncestor(this);
    },

    /**
     * Returns true if the passed node is an ancestor (at any point) of this node.
     * @param {Node} node
     * @return {Boolean}
     */
    isAncestor : function(node){
        var p = this.parentNode;
        while(p){
            if(p == node){
                return true;
            }
            p = p.parentNode;
        }
        return false;
    },

    toString : function(){
        return "[Node"+(this.id?" "+this.id:"")+"]";
    }
});
/**
 * @class Ext.data.Proxy
 * @extends Ext.util.Observable
 * <p>Base Proxy class. This provides an interface that all Proxy subclasses must honor and a small number of shared functions. This
 * Proxy should never be used directly, instead use one of its subclasses.</p>
 * <p>Proxies are used internally by {@link Ext.data.Store stores}, and operate on the principle that all operations performed are either
 * Create, Read, Update or Delete. These four operations are mapped to the methods {@link #create}, {@link #read}, {@link #update} and {@link #destroy}
 * respectively. Each Proxy subclass must implement these functions</p>
 * <p>The CRUD methods each expect an {@link Ext.data.Operation operation} object as the sole argument. The Operation encapsulates information about
 * the action the Store wishes to perform, the {@link Ext.data.Model model} instances that are to be modified, etc. See the {@link Ext.data.Operation Operation}
 * documentation for more details. Each CRUD method also accepts a callback function to be called asynchronously on completion.</p>
 * <p>Proxies also support batching of Operations via a {@link Ext.data.Batch batch} object, invoked by the {@link #batch} method.</p>
 * @constructor
 * Creates the Proxy
 * @param {Object} config Optional config object
 */
Ext.data.Proxy = Ext.extend(Ext.util.Observable, {
    /**
     * @cfg {String} batchOrder
     * Comma-separated ordering 'create', 'update' and 'destroy' actions when batching. Override this
     * to set a different order for the batched CRUD actions to be executed in. Defaults to 'create,update,destroy'
     */
    batchOrder: 'create,update,destroy',
    
    /**
     * @ignore
     */
    constructor: function(config) {
        Ext.data.Proxy.superclass.constructor.call(this, config);
        
        Ext.apply(this, config || {});
    },
    
    /**
     * Sets the model associated with this proxy. This will only usually be called by a Store
     * @param {String|Ext.dataModel} model The new model. Can be either the model name string,
     * or a reference to the model's constructor
     */
    setModel: function(model) {
        if (typeof model == 'string') {
            model = Ext.ModelMgr.types[model];
        }
        
        this.model = model;
    },
    
    /**
     * Performs the given create operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
     * @param {Object} scope Scope to execute the callback function in
     */
    create: Ext.emptyFn,
    
    /**
     * Performs the given read operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
     * @param {Object} scope Scope to execute the callback function in
     */
    read: Ext.emptyFn,
    
    /**
     * Performs the given update operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
     * @param {Object} scope Scope to execute the callback function in
     */
    update: Ext.emptyFn,
    
    /**
     * Performs the given destroy operation.
     * @param {Ext.data.Operation} operation The Operation to perform
     * @param {Function} callback Callback function to be called when the Operation has completed (whether successful or not)
     * @param {Object} scope Scope to execute the callback function in
     */
    destroy: Ext.emptyFn,
    
    /**
     * Performs a batch of {@link Ext.data.Operation Operations}, in the order specified by {@link #batchOrder}. Used internally by
     * {@link Ext.data.Store}'s {@link Ext.data.Store#sync sync} method. Example usage:
     * <pre><code>
     * myProxy.batch({
     *     create : [myModel1, myModel2],
     *     update : [myModel3],
     *     destroy: [myModel4, myModel5]
     * });
     * </code></pre>
     * Where the myModel* above are {@link Ext.data.Model Model} instances - in this case 1 and 2 are new instances and have not been 
     * saved before, 3 has been saved previously but needs to be updated, and 4 and 5 have already been saved but should now be destroyed.
     * @param {Object} operations Object containing the Model instances to act upon, keyed by action name
     * @param {Object} listeners Optional listeners object passed straight through to the Batch - see {@link Ext.data.Batch}
     * @return {Ext.data.Batch} The newly created Ext.data.Batch object
     */
    batch: function(operations, listeners) {
        var batch = new Ext.data.Batch({
            proxy: this,
            listeners: listeners || {}
        });
        
        Ext.each(this.batchOrder.split(','), function(action) {
            batch.add(new Ext.data.Operation({
                action : action, 
                records: operations[action]
            }));
        }, this);
        
        batch.start();
        
        return batch;
    }
});

//backwards compatibility
Ext.data.DataProxy = Ext.data.Proxy;

Ext.data.ProxyMgr.registerType('proxy', Ext.data.Proxy);
/**
 * @class Ext.data.ServerProxy
 * @extends Ext.data.Proxy
 * <p>ServerProxy is a superclass of ScriptTagProxy and AjaxProxy, and would not usually be used directly.</p>
 * 
 * <p>ServerProxy should ideally be named HttpProxy as it is a superclass for all HTTP proxies - for Ext JS 4.x it has been 
 * called ServerProxy to enable any 3.x applications that reference the HttpProxy to continue to work (HttpProxy is now an 
 * alias of AjaxProxy).</p>
 */
Ext.data.ServerProxy = Ext.extend(Ext.data.Proxy, {
    /**
     * @cfg {String} url The URL from which to request the data object.
     */
    
    /**
     * @cfg {Boolean} noCache (optional) Defaults to true. Disable caching by adding a unique parameter
     * name to the request.
     */
    noCache : true,
    
    /**
     * @cfg {String} cacheString
     * The name of the cache param added to the url when using noCache (defaults to "_dc")
     */
    cacheString: "_dc",
    
    /**
     * @cfg {String} defaultReaderType
     * The default registered reader type. Defaults to 'json'
     */
    defaultReaderType: 'json',
    
    /**
     * @cfg {String} defaultWriterType
     * The default registered writer type. Defaults to 'json'
     */
    defaultWriterType: 'json',
    
    /**
     * @ignore
     */
    constructor: function(config) {
        Ext.data.ServerProxy.superclass.constructor.call(this, config);
        
        /**
         * @cfg {Object} extraParams Extra parameters that will be included on every request. Individual requests with params
         * of the same name will override these params when they are in conflict.
         */
        this.extraParams = config.extraParams || {};
        
        //backwards compatibility, will be deprecated in 5.0
        this.nocache = this.noCache;
    },
    
    //in a ServerProxy all four CRUD operations are executed in the same manner, so we delegate to doRequest in each case
    create: function() {
        return this.doRequest.apply(this, arguments);
    },
    
    read: function() {
        return this.doRequest.apply(this, arguments);
    },
    
    update: function() {
        return this.doRequest.apply(this, arguments);
    },
    
    destroy: function() {
        return this.doRequest.apply(this, arguments);
    },
    
    /**
     * Creates and returns an Ext.data.Request object based on the options passed by the {@link Ext.data.Store Store}
     * that this Proxy is attached to.
     * @param {Ext.data.Operation} operation The {@link Ext.data.Operation Operation} object to execute
     * @return {Ext.data.Request} The request object
     */
    buildRequest: function(operation) {
        var params = Ext.applyIf(operation.params || {}, this.extraParams || {});
        
        //copy any sorters, filters etc into the params so they can be sent over the wire
        params = Ext.applyIf(params, {
            start   : operation.start,
            limit   : operation.limit,
            group   : operation.group,
            filters : operation.filters,
            sorters : operation.sorters
        });
        
        var request = new Ext.data.Request({
            params  : params,
            action  : operation.action,
            records : operation.records,
            
            operation : operation
        });
        
        request.url = this.buildUrl(request);
        
        /*
         * Save the request on the Operation. Operations don't usually care about Request and Response data, but in the
         * ServerProxy and any of its subclasses we add both request and response as they may be useful for further processing
         */
        operation.request = request;
        
        return request;
    },
    
    /**
     * Generates a url based on a given Ext.data.Request object. By default, ServerProxy's buildUrl will
     * add the cache-buster param to the end of the url. Subclasses may need to perform additional modifications
     * to the url.
     * @param {Ext.data.Request} request The request object
     * @return {String} The url
     */
    buildUrl: function(request) {
        var url = request.url || this.url;
        
        if (this.noCache) {
            url = Ext.urlAppend(url, String.format("{0}={1}", this.cacheString, (new Date().getTime())));
        }
        
        return url;
    },
    
    /**
     * In ServerProxy subclasses, the {@link #create}, {@link #read}, {@link #update} and {@link #destroy} methods all pass
     * through to doRequest. Each ServerProxy subclass must implement the doRequest method - see {@link Ext.data.ScriptTagProxy}
     * and {@link Ext.data.AjaxProxy} for examples. This method carries the same signature as each of the methods that delegate to it.
     * @param {Ext.data.Operation} operation The Ext.data.Operation object
     * @param {Function} callback The callback function to call when the Operation has completed
     * @param {Object} scope The scope in which to execute the callback
     */
    doRequest: function(operation, callback, scope) {
        throw new Error("The doRequest function has not been implemented on your Ext.data.ServerProxy subclass. See src/data/ServerProxy.js for details");
    },
    
    /**
     * Optional callback function which can be used to clean up after a request has been completed.
     * @param {Ext.data.Request} request The Request object
     * @param {Boolean} success True if the request was successful
     */
    afterRequest: Ext.emptyFn,
    
    /**
     * Returns the reader currently attached to this proxy instance
     * @return {Ext.data.Reader} The Reader instance
     */
    getReader: function() {
        var reader = this.reader;
        
        if (reader == undefined || !(reader instanceof Ext.data.Reader)) {
            if (typeof reader == 'string') {
                reader = {
                    type: reader
                };
            }
            
            Ext.applyIf(reader, {
                model: this.model
            });
            
            this.reader = Ext.data.ReaderMgr.create(reader || {}, this.defaultReaderType);
        }
        
        return this.reader;
    },
    
    /**
     * Returns the writer currently attached to this proxy instance
     * @return {Ext.data.Writer} The Writer instance
     */
    getWriter: function() {
        var writer = this.writer;
        
        if (writer == undefined || !(writer instanceof Ext.data.Writer)) {
            if (typeof writer == 'string') {
                writer = {
                    type: writer
                };
            }
            
            Ext.applyIf(writer, {
                model: this.model
            });
            
            this.writer = Ext.data.WriterMgr.create(writer || {}, this.defaultWriterType);
        }
        
        return this.writer;
    },
    
    onDestroy: function() {
        Ext.destroy(this.reader, this.writer);
        
        Ext.data.ServerProxy.superclass.destroy.apply(this, arguments);
    }
});
/**
 * @class Ext.data.AjaxProxy
 * @extends Ext.data.ServerProxy
 * <p>An implementation of {@link Ext.data.DataProxy} that processes data requests within the same
 * domain of the originating page.</p>
 * <p><b>Note</b>: this class cannot be used to retrieve data from a domain other
 * than the domain from which the running page was served. For cross-domain requests, use a
 * {@link Ext.data.ScriptTagProxy ScriptTagProxy}.</p>
 * <p>Be aware that to enable the browser to parse an XML document, the server must set
 * the Content-Type header in the HTTP response to "<tt>text/xml</tt>".</p>
 * @constructor
 * @param {Object} conn
 * An {@link Ext.data.Connection} object, or options parameter to {@link Ext.Ajax#request}.
 * <p>Note that if this HttpProxy is being used by a {@link Ext.data.Store Store}, then the
 * Store's call to {@link #load} will override any specified <tt>callback</tt> and <tt>params</tt>
 * options. In this case, use the Store's {@link Ext.data.Store#events events} to modify parameters,
 * or react to loading events. The Store's {@link Ext.data.Store#baseParams baseParams} may also be
 * used to pass parameters known at instantiation time.</p>
 * <p>If an options parameter is passed, the singleton {@link Ext.Ajax} object will be used to make
 * the request.</p>
 */
Ext.data.AjaxProxy = Ext.extend(Ext.data.ServerProxy, {
    /**
     * @property actionMethods
     * Mapping of action name to HTTP request method. In the basic AjaxProxy these are set to 'GET' for 'read' actions and 'POST' 
     * for 'create', 'update' and 'destroy' actions. The {@link Ext.data.RestProxy} maps these to the correct RESTful methods.
     */
    actionMethods: {
        create : 'POST',
        read   : 'GET',
        update : 'POST',
        destroy: 'POST'
    },
    
    /**
     * @ignore
     */
    doRequest: function(operation, callback, scope) {
        var writer  = this.getWriter(),
            request = writer.write(this.buildRequest(operation, callback, scope));
        
        Ext.apply(request, {
            scope   : this,
            callback: this.createRequestCallback(request, operation, callback, scope),
            method  : this.getMethod(request)
        });
        
        Ext.Ajax.request(request);
        
        return request;
    },
    
    /**
     * Returns the HTTP method name for a given request. By default this returns based on a lookup on {@link #actionMethods}.
     * @param {Ext.data.Request} request The request object
     * @return {String} The HTTP method to use (should be one of 'GET', 'POST', 'PUT' or 'DELETE')
     */
    getMethod: function(request) {
        return this.actionMethods[request.action];
    },
    
    /**
     * @private
     * TODO: This is currently identical to the ScriptTagProxy version except for the return function's signature. There is a lot
     * of code duplication inside the returned function so we need to find a way to DRY this up.
     * @param {Ext.data.Request} request The Request object
     * @param {Ext.data.Operation} operation The Operation being executed
     * @param {Function} callback The callback function to be called when the request completes. This is usually the callback
     * passed to doRequest
     * @param {Object} scope The scope in which to execute the callback function
     * @return {Function} The callback function
     */
    createRequestCallback: function(request, operation, callback, scope) {
        var me = this;
        
        return function(options, success, response) {
            if (success === true) {
                var reader = me.getReader(),
                    result = reader.read(response);

                //see comment in buildRequest for why we include the response object here
                Ext.apply(operation, {
                    response : response,
                    resultSet: result
                });

                operation.markCompleted();
            } else {
                this.fireEvent('exception', this, 'response', operation);
                
                //TODO: extract error message from reader
                operation.markException();                
            }
            
            //this callback is the one that was passed to the 'read' or 'write' function above
            if (typeof callback == 'function') {
                callback.call(scope || me, operation);
            }
            
            me.afterRequest(request, true);
        };
    }
});

Ext.data.ProxyMgr.registerType('ajax', Ext.data.AjaxProxy);

//backwards compatibility, remove in Ext JS 5.0
Ext.data.HttpProxy = Ext.data.AjaxProxy;
/**
 * @class Ext.data.RestProxy
 * @extends Ext.data.AjaxProxy
 * Specialization of the {@link Ext.data.AjaxProxy AjaxProxy} which simply maps the four actions (create, read, update and destroy)
 * to RESTful HTTP verbs
 */
Ext.data.RestProxy = Ext.extend(Ext.data.HttpProxy, {
    /**
     * Mapping of action name to HTTP request method. These default to RESTful conventions for the 'create', 'read',
     * 'update' and 'destroy' actions (which map to 'POST', 'GET', 'PUT' and 'DELETE' respectively). This object should
     * not be changed except globally via {@link Ext.override} - the {@link #getMethod} function can be overridden instead.
     * @property actionMethods
     * @type Object
     */
    actionMethods: {
        create : 'POST',
        read   : 'GET',
        update : 'PUT',
        destroy: 'DELETE'
    },
    
    api: {
        create : 'create',
        read   : 'read',
        update : 'update',
        destroy: 'destroy'
    }
});

Ext.data.ProxyMgr.registerType('rest', Ext.data.RestProxy);
Ext.apply(Ext, {
    /**
     * Returns the current document body as an {@link Ext.Element}.
     * @ignore
     * @memberOf Ext
     * @return Ext.Element The document body
     */
    getHead : function() {
        var head;
        
        return function() {
            if (head == undefined) {
                head = Ext.get(document.getElementsByTagName("head")[0]);
            }
            
            return head;
        };
    }()
});

/**
 * @class Ext.data.ScriptTagProxy
 * @extends Ext.data.ServerProxy
  * An implementation of Ext.data.DataProxy that reads a data object from a URL which may be in a domain
  * other than the originating domain of the running page.<br>
  * <p>
  * <b>Note that if you are retrieving data from a page that is in a domain that is NOT the same as the originating domain
  * of the running page, you must use this class, rather than HttpProxy.</b><br>
  * <p>
  * The content passed back from a server resource requested by a ScriptTagProxy <b>must</b> be executable JavaScript
  * source code because it is used as the source inside a &lt;script> tag.<br>
  * <p>
  * In order for the browser to process the returned data, the server must wrap the data object
  * with a call to a callback function, the name of which is passed as a parameter by the ScriptTagProxy.
  * Below is a Java example for a servlet which returns data for either a ScriptTagProxy, or an HttpProxy
  * depending on whether the callback name was passed:
  * <p>
  * <pre><code>
boolean scriptTag = false;
String cb = request.getParameter("callback");
if (cb != null) {
    scriptTag = true;
    response.setContentType("text/javascript");
} else {
    response.setContentType("application/x-json");
}
Writer out = response.getWriter();
if (scriptTag) {
    out.write(cb + "(");
}
out.print(dataBlock.toJsonString());
if (scriptTag) {
    out.write(");");
}
</code></pre>
 * <p>Below is a PHP example to do the same thing:</p><pre><code>
$callback = $_REQUEST['callback'];

// Create the output object.
$output = array('a' => 'Apple', 'b' => 'Banana');

//start output
if ($callback) {
    header('Content-Type: text/javascript');
    echo $callback . '(' . json_encode($output) . ');';
} else {
    header('Content-Type: application/x-json');
    echo json_encode($output);
}
</code></pre>
 * <p>Below is the ASP.Net code to do the same thing:</p><pre><code>
String jsonString = "{success: true}";
String cb = Request.Params.Get("callback");
String responseString = "";
if (!String.IsNullOrEmpty(cb)) {
    responseString = cb + "(" + jsonString + ")";
} else {
    responseString = jsonString;
}
Response.Write(responseString);
</code></pre>
 *
 */
Ext.data.ScriptTagProxy = Ext.extend(Ext.data.ServerProxy, {
    defaultWriterType: 'base',
    
    /**
     * @cfg {Number} timeout (optional) The number of milliseconds to wait for a response. Defaults to 30 seconds.
     */
    timeout : 30000,
    
    /**
     * @cfg {String} callbackParam (Optional) The name of the parameter to pass to the server which tells
     * the server the name of the callback function set up by the load call to process the returned data object.
     * Defaults to "callback".<p>The server-side processing must read this parameter value, and generate
     * javascript output which calls this named function passing the data object as its only parameter.
     */
    callbackParam : "callback",
    
    /**
     * @cfg {String} scriptIdPrefix
     * The prefix string that is used to create a unique ID for the injected script tag element (defaults to 'stcScript')
     */
    scriptIdPrefix: 'stcScript',
    
    /**
     * @cfg {String} callbackPrefix
     * The prefix string that is used to create a unique callback function name in the global scope. This can optionally
     * be modified to give control over how the callback string passed to the remote server is generated. Defaults to 'stcCallback'
     */
    callbackPrefix: 'stcCallback',
    
    /**
     * @cfg {String} recordParam
     * The param name to use when passing records to the server (e.g. 'records=someEncodedRecordString').
     * Defaults to 'records'
     */
    recordParam: 'records',
    
    /**
     * Reference to the most recent request made through this Proxy. Used internally to clean up when the Proxy is destroyed
     * @property lastRequest 
     * @type Ext.data.Request
     */
    lastRequest: undefined,

    /**
     * @private
     * Performs the read request to the remote domain. ScriptTagProxy does not actually create an Ajax request,
     * instead we write out a <script> tag based on the configuration of the internal Ext.data.Request object
     * @param {Ext.data.Operation} operation The {@link Ext.data.Operation Operation} object to execute
     * @param {Function} callback A callback function to execute when the Operation has been completed
     * @param {Object} scope The scope to execute the callback in
     */
    doRequest: function(operation, callback, scope) {
        //generate the unique IDs for this request
        var format     = String.format,
            transId    = ++Ext.data.ScriptTagProxy.TRANS_ID,
            scriptId   = format("{0}{1}", this.scriptIdPrefix, transId),
            stCallback = format("{0}{1}", this.callbackPrefix, transId);
        
        var writer  = this.getWriter(),
            request = writer.write(this.buildRequest(operation)),
            
            //FIXME: ideally this would be in buildUrl, but we don't know the stCallback name at that point
            url     = Ext.urlAppend(request.url, format("{0}={1}", this.callbackParam, stCallback));
        
        //apply ScriptTagProxy-specific attributes to the Request
        Ext.apply(request, {
            url       : url,
            transId   : transId,
            scriptId  : scriptId,
            stCallback: stCallback
        });
        
        //if the request takes too long this timeout function will cancel it
        request.timeoutId = this.createTimeoutHandler.defer(this.timeout, this, [request]);
        
        //this is the callback that will be called when the request is completed
        window[stCallback] = this.createRequestCallback(request, operation, callback, scope);
        
        //create the script tag and inject it into the document
        var script = document.createElement("script");
        script.setAttribute("src", url);
        script.setAttribute("type", "text/javascript");
        script.setAttribute("id", scriptId);
        
        Ext.getHead().appendChild(script);
        operation.markStarted();
        
        this.lastRequest = request;
        
        return request;
    },
    
    /**
     * @private
     * Creates and returns the function that is called when the request has completed. The returned function
     * should accept a Response object, which contains the response to be read by the configured Reader.
     * The third argument is the callback that should be called after the request has been completed and the Reader has decoded
     * the response. This callback will typically be the callback passed by a store, e.g. in proxy.read(operation, theCallback, scope)
     * theCallback refers to the callback argument received by this function.
     * See {@link #doRequest} for details.
     * @param {Ext.data.Request} request The Request object
     * @param {Ext.data.Operation} operation The Operation being executed
     * @param {Function} callback The callback function to be called when the request completes. This is usually the callback
     * passed to doRequest
     * @param {Object} scope The scope in which to execute the callback function
     * @return {Function} The callback function
     */
    createRequestCallback: function(request, operation, callback, scope) {
        var me = this;
        
        return function(response) {
            var reader = me.getReader(),
                result = reader.read(response);
            
            //see comment in buildRequest for why we include the response object here
            Ext.apply(operation, {
                response : response,
                resultSet: result
            });
            
            operation.markCompleted();
            
            //this callback is the one that was passed to the 'read' or 'write' function above
            if (typeof callback == 'function') {
                callback.call(scope || me, operation);
            }
            
            me.afterRequest(request, true);
        };
    },
    
    /**
     * Cleans up after a completed request by removing the now unnecessary script tag from the DOM. Also removes the 
     * global JSON-P callback function.
     * @param {Ext.data.Request} request The request object
     * @param {Boolean} isLoaded True if the request completed successfully
     */
    afterRequest: function() {
        var cleanup = function(functionName) {
            return function() {
                window[functionName] = undefined;
                
                try {
                    delete window[functionName];
                } catch(e) {}
            };
        };
        
        return function(request, isLoaded) {
            Ext.get(request.scriptId).remove();
            clearTimeout(request.timeoutId);
            
            var callbackName = request.stCallback;
            
            if (isLoaded) {
                cleanup(callbackName)();
                this.lastRequest.completed = true;
            } else {
                // if we haven't loaded yet, the callback might still be called in the future so don't unset it immediately
                window[callbackName] = cleanup(callbackName);
            }
        };
    }(),
    
    /**
     * Generates a url based on a given Ext.data.Request object. Adds the params and callback function name to the url
     * @param {Ext.data.Request} request The request object
     * @return {String} The url
     */
    buildUrl: function(request) {
        var url = Ext.data.ScriptTagProxy.superclass.buildUrl.call(this, request);
        
        url = Ext.urlAppend(url, Ext.urlEncode(request.params));
        
        //if there are any records present, append them to the url also
        var records = request.records;
        
        if (Ext.isArray(records) && records.length > 0) {
            url = Ext.urlAppend(url, String.format("{0}={1}", this.recordParam, this.encodeRecords(records)));
        }
        
        return url;
    },
    
    //inherit docs
    destroy: function() {
        this.abort();
        
        Ext.data.ScriptTagProxy.superclass.destroy.apply(this, arguments);
    },
        
    /**
     * @private
     * @return {Boolean} True if there is a current request that hasn't completed yet
     */
    isLoading : function(){
        var lastRequest = this.lastRequest;
        
        return (lastRequest != undefined && !lastRequest.completed);
    },
    
    /**
     * Aborts the current server request if one is currently running
     */
    abort: function() {
        if (this.isLoading()) {
            this.afterRequest(this.lastRequest);
        }
    },
        
    /**
     * Encodes an array of records into a string suitable to be appended to the script src url. This is broken
     * out into its own function so that it can be easily overridden.
     * @param {Array} records The records array
     * @return {String} The encoded records string
     */
    encodeRecords: function(records) {
        var encoded = "";
        
        for (var i = 0, length = records.length; i < length; i++) {
            encoded += Ext.urlEncode(records[i].data);
        }
        
        return encoded;
    },
    
    /**
     * @private
     * Starts a timer with the value of this.timeout - if this fires it means the request took too long so we
     * cancel the request. If the request was successful this timer is cancelled by this.afterRequest
     * @param {Ext.data.Request} request The Request to handle
     */
    createTimeoutHandler: function(request) {
        this.afterRequest(request, false);

        this.fireEvent('exception', this, 'response', request.action, {
            response: null,
            options : request.options
        });
        
        if (typeof request.callback == 'function') {
            request.callback.call(request.scope || window, null, request.options, false);
        }        
    }
});

Ext.data.ScriptTagProxy.TRANS_ID = 1000;

Ext.data.ProxyMgr.registerType('scripttag', Ext.data.ScriptTagProxy);
/**
 * @class Ext.data.ClientProxy
 * @extends Ext.data.Proxy
 * Base class for any client-side storage. Used as a superclass for Memory and ClientStorage proxies.
 * Do not use directly, use one of the subclasses instead.
 */
Ext.data.ClientProxy = Ext.extend(Ext.data.Proxy, {
    /**
     * Abstract function that must be implemented by each ClientProxy subclass. This should purge all record data
     * from the client side storage, as well as removing any supporting data (such as lists of record IDs)
     */
    clear: function() {
        throw new Error("The Ext.data.ClientProxy subclass that you are using has not defined a 'clear' function. See src/data/ClientProxy.js for details.");
    }
});
/**
 * @class Ext.data.MemoryProxy
 * @extends Ext.data.ClientProxy
 * @ignore
 * In-memory proxy. This proxy simply uses a local variable for data storage/retrieval, so its contents are
 * lost on every page refresh.
 */
Ext.data.MemoryProxy = Ext.extend(Ext.data.ClientProxy, {
    constructor: function(config) {
        Ext.data.MemoryProxy.superclass.constructor.call(this, config);
        
        this.data = {};
    }
});
/**
 * @class Ext.data.WebStorageProxy
 * @extends Ext.data.ClientProxy
 * Abstract base class for {@link Ext.data.LocalStorageProxy} and {@link Ext.data.SessionStorageProxy}, simply
 * provides common functionality between those classes as the browser APIs for them are essentially identical.
 * Don't use this proxy directly, use one of those subclasses instead.
 * @constructor
 * Creates the proxy, throws an error if local storage is not supported in the current browser
 * @param {Object} config Optional config object
 */
Ext.data.WebStorageProxy = Ext.extend(Ext.data.ClientProxy, {
    /**
     * @cfg {String} id The unique ID used as the key in which all record data are stored in the local storage object
     */
    id: undefined,
    
    /**
     * @ignore
     */
    constructor: function(config) {
        Ext.data.WebStorageProxy.superclass.constructor.call(this, config);
        
        if (this.getStorageObject() == undefined) {
            throw new Error("Local Storage is not supported in this browser, please use another type of data proxy");
        }
        
        //if an id is not given, try to use the store's id instead
        this.id = this.id || (this.store ? this.store.storeId : undefined);
        
        if (this.id == undefined) {
            throw new Error("No unique id was provided to the local storage proxy. See Ext.data.LocalStorageProxy documentation for details");
        }
        
        this.initialize();
    },
    
    //inherit docs
    create: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            ids     = this.getIds(),
            i, record;
        
        for (i = 0; i < length; i++) {
            record = records[i];
            
            if (record.phantom) {
                record.phantom = false;
                
                var id = this.getNextId();
                this.setRecord(record, id);

                ids.push(id);
            }
        }
        
        this.setIds(ids);
        
        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    
    //inherit docs
    read: function(operation, callback, scope) {
        //TODO: respect sorters, filters, start and limit options on the Operation
        
        var records = [],
            ids     = this.getIds(),
            length  = ids.length,
            i, recordData, record;
            
        for (i = 0; i < length; i++) {
            records.push(this.getRecord(ids[i]));
        }
        
        operation.resultSet = new Ext.data.ResultSet({
            records: records,
            total  : records.length,
            loaded : true
        });
        
        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    
    //inherit docs
    update: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            i;
        
        for (i = 0; i < length; i++) {
            this.setRecord(records[i]);
        }
        
        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    
    //inherit
    destroy: function(operation, callback, scope) {
        var records = operation.records,
            length  = records.length,
            ids     = this.getIds(),
            
            //newIds is a copy of ids, from which we remove the destroyed records
            newIds  = [].concat(ids),
            i;

        for (i = 0; i < length; i++) {
            newIds.remove(ids[i]);
            this.removeRecord(ids[i], false);
        }
        
        this.setIds(newIds);
        
        if (typeof callback == 'function') {
            callback.call(scope || this, operation);
        }
    },
    
    /**
     * @private
     * Fetches a model instance from the Proxy by ID. Runs each field's decode function (if present) to decode the data
     * @param {String} id The record's unique ID
     * @return {Ext.data.Model} The model instance
     */
    getRecord: function(id) {
        var rawData = Ext.decode(this.getStorageObject().getItem(this.getRecordKey(id))),
            data    = {},
            model   = this.model,
            fields  = model.prototype.fields.items,
            length  = fields.length,
            i, field, name;
            
        for (i = 0; i < length; i++) {
            field = fields[i];
            name  = field.name;
            
            if (typeof field.decode == 'function') {
                data[name] = field.decode(rawData[name]);
            } else {
                data[name] = rawData[name];
            }
        }
        
        var record = new model(data);
        record.phantom = false;
        
        return record;
    },
    
    /**
     * Saves the given record in the Proxy. Runs each field's encode function (if present) to encode the data
     * @param {Ext.data.Model} record The model instance
     * @param {String} id The id to save the record under (defaults to the value of the record's getId() function)
     */
    setRecord: function(record, id) {
        if (id) {
            record.setId(id);
        } else {
            id = record.getId();
        }
        
        var rawData = record.data,
            data    = {},
            model   = this.model,
            fields  = model.prototype.fields.items,
            length  = fields.length,
            i, field, name;
        
        for (i = 0; i < length; i++) {
            field = fields[i];
            name  = field.name;
            
            if (typeof field.encode == 'function') {
                data[name] = field.encode(rawData[name], record);
            } else {
                data[name] = rawData[name];
            }
        }
        
        var obj = this.getStorageObject(),
            key = this.getRecordKey(id);
        
        //iPad bug requires that we remove the item before setting it
        obj.removeItem(key);
        obj.setItem(key, Ext.encode(data));
    },
    
    /**
     * @private
     * Physically removes a given record from the local storage. Used internally by {@link #destroy}, which you should
     * use instead because it updates the list of currently-stored record ids
     * @param {String|Number|Ext.data.Model} id The id of the record to remove, or an Ext.data.Model instance
     */
    removeRecord: function(id, updateIds) {
        if (id instanceof Ext.data.Model) {
            id = id.getId();
        }
        
        if (updateIds !== false) {
            var ids = this.getIds();
            ids.remove(id);
            this.setIds(ids);
        }
        
        this.getStorageObject().removeItem(this.getRecordKey(id));
    },
    
    /**
     * @private
     * Given the id of a record, returns a unique string based on that id and the id of this proxy. This is used when
     * storing data in the local storage object and should prevent naming collisions.
     * @param {String|Number|Ext.data.Model} id The record id, or a Model instance
     * @return {String} The unique key for this record
     */
    getRecordKey: function(id) {
        if (id instanceof Ext.data.Model) {
            id = id.getId();
        }
        
        return String.format("{0}-{1}", this.id, id);
    },
    
    /**
     * @private
     * Returns the unique key used to store the current record counter for this proxy. This is used internally when
     * realizing models (creating them when they used to be phantoms), in order to give each model instance a unique id.
     * @return {String} The counter key
     */
    getRecordCounterKey: function() {
        return String.format("{0}-counter", this.id);
    },
    
    /**
     * @private
     * Returns the array of record IDs stored in this Proxy
     * @return {Array} The record IDs
     */
    getIds: function() {
        var ids = (this.getStorageObject().getItem(this.id) || "").split(",");
        
        if (ids.length == 1 && ids[0] == "") {
            ids = [];
        }
        
        return ids;
    },
    
    /**
     * @private
     * Saves the array of ids representing the set of all records in the Proxy
     * @param {Array} ids The ids to set
     */
    setIds: function(ids) {
        var obj = this.getStorageObject(),
            str = ids.join(",");
        
        if (Ext.isEmpty(str)) {
            obj.removeItem(this.id);
        } else {
            obj.setItem(this.id,  str);
        }
    },
    
    /**
     * @private
     * Returns the next numerical ID that can be used when realizing a model instance (see getRecordCounterKey). Increments
     * the counter.
     * @return {Number} The id
     */
    getNextId: function() {
        var obj  = this.getStorageObject(),
            key  = this.getRecordCounterKey(),
            last = +obj[key],
            id   = last ? last + 1 : 1;
        
        obj.setItem(key, id);
        
        return parseInt(id, 10);
    },
    
    /**
     * @private
     * Sets up the Proxy by claiming the key in the storage object that corresponds to the unique id of this Proxy. Called
     * automatically by the constructor, this should not need to be called again unless {@link #clear} has been called.
     */
    initialize: function() {
        var storageObject = this.getStorageObject();
        storageObject.setItem(this.id, storageObject.getItem(this.id) || "");
    },
    
    /**
     * Destroys all records stored in the proxy and removes all keys and values used to support the proxy from the storage object
     */
    clear: function() {
        var obj = this.getStorageObject(),
            ids = this.getIds(),
            len = ids.length,
            i;
        
        //remove all the records
        for (i = 0; i < len; i++) {
            this.removeRecord(ids[i]);
        }
        
        //remove the supporting objects
        obj.removeItem(this.getRecordCounterKey());
        obj.removeItem(this.id);
    },
    
    /**
     * @private
     * Abstract function which should return the storage object that data will be saved to. This must be implemented
     * in each subclass.
     * @return {Object} The storage object
     */
    getStorageObject: function() {
        throw new Error("The getStorageObject function has not been defined in your Ext.data.WebStorageProxy subclass");
    }
});
/**
 * @class Ext.data.LocalStorageProxy
 * @extends Ext.data.WebStorageProxy
 * Proxy which uses HTML5 local storage as its data storage/retrieval mechanism.
 * If this proxy is used in a browser where local storage is not supported, the constructor will throw an error. 
 * A local storage proxy requires a unique ID which is used as a key in which all record data are stored in the
 * local storage object. It is the developer's responsibility to ensure uniqueness of this key as it cannot be
 * reliably determined otherwise. If no id is provided but the attached store has a storeId, the storeId will be
 * used. If neither option is presented the proxy will throw an error.
 * Example usage:
<pre><code>
new Ext.data.Store({
    proxy: new Ext.data.LocalStorageProxy({
        id: 'myProxyKey'
    })
});
</code></pre>
 */
Ext.data.LocalStorageProxy = Ext.extend(Ext.data.WebStorageProxy, {
    //inherit docs
    getStorageObject: function() {
        return localStorage;
    }
});

Ext.data.ProxyMgr.registerType('localstorage', Ext.data.LocalStorageProxy);
/**
 * @class Ext.data.SessionStorageProxy
 * @extends Ext.data.WebStorageProxy
 * Proxy which uses HTML5 session storage as its data storage/retrieval mechanism.
 * If this proxy is used in a browser where session storage is not supported, the constructor will throw an error. 
 * A session storage proxy requires a unique ID which is used as a key in which all record data are stored in the
 * session storage object. It is the developer's responsibility to ensure uniqueness of this key as it cannot be
 * reliably determined otherwise. If no id is provided but the attached store has a storeId, the storeId will be
 * used. If neither option is presented the proxy will throw an error.
 * Example usage:
<pre><code>
new Ext.data.Store({
    proxy: new Ext.data.SessionStorageProxy({
        id: 'myProxyKey'
    })
});
</code></pre>
 * Note that session storage is different to local storage (see {@link Ext.data.LocalStorageProxy}) - if a browser
 * session is ended (e.g. by closing the browser) then all data in a SessionStorageProxy are lost. Browser restarts
 * don't affect the {@link Ext.data.LocalStorageProxy} - the data are preserved.
 */
Ext.data.SessionStorageProxy = Ext.extend(Ext.data.WebStorageProxy, {
    //inherit docs
    getStorageObject: function() {
        return sessionStorage;
    }
});

Ext.data.ProxyMgr.registerType('sessionstorage', Ext.data.SessionStorageProxy);
/**
 * @class Ext.data.Reader
 * @extends Object
 * Base reader class. Only useful for MemoryProxy when raw data objects are presented
 * to the reader - for other situations us a Reader subclass.
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Reader = Ext.extend(Object, {
    /**
     * @cfg {String} idProperty Name of the property within a row object
     * that contains a record identifier value.  Defaults to <tt>id</tt>
     */
    idProperty: 'id',
    
    /**
     * @cfg {String} totalProperty Name of the property from which to
     * retrieve the total number of records in the dataset. This is only needed
     * if the whole dataset is not passed in one go, but is being paged from
     * the remote server.  Defaults to <tt>total</tt>.
     */
    totalProperty: 'total',
    
    /**
     * @cfg {String} successProperty Name of the property from which to
     * retrieve the success attribute. Defaults to <tt>success</tt>.  See
     * {@link Ext.data.DataProxy}.{@link Ext.data.DataProxy#exception exception}
     * for additional information.
     */
    successProperty: 'success',
    
    /**
     * @cfg {String} root <b>Required</b>.  The name of the property
     * which contains the Array of row objects.  Defaults to <tt>undefined</tt>.
     * An exception will be thrown if the root property is undefined. The data
     * packet value for this property should be an empty array to clear the data
     * or show no data.
     */
    root: '',
    
    constructor: function(config) {
        Ext.apply(this, config || {});
        
        this.buildExtractors();
    },
    
    /**
     * Reads the given response object. This method normalizes the different types of response object that may be passed
     * to it, before handing off the reading of records to the {@link readRecords} function.
     * @param {Object} response The response object. This may be either an XMLHttpRequest object or a plain JS object
     * @return {Ext.data.ResultSet} The parsed ResultSet object
     */
    read: function(response) {
        var data = response;
        
        if (response.responseText) {
            data = this.getResponseData(response);
        }
        
        return this.readRecords(data);
    },
    
    /**
     * Abstracts common functionality used by all Reader subclasses. Each subclass is expected to call
     * this function before running its own logic and returning the Ext.data.ResultSet instance. For most
     * Readers additional processing should not be needed.
     * @param {Mixed} data The raw data object
     * @return {Ext.data.ResultSet} A ResultSet object
     */
    readRecords: function(data) {
        /**
         * The raw data object that was last passed to readRecords. Stored for further processing if needed
         * @property rawData
         * @type Mixed
         */
        this.rawData = data;
        
        var data    = this.getData(data),
            root    = this.getRoot(data),
            total   = root.length,
            success = true;
        
        if (this.totalProperty) {
            var value = parseInt(this.getTotal(data), 10);
            
            if (!isNaN(value)) {
                total = value;
            }
        }
        
        if (this.successProperty) {
            var value = this.getSuccess(data);
            
            if (value === false || value === 'false') {
                success = false;
            }
        }
        
        var records = this.extractData(root, true);
        
        return new Ext.data.ResultSet({
            total  : total || records.length,
            count  : records.length,
            records: records,
            success: success
        });
    },
    
    /**
     * Returns extracted, type-cast rows of data.  Iterates to call #extractValues for each row
     * @param {Object[]/Object} data-root from server response
     * @param {Boolean} returnRecords [false] Set true to return instances of Ext.data.Record
     * @private
     */
    extractData : function(root, returnRecords) {
        var values  = [],
            records = [],
            model   = this.model,
            length  = root.length,
            idProp  = this.idProperty;
        
        for (var i = 0; i < length; i++) {
            var node   = root[i],
                values = this.extractValues(node),
                id     = this.getId(node);
            
            if (returnRecords === true) {
                var record = new model(values, id);
                record.raw = node;
                records.push(record);
            } else {
                values[idProperty] = id;
                records.push(values);
            }
        }
        
        return records;
    },
    
    /**
     * @private
     * Given an object representing a single model instance's data, iterates over the model's fields and 
     * builds an object with the value for each field, running the field's convert function first if present
     * @param {Object} data The data object to convert
     * @return {Object} Data object suitable for use with a model constructor
     */
    extractValues: function(data) {
        var fields = this.model.prototype.fields.items,
            length = fields.length,
            output = {};
        
        for (var i = 0; i < length; i++) {
            var field = fields[i],
                value = this.extractorFunctions[i](data) || field.defaultValue;
            
            output[field.name] = field.convert(value, data);
        }
        
        return output;
    },
    
    /**
     * @private
     * By default this function just returns what is passed to it. It can be overridden in a subclass
     * to return something else. See XmlReader for an example.
     * @param {Object} data The data object
     * @return {Object} The normalized data object
     */
    getData: function(data) {
        return data;
    },
    
    /**
     * @private
     * This will usually need to be implemented in a subclass. Given a generic data object (the type depends on the type
     * of data we are reading), this function should return the object as configured by the Reader's 'root' meta data config.
     * See XmlReader's getRoot implementation for an example. By default the same data object will simply be returned.
     * @param {Mixed} data The data object
     * @return {Mixed} The same data object
     */
    getRoot: function(data) {
        return data;
    },
    
    /**
     * Takes a raw response object (as passed to this.read) and returns the useful data segment of it. This must be implemented by each subclass
     * @param {Object} response The responce object
     * @return {Object} The useful data from the response
     */
    getResponseData: function(response) {
        throw new Error("getResponseData must be implemented in the Ext.data.Reader subclass");
    },
    
    /**
     * @private
     * Reconfigures the meta data tied to this Reader
     */
    onMetaChange : function(meta) {
        Ext.apply(this, meta || {});
        
        delete this.extractorFunctions;
        this.buildExtractors();
    },
    
    /**
     * @private
     * This builds optimized functions for retrieving record data and meta data from an object.
     * Subclasses may need to implement their own getRoot function.
     */
    buildExtractors: function() {
        if (this.extractorFunctions) {
            return;
        }
        
        var idProp      = this.id || this.idProperty,
            totalProp   = this.totalProperty,
            successProp = this.successProperty,
            messageProp = this.messageProperty;
        
        //build the extractors for all the meta data
        if (totalProp) {
            this.getTotal = this.createAccessor(totalProp);
        }
        
        if (successProp) {
            this.getSuccess = this.createAccessor(successProp);
        }
        
        if (messageProp) {
            this.getMessage = this.createAccessor(messageProp);
        }
        
        if (idProp) {
            var accessor = this.createAccessor(idProp);
            
            this.getId = function(record) {
                var id = accessor(record);
                
                return (id == undefined || id == '') ? null : id;
            };
        } else {
            this.getId = function() {
                return null;
            };
        }
        
        //now build the extractors for all the fields
        var fields = this.model.prototype.fields.items,
            extractorFunctions = [];
        
        for (var i = 0, length = fields.length; i < length; i++) {
            var field = fields[i],
                map   = (field.mapping !== undefined && field.mapping !== null) ? field.mapping : field.name;
            
            extractorFunctions.push(this.createAccessor(map));
        }
        
        this.extractorFunctions = extractorFunctions;
    }
});
/**
 * @class Ext.data.Writer
 * @extends Object
 * Base Writer class. Just strips out the data from the model and returns it as a JavaScript
 * object. Used in the MemoryProxy, but in other cases a Writer subclass should be used.
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.data.Writer = Ext.extend(Object, {
    
    constructor: function(config) {
        Ext.apply(this, config);
    },
    
    /**
     * Prepares a Proxy's Ext.data.Request object 
     * @param {Ext.data.Request} request The request object
     * @return {Ext.data.Request} The modified request object
     */
    write: function(request) {
        return request;
    }
});

Ext.data.WriterMgr.registerType('base', Ext.data.Writer);

/*
Copyright(c) 2010 Sencha Inc.
licensing@sencha.com
http://www.sencha.com/touchlicense
*/

/**
 * @class Ext.data.JsonWriter
 * @extends Ext.data.Writer
 * Writer that outputs model data in JSON format
 */
Ext.data.JsonWriter = Ext.extend(Ext.data.Writer, {
    /**
     * @cfg {String} root The key under which the records in this Writer will be placed. Defaults to 'records'.
     * Example generated request:
<pre><code>
{'records': [{name: 'my record'}, {name: 'another record'}]}
</code></pre>
     */
    root: 'records',
    
    //inherit docs
    write: function(request) {
        return this.writeRecords(request);
    },
    
    //inherit docs
    writeRecords: function(request) {
        var operation = request.operation,
            action    = operation.action,
            records   = operation.records || [],
            data      = [];
        
        for (var i = 0, length = records.length; i < length; i++) {
            data.push(records[i].data);
        }
        
        if (this.encode === true) {
            data = Ext.encode(data);
        }
        
        request.jsonData = request.jsonData || {};
        request.jsonData[this.root] = data;
        
        return request;
    }
});

Ext.data.WriterMgr.registerType('json', Ext.data.JsonWriter);

/**
 * @class Ext.data.JsonReader
 * @extends Ext.data.Reader
 * JSON Reader
 */
Ext.data.JsonReader = Ext.extend(Ext.data.Reader, {

    /**
     * Reads a JSON object and returns a ResultSet. Uses the internal getTotal and getSuccess extractors to
     * retrieve meta data from the response, and extractData to turn the JSON data into model instances.
     * @param {Object} data The raw JSON data
     * @return {Ext.data.ResultSet} A ResultSet containing model instances and meta data about the results
     */
    readRecords: function(data) {
        //this has to be before the call to super because we use the meta data in the superclass readRecords
        if (data.metaData) {
            this.onMetaChange(data.metaData);
        }
        
        /**
         * DEPRECATED - will be removed in Ext JS 5.0. This is just a copy of this.rawData - use that instead
         * @property jsonData
         * @type Mixed
         */
        this.jsonData = data;
        
        return Ext.data.JsonReader.superclass.readRecords.call(this, data);
    },
    
    //inherit docs
    getResponseData: function(response) {
        var data = Ext.decode(response.responseText);
        
        if (!data) {
            throw {message: 'Ext.data.JsonReader.read: Json object not found'};
        }
        
        return data;
    },
    
    //inherit docs
    buildExtractors : function() {
        Ext.data.JsonReader.superclass.buildExtractors.apply(this, arguments);
        
        if (this.root) {
            this.getRoot = this.createAccessor(this.root);
        } else {
            this.getRoot = function(root) {
                return root;
            };
        }
    },
    
    /**
     * @private
     * Returns an accessor function for the given property string. Gives support for properties such as the following:
     * 'someProperty'
     * 'some.property'
     * 'some["property"]'
     * This is used by buildExtractors to create optimized extractor functions when casting raw data into model instances.
     */
    createAccessor : function() {
        var re = /[\[\.]/;
        
        return function(expr) {
            if (Ext.isEmpty(expr)) {
                return Ext.emptyFn;
            }
            if (Ext.isFunction(expr)) {
                return expr;
            }
            var i = String(expr).search(re);
            if (i >= 0) {
                return new Function('obj', 'return obj' + (i > 0 ? '.' : '') + expr);
            }
            return function(obj) {
                return obj[expr];
            };
        };
    }()
});

Ext.data.ReaderMgr.registerType('json', Ext.data.JsonReader);
/**
 * @class Ext.data.ArrayReader
 * @extends Ext.data.JsonReader
 * <p>Data reader class to create an Array of {@link Ext.data.Record} objects from an Array.
 * Each element of that Array represents a row of data fields. The
 * fields are pulled into a Record object using as a subscript, the <code>mapping</code> property
 * of the field definition if it exists, or the field's ordinal position in the definition.</p>
 * <p>Example code:</p>
 * <pre><code>
var Employee = Ext.data.Record.create([
    {name: 'name', mapping: 1},         // "mapping" only needed if an "id" field is present which
    {name: 'occupation', mapping: 2}    // precludes using the ordinal position as the index.
]);
var myReader = new Ext.data.ArrayReader({
    {@link #idIndex}: 0
}, Employee);
</code></pre>
 * <p>This would consume an Array like this:</p>
 * <pre><code>
[ [1, 'Bill', 'Gardener'], [2, 'Ben', 'Horticulturalist'] ]
 * </code></pre>
 * @constructor
 * Create a new ArrayReader
 * @param {Object} meta Metadata configuration options.
 * @param {Array/Object} recordType
 * <p>Either an Array of {@link Ext.data.Field Field} definition objects (which
 * will be passed to {@link Ext.data.Record#create}, or a {@link Ext.data.Record Record}
 * constructor created from {@link Ext.data.Record#create}.</p>
 */
Ext.data.ArrayReader = Ext.extend(Ext.data.JsonReader, {

    /**
     * @private
     * Most of the work is done for us by JsonReader, but we need to overwrite the field accessors to just
     * reference the correct position in the array.
     */
    buildExtractors: function() {
        Ext.data.ArrayReader.superclass.buildExtractors.apply(this, arguments);
        
        var fields = this.model.prototype.fields.items,
            length = fields.length,
            extractorFunctions = [],
            i;
        
        for (i = 0; i < length; i++) {
            extractorFunctions.push(function(index) {
                return function(data) {
                    return data[index];
                };
            }(fields[i].mapping || i));
        }
        
        this.extractorFunctions = extractorFunctions;
    }
});

Ext.data.ReaderMgr.registerType('array', Ext.data.ArrayReader);

/**
 * @class Ext.data.ArrayStore
 * @extends Ext.data.Store
 * <p>Small helper class to make creating {@link Ext.data.Store}s from Array data easier.
 * An ArrayStore will be automatically configured with a {@link Ext.data.ArrayReader}.</p>
 * <p>A store configuration would be something like:<pre><code>
var store = new Ext.data.ArrayStore({
    // store configs
    autoDestroy: true,
    storeId: 'myStore',
    // reader configs
    idIndex: 0,  
    fields: [
       'company',
       {name: 'price', type: 'float'},
       {name: 'change', type: 'float'},
       {name: 'pctChange', type: 'float'},
       {name: 'lastChange', type: 'date', dateFormat: 'n/j h:ia'}
    ]
});
 * </code></pre></p>
 * <p>This store is configured to consume a returned object of the form:<pre><code>
var myData = [
    ['3m Co',71.72,0.02,0.03,'9/1 12:00am'],
    ['Alcoa Inc',29.01,0.42,1.47,'9/1 12:00am'],
    ['Boeing Co.',75.43,0.53,0.71,'9/1 12:00am'],
    ['Hewlett-Packard Co.',36.53,-0.03,-0.08,'9/1 12:00am'],
    ['Wal-Mart Stores, Inc.',45.45,0.73,1.63,'9/1 12:00am']
];
 * </code></pre>
 * An object literal of this form could also be used as the {@link #data} config option.</p>
 * <p><b>*Note:</b> Although not listed here, this class accepts all of the configuration options of 
 * <b>{@link Ext.data.ArrayReader ArrayReader}</b>.</p>
 * @constructor
 * @param {Object} config
 * @xtype arraystore
 */
Ext.data.ArrayStore = Ext.extend(Ext.data.Store, {
    /**
     * @cfg {Ext.data.DataReader} reader @hide
     */
    constructor: function(config) {
        config = config || {};
              
        Ext.applyIf(config, {
            proxy: {
                type: 'memory',
                reader: 'array'
            }
        });
        
        Ext.data.ArrayStore.superclass.constructor.call(this, config);
    },

    loadData : function(data, append){
        if (this.expandData === true) {
            var r = [],
                i;
                
            for(i = 0, len = data.length; i < len; i++){
                r[r.length] = [data[i]];
            }
            
            data = r;
        }
        
        Ext.data.ArrayStore.superclass.loadData.call(this, data, append);
    }
});
Ext.reg('arraystore', Ext.data.ArrayStore);

// backwards compat
Ext.data.SimpleStore = Ext.data.ArrayStore;
Ext.reg('simplestore', Ext.data.SimpleStore);
/**
 * @class Ext.data.JsonStore
 * @extends Ext.data.Store
 * <p>Small helper class to make creating {@link Ext.data.Store}s from JSON data easier.
 * A JsonStore will be automatically configured with a {@link Ext.data.JsonReader}.</p>
 * <p>A store configuration would be something like:<pre><code>
var store = new Ext.data.JsonStore({
    // store configs
    autoDestroy: true,
    url: 'get-images.php',
    storeId: 'myStore',
    // reader configs
    root: 'images',
    idProperty: 'name',
    fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date'}]
});
 * </code></pre></p>
 * <p>This store is configured to consume a returned object of the form:<pre><code>
{
    images: [
        {name: 'Image one', url:'/GetImage.php?id=1', size:46.5, lastmod: new Date(2007, 10, 29)},
        {name: 'Image Two', url:'/GetImage.php?id=2', size:43.2, lastmod: new Date(2007, 10, 30)}
    ]
}
 * </code></pre>
 * An object literal of this form could also be used as the {@link #data} config option.</p>
 * <p><b>*Note:</b> Although not listed here, this class accepts all of the configuration options of
 * <b>{@link Ext.data.JsonReader JsonReader}</b>.</p>
 * @constructor
 * @param {Object} config
 * @xtype jsonstore
 */
Ext.data.JsonStore = Ext.extend(Ext.data.Store, {
    /**
     * @cfg {Ext.data.DataReader} reader @hide
     */
    constructor: function(config) {
        config = config || {};
              
        Ext.applyIf(config, {
            proxy: {
                type  : 'ajax',
                reader: 'json',
                writer: 'json'
            }
        });
        
        Ext.data.JsonStore.superclass.constructor.call(this, config);
    }
});

Ext.reg('jsonstore', Ext.data.JsonStore);
/**
 * @class Ext.data.JsonPStore
 * @extends Ext.data.Store
 * <p>Small helper class to make creating {@link Ext.data.Store}s from different domain JSON data easier.
 * A JsonPStore will be automatically configured with a {@link Ext.data.JsonReader} and a {@link Ext.data.ScriptTagProxy ScriptTagProxy}.</p>
 * <p>A store configuration would be something like:<pre><code>
var store = new Ext.data.JsonStore({
    // store configs
    autoDestroy: true,
    storeId: 'myStore',
    
    // proxy configs
    url: 'get-images.php',
    
    // reader configs
    root: 'images',
    idProperty: 'name',
    fields: ['name', 'url', {name:'size', type: 'float'}, {name:'lastmod', type:'date'}]
});
 * </code></pre></p>
 * <p>This store is configured to consume a returned object of the form:<pre><code>
stcCallback({
    images: [
        {name: 'Image one', url:'/GetImage.php?id=1', size:46.5, lastmod: new Date(2007, 10, 29)},
        {name: 'Image Two', url:'/GetImage.php?id=2', size:43.2, lastmod: new Date(2007, 10, 30)}
    ]
})
 * </code></pre>
 * <p>Where stcCallback is the callback name passed in the request to the remote domain. See {@link Ext.data.ScriptTagProxy ScriptTagProxy}
 * for details of how this works.</p>
 * An object literal of this form could also be used as the {@link #data} config option.</p>
 * <p><b>*Note:</b> Although not listed here, this class accepts all of the configuration options of
 * <b>{@link Ext.data.JsonReader JsonReader}</b> and <b>{@link Ext.data.ScriptTagProxy ScriptTagProxy}</b>.</p>
 * @constructor
 * @param {Object} config
 * @xtype jsonpstore
 */
Ext.data.JsonPStore = Ext.extend(Ext.data.Store, {
    /**
     * @cfg {Ext.data.DataReader} reader @hide
     */
    constructor: function(config){
        Ext.data.JsonPStore.superclass.constructor.call(this, Ext.apply(config, {
            reader: new Ext.data.JsonReader(config),
            proxy : new Ext.data.ScriptTagProxy(config)
        }));
    }
});

Ext.reg('jsonpstore', Ext.data.JsonPStore);

/*
Copyright(c) 2010 Sencha Inc.
licensing@sencha.com
http://www.sencha.com/touchlicense
*/


/**
 * @class Ext.data.XmlReader
 * @extends Ext.data.Reader
 * Xml Reader
 */
Ext.data.XmlReader = Ext.extend(Ext.data.Reader, {
    /**
     * @private
     * Creates a function to return some particular key of data from a response. The totalProperty and
     * successProperty are treated as special cases for type casting, everything else is just a simple selector.
     * @param {String} key
     * @return {Function}
     */
    createAccessor: function() {
        var q = Ext.DomQuery;
        
        return function(key) {
            var meta = this.meta,
                fn;
            
            if (key == meta.totalProperty) {
                fn = function(root, def) {
                    return q.selectNumber(key, root, def);
                };
            }
            
            else if (key == meta.successProperty) {
                fn = function(root, def) {
                    var value = q.selectValue(key, root, true);
                    
                    return (value !== false && value !== 'false');
                };
            }
            
            else {
                fn = function(root, def) {
                    return q.selectValue(key, root, def);
                };
            }
            
            return fn;
        };
    }(),
    
    /**
     * Normalizes the data object
     * @param {Object} data The raw data object
     * @return {Object} Returns the documentElement property of the data object if present, or the same object if not
     */
    getData: function(data) {
        return data.documentElement || data;
    },
    
    /**
     * @private
     * Given an XML object, returns the Element that represents the root as configured by the Reader's meta data
     * @param {Object} data The XML data object
     * @return {Element} The root node element
     */
    getRoot: function(data) {
        var meta = this.meta,
            el   = Ext.isEmpty(meta.record) ? meta.root : meta.record;
        
        return Ext.DomQuery.select(el, data);
    },
    
    
    //EVERYTHING BELOW THIS LINE WILL BE DEPRECATED IN EXT JS 5.0
    
    
    /**
     * @cfg {String} idPath DEPRECATED - this will be removed in Ext JS 5.0. Please use idProperty instead
     */
     
    /**
     * @cfg {String} id DEPRECATED - this will be removed in Ext JS 5.0. Please use idProperty instead
     */
     
    /**
     * @cfg {String} success DEPRECATED - this will be removed in Ext JS 5.0. Please use successProperty instead
     */
    
    /**
     * @constructor
     * @ignore
     * TODO: This can be removed in 5.0 as all it does is support some deprecated config
     */
    constructor: function(config) {
        config = config || {};
        
        // backwards compat, convert idPath or id / success
        // DEPRECATED - remove this in 5.0
        Ext.applyIf(config, {
            idProperty     : config.idPath || config.id,
            successProperty: config.success
        });

        Ext.data.XmlReader.superclass.constructor.call(this, config);
    },
    
    /**
     * Parses an XML document and returns a ResultSet containing the model instances
     * @param {Object} doc Parsed XML document
     * @return {Ext.data.ResultSet} The parsed result set
     */
    //inherit docs
    readRecords: function(doc) {
        /**
         * DEPRECATED - will be removed in Ext JS 5.0. This is just a copy of this.rawData - use that instead
         * @property xmlData
         * @type Object
         */
        this.xmlData = doc;
        
        return Ext.data.XmlReader.superclass.readRecords.call(this, doc);
    }
});

Ext.data.ReaderMgr.registerType('xml', Ext.data.XmlReader);
/**
 * @class Ext.data.XmlStore
 * @extends Ext.data.Store
 * <p>Small helper class to make creating {@link Ext.data.Store}s from XML data easier.
 * A XmlStore will be automatically configured with a {@link Ext.data.XmlReader}.</p>
 * <p>A store configuration would be something like:<pre><code>
var store = new Ext.data.XmlStore({
    // store configs
    autoDestroy: true,
    storeId: 'myStore',
    url: 'sheldon.xml', // automatically configures a HttpProxy
    // reader configs
    record: 'Item', // records will have an "Item" tag
    idPath: 'ASIN',
    totalRecords: '@TotalResults'
    fields: [
        // set up the fields mapping into the xml doc
        // The first needs mapping, the others are very basic
        {name: 'Author', mapping: 'ItemAttributes > Author'},
        'Title', 'Manufacturer', 'ProductGroup'
    ]
});
 * </code></pre></p>
 * <p>This store is configured to consume a returned object of the form:<pre><code>
&#60?xml version="1.0" encoding="UTF-8"?>
&#60ItemSearchResponse xmlns="http://webservices.amazon.com/AWSECommerceService/2009-05-15">
    &#60Items>
        &#60Request>
            &#60IsValid>True&#60/IsValid>
            &#60ItemSearchRequest>
                &#60Author>Sidney Sheldon&#60/Author>
                &#60SearchIndex>Books&#60/SearchIndex>
            &#60/ItemSearchRequest>
        &#60/Request>
        &#60TotalResults>203&#60/TotalResults>
        &#60TotalPages>21&#60/TotalPages>
        &#60Item>
            &#60ASIN>0446355453&#60/ASIN>
            &#60DetailPageURL>
                http://www.amazon.com/
            &#60/DetailPageURL>
            &#60ItemAttributes>
                &#60Author>Sidney Sheldon&#60/Author>
                &#60Manufacturer>Warner Books&#60/Manufacturer>
                &#60ProductGroup>Book&#60/ProductGroup>
                &#60Title>Master of the Game&#60/Title>
            &#60/ItemAttributes>
        &#60/Item>
    &#60/Items>
&#60/ItemSearchResponse>
 * </code></pre>
 * An object literal of this form could also be used as the {@link #data} config option.</p>
 * <p><b>Note:</b> Although not listed here, this class accepts all of the configuration options of 
 * <b>{@link Ext.data.XmlReader XmlReader}</b>.</p>
 * @constructor
 * @param {Object} config
 * @xtype xmlstore
 */
Ext.data.XmlStore = Ext.extend(Ext.data.Store, {
    /**
     * @cfg {Ext.data.DataReader} reader @hide
     */
    constructor: function(config){
        Ext.data.XmlStore.superclass.constructor.call(this, Ext.apply(config, {
            reader: new Ext.data.XmlReader(config)
        }));
    }
});
Ext.reg('xmlstore', Ext.data.XmlStore);

/*
Copyright(c) 2010 Sencha Inc.
licensing@sencha.com
http://www.sencha.com/touchlicense
*/

/**
 * @class Ext.Component
 * @extends Ext.util.Observable
 * @xtype component
 * <p>Base class for all Ext components.  All subclasses of Component may participate in the automated
 * Ext component lifecycle of creation, rendering and destruction which is provided by the {@link Ext.Container Container} class.
 * Components may be added to a Container through the {@link Ext.Container#items items} config option at the time the Container is created,
 * or they may be added dynamically via the {@link Ext.Container#add add} method.</p>
 * <p>The Component base class has built-in support for basic hide/show and enable/disable behavior.</p>
 * <p>All Components are registered with the {@link Ext.ComponentMgr} on construction so that they can be referenced at any time via
 * {@link Ext#getCmp}, passing the {@link #id}.</p>
 * <p>All user-developed visual widgets that are required to participate in automated lifecycle and size management should subclass Component (or
 * {@link Ext.BoxComponent} if managed box model handling is required, ie height and width management).</p>
 * <p>See the <a href="http://extjs.com/learn/Tutorial:Creating_new_UI_controls">Creating new UI controls</a> tutorial for details on how
 * and to either extend or augment ExtJs base classes to create custom Components.</p>
 * <p>Every component has a specific xtype, which is its Ext-specific type name, along with methods for checking the
 * xtype like {@link #getXType} and {@link #isXType}. This is the list of all valid xtypes:</p>
 * <pre>
xtype            Class
-------------    ------------------
button           {@link Ext.Button}
component        {@link Ext.Component}
container        {@link Ext.Container}
dataview         {@link Ext.DataView}
panel            {@link Ext.Panel}
slider           {@link Ext.form.Slider}
toolbar          {@link Ext.Toolbar}
spacer           {@link Ext.Spacer}
tabpanel         {@link Ext.TabPanel}

Form components
---------------------------------------
form             {@link Ext.form.FormPanel}
checkbox         {@link Ext.form.Checkbox}
select           {@link Ext.form.Select}
field            {@link Ext.form.Field}
fieldset         {@link Ext.form.FieldSet}
hidden           {@link Ext.form.Hidden}
numberfield      {@link Ext.form.NumberField}
radio            {@link Ext.form.Radio}
textarea         {@link Ext.form.TextArea}
textfield        {@link Ext.form.TextField}

Store xtypes
---------------------------------------
store            {@link Ext.data.Store}
arraystore       {@link Ext.data.ArrayStore}
jsonstore        {@link Ext.data.JsonStore}
xmlstore         {@link Ext.data.XmlStore}
</pre>
 * @constructor
 * @param {Ext.Element/String/Object} config The configuration options may be specified as either:
 * <div class="mdetail-params"><ul>
 * <li><b>an element</b> :
 * <p class="sub-desc">it is set as the internal element and its id used as the component id</p></li>
 * <li><b>a string</b> :
 * <p class="sub-desc">it is assumed to be the id of an existing element and is used as the component id</p></li>
 * <li><b>anything else</b> :
 * <p class="sub-desc">it is assumed to be a standard config object and is applied to the component</p></li>
 * </ul></div>
 */
Ext.Component = Ext.extend(Ext.util.Observable, {
    /**
     * @cfg {Boolean} disabled
     * Defaults to false.
     */
    disabled: false,

    /**
     * @cfg {Boolean} hidden
     * Defaults to false.
     */
    hidden: false,

    /**
     * @cfg {Mixed} renderTpl
     * <p>An {@link Ext.XTemplate XTemplate} used to create the {@link #getEl Element} which will
     * encapsulate this Component.</p>
     * <p>You do not normally need to specify this. For the base classes {@link Ext.Component}, {@link Ext.Component},
     * and {@link Ext.Container}, this defaults to <b><tt>'div'</tt></b>. The more complex Ext classes use a more complex
     * DOM structure.</p>
     * <p>This is intended to allow the developer to create application-specific utility Components encapsulated by
     * different DOM elements.
     */
     renderTpl: new Ext.XTemplate(
         '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl>"<tpl if="style"> style="{style}"</tpl>></div>',
         { compiled: true }
     ),

    /**
     * @cfg {String} disabledClass
     * CSS class to add when the Component is disabled. Defaults to 'x-item-disabled'.
     */
    disabledClass: 'x-item-disabled',

    /**
     * @cfg {String} styleHtmlContent
     * True to automatically style the html inside the content target of this component (body for panels).
     * Defaults to false.
     */
    styleHtmlContent: false,

    // @private
    allowDomMove: true,
    autoShow: false,

    /**
     * Read-only property indicating whether or not the component has been rendered.
     * @property rendered
     * @type {Boolean}
     */
    rendered: false,

    /**
     * @cfg {Mixed} tpl
     * An <bold>{@link Ext.Template}</bold>, <bold>{@link Ext.XTemplate}</bold>
     * or an array of strings to form an Ext.XTemplate.
     * Used in conjunction with the <code>{@link #data}</code> and
     * <code>{@link #tplWriteMode}</code> configurations.
     */

    /**
     * @cfg {String} tplWriteMode The Ext.(X)Template method to use when
     * updating the content area of the Component. Defaults to <tt>'overwrite'</tt>
     * (see <code>{@link Ext.XTemplate#overwrite}</code>).
     */
    tplWriteMode: 'overwrite',
    bubbleEvents: [],
    isComponent: true,
    autoRender: true,

    // @private
    actionMode: 'el',
    /**
     * @cfg {String} baseCls
     * The base CSS class to apply to this panel's element (defaults to <code>'x-panel'</code>).
     * <p>Another option available by default is to specify <code>'x-plain'</code> which strips all styling
     * except for required attributes for Ext layouts to function (e.g. overflow:hidden).
     * See <code>{@link #unstyled}</code> also.</p>
     */
    baseCls: 'x-component',
    monPropRe: /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/,
    domEventsRe: /^(?:tap|doubletap|pinch|unpich|swipe|swipeleft|swiperight|scroll|scrollstart|scrollend|touchstart|touchmove|touchend|taphold|tapstart|tapcancel)$/i,

    /**
     * @cfg {String} floatingCls
     * CSS class added when floating is enabled to the component.
     */
    floatingCls: 'x-floating',

    /**
     * @cfg {Boolean} modal
     * True to make the Component modal and mask everything behind it when displayed, false to display it without
     * restricting access to other UI elements (defaults to false).
     */
    modal: false,

    /**
     * @cfg {Boolean} floating
     * Create the Component as a floating and use absolute positioning.
     */
    /**
     * Read-only property indicating whether or not the component is floating
     * @property floating
     * @type {Boolean}
     */
    floating: false,

    /**
     * @cfg {Boolean} draggable
     * Allows the component to be dragged via the touch event.
     */
    /**
     * Read-only property indicating whether or not the component can be dragged
     * @property draggable
     * @type {Boolean}
     */
    draggable: false,

    /**
     * @cfg {Boolean} centered
     * Center the Component. Defaults to false.
     */
    centered: false,

    /**
    * @cfg {Boolean} hideOnMaskTap
    * True to automatically bind a tap listener to the mask that hides the window.
    * Defaults to true. Note: if you set this property to false you have to programmaticaly
    * hide the overlay.
    */
    hideOnMaskTap: true,

    /**
    * @cfg {Object/String/Boolean} showAnimation
    * The type of animation you want to use when this component is shown. If you set this
    * this hide animation will automatically be the opposite.
    */
    showAnimation: null,

    /**
     * @cfg {Object/Array} plugins
     * An object or array of objects that will provide custom functionality for this component.  The only
     * requirement for a valid plugin is that it contain an init method that accepts a reference of type Ext.Component.
     * When a component is created, if any plugins are available, the component will call the init method on each
     * plugin, passing a reference to itself.  Each plugin can then call methods or respond to events on the
     * component as needed to provide its functionality.
     */
    /**
     * @cfg {Mixed} scroll
     * Configure the component to be scrollable.
     * Acceptable values are: 'horizontal', 'vertical', 'both', and false
     * Setting this configuration immediately sets the monitorOrientation config to true (for Ext.Panel's)
     */

    /**
     * @cfg {String/Object} componentLayout
     * <br><p>The sizing and positioning of the component Elements is the responsibility of
     * the Component's layout manager which creates and manages the type of layout specific to the component.
     * <p>If the {@link #layout} configuration is not explicitly specified for
     * a general purpose compopnent the
     * {@link Ext.layout.AutoComponentLayout default layout manager} will be used.
     */

    /**
     * @cfg {String} ui
     * A set of predefined ui styles for individual components.
     *
     * Most components support 'light' and 'dark'.
     *
     * Extra string added to the baseCls with an extra '-'.
     * <pre><code>
      new Ext.Panel({
          title: 'Some Title',
          baseCls: 'x-component'
          ui: 'green'
      });
       </code></pre>
     * <p>The ui configuration in this example would add 'x-component-green' as an additional class.</p>
     */

    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to '').  This can be
     * useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    /**
      * @cfg {String} style
      * A custom style specification to be applied to this component's Element.  Should be a valid argument to
      * {@link Ext.Element#applyStyles}.
      * <pre><code>
     new Ext.Panel({
         title: 'Some Title',
         renderTo: Ext.getBody(),
         width: 400, height: 300,
         layout: 'form',
         items: [{
             xtype: 'textarea',
             style: {
                 width: '95%',
                 marginBottom: '10px'
             }
         },
             new Ext.Button({
                 text: 'Send',
                 minWidth: '100',
                 style: {
                     marginBottom: '10px'
                 }
             })
         ]
     });
        </code></pre>
      */
    /**
     * @cfg {String} overCls
     * CSS class added when hovering over the outer element of the component.
     */
    /**
     * @cfg {String/Object} html
     * An HTML fragment, or a {@link Ext.DomHelper DomHelper} specification to use as the layout element
     * content (defaults to ''). The HTML content is added after the component is rendered,
     * so the document will not contain this HTML at the time the {@link #render} event is fired.
     * This content is inserted into the body <i>before</i> any configured {@link #contentEl} is appended.
     */
    /**
     * @cfg {Mixed} data
     * The initial set of data to apply to the <code>{@link #tpl}</code> to
     * update the content area of the Component.
     */
    /**
     * @cfg {String} contentEl
     * <p>Optional. Specify an existing HTML element, or the <code>id</code> of an existing HTML element to use as the content
     * for this component.</p>
     * <ul>
     * <li><b>Description</b> :
     * <div class="sub-desc">This config option is used to take an existing HTML element and place it in the layout element
     * of a new component (it simply moves the specified DOM element <i>after the Component is rendered</i> to use as the content.</div></li>
     * <li><b>Notes</b> :
     * <div class="sub-desc">The specified HTML element is appended to the layout element of the component <i>after any configured
     * {@link #html HTML} has been inserted</i>, and so the document will not contain this element at the time the {@link #render} event is fired.</div>
     * <div class="sub-desc">The specified HTML element used will not participate in any <code><b>{@link Ext.Container#layout layout}</b></code>
     * scheme that the Component may use. It is just HTML. Layouts operate on child <code><b>{@link Ext.Container#items items}</b></code>.</div>
     * <div class="sub-desc">Add either the <code>x-hidden</code> or the <code>x-hide-display</code> CSS class to
     * prevent a brief flicker of the content before it is rendered to the panel.</div></li>
     * </ul>
     */
    /**
     * @cfg {Mixed} renderTo
     * <p>Specify the id of the element, a DOM element or an existing Element that this component
     * will be rendered into.</p><div><ul>
     * <li><b>Notes</b> : <ul>
     * <div class="sub-desc">Do <u>not</u> use this option if the Component is to be a child item of
     * a {@link Ext.Container Container}. It is the responsibility of the
     * {@link Ext.Container Container}'s {@link Ext.Container#layout layout manager}
     * to render and manage its child items.</div>
     * <div class="sub-desc">When using this config, a call to render() is not required.</div>
     * </ul></li>
     * </ul></div>
     * <p>See <tt>{@link #render}</tt> also.</p>
     */
    /**
     * @cfg {Number} minHeight
     * <p>The minimum value in pixels which this Component will set its height to.</p>
     * <p><b>Warning:</b> This will override any size management applied by layout managers.</p>
     */
    /**
     * @cfg {Number} minWidth
     * <p>The minimum value in pixels which this Component will set its width to.</p>
     * <p><b>Warning:</b> This will override any size management applied by layout managers.</p>
     */
    /**
     * @cfg {Number} maxHeight
     * <p>The maximum value in pixels which this Component will set its height to.</p>
     * <p><b>Warning:</b> This will override any size management applied by layout managers.</p>
     */
    /**
     * @cfg {Number} maxWidth
     * <p>The maximum value in pixels which this Component will set its width to.</p>
     * <p><b>Warning:</b> This will override any size management applied by layout managers.</p>
     */

    constructor : function(config) {
        config = config || {};
        this.initialConfig = config;
        Ext.apply(this, config);

        this.addEvents(
            /**
             * @event beforeactivate
             * Fires before a Component has been visually activated.
             * Returning false from an event listener can prevent the activate
             * from occurring.
             * @param {Ext.Component} this
             */
             'beforeactivate',
            /**
             * @event activate
             * Fires after a Component has been visually activated.
             * @param {Ext.Component} this
             */
             'activate',
            /**
             * @event beforedeactivate
             * Fires before a Component has been visually deactivated.
             * Returning false from an event listener can prevent the deactivate
             * from occurring.
             * @param {Ext.Component} this
             */
             'beforedeactivate',
            /**
             * @event deactivate
             * Fires after a Component has been visually deactivated.
             * @param {Ext.Component} this
             */
             'deactivate',
            /**
             * @event added
             * Fires after a Component had been added to a Container.
             * @param {Ext.Component} this
             * @param {Ext.Container} container Parent Container
             * @param {Number} pos position of Component
             */
             'added',
            /**
             * @event disable
             * Fires after the component is disabled.
             * @param {Ext.Component} this
             */
             'disable',
            /**
             * @event enable
             * Fires after the component is enabled.
             * @param {Ext.Component} this
             */
             'enable',
            /**
             * @event beforeshow
             * Fires before the component is shown when calling the {@link #show} method.
             * Return false from an event handler to stop the show.
             * @param {Ext.Component} this
             */
             'beforeshow',
            /**
             * @event show
             * Fires after the component is shown when calling the {@link #show} method.
             * @param {Ext.Component} this
             */
             'show',
            /**
             * @event beforehide
             * Fires before the component is hidden when calling the {@link #hide} method.
             * Return false from an event handler to stop the hide.
             * @param {Ext.Component} this
             */
             'beforehide',
            /**
             * @event hide
             * Fires after the component is hidden.
             * Fires after the component is hidden when calling the {@link #hide} method.
             * @param {Ext.Component} this
             */
             'hide',
            /**
             * @event removed
             * Fires when a component is removed from an Ext.Container
             * @param {Ext.Component} this
             * @param {Ext.Container} ownerCt Container which holds the component
             */
             'removed',
            /**
             * @event beforerender
             * Fires before the component is {@link #rendered}. Return false from an
             * event handler to stop the {@link #render}.
             * @param {Ext.Component} this
             */
             'beforerender',
            /**
             * @event render
             * Fires after the component markup is {@link #rendered}.
             * @param {Ext.Component} this
             */
             'render',
            /**
             * @event afterrender
             * <p>Fires after the component rendering is finished.</p>
             * <p>The afterrender event is fired after this Component has been {@link #rendered}, been postprocesed
             * by any afterRender method defined for the Component, and, if {@link #stateful}, after state
             * has been restored.</p>
             * @param {Ext.Component} this
             */
             'afterrender',
            /**
             * @event beforedestroy
             * Fires before the component is {@link #destroy}ed. Return false from an event handler to stop the {@link #destroy}.
             * @param {Ext.Component} this
             */
             'beforedestroy',
            /**
             * @event destroy
             * Fires after the component is {@link #destroy}ed.
             * @param {Ext.Component} this
             */
             'destroy',
            /**
             * @event resize
             * Fires after the component is resized.
             * @param {Ext.Component} this
             * @param {Number} adjWidth The box-adjusted width that was set
             * @param {Number} adjHeight The box-adjusted height that was set
             * @param {Number} rawWidth The width that was originally specified
             * @param {Number} rawHeight The height that was originally specified
             */
             'resize',
            /**
             * @event move
             * Fires after the component is moved.
             * @param {Ext.Component} this
             * @param {Number} x The new x position
             * @param {Number} y The new y position
             */
             'move',
             /**
              * @event beforeorientationchange
              * Fires before the orientation changes, if the monitorOrientation
              * configuration is set to true. Return false to stop the orientation change.
              * @param this {Ext.Panel}
              * @param orientation {String} 'landscape' or 'portrait'
              * @param width {Number}
              * @param height {Number}
              */
             'beforeorientationchange',
             /**
              * @event orientationchange
              * Fires when the orientation changes, if the monitorOrientation
              * configuration is set to true.
              * @param this {Ext.Panel}
              * @param orientation {String} 'landscape' or 'portrait'
              * @param width {Number}
              * @param height {Number}
              */
             'orientationchange'
        );

        this.getId();

        Ext.ComponentMgr.register(this);
        Ext.Component.superclass.constructor.call(this);

        this.mons = [];
        this.renderData = this.renderData || {};
        this.renderSelectors = this.renderSelectors || {};

        this.initComponent();

        if (this.plugins) {
            if (Ext.isArray(this.plugins)) {
                for (var i = 0, len = this.plugins.length; i < len; i++) {
                    this.plugins[i] = this.initPlugin(this.plugins[i]);
                }
            }
            else {
                this.plugins = this.initPlugin(this.plugins);
            }
        }

        if (this.renderTo) {
            this.render(this.renderTo);
            delete this.renderTo;
        }

        if (this.fullscreen || this.floating) {
            this.monitorOrientation = true;
        }

        if (this.fullscreen) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.cls = (this.cls || '') + ' x-fullscreen';
            this.render(document.body);
        }
    },

    // @private
    initComponent : function() {
        this.enableBubble(this.bubbleEvents);
    },

    // @private
    initPlugin : function(plugin) {
        if (plugin.ptype && typeof plugin.init != 'function') {
            plugin = Ext.PluginMgr.create(plugin);
        }
        else if (typeof plugin == 'string') {
            plugin = Ext.PluginMgr.create({
                ptype: plugin
            });
        }

        plugin.init(this);

        return plugin;
    },

    // @private
    initLayout : function(layout, defaultType) {
        var layoutConfig = {};

        if (!layout) {
            layout = defaultType;
        }

        if (Ext.isObject(layout) && !layout.layout) {
            layoutConfig = layout;
            layout = layoutConfig.type;
        }

        if (typeof layout == 'string') {
            layout = new Ext.layout.TYPES[layout.toLowerCase()](layoutConfig);
        }

        return layout;
    },

    // @private
    render : function(container, position) {
        var addCls = [];
        if (!this.rendered && this.fireEvent('beforerender', this) !== false) {
            if (!container && this.el) {
                this.el = Ext.get(this.el);
                container = this.el.dom.parentNode;
                this.allowDomMove = false;
            }

            this.container = Ext.get(container);

            if (this.ctCls) {
                this.container.addClass(this.ctCls);
            }

            this.rendered = true;

            if (position !== undefined) {
                if (Ext.isNumber(position)) {
                    position = this.container.dom.childNodes[position];
                }
                else {
                    position = Ext.getDom(position);
                }
            }

            this.onRender(this.container, position || null);

            if (this.autoShow) {
                this.el.show();
            }

            delete this.style;
            delete this.cls;

            if (this.floating) {
                this.setFloating(true);
            }

            if (this.draggable) {
                this.setDraggable(true);
            }

            this.fireEvent('render', this);

            if (this.scroll) {
                this.setScrollable(this.scroll);
            }

            // Populate content of the component with html, contentEl or
            // a tpl.
            var target = this.getContentTarget();
            if (this.html) {
                target.update(Ext.DomHelper.markup(this.html));
                delete this.html;
            }
            if (this.contentEl) {
                var ce = Ext.getDom(this.contentEl);
                Ext.fly(ce).show();
                target.appendChild(ce);
            }

            if (this.tpl) {
                if (!this.tpl.compile) {
                    this.tpl = new Ext.XTemplate(this.tpl);
                }
                if (this.data) {
                    this.tpl[this.tplWriteMode](target, this.data);
                    delete this.data;
                }
            }

            this.afterRender(this.container);

            if (this.styleHtmlContent) {
                target.addClass('x-htmlcontent');
            }

            if (this.hidden) {
                // call this so we don't fire initial hide events.
                this.onHide();
            }

            if (this.disabled) {
                // pass silent so the event doesn't fire the first time.
                this.disable(true);
            }

            this.fireEvent('afterrender', this);
        }

        return this;
    },

    // @private
    onRender : function(ct, position) {
        var el = this.el,
            renderTpl = this.renderTpl;
        if (!el) {
            // Use renderTpl and renderData to build and insert this.el
            if (renderTpl) {
                Ext.applyIf(this.renderData, {
                    id: this.id,
                    baseCls: this.baseCls,
                    cls: this.cls,
                    cmpCls: this.cmpCls,
                    uiBase: this.cmpCls ? this.cmpCls : this.baseCls,
                    ui: this.ui,
                    style: this.style
                });
                if (typeof position == 'number') {
                    position = ct.dom.childNodes[position] || null;
                }
                if (position) {
                    el = renderTpl.insertBefore(position, this.renderData, true);
                }
                else {
                    el = renderTpl.append(ct, this.renderData, true);
                }
            }
        }
        else {
            el = Ext.get(el);
            if (this.allowDomMove !== false) {
                ct.dom.insertBefore(el.dom, position);
            }
        }
        Ext.apply(this, this.applyRefs(el.dom));
        this.el = el;
    },

    // Applies refSelectors if present.
    // @return {Object} object containing template references.
    applyRefs: function(el) {
        var ref,
            refObj = this.renderSelectors || {},
            ret = {};

        for (ref in refObj) {
            ret[ref] = Ext.get(Ext.DomQuery.selectNode(refObj[ref], el));
        }
        return ret;
    },

    // @private
    afterRender : function() {
        this.componentLayout = this.initLayout(this.componentLayout, 'component');
        this.setComponentLayout(this.componentLayout);

        // If there is a width or height set on this component we will call setSize
        // which will trigger the component layout
        if (!this.ownerCt) {
            this.setSize(this.width, this.height);
        }

        if (this.x || this.y) {
            this.setPosition(this.x, this.y);
        }

        if (this.minWidth) {
            this.el.setStyle('min-width', this.minWidth + 'px');
        }
        if (this.maxWidth) {
            this.el.setStyle('max-width', this.maxWidth + 'px');
        }

        if (this.minHeight) {
            this.el.setStyle('min-height', this.minHeight + 'px');
        }
        if (this.maxHeight) {
            this.el.setStyle('max-height', this.maxHeight + 'px');
        }

        if (this.relayDomEvents) {
            this.relayEvents(this.el, this.relayDomEvents);
        }

        if (this.monitorOrientation) {
            if (this.fullscreen) {
                this.setOrientation(Ext.Element.getOrientation());
            }
            Ext.EventManager.onOrientationChange(this.setOrientation, this);
        }

        this.initEvents();
    },

    /**
     * Sets the orientation for the Panel.
     * @param orientation {String} 'landscape' or 'portrait'
     * @param {Number/String} width New width of the Panel.
     * @param {Number/String} height New height of the Panel.
     */
    setOrientation : function(orientation, w, h) {
        if (orientation != this.orientation) {
            if (this.fireEvent('beforeorientationchange', this, orientation, w, h) !== false) {
                if (this.fullscreen) {
                    this.setSize(w, h);
                }

                if (this.floating && this.centered) {
                    this.setCentered(true, true);
                }

                if (this.orientation) {
                    this.el.removeClass('x-' + this.orientation);
                }

                this.el.addClass('x-' + orientation);

                this.orientation = orientation;
                this.onOrientationChange(orientation, w, h);
                this.fireEvent('orientationchange', this, orientation, w, h);
            }
        }
    },

    // @private
    onOrientationChange : function(orientation, w, h) {
        Ext.repaint.defer(50);
    },

    // inherited docs.
    addListener : function(ename) {
        if (!Ext.isObject(ename) && this.domEventsRe.test(ename)) {
            if (this.rendered) {
                this.relayEvents(this.el, ename);
            }
            else {
                this.relayDomEvents = this.relayDomEvents || [];
                this.relayDomEvents.push(ename);
            }
            return null;
        }
        return Ext.Component.superclass.addListener.apply(this, arguments);
    },

    /**
     * Sets a Component as scrollable.
     * @param config {Mixed}
     * Acceptable values are a Ext.Scroller configuration, 'horizontal', 'vertical', 'both', and false
     */
    setScrollable : function(config) {
        if (config !== false) {
            var direction = Ext.isObject(config) ? config.direction: config,
                both = direction === 'both',
                horizontal = both || direction === 'horizontal',
                vertical = both || direction === true || direction === 'vertical';

            config = Ext.apply({},
            Ext.isObject(config) ? config: {}, {
                jumpTo: this.jumpTo,
                momentum: true,
                horizontal: horizontal,
                vertical: vertical
            });

            this.scrollEl = this.getContentTarget().createChild();

            this.originalGetContentTarget = this.getContentTarget;
            this.getContentTarget = function() {
                return this.scrollEl;
            };

            this.scroller = new Ext.util.Scroller(this.scrollEl, config);
        }
        else {
            this.getContentTarget = this.originalGetContentTarget;
            this.scroller.destroy();
        }
    },

    /**
     * Sets a Component as floating.
     * @param {Boolean} floating
     * @param {Boolean} autoShow
     */
    setFloating : function(floating, autoShow) {
        this.floating = !!floating;
        if (this.rendered) {
            if (floating !== false) {
                this.el.addClass(this.floatingCls);
                if (autoShow) {
                    this.show();
                }
            }
            else {
                this.el.removeClass(this.floatingCls);
                Ext.getDoc().un('touchstart', this.onFloatingTouchStart, this);
            }
        }
    },

    /**
     * Sets a Component as draggable.
     * @param {Boolean} draggable
     * @param {Boolean} autoShow
     */
    setDraggable : function(draggable, autoShow) {
        this.draggable = !!draggable;
        if (this.rendered) {
            if (draggable === false) {
                if (this.dragObj) {
                    this.dragObj.disable();
                }
            } else {
                if (autoShow) {
                    this.show();
                }
                if (this.dragObj) {
                    this.dragObj.enable();
                } else {
                    this.dragObj = new Ext.util.Draggable(this.el, Ext.apply({}, this.dragConfig || {}));
                    this.relayEvents(this.dragObj, ['dragstart', 'drag', 'dragend']);
                }
            }
        }
    },

    // @private
    initEvents : function() {
        if (this.monitorResize === true) {
            Ext.EventManager.onWindowResize(this.setSize, this);
        }
    },

    // @private
    setComponentLayout : function(layout) {
        if (this.componentLayout && this.componentLayout != layout) {
            this.componentLayout.setOwner(null);
        }
        this.componentLayout = layout;
        layout.setOwner(this);
    },

    // @private
    doComponentLayout : function(w, h) {
        if (this.rendered && this.componentLayout) {
            this.componentLayout.layout(w, h);
        }
    },

    // Template method that can be overriden to perform logic after the panel has layed out itself
    // e.g. Resized the body and positioned all docked items.
    afterComponentLayout : function() {
        if (this.scrollEl) {
            if (this.scroller.horizontal) {
                this.scrollEl.setStyle('min-width', (this.body || this.el).getWidth(true) + 'px');
                this.scrollEl.setHeight((this.body || this.el).getHeight(true) || null);
            }
            else {
                this.scrollEl.setStyle('min-height', (this.body || this.el).getHeight(true) + 'px');
                this.scrollEl.setWidth((this.body || this.el).getWidth(true) || null);
            }
        }
    },

    /**
     * Sets the left and top of the component.  To set the page XY position instead, use {@link #setPagePosition}.
     * This method fires the {@link #move} event.
     * @param {Number} left The new left
     * @param {Number} top The new top
     * @return {Ext.Component} this
     */
    setPosition : function(x, y) {
        if (Ext.isObject(x)) {
            y = x.y;
            x = x.x;
        }

        if (!this.rendered) {
            return this;
        }

        var adjusted = this.adjustPosition(x, y),
        el = this.getPositionEl(),
        undefined;

        x = adjusted.x;
        y = adjusted.y;

        if (x !== undefined || y !== undefined) {
            if (y !== undefined && x !== undefined) {
                el.setBox(x, y);
            }
            else if (x !== undefined) {
                el.setLeft(x);
            }
            else if (y !== undefined) {
                el.setTop(y);
            }
            this.onPosition(x, y);
            this.fireEvent('move', this, x, y);
        }
        return this;
    },

    /* @private
     * Called after the component is moved, this method is empty by default but can be implemented by any
     * subclass that needs to perform custom logic after a move occurs.
     * @param {Number} x The new x position
     * @param {Number} y The new y position
     */
    onPosition: Ext.emptyFn,

    /**
     * Sets the width and height of this Component. This method fires the {@link #resize} event. This method can accept
     * either width and height as separate arguments, or you can pass a size object like <code>{width:10, height:20}</code>.
     * @param {Mixed} width The new width to set. This may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new width in the {@link #getEl Element}'s {@link Ext.Element#defaultUnit}s (by default, pixels).</li>
     * <li>A String used to set the CSS width style.</li>
     * <li>A size object in the format <code>{width: widthValue, height: heightValue}</code>.</li>
     * <li><code>undefined</code> to leave the width unchanged.</li>
     * </ul></div>
     * @param {Mixed} height The new height to set (not required if a size object is passed as the first arg).
     * This may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new height in the {@link #getEl Element}'s {@link Ext.Element#defaultUnit}s (by default, pixels).</li>
     * <li>A String used to set the CSS height style. Animation may <b>not</b> be used.</li>
     * <li><code>undefined</code> to leave the height unchanged.</li>
     * </ul></div>
     * @return {Ext.Component} this
     */
    setSize : function(w, h) {
        // support for standard size objects
        if (Ext.isObject(w)) {
            h = w.height;
            w = w.width;
        }

        w = w !== undefined ? w: this.width;
        h = h !== undefined ? h: this.height;

        if (w !== undefined) {
            w = w.constrain(this.boxMinWidth, this.boxMaxWidth);
        }
        if (h !== undefined) {
            h = h.constrain(this.boxMinHeight, this.boxMaxHeight);
        }

        if (!this.rendered) {
            this.width = w;
            this.height = h;
            return this;
        }

        // Prevent recalcs when not needed
        if (this.cacheSizes !== false && this.lastSize && this.lastSize.width == w && this.lastSize.height == h) {
            return this;
        }

        // Cache the new size
        this.lastSize = {
            width: w,
            height: h
        };

        var adjustedSize = this.adjustSize(w, h);

        w = adjustedSize.width;
        h = adjustedSize.height;

        if (w !== undefined || h !== undefined) {
            this.doComponentLayout(w, h);

            // Stub method only.
            this.onResize(w, h);
            this.fireEvent('resize', this, w, h);
        }

        return this;
    },

    /**
     * Sets the width of the component.  This method fires the {@link #resize} event.
     * @param {Number} width The new width to setThis may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new width in the {@link #getEl Element}'s {@link Ext.Element#defaultUnit}s (by default, pixels).</li>
     * <li>A String used to set the CSS width style.</li>
     * </ul></div>
     * @return {Ext.Component} this
     */
    setWidth : function(width) {
        return this.setSize(width);
    },

    /**
     * Sets the height of the component.  This method fires the {@link #resize} event.
     * @param {Number} height The new height to set. This may be one of:<div class="mdetail-params"><ul>
     * <li>A Number specifying the new height in the {@link #getEl Element}'s {@link Ext.Element#defaultUnit}s (by default, pixels).</li>
     * <li>A String used to set the CSS height style.</li>
     * <li><i>undefined</i> to leave the height unchanged.</li>
     * </ul></div>
     * @return {Ext.Component} this
     */
    setHeight : function(height) {
        return this.setSize(undefined, height);
    },

    /**
     * Gets the current size of the component's underlying element.
     * @return {Object} An object containing the element's size {width: (element width), height: (element height)}
     */
    getSize : function() {
        return this.getResizeEl().getSize();
    },

    /**
     * Gets the current width of the component's underlying element.
     * @return {Number}
     */
    getWidth : function() {
        return this.getResizeEl().getWidth();
    },

    /**
     * Gets the current height of the component's underlying element.
     * @return {Number}
     */
    getHeight : function() {
        return this.getResizeEl().getHeight();
    },

    // Include margins
    /**
     * Returns the size of the Element including the margins.
     * @returns {Object} size
     * This object has a width and height property.
     */
    getOuterSize : function() {
        var el = this.getResizeEl();
        return {
            width: el.getOuterWidth(),
            height: el.getOuterHeight()
        };
    },

    // @private
    getTargetBox : function() {
        return this.el.getBox(true, true);
    },

    // @private
    getResizeEl : function() {
        return this.el;
    },

    // @private
    onResize : Ext.emptyFn,

    // @private
    adjustSize : function(w, h) {
        if (this.autoWidth) {
            w = 'auto';
        }

        if (this.autoHeight) {
            h = 'auto';
        }

        return {
            width: w,
            height: h
        };
    },

    // @private
    adjustPosition : function(x, y) {
        return {
            x: x,
            y: y
        };
    },

    /**
     * Retrieves the id of this component.
     * Will autogenerate an id if one has not already been set.
     */
    getId : function() {
        return this.id || (this.id = 'ext-comp-' + (++Ext.Component.AUTO_ID));
    },

    /**
     * Retrieves the itemId of this component if defined.
     * Falls back to an id, retrieved by getId().
     */
    getItemId : function() {
        return this.itemId || this.getId();
    },

    /**
     * Retrieves the top level element representing this component.
     */
    getEl : function() {
        return this.el;
    },

    // @private
    getActionEl : function() {
        return this[this.actionMode];
    },

    /**
     * Provides the link for Observable's fireEvent method to bubble up the ownership hierarchy.
     * @return {Ext.Container} the Container which owns this Component.
     */
    getBubbleTarget : function() {
        return this.ownerCt;
    },

    // @private
    getContentTarget : function() {
        return this.el;
    },

    /**
     * Adds a CSS class to the top level element representing this component.
     * @returns {Ext.Component} Returns the Component to allow method chaining.
     */
    addClass : function(cls) {
        if (this.el) {
            this.el.addClass(cls);
        }
        else {
            this.cls = this.cls ? this.cls + ' ' + cls: cls;
        }
        return this;
    },

    /**
     * Removes a CSS class from the top level element representing this component.
     * @returns {Ext.Component} Returns the Component to allow method chaining.
     */
    removeClass : function(cls) {
        if (this.el) {
            this.el.removeClass(cls);
        }
        else if (this.cls) {
            this.cls = this.cls.split(' ').remove(cls).join(' ');
        }
        return this;
    },

    /**
     * Enable the component
     * @param {Boolean} silent
     * Passing false will supress the 'enable' event from being fired.
     */
    enable : function(silent) {
        if (this.rendered) {
            this.onEnable();
        }

        this.disabled = false;

        if (silent !== true) {
            this.fireEvent('enable', this);
        }

        return this;
    },

    /**
     * Disable the component.
     * @param {Boolean} silent
     * Passing true, will supress the 'disable' event from being fired.
     */
    disable : function(silent) {
        if (this.rendered) {
            this.onDisable();
        }

        this.disabled = true;

        if (silent !== true) {
            this.fireEvent('disable', this);
        }

        return this;
    },

    // @private
    onEnable : function() {
        this.getActionEl().removeClass(this.disabledClass);
        this.el.dom.disabled = false;
    },

    // @private
    onDisable : function() {
        this.getActionEl().addClass(this.disabledClass);
        this.el.dom.disabled = true;
    },

    /**
     * Enable or disable the component.
     * @param {Boolean} disabled
     */
    setDisabled : function(disabled) {
        return this[disabled ? 'disable': 'enable']();
    },

    /**
     * Show the component.
     * @param {Object/String/Boolean} animation (optional) Defaults to false.
     */
    show : function(animation) {
        if (this.fireEvent('beforeshow', this) !== false) {
            if (this.anchorEl) {
                this.anchorEl.hide();
            }
            this.hidden = false;
            if (!this.rendered && this.autoRender) {
                this.render(Ext.isBoolean(this.autoRender) ? Ext.getBody() : this.autoRender);
            }
            if (this.rendered) {
                this.onShow(animation);
            }
            this.fireEvent('show', this);
        }
        return this;
    },

    /**
     * Show this component by another component or element.
     * @param {Mixed} elOrCmp Element or Component
     * @param {Object/String/Boolean} animation
     * @param {Array} xyOffsets An array of x and y offsets.
     * @returns {Ext.Component} this
     */
    showBy : function(el, animation, xyOffsets) {
        xyOffsets = xyOffsets || [0, 20];
        if (!this.floating) {
            return this;
        }

        if (el.isComponent) {
            el = el.el;
        }
        else {
            el = Ext.get(el);
        }

        var pageBox = el.getPageBox();

        this.x = pageBox.left + xyOffsets[0];
        this.y = pageBox.bottom + xyOffsets[1];

        this.show(animation);

        if (!this.anchorEl) {
            this.anchorEl = this.el.createChild({
                cls: 'x-anchor'
            });
        }
        this.anchorEl.show();

        var viewSize = Ext.Element.getViewSize(),
            box = this.el.getPageBox(),
            x, y;

        if (box.right > viewSize.width) {
            x = pageBox.right - xyOffsets[0] - box.width;
            this.anchorEl.removeClass('x-anchor-left').addClass('x-anchor-right');
        }
        else {
            this.anchorEl.removeClass('x-anchor-right').addClass('x-anchor-left');
        }

        if (box.bottom > viewSize.height) {
            y = pageBox.top - xyOffsets[1] - box.height;
            this.anchorEl.removeClass('x-anchor-top').addClass('x-anchor-bottom');
        }
        else {
            this.anchorEl.removeClass('x-anchor-bottom').addClass('x-anchor-top');
        }

        if (x != undefined || y != undefined) {
            this.setPosition(x != undefined ? x : this.x, y != undefined ? y : this.y);
        }

        return this;
    },

    /**
     * Show this component centered of its parent or the window
     * This only applies when the component is floating.
     * @param {Boolean} centered True to center, false to remove centering
     * @returns {Ext.Component} this
     */
    setCentered : function(centered, update) {
        this.centered = centered;

        if (this.rendered && update) {
            var x, y;
            if (!this.ownerCt) {
                x = (Ext.Element.getViewportWidth() / 2) - (this.getWidth() / 2);
                y = (Ext.Element.getViewportHeight() / 2) - (this.getHeight() / 2);
            }
            else {
                x = (this.ownerCt.getContentTarget().getWidth() / 2) - (this.getWidth() / 2);
                y = (this.ownerCt.getContentTarget().getHeight() / 2) - (this.getHeight() / 2);
            }
            this.setPosition(x, y);
        }

        return this;
    },

    /**
     * Hide the component
     * @param {Object/String/Boolean} animation (optional) Defaults to false.
     */
    hide : function(animation) {
        if (this.fireEvent('beforehide', this) !== false) {
            this.hidden = true;
            if (this.rendered) {
                this.onHide(animation);
            }
            this.fireEvent('hide', this);
        }
        return this;
    },

    // @private
    onShow : function(animation) {
        animation = animation || this.showAnimation;
        if (this.floating) {
            this.el.appendTo(document.body);

            this.getVisibilityEl().show();
            if (animation) {
                this.el.setStyle('opacity', 0.01);
            }

            if (this.centered) {
                this.setCentered(true, true);
            }
            else {
                this.setPosition(this.x, this.y);
            }

            if (animation) {
                var showConfig = {}, showAnim, doc = Ext.getDoc();

                if (Ext.isObject(animation) && !animation.run) {
                    showConfig = Ext.apply({}, animation || {});
                    showAnim = showConfig.type;
                }
                else if (Ext.isString(animation)) {
                    showAnim = animation;
                }
                else if (animation.run) {
                    animation.run(this.el, {
                        out: false
                    });
                    this.showAnimation = animation;
                    return;
                }

                function preventDefault(e) {
                    e.preventDefault();
                };
                doc.on('click', preventDefault, this, {single: true});

                showConfig.after = function() {
                    (function() {
                        doc.un('click', preventDefault, this);
                    }).defer(50, this);
                };
                showConfig.scope = this;
                showConfig.out = false;
                showConfig.autoClear = true;

                Ext.anims[showAnim].run(this.el, showConfig);

                this.showAnimation = showAnim;
            }

            // Then we reset the size to the width and height given in the config
            // and if they were not given use the default css dimensions.
            // This will also relayout the item which is good since things might
            // change based on the styling we give to floating items
            delete this.lastSize;
            this.doComponentLayout(this.width, this.height);

            if (this.modal) {
                if (this.ownerCt) {
                    this.ownerCt.el.mask();
                }
                else {
                    Ext.getBody().mask();
                }
            }
            if (this.hideOnMaskTap) {
                Ext.getDoc().on('touchstart', this.onFloatingTouchStart, this);
            }
        }
        else {
            this.getVisibilityEl().show();
        }
    },

    // @private
    onFloatingTouchStart : function(e, t) {
        var doc = Ext.getDoc();
        if (!this.el.contains(t)) {
            doc.on('touchend', function(e) {
                this.hide();
                e.stopEvent();
            }, this, {single: true});

            e.stopEvent();
        }
    },

    // @private
    onHide : function(animation) {
        animation = animation || this.showAnimation;

        if (this.hideOnMaskTap && this.floating) {
            Ext.getDoc().un('touchstart', this.onFloatingTouchStart, this);
        }

        if (this.floating && this.modal) {
            if (this.ownerCt) {
                this.ownerCt.el.unmask();
            }
            else {
                Ext.getBody().unmask();
            }
        }

        if (animation) {
            var hideConfig = {}, hideAnim;

            if (Ext.isObject(animation) && !animation.run) {
                hideConfig = Ext.apply({}, animation || {});
                hideAnim = hideConfig.type;
            }
            else if (Ext.isString(animation)) {
                hideAnim = animation;
            }

            hideConfig.after = function() {
                this.getVisibilityEl().hide();
            };
            hideConfig.scope = this;
            hideConfig.out = true;
            hideConfig.autoClear = true;

            Ext.anims[hideAnim].run(this.el, hideConfig);
        } else {
            this.getVisibilityEl().hide();
        }
    },

    /**
     * <p>Adds listeners to any Observable object (or Element) which are automatically removed when this Component
     * is destroyed.
     * @param {Observable|Element} item The item to which to add a listener/listeners.
     * @param {Object|String} ename The event name, or an object containing event name properties.
     * @param {Function} fn Optional. If the <code>ename</code> parameter was an event name, this
     * is the handler function.
     * @param {Object} scope Optional. If the <code>ename</code> parameter was an event name, this
     * is the scope (<code>this</code> reference) in which the handler function is executed.
     * @param {Object} opt Optional. If the <code>ename</code> parameter was an event name, this
     * is the {@link Ext.util.Observable#addListener addListener} options.
     */
    mon : function(item, ename, fn, scope, opt) {
        if (Ext.isObject(ename)) {
            var o = ename,
            e;
            for (e in o) {
                if (this.monPropRe.test(e)) {
                    continue;
                }

                this.mons.push({
                    item: item,
                    ename: e,
                    fn: o[e],
                    scope: o.scope
                });

                if (typeof o[e] == 'function') {
                    // shared options
                    item.on(e, o[e], o.scope, o);
                }
                else {
                    // individual options
                    item.on(e, o[e]);
                }
            }
            return;
        }

        this.mons.push({
            item: item,
            ename: ename,
            fn: fn,
            scope: scope
        });

        item.on(ename, fn, scope, opt);
    },

    /**
     * Removes listeners that were added by the {@link #mon} method.
     * @param {Observable|Element} item The item from which to remove a listener/listeners.
     * @param {Object|String} ename The event name, or an object containing event name properties.
     * @param {Function} fn Optional. If the <code>ename</code> parameter was an event name, this
     * is the handler function.
     * @param {Object} scope Optional. If the <code>ename</code> parameter was an event name, this
     * is the scope (<code>this</code> reference) in which the handler function is executed.
     */
    mun : function(item, ename, fn, scope) {
        if (Ext.isObject(ename)) {
            for (var e in ename) {
                if (this.monPropRe.test(e)) {
                    continue;
                }
                if (typeof ename[e] == 'function') {
                    this.mun(item, e, ename[e], ename.scope);
                }
                else {
                    this.mun(item, e, ename[e].fn, ename[e].scope);
                }

            }
            return;
        }

        var mons = this.mons.slice(),
        ln = mons.length,
        i,
        mon;

        for (i = 0; i < ln; i++) {
            mon = mons[i];
            if (mon.item === item && mon.ename === ename && (!fn || mon.fn === fn) && (!scope || mon.scope === scope)) {
                this.mons.remove(mon);
                item.un(mon.ename, mon.fn, mon.scope);
            }
        }
    },

    // @private
    purgeListeners : function() {
        Ext.Component.superclass.purgeListeners.call(this);
        this.clearMons();
    },

    // @private
    clearMons : function() {
        var mons = this.mons,
        ln = mons.length,
        i,
        mon;

        for (i = 0; i < ln; i++) {
            mon = mons[i];
            mon.item.un(mon.ename, mon.fn, mon.scope);
        }

        this.mons = [];
    },

    // @private
    beforeDestroy : function() {
        this.clearMons();
        if (this.monitorResize) {
            Ext.EventManager.removeResizeListener(this.doComponentLayout, this);
        }
    },

    /**
     * Destroys the Component.
     */
    destroy : function() {
        if (!this.isDestroyed) {
            if (this.fireEvent('beforedestroy', this) !== false) {
                this.destroying = true;
                this.beforeDestroy();

                if (this.ownerCt && this.ownerCt.remove) {
                    this.ownerCt.remove(this, false);
                }

                if (this.rendered) {
                    this.el.remove();
                    if (this.actionMode == 'container' || this.removeMode == 'container') {
                        this.container.remove();
                    }
                }

                this.onDestroy();

                Ext.ComponentMgr.unregister(this);
                this.fireEvent('destroy', this);

                this.purgeListeners();
                this.destroying = false;
                this.isDestroyed = true;
            }
        }
    },

    // @private
    onDestroy: Ext.emptyFn,

    /**
     * Update the content area of a component.
     * @param {Mixed} htmlOrData
     * If this component has been configured with a template via the tpl config
     * then it will use this argument as data to populate the template.
     * If this component was not configured with a template, the components
     * content area will be updated via Ext.Element update
     * @param {Boolean} loadScripts
     * (optional) Only legitimate when using the html configuration. Defaults to false
     * @param {Function} callback
     * (optional) Only legitimate when using the html configuration. Callback to execute when scripts have finished loading
     */
    update : function(htmlOrData, loadScripts, cb) {
        var contentTarget = this.getContentTarget();

        if (this.tpl && typeof htmlOrData !== "string") {
            this.data = htmlOrData;
            this.tpl[this.tplWriteMode](contentTarget, htmlOrData || {});
        }
        else {
            var html = Ext.isObject(htmlOrData) ? Ext.DomHelper.markup(htmlOrData) : htmlOrData;
            if (this.rendered) {
                contentTarget.update(html, loadScripts, cb);
            }
            else {
                this.html = html;
            }
        }
        this.doComponentLayout();
        Ext.repaint();
    },

    /**
     * @private
     * Method to manage awareness of when components are added to their
     * respective Container, firing an added event.
     * References are established at add time rather than at render time.
     * @param {Ext.Container} container Container which holds the component
     * @param {number} pos Position at which the component was added
     */
    onAdded : function(container, pos) {
        this.ownerCt = container;
        this.fireEvent('added', this, container, pos);
    },

    /**
     * @private
     * Method to manage awareness of when components are removed from their
     * respective Container, firing an removed event. References are properly
     * cleaned up after removing a component from its owning container.
     */
    onRemoved : function() {
        this.fireEvent('removed', this, this.ownerCt);
        delete this.ownerCt;
    },

    /**
     * Convenience function to hide or show this component by boolean.
     * @param {Boolean} visible True to show, false to hide
     * @return {Ext.Component} this
     */
    setVisible : function(visible) {
        return this[visible ? 'show': 'hide']();
    },

    /**
     * Returns true if this component is visible.
     * @return {Boolean} True if this component is visible, false otherwise.
     */
    isVisible : function() {
        if (!this.rendered) {
            return false;
        }
        var p = this,
        hidden = false;
        while (p) {
            if (p.hidden) {
                hidden = true;
                break;
            }
            p = p.ownerCt;
        }
        return hidden;
    },

    // @private
    getPositionEl : function() {
        return this.positionEl || this.el;
    },

    // @private
    getVisibilityEl : function() {
        return this.el;
    }
});

Ext.layout.TYPES = {};

// @private
Ext.Component.AUTO_ID = 1000;
// @xtype box
Ext.BoxComponent = Ext.Component;

Ext.reg('component', Ext.Component);
Ext.reg('box', Ext.BoxComponent);

Ext.Component.prototype.on = Ext.Component.prototype.addListener;

/**
 * @class Ext.Button
 * @extends Ext.Component
 * @xtype button
 *
 * A simple button class
 *
 * <pre><code>
var buttons = [
    {text: 'Back', ui: 'back', handler: tapMe},
    {text: 'Default', handler: tapMe},
    {text: 'Round', ui: 'round', handler: tapMe},
    {xtype: 'spacer'},
    {text: 'Action', ui: 'action', handler: tapMe},
    {text: 'Forward', ui: 'forward', handler: tapMe}
];

var toolbar1 = new Ext.Toolbar({
    dock: 'top',
    title: 'Toolbar',
    items: buttons
});</code></pre>
 */

/**
 * @constructor
 * Create a new button
 * @param {Object} config The config object
 */
Ext.Button = Ext.extend(Ext.Component, {
    /**
     * Read-only. True if this button is hidden
     * @type Boolean
     */
    hidden : false,
    /**
     * Read-only. True if this button is disabled
     * @type Boolean
     */
    disabled : false,

    /**
     * @cfg {String} iconCls
     * A css class which sets a background image to be used as the icon for this button
     */

    /**
     * @cfg {String} pressEvent
     * The DOM event that will fire the handler of the button. This can be any valid event name.
     * Defaults to <tt>'tap'</tt>.
     */
    pressEvent : 'tap',


    /**
     * @cfg {String} text The button text to be used as innerHTML (html tags are accepted)
     */

    /**
     * @cfg {String} icon The path to an image to display in the button (the image will be set as the background-image
     * CSS property of the button by default, so if you want a mixed icon/text button, set cls:'x-btn-text-icon')
     */

    /**
     * @cfg {Function} handler A function called when the button is clicked (can be used instead of click event).
     * The handler is passed the following parameters:<div class="mdetail-params"><ul>
     * <li><code>b</code> : Button<div class="sub-desc">This Button.</div></li>
     * <li><code>e</code> : EventObject<div class="sub-desc">The click event.</div></li>
     * </ul></div>
     */

    /**
     * @cfg {Object} scope The scope (<tt><b>this</b></tt> reference) in which the
     * <code>{@link #handler}</code> and <code>{@link #toggleHandler}</code> is
     * executed. Defaults to this Button.
     */

    /**
     * @cfg {Boolean} hidden True to start hidden (defaults to false)
     */

    /**
     * @cfg {Boolean} disabled True to start disabled (defaults to false)
     */

    baseCls: 'x-button',

    pressedCls: 'x-button-pressed',

    badgeCls: 'x-badge',

    hasBadgeCls: 'x-hasbadge',

    /**
     * @cfg {String} ui
     * Determines the UI look and feel of the button. Valid options are 'normal', 'back', 'round', 'action', 'forward'.
     * Defaults to 'normal'.
     */
    ui: 'normal',

    isButton: true,

    /**
     * @cfg {String} cls
     * A CSS class string to apply to the button's main element.
     */

    /**
     * @cfg {Number} pressedDelay
     * The amount of delay between the tapstart and the moment we add the pressedCls.
     * Settings this to true defaults to 100ms
     */
    pressedDelay: 0,

    // @private
    afterRender : function(ct, position) {
        this.mon(this.el, this.pressEvent, this.onPress, this);
        this.mon(this.el, 'tapstart', this.onTapStart, this);
        this.mon(this.el, 'tapcancel', this.onTapCancel, this);

        Ext.Button.superclass.afterRender.call(this, ct, position);

        var text = this.text,
            icon = this.icon,
            iconCls = this.iconCls,
            badgeText = this.badgeText;

        this.text = this.icon = this.iconCls = this.badgeText = null;

        this.setText(text);
        this.setIcon(icon);
        this.setIconClass(iconCls);
        this.setBadge(badgeText);
    },

    // @private
    onTapStart : function() {
        if (!this.disabled) {
            var me = this;
            if (me.pressedDelay) {
                me.pressedTimeout = setTimeout(function() {
                    me.el.addClass(me.pressedCls);
                }, Ext.isNumber(me.pressedDelay) ? me.pressedDelay : 100);
            }
            else {
                me.el.addClass(me.pressedCls);
            }
        }
    },

    // @private
    onTapCancel : function() {
        if (this.pressedTimeout) {
            clearTimeout(this.pressedTimeout);
            delete this.pressedTimeout;
        }
        this.el.removeClass(this.pressedCls);
    },

    /**
     * Assigns this Button's click handler
     * @param {Function} handler The function to call when the button is clicked
     * @param {Object} scope (optional) The scope (<code>this</code> reference) in which the handler function is executed.
     * Defaults to this Button.
     * @return {Ext.Button} this
     */
    setHandler : function(handler, scope) {
        this.handler = handler;
        this.scope = scope;
        return this;
    },

    /**
     * Sets this Button's text
     * @param {String} text The button text. If you pass null or undefined the text will be removed.
     * @return {Ext.Button} this
     */
    setText : function(text) {
        if (this.rendered) {
            if (!this.textEl && text) {
                this.textEl = this.el.createChild({
                    tag: 'span',
                    html: text
                });
            }
            else if (this.textEl && text != this.text) {
                if (text) {
                    this.textEl.setHTML(text);
                }
                else {
                    this.textEl.remove();
                    this.textEl = null;
                }
            }
        }
        this.text = text;
        return this;
    },

    /**
     * Sets the background image (inline style) of the button.  This method also changes
     * the value of the {@link icon} config internally.
     * @param {String} icon The path to an image to display in the button. If you pass null or undefined the icon will be removed.
     * @return {Ext.Button} this
     */
    setIcon : function(icon) {
        if (this.rendered) {
            if (!this.iconEl && icon) {
                this.iconEl = this.el.createChild({
                    tag: 'img',
                    src: Ext.BLANK_IMAGE_URL,
                    style: 'background-image: ' + (icon ? 'url(' + icon + ')' : '')
                });
            }
            else if (this.iconEl && icon != this.icon) {
                if (icon) {
                    this.iconEl.setStyle('background-image', icon ? 'url(' + icon + ')' : '');
                }
                else {
                    this.iconEl.remove();
                    this.iconEl = null;
                }
            }
        }
        this.icon = icon;
        return this;
    },

    /**
     * Sets the CSS class that provides a background image to use as the button's icon.  This method also changes
     * the value of the {@link iconCls} config internally.
     * @param {String} cls The CSS class providing the icon image. If you pass null or undefined the iconCls will be removed.
     * @return {Ext.Button} this
     */
    setIconClass : function(cls) {
        if (this.rendered) {
            if (!this.iconEl && cls) {
                this.iconEl = this.el.createChild({
                    tag: 'img',
                    src: Ext.BLANK_IMAGE_URL,
                    cls: cls
                });
            }
            else if (this.iconEl && cls != this.iconCls) {
                if (cls) {
                    if (this.iconCls) {
                        this.iconEl.removeClass(this.iconCls);
                    }
                    this.iconEl.addClass(cls);
                }
                else {
                    this.iconEl.remove();
                    this.iconEl = null;
                }
            }
        }
        this.iconCls = cls;
        return this;
    },

    /**
     * Creates a badge overlay on the button for displaying notifications.
     * @param {String} text The text going into the badge. If you pass null or undefined the badge will be removed.
     * @return {Ext.Button} this
     */
    setBadge : function(text) {
        if (this.rendered) {
            if (!this.badgeEl && text) {
                this.badgeEl = this.el.createChild({
                    tag: 'span',
                    cls: this.badgeCls,
                    html: text
                });
                this.el.addClass(this.hasBadgeCls);
            }
            else if (this.badgeEl && text != this.badgeText) {
                if (text) {
                    this.badgeEl.setHTML(text);
                    this.el.addClass(this.hasBadgeCls);
                }
                else {
                    this.badgeEl.remove();
                    this.badgeEl = null;
                    this.el.removeClass(this.hasBadgeCls);
                }
            }
        }
        this.badgeText = text;
        return this;
    },

    /**
     * Gets the text for this Button
     * @return {String} The button text
     */
    getText : function() {
        return this.text;
    },

    /**
     * Gets the text for this Button's badge
     * @return {String} The button text
     */
    getBadgeText : function() {
        return this.badgeText;
    },

    // @private
    onDisable : function() {
        this.onDisableChange(true);
    },

    // @private
    onEnable : function() {
        this.onDisableChange(false);
    },

    // @private
    onDisableChange : function(disabled) {
        if (this.el) {
            this.el[disabled ? 'addClass' : 'removeClass'](this.disabledClass);
            this.el.dom.disabled = disabled;
        }
        this.disabled = disabled;
    },

    // @private
    onPress : function(e) {
        if (!this.disabled) {
            this.onTapCancel();
            if(this.handler) {
                this.handler.call(this.scope || this, this, e);
            }
        }
    }
});

Ext.reg('button', Ext.Button);

/**
 * @class Ext.Container
 * @extends Ext.Component
 * @xtype container
 * <p>Base class for any {@link Ext.BoxComponent} that may contain other Components. Containers handle the
 * basic behavior of containing items, namely adding, inserting and removing items.</p>
 *
 * <p><u><b>Layout</b></u></p>
 * <p>Container classes delegate the rendering of child Components to a layout
 * manager class which must be configured into the Container using the
 * <code><b>{@link #layout}</b></code> configuration property.</p>
 * <p>When either specifying child <code>{@link #items}</code> of a Container,
 * or dynamically {@link #add adding} Components to a Container, remember to
 * consider how you wish the Container to arrange those child elements, and
 * whether those child elements need to be sized using one of Ext's built-in
 * <b><code>{@link #layout}</code></b> schemes. By default, Containers use the
 * {@link Ext.layout.AutoContainerLayout AutoContainerLayout} scheme which only
 * renders child components, appending them one after the other inside the
 * Container, and <b>does not apply any sizing</b> at all.</p>
 * <p>A common mistake is when a developer neglects to specify a
 * <b><code>{@link #layout}</code></b>. If a Container is left to use the default
 * {@link Ext.layout.AutoContainerLayout AutoContainerLayout} scheme, none of its
 * child components will be resized, or changed in any way when the Container
 * is resized.</p>
 *
 */
Ext.Container = Ext.extend(Ext.Component, {
    /**
     * @cfg {String/Object} layout
     * <p><b>*Important</b>: In order for child items to be correctly sized and
     * positioned, typically a layout manager <b>must</b> be specified through
     * the <code>layout</code> configuration option.</p>
     * <br><p>The sizing and positioning of child {@link items} is the responsibility of
     * the Container's layout manager which creates and manages the type of layout
     * you have in mind.  For example:</p>
     * <p>If the {@link #layout} configuration is not explicitly specified for
     * a general purpose container (e.g. Container or Panel) the
     * {@link Ext.layout.AutoContainerLayout default layout manager} will be used
     * which does nothing but render child components sequentially into the
     * Container (no sizing or positioning will be performed in this situation).</p>
     * <br><p><b><code>layout</code></b> may be specified as either as an Object or
     * as a String:</p><div><ul class="mdetail-params">
     *
     * <li><u>Specify as an Object</u></li>
     * <div><ul class="mdetail-params">
     * <li>Example usage:</li>
     * <pre><code>
layout: {
    type: 'vbox',
    padding: '5',
    align: 'left'
}
       </code></pre>
     *
     * <li><code><b>type</b></code></li>
     * <br/><p>The layout type to be used for this container.  If not specified,
     * a default {@link Ext.layout.ContainerLayout} will be created and used.</p>
     * <br/><p>Valid layout <code>type</code> values are:</p>
     * <div class="sub-desc"><ul class="mdetail-params">
     * <li><code><b>{@link Ext.layout.ContainerLayout auto}</b></code> &nbsp;&nbsp;&nbsp; <b>Default</b></li>
     * <li><code><b>{@link Ext.layout.CardLayout card}</b></code></li>
     * <li><code><b>{@link Ext.layout.FitLayout fit}</b></code></li>
     * <li><code><b>{@link Ext.layout.HBoxLayout hbox}</b></code></li>
     * <li><code><b>{@link Ext.layout.VBoxLayout vbox}</b></code></li>
     * </ul></div>
     *
     * <li>Layout specific configuration properties</li>
     * <br/><p>Additional layout specific configuration properties may also be
     * specified. For complete details regarding the valid config options for
     * each layout type, see the layout class corresponding to the <code>type</code>
     * specified.</p>
     *
     * </ul></div>
     *
     * <li><u>Specify as a String</u></li>
     * <div><ul class="mdetail-params">
     * <li>Example usage:</li>
     * <pre><code>
layout: {
    type: 'vbox',
    padding: '5',
    align: 'left'
}
       </code></pre>
     * <li><code><b>layout</b></code></li>
     * <br/><p>The layout <code>type</code> to be used for this container (see list
     * of valid layout type values above).</p><br/>
     * <br/><p>Additional layout specific configuration properties. For complete
     * details regarding the valid config options for each layout type, see the
     * layout class corresponding to the <code>layout</code> specified.</p>
     * </ul></div></ul></div>
     */
    /**
     * @cfg {Object} layoutConfig
     * This is a config object containing properties specific to the chosen
     * <b><code>{@link #layout}</code></b> if <b><code>{@link #layout}</code></b>
     * has been specified as a <i>string</i>.</p>
     */


    /**
     * @cfg {String/Number} activeItem
     * A string component id or the numeric index of the component that should be initially activated within the
     * container's layout on render.  For example, activeItem: 'item-1' or activeItem: 0 (index 0 = the first
     * item in the container's collection).  activeItem only applies to layout styles that can display
     * items one at a time (like {@link Ext.layout.CardLayout} and
     * {@link Ext.layout.FitLayout}).  Related to {@link Ext.layout.ContainerLayout#activeItem}.
     */
    /**
     * @cfg {Object/Array} items
     * <pre><b>** IMPORTANT</b>: be sure to <b>{@link #layout specify a <code>layout</code>} if needed ! **</b></pre>
     * <p>A single item, or an array of child Components to be added to this container,
     * for example:</p>
     * <pre><code>
// specifying a single item
items: {...},
layout: 'fit',    // specify a layout!

// specifying multiple items
items: [{...}, {...}],
layout: 'hbox', // specify a layout!
       </code></pre>
     * <p>Each item may be:</p>
     * <div><ul class="mdetail-params">
     * <li>any type of object based on {@link Ext.Component}</li>
     * <li>a fully instanciated object or</li>
     * <li>an object literal that:</li>
     * <div><ul class="mdetail-params">
     * <li>has a specified <code>{@link Ext.Component#xtype xtype}</code></li>
     * <li>the {@link Ext.Component#xtype} specified is associated with the Component
     * desired and should be chosen from one of the available xtypes as listed
     * in {@link Ext.Component}.</li>
     * <li>If an <code>{@link Ext.Component#xtype xtype}</code> is not explicitly
     * specified, the {@link #defaultType} for that Container is used.</li>
     * <li>will be "lazily instanciated", avoiding the overhead of constructing a fully
     * instanciated Component object</li>
     * </ul></div></ul></div>
     * <p><b>Notes</b>:</p>
     * <div><ul class="mdetail-params">
     * <li>Ext uses lazy rendering. Child Components will only be rendered
     * should it become necessary. Items are automatically laid out when they are first
     * shown (no sizing is done while hidden), or in response to a {@link #doLayout} call.</li>
     * <li>Do not specify <code>{@link Ext.Panel#contentEl contentEl}</code>/
     * <code>{@link Ext.Panel#html html}</code> with <code>items</code>.</li>
     * </ul></div>
     */
    /**
     * @cfg {Object|Function} defaults
     * <p>This option is a means of applying default settings to all added items whether added through the {@link #items}
     * config or via the {@link #add} or {@link #insert} methods.</p>
     * <p>If an added item is a config object, and <b>not</b> an instantiated Component, then the default properties are
     * unconditionally applied. If the added item <b>is</b> an instantiated Component, then the default properties are
     * applied conditionally so as not to override existing properties in the item.</p>
     * <p>If the defaults option is specified as a function, then the function will be called using this Container as the
     * scope (<code>this</code> reference) and passing the added item as the first parameter. Any resulting object
     * from that call is then applied to the item as default properties.</p>
     * <p>For example, to automatically apply padding to the body of each of a set of
     * contained {@link Ext.Panel} items, you could pass: <code>defaults: {bodyStyle:'padding:15px'}</code>.</p>
     * <p>Usage:</p><pre><code>
defaults: {               // defaults are applied to items, not the container
    autoScroll:true
},
items: [
    {
        xtype: 'panel',   // defaults <b>do not</b> have precedence over
        id: 'panel1',     // options in config objects, so the defaults
        autoScroll: false // will not be applied here, panel1 will be autoScroll:false
    },
    new Ext.Panel({       // defaults <b>do</b> have precedence over options
        id: 'panel2',     // options in components, so the defaults
        autoScroll: false // will be applied here, panel2 will be autoScroll:true.
    })
]
       </code></pre>
     */


    /** @cfg {Boolean} autoDestroy
     * If true the container will automatically destroy any contained component that is removed from it, else
     * destruction must be handled manually (defaults to true).
     */
    autoDestroy : true,

     /** @cfg {String} defaultType
      * <p>The default {@link Ext.Component xtype} of child Components to create in this Container when
      * a child item is specified as a raw configuration object, rather than as an instantiated Component.</p>
      * <p>Defaults to <code>'panel'</code>.</p>
      */
    defaultType: 'panel',

    isContainer : true,

    baseCls: 'x-container',

    /**
     * @cfg {String} animation
     * Animation to be used during transitions of cards. Note this only works when this container has a CardLayout.
     * Any valid value from Ext.anims can be used ('fade', 'slide', 'flip', 'cube', 'pop', 'wipe').
     * Defaults to null.
     */
    animation: null,

    // @private
    initComponent : function(){
        Ext.Container.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event afterlayout
             * Fires when the components in this container are arranged by the associated layout manager.
             * @param {Ext.Container} this
             * @param {ContainerLayout} layout The ContainerLayout implementation for this container
             */
            'afterlayout',
            /**
             * @event beforeadd
             * Fires before any {@link Ext.Component} is added or inserted into the container.
             * A handler can return false to cancel the add.
             * @param {Ext.Container} this
             * @param {Ext.Component} component The component being added
             * @param {Number} index The index at which the component will be added to the container's items collection
             */
            'beforeadd',
            /**
             * @event beforeremove
             * Fires before any {@link Ext.Component} is removed from the container.  A handler can return
             * false to cancel the remove.
             * @param {Ext.Container} this
             * @param {Ext.Component} component The component being removed
             */
            'beforeremove',
            /**
             * @event add
             * @bubbles
             * Fires after any {@link Ext.Component} is added or inserted into the container.
             * @param {Ext.Container} this
             * @param {Ext.Component} component The component that was added
             * @param {Number} index The index at which the component was added to the container's items collection
             */
            'add',
            /**
             * @event remove
             * @bubbles
             * Fires after any {@link Ext.Component} is removed from the container.
             * @param {Ext.Container} this
             * @param {Ext.Component} component The component that was removed
             */
            'remove'
        );

        this.initItems();
    },

    // @private
    initItems : function(){
        var items = this.items;
        this.items = new Ext.util.MixedCollection(false, this.getComponentId);
        if (items) {
            this.add(items);
        }
    },

    // @private
    setLayout : function(layout) {
        if (this.layout && this.layout != layout) {
            this.layout.setOwner(null);
        }
        this.layout = layout;
        layout.setOwner(this);
    },

    // @private
    prepareItems : function(items, applyDefaults) {
        if (!Ext.isArray(items)) {
            items = [items];
        }
        // Make sure defaults are applied and item is initialized
        var item, i, ln;
        for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];
            if (applyDefaults) {
                item = this.applyDefaults(item);
            }
            items[i] = this.lookupComponent(item);
        }
        return items;
    },

    // @private
    applyDefaults : function(c) {
        var d = this.defaults;
        if (d) {
            if (Ext.isFunction(d)) {
                d = d.call(this, c);
            }
            if (typeof c == 'string') {
                c = Ext.ComponentMgr.get(c);
                Ext.apply(c, d);
            }
            else if (!c.events) {
                Ext.applyIf(c, d);
            }
            else {
                Ext.apply(c, d);
            }
        }
        return c;
    },

    // @private
    lookupComponent : function(comp) {
        if (typeof comp == 'string') {
            return Ext.ComponentMgr.get(comp);
        }
        else if (!comp.events) {
            return this.createComponent(comp);
        }
        return comp;
    },

    // @private
    createComponent : function(config, defaultType){
        if (config.render) {
            return config;
        }
        // add in ownerCt at creation time but then immediately
        // remove so that onBeforeAdd can handle it
        var c = Ext.create(Ext.apply({
            ownerCt: this
        }, config), defaultType || this.defaultType);
        delete c.initialConfig.ownerCt;
        delete c.ownerCt;
        return c;
    },

    // @private
    afterRender: function() {
        this.layout = this.initLayout(this.layout, 'auto');
        this.setLayout(this.layout);

        Ext.Container.superclass.afterRender.call(this);
    },

    // @private
    doLayout : function() {
        if(this.rendered && this.layout) {
            this.layout.layout();
        }
    },

    // @private
    afterLayout : function(layout) {
        if (this.floating && this.centered) {
            this.setCentered(true, true);
        }

        this.fireEvent('afterlayout', this, layout);
    },

    /**
     * <p>Returns the Element to be used to contain the child Components of this Container.</p>
     * <p>An implementation is provided which returns the Container's {@link #getEl Element}, but
     * if there is a more complex structure to a Container, this may be overridden to return
     * the element into which the {@link #layout layout} renders child Components.</p>
     * @return {Ext.Element} The Element to render child Components into.
     */
    getLayoutTarget : function(){
        return this.el;
    },

    // @private - used as the key lookup function for the items collection
    getComponentId : function(comp){
        return comp.getItemId();
    },

    /**
     * <p>Adds {@link Ext.Component Component}(s) to this Container.</p>
     * <br><p><b>Description</b></u> :
     * <div><ul class="mdetail-params">
     * <li>Fires the {@link #beforeadd} event before adding</li>
     * <li>The Container's {@link #defaults default config values} will be applied
     * accordingly (see <code>{@link #defaults}</code> for details).</li>
     * <li>Fires the {@link #add} event after the component has been added.</li>
     * </ul></div>
     * <br><p><b>Notes</b></u> :
     * <div><ul class="mdetail-params">
     * <li>If the Container is <i>already rendered</i> when <code>add</code>
     * is called, you may need to call {@link #doLayout} to refresh the view which causes
     * any unrendered child Components to be rendered. This is required so that you can
     * <code>add</code> multiple child components if needed while only refreshing the layout
     * once. For example:<pre><code>
var tb = new {@link Ext.Toolbar}();
tb.render(document.body);  // toolbar is rendered
tb.add({text:'Button 1'}); // add multiple items ({@link #defaultType} for {@link Ext.Toolbar Toolbar} is 'button')
tb.add({text:'Button 2'});
tb.{@link #doLayout}();             // refresh the layout
     * </code></pre></li>
     * <li><i>Warning:</i> Containers directly managed by the BorderLayout layout manager
     * may not be removed or added.  See the Notes for {@link Ext.layout.BorderLayout BorderLayout}
     * for more details.</li>
     * </ul></div>
     * @param {...Object/Array} component
     * <p>Either one or more Components to add or an Array of Components to add.  See
     * <code>{@link #items}</code> for additional information.</p>
     * @return {Ext.Component/Array} The Components that were added.
     */
    add : function() {
        var args = Array.prototype.slice.call(arguments),
            index = -1;

        if (typeof args[0] == 'number') {
            index = args.shift();
        }

        var hasMultipleArgs = args.length > 1;
        if (hasMultipleArgs || Ext.isArray(args[0])) {
            var items = hasMultipleArgs ? args : args[0],
                results = [],
                i, ln, item;

            for (i = 0, ln = items.length; i < ln; i++) {
                item = items[i];
                if (index != -1) {
                    item = this.add(index + i, item);
                }
                else {
                    item = this.add(item);
                }
                results.push(item);
            }

            return results;
        }

        var cmp = this.prepareItems(args[0], true)[0];
        index = (index !== -1) ? index : this.items.length;

        if (this.fireEvent('beforeadd', this, cmp, index) !== false && this.onBeforeAdd(cmp) !== false) {
            this.items.insert(index, cmp);
            cmp.onAdded(this, index);
            this.onAdd(cmp);
            this.fireEvent('add', this, cmp, index);
        }

        return cmp;
    },

    onAdd : Ext.emptyFn,
    onRemove : Ext.emptyFn,

    /**
     * Inserts a Component into this Container at a specified index. Fires the
     * {@link #beforeadd} event before inserting, then fires the {@link #add} event after the
     * Component has been inserted.
     * @param {Number} index The index at which the Component will be inserted
     * into the Container's items collection
     * @param {Ext.Component} component The child Component to insert.<br><br>
     * Ext uses lazy rendering, and will only render the inserted Component should
     * it become necessary.<br><br>
     * A Component config object may be passed in order to avoid the overhead of
     * constructing a real Component object if lazy rendering might mean that the
     * inserted Component will not be rendered immediately. To take advantage of
     * this 'lazy instantiation', set the {@link Ext.Component#xtype} config
     * property to the registered type of the Component wanted.<br><br>
     * For a list of all available xtypes, see {@link Ext.Component}.
     * @return {Ext.Component} component The Component (or config object) that was
     * inserted with the Container's default config values applied.
     */
    insert : function(index, comp){
        this.add(index, comp);
    },

    // @private
    onBeforeAdd : function(item) {
        if (item.ownerCt) {
            item.ownerCt.remove(item, false);
        }
        if (this.hideBorders === true){
            item.border = (item.border === true);
        }
    },

    /**
     * Removes a component from this container.  Fires the {@link #beforeremove} event before removing, then fires
     * the {@link #remove} event after the component has been removed.
     * @param {Component/String} component The component reference or id to remove.
     * @param {Boolean} autoDestroy (optional) True to automatically invoke the removed Component's {@link Ext.Component#destroy} function.
     * Defaults to the value of this Container's {@link #autoDestroy} config.
     * @return {Ext.Component} component The Component that was removed.
     */
    remove : function(comp, autoDestroy) {
        var c = this.getComponent(comp);
        if (c && this.fireEvent('beforeremove', this, c) !== false) {
            this.doRemove(c, autoDestroy);
            this.fireEvent('remove', this, c);
        }
        return c;
    },

    // @private
    doRemove : function(component, autoDestroy) {
        var layout = this.layout,
            hasLayout = layout && this.rendered;

        if (hasLayout) {
            layout.onRemove(component);
        }

        this.items.remove(component);
        component.onRemoved();
        this.onRemove(component);

        if (autoDestroy === true || (autoDestroy !== false && this.autoDestroy)) {
            component.destroy();
        }

        if (hasLayout) {
            layout.afterRemove(component);
        }
    },

    /**
     * Removes all components from this container.
     * @param {Boolean} autoDestroy (optional) True to automatically invoke the removed Component's {@link Ext.Component#destroy} function.
     * Defaults to the value of this Container's {@link #autoDestroy} config.
     * @return {Array} Array of the destroyed components
     */
    removeAll : function(autoDestroy) {
        var item,
            removeItems = this.items.items.slice(),
            items = [],
            ln = removeItems.length,
            i;
        for (i = 0; i < ln; i++) {
            item = removeItems[i];
            this.remove(item, autoDestroy);
            if (item.ownerCt !== this) {
                items.push(item);
            }
        }
        return items;
    },

    /**
     * Examines this container's <code>{@link #items}</code> <b>property</b>
     * and gets a direct child component of this container.
     * @param {String/Number} comp This parameter may be any of the following:
     * <div><ul class="mdetail-params">
     * <li>a <b><code>String</code></b> : representing the <code>{@link Ext.Component#itemId itemId}</code>
     * or <code>{@link Ext.Component#id id}</code> of the child component </li>
     * <li>a <b><code>Number</code></b> : representing the position of the child component
     * within the <code>{@link #items}</code> <b>property</b></li>
     * </ul></div>
     * <p>For additional information see {@link Ext.util.MixedCollection#get}.
     * @return Ext.Component The component (if found).
     */
    getComponent : function(comp) {
        if (Ext.isObject(comp)) {
            comp = comp.getItemId();
        }
        return this.items.get(comp);
    },

    // @private
    onShow : function(){
        // removes css classes that were added to hide
        Ext.Container.superclass.onShow.apply(this, arguments);
        // If we were sized during the time we were hidden, layout.
        if (Ext.isDefined(this.deferLayout)) {
            delete this.deferLayout;
            this.doLayout(true);
        }
    },

    /**
     * Returns the layout currently in use by the container.  If the container does not currently have a layout
     * set, a default {@link Ext.layout.ContainerLayout} will be created and set as the container's layout.
     * @return {ContainerLayout} layout The container's layout
     */
    getLayout : function() {
        if (!this.layout) {
            var layout = new Ext.layout.AutoLayout(this.layoutConfig);
            this.setLayout(layout);
        }
        return this.layout;
    },

    // inherit docs
    setScrollable : function(direction) {
        Ext.Container.superclass.setScrollable.call(this, direction);

        if (direction !== false) {
            this.originalGetLayoutTarget = this.getLayoutTarget;
            this.getLayoutTarget = function() {
                return this.scrollEl;
            };
        }
        else {
            this.getLayoutTarget = this.originalGetLayoutTarget;
        }
    },

    // @private
    beforeDestroy : function() {
        var c;
        if (this.items) {
            c = this.items.first();
            while (c) {
                this.doRemove(c, true);
                c = this.items.first();
            }
        }
        Ext.destroy(this.layout);
        Ext.Container.superclass.beforeDestroy.call(this);
    },

    /**
     * Returns the current activeItem for the layout (only for a card layout)
     * @return {activeItem} activeItem Current active component
     */
    getActiveItem : function() {
        if (this.layout && this.layout.type === 'card') {
            return this.layout.activeItem;
        }
        else {
            return null;
        }
    }
});

// Backwards compatibility (DEPRECATED)
Ext.Container.LAYOUTS = Ext.layout.TYPES;

Ext.reg('container', Ext.Container);

/**
 * @class Ext.SplitButton
 * @extends Ext.Container
 * <p>SplitButton is a container for a group of {@link Ext.Button}s</p>
 * @param {Object} config The config object
 * @xtype splitbutton
 *
 * <pre><code>
var splitBtn = new Ext.SplitButton({
    allowMultiple: true,
    items: [{
        text: 'Option 1',
        active: true,
        handler: tapMe
    },{
        text: 'Option 2',
        active: true,
        handler: tapMe
    },{
        text: 'Option 3',
        handler: tapMe
    }]
});</code></pre>
 *
 */
Ext.SplitButton = Ext.extend(Ext.Container, {
    defaultType: 'button',

    cmpCls: 'x-splitbutton',
    activeCls: 'x-button-active',

    /**
     * @cfg {Boolean} allowMultiple
     * Allow multiple active buttons (defaults to false).
     */
    allowMultiple: false,
    // XXX unused
    //allowNone: false,

    // @private
    initComponent : function() {
        this.layout = {
            type: 'hbox',
            align: 'stretch'
        };

        Ext.SplitButton.superclass.initComponent.call(this);
    },

    // @private
    afterRender : function() {
        Ext.SplitButton.superclass.afterRender.call(this);

        this.mon(this.el, {
            tap: this.onTap,
            scope: this
        });
    },

    // @private
    afterLayout : function(layout) {
        Ext.SplitButton.superclass.afterLayout.call(this, layout);

        if (!this.initialized) {
            this.items.each(function(item) {
                if (item.active) {
                    this.setActive(item);
                }
            }, this);
            this.initialized = true;
        }
    },

    // @private
    onTap : function(e, t) {
        t = e.getTarget('.x-button');

        if (t && !this.disabled) {
            this.setActive(Ext.getCmp(t.id));
        }
    },

    /**
     * Gets the active button(s)
     * @returns {Array/Button} The active button or an array of active buttons (if allowMultiple is true)
     */
    getActive : function() {
        return this.allowMultiple ? this.activeButtons : this.activeButton;
    },

    /**
     * Activates a button
     * @param {Number/String/Button} position/id/button. The button to activate.
     * If allowMultiple is true, then setActive will toggle the button state.
     */
    setActive : function(btn) {
        if (Ext.isNumber(btn)) {
            btn = this.items.get(btn);
        }
        else if (Ext.isString(btn)) {
            btn = Ext.getCmp(btn);
        }
        else if (!btn.isButton) {
            btn = null;
        }

        if (this.allowMultiple) {
            this.activeButtons = this.activeButtons || [];
            if (btn) {
                var idx = this.activeButtons.indexOf(btn);
                if (idx == -1) {
                    this.activeButtons.push(btn);
                    btn.el.addClass(this.activeCls);
                } else {
                    this.activeButtons.splice(idx,1);
                    btn.el.removeClass(this.activeCls);
                }
            }
        }
        else {
            this.activeButton = btn;
            if (this.activeButton) {
                btn.el.radioClass(this.activeCls);
            }
        }
    },

    /**
     * Disables all buttons
     */
    disable : function() {
        this.items.each(function(item) {
            item.disable();
        }, this);

        Ext.SplitButton.superclass.disable.apply(this, arguments);
    },

    /**
     * Enables all buttons
     */
    enable : function() {
        this.items.each(function(item) {
            item.enable();
        }, this);

        Ext.SplitButton.superclass.enable.apply(this, arguments);
    }
});

Ext.reg('splitbutton', Ext.SplitButton);

/**
 * @class Ext.Panel
 * @extends Ext.Container
 * <p>Panel is a container that has specific functionality and structural components that make
 * it the perfect building block for application-oriented user interfaces.</p>
 * <p>Panels are, by virtue of their inheritance from {@link Ext.Container}, capable
 * of being configured with a {@link Ext.Container#layout layout}, and containing child Components.</p>
 * <p>When either specifying child {@link Ext.Component#items items} of a Panel, or dynamically {@link Ext.Container#add adding} Components
 * to a Panel, remember to consider how you wish the Panel to arrange those child elements, and whether
 * those child elements need to be sized using one of Ext's built-in <code><b>{@link Ext.Container#layout layout}</b></code> schemes. By
 * default, Panels use the {@link Ext.layout.ContainerLayout ContainerLayout} scheme. This simply renders
 * child components, appending them one after the other inside the Container, and <b>does not apply any sizing</b>
 * at all.</p>
 * @param {Object} config The config object
 * @xtype panel
 *
 * <pre><code>
var pnl = new Ext.Panel({
    fullscreen: true,
    dockedItems: [{
        dock: 'top',
        xtype: 'toolbar',
        title: 'Standard Titlebar'
    },{
        dock: 'top',
        xtype: 'toolbar',
        type: 'light',
        items: [{
            text: 'Test Button'
        }]
    }],
    html: 'Testing'
});</code></pre>
 *
 */
Ext.Panel = Ext.extend(Ext.Container, {
    /**
     * @cfg {String} baseCls
     * The base CSS class to apply to this panel's element (defaults to <code>'x-panel'</code>).
     */
    baseCls : 'x-panel',

    /**
     * @cfg {Number/String} padding
     * A shortcut for setting a padding style on the body element. The value can either be
     * a number to be applied to all sides, or a normal css string describing padding.
     * Defaults to <tt>undefined</tt>.
     */
    padding: undefined,

    // inherited

    scroll: false,

    /**
     * @cfg {Boolean} fullscreen
     * Force the component to take up 100% width and height available. Defaults to false.
     * Setting this configuration immediately sets the monitorOrientation config to true.
     */
    fullscreen: false,

    isPanel: true,
    componentLayout: 'dock',

    renderTpl: new Ext.XTemplate(
        '<div <tpl if="id">id="{id}"</tpl> class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<div class="{baseCls}-body"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl></div>',
        '</div>',
        {compiled: true}
    ),

    /**
     * @cfg {Boolean} monitorOrientation
     * Monitor Orientation change
     */
    monitorOrientation: false,

    initComponent : function() {
        Ext.Panel.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event bodyresize
             * Fires after the Panel has been resized.
             * @param {Ext.Panel} p the Panel which has been resized.
             * @param {Number} width The Panel body's new width.
             * @param {Number} height The Panel body's new height.
             */
            'bodyresize',
            // inherited
            'activate',
            // inherited
            'deactivate'
        );
    },

    // @private
    initItems : function() {
        Ext.Panel.superclass.initItems.call(this);

        var items = this.dockedItems;
        this.dockedItems = new Ext.util.MixedCollection(false, this.getComponentId);
        if (items) {
            this.addDocked(items);
        }
    },

    // @private
    onRender : function(ct, position) {
        var bodyStyle = [],
            undefined;

        if (this.padding != undefined) {
            bodyStyle.push('padding: ' + Ext.Element.parseBox((this.padding === true) ? 5 : this.padding));
        }
        if (this.margin != undefined) {
            bodyStyle.push('margin: ' + Ext.Element.parseBox((this.margin === true) ? 1 : this.margin));
        }
        if (this.border != undefined) {
            bodyStyle.push('border-width: ' + Ext.Element.parseBox((this.border === true) ? 1 : this.border));
        }

        Ext.applyIf(this.renderData, {
            bodyStyle: bodyStyle.length ? bodyStyle.join(';') : undefined
        });
        Ext.applyIf(this.renderSelectors, {
            body: ':first-child'
        });
        Ext.Panel.superclass.onRender.call(this, ct, position);
    },

    /**
     * Adds docked item(s) to the panel.
     * @param {...Object/Array} component. The Component or array of components to add. The components
     * must include a 'dock' paramater on each component to indicate where it should be docked ('top', 'right',
     * 'bottom', 'left').
     * @param {Number} pos (optional) The index at which the Component will be added
     */
    addDocked : function(items, pos) {
        items = this.prepareItems(items);

        var item, i, ln;
        for (i = 0, ln = items.length; i < ln; i++) {
            item = items[i];
            if (pos !== undefined) {
                this.dockedItems.insert(pos+i, item);
            }
            else {
                this.dockedItems.add(item);
            }
            item.onAdded(this, i);
            this.onDockedAdd(item);
        }
        if (this.rendered) {
            this.doComponentLayout();
        }
    },

    // Placeholder empty functions
    onDockedAdd : Ext.emptyFn,
    onDockedRemove : Ext.emptyFn,

    /**
     * Inserts docked item(s) to the panel at the indicated position.
     * @param {...Object/Array} component. The Component or array of components to add. The components
     * must include a 'dock' paramater on each component to indicate where it should be docked ('top', 'right',
     * 'bottom', 'left').
     * @param {Number} pos The index at which the Component will be inserted
     */
    insertDocked : function(pos, items) {
        this.addDocked(items, pos);
    },

    /**
     * Removes the docked item from the panel.
     * @param {Ext.Component} item. The Component to remove.
     * @param {Boolean} autoDestroy (optional) Destroy the component after removal.
     */
    removeDocked : function(item, autoDestroy) {
        if (!this.dockedItems.contains(item)) {
            return item;
        }

        var layout = this.componentLayout,
            hasLayout = layout && this.rendered;

        if (hasLayout) {
            layout.onRemove(item);
        }

        this.dockedItems.remove(item);
        item.onRemoved();
        this.onDockedRemove(item);

        if (autoDestroy === true || (autoDestroy !== false && this.autoDestroy)) {
            item.destroy();
        }

        if (hasLayout) {
            layout.afterRemove(item);
        }

        if (this.rendered) {
            this.doComponentLayout();
        }

        return item;
    },

    /**
     * Retrieve an array of all currently docked components.
     * @returns {Array} An array of components.
     */
    getDockedItems : function() {
        if (this.dockedItems && this.dockedItems.items.length) {
            return this.dockedItems.items.slice();
        }
    },

    /**
     * <p>Returns the Element to be used to contain the child Components of this Container.</p>
     * <p>An implementation is provided which returns the Container's {@link #getEl Element}, but
     * if there is a more complex structure to a Container, this may be overridden to return
     * the element into which the {@link #layout layout} renders child Components.</p>
     * @return {Ext.Element} The Element to render child Components into.
     */
    getLayoutTarget : function(){
        return this.body;
    },

    // private
    getContentTarget : function() {
        return this.body;
    },

    getTargetSize : function() {
        ret = this.body.getViewSize();
        ret.width  -= this.body.getPadding('lr');
        ret.height -= this.body.getPadding('tb');
        return ret;
    }
});

Ext.reg('panel', Ext.Panel);
/**
 * @class Ext.DataPanel
 * @extends Ext.Panel
 * @xtype datapanel
 * A Panel that allows the binding of stores.
 */
Ext.DataPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String/Array} tpl
     * The HTML fragment or an array of fragments that will make up the template used by this DataView.  This should
     * be specified in the same format expected by the constructor of {@link Ext.XTemplate}.
     */
    /**
     * @cfg {Ext.data.Store} store
     * The {@link Ext.data.Store} to bind this DataView to.
     */
    /**
     * @cfg {String} itemSelector
     * <b>This is a required setting</b>. A simple CSS selector (e.g. <tt>div.some-class</tt> or
     * <tt>span:first-child</tt>) that will be used to determine what nodes this DataView will be
     * working with.
     */

    /**
     * @cfg {Boolean} blockRefresh Set this to true to ignore datachanged events on the bound store. This is useful if
     * you wish to provide custom transition animations via a plugin (defaults to false)
     */
    blockRefresh: false,

    // @private
    initComponent: function() {
        if (Ext.isString(this.tpl) || Ext.isArray(this.tpl)) {
            this.tpl = new Ext.XTemplate(this.tpl);
        }

        this.store = Ext.StoreMgr.lookup(this.store);
        this.all = new Ext.CompositeElementLite();

        Ext.DataPanel.superclass.initComponent.call(this);
    },


    // @private
    afterRender: function(){
        Ext.DataPanel.superclass.afterRender.call(this);
        if (this.store) {
            this.bindStore(this.store, true);
        }
    },

    /**
     * Returns the store associated with this DataPanel.
     * @return {Ext.data.Store} The store
     */
    getStore: function(){
        return this.store;
    },

    /**
     * Refreshes the view by reloading the data from the store and re-rendering the template.
     */
    refresh: function() {
        if (!this.rendered) {
            return;
        }

        var el = this.getTemplateTarget(),
            records = this.store.getRange();

        if (records.length < 1) {
            this.all.clear();
        }
        else {
            this.tpl.overwrite(el, this.collectData(records, 0));
            this.all.fill(Ext.query(this.itemSelector, el.dom));
            this.updateIndexes(0);
        }
    },

    // Inherited Docs
    getTemplateTarget: function() {
        return this.scrollEl || this.body;
    },

    /**
     * <p>Function which can be overridden to provide custom formatting for each Record that is used by this
     * DataPanel's {@link #tpl template} to render each node.</p>
     * @param {Array/Object} data The raw data object that was used to create the Record.
     * @param {Number} recordIndex the index number of the Record being prepared for rendering.
     * @param {Record} record The Record being prepared for rendering.
     * @return {Array/Object} The formatted data in a format expected by the internal {@link #tpl template}'s overwrite() method.
     * (either an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'}))
     */
    prepareData: function(data) {
        return data;
    },


    /**
     * <p>Function which can be overridden which returns the data object passed to this
     * DataPanel's {@link #tpl template} to render the whole DataPanel.</p>
     * <p>This is usually an Array of data objects, each element of which is processed by an
     * {@link Ext.XTemplate XTemplate} which uses <tt>'&lt;tpl for="."&gt;'</tt> to iterate over its supplied
     * data object as an Array. However, <i>named</i> properties may be placed into the data object to
     * provide non-repeating data such as headings, totals etc.</p>
     * @param {Array} records An Array of {@link Ext.data.Model}s to be rendered into the DataPanel.
     * @param {Number} startIndex the index number of the Record being prepared for rendering.
     * @return {Array} An Array of data objects to be processed by a repeating XTemplate. May also
     * contain <i>named</i> properties.
     */
    collectData: function(records, startIndex) {
        var results = [],
            i, ln = records.length;
        for (i = 0; i < ln; i++) {
            results[results.length] = this.prepareData(records[i].data, startIndex + i, records[i]);
        }
        return results;
    },

    /**
     * @private
     * Changes the data store bound to this view and refreshes it.
     * @param {Store} store The store to bind to this view
     * @param {Boolean} initial Flag as the initial bind
     */
    bindStore: function(store, initial) {
        if (!this.rendered) {
            this.store = store;
            return;
        }

        if (!initial && this.store) {
            if (store !== this.store && this.store.autoDestroy) {
                this.store.destroyStore();
            }
            else {
                this.store.un({
                    scope: this,
                    beforeload: this.onBeforeLoad,
                    datachanged: this.onDataChanged,
                    add: this.onAdd,
                    remove: this.onRemove,
                    update: this.onUpdate,
                    clear: this.refresh
                });
            }
            if (!store) {
                this.store = null;
            }
        }
        if (store) {
            store = Ext.StoreMgr.lookup(store);
            store.on({
                scope: this,
                beforeload: this.onBeforeLoad,
                datachanged: this.onDataChanged,
                add: this.onAdd,
                remove: this.onRemove,
                update: this.onUpdate,
                clear: this.refresh
            });
        }
        this.store = store;
        if (store) {
            this.refresh();
        }
    },

    onBeforeLoad: Ext.emptyFn,

    // @private
    bufferRender: function(records, index) {
        var div = document.createElement('div');
        this.tpl.overwrite(div, this.collectData(records, index));
        return Ext.query(this.itemSelector, div);
    },

    // @private
    onUpdate: function(ds, record) {
        var index = this.store.indexOf(record),
            sel, original, node;
        
        if (index > -1) {
            sel = this.isSelected(index);
            original = this.all.elements[index];
            node = this.bufferRender([record], index)[0];

            this.all.replaceElement(index, node, true);
            if (sel) {
                this.selected.replaceElement(original, node);
                this.all.item(index).addClass(this.selectedClass);
            }
            this.updateIndexes(index, index);
        }
    },

    // @private
    onAdd: function(ds, records, index) {
        if (this.all.getCount() === 0) {
            this.refresh();
            return;
        }
        var nodes = this.bufferRender(records, index), n, a = this.all.elements;
        if (index < this.all.getCount()) {
            n = this.all.item(index).insertSibling(nodes, 'before', true);
            a.splice.apply(a, [index, 0].concat(nodes));
        }
        else {
            n = this.all.last().insertSibling(nodes, 'after', true);
            a.push.apply(a, nodes);
        }
        this.updateIndexes(index);
    },

    // @private
    onRemove: function(ds, record, index) {
        this.deselect(index);
        this.all.removeElement(index, true);
        this.updateIndexes(index);
        if (this.store.getCount() === 0){
            this.refresh();
        }
    },

    /**
     * Refreshes an individual node's data from the store.
     * @param {Number} index The item's data index in the store
     */
    refreshNode: function(index){
        this.onUpdate(this.store, this.store.getAt(index));
    },

    // @private
    updateIndexes: function(startIndex, endIndex){
        var ns = this.all.elements;
        startIndex = startIndex || 0;
        endIndex = endIndex || ((endIndex === 0) ? 0 : (ns.length - 1));
        for(var i = startIndex; i <= endIndex; i++){
            ns[i].viewIndex = i;
        }
    },

    /**
     * @private
     * Calls this.refresh if this.blockRefresh is not true
     */
    onDataChanged: function() {
        if (this.blockRefresh !== true) {
            this.refresh.apply(this, arguments);
        }
    },

    /**
     * Returns the template node the passed child belongs to, or null if it doesn't belong to one.
     * @param {HTMLElement} node
     * @return {HTMLElement} The template node
     */
    findItemFromChild: function(node) {
        return Ext.fly(node).findParent(this.itemSelector, this.getTemplateTarget());
    },

    /**
     * Gets an array of the records from an array of nodes
     * @param {Array} nodes The nodes to evaluate
     * @return {Array} records The {@link Ext.data.Model} objects
     */
    getRecords: function(nodes) {
        var r = [],
            s = nodes,
            len = s.length,
            i;
        for (i = 0; i < len; i++) {
            r[r.length] = this.store.getAt(s[i].viewIndex);
        }
        return r;
    },

    /**
     * Gets a record from a node
     * @param {HTMLElement} node The node to evaluate
     * @return {Record} record The {@link Ext.data.Model} object
     */
    getRecord: function(node) {
        return this.store.getAt(node.viewIndex);
    },

    /**
     * Gets a template node.
     * @param {HTMLElement/String/Number/Ext.data.Model} nodeInfo An HTMLElement template node, index of a template node,
     * the id of a template node or the record associated with the node.
     * @return {HTMLElement} The node or null if it wasn't found
     */
    getNode: function(nodeInfo) {
        if (Ext.isString(nodeInfo)) {
            return document.getElementById(nodeInfo);
        }
        else if (Ext.isNumber(nodeInfo)) {
            return this.all.elements[nodeInfo];
        }
        else if (nodeInfo instanceof Ext.data.Model) {
            var idx = this.store.indexOf(nodeInfo);
            return this.all.elements[idx];
        }
        return nodeInfo;
    },

    /**
     * Gets a range nodes.
     * @param {Number} start (optional) The index of the first node in the range
     * @param {Number} end (optional) The index of the last node in the range
     * @return {Array} An array of nodes
     */
    getNodes: function(start, end) {
        var ns = this.all.elements,
            nodes = [],
            i;
        start = start || 0;
        end = !Ext.isDefined(end) ? Math.max(ns.length - 1, 0) : end;
        if (start <= end) {
            for (i = start; i <= end && ns[i]; i++) {
                nodes.push(ns[i]);
            }
        }
        else {
            for (i = start; i >= end && ns[i]; i--) {
                nodes.push(ns[i]);
            }
        }
        return nodes;
    },

    /**
     * Finds the index of the passed node.
     * @param {HTMLElement/String/Number/Record} nodeInfo An HTMLElement template node, index of a template node, the id of a template node
     * or a record associated with a node.
     * @return {Number} The index of the node or -1
     */
    indexOf: function(node) {
        node = this.getNode(node);
        if (Ext.isNumber(node.viewIndex)) {
            return node.viewIndex;
        }
        return this.all.indexOf(node);
    },

    // @private
    onDestroy: function() {
        this.all.clear();
        Ext.DataPanel.superclass.onDestroy.call(this);
        this.bindStore(null);
    }
});

Ext.reg('datapanel', Ext.DataPanel);

/**
 * @class Ext.DataView
 * @extends Ext.DataPanel
 * @xtype dataview
 * A mechanism for displaying data using custom layout templates and formatting. DataView uses an {@link Ext.XTemplate}
 * as its internal templating mechanism, and is bound to an {@link Ext.data.Store}
 * so that as the data in the store changes the view is automatically updated to reflect the changes.  The view also
 * provides built-in behavior for many common events that can occur for its contained items including itemtap, containertap,
 * etc. as well as a built-in selection model. <b>In order to use these features, an {@link #itemSelector}
 * config must be provided for the DataView to determine what nodes it will be working with.</b>
 *
 * <p>The example below binds a DataView to a {@link Ext.data.Store} and renders it into an {@link Ext.Panel}.</p>
 * <pre><code>
var store = new Ext.data.JsonStore({
    url: 'get-images.php',
    root: 'images',
    fields: [
        'name', 'url',
        {name:'size', type: 'float'},
        {name:'lastmod', type:'date', dateFormat:'timestamp'}
    ]
});
store.load();

var tpl = new Ext.XTemplate(
    '&lt;tpl for="."&gt;',
        '&lt;div class="thumb-wrap" id="{name}"&gt;',
        '&lt;div class="thumb"&gt;&lt;img src="{url}" title="{name}"&gt;&lt;/div&gt;',
        '&lt;span class="x-editable"&gt;{shortName}&lt;/span&gt;&lt;/div&gt;',
    '&lt;/tpl&gt;',
    '&lt;div class="x-clear"&gt;&lt;/div&gt;'
);

var panel = new Ext.Panel({
    id:'images-view',
    frame:true,
    width:535,
    autoHeight:true,
    collapsible:true,
    layout:'fit',
    title:'Simple DataView',

    items: new Ext.DataView({
        store: store,
        tpl: tpl,
        autoHeight:true,
        multiSelect: true,
        overClass:'x-view-over',
        itemSelector:'div.thumb-wrap',
        emptyText: 'No images to display'
    })
});
panel.render(Ext.getBody());
   </code></pre>
 * @constructor
 * Create a new DataView
 * @param {Object} config The config object
 */
Ext.DataView = Ext.extend(Ext.DataPanel, {
    scroll: 'vertical',

    /**
     * @cfg {Boolean} multiSelect
     * True to allow selection of more than one item at a time, false to allow selection of only a single item
     * at a time or no selection at all, depending on the value of {@link #singleSelect} (defaults to false).
     */
    /**
     * @cfg {Boolean} singleSelect
     * True to allow selection of exactly one item at a time, false to allow no selection at all (defaults to false).
     * Note that if {@link #multiSelect} = true, this value will be ignored.
     */
    /**
     * @cfg {String} loadingText
     * A string to display during data load operations (defaults to undefined).  If specified, this text will be
     * displayed in a loading div and the view's contents will be cleared while loading, otherwise the view's
     * contents will continue to display normally until the new data is loaded and the contents are replaced.
     */
    /**
     * @cfg {String} selectedCls
     * A CSS class to apply to each selected item in the view (defaults to 'x-item-selected').
     */
    selectedCls : "x-item-selected",
    /**
     * @cfg {String} selectedCls
     * A CSS class to apply to each selected item in the view (defaults to 'x-item-selected').
     */
    pressedCls : "x-item-pressed",

    /**
     * @cfg {Number} pressedDelay
     * The amount of delay between the tapstart and the moment we add the pressedCls.
     * Settings this to true defaults to 100ms
     */
    pressedDelay: 100,

    /**
     * @cfg {String} emptyText
     * The text to display in the view when there is no data to display (defaults to '').
     */
    emptyText : "",

    /**
     * @cfg {Boolean} deferEmptyText True to defer emptyText being applied until the store's first load
     */
    deferEmptyText: true,

    // @private
    last: false,

    // @private
    initComponent: function() {
        Ext.DataView.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event itemtap
             * Fires when a node is tapped on
             * @param {Ext.DataView} this The DataView object
             * @param {Number} index The index of the item that was tapped
             * @param {Ext.Element} item The item element
             * @param {Ext.EventObject} e The event object
             */
            'itemtap',

            /**
             * @event containertap
             * Fires when a tap occurs and it is not on a template node.
             * @param {Ext.DataView} this
             * @param {Ext.EventObject} e The raw event object
             */
            "containertap",

            /**
             * @event selectionchange
             * Fires when the selected nodes change.
             * @param {Ext.DataView} this
             * @param {Array} selections Array of the selected nodes
             */
            "selectionchange",

            /**
             * @event beforeselect
             * Fires before a selection is made. If any handlers return false, the selection is cancelled.
             * @param {Ext.DataView} this
             * @param {HTMLElement} node The node to be selected
             * @param {Array} selections Array of currently selected nodes
             */
            "beforeselect"
        );

        this.selected = new Ext.CompositeElementLite();
    },

    // @private
    afterRender: function(){
        Ext.DataView.superclass.afterRender.call(this);

        this.mon(this.getTemplateTarget(), {
            tap: this.onTap,
            tapstart: this.onTapStart,
            tapcancel: this.onTapCancel,
            doubletap: this.onDoubleTap,
            scope: this
        });
    },

    /**
     * Refreshes the view by reloading the data from the store and re-rendering the template.
     */
    refresh: function() {
        if (!this.rendered) {
            return;
        }

        var el = this.getTemplateTarget();
        el.update('');

        this.clearSelections(false, true);
        if (this.store.getRange().length < 1 && (!this.deferEmptyText || this.hasSkippedEmptyText)) {
            el.update(this.emptyText);
        }
        this.hasSkippedEmptyText = true;
        Ext.DataView.superclass.refresh.call(this);
    },

    // @private
    onTap: function(e) {
        var item = e.getTarget(this.itemSelector, this.getTemplateTarget());
        if (item) {
            Ext.fly(item).removeClass(this.pressedCls);
            var index = this.indexOf(item);
            if (this.onItemTap(item, index, e) !== false) {
                e.stopEvent();
                this.fireEvent("itemtap", this, index, item, e);
            }
        }
        else {
            if(this.fireEvent("containertap", this, e) !== false) {
                this.onContainerTap(e);
            }
        }
    },

    // @private
    onTapStart: function(e, t) {
        var me = this,
            item = e.getTarget(me.itemSelector, me.getTemplateTarget());

        if (item) {
            if (me.pressedDelay) {
                if (me.pressedTimeout) {
                    clearTimeout(me.pressedTimeout);
                }
                me.pressedTimeout = setTimeout(function() {
                    Ext.fly(item).addClass(me.pressedCls);
                }, Ext.isNumber(me.pressedDelay) ? me.pressedDelay : 100);
            }
            else {
                Ext.fly(item).addClass(me.pressedCls);
            }
        }
    },

    // @private
    onTapCancel: function(e, t) {
        var me = this,
            item = e.getTarget(me.itemSelector, me.getTemplateTarget());

        if (me.pressedTimeout) {
            clearTimeout(me.pressedTimeout);
            delete me.pressedTimeout;
        }

        if (item) {
            Ext.fly(item).removeClass(me.pressedCls);
        }
    },

    // @private
    onContainerTap: function(e) {
        this.clearSelections();
    },

    // @private
    onDoubleTap: function(e) {
        var item = e.getTarget(this.itemSelector, this.getTemplateTarget());
        if (item) {
            this.fireEvent("itemdoubletap", this, this.indexOf(item), item, e);
        }
    },

    // @private
    onItemTap: function(item, index, e) {
        if (this.pressedTimeout) {
            clearTimeout(this.pressedTimeout);
            delete this.pressedTimeout;
        }

        if (this.multiSelect) {
            this.doMultiSelection(item, index, e);
            e.preventDefault();
        }
        else if (this.singleSelect) {
            this.doSingleSelection(item, index, e);
            e.preventDefault();
        }
        return true;
    },

    // @private
    doSingleSelection: function(item, index, e) {
        if (this.isSelected(index)) {
            this.deselect(index);
        }
        else {
            this.select(index, false);
        }
    },

    // @private
    doMultiSelection: function(item, index, e) {
        if (this.isSelected(index)) {
            this.deselect(index);
        }
        else {
            this.select(index, true);
        }
    },

    /**
     * Gets the number of selected nodes.
     * @return {Number} The node count
     */
    getSelectionCount: function() {
        return this.selected.getCount();
    },

    /**
     * Gets the currently selected nodes.
     * @return {Array} An array of HTMLElements
     */
    getSelectedNodes: function() {
        return this.selected.elements;
    },

    /**
     * Gets the indexes of the selected nodes.
     * @return {Array} An array of numeric indexes
     */
    getSelectedIndexes: function() {
        var indexes = [],
            s = this.selected.elements,
            len = s.length,
            i;
        for (i = 0; i < len; i++) {
            indexes.push(s[i].viewIndex);
        }
        return indexes;
    },

    /**
     * Gets an array of the selected records
     * @return {Array} An array of {@link Ext.data.Model} objects
     */
    getSelectedRecords: function() {
        var r = [],
            s = this.selected.elements,
            len = s.length,
            i;
        for (i = 0; i < len; i++) {
            r[r.length] = this.store.getAt(s[i].viewIndex);
        }
        return r;
    },

    /**
     * Clears all selections.
     * @param {Boolean} suppressEvent (optional) True to skip firing of the selectionchange event
     */
    clearSelections: function(suppressEvent, skipUpdate) {
        if ((this.multiSelect || this.singleSelect) && this.selected.getCount() > 0) {
            if (!skipUpdate) {
                this.selected.removeClass(this.selectedCls);
            }
            this.selected.clear();
            this.last = false;
            if (!suppressEvent) {
                this.fireEvent("selectionchange", this, this.selected.elements, this.getSelectedRecords());
            }
        }
    },

    /**
     * Returns true if the passed node is selected, else false.
     * @param {HTMLElement/Number/Ext.data.Model} node The node, node index or record to check
     * @return {Boolean} True if selected, else false
     */
    isSelected: function(node) {
        return this.selected.contains(this.getNode(node));
    },

    /**
     * Deselects a node.
     * @param {HTMLElement/Number/Record} node The node, node index or record to deselect
     */
    deselect: function(node) {
        if (this.isSelected(node)) {
            node = this.getNode(node);
            this.selected.removeElement(node);
            if (this.last == node.viewIndex) {
                this.last = false;
            }
            Ext.fly(node).removeClass(this.selectedCls);
            this.fireEvent("selectionchange", this, this.selected.elements, []);
        }
    },

    /**
     * Selects a set of nodes.
     * @param {Array/HTMLElement/String/Number/Ext.data.Model} nodeInfo An HTMLElement template node, index of a template node,
     * id of a template node, record associated with a node or an array of any of those to select
     * @param {Boolean} keepExisting (optional) true to keep existing selections
     * @param {Boolean} suppressEvent (optional) true to skip firing of the selectionchange vent
     */
    select: function(nodeInfo, keepExisting, suppressEvent) {
        if (Ext.isArray(nodeInfo)) {
            if(!keepExisting){
                this.clearSelections(true);
            }
            for (var i = 0, len = nodeInfo.length; i < len; i++) {
                this.select(nodeInfo[i], true, true);
            }
            if (!suppressEvent) {
                this.fireEvent("selectionchange", this, this.selected.elements, this.getSelectedRecords());
            }
        } else{
            var node = this.getNode(nodeInfo);
            if (!keepExisting) {
                this.clearSelections(true);
            }
            if (node && !this.isSelected(node)) {
                if (this.fireEvent("beforeselect", this, node, this.selected.elements) !== false) {
                    Ext.fly(node).addClass(this.selectedCls);
                    this.selected.add(node);
                    this.last = node.viewIndex;
                    if (!suppressEvent) {
                        this.fireEvent("selectionchange", this, this.selected.elements, this.getSelectedRecords());
                    }
                }
            }
        }
    },

    /**
     * Selects a range of nodes. All nodes between start and end are selected.
     * @param {Number} start The index of the first node in the range
     * @param {Number} end The index of the last node in the range
     * @param {Boolean} keepExisting (optional) True to retain existing selections
     */
    selectRange: function(start, end, keepExisting) {
        if (!keepExisting) {
            this.clearSelections(true);
        }
        this.select(this.getNodes(start, end), true);
    },

    // @private
    onBeforeLoad: function() {
        if (this.loadingText) {
            this.clearSelections(false, true);
            this.getTemplateTarget().update('<div class="loading-indicator">'+this.loadingText+'</div>');
            this.all.clear();
        }
    },

    // @private
    onDestroy: function() {
        this.selected.clear();
        Ext.DataView.superclass.onDestroy.call(this);
    }
});

/**
 * Changes the data store bound to this view and refreshes it. (deprecated in favor of bindStore)
 * @param {Store} store The store to bind to this view
 */
Ext.DataView.prototype.setStore = Ext.DataView.prototype.bindStore;

Ext.reg('dataview', Ext.DataView);

/**
 * @class Ext.List
 * @extends Ext.DataView
 * @xtype list
 * A mechanism for displaying data using a list layout template. List uses an {@link Ext.XTemplate}
 * as its internal templating mechanism, and is bound to an {@link Ext.data.Store}
 * so that as the data in the store changes the view is automatically updated to reflect the changes.  The view also
 * provides built-in behavior for many common events that can occur for its contained items including itemtap, containertap,
 * etc. as well as a built-in selection model. <b>In order to use these features, an {@link #itemSelector}
 * config must be provided for the DataView to determine what nodes it will be working with.</b>
 * @constructor
 * Create a new List
 * @param {Object} config The config object
 */
Ext.List = Ext.extend(Ext.DataView, {
    cmpCls: 'x-list',

    pinHeaders: true,

    /**
     * @cfg {Boolean/Object} indexBar
     * True to render an alphabet IndexBar docked on the right.
     * This can also be a config object that will be passed to {@link Ext.IndexBar}
     * (defaults to false)
     */
    indexBar: false,

    /**
     * @cfg {Boolean} grouped
     * True to group the list items together by first letter (defaults to false).
     */
    grouped: false,

    groupTpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<div class="x-list-group x-group-{id}">',
                '<h3>{group}</h3>',
                '<div class="x-list-group-items">',
                    '{items}',
                '</div>',
            '</div>',
        '</tpl>',
        {compile: true}
    ),

    // @private
    initComponent : function() {
        if (this.scroll !== false) {
            this.scroll = {
                direction: 'vertical',
                scrollbars: false
            };
        }

        if (Ext.platform.isAndroidOS && this.initialConfig.pinHeaders === undefined) {
            this.pinHeaders = false;
        }

        if (this.grouped) {
            this.itemTpl = this.tpl;
            if (Ext.isString(this.itemTpl) || Ext.isArray(this.itemTpl)) {
                this.itemTpl = new Ext.XTemplate(this.itemTpl);
            }
            this.tpl = this.groupTpl;
        }
        else {
            this.indexBar = false;
        }

        if (this.indexBar) {
            var indexBarConfig = Ext.apply({}, Ext.isObject(this.indexBar) ? this.indexBar : {}, {
                xtype: 'indexbar',
                dock: 'right',
                overlay: true,
                alphabet: true
            });
            this.indexBar = new Ext.IndexBar(indexBarConfig);
            this.dockedItems = this.dockedItems || [];
            this.dockedItems.push(this.indexBar);
        } else if (this.scroll) {
            this.scroll.scrollbars = true;
        }

        Ext.List.superclass.initComponent.call(this);

        this.on('deactivate', this.onDeactivate, this);
    },

    // @private
    onDeactivate : function() {
        this.clearSelections();
    },

    // @private
    afterRender : function() {
        Ext.List.superclass.afterRender.call(this);
        if (!this.grouped) {
            this.el.addClass('x-list-flat');
        }

        this.getTemplateTarget().addClass('x-list-parent');
    },

    // @private
    initEvents : function() {
        Ext.List.superclass.initEvents.call(this);

        if (this.pinHeaders && this.scroll) {
            this.mon(this.scroller, {
                scrollstart: this.onScrollStart,
                scroll: this.onScroll,
                scope: this
            });
        }

        if (this.indexBar) {
            this.mon(this.indexBar, {
                index: this.onIndex,
                scope: this
            });
        }

        this.pageBox = this.body.getPageBox();
    },

    // @private
    onScrollStart : function() {
        this.pageBox = this.body.getPageBox();
    },

    // @private
    onScroll : function(scroller, pos, options) {
        var node = this.getActiveGroupNode();
        if (!node) {
            return;
        }

        var header = node.down('h3'),
            headerY, next;

        if (this.activeHeader != header) {
            if (this.activeHeader) {
                this.activeHeader.setStyle('-webkit-transform', 'translate3d(0px, 0px, 0px)');
            }
            next = node.next();
            this.nextGroupY = next ? (next.dom.offsetTop - header.dom.offsetHeight) : null;
            this.activeOffsetY = header.dom.offsetTop;
            this.activeHeader = header;
        }

        headerY = ((-1 * pos.y) - this.activeOffsetY);
        if (this.nextGroupY && -1 * pos.y >= this.nextGroupY) {
            headerY -= (-1 * pos.y - this.nextGroupY);
        }

        if (headerY != 0) {
            header.setStyle('-webkit-transform', 'translate3d(0, ' + headerY + 'px, 0)');
        }
    },

    // @private
    onIndex : function(record, target, index) {
        var key = record.get('key').toLowerCase(),
            groups = this.store.getGroups(),
            ln = groups.length,
            group, i, closest;

        for (i = 0; i < ln; i++) {
            group = groups[i].name.toLowerCase();
            if (group === key || group > key) {
                closest = group;
                break;
            }
            else {
                closest = group;
            }
        }

        closest = this.body.down('.x-group-' + closest);
        if (closest) {
            this.scroller.scrollTo({x: 0, y: closest.getOffsetsTo(this.scrollEl)[1]}, false, null, true);
        }
    },

    // @private
    getActiveGroupNode : function() {
        var x = this.pageBox.left + (this.pageBox.width / 2),
            y = this.pageBox.top + 0,
            target = Ext.Element.fromPoint(x, y);
        return target.findParent('.x-list-group', null, true);
    },

    // @private
    collectData : function(records, startIndex) {
        // true to suppress event
        this.store.sort(null, null, true);

        if (!this.grouped) {
            return Ext.List.superclass.collectData.call(this, records, startIndex);
        }

        var results = [],
            groups = this.store.getGroups(),
            ln = groups.length,
            children, cln, c,
            group, i;

        for (i = 0, ln = groups.length; i < ln; i++) {
            group = groups[i];
            children = group.children;
            for (c = 0, cln = children.length; c < cln; c++) {
                children[c] = children[c].data;                
            }
            results.push({
                group: group.name,
                id: group.name.toLowerCase(),
                items: this.itemTpl.apply(children)
            });
        }

        return results;
    },

    // Because the groups might change by an update/add/remove we refresh the whole dataview
    // in each one of them

    // @private
    onUpdate : function(ds, record) {
        this.refresh();
    },

    // @private
    onAdd : function(ds, records, index) {
        this.refresh();
    },

    // @private
    onRemove : function(ds, record, index) {
        this.refresh();
    }
});

Ext.reg('list', Ext.List);

Ext.IndexBar = Ext.extend(Ext.DataPanel, {
    cmpCls: 'x-indexbar',
    direction: 'vertical',
    tpl: '<tpl for="."><span class="x-indexbar-item">{value}</span></tpl>',
    itemSelector: 'span.x-indexbar-item',

    // @private
    initComponent : function() {
        // No docking and no sizing of body!
        this.componentLayout = new Ext.layout.AutoComponentLayout();

        if (!this.store) {
            this.store = new Ext.data.Store({
                model: 'IndexBarModel'
            });
        }

        if (this.alphabet == true) {
            this.ui = this.ui || 'alphabet';
        }

        if (this.direction == 'horizontal') {
            this.horizontal = true;
        }
        else {
            this.vertical = true;
        }

        this.addEvents('index');

        Ext.IndexBar.superclass.initComponent.call(this);
    },

    // @private
    afterRender : function() {
        Ext.IndexBar.superclass.afterRender.call(this);

        if (this.alphabet === true) {
            this.loadAlphabet();
        }

        if (this.vertical) {
            this.el.addClass(this.cmpCls + '-vertical');
        }
        else if (this.horizontal) {
            this.el.addClass(this.cmpCls + '-horizontal');
        }
    },

    // @private
    loadAlphabet : function() {
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            ln = letters.length,
            data = [],
            i, letter;

        for (i = 0; i < ln; i++) {
            letter = letters[i];
            data.push({key: letter.toLowerCase(), value: letter});
        }

        this.store.loadData(data);
    },

    // @private
    initEvents : function() {
        Ext.IndexBar.superclass.initEvents.call(this);

        this.mon(this.body, {
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            touchmove: this.onTouchMove,
            scope: this
        });
    },

    // @private
    onTouchStart : function(e, t) {
        this.el.addClass(this.cmpCls + '-pressed');
        this.pageBox = this.body.getPageBox();
        this.onTouchMove(e);
    },

    // @private
    onTouchEnd : function(e, t) {
        this.el.removeClass(this.cmpCls + '-pressed');
    },

    // @private
    onTouchMove : function(e) {
        var target,
            me = this,
            record,
            pageBox = me.pageBox;

        if (!pageBox) {
            pageBox = me.pageBox = me.body.getPageBox();
        }

        if (me.vertical) {
            if (e.pageY > pageBox.bottom || e.pageY < pageBox.top) {
                return;
            }
            target = Ext.Element.fromPoint(pageBox.left + (pageBox.width / 2), e.pageY);
        }
        else if (me.horizontal) {
            if (e.pageX > pageBox.right || e.pageX < pageBox.left) {
                return;
            }
            target = Ext.Element.fromPoint(e.pageX, pageBox.top + (pageBox.height / 2));
        }

        if (target) {
            record = me.getRecord(target.dom);
            if (record) {
                me.fireEvent('index', record, target, me.indexOf(target));
            }
        }
    }
});

Ext.reg('indexbar', Ext.IndexBar);

Ext.regModel('IndexBarModel', {
    fields: ['key', 'value']
});

/**
 * @class Ext.Toolbar
 * @extends Ext.Container
 *
 * Toolbars are most commonly used as dockedItems within an Ext.Panel. They can
 * be docked at the 'top' or 'bottom' of a Panel by specifying the dock config.
 *
 * The defaultType of Toolbar's is 'button'.
 *
 * <pre><code>
var myToolbar = new Ext.Toolbar({
    dock: 'top',
    title: 'My Toolbar',
    items: [{
        text: 'My Button'
    }]
});

var myPanel = new Ext.Panel({
    dockedItems: [myToolbar],
    fullscreen: true,
    html: 'Test Panel'
});</code></pre>
 * @xtype toolbar
 */
Ext.Toolbar = Ext.extend(Ext.Container, {
    /**
     * @cfg {xtype} defaultType
     * The default xtype to create. (Defaults to 'button')
     */
    defaultType: 'button',

    /**
     * @cfg {String} baseCls
     * The base CSS class to apply to the Carousel's element (defaults to <code>'x-toolbar'</code>).
     */
    baseCls: 'x-toolbar',

    /**
     * @cfg {String} titleCls
     * The CSS class to apply to the titleEl (defaults to <code>'x-toolbar-title'</code>).
     */
    titleCls: 'x-toolbar-title',

    /**
     * @cfg {String} ui
     * Style options for Toolbar. Default is 'dark'. 'light' and 'metal' also available.
     */
    ui: null,

    /**
     * @cfg {Object} layout (optional)
     * A layout config object. A string is NOT supported here.
     */
    layout: null,

    /**
     * @cfg {String} title (optional)
     * The title of the Toolbar.
     */

    // properties

    /**
     * The title Element
     * @property titleEl
     * @type Ext.Element
     */
    titleEl: null,

    initComponent : function() {
        this.layout = Ext.apply({}, this.layout || {}, {
            type: 'hbox',
            align: 'center'
        });
        Ext.Toolbar.superclass.initComponent.call(this);
    },

    afterRender : function() {
        Ext.Toolbar.superclass.afterRender.call(this);

        if (this.title) {
            this.titleEl = this.el.createChild({
                cls: this.titleCls,
                html: this.title
            });
        }
    },

    /**
     * Set the title of the Toolbar
     * @param title {String} This can be arbitrary HTML.
     */
    setTitle : function(title) {
        this.title = title;
        if (this.rendered) {
            if (!this.titleEl) {
                this.titleEl = this.el.createChild({
                    cls: this.titleCls,
                    html: this.title
                });
            }
            this.titleEl.setHTML(title);
        }
    },

    /**
     * Show the title if it exists.
     */
    showTitle : function() {
        if (this.titleEl) {
            this.titleEl.show();
        }
    },

    /**
     * Hide the title if it exists.
     */
    hideTitle : function() {
        if (this.titleEl) {
            this.titleEl.hide();
        }
    }
});

Ext.reg('toolbar', Ext.Toolbar);


/**
 * @class Ext.Spacer
 * @extends Ext.Component
 * @xtype spacer
 *
 * By default the spacer component will take up a flex of 1 unless a width is
 * set.
 */
Ext.Spacer = Ext.extend(Ext.Component, {

    initComponent : function() {
        if (!this.width) {
            this.flex = 1;
        }

        Ext.Spacer.superclass.initComponent.call(this);
    },

    onRender : function() {
        Ext.Spacer.superclass.onRender.apply(this, arguments);

        if (this.flex) {
            this.el.setStyle('-webkit-box-flex', this.flex);
        }
    }
});

Ext.reg('spacer', Ext.Spacer);
/**
 * @class Ext.TabBar
 * @extends Ext.Panel
 * @xtype tabbar
 */
Ext.TabBar = Ext.extend(Ext.Panel, {
    cmpCls: 'x-tabbar',

    /**
     * @type {Ext.Tab}
     * Read-only property of the currently active tab.
     */
    activeTab: null,

    // @private
    defaultType: 'tab',

    /**
     * @cfg {Boolean} sortable
     * Enable sorting functionality for the TabBar.
     */
    sortable: false,

    /**
     * @cfg {Number} sortHoldThreshold
     * Duration in milliseconds that a user must hold a tab
     * before dragging. The sortable configuration must be set for this setting
     * to be used.
     */
    sortHoldThreshold: 350,

    // @private
    initComponent : function() {
        /**
         * @event change
         * @param {Ext.TabBar} this
         * @param {Ext.Tab} tab The Tab button
         * @param {Ext.Component} card The component that has been activated
         */
        this.addEvents('change');

        this.layout = Ext.apply({}, this.layout || {}, {
            type: 'hbox',
            align: 'middle'
        });

        Ext.TabBar.superclass.initComponent.call(this);

        var cardLayout = this.cardLayout;
        if (cardLayout) {
            this.cardLayout = null;
            this.setCardLayout(cardLayout);
        }
    },

    // @private
    initEvents : function() {
        if (this.sortable) {
            this.sortable = new Ext.util.Sortable(this.el, {
                itemSelector: '.x-tab',
                direction: 'horizontal',
                delay: this.sortHoldThreshold,
                constrain: true
            });
            this.mon(this.sortable, 'sortchange', this.onSortChange, this);
        }

        this.mon(this.el, {
            tap: this.onTap,
            scope: this
        });

        Ext.TabBar.superclass.initEvents.call(this);
    },

    // @private
    onTap : function(e, t) {
        t = e.getTarget('.x-tab');
        if (t) {
            this.onTabTap(Ext.getCmp(t.id));
        }
    },

    // @private
    onSortChange : function(sortable, el, index) {
    },

    // @private
    onTabTap : function(tab) {
        this.activeTab = tab;
        if (this.cardLayout) {
            this.cardLayout.setActiveItem(tab.card);
        }
        this.fireEvent('change', this, tab, tab.card);
    },

    // @private
    setCardLayout : function(layout) {
        if (this.cardLayout) {
            this.mun(this.cardLayout.owner, {
                add: this.onCardAdd,
                remove: this.onCardRemove,
                scope: this
            });
        }
        this.cardLayout = layout;
        if (layout) {
            this.mon(layout.owner, {
                add: this.onCardAdd,
                remove: this.onCardRemove,
                scope: this
            });
        }
    },

    // @private
    onCardAdd : function(panel, card) {
        this.add({
            xtype: 'tab',
            card: card
        });
    },

    // @private
    onCardRemove : function(panel, card) {
        var items = this.items.items,
            ln = items.length,
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.card === card) {
                this.remove(item, true);
                return;
            }
        }
    },

    getCardLayout : function() {
        return this.cardLayout;
    }
});

Ext.reg('tabbar', Ext.TabBar);


/**
 * @class Ext.Tab
 * @extends Ext.Button
 * @xtype tab
 */
Ext.Tab = Ext.extend(Ext.Button, {
    /**
     * @type {Boolean}
     * Set to true if this button is an Ext.Tab
     */
    isTab: true,
    baseCls: 'x-tab',

    /**
     * @cfg {String} pressedCls
     * The CSS class to be applied to a Tab when it is pressed. Defaults to 'x-tab-pressed'.
     * Providing your own CSS for this class enables you to customize the pressed state.
     */
    pressedCls: 'x-tab-pressed',

    /**
     * @cfg {String} activeCls
     * The CSS class to be applied to a Tab when it is active. Defaults to 'x-tab-active'.
     * Providing your own CSS for this class enables you to customize the active state.
     */
    activeCls: 'x-tab-active',

    // @private
    initComponent : function() {
        this.addEvents(
            /**
             * @event activate
             * @param {Ext.Tab} this
             */
            'activate',
            /**
             * @event deactivate
             * @param {Ext.Tab} this
             */
            'deactivate'
        );

        Ext.Tab.superclass.initComponent.call(this);

        var card = this.card;
        if (card) {
            this.card = null;
            this.setCard(card);
        }
    },

    /**
     * Sets the card associated with this tab
     */
    setCard : function(card) {
        if (this.card) {
            this.mun(this.card, {
                activate: this.activate,
                deactivate: this.deactivate,
                scope: this
            });
        }
        this.card = card;
        if (card) {
            Ext.apply(this, card.tab || {});
            this.setText(this.title || card.title || this.text );
            this.setIconClass(this.iconCls || card.iconCls);
            this.setBadge(this.badgeText || card.badgeText);

            this.mon(card, {
                beforeactivate: this.activate,
                beforedeactivate: this.deactivate,
                scope: this
            });
        }
    },

    /**
     * Retrieves a reference to the card associated with this tab
     * @returns {Mixed} card
     */
    getCard : function() {
        return this.card;
    },

    // @private
    activate : function() {
        this.el.addClass(this.activeCls);
        this.fireEvent('activate', this);
    },

    // @private
    deactivate : function() {
        this.el.removeClass(this.activeCls);
        this.fireEvent('deactivate', this);
    }
});

Ext.reg('tab', Ext.Tab);

/**
 * @class Ext.TabPanel
 * @extends Ext.Panel
 * @xtype tabpanel
 *
 * TabPanel is a Container which can hold other components to be accessed in a tabbed
 * interface.
 *
 * <pre><code>
new Ext.TabPanel({
    fullscreen: true,
    ui: 'dark',
    sortable: true,
    items: [{
        title: 'Tab 1',
        html: '1',
        cls: 'card1'
    }, {
        title: 'Tab 2',
        html: '2',
        cls: 'card2'
    }, {
        title: 'Tab 3',
        html: '3',
        cls: 'card3'
    }]
});</code></pre>
 */
Ext.TabPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String} animation
     * Animation to be used during transitions of cards.
     * Any valid value from Ext.anims can be used ('fade', 'slide', 'flip', 'cube', 'pop', 'wipe').
     * Defaults to null.
     */
    animation: null,

    /**
     * @cfg {String} tabBarPosition
     * Where to dock the Ext.TabPanel. Valid values are 'top' and 'bottom'.
     */
    tabBarPosition: 'top',
    cmpCls: 'x-tabpanel',

    /**
     * @cfg {String} ui
     * Defaults to 'dark'.
     */
    ui: 'dark',

    /**
     * @cfg {Object} layout
     * @hide
     */

    /**
     * @cfg {Object} tabBar
     * An Ext.TabBar configuration
     */

    /**
     * @cfg {Boolean} sortable
     * Enable sorting functionality for the TabBar.
     */

    // @private
    initComponent : function() {
        var layout = new Ext.layout.CardLayout();
        this.layout = null;
        this.setLayout(layout);

        this.tabBar = new Ext.TabBar(Ext.apply({}, this.tabBar || {}, {
            cardLayout: layout,
            animation: this.animation,
            dock: this.tabBarPosition,
            ui: this.ui,
            sortable: this.sortable
        }));

        if (this.dockedItems && !Ext.isArray(this.dockedItems)) {
            this.dockedItems = [this.dockedItems];
        }
        else if (!this.dockedItems) {
            this.dockedItems = [];
        }
        this.dockedItems.push(this.tabBar);

        Ext.TabPanel.superclass.initComponent.call(this);
    },

    /**
     * Retrieves a reference to the Ext.TabBar associated with the TabPanel.
     * @returns {Ext.TabBar} tabBar
     */
    getTabBar : function() {
        return this.tabBar;
    },
    
    afterLayout : function() {
        Ext.TabPanel.superclass.afterLayout.call(this);
        this.getTabBar().doLayout();
    }
});

Ext.reg('tabpanel', Ext.TabPanel);

/**
 * @class Ext.Carousel
 * @extends Ext.Panel
 * @xtype carousel
 *
 * A customized Panel which provides the ability to slide back and forth between
 * different child items.
 *
 * <pre><code>
var carousel = new Ext.Carousel({
   items: [{
       html: '&lt;h1&gt;Carousel&lt;/h1&gt;',
       cls: 'card1'
   }, {
       title: 'Tab 2',
       html: '2',
       cls: 'card2'
   }, {
       title: 'Tab 3',
       html: '3',
       cls: 'card3'
   }]
});</code></pre>
 */
Ext.Carousel = Ext.extend(Ext.Panel, {
    /**
     * @constructor
     * @param {Object} config
     * Create a new Ext.Carousel
     */

    /**
     * @cfg {String} baseCls
     * The base CSS class to apply to the Carousel's element (defaults to <code>'x-carousel'</code>).
     */
    cmpCls: 'x-carousel',

    /**
     * @cfg {Boolean} indicator
     * Provides an indicator while toggling between child items to let the user
     * know where they are in the card stack.
     */
    indicator: true,

    /**
     * @cfg {String} ui
     * Style options for Carousel. Default is 'dark'. 'light' also available.
     */
    ui: null,

    /**
     * @cfg {String} direction
     * The direction of the Carousel. Default is 'horizontal'. 'vertical' also available.
     */
    direction: 'horizontal',

    /**
     * @cfg {String} layout @hide
     */

    // @private
    initComponent: function() {
        this.layout = {
            type: 'card',
            hideInactive: false,
            sizeAllCardsOnLayout: true,
            extraCls: 'x-carousel-item',
            targetCls: 'x-carousel-scroller'
        };

        this.scroll = {
            scrollbars: false,
            bounces: true,
            momentum: false,
            horizontal: this.direction == 'horizontal' ? true : false,
            vertical: this.direction == 'horizontal' ? false : true
        };
         
        if (this.indicator) {
            var cfg = Ext.isObject(this.indicator) ? this.indicator : {};
            this.indicator = new Ext.Carousel.Indicator(Ext.apply({}, cfg, {
                direction: this.direction,
                carousel: this,
                ui: this.ui
            }));
        }

        Ext.Carousel.superclass.initComponent.call(this);

        this.on('cardswitch', this.onCardSwitch, this);
    },

    // @private
    afterRender: function() {
        Ext.Carousel.superclass.afterRender.call(this);

        this.scroller.on({
            touchend: this.onTouchEnd,
            scope: this
        });
        
        this.el.addClass(this.cmpCls + '-' + this.direction);
    },

    onCardSwitch : function(card) {
        var cardPos = {x: 0, y: 0};
        if (this.direction == 'horizontal') {
            cardPos.x = card.el.dom.offsetLeft;
        }
        else {
            cardPos.y = card.el.dom.offsetTop;
        }
        
        this.scroller.scrollTo(cardPos, 250, 'ease-out');
    },

    /**
     * Switches the next card
     */
    next: function() {
        return this.layout.next();
    },

    /**
     * Switches the previous card
     */
    prev: function() {
        return this.layout.prev();
    },

    getActiveItemOffset : function() {
        var activeItem = this.layout.getActiveItem();
        if (activeItem) {
            return activeItem.el.dom[this.direction == 'horizontal' ? 'offsetLeft' : 'offsetTop'];
        }
    },

    // @private
    onTouchEnd: function(e, scroller) {
        var activeOffset = -this.getActiveItemOffset(),
            previousDelta, deltaOffset, activePos; 

        if (this.direction == 'horizontal') {
            deltaOffset = scroller.offset.x - activeOffset;
            previousDelta = e.previousDeltaX;
            activePos = {x: -activeOffset, y: 0};
        }
        else {
            deltaOffset = scroller.offset.y - activeOffset;
            previousDelta = e.previousDeltaY;
            activePos = {x: 0, y: -activeOffset};
        }
        
        // We have gone to the right
        if (deltaOffset < 0 && Math.abs(deltaOffset) > 3 && previousDelta <= 0) {
            this.next();
        }
        // We have gone to the left
        else if (deltaOffset > 0 && Math.abs(deltaOffset) > 3 && previousDelta >= 0) {
            this.prev();
        }
        else {
            this.scroller.scrollTo(activePos, 200, 'ease-out');
        }
    }
});

Ext.reg('carousel', Ext.Carousel);

/**
 * @class Ext.Carousel.Indicator
 * @extends Ext.Component
 * @xtype carouselindicator
 * @private
 *
 * A private utility class used by Ext.Carousel to create indicators.
 */
Ext.Carousel.Indicator = Ext.extend(Ext.Component, {
    baseCls: 'x-carousel-indicator',

    initComponent: function() {
        if (this.carousel.rendered) {
            this.render(this.carousel.body);
        }
        else {
            this.carousel.on('afterrender', function() {
                this.render(this.carousel.body);
            }, this, {single: true});
        }
    },

    // @private
    onRender: function() {
        Ext.Carousel.Indicator.superclass.onRender.apply(this, arguments);

        for (var i = 0, ln = this.carousel.items.length; i < ln; i++) {
            this.createIndicator();
        }

        this.mon(this.carousel, {
            cardswitch: this.onCardSwitch,
            add: this.onCardAdd,
            remove: this.onCardRemove,
            scope: this
        });

        this.mon(this.el, {
            tap: this.onTap,
            scope: this
        });

        this.onCardSwitch(null, null, this.carousel.items.indexOf(this.carousel.layout.getActiveItem()));
        
        this.el.addClass(this.baseCls + '-' + this.direction);
    },

    // @private
    onTap: function(e, t) {
        var box = this.el.getPageBox(),
            centerX = box.left + (box.width / 2);

        if (e.pageX > centerX) {
            this.carousel.next();
        }
        else {
            this.carousel.prev();
        }
    },

    // @private
    createIndicator: function() {
        this.indicators = this.indicators || [];
        this.indicators.push(this.el.createChild({
            tag: 'span'
        }));
    },

    // @private
    onCardSwitch: function(card, old, index) {
        if (Ext.isNumber(index) && this.indicators[index]) {
            this.indicators[index].radioClass('x-carousel-indicator-active');
        }
    },

    // @private
    onCardAdd: function() {
        this.createIndicator();
    },

    // @private
    onCardRemove: function() {
        this.indicators.pop().remove();
    }
});

Ext.reg('carouselindicator', Ext.Carousel.Indicator);

/**
 * @class Ext.Map
 * @extends Ext.Component
 *
 * <p>Wraps a Google Map in an Ext.Component.<br/>
 * http://code.google.com/apis/maps/documentation/v3/introduction.html</p>
 *
 * <p>To use this component you must include an additional JavaScript file from
 * Google.</p>
 *
 * <pre><code>
&lt;script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=true"&gt;&lt/script&gt;</code></pre>
 *
 * An example of using the Map component:
 * <pre><code>
var pnl = new Ext.Panel({
    fullscreen: true,
    items: [{
        xtype: 'map',
        getLocation: true
    }
});</code></pre>
 * @xtype map
 */
Ext.Map = Ext.extend(Ext.Component, {

    /**
     * @constructor
     * @param {Object} config
     * Create a new Ext.Map
     */

    /**
     * @cfg {String} baseCls
     * The base CSS class to apply to the Maps's element (defaults to <code>'x-map'</code>).
     */
    baseCls: 'x-map',

    /**
     * @cfg {Boolean} getLocation
     * Pass in true to center the map based on the geolocation coordinates.
     */
    getLocation: false,

    /**
     * @cfg {Object} mapOptions
     * MapOptions as specified by the Google Documentation:
     * http://code.google.com/apis/maps/documentation/v3/reference.html
     */

    /**
     * @type {google.maps.Map}
     * The wrapped map.
     */
    map: null,

    /**
     * @type {Ext.util.GeoLocation}
     */
    geo: null,

    maskMap: false,


    initComponent : function() {
        this.mapOptions = this.mapOptions || {};

        Ext.Map.superclass.initComponent.call(this);

        if (this.getLocation) {
            this.geo = new Ext.util.GeoLocation();
            this.geo.on('update', this.onGeoUpdate, this);
        }
        else {
            this.on({
                afterrender: this.update,
                activate: this.onUpdate,
                scope: this,
                single: true
            });
        }
    },

    onGeoUpdate : function(coords) {
        if (coords) {
            this.mapOptions.center = new google.maps.LatLng(coords.latitude, coords.longitude);
        }

        if (this.rendered) {
            this.update();
        }
        else {
            this.on('activate', this.onUpdate, this, {single: true});
        }
    },

    onUpdate : function(map, e, options) {
        this.update(options.data || null);
    },

    update : function(data) {
        var geocoder;

        if (Ext.platform.isTablet && Ext.platform.isIPhoneOS) {
            Ext.apply(this.mapOptions, {
                navigationControlOptions: {
                    style: google.maps.NavigationControlStyle.ZOOM_PAN
                }
            });
        }

        Ext.applyIf(this.mapOptions, {
            center: new google.maps.LatLng(37.381592,-122.135672), // Palo Alto
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        if (!this.hidden && this.rendered) {

            if (this.maskMap && !this.mask) {
                this.el.mask();
                this.mask=true;
            }

            if (this.map && this.el && this.el.dom && this.el.dom.firstChild) {
                Ext.fly(this.el.dom.firstChild).remove();
            }
            this.map = new google.maps.Map(this.el.dom, this.mapOptions);
        }
        else {
            this.on('activate', this.onUpdate, this, {single: true, data: data});
        }
    }
});

Ext.reg('map', Ext.Map);
/**
 * @class Ext.NestedList
 * @extends Ext.Panel
 *
 * NestedList provides a miller column interface to navigate between nested sets
 * and provide a clean interface with limited screen real-estate.
 *
 * <pre><code>
var nestedList = Ext.NestedList({
    items: [{
        text: 'Option A',
        items: [{
            text: 'Option A.1'
        },{
            text: 'Option A.2'
        }]
    },{
        text: 'Option B',
        items: [{
            text: 'Option B.1'
        },{
            text: 'Option B.2'
        }]
    },{
        text: 'Option C',
        items: [{
            text: 'Option C.1'
        },{
            text: 'Option C.2'
        }]
    }]
});</code></pre>
 *
 * @xtype nestedlist
 */
Ext.NestedList = Ext.extend(Ext.Panel, {
    cmpCls: 'x-nested-list',
    /**
     * @cfg {String} layout
     * @hide
     */
    layout: 'card',

    /**
     * @cfg {String} animation
     * Animation to be used during transitions of cards.
     * Any valid value from Ext.anims can be used ('fade', 'slide', 'flip', 'cube', 'pop', 'wipe').
     * Defaults to 'slide'.
     */
    animation: 'slide',

    /**
     * @type Ext.Button
     */
    backButton: null,

    /**
     * @cfg {Object} toolbar
     * Configuration for the Ext.Toolbar that is created within the Ext.NestedList.
     */

    initComponent : function() {
        // Add the back button
        this.backButton = new Ext.Button({
            text: 'Back',
            ui: 'back',
            handler: this.onBackTap,
            scope: this,
            hidden: true // First stack doesn't show back
        });

        if (!this.toolbar || !this.toolbar.isComponent) {
            this.toolbar = Ext.apply({}, this.toolbar || {}, {
                dock: 'top',
                xtype: 'toolbar',
                ui: 'light',
                items: []
            });
            this.toolbar.items.unshift(this.backButton);
            this.toolbar = new Ext.Toolbar(this.toolbar);

            this.dockedItems = this.dockedItems || [];
            this.dockedItems.push(this.toolbar);
        }
        else {
            this.toolbar.insert(0, this.backButton);
        }

        var list = this.items;
        this.items = null;

        Ext.NestedList.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event listchange
             * @param {Ext.NestedList} this
             * @param {Object} listitem
             */
            'listchange'
        );

        this.listIndex = 0;
        this.setList(list, true);

        this.on({
            beforeactivate: this.onBeforeActivate,
            beforedeactivate: this.onBeforeDeactivate,
            scope: this
        });
    },

    setList : function(list, init) {
        var items = init ? list : list.items;
        if (!list.isList) {
            list = new Ext.Container({
                isList: true,
                baseCls: 'x-list',
                cls: 'x-list-flat',
                defaults: {
                    xtype: 'button',
                    baseCls: 'x-list-item',
                    pressedCls: 'x-item-pressed',
                    ui: null,
                    pressedDelay: true
                },
                listeners: {
                    afterrender: function() {
                        this.getContentTarget().addClass('x-list-parent');
                    }
                },
                scroll: 'vertical',
                items: items,
                text: list.text
            });
        }

        this.lists = this.lists || [];
        if (!this.lists.contains(list)) {
            this.lists.push(this.add(list));
        }

        var isBack = (this.lists.indexOf(list) < this.lists.indexOf(this.activeItem));
        if (this.rendered) {
            this.setCard(list, init ? false : {
                type: this.animation,
                reverse: isBack
            });
        }
        this.activeItem = list;
    },

    afterRender : function() {
        Ext.NestedList.superclass.afterRender.call(this);

        this.mon(this.body, {
            tap: this.onTap,
            scope: this
        });
    },

    onTap : function(e, t) {
        t = e.getTarget('.x-list-item');
        if (t) {
            this.onItemTap(Ext.getCmp(t.id));
        }
    },

    onItemTap : function(item) {
        item.el.radioClass('x-item-selected');
        if (item.items) {
            this.backButton.show();
            this.setList(item);
            this.listIndex++;
        }
        this.fireEvent('listchange', this, item);
    },

    onBackTap : function() {
        this.listIndex--;

        var list = this.lists[this.listIndex];

        if (this.listIndex === 0) {
            this.backButton.hide();
        }

        this.activeItem.on('deactivate', function(item) {
            this.lists.remove(item);
            item.destroy();
        }, this, {single: true});

        this.setList(list);

        var me = this;
        setTimeout(function() {
            list.el.select('.x-item-selected').removeClass('x-item-selected');
        }, 500);

        this.fireEvent('listchange', this, list);
    },

    onBeforeDeactivate : function() {
        this.backButton.hide();
        this.toolbar.doLayout();
        this.initialActivate = true;
    },

    onBeforeActivate : function() {
        if (this.initialActivate && this.listIndex !== 0) {
            this.backButton.show();
            this.toolbar.doLayout();
        }
        var me = this;
        setTimeout(function() {
            me.activeItem.el.select('.x-item-selected').removeClass('x-item-selected');
        }, 500);
    }
});
Ext.reg('nestedlist', Ext.NestedList);

Ext.regModel("KeyValueModel", {
    fields: [{
        name: "key",
        type: "string"
    },{
        name: "value",
        type: "auto"
    }]
});

/**
 * @class Ext.Picker
 * @extends Ext.Component
 * @xtype picker
 *
 * A general picker class.  Slots are used to organize multiple scrollable slots into a single picker
 * See also: {@link Ext.DatePicker}
 */
Ext.Picker = Ext.extend(Ext.Panel, {
    cmpCls: 'x-picker',

    centered: true,

    /**
     * @cfg {String} displayField
     */
    displayField: 'key',

    /**
     * @cfg {String} valueField
     */
    valueField: 'value',

    /**
     * @cfg {Boolean} useTitles
     * Generate a title header for each individual slot and use
     * the title configuration of the slot.
     */
    useTitles: true,

    /**
     * @cfg {String} activeCls
     * CSS class to be applied to individual list items when they have
     * been chosen.
     */
    activeCls: 'x-picker-active-item',

    /**
     * @cfg {Number} rowHeight
     * The row height of individual items in the slots. This will automatically be calculated if not
     * specified.
     */
    rowHeight: false,

    /**
     * @cfg {String} align
     * Text alignment of the slots.
     */
    align: 'left',

    /**
     * @cfg {Array} slots
     * An array of slot configurations.
     * <ul>
     *  <li>name - {String} - Name of the slot</li>
     *  <li>align - {String} - Alignment of the slot. left, right, or center</li>
     *  <li>items - {Array} - An array of key/value pairs in the format {key: 'myKey', value: 'myValue'}</li>
     *  <li>title - {String} - Title of the slot. This is used in conjunction with useTitles: true.</li>
     * </ul>
     */

    pickerItemCls: 'li.x-picker-item',

    chosenCls: 'x-picker-chosen-item',
    model: 'KeyValueModel',

    initComponent : function() {
        var items = [],
            i,
            slot,
            slotItem,
            ln;

        this.layout = {
            type: 'hbox',
            align: 'stretch'
        };

        for (i = 0, ln = this.slots.length; i < ln; i++) {
            slot = this.slots[i];
            slotItem = {
                xtype: 'dataview',
                itemSelector: this.pickerItemCls,
                isSlot: true,
                flex: 1,
                listeners: {
                    itemtap: this.onItemTap,
                    scope: this
                },
                scroll: {
                    direction: 'vertical',
                    scrollbars: false,
                    snap: true,
                    friction: 0.5,
                    // store the index that this scroller
                    // is associated with
                    index: i,
                    listeners: {
                        scrollend: this.onScrollEnd,
                        scope: this
                    }
                },
                tpl: '<ul class="x-picker-{align}"><tpl for="."><li class="x-picker-item {cls} <tpl if="extra">x-picker-invalid</tpl>">{' + this.displayField + '}</li></tpl></ul>',
                store: new Ext.data.Store({
                    model: this.model,
                    data: slot.items
                })
            };


            if (this.useTitles) {
                slotItem.dockedItems = [{
                    xtype: 'toolbar',
                    dock: 'top',
                    title: slot.title || slot.text
                }];
            }

            items.push(slotItem);
        }

        this.items = items;
        this.activeEls = [];
        this.lastEls = [];

        Ext.Picker.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event pick
             * @param {Ext.Picker} this
             * @param {String} name The name of the slot that was just changed.
             * @param {Mixed} value The value that the slot was just changed to.
             * @param {Mixed} oldValue The previous value that the slot was at.
             * @param {Ext.data.Record} The backing record of the current value.
             */
            'pick'
        );
    },

    // @private
    getSelectedEls: function() {
        var el,
            xy,
            result,
            results = [],
            i = 0,
            ln = this.slots.length,
            closestValidItem = this.pickerItemCls+":not(.x-picker-invalid)";

        for (; i < ln; i++) {
            el = this.activeEls[i];
            xy = el.getXY();
            xy[0] += (el.getWidth() / 2);
            xy[1] += (el.getHeight() / 2);
            el.hide();

            result = document.elementFromPoint(xy[0], xy[1]);
            if (result.innerText === "") {
                var resultEl = Ext.fly(result).next(closestValidItem) || Ext.fly(result).prev(closestValidItem);
                if (resultEl) {
                    result = resultEl.dom;
                    this.scrollToNode(this.items.itemAt(i), result);
                }
            }

            results.push(result);
            el.show();
        }
        this.lastEls = results;
        return results;
    },

    /**
     * Gets the current value as an Object of name/value pairs using the slot names
     * @return {Object} vals
     */
    getValue: function() {
        var vals = {},
            els = this.getSelectedEls(),
            i,
            name,
            r,
            ln;

        for (i = 0, ln = els.length; i < ln; i++) {
            if (Ext.DomQuery.is(els[i], this.pickerItemCls)) {
                name = this.slots[i].name || Ext.id();
                r = this.items.itemAt(i).getRecord(els[i]);
                vals[name] = r.get(this.valueField);
            }
        }
        return vals;
    },

    // @private
    scrollToNode: function(dv, n, animate) {
        var xy = Ext.fly(n).getOffsetsTo(dv.body),
            itemIndex = this.items.indexOf(dv);

        if (animate !== false) {
            animate = true;
        }

        dv.scroller.scrollTo({
            x: 0,
            y: (-xy[1] + this.activeEls[itemIndex].getTop())
        }, animate ? 200 : false);
    },

    // @private
    onItemTap: function(dv, idx, n) {
        this.scrollToNode(dv, n);
    },

    // @private
    afterLayout: function() {
        Ext.Picker.superclass.afterLayout.apply(this, arguments);

        if (this.initialized) {
            return;
        }

        if (!this.rowHeight) {
            var aRow = this.el.down(this.pickerItemCls);
            var rowHeight = aRow.getHeight();
            this.rowHeight = rowHeight;
            this.items.each(function(item) {
                if (item.scroller) {
                    item.scroller.snap = rowHeight;
                }
            });
        }

        var innerHeight,
            maxRows,
            targetRowIdx,
            afterRows,
            lessThanHalf,
            skip,
            loopTo,
            i,
            j,
            slotsLn = this.slots.length,
            slot,
            slotItems,
            subChosenEl,
            bd = this.items.itemAt(0).body;

        innerHeight = bd.getHeight();
        maxRows = Math.ceil(innerHeight / this.rowHeight);
        targetRowIdx = Math.max((Math.floor(maxRows / 2)) - 1, 1);

        afterRows = (innerHeight / this.rowHeight) - targetRowIdx - 1;
        lessThanHalf = Math.floor(afterRows) + 0.5 > afterRows;
        skip = lessThanHalf ? 0 : -1;

        loopTo = Math.floor(innerHeight/ this.rowHeight);
        for (i = 0; i < slotsLn; i++) {
            slot = this.slots[i];
            var ds = this.items.itemAt(i).store;

            slotItems = slot.items;
            for (j = 0; j < loopTo; j++) {
                if (j < targetRowIdx) {
                    ds.insert(0, Ext.ModelMgr.create({key: '', value: '', extra: true}, this.model));
                }
                else if (j > (targetRowIdx + skip)) {
                    ds.add(Ext.ModelMgr.create({key: '', value: '', extra: true}, this.model));
                }
            }

            subChosenEl = Ext.DomHelper.append(this.items.itemAt(i).body, {
                cls: 'x-picker-chosen'
            }, true);

            subChosenEl.setTop((targetRowIdx) * this.rowHeight + bd.getTop());
            subChosenEl.setWidth(bd.getWidth());
            this.activeEls[i] = subChosenEl;
        }

        if (this.value !== undefined) {
            this.setValue(this.value, false);
        }
        else {
            this.onScrollEnd();
        }

        this.initialized = true;
    },

    setValue: function(obj, animate) {
        var i = 0,
            slotsLn = this.slots.length,
            dv,
            items = this.items,
            value;

        for (; i < slotsLn; i++) {
            value = this.value[this.slots[i].name];
            if (value) {
                dv = items.itemAt(i);
                var idx = dv.store.find(this.valueField, value),
                    r = dv.store.getAt(idx),
                    n = dv.getNode(r);

                this.scrollToNode(dv, n, animate);
            }
        }
    },

    // @private
    onScrollEnd: function(scroller) {
        // moving els declaration to the top will cause lastEls to be re-written.
        if (scroller) {
            // scroll has ended
            var index = scroller.index,
                dv = this.items.itemAt(index),
                lastEl = this.lastEls[index],
                oldRecord = lastEl ? dv.getRecord(lastEl) : undefined,
                oldValue = oldRecord ? oldRecord.get(this.valueField) : undefined,
                els = this.getSelectedEls(),
                r = dv.getRecord(els[index]);

            if (lastEl) {
                Ext.fly(lastEl).removeClass(this.chosenCls);
            }
            Ext.fly(els[index]).addClass(this.chosenCls);

            this.fireEvent('pick', this, this.slots[index].name, r.get(this.valueField), oldValue, r);
        }
        else {
            // initialize it
            var i = 0, els = this.getSelectedEls(), ln = els.length;
            for (; i < ln; i++) {
                Ext.fly(els[i]).addClass(this.chosenCls);
            }
        }
    }
});
Ext.reg('picker', Ext.Picker);

Date.monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];


/**
 * @class Ext.DatePicker
 * @extends Ext.Picker
 * @xtype datepicker
 *
 * A date picker class
 *
 */

Ext.DatePicker = Ext.extend(Ext.Picker, {

    /**
     * @cfg {Number} yearFrom
     * The start year for the date picker.  Defaults to 1980
     */
    yearFrom: 1980,

    /**
     * @cfg {Number} yearTo
     * The last year for the date picker.  Defaults to the current year.
     */
    yearTo: new Date().getFullYear(),

    initComponent: function() {
        var yearsFrom = this.yearFrom;
        var yearsTo = this.yearTo;
        var years = [];

        // swap values if user mixes them up.
        if (yearsFrom > yearsTo) {
            var tmp = yearsFrom;
            yearsFrom = yearsTo;
            yearsTo = tmp;
        }

        for (var i = yearsFrom; i <= yearsTo; i++) {
            years.push({
                key: i,
                value: i
            });
        }

        var daysInMonth;
        if (this.value) {
            daysInMonth = this.getDaysInMonth(this.value.month, this.value.year);
        } else {
            daysInMonth = this.getDaysInMonth(0, new Date().getFullYear());
        }

        var days = [];
        for (i = 0; i < daysInMonth; i++) {
            days.push({
                key: i+1,
                value: i+1
            });
        }

        var months = [];
        for (i = 0, ln = Date.monthNames.length; i < ln; i++) {
            months.push({
                key: Date.monthNames[i],
                value: i
            });
        }

        this.slots = [{
            text: 'Month',
            name: 'month',
            align: 'left',
            items: months
        },{
            text: 'Day',
            name: 'day',
            align: 'center',
            items: days
        },{
            text: 'Year',
            name: 'year',
            align: 'right',
            items: years
        }];

        Ext.DatePicker.superclass.initComponent.call(this);
        this.on('pick', this.onPick, this);
    },


    /**
     * Gets the current value as a Date object
     * @return {Date} value
     */
    getValue: function() {
        var v = Ext.DatePicker.superclass.getValue.call(this),
            day,
            daysInMonth = this.getDaysInMonth(v.month, v.year);

        if (v.day !== "") {
            day = Math.min(v.day, daysInMonth);
        } else {
            day = daysInMonth;
            var dv = this.items.itemAt(1),
                idx = dv.store.find(this.valueField, daysInMonth),
                r = dv.store.getAt(idx),
                n = dv.getNode(r);
            this.scrollToNode(dv, n);
        }
        return new Date(v.year, v.month, day);
    },

    // @private
    onPick: function(picker, name, value, r) {
        if (name === "month" || name === "year") {
            var dayView = this.items.itemAt(1);
            var store = dayView.store;
            var date = this.getValue();
            var daysInMonth = this.getDaysInMonth(date.getMonth(), date.getFullYear());
            store.filter([{
                fn: function(r) {
                    return r.get('extra') === true || r.get('value') <= daysInMonth;
                }
            }]);
            this.onScrollEnd(dayView.scroller);
        }
    },

    // @private
    getDaysInMonth: function(month, year) {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return month == 1 && this.isLeapYear(year) ? 29 : daysInMonth[month];
    },

    // @private
    isLeapYear: function(year) {
        return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
    }
});

Ext.reg('datepicker', Ext.DatePicker);

/**
 * @class Ext.Video
 * @extends Ext.Panel
 *
 * Provides a simple Container for HTML5 Video.
 *
 * <pre><code>
var pnl = new Ext.Panel({
    fullscreen: true,
    items: [{
        floating: true,
        x: 600,
        y: 300,
        width: 175,
        height: 98,
        xtype: 'video',
        url: "porsche911.mov",
        poster: 'porsche.png'
    }]
});</code></pre>
 * @xtype video
 */
Ext.Video = Ext.extend(Ext.Container, {
    /**
     * @constructor
     * @param {Object} config
     * Create a new Video Panel.
     */

    /**
     * @cfg {String} url
     * Location of the video to play. This should be in H.264 format and in a
     * .mov file format.
     */
    url: '',

    /**
     * @cfg {String} poster
     * Location of a poster image to be shown before showing the video.
     */
    poster: '',

    /**
     * @cfg {Boolean} enableControls
     * Set this to false to turn off the native controls
     * the video. (Defaults to true)
     */
    enableControls: true,
    cmpCls: 'x-video',

    autoPlay: false,
    autoPause: true,

    afterRender : function() {
        var cfg = {
            tag: 'video',
            src: this.src || this.url,
            preload: 'true',
            width: '100%',
            height: '100%'
        };
        if (this.loop) {
            cfg.loop = "loop";
        }
        if (this.enableControls) {
            cfg.controls = 'controls';
        }
        this.video = this.el.createChild(cfg);
        this.video.hide();

        if (this.poster) {
            this.ghost = this.el.createChild({
                cls: 'x-video-ghost',
                style: 'width: 100%; height: 100%; background: #000 url(' + this.poster + ') center center no-repeat; -webkit-background-size: 100% auto;'
            });
            this.ghost.on('tap', function() {
                this.video.show();
                this.ghost.hide();
                this.video.dom.play();
            }, this);
        }

        this.on('activate', function(){
            if (this.autoPlay) {
                this.play();
            }
        });

        this.on('deactivate', function(){
            if (this.autoPause) {
                this.pause();
            }
        })

        Ext.Video.superclass.afterRender.call(this);
    },

    play : function() {
        this.video.dom.play();
    },

    pause : function() {
        this.video.dom.pause();
    }
});

Ext.reg('video', Ext.Video);
/**
 * @class Ext.Audio
 * @extends Ext.Container
 * @xtype audio
 *
 * Provides a simple container for HTML5 Audio.
 * Recommended types: Uncompressed WAV and AIF audio, MP3 audio, and AAC-LC or HE-AAC audio
 *
 * <pre><code>
var pnl = new Ext.Panel({
    fullscreen: true,
    items: [{
        xtype: 'audio',
        url: "who-goingmobile.mp3"
    }]
});</code></pre>
 */
Ext.Audio = Ext.extend(Ext.Container, {
    /**
     * @constructor
     * @param {Object} config
     * Create a new Audio container.
     */

    /**
     * @cfg {String} url
     * Location of the audio to play.
     */
    url: '',

    /**
     * @cfg {Boolean} showControls
     * Set this to false to turn off the native media controls
     * the audio. (Defaults to true)
     */
    showControls: true,
    cmpCls: 'x-audio',

    /**
     * @cfg {Boolean} autoResume
     * Will automatically start playing the audio when the container is activated.
     * (Defaults to false)
     */
    autoResume: false,

    /**
     * @cfg {Boolean} autoPause
     * Will automatically pause the audio when the container is deactivated.
     * (Defaults to true)
     */
    autoPause: true,

    /**
     * @cfg {Boolean} preload
     * Will begin preloading audio immediately.
     * (Defaults to true)
     */
    preload: true,

    playing: false,

    // @private
    afterRender : function() {
        var cfg;

        if (Ext.platform.isPhone) {
            cfg = {
                tag: 'embed',
                type: 'audio/mpeg',
                target: 'myself',
                src: this.src || this.url,
                controls: 'true'
            };
        } else {
            cfg = {
                tag: 'audio',
                src: this.src || this.url
            };
        }

        if (this.loop) {
            cfg.loop = "loop";
        }

        if (this.showControls) {
            cfg.controls = 'controls';
            cfg.hidden = false;
        } else {
            cfg.hidden = true;
        }

        cfg.preload = this.preload;

        this.audio = this.el.createChild(cfg);

        this.on({
            activate: this.onActivate,
            beforedeactivate: this.onBeforeDeactivate,
            scope: this
        });

        Ext.Audio.superclass.afterRender.call(this);
    },

    // @private
    onActivate : function(){
        if (this.autoResume) {
            this.play();
        }
        if (Ext.platform.isPhone) {
            this.audio.show();
        }
    },

    // @private
    onBeforeDeactivate : function(){
        if (this.autoPause && this.playing) {
            this.pause();
        }
        if (Ext.platform.isPhone) {
            this.audio.hide();
        }
    },

    /**
     * Starts or resumes audio playback
     */
    play : function() {
        this.audio.dom.play();
        this.playing = true;
    },

    /**
     * Pauses audio playback
     */
    pause : function() {
        this.audio.dom.pause();
        this.playing = false;
    },

    /**
     * Toggles the audio playback state
     */
    toggle : function() {
        this[this.playing == true ? 'pause' : 'play']();
    }
});

Ext.reg('audio', Ext.Audio);

/**
 * @class Ext.form.FormPanel
 * @extends Ext.Panel
 * @xtype form
 * Simple form panel which enables easy getting and setting of field values. Can load model instances. Example usage:
<pre><code>
var form = new Ext.form.FormPanel({
    items: [
        {
            xtype: 'textfield',
            name : 'first',
            label: 'First name'
        },
        {
            xtype: 'textfield',
            name : 'last',
            label: 'Last name'
        },
        {
            xtype: 'numberfield',
            name : 'age',
            label: 'Age'
        },
        {
            xtype: 'urlfield',
            name : 'url',
            label: 'Website'
        }
    ]
});
</code></pre>
 * Loading model instances:
<pre><code>
Ext.regModel('User', {
    fields: [
        {name: 'first', type: 'string'},
        {name: 'last',  type: 'string'},
        {name: 'age',   type: 'int'},
        {name: 'url',   type: 'string'}
    ]
});

var user = Ext.ModelMgr.create({
    first: 'Ed',
    last : 'Spencer',
    age  : 24,
    url  : 'http://extjs.com'
}, 'User');

form.load(user);
</code></pre>
 */
Ext.form.FormPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Boolean} standardSubmit
     * Wether or not we want to perform a standard form submit. Defaults to false/
     */
    standardSubmit: false,

    cmpCls: 'x-form',

    renderTpl: new Ext.XTemplate(
        '<form <tpl if="id">id="{id}"</tpl> class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl>" <tpl if="style"> style="{style}"</tpl>>'+
            '<div class="{baseCls}-body"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl></div>'+
        '</form>',
        {compiled: true}
    ),

    // @private
    initComponent : function() {
        this.addEvents('submit');
        Ext.form.FormPanel.superclass.initComponent.call(this);
    },

    // @private
    afterRender : function() {
        Ext.form.FormPanel.superclass.afterRender.call(this);
        this.el.on('submit', this.onSubmit, this);
    },

    // @private
    onSubmit : function(e, t) {
        if (!this.standardSubmit) {
            e.preventDefault();
        }
        this.fireEvent('submit', this, this.getValues());
    },

    /**
     * Loads a model instance into this form
     * @param {Ext.data.Model} instance The model instance
     */
    load: function(instance) {
        this.setValues(instance.data);
    },

    /**
     * Sets the values of form fields in bulk. Example usage:
<pre><code>
myForm.setValues({
    name: 'Ed',
    crazy: true,
    username: 'edspencer'
});
</code></pre>
     * @param {Object} values field name => value mapping object
     */
    setValues: function(values) {
        var fields = this.getFields(),
            length = values.length,
            name, field;

        for (name in values) {
            field = fields[name];

            if (field) {
                field.setValue(values[name]);
            }
        }
    },

    /**
     * Returns an object containing the value of each field in the form, keyed to the field's name
     * @return {Object} Object mapping field name to its value
     */
    getValues: function() {
        var fields = this.getFields(),
            length = fields.length,
            values = {},
            name;

        for (name in fields) {
            values[name] = fields[name].getValue();
        }

        return values;
    },

    /**
     * Resets all fields in the form back to their original values
     */
    reset: function() {
        var fields = this.getFields(),
            name;

        for (name in fields) {
            fields[name].reset();
        }
    },

    /**
     * @private
     * Returns all {@link Ext.Field field} instances inside this form
     * @return {Object} All field instances, mapped by field name
     */
    getFields: function() {
        var fields = {};

        var getFieldsFrom = function(item) {
            if (item.isField) {
                fields[item.name || item.id] = item;
            }

            if (item.isContainer) {
                item.items.each(getFieldsFrom);
            }
        };

        this.items.each(getFieldsFrom);

        return fields;
    }
});

Ext.reg('form', Ext.form.FormPanel);

/**
 * @class Ext.form.FieldSet
 * @extends Ext.Container
 * @xtype fieldset
 * Simple FieldSet, can contain fields as items. FieldSets do not add any behavior, other than an optional title, and
 * are just used to group similar fields together. Example usage (within a form):
<pre><code>
new Ext.form.FormPanel({
    items: [
        {
            xtype: 'fieldset',
            title: 'About Me',
            items: [
                {
                    xtype: 'textfield',
                    name : 'firstName',
                    label: 'First Name'
                },
                {
                    xtype: 'textfield',
                    name : 'lastName',
                    label: 'Last Name'
                }
            ]
        }
    ]
});
</code></pre>
 */
Ext.form.FieldSet = Ext.extend(Ext.Panel, {
    cmpCls: 'x-form-fieldset',

    // @private
    initComponent : function() {
        this.componentLayout = new Ext.layout.AutoComponentLayout();
        Ext.form.FieldSet.superclass.initComponent.call(this);
    },

    /**
     * @cfg {String} title Optional fieldset title, rendered just above the grouped fields
     */

    /**
     * @cfg {String} instructions Optional fieldset instructions, rendered just below the grouped fields
     */

    // @private
    afterLayout : function(layout) {
        Ext.form.FieldSet.superclass.afterLayout.call(this, layout);
        if (this.title && !this.titleEl) {
            this.titleEl = this.el.insertFirst({
                cls: this.cmpCls + '-title',
                html: this.title
            });
        }
        else if (this.titleEl) {
            this.el.insertFirst(this.titleEl);
        }

        if (this.instructions && !this.instructionsEl) {
            this.instructionsEl = this.el.createChild({
                cls: this.cmpCls + '-instructions',
                html: this.instructions
            });
        }
        else if (this.instructionsEl) {
            this.el.appendChild(this.instructionsEl);
        }
    }
});

Ext.reg('fieldset', Ext.form.FieldSet);

/**
 * @class Ext.form.Field
 * @extends Ext.Container
 * @xtype field
 * Base class for form fields that provides default event handling, sizing, value handling and other functionality. Ext.form.Field
 * is not used directly in applications, instead the subclasses such as {@link Ext.form.TextField} should be used.
 * @constructor
 * Creates a new Field
 * @param {Object} config Configuration options
 */
Ext.form.Field = Ext.extend(Ext.Component,  {
    ui: 'text',

    /**
     * Set to true on all Ext.form.Field subclasses. This is used by {@link Ext.form.FormPanel#getValues} to determine which
     * components inside a form are fields.
     * @property isField
     * @type Boolean
     */
    isField: true,

    /**
     * <p>The label Element associated with this Field. <b>Only available after this Field has been rendered by a
     * {@link form Ext.layout.FormLayout} layout manager.</b></p>
     * @type Ext.Element
     * @property label
     */

    /**
     * @cfg {Number} tabIndex The tabIndex for this field. Note this only applies to fields that are rendered,
     * not those which are built via applyTo (defaults to undefined).
     */
    /**
     * @cfg {Mixed} value A value to initialize this field with (defaults to undefined).
     */
    /**
     * @cfg {String} name The field's HTML name attribute (defaults to '').
     * <b>Note</b>: this property must be set if this field is to be automatically included with
     * {@link Ext.form.BasicForm#submit form submit()}.
     */
    /**
     * @cfg {String} cls A custom CSS class to apply to the field's underlying element (defaults to '').
     */

    /**
     * @cfg {String} fieldClass The default CSS class for the field (defaults to 'x-form-field')
     */
    baseCls : 'x-field',

    /**
     * @cfg {String} inputCls Optional CSS class that will be added to the actual <input> element (or whichever different element is
     * defined by {@link inputAutoEl}). Defaults to undefined.
     */
    inputCls: undefined,

    /**
     * @cfg {String} focusClass The CSS class to use when the field receives focus (defaults to 'x-form-focus')
     */
    focusClass : 'x-field-focus',

    renderTpl: new Ext.XTemplate(
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls}<tpl if="required"> {required}</tpl><tpl if="cls"> {cls}</tpl><tpl if="cmpCls"> {cmpCls}</tpl><tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>><span>{label}</span></label></tpl>',
            '<tpl if="fieldEl"><input id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
                '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                '<tpl if="style">style="{style}" </tpl>',
                '<tpl if="autocomplete">autocomplete="{autocomplete}" </tpl>',
            '/></tpl>',
            '<tpl if="maskField"><div class="x-field-mask"></div></tpl>',
        '</div>',
        { compiled: true }
    ),

    /**
     * @cfg {Boolean} disabled True to disable the field (defaults to false).
     * <p>Be aware that conformant with the <a href="http://www.w3.org/TR/html401/interact/forms.html#h-17.12.1">HTML specification</a>,
     * disabled Fields will not be {@link Ext.form.BasicForm#submit submitted}.</p>
     */
    disabled : false,

    // @private
    isFormField : true,

    // @private
    hasFocus : false,

    /**
     * @cfg {Boolean} autoCreateField True to automatically create the field input element on render. This is true by default, but should
     * be set to false for any Ext.Field subclasses that don't need an HTML input (e.g. Ext.Slider and similar)
     */
    autoCreateField: true,

    /**
     * @cfg {String} inputType The type attribute for input fields -- e.g. radio, text, password, file (defaults
     * to 'text'). The types 'file' and 'password' must be used to render those field types currently -- there are
     * no separate Ext components for those. Note that if you use <tt>type:'file'</tt>, {@link #emptyText}
     * is not supported and should be avoided.
     */
    inputType: 'text',
    label: null,
    labelWidth: 100, // Currently unsupported

    /**
     * @cfg {String} labelAlign The location to render the label of the field. Acceptable values are 'top' and 'left', defaults to 'left'
     */
    labelAlign: 'left',

    /**
     * @cfg {Boolean} required True to make this field required. Note: this only causes a visual indication. Doesn't prevent user from submitting the form.
     */
    required: false,

    maskField: false,

    // @private
    initComponent : function() {
        //backwards compatibility - deprecate in next major release
        this.label = this.label || this.fieldLabel;

        Ext.form.Field.superclass.initComponent.call(this);
        this.addEvents(
            /**
             * @event focus
             * Fires when this field receives input focus.
             * @param {Ext.form.Field} this
             */
            'focus',
            /**
             * @event blur
             * Fires when this field loses input focus.
             * @param {Ext.form.Field} this
             */
            'blur',
            /**
             * @event change
             * Fires just before the field blurs if the field value has changed.
             * @param {Ext.form.Field} this
             * @param {Mixed} newValue The new value
             * @param {Mixed} oldValue The original value
             */
            'change'
        );
    },

    /**
     * Returns the {@link Ext.form.Field#name name} or {@link Ext.form.ComboBox#hiddenName hiddenName}
     * attribute of the field if available.
     * @return {String} name The field {@link Ext.form.Field#name name} or {@link Ext.form.ComboBox#hiddenName hiddenName}
     */
    getName : function() {
        return this.name || this.id || '';
    },

    // @private
    onRender : function(ct, position) {
        Ext.applyIf(this.renderData, {
            disabled: this.disabled,
            fieldCls: this.inputCls || 'x-input-' + this.inputType,
            fieldEl: !this.fieldEl && this.autoCreateField,
            inputId: Ext.id(),
            label: this.label,
            labelAlign: 'x-label-align-' + this.labelAlign,
            name: this.name || this.id,
            placeholder: this.placeholder,
            required: this.required ? 'x-field-required' : undefined,
            style: this.style,
            tabIndex: this.tabIndex,
            type: this.inputType,
            maskField: this.maskField
        });

        Ext.applyIf(this.renderSelectors, {
            labelEl: 'label',
            fieldEl: '.' + this.renderData.fieldCls,
            mask: '.x-field-mask'
        });

        Ext.form.Field.superclass.onRender.call(this, ct, position);

        if (this.fieldEl) {
            this.mon(this.fieldEl, {
                focus: this.onFocus,
                blur: this.onBlur,
                change: this.onChange,
                keyup: this.onKeyUp,
                scope: this
            });
            if (this.maskField) {
                this.mon(this.mask, {
                    tap: this.onMaskTap,
                    scope: this
                });
            }
        }
    },

    // @private
    onEnable : function() {
        this.getActionEl().removeClass(this.disabledClass);
        this.el.dom.disabled = false;
        this.fieldEl.dom.disabled = false;
    },

    // @private
    onDisable : function() {
        this.getActionEl().addClass(this.disabledClass);
        this.el.dom.disabled = true;
        this.fieldEl.dom.disabled = true;
    },

    // @private
    initValue : function(){
        if (this.value !== undefined) {
            this.setValue(this.value);
        }

        /**
         * The original value of the field as configured in the {@link #value} configuration, or
         * as loaded by the last form load operation if the form's {@link Ext.form.BasicForm#trackResetOnLoad trackResetOnLoad}
         * setting is <code>true</code>.
         * @type mixed
         * @property originalValue
         */
        this.originalValue = this.getValue();
    },

    /**
     * <p>Returns true if the value of this Field has been changed from its original value.
     * Will return false if the field is disabled or has not been rendered yet.</p>
     * <p>Note that if the owning {@link Ext.form.BasicForm form} was configured with
     * {@link Ext.form.BasicForm}.{@link Ext.form.BasicForm#trackResetOnLoad trackResetOnLoad}
     * then the <i>original value</i> is updated when the values are loaded by
     * {@link Ext.form.BasicForm}.{@link Ext.form.BasicForm#setValues setValues}.</p>
     * @return {Boolean} True if this field has been changed from its original value (and
     * is not disabled), false otherwise.
     */
    isDirty : function() {
        if (this.disabled || !this.rendered) {
            return false;
        }
        return String(this.getValue()) !== String(this.originalValue);
    },

    // @private
    afterRender : function(){
        Ext.form.Field.superclass.afterRender.call(this);
        this.initValue();
    },

    onKeyUp : function(e) {
        this.fireEvent('keyup', this, this.getValue());
    },

    onMaskTap : function(e) {
        this.mask.hide();
    },

    onChange : function(e) {
        this.fireEvent('change', this, this.getValue());
    },

    /**
     * Resets the current field value to the originally loaded value and clears any validation messages.
     * See {@link Ext.form.BasicForm}.{@link Ext.form.BasicForm#trackResetOnLoad trackResetOnLoad}
     */
    reset : function() {
        this.setValue(this.originalValue);
    },

    // @private
    beforeFocus: Ext.emptyFn,

    undoNativeScroll : function() {
        var parent = this.el.parent();
        while (parent) {
            if (parent.getStyle('overflow') == 'hidden') {
                parent.dom.scrollTop = 0;
                parent.dom.scrollLeft = 0;
            }
            parent = parent.parent();
        }
    },

    // @private
    onFocus : function() {
        var me = this;
        setTimeout(function() {
            me.undoNativeScroll();
        }, 0);

        this.beforeFocus();
        if (this.focusClass) {
            this.el.addClass(this.focusClass);
        }

        if (!this.hasFocus) {
            this.hasFocus = true;
            /**
             * <p>The value that the Field had at the time it was last focused. This is the value that is passed
             * to the {@link #change} event which is fired if the value has been changed when the Field is blurred.</p>
             * <p><b>This will be undefined until the Field has been visited.</b> Compare {@link #originalValue}.</p>
             * @type mixed
             * @property startValue
             */
            this.startValue = this.getValue();
            this.fireEvent('focus', this);
        }
    },

    // @private
    beforeBlur : Ext.emptyFn,

    // @private
    onBlur : function() {
        this.beforeBlur();
        if (this.focusClass) {
            this.el.removeClass(this.focusClass);
        }
        this.hasFocus = false;
        var v = this.getValue();
        if (String(v) !== String(this.startValue)){
            this.fireEvent('change', this, v, this.startValue);
        }
        this.fireEvent('blur', this);
        if (this.maskField) {
            this.mask.show();
        }
        this.postBlur();
    },

    // @private
    postBlur : Ext.emptyFn,

    /**
     * Returns the normalized data value (undefined or emptyText will be returned as '').  To return the raw value see {@link #getRawValue}.
     * @return {Mixed} value The field value
     */
    getValue : function(){
        if (!this.rendered || !this.fieldEl) {
            return this.value;
        }

        return this.fieldEl.getValue() || '';
    },

    /**
     * Sets a data value into the field and validates it.  To set the value directly without validation see {@link #setRawValue}.
     * @param {Mixed} value The value to set
     * @return {Ext.form.Field} this
     */
    setValue : function(v){
        this.value = v;
        if (this.rendered && this.fieldEl) {
            this.fieldEl.dom.value = (Ext.isEmpty(v) ? '' : v);
        }
        return this;
    }
});

Ext.reg('field', Ext.form.Field);

/**
 * @class Ext.form.Slider
 * @extends Ext.form.Field
 * @xtype slider
 * Form component allowing a user to move a 'thumb' along a slider axis to choose a value. Sliders can equally be used outside
 * of the context of a form. Example usage:
   <pre><code>
new Ext.form.FormPanel({
    items: [
        {
            xtype   : 'slider',
            label   : 'Volume',
            value   : 5,
            minValue: 0,
            maxValue: 10
        }
    ]
});
   </code></pre>
 * Or as a standalone component:
   <pre><code>
var slider = new Ext.form.Slider({
    value: 5,
    minValue: 0,
    maxValue: 10
});

slider.setValue(8); //will update the value and move the thumb;
slider.getValue(); //returns 8
   </code></pre>
 */
Ext.form.Slider = Ext.extend(Ext.form.Field, {
    ui: 'slider',

    /**
     * @cfg {String} inputCls Overrides {@link Ext.form.Field}'s inputCls. Defaults to 'x-slider'
     */
    inputCls: 'x-slider',

    /**
     * @cfg {Number} minValue The lowest value any thumb on this slider can be set to (defaults to 0)
     */
    minValue: 0,

    /**
     * @cfg {Number} maxValue The highest value any thumb on this slider can be set to (defaults to 100)
     */
    maxValue: 100,

    /**
     * @cfg {Boolean} animate When set to true, the slider thumbs are animated when their values change. Defaults to true
     */
    animate: true,

    /**
     * @cfg {Number} value The value to initialize the thumb at (defaults to 0)
     */
    value: 0,

    renderTpl: new Ext.XTemplate(
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
        '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>>{label}</label></tpl>',
        '<tpl if="fieldEl"><div id="{inputId}" name="{name}" class="{fieldCls}"',
        '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
        '<tpl if="style">style="{style}" </tpl>',
        '/></tpl>',
        '<div class="x-field-mask"></div>',
        '</div>',
        { compiled: true }
    ),

    /**
     * @cfg {Number} increment The increment by which to snap each thumb when its value changes. Defaults to 1. Any thumb movement
     * will be snapped to the nearest value that is a multiple of the increment (e.g. if increment is 10 and the user tries to move
     * the thumb to 67, it will be snapped to 70 instead)
     */
    increment: 1,

    /**
     * @cfg {Array} values The values to initialize each thumb with. One thumb will be created for each value. This configuration
     * should always be defined but if it is not then it will be treated as though [0] was passed.
     */

    /**
     * @cfg {Array} thumbs Optional array of Ext.form.Slider.Thumb instances. Usually {@link values} should be used instead
     */

    // @private
    constructor: function(config) {
        this.addEvents(
        /**
             * @event beforechange
             * Fires before the value of a thumb is changed. Return false to cancel the change
             * @param {Ext.form.Slider} slider The slider instance
             * @param {Ext.form.Slider.Thumb} thumb The thumb instance
             * @param {Number} oldValue The previous value
             * @param {Number} newValue The value that the thumb will be set to
             */
        'beforechange',

        /**
             * @event change
             * Fires when the value of a thumb is changed.
             * @param {Ext.form.Slider} slider The slider instance
             * @param {Ext.form.Slider.Thumb} thumb The thumb instance
             * @param {Number} oldValue The previous value
             * @param {Number} newValue The value that the thumb will be set to
             */
        'change'
        );

        Ext.form.Slider.superclass.constructor.call(this, config);
    },

    // @private
    initComponent: function() {
        //TODO: This will be removed once multi-thumb support is in place - at that point a 'values' config will be accepted
        //to create the multiple thumbs
        this.values = [this.value];

        Ext.form.Slider.superclass.initComponent.apply(this, arguments);

        if (this.thumbs == undefined) {
            var thumbs = [],
                values = this.values,
                length = values.length,
                i;

            for (i = 0; i < length; i++) {
                thumbs[thumbs.length] = new Ext.form.Slider.Thumb({
                    value: values[i],
                    slider: this,

                    listeners: {
                        scope: this,
                        dragend: this.onThumbDragEnd
                    }
                });
            }

            this.thumbs = thumbs;
        }
    },

    /**
     * Sets the new value of the slider, constraining it within {@link minValue} and {@link maxValue}, and snapping to the nearest
     * {@link increment} if set
     * @param {Number} value The new value
     * @return {Number} The value the thumb was set to
     */
    setValue: function(value) {
        //TODO: this should accept a second argument referencing which thumb to move
        var me = this,
            thumb = me.getThumb(),
            oldValue = thumb.getValue(),
            newValue = me.constrain(value);

        if (me.fireEvent('beforechange', me, thumb, oldValue, newValue) !== false) {
            this.moveThumb(thumb, this.getPixelValue(newValue, thumb));
            thumb.setValue(newValue);
            me.doComponentLayout();

            me.fireEvent('change', me, thumb, oldValue, newValue);
        }
    },

    /**
     * @private
     * Takes a desired value of a thumb and returns the nearest snap value. e.g if minValue = 0, maxValue = 100, increment = 10 and we
     * pass a value of 67 here, the returned value will be 70. The returned number is constrained within {@link minValue} and {@link maxValue},
     * so in the above example 68 would be returned if {@link maxValue} was set to 68.
     * @param {Number} value The value to snap
     * @return {Number} The snapped value
     */
    constrain: function(value) {
        var increment = this.increment,
        div = Math.floor(Math.abs(value / increment)),
        lower = this.minValue + (div * increment),
        higher = Math.min(lower + increment, this.maxValue),
        dLower = value - lower,
        dHigher = higher - value;

        return (dLower < dHigher) ? lower: higher;
    },

    /**
     * Returns the current value of the Slider's thumb
     * @return {Number} The thumb value
     */
    getValue: function() {
        //TODO: should return values from multiple thumbs
        return this.getThumb().getValue();
    },

    /**
     * Returns the Thumb instance bound to this Slider
     * @return {Ext.form.Slider.Thumb} The thumb instance
     */
    getThumb: function() {
        //TODO: This function is implemented this way to make the addition of multi-thumb support simpler. This function
        //should be updated to accept a thumb index
        return this.thumbs[0];
    },

    /**
     * @private
     * Maps a pixel value to a slider value. If we have a slider that is 200px wide, where minValue is 100 and maxValue is 500,
     * passing a pixelValue of 38 will return a mapped value of 176
     * @param {Number} pixelValue The pixel value, relative to the left edge of the slider
     * @return {Number} The value based on slider units
     */
    getSliderValue: function(pixelValue, thumb) {
        var thumbWidth = thumb.el.getOuterWidth(),
            halfWidth = thumbWidth / 2,
            trackWidth = this.fieldEl.getWidth() - thumbWidth,
            range = this.maxValue - this.minValue,

            //number of pixels per slider value unit
            ratio = range / trackWidth;

        return this.minValue + (ratio * (pixelValue - halfWidth));
    },

    /**
     * @private
     * The inverse of {@link getSliderValue}, when passed a value in slider units (e.g. the value a {@link Ext.form.Slider.Thumb thumb}
     * might represent), this returns the pixel on the rendered slider that the thumb should be positioned at
     * @param {Number} value The internal slider value
     * @return {Number} The pixel value, rounded and relative to the left edge of the scroller
     */
    getPixelValue: function(value, thumb) {
        var thumbWidth = thumb.el.getOuterWidth(),
            halfWidth = thumbWidth / 2,
            trackWidth = this.fieldEl.getWidth() - thumbWidth,
            range = this.maxValue - this.minValue,

            //number of pixels per slider value unit
            ratio = trackWidth / range;

        return (ratio * (value - this.minValue)) + halfWidth;
    },

    /**
     * @private
     * Creates an Ext.form.Slider.Thumb instance for each configured {@link values value}. Assumes that this.el is already present
     */
    renderThumbs: function() {
        var thumbs = this.thumbs,
            length = thumbs.length,
            i;

        for (i = 0; i < length; i++) {
            thumbs[i].render(this.fieldEl);
        }
    },

    /**
     * @private
     * Updates a thumb after it has been dragged
     */
    onThumbDragEnd: function(draggable) {
        var thumb = draggable.thumb,
            sliderBox = this.fieldEl.getPageBox(),
            thumbBox = thumb.el.getPageBox(),

            thumbWidth = thumbBox.width,
            halfWidth = thumbWidth / 2,
            center = (thumbBox.left - sliderBox.left) + halfWidth;

        this.setValue(this.getSliderValue(center, thumb));
    },

    /**
     * @private
     * Updates the value of the nearest thumb on tap events
     */
    onTap: function(e) {
        var sliderBox = this.fieldEl.getPageBox(),
            leftOffset = e.pageX - sliderBox.left,
            thumb = this.getNearest(leftOffset);

        this.setValue(this.getSliderValue(leftOffset, thumb));
    },

    /**
     * @private
     * Moves the thumb element. Should only ever need to be called from within {@link setValue}
     * @param {Ext.form.Slider.Thumb} thumb The thumb to move
     * @param {Number} pixel The pixel the thumb should be centered on
     * @param {Boolean} animate True to animate the movement
     */
    moveThumb: function(thumb, pixel, animate) {
        var halfWidth = thumb.el.getOuterWidth() / 2;

        thumb.el.setLeft(pixel - halfWidth);
    },

    // inherit docs
    afterRender: function(ct) {
        this.renderThumbs();

        Ext.form.Slider.superclass.afterRender.apply(this, arguments);

        this.fieldEl.on({
            scope: this,
            tap: this.onTap
        });
    },

    /**
     * @private
     * Finds and returns the nearest {@link Ext.form.Slider.Thumb thumb} to the given value.
     * @param {Number} value The value
     * @return {Ext.form.Slider.Thumb} The nearest thumb
     */
    getNearest: function(value) {
        //TODO: Implemented this way to enable multi-thumb support later
        return this.thumbs[0];
    }
});

Ext.reg('slider', Ext.form.Slider);

/**
 * @class Ext.form.Slider.Thumb
 * @extends Ext.form.Field
 * @xtype thumb
 * @ignore
 * Utility class used by Ext.form.Slider - should never need to be used directly.
 */
Ext.form.Slider.Thumb = Ext.extend(Ext.form.Field, {
    isField: false,
    ui: 'thumb',
    autoCreateField: false,
    draggable: true,

    /**
     * @cfg {Number} value The value to initialize this thumb with (defaults to 0)
     */
    value: 0,

    /**
     * @cfg {Ext.form.Slider} slider The Slider that this thumb is attached to. Required
     */

    // inherit docs
    onRender: function() {
        Ext.form.Slider.Thumb.superclass.onRender.apply(this, arguments);

        this.dragConfig = {
            direction: 'horizontal',
            constrain: this.slider.fieldEl,
            revert: false,
            thumb: this
        };
    },

    // inherit docs
    setValue: function(newValue) {
        this.value = newValue;
    },

    // inherit docs
    getValue: function() {
        return this.value;
    }
});

Ext.reg('thumb', Ext.form.Slider.Thumb);

/**
 * @class Ext.form.Toggle
 * @extends Ext.form.Slider
 * @xtype toggle
 * Specialized Slider with a single thumb and only two values. By default the toggle component can
 * be switched between the values of 0 and 1.
 */
Ext.form.Toggle = Ext.extend(Ext.form.Slider, {
    minValue: 0,
    maxValue: 1,
    ui: 'toggle',

    /**
     * @cfg {String} minValueCls CSS class added to the field when toggled to its minValue
     */
    minValueCls: 'x-toggle-off',

    /**
     * @cfg {String} maxValueCls CSS class added to the field when toggled to its maxValue
     */
    maxValueCls: 'x-toggle-on',

    /**
     * Toggles between the minValue (0 by default) and the maxValue (1 by default)
     */
    toggle: function() {
        var thumb = this.thumbs[0],
            value = thumb.getValue();

        this.setValue(value == this.minValue ? this.maxValue : this.minValue);
    },

    // inherit docs
    setValue: function(value) {
        Ext.form.Toggle.superclass.setValue.apply(this, arguments);

        var fieldEl = this.fieldEl;

        if (this.constrain(value) === this.minValue) {
            fieldEl.addClass(this.minValueCls);
            fieldEl.removeClass(this.maxValueCls);
        } else {
            fieldEl.addClass(this.maxValueCls);
            fieldEl.removeClass(this.minValueCls);
        }
    },

    /**
     * @private
     * Listener to the tap event, just toggles the value
     */
    onTap: function() {
        this.toggle();
    }
});

Ext.reg('toggle', Ext.form.Toggle);

/**
 * @class Ext.form.TextField
 * @extends Ext.form.Field
 * @xtype textfield
 * Simple text input class
 */
Ext.form.TextField = Ext.extend(Ext.form.Field, {
    type: 'text',
    maskField: true
});

Ext.reg('textfield', Ext.form.TextField);

/**
 * @class Ext.form.PasswordField
 * @extends Ext.form.Field
 * @xtype passwordfield
 * Wraps an HTML5 password field. See {@link Ext.form.FormPanel FormPanel} for example usage.
 */
Ext.form.PasswordField = Ext.extend(Ext.form.Field, {
    maskField: true,
    inputType: 'password'
});

Ext.reg('passwordfield', Ext.form.PasswordField);

/**
 * @class Ext.form.EmailField
 * @extends Ext.form.TextField
 * @xtype emailfield
 * Wraps an HTML5 email field. See {@link Ext.form.FormPanel FormPanel} for example usage.
 */
Ext.form.EmailField = Ext.extend(Ext.form.TextField, {
    inputType: 'email'
});

Ext.reg('emailfield', Ext.form.EmailField);

/**
 * @class Ext.form.UrlField
 * @extends Ext.form.TextField
 * @xtype urlfield
 * Wraps an HTML5 url field. See {@link Ext.form.FormPanel FormPanel} for example usage.
 */
Ext.form.UrlField = Ext.extend(Ext.form.TextField, {
    inputType: 'url'
});

Ext.reg('urlfield', Ext.form.UrlField);

/**
 * @class Ext.form.SearchField
 * @extends Ext.form.Field
 * @xtype searchfield
 * Wraps an HTML5 search field. See {@link Ext.form.FormPanel FormPanel} for example usage.
 */
Ext.form.SearchField = Ext.extend(Ext.form.Field, {
    inputType: 'search'
});

Ext.reg('searchfield', Ext.form.SearchField);

/**
 * @class Ext.form.NumberField
 * @extends Ext.form.Field
 * @xtype numberfield
 * Wraps an HTML5 number field. See {@link Ext.form.FormPanel FormPanel} for example usage.
 */
Ext.form.NumberField = Ext.extend(Ext.form.Field, {
    inputType: 'number',
    ui: 'number',
    maskField: true
});

Ext.reg('numberfield', Ext.form.NumberField);

/**
 * @class Ext.form.SpinnerField
 * @extends Ext.form.Field
 * @xtype spinnerfield
 * Wraps an HTML5 number field. See {@link Ext.form.FormPanel FormPanel} for example usage.
 */
Ext.form.SpinnerField = Ext.extend(Ext.form.NumberField, {

    cmpCls: 'x-spinner',

    /**
     * @cfg {Number} minValue The minimum allowed value (defaults to Number.NEGATIVE_INFINITY)
     */
    minValue: Number.NEGATIVE_INFINITY,
    /**
     * @cfg {Number} maxValue The maximum allowed value (defaults to Number.MAX_VALUE)
     */
    maxValue: Number.MAX_VALUE,
    /**
     * @cfg {Number} incrementValue Value that is added or subtracted from the current value when a spinner is used
     */
    incrementValue: 1,
    /**
     * @cfg {Boolean} accelerate True if autorepeating should start slowly and accelerate.
     */
    accelerate: true,
    /**
     * @cfg {Number} defaultValue Value for the spinnerField
     */
    defaultValue: 0,

    cycle: false,
    disableInput: false,

    renderTpl: new Ext.XTemplate(
    '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
        '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>>{label}</label></tpl>',
        '<tpl if="fieldEl">',
            '<div class="{cmpCls}-body">',
                '<div class="{cmpCls}-down"><span>-</span></div>',
                '<input id="{inputId}" type="number" name="{name}" class="{fieldCls}"',
                    '<tpl if="disableInput">disabled </tpl>',
                    '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                    '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                    '<tpl if="style">style="{style}" </tpl>',
                    '<tpl if="autocomplete">autocomplete="{autocomplete}" </tpl>',
                '/>',
                '<div class="{cmpCls}-up"><span>+</span></div>',
            '</div>',
        '</tpl>',
        '<div class="x-field-mask"></div>',
    '</div>', { compiled: true }
    ),

    // @private
    onRender: function(ct, position) {
        this.renderData.disableInput = this.disableInput;

        Ext.applyIf(this.renderSelectors, {
            spinUpEl: '.x-spinner-up',
            spinDownEl: '.x-spinner-down'
        });

        Ext.form.SpinnerField.superclass.onRender.call(this, ct, position);

        this.downRepeater = new Ext.util.TapRepeater(this.spinDownEl, {
            accelerate: this.accelerate
        });
        this.upRepeater = new Ext.util.TapRepeater(this.spinUpEl, {
            accelerate: this.accelerate
        });

        this.mon(this.downRepeater, {
            tap: this.onSpinDown,
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            preventDefault: true,
            scope: this
        });

        this.mon(this.upRepeater, {
            tap: this.onSpinUp,
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            preventDefault: true,
            scope: this
        });
    },

    // @private
    onSpinDown: function() {
        if (!this.disabled) {
            this.spin(true);
        }
    },

    // @private
    onSpinUp: function() {
        if (!this.disabled) {
            this.spin(false);
        }
    },

    // @private
    onTouchStart : function(btn) {
        btn.el.addClass('x-button-pressed');
    },

    // @private
    onTouchEnd : function(btn) {
        btn.el.removeClass('x-button-pressed');
    },

    // @private
    spin: function(down) {
        var value = parseFloat(this.getValue()),
            incr = this.incrementValue;

        down ? value -= incr: value += incr;

        value = (isNaN(value)) ? this.defaultValue: value;
        if (value < this.minValue) {
            value = this.cycle ? this.maxValue : this.minValue;
        }
        else if (value > this.maxValue) {
            value = this.cycle ? this.minValue : this.maxValue;
        }
        this.setValue(value);
    },

    // @private
    destroy : function() {
        Ext.destroy(this.downRepeater, this.upRepeater);
        Ext.form.SpinnerField.superclass.destroy.call(this, arguments);
    }
});

Ext.reg('spinnerfield', Ext.form.SpinnerField);

/**
 * @class Ext.form.HiddenField
 * @extends Ext.form.Field
 * @xtype hidden
 * Wraps a hidden field. See {@link Ext.form.FormPanel FormPanel} for example usage.
 */
Ext.form.HiddenField = Ext.extend(Ext.form.Field, {
    inputType: 'hidden',
    ui: 'hidden',
    autoCreateField: false
});

Ext.reg('hidden', Ext.form.HiddenField);

/**
 * @class Ext.form.UrlField
 * @extends Ext.form.TextField
 * @xtype urlfield
 * Wraps an HTML5 url field. See {@link Ext.form.FormPanel FormPanel} for example usage.
 */
Ext.form.UrlField = Ext.extend(Ext.form.TextField, {
    inputType: 'url'
});

Ext.reg('urlfield', Ext.form.UrlField);

/**
 * @class Ext.form.Checkbox
 * @extends Ext.form.Field
 * @xtype checkbox
 * Simple Checkbox class. Can be used as a direct replacement for traditional checkbox fields.
 * @constructor
 * @param {Object} config Optional config object
 */
Ext.form.Checkbox = Ext.extend(Ext.form.Field, {
    inputType: 'checkbox',
    ui: 'checkbox',

    /**
     * @cfg {Boolean} checked <tt>true</tt> if the checkbox should render initially checked (defaults to <tt>false</tt>)
     */
    checked : false,

    // @private
    constructor: function(config) {
        this.addEvents(
            /**
             * @event check
             * Fires when the checkbox is checked or unchecked.
             * @param {Ext.form.Checkbox} this This checkbox
             * @param {Boolean} checked The new checked value
             */
            'check'
        );

        Ext.form.Checkbox.superclass.constructor.call(this, config);
    },

    // @private
    onRender : function(ct, position) {
        Ext.form.Checkbox.superclass.onRender.call(this, ct, position);

        if (this.checked) {
            this.setValue(true);
        } else {
            this.checked = this.fieldEl.dom.checked;
        }
    },

    /**
     * Returns the checked state of the checkbox.
     * @return {Boolean} True if checked, else false
     */
    getValue : function(){
        if (this.rendered) {
            return this.fieldEl.dom.checked;
        }
        return this.checked;
    },

    /**
     * Sets the checked state of the checkbox and fires the 'check' event.
     * @param {Boolean/String} checked The following values will check the checkbox:
     * <code>true, 'true', '1', or 'on'</code>. Any other value will uncheck the checkbox.
     */
    setValue : function(v) {
        Ext.form.Checkbox.superclass.setValue.apply(this, arguments);

        var checked = this.checked;
        this.checked = (v === true || v === 'true' || v == '1' || String(v).toLowerCase() == 'on');

        if (this.rendered) {
            this.fieldEl.dom.checked = this.checked;
            this.fieldEl.dom.defaultChecked = this.checked;
        }

        if (checked != this.checked) {
            this.fireEvent('check', this, this.checked);
        }
    }
});

Ext.reg('checkbox', Ext.form.Checkbox);

/**
 * @class Ext.form.Radio
 * @extends Ext.form.Checkbox
 * @xtype radio
 * Single radio field.  Same as Checkbox, but provided as a convenience for automatically setting the input type.
 * Radio grouping is handled automatically by the browser if you give each radio in a group the same name.
 * @constructor
 * Creates a new Radio
 * @param {Object} config Configuration options
 */
Ext.form.Radio = Ext.extend(Ext.form.Checkbox, {
    inputType: 'radio',
    ui: 'radio',

    /**
     * If this radio is part of a group, it will return the selected value
     * @return {String}
     */
    getGroupValue: function() {
        var p = this.el.up('form') || Ext.getBody(),
            c = p.child('input[name=' + this.fieldEl.dom.name + ']:checked', true);
        return c ? c.value: null;
    },

    // @private
    onClick: function() {
        if (this.fieldEl.dom.checked != this.checked) {
            var els = this.getCheckEl().select('input[name=' + this.fieldEl.dom.name + ']');
            els.each(function(el) {
                if (el.dom.id == this.id) {
                    this.setValue(true);
                } else {
                    Ext.getCmp(el.dom.id).setValue(false);
                }
            },
            this);
        }
    },

    /**
     * Sets either the checked/unchecked status of this Radio, or, if a string value
     * is passed, checks a sibling Radio of the same name whose value is the value specified.
     * @param value {String/Boolean} Checked value, or the value of the sibling radio button to check.
     */
    setValue: function(v) {
        if (typeof v == 'boolean') {
            Ext.form.Radio.superclass.setValue.call(this, v);
        } else if (this.rendered && v != undefined) {
            var r = this.getCheckEl().child('input[name=' + this.fieldEl.dom.name + '][value=' + v + ']', true);
            if (r) {
                Ext.getCmp(r.id).setValue(true);
            }
        }
    },

    // @private
    getCheckEl: function() {
        if (this.inGroup) {
            return this.el.up('.x-form-radio-group');
        }

        return this.el.up('form') || Ext.getBody();
    }
});
Ext.reg('radio', Ext.form.Radio);

/**
 * @class Ext.form.Select
 * @extends Ext.form.Field
 * @xtype select
 * Simple Select field wrapper. Example usage:
<pre><code>
new Ext.form.Select({
    options: [
        {text: 'First Option',  value: 'first'},
        {text: 'Second Option', value: 'second'},
        {text: 'Third Option',  value: 'third'},
    ]
});
</code></pre>
 */
Ext.form.Select = Ext.extend(Ext.form.Field, {
    ui: 'select',

    valueField: 'value',
    displayField: 'text',

    // @private
    initComponent: function() {
        this.renderTpl = new Ext.XTemplate(
            '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
                '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>>{label}</label></tpl>',
                '<tpl if="fieldEl"><select id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
                    '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                    '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                    '<tpl if="style">style="{style}" </tpl>',
                    '<tpl if="autocomplete">autocomplete="false" </tpl>',
                '>',
                '<tpl for="options">',
                    '<option value="{' + this.valueField + '}">{' + this.displayField + '}</option>',
                '</tpl>',
                '</select></tpl>',
            '</div>',
            { compiled: true }
        );

        Ext.form.Select.superclass.initComponent.call(this);
    },

    // @private
    onRender : function(ct, position) {
        Ext.applyIf(this.renderData, {
            options: this.options
        });

        Ext.form.Select.superclass.onRender.call(this, ct, position);
    }
});

Ext.reg('select', Ext.form.Select);

/**
 * @class Ext.form.TextArea
 * @extends Ext.form.Field
 * @xtype textarea
 * Wraps a textarea. See {@link Ext.form.FormPanel FormPanel} for example usage.
 */
Ext.form.TextArea = Ext.extend(Ext.form.Field, {
    maskField: true,
    renderTpl: new Ext.XTemplate(
        '<div <tpl if="id">id="{id}" </tpl>class="{baseCls} {cls} {cmpCls}<tpl if="ui"> {uiBase}-{ui}</tpl> <tpl if="label">{labelAlign}</tpl>" <tpl if="style"> style="{style}"</tpl>>',
            '<tpl if="label"><label <tpl if="fieldEl">for="{inputId}"</tpl>>{label}</label></tpl>',
            '<tpl if="fieldEl"><textarea id="{inputId}" type="{type}" name="{name}" class="{fieldCls}"',
                '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                '<tpl if="placeholder">placeholder="{placeholder}" </tpl>',
                '<tpl if="style">style="{style}" </tpl>',
                '<tpl if="autocomplete">autocomplete="{autocomplete}" </tpl>',
            '></textarea></tpl>',
            '<div class="x-field-mask"></div>',
        '</div>',
        { compiled: true }
    ),
    ui: 'textarea'
});

Ext.reg('textarea', Ext.form.TextArea);


/*
Copyright(c) 2010 Sencha Inc.
licensing@sencha.com
http://www.sencha.com/touchlicense
*/

/**
 * @class Ext.layout.Layout
 * @extends Object
 * Base Layout class - extended by ComponentLayout and ContainerLayout
 */

Ext.layout.Layout = Ext.extend(Object, {
    type: 'layout',

    constructor : function(config) {
        this.id = Ext.id(null, 'ext-layout-');
        Ext.apply(this, config);
    },

    // @private Sets the layout owner
    setOwner : function(owner) {
        this.owner = owner;
    },

    /**
     * @private
     * Adds the layout's targetCls if necessary and calls onLayout.
     * layedOut flag set when complete.
     */
    layout : function() {
        var owner = this.owner,
            target = this.getTarget();

        if (!this.layedOut && !Ext.isEmpty(this.targetCls)) {
            target.addClass(this.targetCls);
        }

        this.onLayout(owner, target, arguments.length ? arguments : []);
        this.layedOut = true;

        this.afterLayout();
    },

    // Placeholder empty functions for subclasses to extend
    afterLayout : Ext.emptyFn,
    getLayoutItems : Ext.emptyFn,
    getTarget : Ext.emptyFn,
    onLayout : Ext.emptyFn,
    onRemove : Ext.emptyFn,
    onDestroy : Ext.emptyFn,

    // @private - Validates item is in the proper place in the dom.
    isValidParent : function(item, target) {
        var dom = item.el ? item.el.dom : Ext.getDom(item);
        return target && (dom.parentNode == (target.dom || target));
    },

    /**
     * @private
     * Iterates over all passed items, enuring they are rendered.  If the items are already rendered,
     * also determines if the items are in the proper place dom.
     */
    renderItems : function(items, target) {
        var ln = items.length,
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item && !item.rendered) {
                this.renderItem(item, i, target);
            }
            else if (!this.isValidParent(item, target)) {
                this.moveItem(item, i, target);
            }
            this.configureItem(item, i);
        }
    },

    /**
     * @private
     * Renders the given Component into the target Element.
     * @param {Ext.Component} c The Component to render
     * @param {Number} position The position within the target to render the item to
     * @param {Ext.Element} target The target Element
     */
    renderItem : function(item, position, target) {
        if (!item.rendered) {
            item.render(target, position);
        }
    },

    /**
     * Returns the target box measurements
     */
    getTargetBox : function() {
        return this.getTarget().getBox(true, true);
    },

    /**
     * @private
     * Moved Component to the provided target instead.
     */
    moveItem : function(item, position, target) {
        if (typeof position == 'number') {
            position = target.dom.childNodes[position];
        }
        // Make sure target is a dom element
        target = target.dom || target;

        target.insertBefore(item.getPositionEl().dom, position || null);

        item.container = target;
        this.configureItem(item, position);
    },

    /**
     * @private
     * Applies extraCls
     */
    configureItem: function(item, position) {
        if (this.extraCls) {
            item.getPositionEl().addClass(this.extraCls);
        }
    },

    /**
     * @private
     * Removes extraCls
     */
    afterRemove : function(item) {
        if (this.extraCls) {
            item.getPositionEl().removeClass(this.extraCls);
        }
    },

    /*
     * Destroys this layout. This is a template method that is empty by default, but should be implemented
     * by subclasses that require explicit destruction to purge event handlers or remove DOM nodes.
     * @protected
     */
    destroy : function() {
        if (!Ext.isEmpty(this.targetCls)) {
            var target = this.owner.getLayoutTarget();
            if (target) {
                target.removeClass(this.targetCls);
            }
        }
        this.onDestroy();
    }
});

/**
* @class Ext.layout.ComponentLayout
* @extends Ext.layout.Layout
* <p>This class is intended to be extended or created via the <tt><b>{@link Ext.Component#componentLayout layout}</b></tt>
* configuration property.  See <tt><b>{@link Ext.Component#componentLayout}</b></tt> for additional details.</p>
*/
Ext.layout.ComponentLayout = Ext.extend(Ext.layout.Layout, {
    // @private
    onLayout : function(owner, target, args) {
        var layout = owner.layout;
        owner.afterComponentLayout(this);

        // Run the container layout if it exists (layout for child items)
        if(layout && typeof layout.layout == 'function') {
            layout.layout();
        }
    },

    // @private - Returns empty array
    getLayoutItems : function() {
        return [];
    },

    /**
    * Returns the owner component's resize element.
    * @return {Ext.Element}
    */
    getTarget : function() {
        return this.owner.getResizeEl();
    },

    /**
    * Set the size of the target element.
    * @param {Mixed} width The new width to set.
    * @param {Mixed} height The new height to set.
    */
    setTargetSize : function(w, h) {
        var target = this.getTarget();

        if (w !== undefined && h !== undefined) {
            target.setSize(w, h);
        }
        else if (h !== undefined) {
            target.setHeight(h);
        }
        else if (w !== undefined) {
            target.setWidth(w);
        }
    }
});
/**
 * @class Ext.layout.AutoComponentLayout
 * @extends Ext.layout.ComponentLayout
 *
 * <p>The AutoLayout is the default layout manager delegated by {@link Ext.Component} to
 * render any child Elements when no <tt>{@link Ext.Component#layout layout}</tt> is configured.</p>
 */
Ext.layout.AutoComponentLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'component',

    // @private
    onLayout : function(owner, target, args) {
        var w = args[0],
            h = args[1];

        w = (typeof w == 'number' || w == 'auto') ? args[0] : undefined;
        h = (typeof h == 'number' || h == 'auto') ? args[1] : undefined;

        this.setTargetSize(w, h);

        Ext.layout.AutoComponentLayout.superclass.onLayout.call(this, owner, target, args);
    }
});

Ext.layout.TYPES['component'] = Ext.layout.AutoComponentLayout;

/**
 * @class Ext.layout.DockLayout
 * @extends Ext.layout.ComponentLayout
 * This ComponentLayout handles docking for Panels. It takes care of panels that are
 * part of a ContainerLayout that sets this Panel's size and Panels that are part of
 * an AutoContainerLayout in which this panel get his height based of the CSS or
 * or its content.
 */
Ext.layout.DockLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'dock',

    renderHidden: false,

    /**
     * @property extraCls
     * @type String
     * This class is automatically added to each docked item within this layout.
     * We also use this as a prefix for the position class e.g. x-docked-bottom
     */
    extraCls: 'x-docked',

    /**
     * @private
     * This function gets called with either a width and height inside the args
     * parameter or a boolean true, in which case the owner Panel is inside
     * a AutoContainerLayout. It will render all the docked items of the Panel,
     * and then position them according to the width and height of the Panel,
     * or the size of the body (in the case it is inside an AutoContainerLayout)
     * @param {Ext.Component} owner The Panel that owns this DockLayout
     * @param {Ext.Element} target The target in which we are going to render the docked items
     * @param {Array} args The arguments passed to the ComponentLayout.layout method
     */
    onLayout: function(owner, target, args) {
        // The getLayoutItems method returns the docked items of this layouts owner (Panel)
        var items = this.getLayoutItems(),
            w = args[0],
            h = args[1];

        var info = this.info = {
            boxes: [],
            panelSize: {
                width: w,
                height: h
            }
        };

        // We always start of by rendering all the docked items to the panel's el
        this.renderItems(items, target);

        // If we get inside this else statement, it means that the Panel has been
        // given a size by its parents container layout. In this case we want to
        // actualy set the Panel's dimensions and dock all the items.
        this.setTargetSize(w, h);
        this.dockItems(items);

        // After we docked all the items we are going to call superclass.onLayout
        // which will run the Panel's container layout.
        Ext.layout.DockLayout.superclass.onLayout.call(this, owner, target);
    },

    /**
     * @private
     * Returns an array containing all the docked items inside this layout's owner panel
     * @return {Array} An array containing all the docked items of the Panel
     */
    getLayoutItems : function() {
        return this.owner.getDockedItems() || [];
    },

    /**
     * @private
     * We are overriding the Ext.layout.Layout configureItem method to also add a class that
     * indicates the position of the docked item. We use the extraCls (x-docked) as a prefix.
     * An example of a class added to a dock: right item is x-docked-right
     * @param {Ext.Component} item The item we are configuring
     */
    configureItem : function(item, pos) {
        Ext.layout.DockLayout.superclass.configureItem.call(this, item, pos);
        if (this.extraCls) {
            item.getPositionEl().addClass(this.extraCls + '-' + item.dock);
        }

        if (item.overlay) {
            item.getPositionEl().addClass(this.extraCls + '-overlay');
        }
    },

    /**
     * @private
     * Removes the extraCls (x-docked-position)
     */
    afterRemove : function(item) {
        Ext.layout.DockLayout.superclass.afterRemove.call(this, item);
        if (this.extraCls) {
            item.getPositionEl().removeClass(this.extraCls + '-' + item.dock);
        }
        if (item.overlay) {
            item.getPositionEl().removeClass(this.extraCls + '-overlay');
        }
    },

    /**
     * @private
     * This method will first update all the information about the docked items,
     * body dimensions and position, the panel's total size. It will then
     * set all these values on the docked items and panel body.
     * @param {Array} items Array containing all the docked items
     * @param {Boolean} autoBoxes Set this to true if the Panel is part of an
     * AutoContainerLayout
     */
    dockItems : function(items, autoBoxes) {
        this.calculateDockBoxes(items, autoBoxes);

        // Both calculateAutoBoxes and calculateSizedBoxes are changing the
        // information about the body, panel size, and boxes for docked items
        // inside a property called info.
        var info = this.info,
            boxes = info.boxes,
            ln = boxes.length,
            owner = this.owner,
            target = this.getTarget(),
            box, i;

        // If the bodyBox has been adjusted because of the docked items
        // we will update the dimensions and position of the panel's body.
        owner.body.setBox({
            width: info.targetBox.width || null,
            height: info.targetBox.height || null,
            top: (info.targetBox.top - owner.el.getPadding('t')),
            left: (info.targetBox.left - owner.el.getPadding('l'))
        });

        // We are going to loop over all the boxes that were calculated
        // and set the position and size of each item the box belongs to.
        for (i = 0; i < ln; i++) {
            box = boxes[i];
            box.item.setPosition(box.left, box.top);
        }
    },

    /**
     * @private
     * This method will set up some initial information about the panel size and bodybox
     * and then loop over all the items you pass it to take care of stretching, aligning,
     * dock position and all calculations involved with adjusting the body box.
     * @param {Array} items Array containing all the docked items we have to layout
     */
    calculateDockBoxes : function(items, autoBoxes) {
        // We want to use the Panel's el width, and the Panel's body height as the initial
        // size we are going to use in calculateDockBoxes. We also want to account for
        // the border of the panel.
        var target = this.getTarget(),
            owner = this.owner,
            bodyEl = owner.body,
            info = this.info,
            ln = items.length,
            item, i, box, w, h;

        // panelSize might already have size. Dont have to calculate again?
        info.panelSize = target.getSize();
        info.targetBox = this.getTargetBox();
        info.targetBox.left -= target.getBorderWidth('l');
        info.targetBox.top -= target.getBorderWidth('t');

        // Loop over all the docked items
        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.hidden && !this.renderHidden) {
                continue;
            }

            // The initBox method will take care of stretching and alignment
            // In some cases it will also layout the dock items to be able to
            // get a width or height measurement
            box = this.initBox(item);

            // Size and layout the item if it hasn't done so by this time yet.
            item.setSize(box);

            // If we havent calculated the width or height of the docked item yet
            // do so, since we need this for our upcoming calculations
            if (box.width == undefined) {
                box.width = item.getWidth();
            }
            if (box.height == undefined) {
                box.height = item.getHeight();
            }

            box = this.adjustSizedBox(box, i);

            // Save our box. This allows us to loop over all docked items and do all
            // calculations first. Then in one loop we will actually size and position
            // all the docked items that have changed.
            info.boxes.push(box);
        }
    },

    /**
     * @private
     * This method will adjust the position of the docked item and adjust the body box
     * accordingly.
     * @param {Object} box The box containing information about the width and height
     * of this docked item
     * @param {Number} index The index position of this docked item
     * @return {Object} The adjusted box
     */
    adjustSizedBox : function(box, index) {
        var targetBox = this.info.targetBox,
            item = box.item;

        switch (box.type) {
            case 'top':
                box.top = targetBox.top;
                if (!item.overlay) {
                    targetBox.top += box.height;
                    targetBox.height -= box.height;
                }
                break;

            case 'left':
                box.left = targetBox.left;
                if (!item.overlay) {
                    targetBox.left += box.width;
                    targetBox.width -= box.width;
                }
                break;

            case 'bottom':
                box.top = (targetBox.top + targetBox.height) - box.height;
                if (!item.overlay) {
                    targetBox.height -= box.height;
                }
                break;

            case 'right':
                box.left = (targetBox.left + targetBox.width) - box.width;
                if (!item.overlay) {
                    targetBox.width -= box.width;
                }
                break;
        }
        return box;
    },

    /**
     * @private
     * This method will create a box object, with a reference to the item, the type of dock
     * (top, left, bottom, right). It will also take care of stretching and aligning of the
     * docked items.
     * @param {Ext.Component} item The docked item we want to initialize the box for
     * @return {Object} The initial box containing width and height and other useful information
     */
    initBox : function(item) {
        var targetBox = this.info.targetBox,
            horizontal = (item.dock == 'top' || item.dock == 'bottom'),
            box = {
                item: item,
                type: item.dock
            };

        // First we are going to take care of stretch and align properties for all four dock scenaries.
        if (item.stretch !== false) {
            if (horizontal) {
                box.left = targetBox.left;
                box.width = targetBox.width;
            }
            else {
                box.top = targetBox.top;
                box.height = targetBox.height;
            }
            box.stretched = true;
        }
        else {
            item.setSize(item.width || undefined, item.height || undefined);
            box.width = item.getWidth();
            box.height = item.getHeight();
            if (horizontal) {
                box.left = targetBox.left;
                if (item.align == 'right') {
                    box.left += (targetBox.width - box.width);
                }
                else if(item.align == 'center') {
                    box.left += ((targetBox.width - box.width) / 2);
                }
            }
            else {
                box.top = targetBox.top;
                if (item.align == 'bottom') {
                    box.top += (targetBox.height - box.height);
                }
                else if (item.align == 'center') {
                    box.top += ((targetBox.height - box.height) / 2);
                }
            }
        }

        return box;
    }
});

Ext.layout.TYPES['dock'] = Ext.layout.DockLayout;

/**
 * @class Ext.layout.FieldLayout
 * @extends Ext.layout.ComponentLayout
 *
 * <p>The FieldLayout is the default layout manager delegated by {@link Ext.Field} to
 * render field Elements.</p>
 */
Ext.layout.FieldLayout = Ext.extend(Ext.layout.ComponentLayout, {
    type: 'field',

    // @private
    onLayout: function(owner, target, args) {
        var w = args[0],
            h = args[1];

        this.owner = owner;
        this.handleLabel();

        owner.el.setSize(w, h);

        Ext.layout.FieldLayout.superclass.onLayout.call(this, owner, target);
    },

    // @private - Set width of the label
    handleLabel : function() {
        this.owner.labelEl.setWidth(this.owner.labelWidth);
    }
});

Ext.layout.TYPES['field'] = Ext.layout.FieldLayout;

/**
* @class Ext.layout.ContainerLayout
* @extends Ext.layout.Layout
* <p>This class is intended to be extended or created via the <tt><b>{@link Ext.Container#layout layout}</b></tt>
* configuration property.  See <tt><b>{@link Ext.Container#layout}</b></tt> for additional details.</p>
*/
Ext.layout.ContainerLayout = Ext.extend(Ext.layout.Layout, {
    /**
     * @cfg {String} extraCls
     * <p>An optional extra CSS class that will be added to the container. This can be useful for adding
     * customized styles to the container or any of its children using standard CSS rules. See
     * {@link Ext.Component}.{@link Ext.Component#ctCls ctCls} also.</p>
     * </p>
     */

    // @private
    onLayout : function(items, target) {
        this.renderItems(this.getLayoutItems(), target);
    },

    afterLayout : function() {
        this.owner.afterLayout(this);
    },

    /**
     * Returns an array of child components.
     * @return {Array} of child components
     */
    getLayoutItems : function() {
        return this.owner && this.owner.items && this.owner.items.items || [];
    },

    /**
     * Return the {@link #getLayoutTarget Ext.Container} container element used to contain the child Components.
     * @return {Ext.Element}
     */
    getTarget : function() {
        return this.owner.getLayoutTarget();
    },

    /**
     * Returns all items that have been rendered
     * @return {Array} All matching items
     */
    getRenderedItems: function() {
        var target   = this.getTarget(),
            items = this.getLayoutItems(),
            ln = items.length,
            renderedItems = [],
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.rendered && this.isValidParent(item, target)) {
                renderedItems.push(item);
            }
        }

        return renderedItems;
    },

    /**
     * Returns all items that are both rendered and visible
     * @return {Array} All matching items
     */
    getVisibleItems: function() {
        var target   = this.getTarget(),
            items = this.getLayoutItems(),
            ln = items.length,
            visibleItems = [],
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.rendered && this.isValidParent(item, target) && item.hidden !== true) {
                visibleItems.push(item);
            }
        }

        return visibleItems;
    }
});

Ext.layout.TYPES['container'] = Ext.layout.ContainerLayout;
/**
 * @class Ext.layout.AutoContainerLayout
 * @extends Ext.layout.ContainerLayout
 *
 * <p>The AutoLayout is the default layout manager delegated by {@link Ext.Container} to
 * render any child Components when no <tt>{@link Ext.Container#layout layout}</tt> is configured into
 * a <tt>{@link Ext.Container Container}.</tt>.  AutoLayout provides only a passthrough of any layout calls
 * to any child containers.</p>
 */
Ext.layout.AutoContainerLayout = Ext.extend(Ext.layout.ContainerLayout, {
    type: 'container',

    // @private
    onLayout : function(owner, target) {
        var items = this.getLayoutItems(),
            ln = items.length,
            i;

        this.renderItems(items, target);
        for (i = 0; i < ln; i++) {
            items[i].doComponentLayout(items[i].width || undefined, items[i].height || undefined);
        }
    }
});

Ext.layout.TYPES['auto'] = Ext.layout.AutoContainerLayout;
/**
 * @class Ext.layout.BoxLayout
 * @extends Ext.layout.ContainerLayout
 * <p>Base Class for HBoxLayout and VBoxLayout Classes. Generally it should not need to be used directly.</p>
 */
Ext.layout.BoxLayout = Ext.extend(Ext.layout.ContainerLayout, {
    type: 'box',

    targetCls: 'x-layout-box',
    //wrapCls: 'x-layout-box-wrap',
    innerCls: 'x-layout-box-inner',

    pack : 'start',
    direction: 'normal',
    align: 'center',

    /**
     * @private
     * Runs the child box calculations and caches them in childBoxCache. Subclasses can used these cached values
     * when laying out
     */
    onLayout: function(owner, target) {
        Ext.layout.BoxLayout.superclass.onLayout.call(this, owner, target);

        if (this.pack === 'left' || this.pack === 'top') {
            this.pack = 'start';
        }
        else if (this.pack === 'right' || this.pack === 'bottom') {
            this.pack = 'end';
        }

        this.innerCt.setStyle({
            '-webkit-box-orient': this.orientation,
            '-webkit-box-direction': this.direction,
            '-webkit-box-pack': this.pack,
            '-webkit-box-align': this.align
        });

        if (target != this.innerCt) {
            width = target.getWidth(true);
            height = target.getHeight(true);
            if (width > 0) {
                this.innerCt.setWidth(width);
            }
            if (height > 0) {
                this.innerCt.setHeight(height);
            }
            this.innerCt.setSize(target.getWidth(true), target.getHeight(true));
        }

        this.handleBoxes(target);

        if (this.totalWidth) {
            this.innerCt.setWidth(Math.max(target.getWidth(true), this.totalWidth));
            var height = target.getHeight(true);
            if (height > 0) {
                this.innerCt.setHeight(height);
            }
        }

        if (this.totalHeight) {
            this.innerCt.setHeight(Math.max(target.getHeight(true), this.totalHeight));
            var width = target.getWidth(true);
            if (width > 0) {
                this.innerCt.setWidth(width);
            }
        }
    },

    renderItems : function(ct) {
        if (!this.innerCt) {
            if (this.owner.scrollEl) {
                this.innerCt = this.owner.scrollEl.addClass(this.innerCls);
            }
            else {
                this.innerCt = this.getTarget().createChild({
                    cls: this.innerCls
                });
            }
        }

        Ext.layout.BoxLayout.superclass.renderItems.call(this, ct, this.innerCt);
    }
});

/**
 * @class Ext.layout.HBoxLayout
 * @extends Ext.layout.BoxLayout
 * <p>A layout that arranges items horizontally across a Container. This layout optionally divides available horizontal
 * space between child items containing a numeric <code>flex</code> configuration.</p>
 * This layout may also be used to set the heights of child items by configuring it with the {@link #align} option.
 */
Ext.layout.TYPES['hbox'] = Ext.layout.HBoxLayout = Ext.extend(Ext.layout.BoxLayout, {
    orientation: 'horizontal',

    handleBoxes : function(target) {
        var items = this.getLayoutItems(),
            ln = items.length,
            width, item, i, size;

        if (target === this.innerCt) {
            target.setWidth(target.parent().getWidth(true));
        }

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.flex != undefined) {
                item.el.setWidth(0);
                item.el.setStyle('-webkit-box-flex', item.flex);
            }
            else {
                item.doComponentLayout(item.width, item.height);
            }
        }

        this.totalWidth = 0;
        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.flex != undefined) {
                width = item.el.getWidth();
                item.el.setStyle('-webkit-box-flex', null);
                item.doComponentLayout(width, item.height || undefined);
            }
            this.totalWidth += (item.el.getWidth() + item.el.getMargin('lr'));
        }
    }
});

/**
 * @class Ext.layout.VBoxLayout
 * @extends Ext.layout.BoxLayout
 * <p>A layout that arranges items vertically down a Container. This layout optionally divides available vertical
 * space between child items containing a numeric <code>flex</code> configuration.</p>
 * This layout may also be used to set the widths of child items by configuring it with the {@link #align} option.
 */
Ext.layout.TYPES['vbox'] = Ext.layout.VBoxLayout = Ext.extend(Ext.layout.BoxLayout, {
    orientation: 'vertical',

    handleBoxes : function(target) {
        var items = this.getLayoutItems(),
            ln = items.length,
            item, i, size, height;

        if (target === this.innerCt) {
            target.setHeight(target.parent().getHeight(true));
        }

        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.flex != undefined) {
                item.el.setHeight(0);
                item.el.setStyle('-webkit-box-flex', item.flex);
            }
            else {
                item.doComponentLayout(item.width, item.height);
            }
        }

        this.totalHeight = 0;
        for (i = 0; i < ln; i++) {
            item = items[i];
            if (item.flex != undefined) {
                height = item.el.getHeight();
                item.el.setStyle('-webkit-box-flex', null);
                item.doComponentLayout(item.width || undefined, height);
            }
            this.totalHeight += (item.el.getHeight() + item.el.getMargin('tb'));
        }
    }
});
/**
 * @class Ext.layout.FitLayout
 * @extends Ext.layout.ContainerLayout
 * <p>This is a base class for layouts that contain <b>a single item</b> that automatically expands to fill the layout's
 * container.  This class is intended to be extended or created via the <tt>layout:'fit'</tt> {@link Ext.Container#layout}
 * config, and should generally not need to be created directly via the new keyword.</p>
 * <p>FitLayout does not have any direct config options (other than inherited ones).  To fit a panel to a container
 * using FitLayout, simply set layout:'fit' on the container and add a single panel to it.  If the container has
 * multiple panels, only the first one will be displayed.  Example usage:</p>
 */

 Ext.layout.FitLayout = Ext.extend(Ext.layout.ContainerLayout, {
    extraCls: 'x-fit-item',
    targetCls: 'x-layout-fit',
    type: 'fit',
    hideInactive: true,
    
    // @private
    onLayout : function(owner, target) {
        Ext.layout.FitLayout.superclass.onLayout.call(this, owner, target);

        var targetBox = this.getTargetBox();
        if (!this.lastTargetBox || targetBox.width != this.lastTargetBox.width || targetBox.height != this.lastTargetBox.height) {
            this.setItemBox(this.activeItem, targetBox);
            this.lastTargetBox = targetBox;
        }
    },

    // @private
    setOwner : function(owner) { 
        Ext.layout.FitLayout.superclass.setOwner.call(this, owner);
        this.activeItem = this.parseActiveItem(owner.activeItem);
    },

    // @private
    setItemBox : function(item, box) {
        if (item && box.height > 0) {
            box.width -= item.el.getMargin('lr');
            box.height -= item.el.getMargin('tb');
            item.setSize(box);
            item.setPosition(box);
        }
    },

    // @private
    configureItem: function(item, position) {
        Ext.layout.FitLayout.superclass.configureItem.call(this, item, position);
        if (this.hideInactive && this.activeItem !== item) {
            item.hide();
        }
        else {
            item.show();
        }
    },

    // @private
    parseActiveItem : function(item) {
        if (item && item.isComponent) {
            return item;
        }
        else if (typeof item == 'number' || item == undefined) {
            return this.getLayoutItems()[item || 0];
        }
        else {
            return this.owner.getComponent(item);
        }
    }
});

Ext.layout.TYPES['fit'] = Ext.layout.FitLayout;
/**
 * @class Ext.layout.CardLayout
 * @extends Ext.layout.FitLayout
 * <p>This layout manages multiple child Components, each is fit to the Container, where only a single child Component
 * can be visible at any given time.  This layout style is most commonly used for wizards, tab implementations, etc.
 * This class is intended to be extended or created via the layout:'card' {@link Ext.Container#layout} config,
 * and should generally not need to be created directly via the new keyword.</p>
 * <p>The CardLayout's focal method is {@link #setActiveItem}.  Since only one panel is displayed at a time,
 * the only way to move from one Component to the next is by calling setActiveItem, passing the id or index of
 * the next panel to display.  The layout itself does not provide a user interface for handling this navigation,
 * so that functionality must be provided by the developer.</p>
 */

Ext.layout.CardLayout = Ext.extend(Ext.layout.FitLayout, {
    type: 'card',
    sizeAllCardsOnLayout: false,
    
    onLayout : function() {
        if (this.sizeAllCardsOnLayout) {
            Ext.layout.FitLayout.superclass.onLayout.apply(this, arguments);

            var items = this.getLayoutItems(),
                ln = items.length,
                targetBox = this.getTargetBox(),
                i, item;
                
            for (i = 0; i < ln; i++) {
                item = items[i];
                this.setItemBox(item, targetBox);
            }
        }
        else {
            Ext.layout.CardLayout.superclass.onLayout.apply(this, arguments);            
        }

        if (!this.layedOut && this.activeItem) {
            if (this.activeItem.fireEvent('beforeactivate', this.activeItem) !== false) {
                this.activeItem.fireEvent('activate', this.activeItem);
            }
        }
    },

    setOwner : function(owner) {
        Ext.layout.CardLayout.superclass.setOwner.call(this, owner);

        Ext.applyIf(owner, {
            setCard : function(item, animation) {
                this.layout.setActiveItem(item, animation);
            }
        });
    },

    /**
     * Sets the active (visible) item in the layout.
     * @param {String/Number} item The string component id or numeric index of the item to activate
     */
    setActiveItem : function(item, animation) {
        var me = this,
            doc = Ext.getDoc(),
            old = me.activeItem;

        animation = (animation == undefined) ? this.owner.animation : animation;
        
        item = this.parseActiveItem(item);
        // Is this a valid, different card?

        if (item && old != item) {
            if (!item.rendered) {
                this.renderItem(item, this.owner.items.length, this.getTarget());
                this.configureItem(item, 0);
            }

            // This will show and size the new activeItem
            if (this.hideInactive) {
                item.show();                
            }
            
            if (!this.sizeAllCardsOnLayout) {
                this.setItemBox(item, this.getTargetBox());
            }            

            if (item.fireEvent('beforeactivate', item, old) === false) {
                return;
            }
            if (old && old.fireEvent('beforedeactivate', old, item) === false) {
                return;
            }

            if (animation) {
                function preventDefault(e) {
                    e.preventDefault();
                };
                doc.on('click', preventDefault, this, {single: true});

                var inConfig = {}, inAnim;

                if (Ext.isObject(animation) && !animation.run) {
                    inConfig = Ext.apply({}, animation || {});
                    inAnim = inConfig.type;
                }
                else if (Ext.isString(animation)) {
                    inAnim = animation;
                }
                else if (animation.run) {
                    // Can't? need to set after manually...
                    // Assign after to activate?
                }

                inConfig.after = function() {
                    (function() {
                        doc.un('click', preventDefault, this);
                    }).defer(50, this);
                    item.fireEvent('activate', item, old);
                };
                inConfig.scope = this;

                inConfig.out = false;
                inConfig.autoClear = true;

                Ext.anims[inAnim].run(item.el, inConfig);

            }
            else {
                item.fireEvent('activate', item, old);
            }

            if (old && animation) {
                var outConfig = {}, outAnim;

                if (Ext.isObject(animation) && !animation.run) {
                    outConfig = Ext.apply({}, animation || {});
                    outAnim = outConfig.type;
                }
                else if (Ext.isString(animation)) {
                    outAnim = animation;
                }

                outConfig.after = function() {
                    old.fireEvent('deactivate', old, item);
                    if (me.hideInactive && me.activeItem != old) {
                        old.hide();
                    }
                };

                outConfig.out = true;
                outConfig.autoClear = true;

                Ext.anims[outAnim].run(old.el, outConfig);
            }
            else if (old) {
                if (me.hideInactive) {
                    old.hide();
                }
                old.fireEvent('deactivate', old, item);
            }

            // Change activeItem reference
            me.activeItem = item;
            me.owner.fireEvent('cardswitch', item, old, me.owner.items.indexOf(item));
            
            return me.activeItem;
        }
        
        return false;
    },

    /**
     * Return the active (visible) component in the layout.
     * @returns {Ext.Component}
     */    
    getActiveItem : function() {
        if (this.owner.items.items.indexOf(this.activeItem) != -1) {
            return this.activeItem;
        }
        return null;
    },

    /**
     * Return the active (visible) component in the layout to the next card, optional wrap parameter to wrap to the first
     * card when the end of the stack is reached.
     * @param {boolean} wrap Wrap to the first card when the end of the stack is reached.
     * @returns {Ext.Component}
     */
    getNext : function(wrap) {
        var items = this.getLayoutItems(),
            index = items.indexOf(this.activeItem);
        return items[index+1] || (wrap ? items[0] : false);
    },

    /**
     * Sets the active (visible) component in the layout to the next card, optional wrap parameter to wrap to the first
     * card when the end of the stack is reached.
     * @param {Mixed} anim Animation to use for the card transition
     * @param {boolean} wrap Wrap to the first card when the end of the stack is reached.
     */
    next : function(anim, wrap) {
        return this.setActiveItem(this.getNext(wrap), anim);
    },

    /**
     * Return the active (visible) component in the layout to the previous card, optional wrap parameter to wrap to
     * the last card when the beginning of the stack is reached.
     * @param {boolean} wrap Wrap to the first card when the end of the stack is reached.
     * @returns {Ext.Component}
     */
    getPrev : function(wrap) {
        var items = this.getLayoutItems(),
            index = items.indexOf(this.activeItem);
        return items[index-1] || (wrap ? items[items.length-1] : false);
    },

    /**
     * Sets the active (visible) component in the layout to the previous card, optional wrap parameter to wrap to
     * the last card when the beginning of the stack is reached.
     * @param {Mixed} anim Animation to use for the card transition
     * @param {boolean} wrap Wrap to the first card when the end of the stack is reached.
     */
    prev : function(anim, wrap) {
        return this.setActiveItem(this.getPrev(wrap), anim);
    }
});

Ext.layout.TYPES['card'] = Ext.layout.CardLayout;

