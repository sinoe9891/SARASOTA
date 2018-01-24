// ************************************************************************************************************************************************
// NOTE: this file is parsed by php therefore there is php logic in here... 
// ************************************************************************************************************************************************

if (typeof W === 'undefined')
	var W = {};

var DEV = parseInt(''); 
var DEATHSTAR = parseInt('0');
var BASE_DOMAIN = 'footguides.com';

var HOME_KEY = 'zdBUWBx25SxJSo4DFLDlrQ'; 
var LOGIN_SUCCESS_KEY = 'zlflILCTf7ytRV08DJ2uvx';
var LOGIN_PLUS_SUCCESS_KEY = '2BFt6if4cP2mibOjRlcW7t';
var LOGIN_TEACHER_SUCCESS_KEY = 'xpZ0xXyFEsApkZKSC3Ekoz';
var LOGIN_TEAM_SUCCESS_KEY = 'ZTUjPZfryqJbwqzuDv4xXe';
var LOGIN_STUDENT_SUCCESS_KEY = 'UKXP5p4Ffbrn5PHvwUI6h9';
var FEATURED_KEYS = [HOME_KEY, LOGIN_SUCCESS_KEY, LOGIN_PLUS_SUCCESS_KEY,LOGIN_TEAM_SUCCESS_KEY, LOGIN_TEACHER_SUCCESS_KEY, LOGIN_STUDENT_SUCCESS_KEY];

var SESSION_LIFETIME = '3600';

var WP_MIN_WIDTH = "50";
var WP_MIN_HEIGHT = "30";
var WP_MAX_WIDTH = "3000";
var WP_MAX_HEIGHT = "3000";

var THUMB_SERVER_DOMAIN = 'middlespot.com';
var THUMB_SERVER_SUBDOMAIN = 'img';
var THUMB_SERVER_URI = '/getthumbnail.php';
var IS_IMAGE_SERVER = parseInt('0');

// currently NOT hacked to start with img8 as first server (rather than img0) to skip the liquid server
var NUM_SERVERS = parseInt('1');
var NUM_IMAGES_PER_SERVER = parseInt('2');
var SKIP_SERVERS = parseInt('3');
var WORKPAD_SERVER_NUM = parseInt('0'); // defines image server number (1,2,...) to use. if 0 then any server, as defined by NUM_SERVERS, is used

var BOOKLET = "book";
var LIVE = "";
var MODE_LABEL = "booklet";
var BOOKLET_LABEL = "simple";

var AD_FREQUENCY = "3";

var ACCOUNT_LABEL = $.parseJSON("{\"0\":\"Free\",\"1\":\"Hero\",\"2\":\"Education\",\"3\":\"Team\",\"4\":\"Hero (Wix)\",\"5\":\"Student\",\"11\":\"Hero (Monthly)\"}");
var ACCOUNT_RENEWAL_LEAD_DAYS = "30";

var BOOKLET_TRIAL_DAYS = parseInt('14');
var DELETE_REMOVAL_DAYS = parseInt('90');

var currentDate = new Date();
var currentTime = currentDate.getTime(); // used for creating unique image urls to avoid browser cache.
//alert(currentTime);

var rdpResults = new Array();

var workpad_url = "workpad.php";

