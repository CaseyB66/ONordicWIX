import wixData from 'wix-data';
import {getFileInfo} from 'backend/GoogleMap'
// For full API documentation, including code examples, visit https://wix.to/94BuAAs

let _currTrailName="";
let _currTrailList = [];

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
		if(event.data.type === 'addtrack'){
            console.log("onReady got addtrack msg from map: with track length "+
                event.data.value)
		}
	})
    fillTrailRgnDrpDn();
});

export function sendTrack(name,xml){
    var pts = xml.getElementsByTagName("trkpt");
    console.log("sendTrack: xml length "+pts.length)
    var msg={
        type:"addloc",
        label:$w('#locNameEdit').value,
        value:xml
        }
        $w("#googleMapHTML").postMessage(msg);        
}

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

async function fillTrailRgnDrpDn() {
    try {
        const results = await wixData.query("skiTrailsTable")
            .limit(20)
            .eq("trailType", "ski")
            .ascending("viewSort")
            .find();
            const rgnsMap = results.items.map(item => item.trailRegion);
            console.log("fillTrailRgnDrpDn: "+rgnsMap.length+"; type "+typeof(rgnsMap) )
            const rgns = [...new Set(rgnsMap)];
            console.log("fillTrailRgnDrpDn: "+rgns.length+"; type "+typeof(rgns) )
            let rgnsOpts = rgns.map(curr => {
                return {label:curr, value:curr};})
            console.log("fillTrailRgnDrpDn: "+rgnsOpts.length+"; type "+typeof(rgnsOpts) )
            rgnsOpts.push({ label: "All", value: "All" })
            $w('#trailRgnDrpDn').options = rgnsOpts;
            $w('#trailRgnDrpDn').selectedIndex = 0; // rgnsOpts.length - 1;

    }
    catch (err) {
        console.log("fillTrailNameDrpDn caught "+err);
    }
trailRgnDrpDn_change(undefined);
}

async function fillTrailNameDrpDn(rgn){
	// Run a query that returns all the items in the collection
	let nameOpts = [];
    let fndTrailList=[];
	if (rgn === "All") {
		console.log("fillTrailNameDrpDn",rgn);
		try {
			const results = await wixData.query("skiTrailsTable")
				.limit(100)
				.eq("trailType","ski")
				.ascending("viewSort")
				.find();
				fndTrailList = results.items;
		}
		catch (err) {
			console.log("fillTrailNameDrpDn caught "+err);
		}
	} else {
		console.log("fillTrailNameDrpDn else: rgn = "+rgn);
		try {
			const results = await wixData.query("skiTrailsTable")
				// Get the max possible results from the query
				.limit(100)
				.eq("trailRegion", rgn)
				.eq("trailType","ski")
				.ascending("viewSort")
				.find();
                const titlesOnly = results.items.map(item => item.title);   
                // Return an array with a list of unique titles
                const uniqueTitles = [...new Set(titlesOnly)];
                nameOpts = uniqueTitles.map(curr => {
                    return {label:curr, value:curr};})
				fndTrailList = results.items;
		}
		catch (err) {
			console.log("fillTrailNameDrpDn caught "+err);
		}
	}
    let ctlLgth=fndTrailList.length;
    _currTrailList=fndTrailList.filter(function(elmnt){return (elmnt.gpxData!==undefined);})
    console.log("fillTrailNameDrpDn reduced trailList from "+ctlLgth+" to "+_currTrailList.length)

    const titlesOnly = _currTrailList.map(item => item.title);   
    // Return an array with a list of unique titles
    const uniqueTitles = [...new Set(titlesOnly)];
    nameOpts = uniqueTitles.map(curr => {
        return {label:curr, value:curr};})


    let i=0;
    $w('#trailNameDrpDn').options = nameOpts;
	let vlu = $w('#trailRgnDrpDn').value.toString();
	let ndx = -1;

	for (i = 0; i < $w('#trailRgnDrpDn').options.length; i++) {
		if ($w('#trailRgnDrpDn').options[i].label === vlu) {
			ndx = i;
			break;
		}
	}
	if (ndx > -1) {
		$w('#trailRgnDrpDn').selectedIndex = Number(ndx);
	}
	// $w('#trailNameDrpDn').selectedIndex = 0;
	// $w('#trailNameDrpDn').value="";
	_currTrailName = _currTrailList[0].title;
    $w('#trailNameDrpDn').selectedIndex=0;
	console.log("fillTrailName set trail to "+_currTrailName);
    sendTrack(_currTrailName,_currTrailList,_currTrailList[0].gpxData)
}

export function trailRgnDrpDn_change(event) {
    let rgn=$w('#trailRgnDrpDn').options[$w('#trailRgnDrpDn').selectedIndex].label
    console.log("trailRgnDrpDn_change "+rgn)
    return fillTrailNameDrpDn(rgn);
}