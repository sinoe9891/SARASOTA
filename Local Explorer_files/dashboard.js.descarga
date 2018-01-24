// showLoading("THIS IS THE LOADING STATUS DIV");

$(document).on('click keyup change', ".guide_field", function(){
    var required_missing = false;
    var $this = $(this);
    var $form = $this.closest('form');
    $form.find(".guide_field.required").each(function(){
        //alert("field tag = "+$(this).prop('tagName')+", type="+$(this).prop('type'));

        // Some file field widgets are coupling file-input fields with a text input field for 
        // display purposes which we don't want to validate on because they will always be empty. 
        if (! $(this).val() && !($(this).hasClass('file') && $(this).prop('type')==='text') ){
            required_missing = true;
        }
    });

    // this is a specific handling for the guided design custom size buttons.
    if ($this.attr('name') == 'size'){
        if ($this.val() == 'custom')
            $form.find('input[name=width],input[name=height]').removeAttr('readonly').removeClass('inactive');
        else
            $form.find('input[name=width],input[name=height]').attr('readonly','readonly').addClass('inactive');
    }

    // If all required field are found then activate the Next button, otherwise set to inactive and display warning. 
    $form.find('.next').each(function(){
        var $next = $(this);
        if (required_missing) {
            $next.addClass('inactive').attr('onclick',"$(this).closest('form').find('.next_tip').fadeIn();");
        } else {
            $next.removeClass('inactive').attr('onclick',$next.data('onclick'));
            $form.find('.next_tip').fadeOut();
        }

    });

});

// include popup_id to display a specific popup after booklet creation. (ie: pdf
// tool)
function mashupCreate(event, form , callback)
{
    // all the elements from the popup form will be submitted
    var $form = (form) ? $(form) : $(this).parents('form');

    var data = {cmd : 'create' };

    var size = $form.find('select[name=size]').val() || $form.find('input[name=size]').val();

    var width = $form.find('input[name=width]').val();
    var height = $form.find('input[name=height]').val();
    if (size){
        width = size.substr(0,size.indexOf('x'));
        height = size.substring(size.indexOf('x')+1);
    }

    if (!width){
        alert('Please select a booklet size from the menu or provide a custom width and height');
        return;
    }

    // mostly used for booklets created using the new-pdf flow where only a
    // custom width is defined.
    if (!height)
        height = width;

    data.width = width;
    data.height = height;
    data.booklet = 1;

    HideDIV();
    $form.ajaxSubmit({url : workpad_url, type: 'POST', data : data, success : function(xml){ mashupCreateSuccess(xml,callback); }, error: ajaxError, beforeSend: ajaxBefore, complete: ajaxComplete});
} // end: mashupCreate

function mashupGuidedCreate($form,  post_success_callback)
{
    // all the elements from the popup form will be submitted
    if (!$form)
        return;

    $form = $form.add('form.workpadCreate');

    var data = $form.serializeObject();
    var size = data.size;

    if (!size)
    //alert('Please select a booklet size or provide a custom width and height');
        size = '960x960';


    var width = parseInt((size=='custom') ? $form.find('input[name=width]').val() : (size.indexOf('x') > 0 ? size.substr(0,size.indexOf('x')) : size));
    var height = parseInt((size=='custom') ? $form.find('input[name=height]').val() : size.substring(size.indexOf('x')+1));


    // mostly used for booklets created using the new-pdf flow where only a
    // custom width is defined.
    if (!height)
        height = width;


    // if width and/or height are beyond our threshhold then set to default
    // height. TODO: should throw a user error instead.
    if (width < WP_MIN_WIDTH || height < WP_MIN_HEIGHT || width > WP_MAX_WIDTH || height > WP_MAX_HEIGHT){
        width = 900;
        height = 600;
    }

//alert(size + ',' + width + ','+ height);

    data.cmd = 'create';
    data.width = width;
    data.height = height;
    data.booklet = 1;

    $.ajax({	url : workpad_url,
        type: 'POST',
        data : data,
        success : function(xml){
            mashupCreateSuccess(xml, post_success_callback);
        },
        error: ajaxError,
        beforeSend: function(){ ajaxBefore(); showLoading("creating booklet..."); } ,
        complete: function(xhr){ ajaxComplete(xhr); }
    });

} // end: mashupGuidedCreate


function mashupCreateSuccess(xmlResponse, post_success_callback)
{
    hideLoading();
    if (!checkXmlError(xmlResponse)){
        var wpKey = $(xmlResponse).find('newWorkpad').attr('key');

        if (!wpKey)
            return displayMessage("An unkown error occurred trying to create the new booklet.");

        if (typeof post_success_callback == 'function')
            post_success_callback(xmlResponse);
        else
//			window.location = '/design.php?wpKey='+wpKey+'#pid=modalbookletlayout';
            window.location = '/design.php?wpKey='+wpKey+'#pid=modalguideddesigncongrats';
    }
} // end: mashupCreateSuccess


function mashupGuidedPdfCreate(){
    mashupGuidedCreate(
        $('#modalguideddesignpdf_form, #modalguideddesignpdf2_form, #modalguideddesignpdf2a_form, #modalguideddesignpdf4_form'),
        function(xmlResponse){
            mashupGuidedPdfCreateStep2(xmlResponse);
        }
    );
}

// Parse xml response for new workpad_id and wokrpad_key and pass on to guidedPdfCreateComplete to send final pdf conversion request
function mashupGuidedPdfCreateStep2(xmlResponse){
    // booklet is created, now upload the pdf
    var $workpad = $(xmlResponse).find('newWorkpad');
    if (!$workpad.length)
        return displayMessage('An error occured creating the new pdf booklet. Please try again or contact support if the problem persists.');
//alert($workpad.attr('width'));

    var wpId = $workpad.attr('id');
    var wpKey = $workpad.attr('key');

    guidedPdfCreateComplete({workpad_id: wpId, workpad_key : wpKey});
}


// Collect workpad data and pdf conversion details and send request to server to convert the pdf into the existing workpad.
function guidedPdfCreateComplete(workpad){
    var wpId = workpad.workpad_id;
    var wpKey = workpad.workpad_key;
    var $form = $("form.modalguideddesignpdf_pdf_form");
    var data = $form.serializeObject();
    data.cmd = "add";
    data.wpId = wpId;
    data.shrinkWidth = data.size == 'custom' ? $workpad.attr('width') : 0;
    data.contentType = 'IMAGE';
    data.success_modal = 'modalguideddesignpdf6';
    data.center = '0';
    data.resizebooklet = '1';
    data.dpi = data.dpi ? data.dpi : '300';
//alert($form.entirepdf +','+$form.find('select[name=entirepdf]').val());
    if ($form.find('select[name=entirepdf]').length == 0)
        data.entirepdf = '1';

// console.log("mashupGuidedPDFCreate: booklet created. uploading pdf");
    var interval_id = null;
    interval_id = setInterval( function() {
        $.getJSON("/status.php",function(data){
            if (data && data.msg)
                $("#loadingImg").find('span').html(data.msg);
        });
    }, 500);

    $("#modalguideddesignpdf3a_form").ajaxSubmit({
        url : workpad_url,
        type : 'POST',
        data : data,
        success : function(xmlResponse){
            window.onbeforeunload = null;
            window.location = "/design.php?wpKey="+wpKey+"#pid=modalguideddesignpdfcongrats";
        },
        error : ajaxError,
        beforeSend : function(){
// console.log("converting pdf...");
            window.onbeforeunload = function() {
                return 'You have unsaved changes!';
            };
            ajaxBefore();
            showLoading("uploading pdf<br>may take a few minutes...", 'mashupGuidedPdfCreateStep2');
        } ,
        complete : function(xhr) {
// console.log("pdf complete");
            window.onbeforeunload = null;
            ajaxComplete(xhr);
            hideLoading('mashupGuidedPdfCreateStep2');
            if (interval_id)
                clearInterval(interval_id);
        },
        dataType : 'xml',
        accepts: {
            xml: "text/xml",
            text: "text/xml"
        }

    });
}

