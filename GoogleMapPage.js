import wixData from 'wix-data';
import {roughSizeOfObject} from 'public/misc.js'

// For full API documentation, including code examples, visit https://wix.to/94BuAAs

let _currTrailName="";
let _currTrailList = [];
$w.onReady(function () {
    console.log("onReady")
    doTest();
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
    var sz = roughSizeOfObject(xml);
    console.log("sendTrack: xml length "+xml.length+"; rough size "+sz)
    var kys=Object.keys(xml);
    const doloop=false;
    if (doloop){
        for (const ky in kys) {
            for( var kyobj in xml[ky] ) {
                    console.log("sendTrack kyobj "+kyobj[0]);
                }
        }    
    }
    // var parser = new DOMParser();
    // var xmlDoc = parser.parseFromString(xml,"text/xml");

    var msg={
        type:"addtrack",
        label:_currTrailName,
        value:xml
        }
        $w("#googleMapHTML").postMessage(msg);        
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
doTrailRgn_change();
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
    _currTrailList=fndTrailList.filter(function(elmnt){return (elmnt.gpxText!==undefined);})
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
    sendTrack(_currTrailName,_currTrailList[0].gpxText)
}

export function doTrailRgn_change(){
    let rgn=$w('#trailRgnDrpDn').options[$w('#trailRgnDrpDn').selectedIndex].label
    console.log("trailRgnDrpDn_change "+rgn)
    return fillTrailNameDrpDn(rgn);
}

export function trailNameDrpDn_change(event) {
    _currTrailName=$w('#trailNameDrpDn').value;
    for (var i=0;i<_currTrailList.length;i++){
        if (_currTrailList[i].title===_currTrailName)
            break;
    }
    sendTrack(_currTrailName, _currTrailList[i].gpxText);
}

export function trailRgnDrpDn_change(event) {
    doTrailRgn_change();
}

function doTest(){
    let lat=41.37613/360*Math.PI*2;
    let lon=-111.889448/360*Math.PI*2;
    let lastlat=41.379655/360*Math.PI*2;
    let lastlon=-111.899291/360*Math.PI*2;
    let latdiff=lat-lastlat; let londiff=lon-lastlon;
    let a=0,c=0,d=0;
    try{
        console.log("doTest sin(latdiff) "+Math.sin(latdiff/2)**2+"; sin(londiff) "+Math.sin(londiff)**2);
        a = (Math.sin(latdiff/2))**2 + Math.cos(lat) * Math.cos(lastlat) * (Math.sin(londiff/2))**2;
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a) )
        d = 3961 * c; // (where 3961 miles is the radius of the Earth) 
        console.log("doTest found a,c,d"+a+","+c+","+d+",");
    } catch(err){
        console.log("doTest caught math error "+err);
    }

}