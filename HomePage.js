import { groomReportTable } from 'public/GroomReport.js';

$w.onReady(function () {
	// Write your JavaScript here

	// To select an element by ID use: $w("#elementID")

	// Click "Preview" to run your code
	$w('#genCmntText').hide();
	$w('#genBikeCmnt').hide();

	fillGroomRpt();
});

async function fillGroomRpt(){
	let rptrgn="All";
	let rpthrs = 336;
	var cmntHtml=""
	let grmRptClass = new groomReportTable(rptrgn, rpthrs, 0);
	grmRptClass.setSmallTable(true);
	var tblhtml=await grmRptClass.fillGrmRptTbl("ski");
	// console.log("fillGrmRptTbl html: "+tblhtml)
	if (tblhtml.length>1){
		$w('#skiGrmRpt').html = tblhtml;
		cmntHtml=await grmRptClass._skiGroomCommentHTML("ski");
		if (cmntHtml.length>0){
			console.log("fillGrmRptTbl cmnthtml: "+cmntHtml)
			$w('#genCmntText').html=cmntHtml;
			$w('#genCmntText').show();
		} else {
			$w('#genCmntText').html="";
			$w('#genCmntText').hide();
		}
	}

	tblhtml=await grmRptClass.fillGrmRptTbl("bike");
	// console.log("fillGrmRptTbl html: "+tblhtml)
	if (tblhtml.length>1)
	{
		$w('#bikeGrmRpt').html = tblhtml;
		cmntHtml=await grmRptClass._skiGroomCommentHTML("bike");
		if (cmntHtml.length>0){
			console.log("fillGrmRptTbl cmnthtml: "+cmntHtml)
			$w('#genBikeCmnt').html=cmntHtml;
			$w('#genBikeCmnt').show();
		} else {
			$w('#genBikeCmnt').html="";
			$w('#genBikeCmnt').hide();
		}

	} else {

	}


}