function savePdfPreview(button)
{
    var $form = $(button).closest('form');

    $form.ajaxSubmit({

        url : '/ajax/save_pdf_preview.php',
        type : 'POST',
        dataType : 'json',
        error : function(json){ console.log("Error from ajax save pdf preview"); console.log(json);},
        success : function(json){
            window.onbeforeunload = null;

            if (typeof json.status === 'undefined')
                return displayMessage("An unkown error occurred. Please contact support if problems persist.");

            if (json.status == 'error')
                return $form.find('.formerror').text(json.message).show();
 //console.log(json.status +','+ json.message);

            // var completeFromPdf = $form.find('input[name=complete_from_pdf]').val();
            // alert('completeFromPdf = '+completeFromPdf);

            // $popup = loadPopup('modalguideddesignpdf_preview', {complete_from_pdf : completeFromPdf});
            $popup = loadPopup('modalguideddesignpdf_preview', $form.serializeObject());

            $popup.find('form .preview img').attr('src', json.preview_file);

            $popup.find('form input[name=asset_file]').val(json.asset_file);

            DisplayDIV($popup);

        },
        error : ajaxError,
        beforeSend : function(){
            window.onbeforeunload = function() {
                return 'You have unsaved changes!';
            };
            ajaxBefore();
            showLoading("uploading pdf<br>may take a few minutes...", 'savePdfPreview');
        } ,
        complete : function(xhr) {
            window.onbeforeunload = null;
            ajaxComplete(xhr);
            hideLoading('savePdfPreview');
            if (typeof interval_id != 'undefined')
                clearInterval(interval_id);
        },

    });

}

$(document).on('click', '.button.folds, .select_button.folds', function(){
    var $form = $(this).closest('form');
    var folds = $(this).data('value')-1;
    var $container = $form.find('.preview');
    var width =  $container.find('img').width();
console.log(width+','+folds);

    $container.find('.fold_line').remove();

    for (fold = 1; fold <= folds; fold++){
        left = parseInt(100*fold/(folds+1));
        $("<div class='fold_line' style='left: "+left+"%;' />").appendTo($container);
    }

});


function bookletDelete()
{
    HideDIV();
    var wpId = W['id'];
    if (!wpId)
        return alert('please select a booklet first');
    // else
    //     alert("wpid id "+wpId);

    var data = {cmd : 'delete', wpId : wpId};
    console.log(data);
    $.ajax({
        url : workpad_url,
        type : 'POST',
        data : data,
        error: function(xml){ alert(xml); },
        success : function(xml){ //TODO: verify with Ken that changing to reload will work in all cases, in case of delete from map in admin need vanity url reload
            // alert("success");
            if (!checkXmlError(xml)){
                var $li = $('#mybooklets').find("li[data-workpad_id="+wpId+"]");
                var $div = $('#workpad_'+wpId);
                var removed = false;
                if ($li.length){
                    $li.css('background','#faa').fadeOut(function(){$(this).remove();});// = '/dashboard.php';});
                    removed = true;
                    //alert("case 1");
                } else if ($div.length){
                    $div.animate({height: 0}, function(){$(this).remove();});// = '/dashboard.php';});
                    removed = true;
                    //alert("case 2");
                // } else if () {                
                    // $('.workpad-row').each(function(){
                    //     if ($this)
                    // })
                } 

                // As a last ditch effort, if we couldn't find a workpad element to remove then refresh the whole damn page. 
                if (!removed){
                    window.location.reload();
                }
            }
        }
    });
} // end: bookletDelete

$(document).on('click',  ".action-modal-refresh", function (){
    var type = $(this).data("type");
    //alert("going to try to refresh modal for type "+type);
    if(type == 'notification'){
        $('.action-notifications-refresh').trigger('click');
    }else if(type == 'neighbourhood'){
        $('.action-neighbourhood-refresh').trigger('click');
    }
});




function accountDelete()
{
    if (confirm("Are you sure you wish to delete your account and all your beautiful booklets?")){
        $.ajax({
            url: workpad_url,
            type: 'POST',
            data : {cmd : 'delete_account'},
            error: ajaxError,
            beforeSend: ajaxBefore,
            complete: ajaxComplete,
            success : function(){
                alert("Your account has been deleted.");
                window.location.href = "/design.php";
            }
        });
    }

    HideDIV();
}

function accountCreate(form, subaccount)
{

    var $form = $(form);
    console.log($form);
    var data = {cmd : subaccount ? 'createsubaccount' : 'createaccount'};
    var err=false;
    $form.find('input').each(function(){
        var $this = $(this);
        if ($this.hasClass('required')){
            $this.css('backgroundColor', 'transparent');
            if (	!$this.val() ||
                ($this.hasClass('email') && !validateEmail.test($this.val())) ||
                ($this.hasClass('equal') && ($this.val() != $('#'+$this.attr('equal_id')).val()))
                ){
                if (!err)
                    $this.focus();
                $this.css('backgroundColor', '#faa');
                err = true;
                alert("error in "+$this.id);
                console.log($this);
            }
        }
    });



    if (!err){
        //alert("submitting to ajax workpad ");
        //$form.ajaxSubmit({url : workpad_url, type: 'POST', data : data, error: ajaxError, beforeSend: ajaxBefore,
        $form.ajaxSubmit({url : "workpad.php", type: 'POST', data : data,// error: ajaxError, beforeSend: ajaxBefore,
            success : subaccount ? accountCreateSubAccountSuccess : accountLoginSuccess });
    } else{

        return false;
    }
} // end: accountCreate

function accountChangePwd(form)
{
    var $form = $(form);
    var data = {cmd : 'changepwd'};
    var $currentPwd = $("input[name=currentpwd]", $form);
    var $newPwd = $("input[name=newpwd]", $form);
    var $confirmPwd = $("input[name=confirmpwd]", $form);
    var errMsg = null;
    $(".inputerror").removeClass('inputerror');

    if (!$currentPwd.val()){
        errMsg = "Please provide your current password";
        $currentPwd.addClass('inputerror').focus();
    } else if (!$newPwd.val()){
        errMsg = "Please provide your new password";
        $newPwd.addClass('inputerror').focus();
    } else if ($newPwd.val() != $confirmPwd.val()){
        errMsg = "Confirm password does not match.";
        $confirmPwd.addClass('inputerror').focus();
    } // end: if
    if (errMsg){
        $form.find('.formerror').html(errMsg+"<br>");
    } else {
        $form.ajaxSubmit({
            url : workpad_url,
            type: 'POST',
            error: ajaxError,
            data : data,
            success : function(){
                HideDIV();
            },
            beforeSend: ajaxBefore,
            complete: ajaxComplete
        });
    } // end: if
} // end: accountChangePwd


