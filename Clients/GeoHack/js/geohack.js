window.OSH.BASE_WORKER_URL = "js/sub/workers";
window.CESIUM_BASE_URL = 'vendor/';

OSH.Helper.HtmlHelper.onDomReady (function(){
    //------------ VIEW -----------------//
    var leafletMapView = new OSH.UI.LeafletView("map-container",[],{
        name:"2D Map"
    });

    var cesiumMapView = new OSH.UI.CesiumView("", [],{
            name:"3D Map"
        }
    );


    var menu = cssCircleMenu('.js-menu');
    var currentIdView = leafletMapView.divId;
    var mainDiv = document.getElementById("map-container");

    // menu handlers
    document.getElementById("2D-view-button").onclick = function(event) {
        if(currentIdView !== leafletMapView.divId){
            cesiumMapView.hide();
            leafletMapView.attachTo(mainDiv.id);
            currentIdView = leafletMapView.divId;
        }
        menu.closeMenu();
    };

    document.getElementById("3D-view-button").onclick = function(event) {
        if(currentIdView !== cesiumMapView.divId){
            leafletMapView.hide();
            cesiumMapView.attachTo(mainDiv.id);
            currentIdView = cesiumMapView.divId;
        }
        menu.closeMenu();
    };

   document.getElementById("add-entity-button").onclick = function(event){
     var entityEditorView = new OSH.UI.Panel.EntityEditorPanel("",{
     viewContainer: "map-container",
     services: ["http://sensiasoft.net:8181/sensorhub/sos",
         "http://localhost:8181/sensorhub/sos",
         "http://localhost:8182/sensorhub/sos"]
     });

     var entityEditorDialog    = new OSH.UI.Panel.DialogPanel("dialog-container",{
         css: "dialog-entity",
         name: "Create new Entity",
         show:true,
         pinContainerId: "dialog-container",
         draggable:true,
         closeable:true,
         destroyOnClose:true
     });

     entityEditorView.attachTo(entityEditorDialog.popContentDiv.id);

     entityEditorDialog.pin();
     //entityEditorDialog.minimize();
     menu.closeMenu();
   };

});
