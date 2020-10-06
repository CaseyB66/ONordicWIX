import { groomReportTable } from 'public/GroomReport.js';

$w.onReady(function () {
	// Write your JavaScript here

	// To select an element by ID use: $w("#elementID")

	// Click "Preview" to run your code
	fillGroomRpt();
});

async function fillGroomRpt(){
	let rptrgn="All";
	let rpthrs = 336;
	let grmRptClass = new groomReportTable(rptrgn, rpthrs, 0);
	grmRptClass.setSmallTable(true);
	var tblhtml=await grmRptClass.fillGrmRptTbl("ski");
	// console.log("fillGrmRptTbl html: "+tblhtml)
	if (tblhtml.length>1)
		$w('#skiGrmRpt').html = tblhtml;
	tblhtml=await grmRptClass.fillGrmRptTbl("bike");
	// console.log("fillGrmRptTbl html: "+tblhtml)
	if (tblhtml.length>1)
		$w('#bikeGrmRpt').html = tblhtml;

}