//function accountCreateSubAccountSuccess(xmlResponse, statusText, xhr, $form, json){
function accountCreateSubAccountSuccess(xmlResponse, statusText, xhr, $form){
    // hide the loading image.
    ajaxComplete();

    var $xml = $(xmlResponse);
    var $error = $xml.find('error');
    var $subaccount_id = $xml.find('subaccount_id').text();
    //alert('subaccount id is '+$subaccount_id);
    if ($error && $error.text().length > 1){
        $form.find('.response_message').addClass('error').html($error.text());
    } else {
        //from Ken
        displayAccount('simplesub');
        $("#modalaccountbox").find('form.create_subaccount').find('.response_message').text("Account successfully updated.");

        /* Nancy's attempts to mess with it...
        might work if I can create a workpad b/fr I launch this...
        //alert('success about to launch address reverse geo');
        //displayAccount('simplesub');
        //$("#modalaccountbox").find('form.create_subaccount').find('.response_message').text("Account successfully updated.");
        var latLng = $form.find('#modalaccountbox_latlng').val();//$("#modalaccountbox").find('form.create_subaccount').find('#modalaccountbox_latlng').val();
        if(typeof latLng !== 'undefined'){
            console.log(latLng);
            alert("latLng is "+latLng);
            var json = {"latLng":latLng.toString(), "subaccount_id":$subaccount_id};
            console.log(json);
            //DisplayDIV("address_reversegeocode", false, false, false, json);
            DisplayDIV("visitorservices_address", false, false, false, json);
        }else{
            var json = {"subaccount_id":$subaccount_id, "title":"Member Services"};
            DisplayDIV("visitorservices_address",false,false,false,json);
        }
        */
    }
}


// New subaccount delete for Material style dashbaord.
$(document).on('click', '.subaccount-delete', function(){
    subAccountDeleteAction($(this).data('account-id'),$(this).data('username'));
});

// Old subAccountDelete function for Foubndation style dashboard.
function subAccountDelete(form)
{
    var $form = $(form);
    var $select = $form.find('select');
    var username = $select.find(":selected").text();
    var account_id = $select.val();
    subAccountDeleteAction(account_id,username);
}

// Shared subAccountDelete functionality for all dashboards.
function subAccountDeleteAction(account_id, username){
    if (!account_id){
        return displayMessage("Could not determine account to delete");
    }

    var data  = {cmd : "deletesubaccount",  account_id: account_id};
    materialConfirm("Please confirm that you wish to delete the account: "+username, function(){
        $.ajax({
            url : workpad_url,
            type: 'POST',
            data : data,
            error: ajaxError,
            beforeSend: ajaxBefore,
            complete: ajaxComplete,
            success :  function(xml){
                subAccountDeleteSuccess(username, account_id);
            }
        });
    });
}


// Shared subaccount delete sueccess from ajax functionaltiy.
function subAccountDeleteSuccess(username, account_id){
    if ($("#modalaccountbox").length){
        displayAccount('simplesub');
        $("#modalaccountbox")
            .find('form.create_subaccount')
            .find('.response_message')
            .html("Account, "+username+", has been deleted.");
    } else {
        // alert("Subaccount deleted. TODO: refresh modal, or close modal forcing a refresh on open.");
        $('.subaccount-row').each(function(){
            if ($(this).data('account-id') == account_id){
                $(this).hide('slow',function(){ $(this).remove(); });
            }
        });
    }
}

/*
Requires:
needle - input filter value
action-filter-container class - contains items to be filtered
action-filter-item class - contains item to be shown or hidden
action-filter-haystack1 class - field to be searched for match
action-filter-haystack2 class - field to be searched for match - optional

 */
function filter(){
    var needle = $(this).val().toLowerCase();
    var $modal = $(this).closest(".modal");
    var $container = $modal.find(".action-filter-container");

// console.log("filter: "+needle + ". modal="+$modal.length+", container="+$container.length);

    $container.find(".action-filter-item").each(function (){
        var $item=$(this);
// console.log("item found");
        /* bah - not working and driving me nuts...
        console.log($(this).find("[class^='action-filter-haystack']"));
        //something like..
        if($(this).find("[class^='action-filter-haystack']").text().toLowerCase().indexOf(needle).length)
            $item.show();
        else
            $item.hide();
        */
        var itemMatch = false;

        if(needle){
            // var haystack1 = $item.find(".action-filter-haystack1").length > 0 ? $item.find(".action-filter-haystack1").text().toLowerCase() : "";//$item.find(".action-filter-haystack1").text().toLowerCase();// ? : "";
            // var haystack2 = $item.find(".action-filter-haystack2").length > 0 ? $item.find(".action-filter-haystack2").text().toLowerCase() : "";
            // if(haystack1.indexOf(needle) >= 0 || haystack2.indexOf(needle) >= 0 )
            //     $item.show();
            // else
                // $item.hide();

            $item.find('.action-filter-haystack,.action-filter-haystack1,.action-filter-haystack2').each(function(){
                var haystack = $(this).text().toLowerCase();
// console.log("haystack found: "+haystack);
                if(haystack.indexOf(needle) >= 0){
                    itemMatch = true;
                    return false; // break out of .each iteration
                }
                return true; // no match found so continue to next iteration in .each
            });
        } else {
            itemMatch = true;
        }

// console.log("itemMatch="+itemMatch)

        if (itemMatch){
            $item.fadeIn();
        } else {
            $item.fadeOut();
        }

    });
}

$(document).on('keyup', '.action-filterneedle', filter);



$(function(){
    $("#modalmybookletmenubox_filter_input,#modalmybookletmenubox_gallery_filter_input").keyup(function(){
        var filter = $(this).val().toLowerCase();
        $('#mybooklets').find("li").each(function(){
            var $li=$(this);
            // var menu_text = $li.find('.myMenu').text().toLowerCase();
            var menu_text = $li.html().toLowerCase();
            if (filter != ""){
                if (menu_text.indexOf(filter) >= 0){
                    //$li.show().children().show();
                    $li.show();
                } else {
                    //$this.closest('li').hide().children().hide();
                    $li.hide();
                }
            } else {
                //$this.closest('li').show().children().show();
                $li.show();
            }
        });
    });

//     $(document).on('click', '.finderentry:not(.visitorservices)', function(){
//         var $this = $(this);
//         if ($this.data('workpad_key'))
//             window.location = '/design.php?wpKey='+$this.data('workpad_key');
// //			console.log('/design.php?wpKey='+$this.data('workpad_key'));
//         return false;
//     });

    // prevent anchor tags within li.findentry's from bubbling up and triggering the findentry click launching design
    $(document).on('click', '.finderentry a', function(e){
        e.stopPropagation();
    });

});


$(document).on('click', "#modalaccountbox_getstats", function(){
    var account_id = $(this).closest('form').find('select').val();
    if (account_id)
        $.ajax({url : workpad_url, data : { cmd : 'account_stats', account_id : account_id } , dataType : 'json',
            success : function(json){
                for (var i in json){
                    $("#modalaccountbox_accountstats").find("[data="+i+"]").text(json[i]);
                }
                $("#modalaccountbox_accountstats").fadeIn();
            }
        });
});


$(document).on('change', 'select[name=subaccount_id].dashboard', function(){
    var param = $(this).val() ? '?subaccount_id='+$(this).val() : '';

    // check if this is being invoked from the gallery modal, in which
    // case reload the gallery modal, otherwis reload the dashboard.
//	if ($(this).closest('#modalmybookletgallery').length)

    window.location = '/dashboard.php'+param;
    return false;
});


$(document).on('click', "#modalaccountbox_createsubaccount", function(){
    //alert('creating subaccount');
    accountCreate($(this).closest('form'), true);
    return false;
});

