Popup object written in native JavaScript. White transparent background and white popup in the middle of the page.

Usage:
```
    var popup = new NativePopup(HTML, buttonsArray)
	popup.show();
	popup.close();
```

Example
```
	var popupHtml = "<h1>My Title</h1>" + 
		"<p>Some text to display inside the popup</p>";
	var popup = new NativePopup(popupHtml, [{
		caption: 'Ok',
		callback: function() {
			doSomethingHere();
			
			doSomeAjaxHere(function ajaxCallbackFn() {
				popup.close();
			});
		}
	}, {
		caption: 'Cancel',
		callback: function() {
			popup.close();
		}
	}])
```

