// For full API documentation, including code examples, visit https://wix.to/94BuAAs
import wixData from 'wix-data';
import wixSearch from 'wix-search';

const __nrEntryRows = 12;

var getKeys = function(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}

let _trailCondxTbleNdx = -1;
let _trailDataSubmit = 1; // 0: new trail, not submitted; 1: old trail, not submitted; 3: submitted OK
let _saveTime=""
let _groomerList = [];
let _trailList = [];
// Data covered will be set to -1 for new trail picked.
// Then we add one for every chunk of data filled in.
// For submit button to be active, it must have value 3 or greater.
let _currTrailName = "";
// Date, Time, Condx,Classic,Mach
let _elmntsChng = [
        {
            key: "Date",
			isSet: false,
        }, {
            key: "Time",
			isSet: false,
        }, {
            key: "Condx",
			isSet: false,
        }, {
            key: "Classic",
			isSet: false,
        },{
            key: "Mach",
			isSet: false,
        }
    ];

function _elmntsCheckFunction(value, index, array) {
	// console.log("_elmntsCheck: key "+array[index].key+"; isSet "+array[index].isSet);
	return array[index].isSet===true; 
}

function _setElmntsChng(thekey,newSet){
	for (let i = 0; i < _elmntsChng.length; i++) {
		if (_elmntsChng[i].key === thekey) {
			_elmntsChng[i].isSet = newSet;
			break;
		}
	}
}

function _getElmntsChng(thekey){
	for (let i = 0; i < _elmntsChng.length; i++) {
		if (_elmntsChng[i].key === thekey) {
			console.log("_getElmnt "+ _elmntsChng[i].key + "; " + _elmntsChng[i].isSet);
			return _elmntsChng[i].isSet;
		}
	}
	return false;
}

$w.onReady(function () {
	// TODO: write your page related code here...
	fillTrailRgnDrpDn();
	fillTrailConditionDropDn();
	fillGroomersDrpDn();
	$w('#removeTrailCondxBtn').disable();
	$w('#trailCondxTbl').rows = []
	$w('#trailsDoneTbl').rows = []
	var today = new Date();
	$w('#trailGroomDate').value = today;
	let timestr="";
	if (today.getHours()<10){
		timestr="0"+today.getHours();
	}
	else {
		timestr = today.getHours();
	}
	if (today.getMinutes()<10){
		timestr +=":0"+today.getMinutes();
	}
	else {
		timestr += ":"+today.getMinutes();
	}
	$w('#trailGroomTime').value = timestr;
	// today.setTime(time_ms+24*3600*1000);
	var lpday = new Date();
	var time_ms = lpday.getTime();
	let badDates = [lpday];
	for (var i = 1; i < 30; i++) {
		lpday.setTime(time_ms + i * 24 * 3600 * 1000);
		badDates.push(new Date(lpday.getTime()));
	}
	$w("#trailGroomDate").disabledDates = badDates;

	_saveTime = $w('#trailGroomTime').value;
	if (_groomerList.length > 0) {
		console.log("onReady first groomer " + _groomerList[0].title)
	}
	$w('#trailRgnDrpDn').disable();
	$w('#groomerPwdEdit').disable();
	clearEntryFields();

	// $w('#skiGroomDataset2').
	let trlsDnCols = $w('#trailsDoneTbl').columns;
	for (i = 0; i < trlsDnCols.length; i++) {
		if (trlsDnCols[i].dataPath === "trailDone") {
			trlsDnCols[i].width = 150;
		} else {
			trlsDnCols[i].visible = false;
			trlsDnCols[i].width = 1;
		}
		console.log("onReady trailsDone cols " + i +
			" id: " + trlsDnCols[i].id +
			"; label: " + trlsDnCols[i].label +
			"; path " + trlsDnCols[i].dataPath +
			"; linkPath: " + trlsDnCols[i].linkPath +
			"; vis " + trlsDnCols[i].visible)
	}
	$w('#trailsDoneTbl').columns = trlsDnCols;
	let logerrhtml = '<div style="font-size:18px;background-color:rgb(230,200,200);color:rgb(0,0,0);border: 2px solid red;\
  border-radius: 8px;padding: 10px;">';	
	$w('#loginErrorText').html=logerrhtml.concat('Incorrect password, try again!</div>');
	$w('#loginErrorText').hide();
});

function hideTrailLabels(){
	for (var i=0;i<__nrEntryRows;i++){
		let tmpStr=('#trGrp'+(i+1));
		// console.log("hideTrailLabels "+tmpStr)
		$w(tmpStr).hide();
	}
}