$(document).on('click', ".action-account-edit", function(){
    var $form = $(this).closest('form');
    // alert($form.length);

    if (!$form.validate()){
        return false;
    }

    $form.ajaxSubmit({
        url : "/ajax/member_create.php",
        type: 'POST',
        dataType: 'text json',
        success : function(data){
            console.log(data);

            if (data.status =='ok'){
                // close the form modal.
                $form.closest('.modal').closeModal({ "complete" : function(){

                        // reload the members modal if it's visible
                        if ($("#modal-member-dashboard").is(":visible")){
                            materialModal('modal-member-dashboard', true);
                        }

                        // Display the add-location flow if the server indicates that's the next step.
                        if (data.next == 'location'){
                            materialModal('modal-newlocation-dashboard', true, {subaccount_id: data.account_id});
                        }
                    }
                });

            } else {
                displayMessage(data.message);    
            }

        }
    });

    return false;
});

$(document).on('click', "#modalaccountbox_deletesubaccount", function(){
    subAccountDelete($(this).closest('form'));
    return false;
});

$(document).on('click', ".action.delete, .visitorservices .delete", function(){
    var workpad_id = $(this).data('workpad_id');
    if (!workpad_id)
        return false;
    //W defined in rdp_utils.js
    W['id'] = workpad_id;
    loadPopup('modaldeletemashtab', true);
    DisplayDIV('modaldeletemashtab');
});

$(document).on('click', "a.bookletDelete", bookletDelete);

$(document).on("change", "#modalaccountbox_subaccounts",function(){
    //alert("getting sub account for subaccount id "+this.selectedIndex);
    var $this = $(this);
    var $form = $this.closest('form');
    var $createReadOnly =  $form.find('select[name=createReadOnly]');

    // initialize the readonly select menu to its default setting, will set per the specific account below.
    $createReadOnly.val('');
//alert(this.selectedIndex +","+subaccounts[this.selectedIndex-1].username);
    if (this.selectedIndex > 0){
        var subaccount = subaccounts[this.selectedIndex-1];
        $form.find('input[type=submit]').val('update');
        $form.find('input[name=createUsername]').val(subaccount.username);
        $form.find('input[name=createFullName]').val(subaccount.full_name);
        $form.find('input[name=createOwnerName]').val(subaccount.owner_name);
        $form.find('input[type=password]').val('').removeClass('required')
            .each(function(){ $("label[for="+$(this).attr('id')+"]").removeClass('required'); });
//		$form.find('input[name=createReadOnly]').prop('checked', subaccount.read_only == '1');
        if (subaccount.read_only == 1)
            $createReadOnly.val('read_only');
        else if (subaccount.write_only == 1)
            $createReadOnly.val('write_only');
        else
            $createReadOnly.val('');

//		alert(subaccount.read_only +',' + subaccount.write_only);
    } else {
        $form.find('input[type=submit]').val('create');
        $form.find('input[type=text]').val('');
        $form.find('input[type=password]').addClass('required').val('')
            .each(function(){ $("label[for="+$(this).attr('id')+"]").addClass('required'); });
    }
});


$(document).on('click', "#mygallery .finderentry:not(.subaccount),.mygallery.button", function(){
    var $button = $(this).hasClass('button') ? $(this) : $(this).find('.button');
    var set_to = $button.hasClass('on') ? 0 : 1;
    var workpad_id = $(this).data('workpad_id');
    $.ajax({url : workpad_url, data : { cmd : 'setMyGallery', wpId : workpad_id,  my_gallery : set_to }, success : function(){
        if (set_to == 1)
            $button.addClass('on');
        else
            $button.removeClass('on');
    }
    });

    return false;
});

function setGalleryPath(button)
{
    var $form = $(button).closest('form');
    var gallery_path = $form.find('input[name=gallery_path]').val();
    var gallery_title = $form.find('input[name=gallery_title]').val();
    var dmo_360 = $form.find('textarea[name=dmo_360]').val();
    var splash_url = $form.find('textarea[name=splash_url]').val();
    //$('input[name="chk[]"]:checked').length > 0
    var use_map = $form.find('input[name=use_map]').prop('checked') ? 1 : 0;
    var auto_splash = $form.find('input[name=auto_splash]').prop('checked') ? 1 : 0;

    //alert ("form.find('input[name=use_map]').prop('checked') is " + $form.find('input[name=use_map]').prop('checked') + "use_map is " + use_map);
    $.ajax({
        url : workpad_url,
        data : {cmd : 'gallery_path', path : gallery_path, gallery_title: gallery_title, use_map: use_map, dmo_360: dmo_360, splash_url: splash_url, auto_splash: auto_splash},
        error : ajaxError,
        success : function(xml){
            if (!checkXmlFormError(xml)){
                HideDIV();
                $('.modal').closeModal();
                //alert("success");
            }
            else{//TODO 2015-08-25 this isn't working
                //nancy - we should only be here if the vanity is already taken
                //alert("duplicate vanity");
                $form.find(".formerror").text("Sorry, the address is already taken. Please try another.");
                $form.find('input[name=gallery_path]').focus();
            }
        },
        beforeSend: ajaxBefore,
        complete: ajaxComplete
    });
}

function saveAccountDetails(button){

    var $form = $(button).closest('form');
    $form.ajaxSubmit({
        url : workpad_url,
        type: 'POST',
        data : { cmd : 'update_account' },
        success : function(xml){
            if (!checkXmlFormError(xml)){
                HideDIV();
            }
        }
    });

}

/*
 ** NH - Begin neighbourhood functions
 */
function neighbourhoodSave(form)
{
    var $form = $(form);
    var err=false;
    $form.find('input, textarea').each(function(){
        var $this = $(this);
        if ($this.hasClass('required')){
            $this.css('backgroundColor', 'transparent');
            if ( !$this.val() ){
                if (!err)
                    $this.focus();
                $this.css('backgroundColor', '#faa');
                err = true;
            }
        }
    });

    if (!err){
        $form.ajaxSubmit({
            url : '/ajax/save_neighbourhood.php',
            type : 'POST',
            dataType : 'json',
            error: ajaxError,
            success : function(json){
                if (json.status == 'ok'){
                    HideDIV();
                    var jsonType = {"title":"Neighbourhood", "type": "neighbourhood"};
                    DisplayDIV('visitorservices_finish',null,false,null, jsonType);
                } else if (json.status == 'error'){
                    return displayMessage(json.message);
                }
            }
        });
        return true;
    } else
        return false;
} // end: neighbourhoodSave

function neighbourhoodDelete(form){
    var $form = $(form);
    //alert("deleting neighbourhood "+ $form.find('.neighbourhood_id').val());
    var neighbourhood_id = $form.find('.neighbourhood_id').val();
    var err=false;
    if (!err){
        $form.ajaxSubmit({
            url : '/ajax/delete_neighbourhood.php',
            type : 'POST',
            dataType : 'json',
            error: ajaxError,
            success : function(json){
                if (json.status == 'ok'){
                    //var node = $(".finderentry[data-neighbourhood_id='"+neighbourhood_id+"']");
                    //if(node.length)
                    var jsonType = {"title":"Neighbourhood", "type": "neighbourhood"};
                    DisplayDIV('visitorservices_finish',null,false,null, jsonType);
                } else if (json.status == 'error'){
                    return displayMessage(json.message);
                }
            }
        });
        return true;
    } else
        return false;
}



