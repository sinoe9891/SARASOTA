var map;var mc;var geoInitialized=false;var geoSuccess=false;var geoMarker=null;var geoIcon="/img/onepixel.png";var myLatLng=null;var workpadMarkers=[];var dealMarkers=[];var countDeals=0;var neighbourhoodMarkers=[];var directionsDisplay;var directionsService=new google.maps.DirectionsService();var zoomNeighbourhood=14;var zoomCluster=6;var centerLatLng="";var allNotified=false;var latLngBounds=null;var overlay;var countDeals=0;var countNotifications=0;var closeToDestination=false;CustomMarker.prototype=new google.maps.OverlayView();function showLoadingDiv(a){$(".action-loadinggeo-message").text(a);$(".action-loadingdiv-toggle").fadeIn()}function getNearestNeighbourhoodByLatLon(e,d,f){var c=16;var b=16.1;var g="all";if(e!=null){d=e.substring(1,e.indexOf(",")-1);f=e.substring(e.indexOf(",")+1,e.indexOf(")")-1)}for(var a in neighbourhoods_for_map){b=distance(d,f,neighbourhoods_for_map[a]["lat"],neighbourhoods_for_map[a]["lng"]);if(b<c){c=b;g=neighbourhoods_for_map[a]["neighbourhood_id"]}}return g}function setNeighbourhoodDrawer(a,b,c){$(".action-drawer").slideUp();$(".action-drawer-data").hide();if(c==null){c=getNearestNeighbourhoodByLatLon(null,a,b)}setNeighbourhoodInfo(c);setDrawer(c,a,b)}function setDrawer(c,a,b){$(".action-drawer").each(function(){var d=$(this).data("drawerType");var e=$(".action-drawer-data[data-neighbourhood-id="+c+"]");var f=true;if(e.length&&f){e.show();setDrawerTitles(d,c)}else{ajaxNeighbourhoodDrawers(d,c)}})}function setDrawerTitles(a,e){var c=$(".action-drawer[data-drawer-type="+a+"]").find($(".action-drawer-data[data-neighbourhood-id="+e+"]"));var b=c.find(".action-draweritem-description").clone();$(".action-sidenav-drawertitles[data-drawer-type="+a+"]").empty();$(".action-sidenav-drawertitles[data-drawer-type="+a+"]").append(b);$(".action-sidenav-drawertitles[data-drawer-type="+a+"]").find("p").removeClass("action-marker-goto");$(".action-sidenav-drawertitles[data-drawer-type="+a+"]").find("p").addClass("drawer-headline truncate");var d=document.getElementById("action-"+a+"-clamp");$clamp(d,{clamp:6,useNativeClamp:false})}function ajaxNeighbourhoodDrawers(a,c){var b={drawer_type:a,account_id:account_id,neighbourhood_id:c,lat:myLat,lng:myLng,neighbourhoods_for_map:neighbourhoods_for_map};$.ajax({url:"/ajax/get_neighbourhood_drawers_by_id.php",data:b,method:"POST",error:function(d){console.log(d)},success:function(d){$(".action-drawer[data-drawer-type="+a+"]").find(".action-drawer-container").append(d);setDrawerTitles(a,c)}})}function setNeighbourhoodInfo(g){var a="All Places";var d=unescape(accountTourismDescription);var f="/"+accountDir+"/neighbourhood/splash_image_all.jpg";if(g!="all"){f="/"+neighbourhoods_for_map[g]["directory"]+"/neighbourhood/splash_image_"+g+".jpg";d=unescape(neighbourhoods_for_map[g]["description"]);a=neighbourhoods_for_map[g]["label"]}$(".action-nbhdimg-data").css("background","url("+f+") center center");$(".action-nbhdimg-data").css("background-position","center center");$(".action-nbhdimg-data").css("background-repeat","no-repeat");var c=document.getElementsByClassName("action-nbhddesc-data");for(var b in c){c[b].innerText=d}var e=document.getElementById("action-nbhddescription-clamp");$clamp(e,{clamp:3,useNativeClamp:false});$(".placesButton").text(a)}function doInitialize(a){if(a=="all"){setNeighbourhoodDrawer(null,null,a)}else{setNeighbourhoodDrawer(myLat,myLng,null)}if(initialize()){$(".action-loadingdiv-toggle").fadeOut();return true}$(".action-loadingdiv-toggle").fadeOut();return true}function load(){if(mapCenter.auto_splash!="0"&&typeof(mapCenter.splash_url)!=="undefined"&&!admin){materialModal("modal-splash",false,{splash_url:mapCenter.splash_url})}if(admin){doInitialize("all")}else{geoInitialized=true;if(navigator.geolocation){var a=$.cookie("geolocation");if(a!=null){geoSuccess=true;var c=a.replace("(","");c=c.replace(")","");var d=c.split(",");myLat=d[0];myLng=d[1];doInitialize(false)}else{navigator.geolocation.getCurrentPosition(function(e){geoSuccess=true;myLat=e.coords.latitude;myLng=e.coords.longitude;stringCoords="("+myLat.toString()+","+myLng.toString()+")";$.cookie("geolocation",stringCoords,{expires:0.0003472,path:"/"});doInitialize(false)},function b(e){var f="Sorry, geolocation failed possibly due to poor reception.";if(e.code=="1"){f='You have denied geolocation services. If you wish to allow them, reload and select "allow" when prompted.<br/>';if(isiPhone){f+="For iPhone v5 or earlier: Go to Settings -> General, scroll to the bottom and go to Reset-> Reset Location & Privacy.<br/>"}}Materialize.toast(f+e.code+" "+e.message,4000);doInitialize(false)},{maximumAge:0,timeout:60000,enableHighAccuracy:false})}}else{Materialize.toast("Sorry, your browser doesn't support geolocation");doInitialize(false)}}}function initialize(){cleanFavourites();var a=true;var b={scrollwheel:true,panControl:false,zoomControl:a,streetViewControl:false,mapTypeControl:false,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("map-canvas"),b);var d=[{featureType:"poi",elementType:"labels",stylers:[{visibility:"off"}]}];map.setOptions({styles:d});directionsDisplay=new google.maps.DirectionsRenderer({polylineOptions:{strokeColor:"7bc33b"}});directionsDisplay.setMap(map);latLngBounds=new google.maps.LatLngBounds();var e=[];for(var c in booklets_for_map){e[c]=new google.maps.LatLng(booklets_for_map[c]["lat"],booklets_for_map[c]["lng"]);latLngBounds.extend(e[c])}map.setZoom(zoomInitial);if(typeof(mapCenter)==="object"){centerLatLng=new google.maps.LatLng(mapCenter.lat,mapCenter.lng);map.panTo(centerLatLng)}else{map.fitBounds(latLngBounds);centerLatLng=map.getCenter()}google.maps.event.addListenerOnce(map,"bounds_changed",function(){latLngBounds=map.getBounds();if(displayGeoMarker()){if(setupMarkers()){var f=google.maps.event.addListener(map,"idle",function(){if(initializeFilters()){google.maps.event.removeListener(f);google.maps.event.addListener(map,"idle",function(){var g="all";if(map.getZoom()>zoomInitial){g=getNearestNeighbourhoodByLatLon(null,map.getCenter().lat(),map.getCenter().lng())}if(g!=$("#selectNeighbourhood").val()){$("#selectNeighbourhood").val(g);setNeighbourhoodDrawer(null,null,g)}})}complete=true})}}});$(".action-loadingdiv-toggle").fadeOut();return true}function initializeFilters(){console.log("initializeFilters(), withinDestination is: "+withinDestination+", closeToDestination is: "+closeToDestination);if(!$.cookie("selectCategory")){filterByCategory()}if(workpadKey){goToBrochure(workpadKey);return true}else{if(webuserId){$(".action-favourites-closebar").fadeIn();filterByCategory(true)}else{if($.cookie("selectCategory")||$.cookie("selectNeighbourhood")){if($.cookie("selectCategory")){$("#selectCategory").val($.cookie("selectCategory")).change();$("#categoriesButton").text($("#selectCategory option:selected").text())}if($.cookie("selectNeighbourhood")){$("#selectNeighbourhood").val($.cookie("selectNeighbourhood")).change();$(".placesButton").text($("#selectNeighbourhood option:selected").text());panToNeighbourhood()}}else{if(withinDestination||closeToDestination){gotoMe(true)}}}}$.removeCookie("selectCategory");$.removeCookie("selectNeighbourhood");showSideNav("show");return true}function gotoMe(){map.panTo(myLatLng);if(withinDestination){console.log("gotoMe, within destination, going to zoom to near me level: "+zoomNearMe);map.setZoom(zoomNearMe)}else{if(closeToDestination){console.log("gotoMe, close to destination, going to zoom to initial: "+zoomInitial);map.setZoom(zoomInitial)}}$(".action-geolocation-go").attr("checked",true)}function displayGeoMarker(){geoInitialized=true;if(myLat!=""&&myLng!=""){myLatLng=new google.maps.LatLng(myLat,myLng);var a=distance(myLat,myLng,centerLatLng.lat(),centerLatLng.lng());console.log("displayGeoMarker distance center to me:"+a);closeToDestination=parseInt(a)>=2?false:true;console.log("displayGeoMarker close to destination:"+closeToDestination);if(latLngBounds.contains(myLatLng)){withinDestination=true;console.log("displayGeoMarker withinDestination is set to: "+withinDestination)}geoMarker=new CustomMarker({map:map,zIndex:9999999,optimized:false,position:myLatLng,visible:true,icon:geoIcon,title:"Your Google Geolocation",className:"geo"},map);geoSuccess=true;return true}else{geoSuccess=false;return true}}function createGeoMarker(c,a,f){geoSuccess=false;if(navigator.geolocation){if($.cookie("geolocation")){var d=$.cookie("geolocation").replace("(","");d=d.replace(")","");var e=d.split(",");myLatLng=new google.maps.LatLng(e[0],e[1]);myLat=e[0];myLng=e[1];displayGeoMarker();if(c){getDirections(c,a)}f()}else{if(myLat!=""&&myLng!=""){myLatLng=new google.maps.LatLng(myLat,myLng);displayGeoMarker();if(c){getDirections(c,a)}f()}else{$(".action-loadingdiv-toggle").fadeIn();navigator.geolocation.getCurrentPosition(function(g){$(".action-loadingdiv-toggle").fadeOut();myLat=g.coords.latitude;myLng=g.coords.longitude;myLatLng=new google.maps.LatLng(g.coords.latitude,g.coords.longitude);stringCoords="("+myLat.toString()+","+myLng.toString()+")";$.cookie("geolocation",stringCoords,{expires:0.003472,path:"/"});displayGeoMarker();if(c){getDirections(c,a)}f()},function b(g){$(".action-loadingdiv-toggle").fadeOut();var h="Sorry, we couldnt locate you in our destination. ";if(g.code=="1"){h="Your location services are turned off on your device so we cant locate you in our destination.<br/>";if(isiPhone){h+="For iPhone v5 or earlier: Go to Settings -> General, scroll to the bottom and go to Reset-> Reset Location & Privacy.<br/>"}}Materialize.toast(h+g.code+" "+g.message,3000);geoSuccess=false;f()},{maximumAge:0,timeout:180000,enableHighAccuracy:false})}}}else{Materialize.toast("Sorry, your browser doesn't support geolocation.",3000);geoSuccess=false;f()}return geoSuccess}function getNeighbourhoodMarkers(){neighbourhoodMarkers=[];for(var c in neighbourhoods_for_map){var b=unescape(neighbourhoods_for_map[c]["label"]);var d="";if(unescape(neighbourhoods_for_map[c]["description"])!=null){d=unescape(neighbourhoods_for_map[c]["description"])}var a=new google.maps.Marker({id:neighbourhoods_for_map[c]["neighbourhood_id"],map:map,position:new google.maps.LatLng(neighbourhoods_for_map[c]["lat"],neighbourhoods_for_map[c]["lng"]),zoomLevel:neighbourhoods_for_map[c]["zoom_level"],label:b,title:b,zIndex:3,icon:"/img/tourism"+neighbourhoods_for_map[c]["icon"]});google.maps.event.addListener(a,"click",function(){logMarkerClick({neighbourhood_id:this.id});this.setZIndex(google.maps.Marker.MAX_ZINDEX+1);var e=this;if(e.id==$("#selectNeighbourhood").val()&&map.getZoom()>=e.zoomLevel){map.setZoom(parseInt(e.zoomLevel)+1);map.panTo(e.position)}else{$("#selectNeighbourhood").val(e.id).change();$(".placesButton").text($("#selectNeighbourhood option:selected").text());if(panToNeighbourhood()){map.setZoom(parseInt(e.zoomLevel)+1)}}});a.setVisible(false);neighbourhoodMarkers[neighbourhoods_for_map[c]["neighbourhood_id"]]=a}return neighbourhoodMarkers}function getBookletMarkers(){var x=null;var q=null;var o=0;var s=0;for(var t=0;t<booklets_for_map.length;++t){var f=imgMarkerDir;var v=booklets_for_map[t]["type"]=="notification"?imgMarkerDefaultEnhanced:imgMarkerDefaultIcon;var e=f+v;var m="";var b="none";var p=1;var k=booklets_for_map[t]["workpad_key"];var d=booklets_for_map[t]["pano_id"];var a="";var z=unescape(booklets_for_map[t]["name"]);var j="<i class='mdi-action-exit-to-app' style='color: #fff; font-size: 1em; top: 0;'></i>";var g=booklets_for_map[t]["count_deals"]>0?true:false;var w=booklets_for_map[t]["type"]=="notification"||booklets_for_map[t]["count_notifications"]>0?true:false;if(g){countDeals++}if(w){countNotifications++}var c=booklets_for_map[t]["lat"];var u=booklets_for_map[t]["lng"];var r=new google.maps.LatLng(c,u);var n=0;if(myLat&&myLng){n=distance(myLat,myLng,c,u)}if(x==c&&q==u&&t>0){o=o+1;if(o%2==0){s=parseInt(o/2);u=parseFloat(q)+parseFloat(s*0.0002)}else{s=parseFloat(parseInt(o+1)/2);u=parseFloat(q)-parseFloat(s*0.0002)}}else{o=0;x=c;q=u}if(k!=""){a=unescape(booklets_for_map[t]["comment"]);if(booklets_for_map[t]["type"]=="service"||booklets_for_map[t]["type"]=="deal"||booklets_for_map[t]["type"]=="notification"){j="<i class='mdi-maps-directions' style='color: #fff; font-size: 1em; top: 0;'></i>"}else{if(booklets_for_map[t]["type"]=="booklet"){var y="/thumbs/w500/"+k+".jpg";m="background: url("+y+") top center repeat;";m+="-webkit-background-size:cover; -moz-background-size:cover; background-size:cover;";b="block";p=2}else{if(booklets_for_map[t]["type"]=="video"||booklets_for_map[t]["type"]=="iframe"){j="<i class='mdi-av-videocam' style='color: #fff; font-size: 1em; top: 0;'></i>"}}}j="mdi-action-done";var l=booklets_for_map[t]["category_id"];if(typeof categories[l]!=="undefined"){f+=categories[l]["directory"]+"/";if(booklets_for_map[t]["count_deals"]>0||booklets_for_map[t]["count_booklets"]>0||booklets_for_map[t]["type"]=="notification"||d!=""||booklets_for_map[t]["account_paid"]>0){v=booklets_for_map[t]["icon"]!=""?booklets_for_map[t]["icon"]:imgMarkerDefaultEnhanced;p=2}e=f+v}else{console.log("no cat for this booklet id "+booklets_for_map[t]["workpad_id"])}}var h=new google.maps.Marker({id:k,workpad_id:booklets_for_map[t]["workpad_id"],workpad_key:k,type:booklets_for_map[t]["type"],pano_id:d,title:z,position:new google.maps.LatLng(c,u),realPosition:r,distance:n,neighbourhood:booklets_for_map[t]["neighbourhood_id"],category_id_list:booklets_for_map[t]["category_id"],icon:e,image500:y,hideImage500:b,hasDeal:g,hasNotification:w,isFavourite:isFavourite(k),zIndex:p,locationCount:o,street:booklets_for_map[t]["street"],draggable:Boolean(admin)});google.maps.event.addListener(h,"click",function(){var i=this;markerClick(i)});if(admin){google.maps.event.addListener(h,"dragend",function(A){var B=this.workpad_id;var i={latLng:A.latLng.toString(),workpad_id:B};DisplayDIV("address_reversegeocode",false,false,false,i)})}workpadMarkers.push(h);if(isFavourite(k)){setMarkerFavourite(workpadMarkers[workpadMarkers.length-1],false,true)}}return workpadMarkers}function setupMarkers(){var c="/img/tourism/vsc/yellowgoogleclustermaker.png";var a=[{height:56,width:55,url:c},{height:56,width:55,url:c},{height:56,width:55,url:c}];var b={gridSize:50,maxZoom:zoomCluster,ignoreHidden:true,minimumClusterSize:3,styles:a};mc=new MarkerClusterer(map,getBookletMarkers(),b);return(getNeighbourhoodMarkers())}function markerClick(b,a){logMarkerClick({workpad_key:b.id});if(a){logMarkerClick({workpad_key:a})}var c=a?a:b.id;if(this.type=="video"){materialModal("booklet-lightbox",true,{workpad_key:c})}else{console.log("trying to open workpad card for wp key: "+c+" name: "+b.title);materialModal("workpad-card",true,{workpad_key:c,workpad_id:b.workpad_id,distance:b.distance,favourite:isFavourite(b.workpad_key)})}b.setZIndex(google.maps.Marker.MAX_ZINDEX+1);b.setAnimation(google.maps.Animation.BOUNCE);google.maps.event.addListenerOnce(map,"click",function(){b.setAnimation(null)})}function displayWorkpad(b,a){brochurePosition=b.position;map.panTo(b.position);map.setZoom(zoomNearMe);showSideNav("hide");markerClick(b,a)}function goToBrochure(c){var a=null;var b=getMarkerByWorkpadKey(c);if(b){displayWorkpad(b)}else{getParentByWorkpadKey(c,function(d){b=getMarkerByWorkpadKey(d);if(b){displayWorkpad(b,c)}else{Materialize.toast("Sorry, invalid brochure.",3000)}})}return}function setMarkerVisibility(b,a){b.setVisible(a)}function setCatTabs(b){$(".action-categorytab-set > .on").removeClass("on");$(".action-categorytab-set").find("li[data-category-id="+b+"]").addClass("on");var a=$(".action-categorytab-set").find("li[data-category-id="+b+"]").data("label");$(".action-category-current").text(a)}$(".action-category-change").on("click",function(){var a=$(this).data("category-id");setCatTabs(a);$("#selectCategory").val(a).change()});function setCategory(a){$("#selectCategory").val(a).change()}function filterByCategory(f){f=f?true:false;var a=f?FAVOURITES:$("#selectCategory").val();if(f&&!getFavouritesFromCookie().length){materialModal("modal-favourites-empty",false,{});return false}if(typeof a==="undefined"){a="all"}if(f){setCatTabs("none")}else{setCatTabs(a)}var h=[workpadMarkers];for(var i in h){if(a=="all"){for(var c in h[i]){h[i][c].setVisible(true)}mc.repaint()}else{var b=map.getBounds();var e=new google.maps.LatLngBounds();var g=0;for(var c in h[i]){if((f&&h[i][c].isFavourite)||!f&&(parseInt(h[i][c].category_id_list)==parseInt(a))){h[i][c].setVisible(true);var d=h[i][c].position;g++;e.extend(d)}else{h[i][c].setVisible(false)}}if(g==0){}if(f){map.fitBounds(e);var k=map.getZoom();if(k>zoomNearMe){map.setZoom(zoomNearMe)}else{if(k<=zoomInitial){map.setZoom(zoomInitial)}}}mc.repaint()}}}function hideOtherMarkers(b){for(var a in workpadMarkers){if(workpadMarkers[a].id==b.id){setMarkerVisibility(workpadMarkers[a],true)}else{setMarkerVisibility(workpadMarkers[a],false)}}}function showSubsetOnly(e){setCatTabs("all");var f=0;var d=map.getBounds();for(var c in workpadMarkers){if(!e){workpadMarkers[c].setVisible(true)}else{if((e=="notification"&&workpadMarkers[c]["hasNotification"])||(e=="deal"&&workpadMarkers[c]["hasDeal"])){workpadMarkers[c].setVisible(true);var a=workpadMarkers[c].position;if(d.contains(a)){f++}}else{workpadMarkers[c].setVisible(false)}}}if(!e){return}if(f<3){map.setZoom(zoomNeighbourhood);var g=map.getBounds();if(g==d){}var b=0;for(var c in workpadMarkers){if(workpadMarkers[c].getVisible()){var a=workpadMarkers[c].position;if(g.contains(a)){b++}}}if(b<3){map.setZoom(zoomInitial)}}}function displayDirections(b,a){if(!navigator.geolocation){Materialize.toast("Sorry, your browser doesn't geolocate",3000);return}if(!geoSuccess){createGeoMarker(b,a,function(){if(geoSuccess){getDirections(b,a)}else{Materialize.toast("Sorry, we are still unable to locate you for directions...",3000)}})}else{if(geoMarker.position!=null){getDirections(b,a)}else{Materialize.toast("Sorry, we are unable to locate you for directions...",3000)}}}function getDirections(d,a){hideOtherMarkers(d);var c=new Date();if(c-geoMarker.gateTime>900000){}var b=d.realPosition;var f=google.maps.TravelMode.DRIVING;if(a!="DRIVING"){f=google.maps.TravelMode.WALKING}var e={origin:myLatLng,destination:b,travelMode:f};directionsService.route(e,function(h,g){if(g==google.maps.DirectionsStatus.OK){directionsDisplay.setDirections(h);displayDirectionsDiv(d,h,a)}else{Materialize.toast("Sorry, directions services failed."+g,3000)}},function(){Materialize.toast("Sorry, google services is not available",3000)})}function displayDirectionsDiv(b,c,a){$(".action-name-data").text(""+b.title);if(b.street==null){var d=c.routes[0].legs.length-1;$(".action-address-data").text(c.routes[0].legs[d].end_address)}else{$(".action-address-data").text(""+b.street)}$(".action-directionsdistance-data").text(c.routes[0].legs[0].distance.text);$(".action-directions-topnav").fadeIn()}function cancelDirectionSteps(){$(".action-directions-steps").fadeOut();$(".action-neighbourhood-sidenav").fadeIn()}$(".action-directionssteps-cancel").click(function(){cancelDirectionSteps()});function cancelDirections(){directionsDisplay.setDirections({routes:[]});$(".action-directions-topnav").fadeOut();cancelDirectionSteps()}$(".action-directions-cancel").click(function(){cancelDirections();filterByCategory()});function setMyLocation(){console.log("setMyLocation closeToDestination is: "+closeToDestination+", withingDestination is: "+withinDestination);if(withinDestination||closeToDestination){gotoMe()}else{if(geoSuccess){materialModal("modal-confirm",true,'{"message":"You are outside our destination. Continue to your location?", "action_confirm":"action-gotome-go"}')}else{Materialize.toast("Sorry, can't find you at the moment...",4000)}}}function resetDrawers(){$(".action-drawer-container").empty();var a=$("#selectNeighbourhood").val();setDrawer(a)}function resetMarkers(){var c=[dealMarkers,workpadMarkers];for(var b in c){for(var a in c[b]){marker=c[b][a];marker.distance=distance(myLat,myLng,marker.realPosition.lat(),marker.realPosition.lng())}}}function setDistances(){if(myLat!=0&&myLng!=0){resetDrawers();resetMarkers()}}$(".action-geolocation-go").click(function(){console.log("action-geolocation-go withinDestination is: "+withinDestination+", closetoDestination is: "+closeToDestination);if(!geoSuccess){createGeoMarker(false,false,function(){console.log("created geo marker returned true about to set distances & mylocation");setDistances();setMyLocation()});console.log("in not geoSuccess condition")}else{console.log("in geoSuccess condition only going to set location not resetting anything");setMyLocation()}});function panToNeighbourhood(){var a=$("#selectNeighbourhood").val();logMarkerClick({neighbourhood_id:a});if(a=="all"){map.panTo(centerLatLng);map.setZoom(zoomInitial);if($(".action-geolocation-go").attr("checked")){$(".action-geolocation-go").attr("checked",false)}}else{if(a=="near"){map.panTo(myLatLng);map.setZoom(zoomNearMe);if(!$(".action-geolocation-go").attr("checked")){$(".action-geolocation-go").attr("checked",true)}}else{map.setZoom(parseInt(neighbourhoodMarkers[a].zoomLevel));map.panTo(neighbourhoodMarkers[a].position);neighbourhoodMarkers[a].setVisible(true);if($(".action-geolocation-go").attr("checked")){$(".action-geolocation-go").attr("checked",false)}}}return true}function setNeighbourhood(a){$("#selectNeighbourhood").val(a).change()}$("#selectNeighbourhood").change(function(){if(typeof map!=="undefined"){panToNeighbourhood()}setNeighbourhoodDrawer(null,null,$("#selectNeighbourhood").val())});$(document).on("change","#selectCategory",function(){cancelBottomNav();setCatTabs($(this).val());filterByCategory()});function resetMap(){$("#selectCategory").val("all").trigger("change");cancelDirections();cancelBottomNav()}$(document).on("click",".action-marker-goto",function(){resetMap();workpadKey=$(this).data("workpadKey");logMarkerClick({workpad_key:workpadKey});goToBrochure($(this).data("workpadKey"))});function CustomMarker(b,c){this.latlng_=b.position;for(var a in b){this[a]=b[a]}this.setMap(c)}CustomMarker.prototype.draw=function(){var d=this;var a=this.div_;if(!a){a=this.div_=document.createElement("DIV");a.className="custom-marker "+(typeof(this.className)==="string"?this.className:"");a.style.position="absolute";a.style.paddingLeft="0px";a.style.cursor="pointer";var c=document.createElement("img");c.src=this.icon;a.appendChild(c);google.maps.event.addDomListener(a,"click",function(j){google.maps.event.trigger(d,"click")});var e=this.getPanes();e.overlayMouseTarget.appendChild(a);e.overlayMouseTarget.parentNode.style.zIndex=9999999;if(typeof(this.className)==="string"){var i=document.createElement("DIV");var b=document.createElement("DIV");i.className="dot";b.className="geopulse";a.appendChild(i);a.appendChild(b)}}var c=a.getElementsByTagName("img")[0];var f=c.width;var g=c.height;var h=this.getProjection().fromLatLngToDivPixel(this.latlng_);if(h){a.style.left=Math.floor(h.x-f/2)+"px";a.style.top=Math.floor(h.y-g)+"px"}};CustomMarker.prototype.onAdd=function(){this.draw()};CustomMarker.prototype.remove=function(){if(this.div_){this.div_.parentNode.removeChild(this.div_);this.div_=null}};CustomMarker.prototype.getPosition=function(){return this.latlng_};CustomMarker.prototype.setPosition=function(a){this.latlng_=a};CustomMarker.prototype.getDraggable=function(){};CustomMarker.prototype.getVisible=function(){return this.isVisible};CustomMarker.prototype.setVisible=function(a){this.isVisible=a;var b=this.div_;if(b){b.style.display=a?"block":"none"}};CustomMarker.prototype.setZIndex=function(b){var a=this.div_;if(a){a.style.zIndex=b}};CustomMarker.prototype.setClass=function(a){var c=this.div_;if(c){var b=document.createElement("DIV");b.className=a;c.appendChild(b)}};function addOverlay(){overlay.setMap(map)}function logMarkerClick(a){$.ajax({url:"/ajax/marker_click.php",data:a})}$(document).on("click",".action-log-click",function(){var b=$(this);var a=b.data("workpad_key");logMarkerClick({workpad_key:workpadKey})});$(document).on("click",".action-directions-show",function(){cancelBottomNav();var b=$(this);var a=b.data("workpad_key");logMarkerClick({workpad_key:workpadKey});b.closest(".modal").closeModal();displayDirections(getMarkerByWorkpadKey(a),"WALKING")});$(document).on("click",".goto-brochure",function(){logMarkerClick({workpad_key:workpadKey});goToBrochure($(this).data("workpad_key"))});$(document).on("click",".action-deal-on",function(){if(countDeals==0){Materialize.toast("Sorry, no deals at the moment...",4000);return false}$(".action-directions-cancel").trigger("click");$(".action-dealnote-color").addClass("orange");$(".action-dealnote-color").removeClass("deep-purple");$(".action-dealnote-off").removeClass("hide");showSubsetOnly("deal")});$(document).on("click",".action-notification-on",function(){if(countNotifications==0){Materialize.toast("Sorry, no announcements at the moment...",4000);return false}$(".action-directions-cancel").trigger("click");$(".action-dealnote-color").addClass("deep-purple");$(".action-dealnote-color").removeClass("orange");$(".action-dealnote-off").removeClass("hide");showSubsetOnly("notification")});function cancelBottomNav(){$(".action-dealnote-off").addClass("hide");$(".action-favourites-closebar").fadeOut()}$(document).on("click",".action-bottomnav-cancel",function(){cancelBottomNav()});$(document).on("click",".action-dealnote-off",function(){$(".action-dealnote-off").addClass("hide");showSubsetOnly(false)});$(document).on("click",".action-favourites-off",function(){$(".action-favourites-closebar").fadeOut();$("#selectCategory").val("all").trigger("change")});$(document).on("click",".action-directions-showsteps",function(){directionsDisplay.setPanel(document.getElementById("action-directions-googlesteps"));$(".action-neighbourhood-sidenav").fadeOut();$(".action-directions-steps").fadeIn();showSideNav("show")});$(document).on("click",".action-sidenav-show",function(){showSideNav("show")});$(document).on("click",".action-sidenav-hideonsmall",function(){showSideNav("hide")});$(document).on("click",".action-gotome-go",function(){gotoMe()});$(document).on("click",".action-deal-signup",function(){var a={account_id:account_id,latlng:myLatLng};materialModal("add-a-deal",true,a)});function showSideNav(a){var b=$(window).width();if(b<992){$(".button-collapse").sideNav(a);if(a=="hide"){$("div[id=sidenav-overlay]").remove()}}}function getMarkerByWorkpadKey(b){for(var a in workpadMarkers){if(workpadMarkers[a].id==b){return workpadMarkers[a]}}}function getParentByWorkpadKey(b,d){var c={workpad_key:b};var a=false;$.ajax({url:"/ajax/get_parent_by_workpad_key.php",data:c,method:"POST",error:function(e){console.log(e)},success:function(e){var f=JSON.parse(e);a=f.parent_workpad_key;if(typeof d==="function"){d(a)}}});return a};