import wixWindow from 'wix-window';
import wixData from 'wix-data';
// Filename: public/GroomReport.js 
//
// Code written in public files is shared by your site's
// Backend, page code, and site code environments.
// Use public files to hold utility functions that can 
// be called from multiple locations in your site's code.

export function getTrailColor(trct){
	const maxClrs = 7;
	// ROYGBIV: Red, Orange, Yellow, Green, Blue, Indigo, Violet
	const clrs = ['#FF0000','#FFA500','#FFFF00','#008000','#0000FF','#4B0082','#EE82EE'];
	let clrNdx = trct % maxClrs;
	return clrs[clrNdx];
}

export class groomReportTable {
	// rprtType can be 0 for "Brief", 1 for "All Trails", 3 for "Full"
	constructor(rgn = "South", hrs = 24, rprtTyp = 0) {
		this.hours = hrs;
		this.region = rgn;
		let tdy = new Date();
		this.reprtDate = tdy.toDateString();
		this.reportType = rprtTyp;
		this._winWid = 0;
		this._winHt = 0;
		var today = new Date();
		var time_ms = today.getTime();
		this.fltrDate = new Date(time_ms - this.hours * 60 * 60000);
		this.bSmallTable = false;
	}

	setSmallTable(bval){
		this.bSmallTable = bval;
	}

	async _getWinInfo() {
		let wininfo = await wixWindow.getBoundingRect();
		this._winHt = wininfo.window.height;
		this._winWid = wininfo.window.width;
	}

	getTimeString(thedate){
		var dateStrOpts = {
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		};
		return thedate.toLocaleDateString("en-US", dateStrOpts);
	}

	async _skiGroomingTableQuery(trType) {
		let mchfltr = '1';
		if (this.reportType === 2)
			mchfltr = '0'

		console.log("_skiGroomingTableQuery starting...")
        var trlDnItems = [];
		try {
			const results = await wixData.query("skiGroomingTable")
				.include("trailRef")
				.include("groomerRef")
				.limit(500)
				.ge("groomDate", this.fltrDate)
				.ge("groomMachine", mchfltr)
				.find();
			trlDnItems = results.items;
			if (undefined === trlDnItems){
				console.log("_skiGroomingTableQuery found NO results!")
				return [];
			}
			else
				console.log("_skiGroomingTableQuery retured " + trlDnItems.length)
		} catch (err) {
			console.log("_skiGroomingTableQuery caught error " + err)
			return [];
		}
		if ((trlDnItems === undefined) || (trlDnItems.length < 1)) {
			console.log("_skiGroomingTableQuery exiting with no results from query")
			return [];
		}
		let timStr = ""
		let newRws = []
		for (var j = 0; j < trlDnItems.length; j++) {
			if (trlDnItems[j] === undefined)
				continue;
			if ((trlDnItems[j]["trailRef"]["trailType"]===trType) && ((this.region.toLowerCase() === "all") || (this.region === trlDnItems[j]["trailRef"]["trailRegion"]))) {
				let machtxt = "None";
				if (trlDnItems[j]["groomMachine"] === '1') {
					if (trType==="ski")
						machtxt = "Cat";
					else
						machtxt = "Tires"
				}
				if (trlDnItems[j]["groomMachine"] === '3') {
					machtxt = "Cat&Sled"
				}
				if (trlDnItems[j]["groomMachine"] === '2') {
					if (trType==="ski")
						machtxt = "Sled";
					else
						machtxt = "Drag"
				}
				timStr = this.getTimeString(trlDnItems[j]["groomDate"]);
				newRws.push({
					"trailName": trlDnItems[j]["trailRef"]["title"],
					"fullDate": trlDnItems[j]["groomDate"],
					"groomTime": timStr,
					"classicSet": trlDnItems[j]["classicSet"],
					"groomMachNbr": trlDnItems[j]["groomMachine"],
					"groomMach": machtxt,
					"trailCondx": trlDnItems[j]["trailCondition"],
					"grmrCmnt": trlDnItems[j]["groomerComment"],
					"grmr": trlDnItems[j]["groomerRef"]["title"],
					'region': trlDnItems[j]["trailRef"]["trailRegion"],
					'priority': trlDnItems[j]["trailRef"]["reportPriority"],
					'viewSort': trlDnItems[j]["trailRef"]['viewSort'],
					'skiDifficulty':trlDnItems[j]['trailRef']['skiDifficulty']
				})
			}
		}
        return newRws;
	}

	getSkiDifficultyObject(dffclty){
		let color4 = "rgb(250,0,0)";
		let color5 = "rgb(200,0,0)";
		let color1 = "rgb(0,250,0)";
		let color2 = "rgb(100,230,0)";
		let color3 = "rgb(200,200,0)";
		let rtrn={color:color1,descr:"Easy"};
		if (dffclty===2){
			rtrn.color=color2;
			rtrn.descr="Easy-Moderate";
		}
		if (dffclty===3){
			rtrn.color=color3;
			rtrn.descr="Moderate";
		}
		if (dffclty===4){
			rtrn.color=color4;
			rtrn.descr="Difficult";
		}
		if (dffclty===5){
			rtrn.color=color5;
			rtrn.descr="Very-Difficult";
		}
	return rtrn;
	}