$(document).on('click', '#modalneighbourhood2address .save_neighbourhood', function(){
    //alert('in dashboard.js submit fx');
    var $form = $(this).closest('form');
    if ( !$form.find('input[name="splash_image"]').val() && !$form.find('input[name="splash_image_name"]').val()  ){
        alert("JPG image is required.");
        return;
    }else
        neighbourhoodSave($form);
});

$(document).on('click', '#modalneighbourhood .get_neighbourhood', function(){
    //alert('in dashboard.js #mn .g_n fx & this.data is '+ $(this).data('neighbourhood_id') );

    //var data = '"'+ $(this).data('neighbourhood_id')+'"';
    //data = $(this).data('neighbourhood_id');
    //var json = {"neighbourhood_id" : data};
    //console.log("json to string is " + json.toString());

    //DisplayDIV('modalneighbourhood2address', null, null, null, json );
    getNeighbourhood($(this).data('neighbourhood_id'));
});

function getNeighbourhood(neighbourhood_id){
    var json = {"neighbourhood_id" : neighbourhood_id};
    console.log("json to string is " + json.toString());

    DisplayDIV('modalneighbourhood2address', null, null, null, json );

}
$(document).on('click', '.action-neighbourhood-get', function(){
    //alert('in dashboard.js a-n-g fx & this.data is '+ $(this).data('neighbourhood_id') );

    getNeighbourhood($(this).data('neighbourhood_id'));

});

$(document).on('click', '#modalneighbourhood .delete_neighbourhood', function(){
    $('.neighbourhood_id').val($(this).data('neighbourhood_id'));
    neighbourhoodDelete($(this).closest('form'));
    /*
    var $form = $(this).closest('form');

    var message = "<p>Are you sure you want to delete this neighborhood permanently?</p>"
    displayConfirm(message, function(){
        neighbourhoodDelete($form);
    }, function() {
        return;
    });
    */
});

function deleteNeighbourhood(form){
    neighbourhoodDelete(form);
}

$(document).on('click', '.action-neighbourhood-delete', function(){
    //alert('in dashboard.js a-n-g fx & this.data is '+ $(this).data('neighbourhood_id') );
    $('.neighbourhood_id').val($(this).data('neighbourhood_id'));

    neighbourhoodDelete($(this).closest('form'));

});

function toggleWorkpadGallery(workpad_id, hide){
    console.log("wp id in remove wp from gallery is "+workpad_id+" and hid is "+hide);

    if(workpad_id){
        $.ajax({
            url: '/ajax/toggle_wp_in_gallery.php',
            type: 'POST',
            data: {workpad_id : workpad_id, hide: hide},
            error: function(data){ console.log("error from ajax remove workpad from gallery data:"); console.log(data); return false;},
            success: function(data){
                //either update to hidden or remove from display...
                //displayMessage(data.message);
                console.log("in success toggling wp from gallery");
                var node = $(".finderentry[data-workpad_id='"+workpad_id+"']").find('.action-workpad-gallerytoggle');
                if(hide){
                    node.removeClass('gallery-showing').addClass('gallery-hidden');
                }else{
                    node.removeClass('gallery-hidden').addClass('gallery-showing');
                }
                return true;
            }
        });

    }else{
        console.log("sorry no workpad id found");
    }
}

$(document).on('click', '.action-workpad-gallerytoggle', function(){

    var workpad_id = $(this).closest('.finderentry').data('workpad_id');
    var hide = $(this).hasClass('gallery-showing');

    return toggleWorkpadGallery(workpad_id,hide);

});

$(document).on('change', '.action-locationcategory-change', function (){
    //alert("dashboard.js action-locationcategory-change click changeing cat");
    var category_id = $(this).val();
    //console.log("cat id is"+category_id);
    if(category_id){
        $.ajax({
            url: '/ajax/get_category_icons.php',
            type: 'POST',
            data: {category_id : category_id},
            error: function(data){ console.log("error from get category icons:"); console.log(data); return false;},
            success: function(data){
                //alert("success check console for data");
                //console.log(data);
                $('.action-categoryicon-select').html(data);

            }
        });
    }else{
        console.log("sorry no category id found");
    }
    
});

function deleteWorkpad(workpad_id){
    console.log("wp id in delete wp "+workpad_id);

    if(workpad_id){
        $.ajax({
            url: '/ajax/delete_workpad.php',
            type: 'POST',
            data: {workpad_id : workpad_id},
            error: function(data){ console.log("error from ajax delete workpad:"); console.log(data); return false;},
            success: function(data){
                console.log("in success deleting wp");
                var removed = false; 

                // Look for newer markup defining a workpad row to delete/
                $('.workpad-row').each(function(){
                    if ($(this).data('workpad_id') == workpad_id){
                        $(this).hide('slow',function(){ $(this).remove(); });
                        removed = true;
                    }
                });           

                // If no workpad-row could be found then resort to the previous finderentry lookup.
                if (!removed)
                    $(".finderentry[data-workpad_id='"+workpad_id+"']").addClass("hidden");

                return true;
            }
        });

    }else{
        console.log("sorry no workpad id found");
    }
}

// $(document).on('click', '.action-workpad-deleteconfirm', function(){
//     var workpad_id = $(this).data('workpad_id');
//     deleteWorkpad(workpad_id);

// });

$(document).on('click', '.action-workpad-delete', function(){
    var workpad_id = Number($(this).data('workpad_id'));
    //alert("deleting wp id "+workpad_id);
    var msg = "<p>Are you sure you want to delete? No takebacks...</p>";
    if (workpad_id)
        materialConfirm(msg, function(){ deleteWorkpad(workpad_id); });
});

$(document).on('click', '.action-location-delete', function(){
    var workpad_id = Number($(this).data('workpad_id'));
    //alert("deleting wp id "+workpad_id);
    var msg = "<p>Are you sure? Deals and brochures attached to this location will be lost. Not recommended. No takebacks...</p>";
    if (workpad_id)
        materialConfirm(msg, function(){ deleteWorkpad(workpad_id); });
});

function notificationSave(form)
{
    var $form = $(form);
    //console.log($form);
    var err=false;
    $form.find('input, textarea').each(function(){
        var $this = $(this);
        if ($this.hasClass('required')){
            $this.css('backgroundColor', 'transparent');
            if( !$this.val() ){
                if (!err)
                    $this.focus();
                $this.css('backgroundColor', '#faa');
                err = true;
            }
            //console.log("err is "+err+" item is "+$this.attr("name")+" this val / text is "+$this.val()+" text "+$this.text());
        }
    });

    if (!err){
        HideDIV();
        $form.ajaxSubmit({
            url : '/ajax/save_notification.php',
            type : 'POST',
            dataType : 'json',
            error: ajaxError,
            success : function(json){
                if (json.status == 'ok'){
                    HideDIV();
                    var jsonType = {"type":"notification"};
                    DisplayDIV('visitorservices_finish',null,false,null, jsonType);
                } else if (json.status == 'error'){
                    return displayMessage(json.message);
                }
            }

        });
        return true;
    } else
        return false;
} // end: notificationSave

function notificationDelete(notification_id){
    if(notification_id){
        $.ajax({
            url: '/ajax/delete_notification.php',
            type: 'POST',
            data: {notification_id : notification_id},
            error: function(data){ console.log("error from ajax delete notificaiton:"); console.log(data); return false;},
            success: function(data){
                console.log("in success deleting notificiton");
                $(".finderentry[data-workpad_id='"+notification_id+"']").addClass("hidden");
                return true;
            }
        });

    }else{
        console.log("sorry no notification id found");
    }

}

