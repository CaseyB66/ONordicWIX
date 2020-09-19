import wixWindow from 'wix-window';
import wixData from 'wix-data';
// Filename: public/GroomReport.js 
//
// Code written in public files is shared by your site's
// Backend, page code, and site code environments.
// Use public files to hold utility functions that can 
// be called from multiple locations in your site's code.

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

	}

	async _getWinInfo() {
		let wininfo = await wixWindow.getBoundingRect();
		this._winHt = wininfo.window.height;
		this._winWid = wininfo.window.width;
	}

	async _skiGroomingTableQuery() {
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
			if (undefined === trlDnItems)
				console.log("_skiGroomingTableQuery found NO results!")
			else
				console.log("_skiGroomingTableQuery retured " + trlDnItems.length)
			return trlDnItems;
		} catch (err) {
			console.log("_skiGroomingTableQuery caught error " + err)
		}
        return trlDnItems;
	}

	async _skiGroomCommentTableQuery() {
		try {
			const results = await wixData.query("skiGroomCommentTable")
				.include("groomerRef")
				.limit(100)
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

	buildGrmRptTable(srtRws) {
		let thisTrail = "";
		console.log("buildGrmRptTable this.reportType " + this.reportType);

		let lstRgn = "";
		let fntszfull = "width:100%;font-size:12px";
		let fntszsimple = "width:60%;font-size:18px";
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
		var today = new Date();
		var time_ms = today.getTime();
		let tblsrc = "";
		if (this.reportType === 2) {
			tblsrc = '<table style="' + fntszfull;
			tblsrc = tblsrc.concat(';overflow-y:auto;background-color:rgb(250,250,250);\
	border: 1px solid black;border-collapse: collapse;">\
  	<tr style="background-color:rgb(250,250,250);border: 1px solid black;border-collapse: collapse;">\
		<th style="text-align: left">Trail Name</th> \
		<th style="text-align: left">Time</th> \
		<th style="text-align: left">ClscSet</th> \
		<th style="text-align: left">Mach</th> \
		<th style="text-align: left">Condition</th> \
		<th style="text-align: left">Comment</th> \
		<th style="text-align: left">Groomer</th> \
  	</tr>');
		} else {
			tblsrc = '<table style="width:60%;margin-left:auto;margin-right:auto;' + fntszsimple;
			tblsrc = tblsrc.concat(';overflow-y:auto;background-color:rgb(250,250,250);\
	border:1px solid black;border-collapse:collapse;"> \
  	<tr style="background-color:rgb(250,250,250);border: 1px solid black;border-collapse: collapse;"> \
		<th style="text-align: left">Trail Name</th> \
		<th style="text-align: left">Time</th> \
		<th style="text-align: left">ClscSet</th> \
  	</tr>');
		}
		let rwHtml = ""
		let rgnHtml = ""
		let colorRed = "background-color:rgb(250,0,0)"
		let colorGreen = "background-color:rgb(0,250,0)"
		let colorYellow = "background-color:rgb(200,200,0)"
		if (srtRws.length < 1) {
			tblsrc = tblsrc.concat('<tr style="' + colorRed + ';border: 1px solid black;border-collapse: collapse;">\
			<td colspan="4">No Data!! Try different region or longer duration</td>\
		</tr>');
			tblsrc = tblsrc.concat('</table>');

		} else {
			for (var i = 0; i < srtRws.length; i++) {
				var tdiff = time_ms - srtRws[i]["fullDate"].getTime();
				rgnHtml = ""
				rwHtml = ""
				if ((this.reportType > 0) && ((this.region === "ALL") && (lstRgn !== srtRws[i]["region"]))) {
					rgnHtml = '<tr style="text-align:center;background-color:rgb(255,255,255)">'
					rgnHtml = rwHtml.concat('<td colspan="3" style="text-align:center;background-color:rgb(255,255,255)">' + srtRws[i]["region"] + '</td>')
				}
				// console.log("buildGrmRptTable trail: " + srtRws[i]["trailName"] + "(" + thisTrail + ")" + "; this.reportType: " + this.reportType + "; priority: " + srtRws[i]["priority"] + "; mach: " + srtRws[i]["groomMachNbr"]);
				if (((this.reportType === 0) && (srtRws[i]["priority"] === 1) && (thisTrail !== srtRws[i]["trailName"])) ||
					(this.reportType === 2) ||
					((this.reportType === 1) && (thisTrail !== srtRws[i]["trailName"]))) {
					// console.log("buildGrmRptTable OK: " + srtRws[i]["trailName"]);
					if (tdiff < 15 * 3600000) {
						rwHtml = rwHtml.concat('<tr style="' + colorGreen + ';border: 1px solid black;border-collapse: collapse;">')
					} else if (tdiff < 24 * 3600000) {
						rwHtml = rwHtml.concat('<tr style="' + colorYellow + ';border: 1px solid black;border-collapse: collapse;">')
					} else {
						rwHtml = rwHtml.concat('<tr style="' + colorRed + ';border: 1px solid black;border-collapse: collapse;">')
					}
					rwHtml = rwHtml.concat('<td>' + srtRws[i]["trailName"] + '</td>')
					rwHtml = rwHtml.concat('<td>' + srtRws[i]["groomTime"] + '</td>')
					rwHtml = rwHtml.concat('<td>' + srtRws[i]["classicSet"] + '</td>')
					if (this.reportType === 2) {
						rwHtml = rwHtml.concat('<td>' + srtRws[i]["groomMach"] + '</td>')
						rwHtml = rwHtml.concat('<td>' + srtRws[i]["trailCondx"] + '</td>')
						rwHtml = rwHtml.concat('<td>' + srtRws[i]["grmrCmnt"] + '</td>')
    					rwHtml = rwHtml.concat('<td>' + srtRws[i]["grmr"] + '</td>')
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

	async fillGrmRptTbl() {
		if (this.region.length < 2)
			return;
		var dateStrOpts = {
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		};
		let rtrnHtml = "";
		this._getWinInfo();
		try {
			let trlDnItems = await this._skiGroomingTableQuery();
			// this._skiGroomingTableQuery().then(rtrnItms => {
			//     trlDnItems = rtrnItms;
			// });
			if ((trlDnItems === undefined) || (trlDnItems.length < 1)) {
				console.log("fillgrmRptTable exiting with no results from query")
				return rtrnHtml;
			}
			console.log("fillgrmRptTable results from query: " + trlDnItems.length);
			let timStr = ""
			let newRws = []
			console.log("fillGrmRptTbl items lgth " + trlDnItems.length + "; first item: " + trlDnItems[1]["trailRef"]["trailRegion"])
			for (var j = 0; j < trlDnItems.length; j++) {
				if (trlDnItems[j] === undefined)
					continue;
				if ((this.region.toLowerCase() === "all") || (this.region === trlDnItems[j]["trailRef"]["trailRegion"])) {
					let machtxt = "None";
					if (trlDnItems[j]["groomMachine"] === '1') {
						machtxt = "Cat"
					}
					if (trlDnItems[j]["groomMachine"] === '3') {
						machtxt = "Cat&Sled"
					}
					if (trlDnItems[j]["groomMachine"] === '2') {
						machtxt = "Sled"
					}
					timStr = trlDnItems[j]["groomDate"].toLocaleDateString("en-US", dateStrOpts);
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
						'viewSort': trlDnItems[j]["trailRef"]['viewSort']
					})
				}
			}
			console.log("fillgrmRptTable newRws " + newRws.length)
			if (newRws.length < 1) {
				console.log("fillgrmRptTable exiting with empty newRws")
				return;
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
				rtrnHtml = this.buildGrmRptTable(sortRows);
			}

		} catch (err) {
			console.log("fillgrmRptTable caught error " + err)
		}
		return rtrnHtml;
	}
}