import wixWindow from 'wix-window';
import wixData from 'wix-data';

import { groomReportTable } from 'public/GroomReport.js';

let _trailList = []
let _winHt = 0;
let _winWid = 0;

$w.onReady(function () {
	$w('#genCmntText').hide();

	fillTrailRgnDrpDn();
	console.log("onReady report options length " + $w('#reportOptionsRadio').options.length + "; first " + $w('#reportOptionsRadio').options[0].label);
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
	let tdy = new Date();
	let dateTxt = tdy.toDateString();
	let htmltxt = '<div style="font-size:18px;">' + dateTxt + '</div>'
	$w('#grmRptDateTxt').html = htmltxt;
	$w('#reportOptionsRadio').options = [{ label: "Brief", value: '0' }, { label: "All Trails", value: '1' }, { label: "Full", value: '2' }]
	$w('#reportOptionsRadio').selectedIndex = 0;
	$w('#trailTypeRadio').options = [{ label: "Ski", value: 'ski' }, { label: "Bike", value: 'bike' }]
	$w('#trailTypeRadio').selectedIndex = 0;
	$w('#grmRptTable').html = "";
});

function fillTrailRgnDrpDn() {
	const trType = $w('#trailTypeRadio').options[$w('#trailTypeRadio').selectedIndex]['value'];
	wixData.query("skiTrailsTable")
		.limit(20)
		.eq("trailType", trType)
		.ascending("viewSort")
		.find()
		.then(results => {
			const rgns = getUniqueTrailRegions(results.items);
			let rgnsOpts = buildOptions(rgns);
			rgnsOpts.push({ label: "All", value: "All" })
			$w('#grmRptTrailRgnDrpDn').options = rgnsOpts;
			$w('#grmRptTrailRgnDrpDn').selectedIndex = rgnsOpts.length - 1;
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
	let ndx = $w('#reportOptionsRadio').selectedIndex;
	let grmRptClass = new groomReportTable(rptrgn, $w('#grmRptHours').value, ndx);
	var tblhtml=await grmRptClass.fillGrmRptTbl(trType);
	// console.log("fillGrmRptTbl html: "+tblhtml)
	if (tblhtml.length>1)
		$w('#grmRptTable').html = tblhtml;

	var sortCmnt = await grmRptClass._skiGroomCommentTableQuery(trType);

	if ((sortCmnt.length > 0) && (sortCmnt[0]["groomDate"] > grmRptClass.fltrDate)) {
		timStr = sortCmnt[0]["groomDate"].toLocaleDateString("en-US", dateStrOpts);
		let cmnthtml = '<p style="background-color:rgb(255,255,255);color:rgb(0,0,0);border: 2px solid green;\
		border-radius: 8px;padding: 10px;font-size:16px">';
		cmnthtml = cmnthtml.concat(timStr + ": ");
		cmnthtml = cmnthtml.concat(sortCmnt[0]["title"])
		cmnthtml = cmnthtml.concat("</p>")
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
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	fillTrailRgnDrpDn();
	fillGrmRptTbl()
}