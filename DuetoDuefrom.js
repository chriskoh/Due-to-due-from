/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Mar 2014     Staff
 *
 */


function duetoduefrom(request, response)	// initial function called as default function in script
{	
	if(request.getMethod() == 'GET')	// as script is run
	{
		function1();
	}
	else								// after submit is pushed
	{
		function2();
	}
}

function function1()
{
	var form = nlapiCreateForm('Due to Due from');
	form.addField('date_start', 'date', 'Start Date').setDefaultValue('1/1/2014');
	form.addField('date_end', 'date', 'Due Date').setDefaultValue('1/31/2014');
	form.addSubmitButton('Submit');
	response.writePage(form);
}

function function2()
{
	// import start and end
	var setStartDate = request.getParameter('date_start');	// Import start
	var setEndDate = request.getParameter('date_end'); // end
	
	// Initial Search for account 1215 (215).
	var fromfilter	= new Array();
	fromfilter[0] 	= new nlobjSearchFilter('trandate', null, 'within', setStartDate, setEndDate);
	fromfilter[1] 	= new nlobjSearchFilter('account', null, 'is', '215');
	
	var fromcolumns 	= new Array();
	fromcolumns[0] 	= new nlobjSearchColumn('internalid');
	fromcolumns[1] 	= new nlobjSearchColumn('trandate');
	fromcolumns[2] 	= new nlobjSearchColumn('type');
	fromcolumns[3] 	= new nlobjSearchColumn('account');
	fromcolumns[4] 	= new nlobjSearchColumn('amount');
	fromcolumns[5]	= new nlobjSearchColumn('tranid');
	
	var fromResults 	= nlapiSearchRecord('transaction', null, fromfilter, fromcolumns);	// due from
	
	logx('fromResults', fromResults.length);
	
	// Initial Search for account 2008 (614).
	var tofilter	= new Array();
	tofilter[0] 	= new nlobjSearchFilter('trandate', null, 'within', setStartDate, setEndDate);
	tofilter[1] 	= new nlobjSearchFilter('account', null, 'is', '614');
	
	var tocolumns 	= new Array();
	tocolumns[0] 	= new nlobjSearchColumn('internalid');
	tocolumns[1] 	= new nlobjSearchColumn('trandate');
	tocolumns[2] 	= new nlobjSearchColumn('type');
	tocolumns[3] 	= new nlobjSearchColumn('account');
	tocolumns[4] 	= new nlobjSearchColumn('amount');
	tocolumns[5]	= new nlobjSearchColumn('tranid');

	var toResults 	= nlapiSearchRecord('transaction', null, tofilter, tocolumns); // due to
	
	logx('toResults', toResults.length);
	
	//array for match and miss match
	var matching = new Array();
	var matching2 = new Array();
	
	for(var x = 0; x < fromResults.length; x++){
		for(var y = 0; y < toResults.length; y++){
			if(fromResults[x].getValue('trandate') == toResults[y].getValue('trandate')){
				if(fromResults[x].getValue('amount') == toResults[y].getValue('amount')){
					matching.push(fromResults[x].getValue('internalid'));
					//logx('match', fromResults[x].getValue('internalid'));
				}
			}
		}
	}
	
	for(var x = 0; x < toResults.length; x++){
		for(var y = 0; y < fromResults.length; y++){
			if(fromResults[y].getValue('trandate') == toResults[x].getValue('trandate')){
				if(fromResults[y].getValue('amount') == toResults[x].getValue('amount')){
					matching2.push(toResults[x].getValue('internalid'));
					//logx('match', toResults[x].getValue('internalid'));
				}
			}
		}
	}
	
	html  = '<html>';
	html += '<head>';
	html += '<script src="https://system.netsuite.com/core/media/media.nl?id=359359&c=811217&h=65afe36a877be122622c&_xt=.js"></script>';
	html += '<link rel="stylesheet" type="text/css" href="https://system.netsuite.com/core/media/media.nl?id=359360&c=811217&h=abac63b2f4466bfbd7ac&_xt=.css">'; 
	html += '</head>';
	html += '<body>';

	// Create table
	html += '<table class="sortable" id="datatable" style="display: inline-block; margin-right:50px">' +
				'<tr>' +
					'<td>Date</td>' +
					'<td>Internal ID</td>' +
					'<td>Type</td>' +
					'<td>Number</td>' +
					'<td>Account</td>' +
					'<td>Amount</td>' +
					'<td>Match</td>' +
				'</tr>';
	
	for(var x = 0; x < fromResults.length; x++){
		//begin displaying data
		html += '<tr>' +
			'<td>' + fromResults[x].getValue('trandate') + '</td>';
		
		// set URL depending on record type
		if(fromResults[x].getText('type') == 'Journal'){
			var url = nlapiResolveURL('record', 'intercompanyjournalentry', fromResults[x].getValue('internalid'));
		}
		else if(fromResults[x].getText('type') == 'Deposit'){
			var url = nlapiResolveURL('record', 'deposit', fromResults[x].getValue('internalid'));
		}
		else if(fromResults[x].getText('type') == 'Credit Memo'){
			var url = nlapiResolveURL('record', 'creditmemo', fromResults[x].getValue('internalid'));
		}
				
		html += '<td><a href="' + url + '" target="_blank">' + fromResults[x].getValue('internalid') + '</a></td>' +
			'<td>' + fromResults[x].getText('type') + '</td>' +
			'<td>' + fromResults[x].getValue('tranid') + '</td>';
		
		if(fromResults[x].getValue('account') == '215'){
			html += '<td>1215 WND Books, Inc.</td>';
		}
		else if(fromResults[x].getValue('account') == '614'){
			html += '<td>2008 Due to WND</td>';
		}
		
		//display match or no match depending on other table
		html += '<td>' + fromResults[x].getValue('amount') + '</td>';
		
		for(var y = 0; y < matching.length; y++){
			if(fromResults[x].getValue('internalid') == matching[y]){
				html += '<td>Match</td>';
			}
		}
		html +=	'</tr>';
	}
	
	// Create table
	html += '<table class="sortable" id="datatable" style="display: inline-block; vertical-align: top">' +
				'<tr>' +
					'<td>Date</td>' +
					'<td>Internal ID</td>' +
					'<td>Type</td>' +
					'<td>Number</td>' +
					'<td>Account</td>' +
					'<td>Amount</td>' +
					'<td>Match</td>' +
				'</tr>';
	
	logx('print', toResults.length + ' <= ' + fromResults.length);
	//if (toResults.length <= fromResults.length){
		for(var x = 0; x < toResults.length; x++){
			html += '<tr>' +
				'<td>' + toResults[x].getValue('trandate') + '</td>';
				
				// set URL depending on record type
				if(toResults[x].getText('type') == 'Journal'){
					var url = nlapiResolveURL('record', 'intercompanyjournalentry', toResults[x].getValue('internalid'));
				}
				else if(toResults[x].getText('type') == 'Deposit'){
					var url = nlapiResolveURL('record', 'deposit', toResults[x].getValue('internalid'));
				}
				else if(toResults[x].getText('type') == 'Credit Memo'){
					var url = nlapiResolveURL('record', 'creditmemo', toResults[x].getValue('internalid'));
				}
			
			html += '<td><a href="' + url + '" target="_blank">' + toResults[x].getValue('internalid') + '</a></td>' +
				'<td>' + toResults[x].getText('type') + '</td>' +
				'<td>' + toResults[x].getValue('tranid') + '</td>';
			
			if(toResults[x].getValue('account') == '215'){
				html += '<td>1215 WND Books, Inc.</td>';
			}
			else if(toResults[x].getValue('account') == '614'){
				html += '<td>2008 Due to WND</td>';
			}
			
			html += '<td>' + toResults[x].getValue('amount') + '</td>';
			
			for(var y = 0; y < matching2.length; y++){
				if(toResults[x].getValue('internalid') == matching2[y]){
					html += '<td>Match</td>';
				}
			}
			html +=	'</tr>';
		}
	//}
	
	html += '</table>';	
	html +=	'</body>' +
			'</html>';
	
	var form2 = nlapiCreateForm('Due to Due from: 1215 WND Books, Inc. & 2008 Due to WND');
	var myInlineHtml = form2.addField('custpage_btn', 'inlinehtml');
	myInlineHtml.setDefaultValue(html);
	
	response.writePage(form2);
}

// Log execution
function logx(name, value)
{	
	var context        = nlapiGetContext();
	var usageRemaining = context.getRemainingUsage();
	nlapiLogExecution ('DEBUG', name + ' | ' + usageRemaining, value);
}