	getDateColor(rowDate){
		var today = new Date();
		var time_ms = today.getTime();
		var tdiff = time_ms - rowDate.getTime();
		let colorRed = "rgb(250,0,0)";
		let colorGreen = "rgb(0,250,0)";
		let colorYellow = "rgb(200,200,0)";
		if (tdiff < 16 * 3600000)
			return colorGreen;
		if (tdiff < 24 * 3600000)
			return colorYellow;
		return colorRed;
	}

	async _skiGroomCommentTableQuery(trType) {
		try {
			const results = await wixData.query("skiGroomCommentTable")
				.include("groomerRef")
				.limit(100)
				.eq("trailType",trType)
				.ge("groomDate", this.fltrDate)
				.find();
			var cmntItems = results.items;

			var sortCmnt = cmntItems.sort(function (a, b) {
				var dateA = a.groomDate;
				var dateB = b.groomDate;
				if (dateA < dateB) {
					return 1;
				}
				if (dateA > dateB) {
					return -1;
				}
				return 0;
			});
		} catch (err) {
			console.log("fillgrmRptTable caught error getting general comment" + err)
		}
		return sortCmnt;
	}

	buildGrmRptTable(trType,srtRws) {
		let thisTrail = "";
		console.log("buildGrmRptTable this.reportType " + this.reportType);

		let lstRgn = "";
		let fntszfull = "width:100%;font-size:12px";
		let fntszsimple = "width:60%;font-size:16px";
		if (this.bSmallTable){
			fntszsimple = "width:100%;font-size:13px";
		}
		this._getWinInfo();
		if (wixWindow.formFactor === "Mobile" || wixWindow.formFactor === "Tablet") {
			if (this._winWid > this._winHt) {
				fntszfull = "width:100%;font-size:5px";
				fntszsimple = "width:100%;font-size:9px";
			} else {
				fntszfull = "width:100%;font-size:8px";
				fntszsimple = "width:100%;font-size:12px";
			}
		}
		let tblsrc = "";
		try {
			if (this.reportType === 2) {
				tblsrc = '<table style="' + fntszfull;
				tblsrc = tblsrc.concat(';overflow-y:auto;background-color:rgb(250,250,250);\
		border: 1px solid black;border-collapse: collapse;">');
			if (trType==='ski'){
				tblsrc = tblsrc.concat('<caption style="background-color:rgb(180,180,180)">Ski Trail Grooming Status</caption>');
			} else {
				tblsrc = tblsrc.concat('<caption style="background-color:rgb(180,180,180)">Bike Trail Grooming< Status/caption>');
			}
			tblsrc = tblsrc.concat('<tr style="background-color:rgb(250,250,250);border: 1px solid black;">\
			<th style="text-align: left;border: 1px solid black;">Trail Name</th> \
			<th style="text-align: left;border: 1px solid black;">Time</th>;');
			if (trType==='ski'){
				tblsrc = tblsrc.concat('<th style="text-align: left;border: 1px solid black;">ClscSet</th>');
			}
			tblsrc = tblsrc.concat('<th style="text-align: left;border: 1px solid black;">Mach</th> \
			<th style="text-align: left;border: 1px solid black;">Condition</th> \
			<th style="text-align: left;border: 1px solid black;">Comment</th> \
			<th style="text-align: left;border: 1px solid black;">Groomer</th> \
		</tr>');
			} else {
				tblsrc = '<table style="width:60%;margin-left:auto;margin-right:auto;' + fntszsimple;
				tblsrc = tblsrc.concat(';overflow-y:auto;background-color:rgb(250,250,250);\
		border:1px solid black;border-collapse:collapse;">');
			if (trType==='ski'){
				tblsrc = tblsrc.concat('<caption style="background-color:rgb(180,180,180)">Ski Trail Grooming Status</caption>');
			} else {
				tblsrc = tblsrc.concat('<caption style="background-color:rgb(180,180,180)">Bike Trail Grooming Status</caption>');
			}

			tblsrc = tblsrc.concat('<tr style="background-color:rgb(250,250,250);border: 1px solid black;border-collapse: collapse;"> \
			<th style="text-align: left">Trail Name</th> \
			<th style="text-align: left">Time</th>');
			if (trType==='ski'){
				tblsrc = tblsrc.concat('<th style="text-align: left;border: 1px solid black;">ClscSet</th>');
			}
			tblsrc = tblsrc.concat('</tr>');
			}
		} catch (err) {
			console.log("buildGrmRptTable caught error " + err)
		}
		let rwHtml = ""
		let rgnHtml = ""
		if (srtRws.length < 1) {
			let txt="No Data!";
			if (this.reportType>0)
				txt=txt.concat(" Try different region or longer time period")
			tblsrc = tblsrc.concat('<tr style="background-color:rgb(180,0,0);border: 1px solid black;border-collapse: collapse;">\
			<td colspan="4">'+txt+'</td>\
		</tr>');
			tblsrc = tblsrc.concat('</table>');

		} else {
			for (var i = 0; i < srtRws.length; i++) {
				rgnHtml = ""
				rwHtml = ""
				if ((this.reportType > 0) && ((this.region.toLowerCase() === "all") && (lstRgn !== srtRws[i]["region"]))) {
					// console.log("buildGrmRptTable found region "+srtRws[i]["region"]);
					rgnHtml = '<tr style="text-align:center;background-color:rgb(255,255,255)">'
					rgnHtml = rwHtml.concat('<td colspan="3" style="text-align:center;background-color:rgb(255,255,255)">' + srtRws[i]["region"] + '</td>')
				} else {
					// console.log("buildGrmRptTable bypass region "+srtRws[i]["region"]+"; lstRgn "+lstRgn+"; item # "+i);
				}
				// console.log("buildGrmRptTable trail: " + srtRws[i]["trailName"] + "(" + thisTrail + ")" + "; this.reportType: " + this.reportType + "; priority: " + srtRws[i]["priority"] + "; mach: " + srtRws[i]["groomMachNbr"]);
				if (((this.reportType === 0) && (srtRws[i]["priority"] === 1) && (thisTrail !== srtRws[i]["trailName"])) ||
					(this.reportType === 2) ||
					((this.reportType === 1) && (thisTrail !== srtRws[i]["trailName"]))) {
					var rowClr='background-color:'+this.getDateColor(srtRws[i]["fullDate"])
					console.log('buildGrmRptTable found rowClr '+rowClr);
					rwHtml = rwHtml.concat('<tr style="' + rowClr + ';border: 1px solid black;border-collapse: collapse;">')
					rwHtml = rwHtml.concat('<td style="border: thin solid black">' + srtRws[i]["trailName"] + '</td>')
					rwHtml = rwHtml.concat('<td style="border: thin solid black">' + srtRws[i]["groomTime"] + '</td>')
					if (trType==='ski'){
						if (srtRws[i]["classicSet"]===true)
							rwHtml = rwHtml.concat('<td style="border: thin solid black">' + "Yes" + '</td>')
						else
							rwHtml = rwHtml.concat('<td style="border: thin solid black">' + "No" + '</td>')
					}
					if (this.reportType === 2) {
						rwHtml = rwHtml.concat('<td style="border: thin solid black">' + srtRws[i]["groomMach"] + '</td>')
						rwHtml = rwHtml.concat('<td style="border: thin solid black">' + srtRws[i]["trailCondx"] + '</td>')
						rwHtml = rwHtml.concat('<td style="border: thin solid black">' + srtRws[i]["grmrCmnt"] + '</td>')
    					rwHtml = rwHtml.concat('<td style="border: thin solid black">' + srtRws[i]["grmr"] + '</td>')
					}
					if (rgnHtml.length > 5) {
						tblsrc = tblsrc.concat(rgnHtml + '</tr>')
					}
					tblsrc = tblsrc.concat(rwHtml + '</tr>')
					// console.log("buildGrmRptTable fullrow "+rwHtml)
				}
				thisTrail = srtRws[i]["trailName"];
				lstRgn = srtRws[i]["region"];
			}
			tblsrc = tblsrc.concat('</table>');
		}
		return tblsrc;
	}