var validateEmail = /^([A-Za-z0-9\.\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

var twitterRefreshIntervalId;

var	IOS = '';
var	IPAD = '';
var	MOBILE = '';
var	ANDROID = '';
var	BLACKBERRY = '';
var TABLET = '';
var HANDHELD = '';
var IPHONE = '';

var FB_APP_ID = '1447468335523804';

var WIMPY_REG_CODE = 'Mm8xaiUyOHY5NG0lN0RGSSUzRGlGTUUlMjklMkFMJTNCV091RSUyQSUyNnZMJTJGWXZjZ052';


var popup_history = new Array();

var isOpera = !!(window.opera && window.opera.version);  // Opera 8.0+
var isFirefox = testCSS('MozBoxSizing');                 // FF 0.8+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0; // At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !isSafari && testCSS('WebkitTransform');  // Chrome 1+
var isIE = /*@cc_on!@*/false || testCSS('msTransform');  // At least IE6

function testCSS(prop) {
    return prop in document.documentElement.style;
}

resultNum = 0;

// get the thumbnail image url based on the website's url, the desired with of the image, and the result number to define which server to go to.
// optionally the workpad flag tells the image server this is a workpad image and should be pulled from the workpad image cache, if possible.
// optionally the refresh flag if set to true forces the image to be re-rendered from and not pulled from cache. 
function getThumbnailSrc (url, width, workpad, refresh)
{
	if (url){
		var searchType = parseQueryString('searchType');
		var noCacheString = (refresh) ? "&noCache=1" : "";
		var workpadString = (workpad) ? "&workpad=1" : "";
		var serverNum = (workpad && WORKPAD_SERVER_NUM) ? WORKPAD_SERVER_NUM : resultNum++ % NUM_SERVERS + 1 + SKIP_SERVERS;  
		var imageNum = parseInt(resultNum / NUM_SERVERS) % NUM_IMAGES_PER_SERVER;
		var serverNumStr = (serverNum < 10) ? "0"+serverNum : serverNum;
		var subdomain = THUMB_SERVER_SUBDOMAIN+serverNumStr;
		var hostname = 'img.'+THUMB_SERVER_DOMAIN;

		// most url characeters we want to have escaped but ampersands converted to &amp; need to be converted back.
		var imgSrc = "http://"+hostname+THUMB_SERVER_URI+"?w="+getImageWidth(width)+"&searchType="+searchType+noCacheString+workpadString+"&url="+escape(url.replace('&amp;','&'))+"#"+currentTime;

		return imgSrc;
	} else {
		return '';
	} // end: if
} // end: getThumbnailSrc

// return the value from imageWidths array that is the next biggest from w, or the biggest entry in imageWidths.
// assumes imageWidths is sorted from smallest to largest.
function getImageWidth(w)
{
  var imageWidths = new Array (160,320,640,800,1024);

  for (var i in imageWidths){
    if (imageWidths[i] > w){
      return imageWidths[i];
    } // end: if
  } // end: for

  return imageWidths[imageWidths.length-1];
} // end: if



// There are for the javascript for the popup windows 
function HideDIV(d, callback) { 
	var selector = (typeof d == 'string') ? "#"+d : ((typeof d == 'object') ? d : ".popupOpen, .reveal-modal.open");
	
	$(selector).each(function(){
		if ($(this).hasClass('reveal-modal')){
			$(this).trigger('reveal:close');
		} else {
			$(this)
				.removeClass('popupOpen')
				.fadeOut(callback);
		}
	});
	
	// clear the popup history
	popup_history= new Array();
}

// if 'force' parameter is an object the parameters of the object will be passed as POST data to the popup.
function DisplayDIV(d,noHide, no_history, closed, force) {
	// d (the intended div id of the modal) is an object then assume this is an existing jquery object
	// pointing to the modal and extract the id attribute from the modal and use that instead. 
	if (typeof d == 'object')
		d = d.attr('id');
	
	if (!d)
		return;
	
	if(!noHide) {
		$(".popupOpen,.animating").each(function(){
			var $this = $(this);
			$this.css("display","none").removeClass('popupOpen');
			if (!no_history){
				popup_history.push($this.attr('id'));
				//alert("new: "+d+", old: "+$this.attr('id')+", num: "+popup_history.length);
				//$this.css("display","none");
				$this.hide();
			}
		});
	}
	
	if (loadPopup(d, force, true)){
		$popup = $("#"+d); 

		// automatically initialize any input fields in the popup that have a field name
		// that matches a workpad attribute, as long as that input field does not have an existing value.
		$popup.find('input,textarea').each(function(){
			var $this = $(this);
			var name = $this.attr('name');
			if (!$this.hasClass('novalue') && typeof W != 'undefined' && W[name])
				if ($this.is(':checkbox'))
					$this.prop('checked', (W[name] == '1'));
				else if (!$this.val()) 
					$this.val(W[name]);
		});

		// suppress normal popup behaviour for any div having the data-reveal-id attribute set as it should be handled by Foundation.
		if ($popup.hasClass('reveal-modal')){


			//!$popup.find('.sb-back-reveal-modal').length &&
			$popup.find('.sb-back-reveal-modal').remove();
			$popup.find('.close-reveal-modal:not(.keep)').remove();
			if ( popup_history.length && !$popup.hasClass('noback'))
				$popup.append("<a class='.sb-back-reveal-modal'>&lt;</a>");
			//if (!$popup.find('.close-reveal-modal').length)
			if (!$popup.hasClass('noclose'))
				$popup.append("<a class='close-reveal-modal'>&#215;</a>");

			$popup.reveal({closed : closed});

		} else if ($popup.hasClass("modal")) {
			// Handle a material modal.
      if ($popup.length){
          $popup.openModal();
      }

		} else {

			// KK [2014-01-21]:  Some modals (like the CTAs in publish.php) still need this code.
			// add/replace popup close button with standard button toolset
			$popup.find('img.metrobarexit:not(.closecolorpicker)').closest('div').remove();
			if ($popup.find("div.popup_buttons").length == 0){
				$popup.prepend(
					'<div class="popup_buttons" > ' +
					((popup_history.length && !$popup.hasClass('noback')) ? '<img src="/img/navsprite.png" class="metrobarbackmodal">' : '' ) +
					(!$popup.hasClass('nohelp') ? '<img src="/img/navsprite.png" class="metrobarhelpmodal">' : '') +
					(!$popup.hasClass('noclose') ? '<span class="metrobarexit">&#8217;</span>' : '') +
					'</div>'
				);
			}

			console.log("adding class popupOpen");
			$popup.addClass('popupOpen').fadeIn();
		} // end: if		
	
	} // end: if

	// Warning Duplicate IDs
	//console.clear();
	if (DEV){
		$('[id]').each(function(){
		  var ids = $('[id="'+this.id+'"]');
		  if(ids.length>1 && ids[0]==this)
		    console.warn('Multiple IDs ('+ids.length+') #'+this.id);
		});
	}

	return $popup;
} // end: DisplayDIV

/**
 * loadPopup : loads a popup modal from the /popups/ directory having filename /popups/popup_{id}.php, via the /popups.php script.
 * if 'force' parameter is an object the parameters of the object will be passed as POST data to the popup.
 * 
 * returns the jquery object for the popup modal.
 */
function loadPopup (id, force, forDisplay, callback){
	if (force)
		$("#"+id).remove();
	
	if (! $("#"+id).length){
		var workpad_id = typeof W != 'undefined' ? W['id'] : null;
		var page = typeof $global != 'undefined' ? $global.currentPage : null;
		var workpad_entry_id = $(".resultDiv.clicked").length = 1 ? $(".resultDiv.clicked").data('id') : null;
		var data = { id : id, workpad_id : workpad_id, page : page, workpad_entry_id : workpad_entry_id };
		if (typeof force == 'object')
			for (var i in force)
				data[i] = force[i];
		$.ajax({ 
				url :	"/popups.php",
				type : 	"POST",
				data : 	data, 
				success : function(data){
					// console.log("lP 2 data="+data);		
					$("body").append($(data));
					// console.log("lP 3");		
					if (typeof set_rdp_vars != 'undefined') 
						set_rdp_vars();
					if (typeof callback === 'function')
						callback(id, data);
				},
				error : (typeof ajaxError === 'function') ? ajaxError : null,
//				beforeSend: (forDisplay && typeof ajaxComplete === 'function') ? ajaxBefore : null, // shows 'loading' indicator while loading popup
				complete: (typeof ajaxComplete === 'function') ? ajaxComplete : null,
				async: false
		}); 
		
		// enable modal draggin, but prevent modal dragging for any that have a .nodrag class, and disable dragging for specific
		// child elements of any that may need to be interacted with the mouse pointer.
		if (typeof $("#"+id).draggable != 'undefined')
			$("#"+id+":not(.nodrag,.reveal-modal)").draggable({ cancel : '.dd-options, input, textarea, select, .popup_buttons, .tab, .metrobartools' });

		if (typeof setAccountFeatures != 'undefined')
			setAccountFeatures();
		
	} else {
		// populate variables and invoke callback even if modal is already loaded in memory.
		if (typeof set_rdp_vars != 'undefined') 
			set_rdp_vars();
		if (typeof callback === 'function')
			callback(id, data);
	}	
	
	
	if ($("#"+id).length){
		if (typeof $global != 'undefined' && $global.login && $global.login.accountType >= 1){
			$(".hidePlus", "#"+id).css('opacity', '.4');
		} else { 
			$(".hidePlus", "#"+id).css('opacity', '1');
		}
	}
	
	return $("#"+id);
} // end: loadPopup

function displayDivTab(pid, tab){
	if (!pid)
		return;
	loadPopup(pid, true);
	if (tab){
		$('#'+pid).find('dd,li').removeClass('active'); // close any open tabs.
		// activate the tab to open
		$('#'+pid).find("a[href=#"+tab+"]").closest('dd').addClass('active'); 
		 // activate the tab's contents
		$('#'+tab+'Tab').addClass('active').find('dd').first().addClass('active');
		$('#'+tab+'Tab').addClass('active').find('li').first().addClass('active');
	}
	DisplayDIV(pid);
}

function displayAccount(tab)
{
	displayDivTab('modalaccountbox', tab);
}

function set_filestyle(){
    $("input.file_1").not('.filestyle').addClass('filestyle').filestyle({ 
        image: "/img/browse-button.png",
        imageheight : 36,
        imagewidth : 121,
        width : 300
    });
}

function isNumber(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}


function parseQueryString( name )
{
	var url = window.location.href;
	url = url.replace(/\%23/,'#');
	url = url.replace(/(\#.*)\%3d/, "$1=");
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&\\#\\!]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( url );
	if( results == null )
		return "";
	else
		return results[1];
} // end: parseQueryString

// jquery css will return some color values in rgb(aaa,bbb,ccc) mode, this will convert them to #aabbcc;
function rgb2hex(cssColor) {
	function hex(x) {
		return ("0" + parseInt(x).toString(16)).slice(-2);
	}
	if (cssColor){
		rgb = cssColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		if (rgb){
			return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
		} else {
			return cssColor;
		} // end: if
	} else {
		return '';
	} 
} // end: rgb2hex


function ajaxError(XMLHttpRequest, textStatus, errorThrown){
	hideLoading();
// alert("ajaxError: text="+textStatus+", error="+errorThrown);
	if (DEV)
		console.log(XMLHttpRequest.responseText);
} // end: ajaxError

function ajaxBefore(xhr){
	showLoading("loading from server...");
}
function ajaxComplete( xhr ){
//console.log("ajaxComplete");
	var success = true;
	if (xhr && xhr.responseXML)
		success = !checkXmlError(xhr.responseXML);
	
	hideLoading();
	return success;
}

// display error modal if an error tag (<error>some err msg</error>) is found in the xml response. 
// return true if there is an error, false otherwise. 
function checkXmlError(xmlResponse, noHide){
    var $xml = $(xmlResponse);
    var $error = $xml.find('error');
    if ($error && $error.text().length > 1){
// alert("error="+$error.get(0).nodeValue);
        DisplayDIV('messagePopup', noHide);
        $('#messagePopupContent').html($error.text());
        return true;
    }
    return false;
}
function checkXmlFormError(xmlResponse){
    var $xml = $(xmlResponse);
    var $error = $xml.find('formerror');
    var $errorText = null;
    if ($error && $error.text().length > 0){
        //alert($error.text());
        $errorText = $error.text();
        $xml.remove('formerror');
        //return $errorText;
        return true;
    }
    return false;
}


function showLoading(message, match_id){
	// suppress loading message if we're generating a screencapture
	if (typeof $global != 'undefined' && typeof $global.imageMode != 'undefined' && $global.imageMode)
		return;
	
	if (!$("#loadingImg").length)
		$(document.body).append("<div id='loadingImg'><div><img src='/img/loading.gif' /><br><br><span>loading from server...</span></div></div>");
	
	if (message)
		$("#loadingImg").find('span').html(message);
	
	if (typeof $global != 'undefined' && !$global.embed)
		$('#loadingImg').height($(document).height()).show();
	else 
		$('#loadingImg').show();
	
	if (match_id)
		$('#loadingImg').data('match_id',match_id);
}

// hide the loading lightbox and restore the message to it's default
function hideLoading(match_id){
	var $loading = $("#loadingImg");
	if (!$loading.data('match_id') || $loading.data('match_id') == match_id)
		$loading.hide().data('match_id','').find('span').html("loading from server...");
}


function set_rdp_vars(caller_id)
{
	if (typeof W == 'undefined')
		return;
	
	// set all rdp_var content using loaded workpad data
	$('.rdp_var').each(function(){ 
		var $this=$(this); 
		
		if ($this.attr('field') && W[$this.attr('field')] != undefined)
			$this.text(W[$this.attr('field')]);
	});
}

function is_upgraded(){
	if (typeof $global !== 'undefined')
		if (typeof $global.login !== 'undefined')
			if (parseInt($global.login.accountType) > 0)
				return true;
	
	if (typeof W !== 'undefined')
		if (typeof W['expiration_days'] !== 'undefined')
			if (W['expiration_days'] > 0)
				return true;
	
	return false;
}



//Ken Kwasnicki's generic jQuery utility methods
//add $.visible function to make the css visbility property 'visible' for the selected object
(function( $ ){ $.fn.visible = function() { this.css('visibility', 'visible'); return this; };})( jQuery );
//add $.hidden function to make the css visbility property 'hidden' for the selected object
(function( $ ){ $.fn.hidden = function() { this.css('visibility', 'hidden'); return this;};})( jQuery );
//css 'left' setter if val is defined, or getter if val is not.
(function( $ ){ $.fn.left = function(val) { if(val != null){ this.css('left',val+'px'); return this; } else { return parseInt(this.css('left')); } };})( jQuery );
//css 'top' setter if val is defined, or getter if val is not.
(function( $ ){ $.fn.top = function(val) { if(val != null){ this.css('top',val+'px'); return this; } else { return parseInt(this.css('top')); } };})( jQuery );

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};


// implement a generic select_button handler to enable select buttons to work
// like radio buttons having the same name attribute.
// the data value associated with the button (value attribute) will be
// transfered to a hidden form element having the same name.
$(document).on('click', ".select_button", function(){
	// alert($(this).attr('size'));
	var $this = $(this);
	var $form = $this.closest('form');
	var name = $this.data('name');
	$form.find(".select_button[data-name="+name+"]").removeClass('selected');
	$this.addClass('selected');
	
	var $input_field = $form.find("input[name="+name+"]").length ? $form.find("input[name="+name+"]") : 
			$("<input type='hidden' name='" + name + "' />").appendTo($form);
	
	$input_field.val($this.data('value')).trigger('change');
	
	if ($this.hasClass('autonext'))
		$form.find('.next').trigger('click');

	return false;
});

$(document).on('click', ".select_button_container", function(){
	$(this).find('.select_button').trigger('click');
	return false;
});


function displayMessage(message){
	DisplayDIV('messagePopup');
	$('#messagePopupContent').html(message);
}

function displayConfirm(message, okFunction, cancelFunction, popupId){
	if (typeof popupId !== 'string')
		popupId = 'messageConfirm';

	$popup = loadPopup(popupId, true);
	$('#'+popupId+'Content').html(message);

	$('.button.ok',$popup).click(function(){
		if (typeof okFunction ==='function'){
			console.log('here2.4');

			okFunction();
		}
		HideDIV();
	});
	$('.button.cancel',$popup).click(function(){
		if (typeof cancelFunction ==='function')
			cancelFunction();
		HideDIV();
	});
	DisplayDIV(popupId);
}

function displayConfirmToast(message, okFunction, cancelFunction){
	displayConfirm(message, okFunction, cancelFunction, 'messageConfirmToast');
}


$(document).on('click', '.close-reveal-modal, .custom-reveal-close', function(){

	$(this).closest('.reveal-modal').trigger('reveal:close').trigger('close').trigger('closed');
	console.log("trying to close. modal="+$(this).closest('.reveal-modal').prop('id'));
});