function notificationDelete1(form){
    var $form = $(form);
    //alert("deleting notification "+ $form.find('.notification_id').val());
    var err=false;
    if (!err){
        $form.ajaxSubmit({
            url : '/ajax/delete_notification.php',
            type : 'POST',
            dataType : 'json',
            error: ajaxError,
            success : function(json){
                if (json.status == 'ok'){
                    var jsonType = {"title":"Notification"};
                    DisplayDIV('visitorservices_finish',null,false,null, jsonType);
                } else if (json.status == 'error'){
                    return displayMessage(json.message);
                }
            }
        });
        return true;
    } else
        return false;
}

$(document).on('click', '#notifications_list .get_notification', function(){
    //alert('in dashboard.js submit fx & this.data note id is '+ $(this).data('notification_id') );
    var type = $(this).data('notification_type');
    var id = $(this).data('notification_id');
    var jsonNote = {"notification_id" : id};
    var jsonWp = {"workpad_id": id, "type": type}
    //console.log(jsonWp);
    //console.log(jsonNote);

    if(type == 'notification') //this is in the workpad table - an event notification that has created it's own workpad
        DisplayDIV('visitorservices_edit', null, null, null, jsonWp);
    else //this is in the notification table - it may be linked to an existing workpad, a website url or just a general msg that closes
        DisplayDIV('notifications_edit', null, null, null, jsonNote);
});

$(document).on('click', '.action-notification-edit', function(){
    //alert('in dashboard.js submit fx & this.data note id is '+ $(this).data('notification_id') );
    var type = $(this).data('notification_type');
    var id = $(this).data('notification_id');
    var jsonNote = {"notification_id" : id};
    var jsonWp = {"workpad_id": id, "type": type}
    console.log(jsonWp);
    console.log(jsonNote);

    if(type == 'notification') //this is in the workpad table - an event notification that has created it's own workpad
        DisplayDIV('visitorservices_edit', null, null, null, jsonWp);
    else //this is in the notification table - it may be linked to an existing workpad, a website url or just a general msg that closes
        DisplayDIV('notifications_edit', null, null, null, jsonNote);
});


$(document).on('click', '.action-notification-deleteconfirm', function(){
    //alert('in dashboard.js delete fx & this.data is '+ $(this).data('notification_id') );
    var notification_id = $(this).data("notification_id");

    notificationDelete(notification_id);

});

$(document).on('click', '.action-notification-delete', function(){
    //alert('in dashboard.js delete fx & this.data is '+ $(this).data('notification_id') );
    var notification_id = $(this).data('notification_id');
    var data = " data-notification_id='"+notification_id+"' ";
    var msg = "<p>Are you sure you want to delete? No takebacks...</p>";


    var json = {"message": msg, "action_confirm": " action-notification-deleteconfirm ", "action_cancel":" modal-close ", "data":data};

    materialModal('modal-confirm', true, json);

    /*
    $('.notification_id').val($(this).data('notification_id'));
    var $form = $(this).closest('form');

    var message = "<p>Are you sure you want to delete this notification permanently?</p>"
    displayConfirm(message, function(){
        notificationDelete($form);
    }, function() {
        return;
    });*/

});

$(document).on('click', '#notifications_list .delete_notification', function(){
    //alert('in dashboard.js delete fx & this.data is '+ $(this).data('notification_id') );
    var notification_id= $(this).data('notification_id');
    //var $form = $(this).closest('form');

    var message = "<p>Are you sure you want to delete this notification permanently?</p>"
    displayConfirm(message, function(){
        notificationDelete(notification_id);
    }, function() {
        return;
    });

});

$(document).on('click', '#notifications_edit .save_notification', function(){
    //alert('in dashboard.js submit fx');
    var $form = $(this).closest('form');
    //console.log($form);

    if ($('#notifications_edit_type').val() == 'workpad'){
        $('input[name="type_action"]').val($('#type_action_select').val());
        //$('#notifications_edit_type_action_value').val($('#type_action_select').val());
        //alert('submitting and input type_action is  '+ $('input[name="type_action"]').val());
        //console.log($('#submit_notifications_edit'));
    }else if ($('#notifications_edit_type').val() == 'url'){
        $('#notifications_edit_type_action_value').val($('#type_action_text').val());
    }else{
        $('#notifications_edit_type_action_value').val('');
    }
    notificationSave($form);
});


$(document).on('click','.send-invite-email-all',function(){
    var $button = $(this);
    var memberCount = $button.data('memberCount');
    materialConfirm("Are you sure you'd like to send email to "+memberCount+" members?", function(){sendInviteEmail($button);});
});
$(document).on('click','.send-invite-email',function(){ sendInviteEmail(this); });
function sendInviteEmail(button){
    var $this = $(button);
    var $form = $this.closest('form');
    if (!$form.length){
        return;
    }

    $form.ajaxSubmit({
        url: '/ajax/emailer-vvc-invite.php',
        type: 'POST',
        success: function(data){
            //displayMessage(data.message);
            // we may not want to display any results if we're just kicking off the email send which might take a while.
        }
    });

    // $popup.find('.before-send').hide();
    // $popup.find('.after-send').show();
    displayMessage('Invite email has been sent');
}


$(document).on('click','.send-analytics-email-all',function(){
    var $button = $(this);
    var memberCount = $button.data('memberCount');
    materialConfirm("Are you sure you'd like to send email to "+memberCount+" members?", function(){sendAnalyticsEmail($button);});
});
$(document).on('click','.send-analytics-email',function(){ sendAnalyticsEmail(this); });
function sendAnalyticsEmail(button){
    var $this = $(button);
    var $form = $this.closest('form');
    if (!$form.length){
        return;
    }

    $form.ajaxSubmit({
        url: '/ajax/emailer-vvc-analytics.php',
        type: 'POST',
        success: function(data){
            //displayMessage(data.message);
            // we may not want to display any results if we're just kicking off the email send which might take a while.
        }
    });

    displayMessage('Email has been sent');
}

function panoIdUpdate(form){
    var $form = $(form);
    //alert("updating panoid for workpad "+ $form.find('input[type=hidden]').val());
    $form.ajaxSubmit({
        url : '/ajax/update_panoid.php',
        type : 'POST',
        dataType : 'json',
        error: ajaxError,
        success : function(data){
            //console.log("success: data="+data);
            if (data.status != 'ok')
                return displayMessage(data.message);
            else if (data.status == 'error'){
                return displayMessage(data.message);
            }
        }
    });
    return true;

}
$(document).on('click', '#panoids_edit .save_pano_id', function(){
    //alert('in dashboard.js submit fx workpad_id is '+$('input[name="workpad_id"]').val());
    var $form = $(this).closest('form');
    panoIdUpdate($form);
});


$(document).on('click', '.action-panoLLHPZ-save', function(){
    var $form = $(this).closest('form');
    panoIdUpdate($form);
    /*
    if($form.find('input[name="pano_id"]').val() != ""){
        var message = "<p>A pano id is specified here and will be used for display. Continue?</p>"
        displayConfirm(message, function(){
            $('input[name="pano_id"]').val("");
            var $form = $(this).closest('form');
            panoIdUpdate($form);
            //$(this).closest('form').find("#pano_id").val("");
        }, function() {
            return;
        });

    }
    */
});

