
let tweets = L.markerClusterGroup();
let tweetLayers = [];

function init() {

  //---------------------------------------------------------------//
  //-------------------------- Constants --------------------------//
  //---------------------------------------------------------------//

  const HOSTNAME = "localhost";
  const ENTITY_ID = "twitter";
  const ENTITY_NAME = "Twitter Stream";
  const OFFERING_ID = "urn:sos:twitter";

  //--------------------------------------------------------------//
  //-------------------------  Map View  -------------------------//
  //--------------------------------------------------------------//

  let esriLink = '<a href="http://www.esri.com/">Esri</a>';
  let esriWholink = 'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

  // leaflet layers
  let esriLayer = L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; ' + esriLink + ', ' + esriWholink,
      maxZoom: 20,
      maxNativeZoom: 19
    }
  );

  let leafletMapView = new OSH.UI.LeafletView(
    "leafletOrientMap",
    [],
    {
      defaultLayer: esriLayer
    }
  );

  let twitterIcon = L.icon({
    iconUrl: 'images/twitter-services.png',
    iconSize: [22.5, 22.5],
    iconAnchor: [0, 0],
  });

  //---------------------------------------------------------------//
  //------------------------ Data  Sources ------------------------//
  //---------------------------------------------------------------//

  // create data sources
  let twitterDataSource = new OSH.DataReceiver.DataSourceTwitter(
    "Twitter",
    {
      protocol : "ws",
      service: "SOS",
      endpointUrl: HOSTNAME + ":8181/sensorhub/sos",
      offeringID: OFFERING_ID,
      observedProperty: "http://sensorml.com/ont/swe/property/Event",
      endTime: "2018-01-01",
      startTime: "now",
      replaySpeed: "1",
      syncMasterTime: true,
      bufferingTime: 60000,
      timeOut: 60000
    }
  );

  twitterDataSource.onData = function(rec) {
    if(tweetLayers.length >= 100) {
      let oldTweetLayer = tweetLayers.shift();
      tweets.removeLayer(oldTweetLayer);
    }

    let marker = L.marker([rec.data.lat, rec.data.lon], {icon: twitterIcon})
                  .bindPopup(rec.data.text); // TODO: This isn't working...

    tweets.addLayer(marker);
    tweetLayers.push(marker);
  }

  leafletMapView.map.addLayer(tweets);

  twitterDataSource.connect();
}
