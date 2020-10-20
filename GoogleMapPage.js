import wixData from 'wix-data';
import {roughSizeOfObject} from 'public/misc.js'
import {groomReportTable} from 'public/GroomReport.js' 
import {getTrailColor} from 'public/GroomReport.js' 

let _grmRpt = null;
let _currTrailName="";
let _currTrailList = [];
let _groomTableData = [];
let _dateClr = "";
$w.onReady(function () {
    console.log("onReady")
    console.log("onReady # entries in groomTable "+_groomTableData.length)
    // doTest();
    let htmlText = '<div style="background-color:rgb(100,200,0);font-size:18px;text-align:center">';
    htmlText=htmlText.concat('Pick Trail Region and Trail from the drop-down lists; When it appears on the map, click the icon for more detail.');
    htmlText=htmlText.concat('<br>Pick All at the top of either list to view all</div>');
    $w('#mapInstructionText').html=htmlText;

	$w('#trailTypeRadio').options = [{ label: "Ski", value: 'ski' }, { label: "Snowshoe or Bike", value: 'bike' }]
	$w('#trailTypeRadio').selectedIndex = 0;
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

async function queryGroomReportTable(){
    // get a month's worth of grooming data...
    _grmRpt = new groomReportTable("All", 720, 1);
	const trType = $w('#trailTypeRadio').options[$w('#trailTypeRadio').selectedIndex]['value'];

    let newRws = await _grmRpt._skiGroomingTableQuery(trType);
    _groomTableData = newRws.sort(function (a, b) {
        var rgnA = a.region.toUpperCase();
        var rgnB = b.region.toUpperCase();
        var nameA = a.trailName.toUpperCase(); // ignore upper and lowercase
        var nameB = b.trailName.toUpperCase(); // ignore upper and lowercase
        var dateA = a.fullDate;
        var dateB = b.fullDate;
        if (dateA < dateB) {
            return 1;
        }
        if (dateA > dateB) {
            return -1;
        }
        if (rgnA < rgnB) {
            return -1;
        }
        if (rgnA > rgnB) {
            return 1;
        }
        // viewSort and region must be equal
        return 0;
    });
}

export function sendTrack(){
    const name = _currTrailName;
    const xml = _currTrailList[$w('#trailNameDrpDn').selectedIndex].gpxText;
    var today = new Date();
    var time_ms = today.getTime();
    var bkgClr = "";
    let trkDate="";
    let skiDffclt={color:"",descr:""};
    let tdiff = 0;
    const trType = $w('#trailTypeRadio').options[$w('#trailTypeRadio').selectedIndex]['value'];
    console.log("sendTrack found groomtable data lgth "+_groomTableData.length+"; or trail "+name);
    for (var i=0;i<_groomTableData.length;i++){
        // console.log("sendTrack for iteration "+i+"; found trail "+_groomTableData[i].trailName.toLowerCase());
        if (_groomTableData[i].trailName.toLowerCase()===name.toLowerCase()){
            console.log("sendTrack: found trail "+name)
            tdiff = time_ms - _groomTableData[i].fullDate.getTime();
            trkDate=_groomTableData[i].groomTime;
            bkgClr=_grmRpt.getDateColor(_groomTableData[i].fullDate)
            skiDffclt=_grmRpt.getSkiDifficultyObject(_groomTableData[i]['skiDifficulty']);
            break;
        }
    }
    console.log("sendTrack: xml length "+xml.length)
    var kys=Object.keys(xml);
    // var parser = new DOMParser();
    // var xmlDoc = parser.parseFromString(xml,"text/xml");
    console.log("sendTrack: bkg "+bkgClr+"; trkDate "+trkDate)
    let trkColor=getTrailColor(Math.floor(Math.random() * 100))
    var msg={
        type:"addtrack",
        label:_currTrailName,
        value:{xml:xml,trkColor:trkColor,
        grmColor:bkgClr,grmDate:trkDate,
        skiDifficulty:skiDffclt,trType:trType}
        }
    $w("#googleMapHTML").postMessage(msg);        
}

export function sendRegionTracks(){
    // addregiontracks
    if (_currTrailList.length<1)
        return;
    if (_groomTableData.length<1)
        return;
    var today = new Date();
    var time_ms = today.getTime();
    var errDate =  new Date(); errDate.setTime(0);
    let trailNamesLst = [];
    let xmlLst = [];
    let trkClrLst = [];
    let grmDateLst = [];
    let grmClrLst = [];
    let skiDffcltLst = [];
    let ii=0; let jj = 0;
    const trType = $w('#trailTypeRadio').options[$w('#trailTypeRadio').selectedIndex]['value'];
    var tdiff = 0;
    var grmDataFnd = false;
    for (ii=0;ii<_currTrailList.length;ii++){
        if (_currTrailList[ii].title.toLowerCase()==="all")
            continue;
        trailNamesLst.push(_currTrailList[ii].title); 
        xmlLst.push(_currTrailList[ii].gpxText);
        trkClrLst.push(getTrailColor(ii));
        grmDataFnd = false;
        for (jj=0;jj<_groomTableData.length;jj++){
            if (_groomTableData[jj].trailName.toLowerCase()===_currTrailList[ii].title.toLowerCase()){
                console.log("sendRegionTracks testing "+_groomTableData[jj].trailName+" against "+_currTrailList[ii].title)
                tdiff = time_ms - _groomTableData[jj].fullDate.getTime();
                grmDateLst.push(_groomTableData[jj].groomTime);
                grmClrLst.push(_grmRpt.getDateColor(_groomTableData[jj].fullDate))
                skiDffcltLst.push(_grmRpt.getSkiDifficultyObject(_groomTableData[jj]['skiDifficulty']));
                grmDataFnd = true;
                break;
            }
        }
        if (grmDataFnd===false)
            {
                console.log("sendRegionTracks failed to match "+_currTrailList[ii].title)
                grmDateLst.push(_grmRpt.getTimeString(errDate));
                grmClrLst.push(_grmRpt.getDateColor(errDate))
                skiDffcltLst.push({color:"background-color:rgb(200,0,0)",descr:"UNK"});
            }
    }
    console.log("sendRegionTracks found "+xmlLst.length+" tracks; isArray "+Array.isArray(xmlLst))
    var msg={
        type:"addregiontracks",
        label:trailNamesLst,
        value:{xml:xmlLst,trkColor:trkClrLst,
        grmColor:grmClrLst,grmDate:grmDateLst,
        skiDifficulty:skiDffcltLst,trType:trType}
        }
    $w("#googleMapHTML").postMessage(msg);        
}

async function fillTrailRgnDrpDn() {
    if (_groomTableData.length<1)
        await queryGroomReportTable();
    try {
    	const trType = $w('#trailTypeRadio').options[$w('#trailTypeRadio').selectedIndex]['value'];
        const results = await wixData.query("skiTrailsTable")
            .eq("trailType", trType)
            .ascending("viewSort")
            .find();
            const rgnsMap = results.items.map(item => item.trailRegion);
            console.log("fillTrailRgnDrpDn: "+rgnsMap.length+"; type "+typeof(rgnsMap) )
            const rgns = [...new Set(rgnsMap)];
            console.log("fillTrailRgnDrpDn: "+rgns.length+"; type "+typeof(rgns) )
            let rgnsOpts = rgns.map(curr => {
                return {label:curr, value:curr};})
            console.log("fillTrailRgnDrpDn: "+rgnsOpts.length+"; type "+typeof(rgnsOpts) )
            rgnsOpts.unshift({ label: "All", value: "All" })
            $w('#trailRgnDrpDn').options = rgnsOpts;
            $w('#trailRgnDrpDn').selectedIndex = 0; // rgnsOpts.length - 1;

    }
    catch (err) {
        console.log("fillTrailRgnDrpDn caught "+err);
    }
doTrailRgn_change();
}

async function fillTrailNameDrpDn(rgn){
	// Run a query that returns all the items in the collection
	let nameOpts = [];
    let fndTrailList=[];
    const trType = $w('#trailTypeRadio').options[$w('#trailTypeRadio').selectedIndex]['value'];
    
	if (rgn.toLowerCase() === "all") {
		console.log("fillTrailNameDrpDn",rgn);
		try {
			const results = await wixData.query("skiTrailsTable")
				.eq("trailType",trType)
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
				.eq("trailRegion", rgn)
				.eq("trailType",trType)
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
    _currTrailList.unshift({title:"All",gpxText:""});
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
		if ($w('#trailRgnDrpDn').options[i].label.toLowerCase() === vlu.toLowerCase()) {
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
}

export async function doTrailRgn_change(){
    let rgn=$w('#trailRgnDrpDn').options[$w('#trailRgnDrpDn').selectedIndex].label
    console.log("trailRgnDrpDn_change "+rgn)
    await fillTrailNameDrpDn(rgn);
    if (_currTrailName.toLowerCase() === "all")
        return sendRegionTracks();
    else
        return sendTrack()
}

export function doTrailName_chnge(){
    _currTrailName=$w('#trailNameDrpDn').value;
    if (_currTrailName.toLowerCase()==="all"){
        return sendRegionTracks();
    }

    for (var i=0;i<_currTrailList.length;i++){
        if (_currTrailList[i].title===_currTrailName)
            break;
    }
    sendTrack();
}

export function trailNameDrpDn_change(event) {
    doTrailName_chnge();
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

export function trailTypeRadio_change(event) {
    const trType = $w('#trailTypeRadio').options[$w('#trailTypeRadio').selectedIndex]['value'];
    _groomTableData=[];
    fillTrailRgnDrpDn();
    doTrailRgn_change();
}