function setTrailLabel(trStr,trNbr){
	let tmpStr = ('#trGrp'+trNbr);
	console.log("setTrailLabel "+trStr+", trNbr: "+trNbr+", eval "+tmpStr)
	$w(tmpStr).show();
	tmpStr = ('#trailLabel'+trNbr);
	let trlOpts=$w(tmpStr).options;
	trlOpts[0].label=trStr;
	$w(tmpStr).options=trlOpts;
	$w(tmpStr).selectedIndices=[0];

}

function enableEntryFields(_boolVal){
	if (_boolVal===true){
		$w('#trailGroomDate').enable();
		$w('#trailGroomTime').enable();
		$w('#trailConditionDrpDn').enable();
		$w('#removeTrailCondxBtn').enable();
		$w('#classicRadio1').enable();
		$w('#submitBtn').enable();
		$w('#grmMachRadio1').enable();
		$w('#commentEdit').enable();
	}
	else {
		$w('#trailGroomDate').disable();
		$w('#trailGroomTime').disable();
		$w('#trailConditionDrpDn').disable();
		$w('#removeTrailCondxBtn').disable();
		$w('#classicRadio1').disable();
		$w('#submitBtn').disable();
		$w('#grmMachRadio1').disable();
		$w('#commentEdit').disable();
	}
}

function clearEntryFields(){
	for (var i=0;i<_elmntsChng.length;i++){
		_elmntsChng[i].isSet = false;
	}
	_setElmntsChng("Date", true);
	_setElmntsChng("Time", true);
	// Date, Time, Condx,Classic,Mach
	if ($w('#trailCondxTbl').rows.length>0){
		_setElmntsChng("Condx", true);
	}
	_setElmntsChng("Mach", true);
	if ($w('#grmMachRadio1').value != '0'){
		_setElmntsChng("Mach", true);
	}
	_setElmntsChng("Classic", true);
	_trailDataSubmit = 0;
}

export function groomersDrpDn_change(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	var chkPwd="";
	for (var i=0;i<_groomerList.length;i++){
		if (_groomerList[i].title===$w('#groomersDrpDn').value){
			chkPwd = _groomerList[i].passWord;
		}
	}
	console.log('groomerDrpDn value '+$w('#groomersDrpDn').value + ' pwd '+chkPwd)
	$w('#groomerPwdEdit').enable();
	$w("#groomerPwdEdit").inputType = "password";
}

async function fillTrailsDoneTbl(){
	var today = new Date();
	var time_ms = today.getTime();
	let fltrDate = new Date(time_ms-240*60000);
	console.log("fillTrailsDoneTbl doing query... for groomer "+$w('#groomersDrpDn').value);
	try {
		const results = await wixData.query("skiGroomingTable")
		.include("trailRef")
		.include("groomerRef")
		.limit(20)
		.ge("editDate",fltrDate)
		// .contains("groomerRef.title", $w('#groomersDrpDn').value)
		.find();
		var trlDnItems = results.items;
		console.log("fillTrailsDoneTbl trail "+trlDnItems[0]["trailRef"]["title"]+"; groomer "+trlDnItems[0]["groomerRef"]["title"])
		let oldTrails=$w('#trailsDoneTbl').rows;
		$w('#trailsDoneTbl').rows=[];
		let newRws=oldTrails
		let oldfnd=false;
// label: Trail; path trailDone
// path groomerRef
// path editDate

		for (var j=0;j<trlDnItems.length;j++){
			oldfnd=false
			if (trlDnItems[j]["groomerRef"]["title"]===$w('#groomersDrpDn').value){
				if (oldTrails.length>0){
					for (var t=0;t<oldTrails.length;t++){
						if (oldTrails[t].trailDone===trlDnItems[j]["trailRef"]["title"]){
							oldfnd=true;
							break;
						}
					}
				}
				if (!oldfnd){
					newRws.push({"trailDone":trlDnItems[j]["trailRef"]["title"]
					, "groomerRef":trlDnItems[j]["groomerRef"]["title"]
					, "editDate":trlDnItems[j]["editDate"]})
				}
			}
		}
		$w('#trailsDoneTbl').rows=newRws;
	}
	catch (err){
		console.log("fillTrailsDoneTbl caught error "+err)
	}

}

