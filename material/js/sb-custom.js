$(document).ready(function(){
    $(".dropdown-button").dropdown({ hover: false, belowOrigin: false });
    $('.modal-trigger').leanModal();
    $('select').material_select();
    $('.scrollspy').scrollSpy();
    $('.parallax').parallax();
    

    $('.action-drawer-open').click(function () {
        var drawerType = $(this).data('drawerType');
        var $actionDrawer = $(".action-drawer[data-drawer-type="+drawerType+"]");
        $actionDrawer.slideDown();
        $(".action-drawer").not($actionDrawer).slideUp();
        //if we include the following 2 lines to show sideNav it will black out the main content an additional time
        // so you have to click on the main content as many times as drawer is opened to have it active again
        //if(window.screen.availWidth < 992)
        //    $('.button-collapse').sideNav('show');
    });

    $('.action-drawer-close').click(function () {
        $(this).closest(".action-drawer").slideUp();
    });

//moved to map.js so it can use same showSideNav f(x) which I couldn't get working from here - might be order of js file load?
    /*
     $('.action-sidenav-show').click(function () {
     showSideNav('show');
     //if(window.screen.availWidth < 992)
     //    $('.button-collapse').sideNav('show');
     });
     */

    $('.action-loadingdiv-hide').click(function () {
        $('.action-loadingdiv-toggle').fadeOut();
    });

    $('.action-towernav-toggle').click(function () {
        if($('.action-towernav-container').hasClass('hidden'))
            $('.action-towernav-container').removeClass('hidden');
        else
            $('.action-towernav-container').addClass('hidden');
    });

    $('.action-category-toast').click(function(){
        var msg = "now showing " + $(this).data('toastMessage');
        Materialize.toast(msg.toLowerCase(), 3000);
    });

    $('.brochure-tab').click(
        function () {
            //show its submenu
            $("#brochure-drawer").slideToggle();
        },
        function () {
            //hide its submenu
            $("#brochure-drawer").slideToggle();
        }
    );


    // Material dynamic modal loader.
    //console.log('adding modal-trigger document.on.click event');
    $(document).off('click.modal-trigger').on('click.modal-trigger', '.modal-trigger', function(e){
        var $this = $(this);
        var modalId = $this.attr('href');
        //console.log("modal-trigger: modalId="+modalId);

        if ($this.hasClass('close-modals'))
            $('.modal').closeModal();

        return materialModal(modalId, $this.data('force'), $this.data('serverData'));
    });

    $(document).off('click.modal-close').on('click.modal-close', '.modal-close', function(e){
        var $this = $(this);
        e.preventDefault();
        $this.closest('.modal').closeModal();
        if ($this.hasClass('close-destroy')){
            $this.closest('.modal').remove();
        }
        return false;
    });

});

$('.button-collapse').sideNav({
    menuWidth: 330, // Default is 240
    edge: 'left' // Choose the horizontal origin
});

$('.collapsible').collapsible();




function materialModal(modalId, force, serverData, callback){
    serverData = typeof(serverData)==='string' ? JSON.parse(serverData) : serverData;
    //console.log("entering materialModal modal ID is "+modalId+",serverData="+serverData);
    if (!modalId){
        console.log("missing modalId in materialModal - ending processing");
        return;
    }
//

    if (typeof(modalId) === 'string' && modalId.indexOf('#') !== 0)
        modalId = '#'+modalId;

    var $modal = $(modalId);
    serverData = typeof(serverData)==='string' ? JSON.parse(serverData) : serverData;

// console.log('materialModal() modal: id='+modalId+", exists="+$modal.length+", clicked="+$(this).hasClass('clicked')+", force="+force+", serverData="+serverData);

    if ($modal.length && !force){
        //console.log("showing existing modal instead of fetching new");
        return $modal.openModal();
    }

    var postData = {modal_id : modalId };
    for (var i in serverData){
        postData[i] = serverData[i];
    }

    //console.log("fetching new modal at server");
    $.ajax({
        url : '/ajax/material_modal.php',
        type : 'POST',
        data : postData,
        error: function(data){ console.log(data);},
        success : function(data){
            if ($modal.length)
                $modal.remove();

            $("body").append($(data));
            $modal = $(modalId);

            if ($modal.length){
                $modal.openModal();
            }

            if (typeof(callback) === 'function'){
                callback();
            }
        }
    });
    return false;
}   

function materialConfirm(message, okCallback, cancelCallback){
    var okActionClass = "modal-confirm-ok";
    var cancelActionClass = "modal-confirm-cancel";

    var json = {"message": message, "action_confirm": okActionClass, "action_cancel": cancelActionClass};

    $(document).off('click', '#modal-confirm .'+okActionClass);
    $(document).off('click', '#modal-confirm .'+cancelActionClass);

    if (typeof(okCallback) === 'function')
        $(document).on('click', '#modal-confirm .'+okActionClass, okCallback);

    if (typeof(cancelCallback) === 'function')
        $(document).on('click', '#modal-confirm .'+cancelActionClass, cancelCallback);

    materialModal('modal-confirm', true, json);
}


