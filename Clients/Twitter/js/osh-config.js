
function init() {

  //---------------------------------------------------------------//
  //-------------------------- Constants --------------------------//
  //---------------------------------------------------------------//

  const HOSTNAME = "localhost";
  const ENTITY_ID = "twitter";
  const ENTITY_NAME = "Twitter Stream";
  const OFFERING_ID = "urn:sos:twitter";
  tweets = []; //TODO: Queue that holds tweets and their markers.

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
      maxZoom: 22,
      maxNativeZoom: 19
    }
  );

  leafletMapView = new OSH.UI.LeafletView(
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
  twitterDataSource = new OSH.DataReceiver.DataSourceTwitter(
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
    let marker = L.marker([rec.data.lat, rec.data.lon], {icon: twitterIcon})
                  .addTo(leafletMapView.map)
                  .bindPopup(rec.data.text); // TODO: This isn't working...

    if(tweets.length >= 25) {
      let oldTweet = tweets.shift();
      oldTweet.marker.remove();
    }

    tweets.push({marker: marker, data: rec.data});
  }

  twitterDataSource.connect();
}