$(document).on('click', '#panoids_edit .delete_pano_id', function(){
    //alert('in dashboard.js submit fx');
    //$('.workpad_id').val($(this).data('workpad_id'));
    var message = "<p>Are you sure you want to delete this pano id?</p>"
    displayConfirm(message, function(){
        $('input[name="pano_id"]').val("");
        var $form = $(this).closest('form');
        panoIdUpdate($form);
        //$(this).closest('form').find("#pano_id").val("");
    }, function() {
        return;
    });
});

function geoAddressSave(form)
{
    var $form = $(form);
    var err=false;
    $form.find('input, select').each(function(){
        var $this = $(this);
        if ($this.hasClass('required')){
            $this.css('backgroundColor', 'transparent');
            if ( !$this.val() ){
                if (!err)
                    $this.focus();
                $this.css('backgroundColor', '#faa');
                err = true;
            }
        }
    });

    if (!err){
        $form.ajaxSubmit({
            url : '/ajax/save_address.php',
            type : 'POST',
            dataType : 'json',
            error: ajaxError,
            success : function(json){
                if (json.status == 'ok'){
                    //NH 2015-11-10 I don't think the HideDIV() even works anymore
                    //HideDIV();
                    /*
                    if ($form.find('#modalaccountbox_createsubaccount')){
                        alert("need to create wp - service - can I drop right into visitor services? with new type subaccount? include title Member Marker");
                        var jsonMember = {"title":"Member Marker", "subaccount_id":};
                        DisplayDIV("visitorservices_edit", false,false,false, jsonMember);
                    }
                    else*/
                        return displayMessage(json.message);
                } else if (json.status == 'subaccount_id'){
                    var jsonMember = {"title":"Member Marker", "subaccount_id":json.message};
                    DisplayDIV("visitorservices_edit", false,false,false, jsonMember);
                } else if (json.status == 'error'){
                    return displayMessage(json.message);
                }
            }
        });
        return true;
    } else
        return false;
} // end: neighbourhoodSave

$(document).on('click', '#address_reversegeocode .save_reversegeoaddress', function(){
    //alert('in dashboard.js submit fx');
    var $form = $(this).closest('form');
    if(geoAddressSave($form))
        HideDIV();
    else
        $('.reversegeo_msg').html("Sorry, there was an error writing this address.");
});


$(document).on('click', '.visitorservices .popup-action', function(){
	var $this = $(this);
	var $form = $this.closest('form');
    // to use this function for: select, input, textarea, file -- they must have classes "validate required" see global_utils.js
    if (!$form.validate()){
        return false;
    }else{
        //I put this in popup-apply-deal for now to prevent user from being able to double submit and show processing, but maybe could be generalized
        if($this.hasClass("action-button-processing")){
            $(this).removeAttr("class");
            $(this).addClass("btn grey blue-text");
            $(this).text('Processing');
        }
    }

    var action = $this.data('action');
    var popupId = $this.data('popup-id');
    var popupData = $this.data('popup-data') || {};

 //console.log("action="+action);

	if (typeof popupData.workpad_id === 'undefined')
		popupData.workpad_id = $form.find('input[name=workpad_id]').val();

	// If no ajax action is specified then just show the next popup_id, or if that's not defined then just close this popup.
	if (!action){
		if (popupId)
			DisplayDIV(popupId, null,null,null, popupData);
		else
			HideDIV();
		return false; // prevent bubbling
	}
//console.log("pre-ajaxSubmit");
	$form.ajaxSubmit({
		url : "/ajax/visitor_services_controller.php",
		type : "POST",
		data : { action: action },
		dataType : 'json',
        error: function(data ) { console.log(data); },
        //this error will happen if ajax completes successfully but json is not parsed successfully
        success : function(data){
			//console.log("success: data="+data);
            //if success close underlying modals
            //TODO: NH 2015-07-16 verify this is okay in all places it is used
            $('.modal').closeModal();
			if (data.status != 'ok')
				return displayMessage(data.message);

			// transfer all data properties to popupData to send back to next popup
			for (var i in data)
				popupData[i] = data[i];

            //console.log("dashboard.js->click .vs.popup-action popup data is ");
            //console.log(popupData);

			if (popupId)
				DisplayDIV(popupId, null,null,null, popupData);
			else 
				HideDIV();

			//console.log("success complete");
		}
	});
//console.log("post-ajaxSubmit");

	return false; // prevent bubbling
});


$(document).on('click', '.complete-from-pdf', function(e){ 
  e.preventDefault();
  var $this = $(this);
  var workpad_id = $this.closest('.finderentry').data('workpad_id');
  var workpad_key = $this.closest('.finderentry').data('workpad_key');
  var subaccount_id = $this.closest('.finderentry').data('subaccount_id');
  if (!workpad_id || !workpad_key)
    alert('Could not find correct identifier to complete the listing');

  DisplayDIV('modalguideddesignpdf3a', null, null, null,{workpad_id: workpad_id, workpad_key : workpad_key, subaccount_id: subaccount_id, complete_from_pdf : 1});

  return false;
});


$(document).on('click', '.action-deal-approve', function(e){
    e.preventDefault();
    var $this = $(this);
    var workpad_id = $this.closest('.finderentry').data('workpad_id');s
    var workpad_key = $this.closest('.finderentry').data('workpad_key');
    var subaccount_id = $this.closest('.finderentry').data('subaccount_id');
    if (!workpad_id || !workpad_key)
        alert('Could not find correct identifier to complete the listing');

    DisplayDIV('deal_approve', null, null, null, {workpad_id: workpad_id, workpad_key : workpad_key, subaccount_id: subaccount_id, complete_from_pdf : 1});

    return false;
});

$(document).on('click', '.action-add-location', function(){
    //alert("in action add location");
    var $modal = $(this).closest('.modal');
    var $form = $(this).closest('form');
    var refresh = $form.find('input[name=refresh]').length ? $form.find('input[name=refresh]').val() : false;
    var wpId = $form.find('input[name=workpad_id]').val();

    if (!$form.validate())
        return false;

    //only display the message if this is coming from location. If it is just verifying during a deal upload, it is disruptive to show the msg.
    var $verify = $form.find('#verify_neighbourhood').val();
    //console.log($verify);
    var action = 'update_workpad';


    $form.ajaxSubmit({
        url : "/ajax/visitor_services_controller.php",
        type : "POST",
        data : { action: action },
        dataType : 'json',
        error: function(data ) { console.log(data); },
        //this error will happen if ajax completes successfully but json is not parsed successfully
        success : function(data){
            //I've moved the close modal to the modal b/cs this one was closign my popup underneath for applydeal which I still need
            //$('.modal').closeModal();
            //I've moved this back to here, b/cs it is closing for if there is an error in the input
            //$modal.closeModal();
            //in fact I want to close location upload form and location list form
            $('.modal').closeModal();

            if (data.status == 'error')
                return displayMessage(data.message);

          if(refresh)
            materialModal('modal-newlocation-dashboard', true, {"workpad_id":wpId});

          //only display the message if this is coming from location. If it is just verifying during a deal upload, it is disruptive to show the msg.
            if(data.error)
            if(!$verify)
                displayMessage('Your location has been updated on the map.');
            
        }
    });

})

