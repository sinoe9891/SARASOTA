// alert('global_utils.js');

var DEV = false;
var QA = false;
var DEATHSTAR = 0;
var BASE_DOMAIN = 'footguides.com';

// Override console.log to suppress output in production.
// TODO: nned to factor IE in here too!
if (!DEV && !QA){
  if (typeof(console) === 'object'){
    console.log = function(){};
  } else {
    console = {"log":function(){}};
  }
}

// Form validation extension to jquery.
(function( $ ){
  $.fn.validate = function() { 
    var $form=$(this);
    var pass = true;
    $form.find('input, select, textarea, file').each(function(){
        var $this = $(this);
        //add http if necessary
        if($this.val() && $this.hasClass('action-http-validate') && ($this.val().indexOf('://') == -1) ){
            var url = "http://" + $this.val();
            $this.val(url);
        }

        if ($this.hasClass('required')){
//console.log($this);
//console.log("val is "+$this.val());
            // Use material classes if this field has validate classs.
            if ($this.hasClass('validate')) {
              $this.removeClass('invalid');
              $this.css('backgroundColor', 'transparent');
            }else {
              $this.css('backgroundColor', 'transparent');
            }
            

            if (  !$this.val() ||
                  ( $this.hasClass('email') && !validateEmail.test($this.val()) ) ||
                  ( $this.hasClass('equal') && ($this.val() != $('#'+$this.attr('equal_id')).val()) )
                ){
              // if this is first failure (ie: pass still = true) then focus the field. 
              if (pass) {
                  $this.focus();
              }

              // Use material classes if this field has validate classs. 
              if ($this.hasClass('validate')) { 
                 $this.addClass('invalid');
                 $this.css('backgroundColor', '#faa');
              } else {
                 $this.css('backgroundColor', '#faa');
              }

              pass = false;
              //console.log("field invalid: "+$this.html());
              //console.log($this);
              Materialize.toast("oops, missing some info... ",2000);
              return pass;
            }

        }
    });

    return pass;
  };
  // alert('added validate function jqery='+typeof(jQuery));
})( jQuery );

$(document).off('click','.event').on('click','.event', function(){
  var event_type = $(this).data('event-type');
  var parent_event_id = $(this).data('parent-event-id');
  var workpad_id = W['id'] ? W['id'] : $(this).closest('.modal').data('workpadId');

  $.ajax({
    url : '/ajax/log_event.php',
    dataType : 'json',
    data : { workpad_id : workpad_id, event_type : event_type , parent_event_id : parent_event_id}
  });
});
