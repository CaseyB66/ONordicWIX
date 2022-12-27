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

const colorGreen = "rgb(50,200,25)";
const colorRed = "rgb(250,80,72)";
const colorYellow = "rgb(155,155,5)";

export function groomReportTable (rgn = "South", hrs = 24, rprtTyp = 0) {
	// rprtType can be 0 for "Brief", 1 for "All Trails", 3 for "Full"

	let hours = Number(hrs);
	let region = rgn;
	let tdy = new Date();
	let lstRprtDate = new Date();
	let reportType = rprtTyp;
	let _winWid = 0;
	let _winHt = 0;
	var today = new Date();
	var time_ms = today.getTime();
	let fltrDate = new Date(time_ms - hours * 60 * 60000);
	let bSmallTable = false;
	let dateColorDefn = [{hrs:16,color:colorGreen},
		{hrs:24,color:colorYellow},
		{hrs:24*365,color:colorRed}];

	this.setSmallTable = (bval) => {
		bSmallTable = bval;
	}

	this._getWinInfo =  async () => {
		let wininfo = await wixWindow.getBoundingRect();
		_winHt = wininfo.window.height;
		_winWid = wininfo.window.width;
	}

	this.getTimeString = (thedate) => {
		var dateStrOpts = {
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		};
		if (thedate.getFullYear()<2018){
			return "N/A"
		} else {
			return thedate.toLocaleDateString("en-US", dateStrOpts);
		}
	}

	this.insertSkiGroomerData = async (toInsert) => {
		var rtrn = {groomDataRef:"", trailRef:"", groomerRef:"",trailName:"",groomDate:null}
		let newItmRef = "";
		try {
			console.log("insertSkiGroomerData calling insert, render env = "+wixWindow.rendering.env)
			let results = await wixData.insert("skiGroomingTable", toInsert);
			if (results !== undefined) {
				let item = results;
				console.log("insertSkiGroomerData: for "+item.trailRef['title']+"; result " + item)
				rtrn.groomDataRef = item._id;
				rtrn.trailRef = toInsert.trailRef;
				rtrn.groomerRef =  toInsert.groomerRef;
				rtrn.groomDate = toInsert.groomDate;
				// let tblrws = $w('#trailsDoneTbl').rows;
				// tblrws.push(item);
				// $w('#trailsDoneTbl').rows=tblrws;
			}
		} catch (err) {
			console.log("submitBtn_click caught submit error " + err)
		}
		return rtrn;
	}

	this.updateSkiGroomerData = async (toInsert) => {
		var rtrn = {groomDataRef:"", trailRef:"", groomerRef:"",trailName:"",groomDate:null}
		let newItmRef = "";
		try {
			console.log("updateSkiGroomerData calling update, render env = "+wixWindow.rendering.env)
			let results = await wixData.update("skiGroomingTable", toInsert);
			if (results !== undefined) {
				let item = results;
				console.log("updateSkiGroomerData: for "+item.trailRef['title']+"; result " + item)
				rtrn.groomDataRef = item._id;
				rtrn.trailRef = toInsert.trailRef;
				rtrn.groomerRef =  toInsert.groomerRef;
				rtrn.groomDate = toInsert.groomDate;
				// let tblrws = $w('#trailsDoneTbl').rows;
				// tblrws.push(item);
				// $w('#trailsDoneTbl').rows=tblrws;
			}
		} catch (err) {
			console.log("submitBtn_click caught submit error " + err)
		}
		return rtrn;
	}

	this._skiGroomingTableQueryByEditDate = async (trType) => {
		let mchfltr = '1';
		let trlDnItems = [];
		if (reportType > 1)
			mchfltr = '0'

		console.log("_skiGroomingTableQueryByEditDate starting...")
		try {
			const results = await wixData.query("skiGroomingTable")
				.include("trailRef")
				.include("groomerRef")
				.limit(500)
				.ge("editDate", fltrDate)
				.ge("groomMachine", mchfltr)
				.find();
			let qryItems = results.items;
			if (undefined === trlDnItems){
				console.log("_skiGroomingTableQueryByEditDate found NO results!")
				lstRprtDate=new Date();
				return trlDnItems;
			}
			else{
				for (var j=0;j<qryItems.length;j++){
					if (qryItems[j]['trailRef']['trailType']===trType){
						trlDnItems.push(qryItems[j])
					}
				}
				console.log("_skiGroomingTableQueryByEditDate from "+qryItems.length + " qryItems, retured " + trlDnItems.length)
			}
		} catch (err) {
			lstRprtDate=new Date();
			console.log("_skiGroomingTableQueryByEditDate caught error " + err)
			return trlDnItems;
		}
    return trlDnItems;
	}

	this._skiGroomingTableQueryByGroomDate = async (trType) => {
		let mchfltr = '1';
		let trlDnItems = [];
		if (reportType > 1)
			mchfltr = '0'

		console.log("_skiGroomingTableQueryByGroomDate starting...")
		try {
			const results = await wixData.query("skiGroomingTable")
				.include("trailRef")
				.include("groomerRef")
				.limit(500)
				.ge("groomDate", fltrDate)
				.ge("groomMachine", mchfltr)
				.find();
			let qryItems = results.items;
			if (undefined === trlDnItems){
				console.log("_skiGroomingTableQueryByGroomDate found NO results!")
				lstRprtDate=new Date();
				return trlDnItems;
			}
			else{
				for (var j=0;j<qryItems.length;j++){
					if (qryItems[j]['trailRef']['trailType']===trType){
						trlDnItems.push(qryItems[j])
					}
				}
				console.log("_skiGroomingTableQueryByGroomDate from "+qryItems.length + " qryItems, retured " + trlDnItems.length)
			}
		} catch (err) {
			lstRprtDate=new Date();
			console.log("_skiGroomingTableQueryByGroomDate caught error " + err)
			return trlDnItems;
		}
    return trlDnItems;
	}

	this._skiGroomingTableQueryDsply = async (trType) => {
		console.log("_skiGroomingTableQueryDsply starting...")
        var trlDnItems = await this._skiGroomingTableQueryByGroomDate(trType);
		if ((trlDnItems === undefined) || (trlDnItems.length < 1)) {
			lstRprtDate=new Date();
			console.log("_skiGroomingTableQueryDsply exiting with no results from query")
			return [];
		}
		let timStr = ""
		let newRws = []
		lstRprtDate.setTime(100);
		
		for (var j = 0; j < trlDnItems.length; j++) {
			if (trlDnItems[j] === undefined)
				continue;
			if ( trlDnItems[j]["trailRef"]["reportPriority"]<0)
				continue;
			if ((trlDnItems[j]["trailRef"]["trailType"]===trType) && 
			    ((region.toLowerCase() === "all") || (region === trlDnItems[j]["trailRef"]["trailRegion"]))) {
			  if (trlDnItems[j]["groomDate"].getTime()>lstRprtDate.getTime())
			    lstRprtDate.setTime(trlDnItems[j]["groomDate"].getTime());
				let machtxt = "None";
				if (trlDnItems[j]["groomMachine"] === '1') {
					if (trType==="ski")
						machtxt = "Cat";
					else
						machtxt = "SnowMobile"
				}
				if (trlDnItems[j]["groomMachine"] === '2') {
					if (trType==="ski")
						machtxt = "Sled";
					else
						machtxt = "Tires"
				}
				if (trlDnItems[j]["groomMachine"] === '3') {
					if (trType==="ski")
						machtxt = "Cat&Sled";
					else
						machtxt = "Drag"
				}
				if (trlDnItems[j]["groomMachine"] === '4') {
					if (trType==="ski")
						machtxt = "N/A";
					else
						machtxt = "Tires&Drag"
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
		if (newRws.length<1)
		  lstRprtDate = new Date();
		console.log("_skiGroomingTableQueryDsply exiting with lstRprtDate "+lstRprtDate.toLocaleDateString())		  
    return newRws;
	}

	this.getSkiDifficultyObject = (dffclty) => {
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

	this.getDateColor = (rowDate) => {
		var lcltoday = new Date();
		var lcl_ms = lcltoday.getTime();
		var tdiff = lcl_ms - rowDate.getTime();
		return this.getDateColorByHours(tdiff/3600000);
	}

	this.getDateColorByHours = (gethrs) => {
		let rtrn = {color:dateColorDefn[dateColorDefn.length-1].color,
			valid:false};
		let ii=0;
		try {
			for (ii=0;ii<dateColorDefn.length;ii++){
				if (gethrs<dateColorDefn[ii].hrs){
					rtrn.color = dateColorDefn[ii].color;
					if (ii<dateColorDefn.length)
						rtrn.valid=true;
					break;
				}
			}
		} catch (err){
			console.log('getDateColorByHours caught err '+err);
		}
		return rtrn;
	}

	this.getDateColorDefn = () => {
		return dateColorDefn;
	}

	this._skiGroomCommentHTML = async (trType) => {
		var cmnthtml="";
		var dateStrOpts = {
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		};
		let mxHrs=(dateColorDefn[0].hrs+dateColorDefn[1].hrs)/2

		try {
			var tblCmnt=await this._skiGroomCommentTableQuery(trType);
			if (tblCmnt.length>0){
				let tdiff=Math.abs(lstRprtDate.getTime() - tblCmnt[0]["groomDate"].getTime())
				console.log("_skiGroomCommentHTML found lstRprtDate: "+lstRprtDate.toString()+" with groomDate "+tblCmnt[0]["groomDate"].toString())
				console.log("_skiGroomCommentHTML found query result: "+tblCmnt.length+" with tdiff "+tdiff+"; cutoff "+mxHrs*3600000)
				// 19176724
				if (tdiff < mxHrs*3600000) {   // 6 hours = 6 x 3600
					let timStr = tblCmnt[0]["groomDate"].toLocaleDateString("en-US", dateStrOpts);
					console.log("_skiGroomCommentHTML found comment: " + tblCmnt[0].title)
					let cmntlgth = tblCmnt[0]["title"].length;
					if (cmntlgth<108){
						cmnthtml = '<p style="background-color:rgb(255,255,255);color:rgb(0,0,0);border: 2px solid green;\
						border-radius: 8px;padding: 10px;font-size:16px">';
					} else {
						cmnthtml = '<p style="background-color:rgb(255,255,255);color:rgb(0,0,0);border: 2px solid green;\
						border-radius: 8px;padding: 10px;font-size:12px">';
					}
					cmnthtml = cmnthtml.concat(timStr);
					cmnthtml = cmnthtml.concat("<b> ("+trType.toUpperCase()+"): </b>")
					cmnthtml = cmnthtml.concat(tblCmnt[0]["title"])
					cmnthtml = cmnthtml.concat("</p>")
				} else {
					cmnthtml = ""
				}
			}

		} catch (err) {
			console.log("_skiGroomCommentHTML caught error getting general comment" + err)
		}
		return cmnthtml;
	}

	this._skiGroomCommentTableQuery = async (trType) => {
		try {
			console.log("skiGroomCommentTableQuery fltrDate "+fltrDate.toDateString());
			const results = await wixData.query("skiGroomCommentTable")
				.include("groomerRef")
				.limit(100)
				.eq("trailType",trType)
				.ge("groomDate", fltrDate)
				.find();
			var cmntItems = results.items;
			console.log("skiGroomCommentTableQuery sortng "+cmntItems.length);
			var tblCmnt = cmntItems.sort(function (a, b) {
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
			console.log("skiGroomCommentTableQuery caught error getting general comment" + err)
			throw err;
		}
		return tblCmnt;
	}

	this.buildGrmRptTable = (trType,srtRws) => {
		let thisTrail = "";
		console.log("buildGrmRptTable reportType " + reportType);

		let lstRgn = "";
		let fntszfull = "width:100%;font-size:12px";
		let fntszsimple = "width:60%;font-size:16px";
		if (bSmallTable){
			fntszsimple = "width:100%;font-size:13px";
		}
		this._getWinInfo();
		if (wixWindow.formFactor === "Mobile" || wixWindow.formFactor === "Tablet") {
			if (_winWid > _winHt) {
				fntszfull = "width:100%;font-size:5px";
				fntszsimple = "width:100%;font-size:9px";
			} else {
				fntszfull = "width:100%;font-size:8px";
				fntszsimple = "width:100%;font-size:12px";
			}
		}
		let tblsrc = "";
		try {
			if (reportType > 1) {
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
			<th style="text-align: left;border: 1px solid black;">Time last Groom</th>;');
			if (trType==='ski'){
				tblsrc = tblsrc.concat('<th style="text-align: left;border: 1px solid black;">Clsc Reset</th>');
			}
			tblsrc = tblsrc.concat('<th style="text-align: left;border: 1px solid black;">Machine</th>');
			// tblsrc = tblsrc.concat('<th style="text-align: left;border: 1px solid black;">Mach</th> \
			tblsrc = tblsrc.concat('<th style="text-align: left;border: 1px solid black;">Condition</th> \
			<th style="text-align: left;border: 1px solid black;">Comment</th> \
			<th style="text-align: left;border: 1px solid black;">Groomer</th> </tr>');
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
			<th style="text-align: left">Time last Groom</th>');
			if (trType==='ski'){
				tblsrc = tblsrc.concat('<th style="text-align: left;border: 1px solid black;">Clsc Reset</th>');
			} else {
				tblsrc = tblsrc.concat('<th style="text-align: left;border: 1px solid black;">Machine</th>');
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
			if (reportType>0)
				txt=txt.concat(" Try different region or longer time period")
			tblsrc = tblsrc.concat('<tr style="background-color:rgb(180,0,0);border: 1px solid black;border-collapse: collapse;">\
			<td colspan="4">'+txt+'</td>\
		</tr>');
			tblsrc = tblsrc.concat('</table>');

		} else {
			for (var i = 0; i < srtRws.length; i++) {
				rgnHtml = ""
				rwHtml = ""
				if ((reportType > 0) && ((region.toLowerCase() === "all") && (lstRgn !== srtRws[i]["region"]))) {
					// console.log("buildGrmRptTable found region "+srtRws[i]["region"]);
					rgnHtml = '<tr style="text-align:center;background-color:rgb(255,255,255)">'
					rgnHtml = rwHtml.concat('<td colspan="3" style="text-align:center;background-color:rgb(255,255,255)">' + srtRws[i]["region"] + '</td>')
				} else {
					// console.log("buildGrmRptTable bypass region "+srtRws[i]["region"]+"; lstRgn "+lstRgn+"; item # "+i);
				}
				// console.log("buildGrmRptTable trail: " + srtRws[i]["trailName"] + "(" + thisTrail + ")" + "; reportType: " + reportType + "; priority: " + srtRws[i]["priority"] + "; mach: " + srtRws[i]["groomMachNbr"]);
				if (((reportType === 0) && (srtRws[i]["priority"] === 1) && (thisTrail !== srtRws[i]["trailName"])) ||
					(reportType > 1) ||
					((reportType === 1) && (thisTrail !== srtRws[i]["trailName"]))) {
					var rowClr=this.getDateColor(srtRws[i]["fullDate"]);
					rwHtml = rwHtml.concat('<tr style="background-color:' + rowClr.color + ';border: 1px solid black;border-collapse: collapse;">')
					rwHtml = rwHtml.concat('<td style="border: thin solid black">' + srtRws[i]["trailName"] + '</td>')
					rwHtml = rwHtml.concat('<td style="border: thin solid black">' + srtRws[i]["groomTime"] + '</td>')
					if (trType==='ski'){
						if ((srtRws[i]["classicSet"]===true) && (rowClr.valid===true))
							rwHtml = rwHtml.concat('<td style="border: thin solid black">' + "Yes" + '</td>')
						else
							rwHtml = rwHtml.concat('<td style="border: thin solid black">' + "No" + '</td>')
					}
					if ((trType==='bike') || ((trType==='ski') && (reportType>1))){
						rwHtml = rwHtml.concat('<td style="border: thin solid black">' + srtRws[i]["groomMach"] + '</td>')
					}
					if (reportType > 1) {
						// rwHtml = rwHtml.concat('<td style="border: thin solid black">' + srtRws[i]["groomMach"] + '</td>')
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

	this.fillGrmRptTbl = async (trType) => {
		if (region.length < 2)
			return;
		let rtrnHtml = "";
		this._getWinInfo();
		try {
			let newRws = await this._skiGroomingTableQueryDsply(trType);
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