/*
$(document).on('click', '.notifications .popup-action', function(){
    var $this = $(this);
    var action = $this.data('action');
    var popupId = $this.data('popup-id');
    var popupData = $this.data('popup-data') || {};
    var $form = $this.closest('form');
// console.log("action="+action);

    //console.log(popupData);
    if (typeof popupData.workpad_id === 'undefined')
        popupData.workpad_id = $form.find('input[name=workpad_id]').val();

    //console.log('popupData.type is '+popupData['type']);
    //console.log('popupData.workpad_id is '+popupData.workpad_id);
    // If no ajax action is specified then just show the next popup_id, or if that's not defined then just close this popup.
    if (!action){
        if (popupId)
            DisplayDIV(popupId, null,null,null, popupData);
        else
            HideDIV();
        return false; // prevent bubbling
    }
    console.log("pre-ajaxSubmit");
    $form.ajaxSubmit({
        url : "/ajax/visitor_services_controller.php",
        type : "POST",
        data : { action: action },
        dataType : 'json',
        error: function(data ) { console.log(data); },
        //this error will happen if ajax completes successfully but json is not parsed successfully
        success : function(data){
            //console.log("success: data="+data);
            if (data.status != 'ok')
                return displayMessage(data.message);

            // transfer all data properties to popupData to send back to next popup

            for (var i in data)
                popupData[i] = data[i];

            //console.log(popupData);
            //console.log(popupId);

            if (popupId)
                DisplayDIV(popupId, null,null,null, popupData);
            else
                HideDIV();
        }
    });

    return false; // prevent bubbling
});

/*
 $(document).on('click', '.notifications .popup-action', function(){
 var $this = $(this);
 var action = $this.data('action');
 //alert("about to try to save and action is "+action);
 //var popupId = $this.data('popup-id');
 //var popupData = $this.data('popup-data') || {};
 var $form = $this.closest('form');
 var err=false;
 $form.find('input').each(function(){
 var $this = $(this);
 if ($this.hasClass('required')){
 $this.css('backgroundColor', 'transparent');
 if ( !$this.val() ){
 if (!err)
 $this.focus();
 $this.css('backgroundColor', '#faa');
 err = true;
 }
 }
 });

 // If no ajax action is specified then just show the next popup_id, or if that's not defined then just close this popup.
 //if (!action){
 //    HideDIV();
 //    return false; // prevent bubbling
 // }

 $form.ajaxSubmit({
 //url : "/ajax/notifications_controller.php",
 url : "/ajax/save_notification.php",
 type : "POST",
 data : { action: action },
 dataType : 'json',
 success : function(data){
 console.log("success: data="+data);
 //if (data.status != 'ok')
 return displayMessage(data.message);
 /*
 // transfer all data properties to popupData to send back to next popup
 for (var i in data)
 popupData[i] = data[i];

 if (popupId)
 DisplayDIV(popupId, null,null,null, popupData);
 else
 HideDIV();
 }
 });

 return false; // prevent bubbling
 });
 */


 $(document).on('change', '#analytics_workpad_select', function(){
    var $select = $(this);
    var $modal = $select.closest('.modal');
    var workpad_id = $select.val();

    if (!workpad_id)
        return;

     $.ajax({
         url : '/ajax/analytics_for_dashboard.php',
         type: 'POST',
         data: {workpad_id : workpad_id},
         dataType: 'json',
         error: function(data){ console.log("error from ajax analytics for dashboard:"); console.log(data); return false;},
         success: function(data){
            //console.log("in success getting analytics for dashboard");
            //console.log(data);
            if (data.impressions !== undefined){
                $modal.find('.analytics-workpad-impressions').text(data.impressions);
            }
            if (data.clicks !== undefined){
                $modal.find('.analytics-workpad-clicks').text(data.clicks);
            }
            if (data.engagement !== undefined){
                $modal.find('.analytics-workpad-engagement').text(data.engagement + '%');
            }

var reach_categories = data.reach_categories;
var reach_data = data.reach_data;

$('#reach_chart').highcharts({
        chart: {
          polar: true,
          type: 'area',
          width: 450
        },
        title: {
            text: ''
        },
        tooltip: {
          headerFormat: '',
          pointFormat: '{point.name}: <b>{point.y}</b>'
        },
        xAxis: {
          categories : reach_categories,
          tickmarkPlacement: 'on',
          lineWidth: 0,
          labels: {
            useHTML: true
          }
      },
        yAxis: {
          gridLineInterpolation: 'polygon',
          lineWidth: 0,
          min: 0,
          labels: {
            useHTML: true
          }
        },
        plotOptions: {
            area: {
                  allowPointSelect: true,
                  color: [
                    '#52A525' 
                  ],
                  cursor: 'pointer',
                  dataLabels: {
                      useHTML: true,
                      enabled: true,
                      distance: 15,
                      color: '#333',
                      connectorColor: '#333'
                  }
            }
        },
        series: [{
            name: 'Reach',
            data : reach_data,
            pointPlacement: 'on'
        }]
    });



         }
     });

 });


$(document).on('click', '.action-modal-closeall', function(){
    $('.modal').closeModal();
});


$(".action-account-pay").on("click", function (){
    //console.log("in aaction account pay");
    var $this = $(this);
/*    if($this.hasClass("action-button-processing")){
        $(this).removeAttr("class");
        $(this).addClass("btn grey blue-text");
        $(this).text('Processing');
    }
    */
    var accountId = $this.data('account_id');
    var productType = $this.data('product_type');
    var $form = $this.closest('form');
    var promoCode = $form.find(".action-promo-data").val();

    if(promoCode != "")
        promoVerify(accountId,productType,promoCode);

    else{
        pay(accountId, productType, promoCode);
        //var json = {"account_id": accountId, "product_type": productType, "promo_code": promoCode};
        //DisplayDIV('wepay', null, null, null, json );
    }
});


function pay(accountId, productType, promoCode){
    var json = {"account_id": accountId, "product_type": productType, "promo_code": promoCode};

    //console.log("json to string is ");
    //console.log(json);
    //alert("trying to pay account and launch wepay");
    DisplayDIV('wepay', null, null, null, json );

}

//$(".action-promo-verify").on("click", function(){
    //verify promo code or prompt for another
    //var $this = $(this);
    //var promoCode = $this.val();

    //var productType = $this.data('product_type');
    //var accountId = $this.data('account_id');
//});
function promoVerify(accountId, productType, promoCode){

    $.ajax({
        url : '/ajax/validate_promo_code.php',
        type: 'POST',
        data: {promo_code : promoCode, product_type: productType, account_id: accountId},
        dataType: 'json',
        error: function(data){ console.log("error from dashboard.js->action-promo-verify:"); console.log(data); return false;},
        success: function(data){
            //console.log("in success getting analytics for dashboard");
            //console.log(data);
            if (data.valid != "0"){
                //alert("code is good");
                pay(accountId, productType, promoCode);
                //var json = {"account_id": accountId, "product_type": productType, "promo_code": promoCode};
                //DisplayDIV('wepay', null, null, null, json );

            }else{
                //alert("need to put in new code");
                var data = " data-product_type='"+productType+"' data-account_id='"+accountId+"' ";
                var msg = "<p>The promo code you entered '"+promoCode+"' is not valid. Would you like to continue at regular price or cancel and try again?</p>";

                var json = {"message": msg, "action_confirm": " action-wepay-pay ", "action_cancel":" modal-close ", "data":data};

                materialModal('modal-confirm', true, json);
            }
        }
    });

}

// KK: global input:file change event to populatate the material styled input_path field with the filename value.
$(document).off('change','input[type="file"]').on('change', 'input[type="file"]', function () {
//console.log("input file change detected");
    var file_field = $(this).closest('.file-field');
    if (file_field.length){
        var path_input = $(this).closest('.file-field').find('input.file-path');
        if (path_input.length){
            path_input.val($(this).val());
            path_input.trigger('change');
        }
    }
});

