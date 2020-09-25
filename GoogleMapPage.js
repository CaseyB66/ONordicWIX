import wixData from 'wix-data';
import {getFileInfo} from 'backend/GoogleMap'
// For full API documentation, including code examples, visit https://wix.to/94BuAAs

$w.onReady(function () {
    console.log("onReady")
    $w('#latEdit').min=41.358;
    $w('#latEdit').max=41.395;
    $w('#lngEdit').max=-111.896
    $w('#lngEdit').min=-111.930;
    let trailsinfo=getFileInfo("GPXPaths/SkiTrails.gpx")
	$w("#googleMapHTML").onMessage((event)=>{

		if(event.data.type === 'ready'){
            console.log("onReady got ready msg from map: ")
        }
		
		if(event.data.type === 'init'){
            console.log("onReady got init msg from map: with initCtr "+
                event.data.value['lat']+","+event.data.value['lng'])
		}
	})
    fillTrailRgnDrpDn();
});


export function addLocBtn_click(event) {
    try {
    var lat=Number($w('#latEdit').value);
    var lng=Number($w('#lngEdit').value);
    var msg={
        type:"addloc",
        label:$w('#locNameEdit').value,
        value:{lat: lat, lng: lng}
        }
        console.log("addLocBtn_click: lat/long"+lat+"/"+lng)
        $w("#googleMapHTML").postMessage(msg);        
    }
    catch (err){

    }
}

function fillTrailRgnDrpDn() {
	wixData.query("skiTrailsTable")
		.limit(20)
		.eq("trailType", "ski")
		.ascending("viewSort")
		.find()
		.then(results => {
            const rgnsMap = results.items.map(item => item.trailRegion);
            console.log("fillTrailRgnDrpDn: "+rgnsMap.length+"; type "+typeof(rgnsMap) )
            const rgns = [new Set(rgnsMap)];
            console.log("fillTrailRgnDrpDn: "+rgns.length+"; type "+typeof(rgns) )
			let rgnsOpts = rgns.map(curr => {
		        return {label:curr, value:curr};})
            console.log("fillTrailRgnDrpDn: "+rgnsOpts.length+"; type "+typeof(rgnsOpts) )
			rgnsOpts.push({ label: "All", value: "All" })
			$w('#trailRgnDrpDn').options = rgnsOpts;
			$w('#trailRgnDrpDn').selectedIndex = rgnsOpts.length - 1;
		})
}