export function groomerPwdEdit_change(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	var chkPwd="";
	for (var i=0;i<_groomerList.length;i++){
		if (_groomerList[i].title===$w('#groomersDrpDn').value){
			chkPwd = _groomerList[i].passWord;
		}
	}
	console.log('groomerPwdEdit value '+$w('#groomersDrpDn').value + ' pwd '+chkPwd)
	if ($w('#groomerPwdEdit').value===chkPwd){
		$w('#trailRgnDrpDn').enable();
		$w('#groomerPwdEdit').hide();

		fillTrailsDoneTbl();
		trailRgnDrpDn_change(null);
		$w('#groomersDrpDn').disable().then( () => {
			$w("#groomersDrpDn").style.backgroundColor = "rgb(255,0,0)";
			$w("#groomersDrpDn").style.color = "rgb(50,50,50)";
		})
		// $w('#groomersDrpDn').disable();
	} else {
		console.log("groomerPwdEdit showing login error")
		$w('#loginErrorText').show();
	}
}

async function fillGroomersDrpDn(){
	try {
		const results = await wixData.query("groomersTable")
		.limit(20)
		.eq("trailType","ski")
		.or(wixData.query("groomersTable").eq("trailType","both"))
		.find();
		_groomerList = results.items;
		if (_groomerList.length<1)
			return;
		var grmOnly = _groomerList.map(item => item.title);
		console.log("fillGroomersDrpDn groomerList length: "+_groomerList.length+
			"; title: "+_groomerList[0]["title"]+"; grmOnly length: "+grmOnly.length+
			"; grmOnly type "+typeof(grmOnly) )
		let grmOpts=buildOptions(grmOnly);
		if (grmOpts.length>0){
			console.log("fillGroomersDrpDn options[1]: "+grmOpts[1].label)
			$w('#groomersDrpDn').options = grmOpts;
		}
		}
	catch (err){
		console.log("fillGroomerDrpDn caught error "+err.message)
	}
}

function fillTrailRgnDrpDn(){
	wixData.query("skiTrailsTable")
	.limit(20)
	.gt("reportPriority",-1)
	.eq("trailType","ski")
	.find()
	.then(results =>{
		const rgns = getUniqueTrailRegions(results.items);
		let rgnsOpts=buildOptions(rgns);
		$w('#trailRgnDrpDn').options = rgnsOpts;
		var ndx=-1;
		for (var i=0;i<rgnsOpts.length;i++){
			if (rgnsOpts[i].label==="South"){
				ndx=i;
				break;
			}

		}
		if (ndx>-1){
			$w('#trailRgnDrpDn').selectedIndex = ndx;
		}
		else
			$w('#trailRgnDrpDn').selectedIndex = 0;
	})
}

function fillTrailConditionDropDn(){
		wixData.query("trailCondxTable")
			.limit(50)
			.eq("trailType","ski")
			.or(wixData.query("trailCondxTable").eq("trailType","both"))
			.ascending("condxSort")
			.find()
			.then(results => {
				const uniqueTitles = getUniqueTrailCondx(results.items);
				let condxOpts = buildOptions(uniqueTitles);
				$w('#trailConditionDrpDn').options = condxOpts;
				$w('#trailConditionDrpDn').selectedIndex=0;
				trailConditionDrpDn_change(null)
			});
}

