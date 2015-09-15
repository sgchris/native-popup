(function() {
    "use strict";
    
    /**
     * Apply styles to an object
     * @param elem DOMElement
     * @param stylesObj object with styles, keys must be keys of element's "style" object
     * @return bool
     */
    var applyStyles = function(elem, stylesObj) {
        if (stylesObj instanceof Object === false) {
            return false;
        }
        
        if (Object.keys(stylesObj).length === 0) {
            return false;
        }
        
        if (!elem) {
            return false;
        }
        
        var styleName;
        for (styleName in stylesObj) {
            if (stylesObj.hasOwnProperty(styleName)) {
                elem.style[styleName] = stylesObj[styleName];
            }
        }
        
        return true;
    };

    // merge two objects
    var mergeOptions = function(obj1, obj2) {
        var obj3 = {};
        
        for (var attrname in obj1) { 
            if (obj1.hasOwnProperty(attrname)) {
                obj3[attrname] = obj1[attrname]; 
            }
        }
        
        for (var attrname in obj2) { 
            if (obj2.hasOwnProperty(attrname)) {
                obj3[attrname] = obj2[attrname]; 
            }
        }
        
        return obj3;
    };
    
    /**
     * @constructor
     * popup class
     * @param html - html inside the popup
     * @param buttons - [{caption: 'click me!', callback: function(popupObject) { ... }}, ...]
     */
    var NativePopup = function(html, buttons, options) {
        
        this.options = mergeOptions(this.defaultOptions, options);
        
        this.id = Math.round(Math.random() * 100000);
        
        // popup parameters
        this.html = html || '';
        this.buttons = buttons;
        if (!this.buttons || (this.buttons instanceof Array) === false || this.buttons.length === 0) {
            this.buttons = [];
        }
        
        // cache popup's DOM elements
        this.blurScreen = document.getElementById('sp-blur-screen-' + this.id);
        this.popup = document.getElementById('sp-popup-window-' + this.id);
        this.closePopupButton = document.getElementById('sp-close-popup-' + this.id);
        this.popupContent = document.getElementById('sp-popup-content-' + this.id);
        this.popupButtonsWrapper = document.getElementById('sp-popup-buttons-' + this.id);
        
        // process dimensions
        var that = this;
        this._updateScreenDimensions = function() {
            that.screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            that.screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        };
        this._updatePopupDimensions = function() {
            that._updateScreenDimensions();
            that.popup.style.top = ((parseInt(that.screenHeight, 10) / 2) - (parseInt(that.popup.clientHeight, 10) / 2)) + 'px';
            that.popup.style.left = ((parseInt(that.screenWidth, 10) / 2) - (parseInt(that.popup.clientWidth, 10) / 2)) + 'px';
        };
    };
    
    // default options parameter to the object
    NativePopup.prototype.defaultOptions = {
        width: 400,
        height: 300
    }

    /**
     * on every created DOM element of the popup, apply CSS styles (inline)
     */
    NativePopup.prototype._applyPopupStyles = function() {
        var styleName,
            that = this;
        
        // blur screen - white curtain
        var blurScreenStyles = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            position: 'fixed',
            opacity: 0.85,
            background: '#FFF',
            zIndex: 1001
        };
        for (styleName in blurScreenStyles) {
            if (!blurScreenStyles.hasOwnProperty(styleName)) {
                continue;
            }
            this.blurScreen.style[styleName] = blurScreenStyles[styleName];
        }
        
        // the popup itself
        var minPopupWidth = Math.ceil(this.screenWidth * 0.30);
        if (!that.options.width || that.options.width < minPopupWidth) that.options.width = minPopupWidth;
        var maxPopupWidth = Math.ceil(this.screenWidth * 0.85);
        if (!that.options.width || that.options.width > maxPopupWidth) that.options.width = minPopupWidth;
        var minPopupHeight = Math.ceil(this.screenHeight * 0.30);
        if (!that.options.height || that.options.height < minPopupHeight) that.options.height = minPopupHeight;
        var maxPopupHeight = Math.ceil(this.screenHeight * 0.85);
        if (!that.options.height || that.options.height > maxPopupHeight) that.options.height = maxPopupHeight;
        
        var popupStyles = {
            border: '1px solid #CCC',
            boxShadow: '0 0 5px rgba(0,0,0,0.3)',
            position: 'fixed',
            width: that.options.width + 'px',
            height: that.options.height + 'px',
            maxWidth: maxPopupWidth,
            minWidth: minPopupWidth,
            maxHeight: maxPopupHeight,
            minHeight: minPopupHeight,
            overflow: 'hidden',
            background: '#FFF',
            zIndex: 1002
        };
        applyStyles(this.popup, popupStyles);
        
        // popup's close button
        var popupCloseStyles = {
            'float': 'right',
            width: '20px',
            height: '20px',
            lineHeight: '20px',
            textAlign: 'center',
            color: '#CCC',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'verdana, monospace'
        };
        applyStyles(this.closePopupButton, popupCloseStyles);
        
        // popup's content
        var popupContentStyles = {
            overflow: 'auto',
            height: popupStyles.height
        };
        applyStyles(this.popupContent, popupContentStyles);
        
        // the buttons and their wrapper styles
        if (this.popupButtonsWrapper) {
            // buttons wrapper styles
            var popupButtonsWrapperStyles = {
                padding: '10px',
                overflow: 'hidden'
            };
            for (styleName in popupButtonsWrapperStyles) {
                if (!popupButtonsWrapperStyles.hasOwnProperty(styleName)) {
                    continue;
                }
                this.popupButtonsWrapper.style[styleName] = popupButtonsWrapperStyles[styleName];
            }
            
            // every button's style
            var popupButtonsStyles = {
                'float': 'right',
                marginLeft: '10px'
            };
            [].forEach.call(this.popupButtonsWrapper.querySelectorAll('button'), function(buttonElem) {
                applyStyles(buttonElem, popupButtonsStyles);
            });
        }
    };

    /**
     * display the popup
     */
    NativePopup.prototype.show = function() {
        var that = this;
        
        // create DOM elements
        if (!this.blurScreen) {
            this.blurScreen = document.createElement('div');
            this.blurScreen.setAttribute('id', 'sp-blur-screen-' + this.id);
            document.body.appendChild(this.blurScreen);
        }
        if (!this.popup) {
            this.popup = document.createElement('div');
            this.popup.setAttribute('id', 'sp-popup-window-' + this.id);
            document.body.appendChild(this.popup);
        }
        if (!this.closePopupButton) {
            this.closePopupButton = document.createElement('div');
            this.closePopupButton.setAttribute('id', 'sp-close-popup-' + this.id);
            this.closePopupButton.setAttribute('title', 'close');
            this.closePopupButton.textContent = 'X';
            this.closePopupButton.addEventListener('click', function() {
                that.close();
            });
            this.popup.appendChild(this.closePopupButton);
        }
        if (!this.popupContent) {
            this.popupContent = document.createElement('div');
            this.popupContent.setAttribute('id', 'sp-popup-content-' + this.id);
            this.popup.appendChild(this.popupContent);
        }
        
        // set popup HTML
        if (this.html && this.html.length > 0) {
            this.popupContent.innerHTML = this.html;
        }
        
        // add buttons
        if (this.buttons.length > 0) {
            // add buttons wrapper
            if (!this.popupButtonsWrapper) {
                this.popupButtonsWrapper = document.createElement('div');
                this.popupButtonsWrapper.setAttribute('id', 'sp-popup-buttons-' + this.id);
                this.popup.appendChild(this.popupButtonsWrapper);
            }
            
            // clear previous buttons content if was
            this.popupButtonsWrapper.innerHTML = '';
            
            // add buttons (in a reverse order)
            this.buttons.reverse().forEach(function(button) {
                var newButton = document.createElement('button');
                newButton.innerHTML = button.caption;
                if (button.callback && typeof(button.callback) == 'function') {
                    newButton.addEventListener('click', button.callback);
                }
                that.popupButtonsWrapper.appendChild(newButton);
            });
            
            // reverse back
            this.buttons.reverse();
        }
        
        // set the styles to the new DOM elements
        this._applyPopupStyles();
        
        // keep popup's dimensions updated
        this._updatePopupDimensions();
        window.addEventListener('resize', this._updatePopupDimensions);
    };

    /**
     * @public
     * close the popup
     */
    NativePopup.prototype.close = function() {
        // release event listeners
        window.removeEventListener('resize', this._updatePopupDimensions);
        
        // remove dom elements
        if (this.blurScreen) {
            this.blurScreen.parentNode.removeChild(this.blurScreen);
        }
        if (this.popup) {
            this.popup.parentNode.removeChild(this.popup);
        }
        
        // deinit DOM cache objects
        this.blurScreen = null;
        this.popup = null;
        this.closePopupButton = null;
        this.popupContent = null;
        this.popupButtonsWrapper = null;
    };

    // export the function (just in case)
    window.NativePopup = NativePopup;
}());
