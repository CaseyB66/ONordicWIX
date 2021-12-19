import wixWindow from 'wix-window';
import wixData from 'wix-data';
import {groomReportTable} from 'public/GroomReport.js' 

let _trailList = []
let _winHt = 0;
let _winWid = 0;

$w.onReady(function () {
	$w('#genCmntText').hide();

	fillTrailRgnDrpDn();
	let hoursopts = [{ label: "1  Month", value: "720" },{ label: "1 Week", value: "168" },
		{ label: "48 Hours", value: "48" },
		{ label: "36 Hours", value: "36" },
		{ label: "24 Hours", value: "24" },
		{ label: "18 Hours", value: "18" },
		{ label: "12 Hours", value: "12" },
		{ label: "8 Hours", value: "8" },
		{ label: "4 Hours", value: "4" }
	];
	$w('#grmRptHours').options = hoursopts;
	$w('#grmRptHours').selectedIndex = 2;
	let tdy = new Date();
	let dateTxt = tdy.toDateString();
	let htmltxt = '<div style="font-size:18px;">' + dateTxt + '</div>'
	$w('#grmRptDateTxt').html = htmltxt;
	$w('#reportOptionsRadio').options = [{ label: "All Trails", value: '1' }, { label: "Full", value: '2' }]
	$w('#reportOptionsRadio').selectedIndex = 0;
	$w('#trailTypeRadio').options = [{ label: "Ski", value: 'ski' }, { label: "Snowshoe or Bike", value: 'bike' }]
	$w('#trailTypeRadio').selectedIndex = 0;
	$w('#grmRptTable').html = "";
    htmltxt = '<div style="background-color:rgb(100,200,0);font-size:14px;text-align:center">';
    htmltxt=htmltxt.concat('All Trails: show latest groom date and classic tracks for all trails within the Time Period');
    htmltxt=htmltxt.concat('<br>Full: show all information for all dates in chosen Time Period</div>');
	$w('#reportOptionsHelp').html=htmltxt;
	$w('#reportOptionsHelp').hide();

    const _grmRpt = new groomReportTable("All", 720, 1);
    const clrDefn=_grmRpt.getDateColorDefn();
    htmltxt = '<div style="background-color:rgb(200,200,200);font-size:12px;text-align:center">';
    htmltxt=htmltxt.concat('Table Colors indicate recent grooming');
    htmltxt=htmltxt.concat('<div style="background-color:'+clrDefn[0].color+';">Within '+clrDefn[0].hrs+' hours</div>');
    htmltxt=htmltxt.concat('<div style="background-color:'+clrDefn[1].color+';">Within '+clrDefn[1].hrs+' hours</div>');
    htmltxt=htmltxt.concat('<div style="background-color:'+clrDefn[2].color+';">More than '+clrDefn[1].hrs+' hours</div>');
    htmltxt=htmltxt.concat('</div>');
    $w("#colorCodesHover").html=htmltxt;
    $w("#colorCodesHover").show();
});

function fillTrailRgnDrpDn() {
	const trType = $w('#trailTypeRadio').options[$w('#trailTypeRadio').selectedIndex]['value'];
	wixData.query("skiTrailsTable")
		.limit(200)
		.gt("reportPriority",-1)
		.eq("trailType", trType)
		.ascending("viewSort")
		.find()
		.then(results => {
			const rgns = getUniqueTrailRegions(results.items);
			let rgnsOpts = buildOptions(rgns);
			rgnsOpts.push({ label: "All", value: "All" })
			$w('#grmRptTrailRgnDrpDn').options = rgnsOpts;
			$w('#grmRptTrailRgnDrpDn').selectedIndex = rgnsOpts.length - 1;
			console.log("fillTrailRgnDrpDn for trail type "+trType+"; found " + rgnsOpts.length+' regions')
			fillGrmRptTbl();
		})
}

function getUniqueTrailRegions(items) {
	const rgnOnly = items.map(item => item.trailRegion);
	return [...new Set(rgnOnly)];
}

function buildOptions(uniqueList) {
	return uniqueList.map(curr => {
		// Use the map method to build the options list in the format {label:uniqueTitle, value:uniqueTitle}
		return { label: curr, value: curr };
	});
}

export function grmRptTrailRgnDrpDn_change(event) {
	let vlu = $w('#grmRptTrailRgnDrpDn').value.toString();
	console.log('grmRptTrailRgnDrpDn_change found Region '+vlu)
	fillGrmRptTbl();
}

async function fillGrmRptTbl() {
	const trType = $w('#trailTypeRadio').options[$w('#trailTypeRadio').selectedIndex]['value'];	
	let rptrgn = $w('#grmRptTrailRgnDrpDn').value;
	if (rptrgn.length < 2)
		return;
	var dateStrOpts = {
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	};
	let timStr = ""
	// rgn = "South", hrs = 24, rprtTyp = 0
	let ndx = Number($w('#reportOptionsRadio').options[$w('#reportOptionsRadio').selectedIndex].value);
	let grmRptClass = new groomReportTable(rptrgn, $w('#grmRptHours').value, ndx);
	var tblhtml=await grmRptClass.fillGrmRptTbl(trType);
	// console.log("fillGrmRptTbl html: "+tblhtml)
	if (tblhtml.length>1)
		$w('#grmRptTable').html = tblhtml;

	let cmnthtml= await grmRptClass._skiGroomCommentHTML(trType);
	if (cmnthtml.length>1){
		$w('#genCmntText').html = cmnthtml;
		$w('#genCmntText').show();
	} else {
		$w('#genCmntText').html = "";
		$w('#genCmntText').hide();
	}

}

export function grmRptHours_change(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	fillGrmRptTbl();
}

export function reportOptionsRadio_change(event) {
	fillGrmRptTbl();
}


export function trailTypeRadio_change(event) {
	const trType = $w('#trailTypeRadio').options[$w('#trailTypeRadio').selectedIndex]['value'];
    let htmlText = '<div style="background-color:rgb(100,200,0);font-size:14px;text-align:center">';
	if (trType.toLowerCase()==='ski'){
		htmlText=htmlText.concat('All Trails: show latest groom date and classic tracks for all trails within the Time Period');
	} else {
		htmlText=htmlText.concat('All Trails: show latest groom date for all trails within the Time Period');
	}
	htmlText=htmlText.concat('<br>Full: show all information for all dates in chosen Time Period</div>');
	$w('#reportOptionsHelp').html=htmlText;
	fillTrailRgnDrpDn();
	fillGrmRptTbl()
}

export function reportOptionsHelp_click(event) {
	if ($w('#reportOptionsHelp').isVisible)
		$w('#reportOptionsHelp').hide();
}

export function reportOptionsRadio_mouseIn(event) {
	$w('#reportOptionsHelp').show();
}

export function reportOptionsRadio_mouseOut(event) {
	$w('#reportOptionsHelp').hide();
}