async function fillTrailNameDrpDn(rgn) {
	// Run a query that returns all the items in the collection
	let nameOpts = [];
	if (rgn === "All") {
		console.log("fillTrailNameDrpDn",rgn);
		try {
			const results = await wixData.query("skiTrailsTable")
				.limit(100)
				.gt("reportPriority",-1)
				.eq("trailType","ski")
				.ascending("viewSort")
				.find();
				const uniqueTitles = getUniqueTrailNames(results.items);
				nameOpts = buildOptions(uniqueTitles);
				// $w('#trailNameDrpDn').options = nameOpts;
				_trailList = results.items;
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
				.gt("reportPriority",-1)
				.eq("trailRegion", rgn)
				.eq("trailType","ski")
				.ascending("viewSort")
				.find();
				// Call the function that creates a list of unique titles
				const uniqueTitles = getUniqueTrailNames(results.items);
				nameOpts = buildOptions(uniqueTitles);
				// $w('#trailNameDrpDn').options = nameOpts;
				_trailList = results.items;
		}
		catch (err) {
			console.log("fillTrailNameDrpDn caught "+err);
		}
	}
	let trllst=""
	for (var i=0;i<_trailList.length;i++){
		trllst+=_trailList[i].title+',';
	}

	// console.log("fillTrailNameDrpDn for region"+rgn+trllst)
	hideTrailLabels();
	for (var i=0;i<_trailList.length;i++){
		setTrailLabel(_trailList[i].title, i+1)
		// console.log("trailNameDrpDn trail item = " + + " currTrail "+_currTrailName)
	}


	let vlu = $w('#trailRgnDrpDn').value.toString();
	let ndx = -1;

	for (let i = 0; i < $w('#trailRgnDrpDn').options.length; i++) {
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
	_currTrailName = "";
	console.log("fillTrailName set trail to "+_currTrailName);
}

// Builds an array from the "Title" field only from each item in 
// the collection and then removes the duplicates
function getUniqueTrailNames(items) {    
	// Use the map method to create the titlesOnly object containing all the titles from the query results
		const titlesOnly = items.map(item => item.title);   
	// Return an array with a list of unique titles
		return [...new Set(titlesOnly)];
}

function getUniqueTrailCondx(items) {    
	// Use the map method to create the titlesOnly object containing all the titles from the query results
		const titlesOnly = items.map(item => item.trailCondxDetail);   
	// Return an array with a list of unique titles
		return [...new Set(titlesOnly)];
}

function getUniqueTrailRegions(items){
	const rgnOnly = items.map(item => item.trailRegion);
	return [...new Set(rgnOnly)];	
}

function buildOptions(uniqueList) {   
	return uniqueList.map(curr => {
		// Use the map method to build the options list in the format {label:uniqueTitle, value:uniqueTitle}
		return {label:curr, value:curr};  
	});
}

function checkSubmit(){
	if (_elmntsChng.every(_elmntsCheckFunction)){
		$w('#submitBtn').enable()
		console.log("checkSubmit returning true");
	}
	else{
		$w('#submitBtn').disable()
		console.log("checkSubmit returning false");
	}
}

// export function trailNameDrpDn_change(event) {
// 	// This function was added from the Properties & Events panel. 
// 	// To learn more, visit http://wix.to/UcBnC-4
// 	// Add your code for this event here: 
// 	$w('#trailEntryBox').show();
// 	_trailDataSubmit = 0;
// 	clearEntryFields();
// 	checkSubmit();
// 	_currTrailName = $w('#trailNameDrpDn').value.toString();
// }

export function trailRgnDrpDn_change(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	let vlu=$w('#trailRgnDrpDn').value.toString();
	fillTrailNameDrpDn(vlu);
	_trailDataSubmit = 0;

	$w('#trailEntryBox').show();
	clearEntryFields();
	checkSubmit();
}

export function trailConditionDrpDn_change(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	let tblrws = $w('#trailCondxTbl').rows;
	let newelt = $w('#trailConditionDrpDn').value;
	if (newelt.length>2)
		tblrws.push({'trail_conditions': newelt});	
	console.log("trailConditionDrpDn_change: newelt: "+newelt+"; newelt type: "+typeof(newelt));
	$w('#trailCondxTbl').rows = tblrws;
	if ($w('#trailCondxTbl').rows.length>0){
		_setElmntsChng("Condx",true);
	}
	else {
		_setElmntsChng("Condx",false);
	}
	_trailDataSubmit = 1;
	// console.log("trailCondxDrpDn setting Condx " + _getElmntsChng("Condx"))
	checkSubmit();
}

export function removeTrailCondxBtn_click(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	if (_trailCondxTbleNdx>-1 && _trailCondxTbleNdx<$w('#trailCondxTbl').rows.length){
		let tblrws = $w('#trailCondxTbl').rows;
		tblrws.splice(_trailCondxTbleNdx,1);
		console.log("removeTrailCondx found Ndx ",_trailCondxTbleNdx,tblrws);
		$w('#trailCondxTbl').rows = tblrws;
		_trailCondxTbleNdx = -1;
	    $w('#removeTrailCondxBtn').disable();
		if ($w('#trailCondxTbl').rows.length>0){
			_setElmntsChng("Condx",true);
		}
		else {
			_setElmntsChng("Condx",false);
		}
		_trailDataSubmit = 1;
	}
	console.log("trailCondxDrpDn setting Condx " + _getElmntsChng("Condx"));
	checkSubmit();
}

export function trailGroomTime_change(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	_setElmntsChng("Time",true);
	_trailDataSubmit = 1;
	checkSubmit();
}

export function trailCondxTbl_rowSelect(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	$w('#removeTrailCondxBtn').enable();
	let rowData = event.rowData;
	_trailCondxTbleNdx = event.rowIndex;   
}

export async function submitBtn_click(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	// ...
	let trailId = "";
	let groomerId = "";
	if (_groomerList.length < 1)
		return;
	for (i = 0; i < _groomerList.length; i++) {
		if (_groomerList[i].title === $w('#groomersDrpDn').value) {
			groomerId = _groomerList[i]._id;
		}
	}

	let trlCndx = $w('#trailCondxTbl').rows[0].trail_conditions;
	for (var ii = 1; ii < $w('#trailCondxTbl').rows.length; ii++) {
		trlCndx += "; " + $w('#trailCondxTbl').rows[ii].trail_conditions
	}

	let trlGrmDate = $w('#trailGroomDate').value;
	let grmTime = $w('#trailGroomTime').value;
	let hour = Number(grmTime.substr(0, 2));
	let minute = Number(grmTime.substr(3, 2));
	trlGrmDate.setHours(hour);
	trlGrmDate.setMinutes(minute);

	let o = new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium"
	});

	$w('#submitBtn').disable();
	_saveTime = $w('#trailGroomTime').value;
	let toInsert = {}
	let grpStr=""
	let trlStr=""
	let clscRd=""
	let grmrRd=""
	let thisTrail=""
	for (var i = 0; i < __nrEntryRows; i++) {
		trlStr = ('#trailLabel'+(i+1));
		grpStr = ('#trGrp' + (i + 1));
		let trlNdx=$w(trlStr).selectedIndices;
		if (!$w(grpStr).hidden && (trlNdx.length>0)) {
			if (i < _trailList.length) {
				trailId = _trailList[i]._id
				thisTrail = _trailList[i].title;
			} else
				break;
			if ((trailId.length < 2) || (groomerId.length < 2))
				break;
			clscRd=('#classicRadio'+(i+1));
			console.log("submitBtn: for "+thisTrail+"; using "+clscRd+"; classicSet " + $w(clscRd).value)
			grmrRd=('#grmMachRadio'+(i+1))
			toInsert = {
				"title": o.format(trlGrmDate),
				"trailCondition": trlCndx,
				"groomDate": trlGrmDate,
				"classicSet": $w(clscRd).value > 0,
				"groomMachine": $w(grmrRd).value,
				"groomerComment": $w('#commentEdit').value,
				"editDate": new Date(),
				"trailRef": trailId,
				"groomerRef": groomerId
			};
			let newItmRef = "";
			try {
				let results = await wixData.insert("skiGroomingTable", toInsert);
				if (results !== undefined) {
					_saveTime = $w('#trailGroomTime').value;
					let item = results;
					console.log("submitBtn: for "+thisTrail+"; result " + results)
					newItmRef = item._id;
					// let tblrws = $w('#trailsDoneTbl').rows;
					// tblrws.push(item);
					// $w('#trailsDoneTbl').rows=tblrws;
				}
			} catch (err) {
				console.log("submitBtn_click caught submit error " + err)
			}
		}

	}
	if ($w('#genCmntEdit').value.length>2){
		try {
			toInsert = {
				"title": $w('#genCmntEdit').value,
				"groomDate": trlGrmDate,
				"trailType": "ski",
				"groomerRef": groomerId
			};
			let results = await wixData.insert("skiGroomCommentTable", toInsert);
			if (results !== undefined) {
			}
		}
		catch (err) {
			console.log("submitBtn_click caught error submit to SkiGroomComment " + err)
		}
	}
	fillTrailsDoneTbl();
	clearEntryFields();
	checkSubmit();	
}
export function trailGroomDate_change(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	_setElmntsChng("Date",true);
	_trailDataSubmit = 1;
	console.log("trailGroomDate setting Date " + _getElmntsChng("Date"));
	checkSubmit();
}

