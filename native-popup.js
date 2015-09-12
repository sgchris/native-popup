
/**
 * @brief popup class
 * @param html - html inside the popup
 * @param buttons - [{caption: 'click me!', callback: function(popupObject) { ... }}, ...]
 */
var NativePopup = function(html, buttons) {
	this.id = Math.round(Math.random() * 100000);
	
	// popup parameters
	this.html = html || '';
	this.buttons = buttons;
	if (!this.buttons || !(this.buttons instanceof Array) || !(this.buttons.length > 0)) {
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
		that.popup.style.top = ((parseInt(that.screenHeight) / 2) - (parseInt(that.popup.clientHeight) / 2)) + 'px';
		that.popup.style.left = ((parseInt(that.screenWidth) / 2) - (parseInt(that.popup.clientWidth) / 2)) + 'px';
	};
};

/**
 * @brief on every created DOM element of the popup, apply CSS styles (inline)
 */
NativePopup.prototype._applyPopupStyles = function() {
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
	for (var styleName in blurScreenStyles) {
		this.blurScreen.style[styleName] = blurScreenStyles[styleName];
	}
	
	// the popup itself
	var popupStyles = {
		border: '1px solid #CCC',
		boxShadow: '0 0 5px rgba(0,0,0,0.3)',
		minWidth: '400px',
		position: 'fixed',
		background: '#FFF',
		zIndex: 1002
	};
	for (var styleName in popupStyles) {
		this.popup.style[styleName] = popupStyles[styleName];
	}
	
	// popup's close button
	var popupCloseStyles = {
		float: 'right',
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
	for (var styleName in popupCloseStyles) {
		this.closePopupButton.style[styleName] = popupCloseStyles[styleName];
	}
	
	// popup's content
	var popupContentStyles = {
		overflow: 'auto',
		minHeight: '300px',
	};
	for (var styleName in popupContentStyles) {
		this.popupContent.style[styleName] = popupContentStyles[styleName];
	}
	
	// the buttons and their wrapper styles
	if (this.popupButtonsWrapper) {
		// buttons wrapper styles
		var popupButtonsWrapperStyles = {
			padding: '10px',
			overflow: 'hidden'
		}
		for (var styleName in popupButtonsWrapperStyles) {
			this.popupButtonsWrapper.style[styleName] = popupButtonsWrapperStyles[styleName];
		}
		
		// every button's style
		var popupButtonsStyles = {
			float: 'right',
			marginLeft: '10px'
		};
		for (var styleName in popupButtonsStyles) {
			[].forEach.call(this.popupButtonsWrapper.querySelectorAll('button'), function(buttonElem) {
				buttonElem.style[styleName] = popupButtonsStyles[styleName];
			});
		}
	}
}

/**
 * @brief display the popup
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
			newButton.addEventListener('click', button.callback);
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
}

/**
 * @public
 * @brief close the popup
 */
NativePopup.prototype.close = function() {
	// release event listeners
	window.removeEventListener('resize', this._updatePopupDimensions);
	
	// remove dom elements
	this.blurScreen && this.blurScreen.parentNode.removeChild(this.blurScreen);
	this.popup && this.popup.parentNode.removeChild(this.popup);
	
	// deinit DOM cache objects
	this.blurScreen = null;
	this.popup = null;
	this.closePopupButton = null;
	this.popupContent = null;
	this.popupButtonsWrapper = null;
}