	async fillGrmRptTbl(trType) {
		if (this.region.length < 2)
			return;
		let rtrnHtml = "";
		this._getWinInfo();
		try {
			let newRws = await this._skiGroomingTableQuery(trType);
			console.log("fillgrmRptTable for trType "+trType+"; newRws " + newRws.length)
			if (newRws.length < 1) {
				console.log("fillgrmRptTable exiting with empty newRws")
				return this.buildGrmRptTable(trType,[]);
			}
			var sortRows = newRws.sort(function (a, b) {
				var srtA = a.viewSort;
				var srtB = b.viewSort;
				var rgnA = a.region.toUpperCase();
				var rgnB = b.region.toUpperCase();
				var nameA = a.trailName.toUpperCase(); // ignore upper and lowercase
				var nameB = b.trailName.toUpperCase(); // ignore upper and lowercase
				var dateA = a.fullDate;
				var dateB = b.fullDate;
				if (srtA < srtB) {
					return -1;
				}
				if (srtA > srtB) {
					return 1;
				}
				if (rgnA < rgnB) {
					return -1;
				}
				if (rgnA > rgnB) {
					return 1;
				}
				// viewSort and region must be equal
				if (dateA < dateB) {
					return 1;
				}
				if (dateA > dateB) {
					return -1;
				}
				return 0;
			});
			if (sortRows.length > -1) {
				rtrnHtml = this.buildGrmRptTable(trType,sortRows);
			}

		} catch (err) {
			console.log("fillgrmRptTable caught error " + err)
		}
		return rtrnHtml;
	}
}