export function classicSetRadio_change(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	_setElmntsChng("Classic",true);
	_trailDataSubmit = 1;
	checkSubmit();
}


export function groomMachineRadio_change(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	_setElmntsChng("Mach",true);
	_trailDataSubmit = 1;
	checkSubmit();
}


export function groomMachRadioALL_change(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	let curVal=$w('#groomMachRadioALL').value;
	for (var i=0;i<__nrEntryRows;i++){
		let grpStr=('#trGrp'+(i+1));
		if (!$w(grpStr).hidden){
			let tmpStr = ('#grmMachRadio'+(i+1));
			console.log("groomMachRadioALL_change setting "+tmpStr+", to: "+curVal)
			$w(tmpStr).value=curVal;
		}
	}
}

export function classicRadioALL_click(event) {
	// This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
	// Add your code for this event here: 
	let curVal=$w('#classicRadioALL').value;
	for (var i=0;i<__nrEntryRows;i++){
		let grpStr=('#trGrp'+(i+1));
		if (!$w(grpStr).hidden){
			let tmpStr = ('#classicRadio'+(i+1));
			console.log("classicRadioALL_change setting "+tmpStr+", to: "+curVal)
			$w(tmpStr).value=curVal;
		}
	}
}

export function loginErrorText_click(event) {
	$w('#loginErrorText').hide();
}