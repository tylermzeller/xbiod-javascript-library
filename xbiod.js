/*////////////////////////////////////////////////////////////////////////
Copyright (c) 2014-2016, The Ohio State University
All rights reserved.

Created by Joe Cora & Tyler Zeller
Last revised on 7 January 2016 (TZ)

Requires: jQuery UI 1.10.4+
		  jQuery 1.8+

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of The Ohio State University nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE OHIO STATE UNIVERSITY BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
////////////////////////////////////////////////////////////////////////*/

/* GENERAL INFORMATION ///////////////////////

* TAXON NAME FORMATTING
Any taxon name can use a custom formatting where a format string can be specified. By
default, any genus or species group name will be italicized. The format string will
replace a percent bracketed word with its corresponding OJ_Break variable value, e.g.,
%taxon% %author% => Telenomus Haliday

////////////////////////////////////////////*/

//= depend_on_asset "xbiod/xbiod.visual.js"
//= depend_on_asset "xbiod/xbiod.taxon.js"
//= depend_on_asset "xbiod/xbiod.occurrence.js"
//= depend_on_asset "xbiod/xbiod.agent.js"
//= depend_on_asset "xbiod/xbiod.search.js"

// INITIALIZATION

// Define namespace
var xbiod = xbiod || {};
xbiod.utils = xbiod.utils || {};
xbiod.base = xbiod.base || {};

// xBio:D BASE NAMESPACE CONSTANTS
//http://osuc.biosci.ohio-state.edu
xbiod.base.oj_break_base = 'http://xbiod.osu.edu/OJ_Break/';
xbiod.base.taxon_format_default = '%taxon% %author%';
xbiod.base.general_format_default = '%name%';
xbiod.base.widget_id_default = '%NAME%-xbiod';
xbiod.base.widget_html =
	"<div id='" + xbiod.base.widget_id_default + "' class='xbiodWidgetFrame'> "+
		"<div class='xbiodWidgetHeader' data-toggle='tooltip' data-placement='bottom' title='Double click to toggle widget'>" +
			"<div class='xbiodWidgetHeaderBar'>" +
				"%HEADER%" +
					"<span class='xbiodWidgetHeaderTitle'>%TITLE%</span>" +
					"<span class='xbiodWidgetHeaderCount'></span>" +
					"<span class='xbiodWidgetMenuButton'>" +
						"<span class='glyphicon glyphicon-menu-hamburger menu-icon'></span>" +
					"</span>" +
					"<div class='xbiodWidgetMenu'>" +
						"<div class='xbiodWidgetMenuContent'>" +
							"<ul class='xbiodWidgetMenuList'></ul>" +
						"</div>" +
					"</div>" +
				"</div>" +
			"</div>" +
			"<div id='%NAME%-content' class='xbiodWidgetContent'></div>" +
			"<div id='%NAME%-pagination' class='xbiodWidgetPagination' data-toggle='tooltip' data-placement='bottom' title='Use these controls to navigate between pages of data'>" +
				"<ul class='paginationList'>" +
					"<li class='leftPagination'>" +
						"<span class='paginationButton btn left'> " +
							"<span class='glyphicon glyphicon-arrow-left'></span>" +
						"</span>" +
					"</li>" +
					"<li class='rightPagination'>" +
						"<span class='paginationButton btn right'>" +
							"<span class='glyphicon glyphicon-arrow-right'></span>" +
						"</span>" +
					"</li>" +
					"<span class='paginationPages'>"  +
					"</span>" +
				"</ul>" +
			"</div>"
		"</div>";

xbiod.base.menu_button_refresh =
'<li>' +
	'<span class="btn xbiodMenuContentButton refreshMenuButton">' +
		'<span class="glyphicon glyphicon-repeat">' +
		'</span>' +
	'</span>' +
'</li>';

xbiod.base.menu_button_collapse =
'<li>' +
	'<span class="btn xbiodMenuContentButton collapseMenuButton">' +
		'<span class="glyphicon glyphicon-off">' +
		'</span>' +
	'</span>' +
'</li>';

xbiod.base.menu_button_minus =
'<span class="btn xbiodMenuContentButton xbiodMenuContentButtonHalf minusMenuButton">' +
	'<span class="glyphicon glyphicon-minus minus">' +
	'</span>' +
'</span>';

xbiod.base.menu_button_plus =
'<span class="btn xbiodMenuContentButton xbiodMenuContentButtonHalf plusMenuButton">' +
	'<span class="glyphicon glyphicon-plus plus">' +
	'</span>' +
'</span>';

xbiod.base.menu_option_font =
'<li class="menuContentFont">' +
	xbiod.base.menu_button_minus +
	xbiod.base.menu_button_plus +
'</li>';

xbiod.base.menu_page_left =
'<span class="btn xbiodMenuContentButton xbiodMenuContentButtonHalf pageLeftMenuButton">' +
	'<span class="glyphicon glyphicon-arrow-left menuPageLeft">' +
	'</span>' +
'</span>';

xbiod.base.menu_page_right =
'<span class="btn xbiodMenuContentButton xbiodMenuContentButtonHalf pageRightMenuButton">' +
	'<span class="glyphicon glyphicon-arrow-right menuPageRight">' +
	'</span>' +
'</span>';

xbiod.base.menu_option_page =
'<li class="menuContentPage">' +
	xbiod.base.menu_page_left +
	xbiod.base.menu_page_right +
'</li>';

xbiod.base.menu_option_checkbox =
'<li>' +
	'<label class="btn"><input type="checkbox" value="%VALUE%" %CHECKED%>%OPTION%</label>' +
'</li>';

xbiod.base.menu_option_radio =
'<li>' +
	'<label class="btn"><input type="radio" value="%VALUE%" name="%NAME%" %CHECKED%>%OPTION%</label>' +
'</li>';

xbiod.base.pagination_item = "<li><span class='paginationButton btn %SELECT_CLASS%'>%PAGENUM%</span></li>";

xbiod.base.page_size = 15;
xbiod.base.widget_min_height = 0;

// xBio:D BASE NAMESPACE VARIABLES
xbiod.base.oj_break_key = null;
xbiod.base.paths = {
	taxon_path: '',
	occurrence_path: '',
	agent_path: '',
	search_path: ''
};

// Boolean values for each resource to be loaded
xbiod.base.loaded = {
	visual: false,
	taxon: false,
	occurrence: false,
	agent: false,
	search: false
};

// xBio:D BASE NAMESPACE COLOR DEFAULTS
xbiod.base.colors = {
	background_color_default: 0xFF70CFF5,
	node_color_default: 0xFFFF3333
};

// XBio:D widget menu items
xbiod.base.menu_item = {};

xbiod.base.menu_item.checkbox = function(option, value, checked){
	return xbiod.base.menu_option_checkbox.replace(/%OPTION%/g, option).replace(/%VALUE%/g, value).replace(/%CHECKED%/g, checked);
}

xbiod.base.menu_item.radio = function(option, value, checked, name){
	return xbiod.base.menu_option_radio.replace(/%NAME%/g, name).replace(/%OPTION%/g, option).replace(/%VALUE%/g, value).replace(/%CHECKED%/g, checked);
}


// xBio:D BASE WIDGET OPTIONS
xbiod.base.widget_options = {
	initial_height: '275px',
	handles: 's',
	resizable: 'N',
	animate: 'Y',
	start: 'open',
	header: ''
};



// xBio:D BASE NAMESPACE ICON DEFAULTS
xbiod.base.icons = {
	affirmative: '<span class="marker glyphicon glyphicon-ok"></span>',

	negative: '<span class="marker glyphicon glyphicon-remove"></span>',

	polygon: {
		unvouchered: 'http://hol.osu.edu/images/icons/poly_unv_icon.png',
		vouchered: 'http://hol.osu.edu/images/icons/poly_icon.png',
		sex : {
			female: 'http://hol.osu.edu/images/icons/pt_icon_female.png',
			male: 'http://hol.osu.edu/images/icons/pt_icon_male.png',
			unsexed: 'http://hol.osu.edu/images/icons/pt_icon_unsexed.png'
		}
	},

	point: {
		unvouchered: 'http://hol.osu.edu/images/icons/pt_unv_icon.png',
		vouchered: 'http://hol.osu.edu/images/icons/pt_icon.png',
		sex : {
			female: 'http://hol.osu.edu/images/icons/pt_icon_female.png',
			male: 'http://hol.osu.edu/images/icons/pt_icon_male.png',
			unsexed: 'http://hol.osu.edu/images/icons/pt_icon_unsexed.png'
		}
	}

};

xbiod.base.requests = {
	text_search: [],
	filter_request: [],
	content_request: [],
	content_request2: [],
	file_operation: []
};

// xBio:D DEFAULT INITIALIZER
xbiod.init = function(libs, api_key, callback) {
	// Check if an OJ_Break API key is defined
	if (api_key) {
		xbiod.base.oj_break_key = api_key;
	} else {
		xbiod.base.showAPIKeyError();

		return;
	}

	// Load the selected libraries
	for (var nLibCount = 0; nLibCount < libs.length; nLibCount++) {
		switch(libs[nLibCount]) {
			case 'visual': {
				//http://osuc.biosci.ohio-state.edu/JSLib/xbiod_lib
				//$.getScript('xbiod.visual.js');
				var script = document.createElement('script');
				script.src = 'js/xbiod/xbiod.visual.js';
				document.head.appendChild(script);
				break;
			}
			case 'taxon': {
				//$.getScript('xbiod.taxon.js');
				var script = document.createElement('script');
				script.src = 'js/xbiod/xbiod.taxon.js';
				document.head.appendChild(script);
				break;
			}
			case 'occurrence': {
				//$.getScript('xbiod.occurrence.js');
				var script = document.createElement('script');
				script.src = 'js/xbiod/xbiod.occurrence.js';
				document.head.appendChild(script);
				break;
			}
			case 'agent': {
				//$.getScript('xbiod.agent.js');
				var script = document.createElement('script');
				script.src = 'js/xbiod/xbiod.agent.js';
				document.head.appendChild(script);
				break;
			}
			case 'search': {
				//$.getScript('xbiod.search.js');
				var script = document.createElement('script');
				script.src = 'js/xbiod/xbiod.search.js';
				document.head.appendChild(script);
			}
		}
	}

	// Do not call initialized callback until all of the features have been loaded
	var interval_id = setInterval(function() {
		// Check if all of the selected libraries are loaded
		var nLoadedCount = 0;

		for (var nLibCount = 0; nLibCount < libs.length; nLibCount++) {
			if (xbiod.base.loaded[libs[nLibCount]]) {
				nLoadedCount++;
			}
		}

		if (nLoadedCount == libs.length) {
			// Remove init checking and callback
			clearInterval(interval_id);

			callback();
		}
	}, 200);
}

// xBio:D BASE NAMESPACE FUNCTIONS
xbiod.base.showParameterError = function(api_call, lib_component) {
	alert('ERROR: "' + api_call + '" method of "' + lib_component + '" component does not have all required parameters specified!');
};

xbiod.base.showAPIKeyError = function() {
	alert('ERROR: An OJ_Break API key has not been defined!');
};

xbiod.base.showAPIResponseError = function(error_code) {
	alert('ERROR: The OJ_Break API request was unable to be completed! Code ' + error_code + ' error.');
};

xbiod.base.errorResponse = function(widget_id, content_id, widget_options){
	xbiod.base.closeWidget(widget_id, content_id, widget_options);
	xbiod.base.removeLoaderIcon(widget_id);
};

xbiod.base.encodeJavascript = function(text) {
	text = text.replace(/'/g, '\\\'');

	return text;
};

xbiod.base.decodeJavascript = function(text) {
	text = text.replace(/&quot;/g, '"');

	return text;
};

xbiod.base.sendRequest = function(method, url, parameters, requestClass, enqueue, callback) {
	var requestObject;

	// Check which type of method to use (POST or GET)
	if (typeof(method) == 'undefined' || method.toUpperCase() == 'GET') {
		requestObject = $.get(url, parameters, $.noop(), 'jsonp');
	} else if (method.toUpperCase() == 'POST') {
		requestObject = $.post(url, parameters);
	}

	requestObject.always(function(jData, status) {
		// Send json to callback
		callback(jData);
	});

	// Check if only a single, primary request should run
	if (typeof(requestClass) != 'undefined') {
		var arrayRequests = [];

		switch (requestClass) {
			case 'text_search': {
				arrayRequests = xbiod.base.requests[requestClass];

				break;
			}
			case 'content_request': {
				arrayRequests = xbiod.base.requests[requestClass];

				break;
			}
			case 'content_request2': {
				arrayRequests = xbiod.base.requests[requestClass];

				break;
			}
			case 'filter_request': {
				arrayRequests = xbiod.base.requests[requestClass];

				break;
			}
			default: {
				// No class found, so quit
				return;
			}
		}

		// Check if previous requests should be killed
		if (arrayRequests.length > 0 && !enqueue) {
			// Kill the previous requests
			for (nRequestCount = 0; nRequestCount < arrayRequests.length; nRequestCount++) {
				arrayRequests[nRequestCount].abort();
			}

			// Remove all previous requests
			arrayRequests.length = 0;
		}

		// Add current request to proper request queue
		arrayRequests.push(requestObject);
	}
};

xbiod.base.sendAPIRequest = function(method, url, parameters, requestClass, enqueue, callback) {
	// Add key to the parameters
	parameters.key = xbiod.base.oj_break_key;

	// Pass on request
	xbiod.base.sendRequest(method, url, parameters, requestClass, enqueue, callback);
};

xbiod.base.getQueryVariable = function(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split('&');

	for (var i=0; i < vars.length; i++) {
		var pair = vars[i].split('=');

		if (pair[0] == variable) {
			return pair[1].replace(/%20/g, ' ');
		}
	}

	return null;
};

xbiod.base.formatTaxonName = function(taxon, taxonFormat, useTaxonItalics) {
	// Add italicized to taxon name for genus group and species group taxa
	if ((taxon.rank == 'Genus' || taxon.rank == 'Subgenus' || taxon.rank == 'Species' || taxon.rank == 'Subspecies') && useTaxonItalics) {
		taxonFormat = taxonFormat.replace('%taxon%', '<span class="xbiodItalicizedTaxonName">%taxon%</span>');
	}

	// Format the taxon name based on the taxon name format
	var taxon_text = $.trim(taxonFormat.replace('%tnuid%', taxon.tnuid || taxon.id).replace('%taxon%', taxon.taxon || taxon.name).replace('%name%', taxon.name).replace('%author%', taxon.author || taxon.taxon_author).replace('%status%', taxon.status).replace('%rank%', taxon.rank).replace('%valid%', taxon.valid).replace('%fossil%', taxon.fossil).replace('%num_spms%', taxon.num_spms).replace('%status%', taxon.status).replace('%rel_type%', taxon.rel_type).replace('%thumb%', taxon.thumb || taxon.normalRes).replace('%title%', taxon.title).replace('%year%', taxon.year).replace('%comments%', taxon.comments).replace('%volume%', taxon.volume).replace('%start_page%', taxon.start_page).replace('%end_page%', taxon.end_page).replace('%type%', taxon.type).replace('%page%', taxon.page).replace('%valid_name%', taxon.valid_name).replace('%hier%', taxon.hier).replace('%alt_ids%', taxon.alt_ids).replace('%cuid%', taxon.cuid).replace('%coden%', taxon.inst_code || taxon.inst_coden).replace('%ref%', taxon.ref));

	// Process fossil and invalid taxon symbols
	if (taxon.fossil == 'Y') {
		taxon_text = '&dagger;' + taxon_text;
	}

	if (taxon.valid_flag == 'Invalid') {
		taxon_text = '*' + taxon_text;
	}

	return taxon_text;
};

xbiod.base.formatCitation = function(taxon, taxonFormat, useTaxonItalics) {
	// Add italicized to taxon name for genus group and species group taxa
	if ((taxon.rank == 'Genus' || taxon.rank == 'Subgenus' || taxon.rank == 'Species' || taxon.rank == 'Subspecies') && useTaxonItalics) {
		taxonFormat = taxonFormat.replace('%taxon%', '<span class="xbiodItalicizedTaxonName">%taxon%</span>');
	}

	// Format the taxon name based on the taxon name format
	var taxon_text = $.trim(taxonFormat.replace('%tnuid%', taxon.tnuid || taxon.id).replace('%taxon%', taxon.taxon || taxon.name).replace('%name%', taxon.name).replace('%author%', taxon.author || taxon.taxon_author).replace('%status%', taxon.status).replace('%rank%', taxon.rank).replace('%valid%', taxon.valid).replace('%fossil%', taxon.fossil).replace('%num_spms%', taxon.num_spms).replace('%status%', taxon.status).replace('%rel_type%', taxon.rel_type).replace('%thumb%', taxon.thumb || taxon.normalRes).replace('%title%', taxon.title).replace('%year%', taxon.year).replace('%comments%', taxon.comments).replace('%volume%', taxon.volume).replace('%start_page%', taxon.start_page).replace('%end_page%', taxon.end_page).replace('%type%', taxon.type).replace('%page%', taxon.page).replace('%valid_name%', taxon.valid_name).replace('%hier%', taxon.hier).replace('%alt_ids%', taxon.alt_ids).replace('%cuid%', taxon.cuid).replace('%coden%', taxon.inst_code || taxon.inst_coden).replace('%ref%', taxon.ref));

	// Process fossil and invalid taxon symbols
	if (taxon.fossil == 'Y') {
		taxon_text = '&dagger;' + taxon_text;
	}

	if (taxon.valid_flag == 'Invalid') {
		taxon_text = '*' + taxon_text;
	}

	return taxon_text;
};

// General (currently)refers to any non-taxon related name
xbiod.base.formatGeneralName = function(general, generalFormat) {

	// Format the agent name based on the agent name format
	var general_text = $.trim(generalFormat.replace('%agent_name%', general.agent_name).replace('%name%', general.name || general.inst_name || general.determiner).replace('%collector%', general.collector).replace('%coden%', general.inst_coden).replace('%inst_id%', general.inst_id).replace('%spm_count%', general.spm_count).replace('%habitat%', general || general.habitat).replace('%num_spms%', general.num_spms).replace('%coll_method%', general.coll_method || general.coll_meth).replace('%coords%',general.coords).replace('%elev%',general.elev).replace('%pol0%',general.pol0).replace('%pol1%',general.pol1).replace('%pol2%',general.pol2).replace('%pol4%',general.pol4).replace('%place%', general.place).replace('%prec_type%',general.prec_type).replace('%loc_comments%',general.loc_comments).replace('%date%', general.coll_date || general.det_date || general.date).replace('%field_code%', general.field_code).replace('%taxon%', general.taxon).replace('%det_status%', general.det_status).replace('%determiner%', general.determiner).replace('%associations%', general.associations).replace('%spm_info%', general.spm_info).replace('%inst_name%', general.inst_name).replace('%alt_ids%', general.alt_ids).replace('%comments%', general.comments).replace('%enterer%', general.enterer).replace('%taxonomy%', general.taxonomy).replace('%literature%', general.literature).replace('%occurrence%', general.occurrence).replace('%media%', general.media).replace('%stats%', general.stats).replace('%locality%', general.locality).replace('%cuids%', general.cuids).replace('%cuid%', general.cuid).replace('%valid_name%', general.valid_name));

	return general_text;
};

xbiod.base.formatLiterature = function (pub, literatureFormat) {
	// Checking if pages is defined and if a URL is present
	if (pub.pages && pub.pages[0].url == '') {
		pub['page'] = pub.pages[0].page;
	} else if (pub.pages && pub.pages[0].url != '') {
		pub['page'] = '<a title="PDF Viewer for page ' + pub.pages[0].page + '" href="http://' + pub.pages[0].url + '">' + pub.pages[0].page + '</a>';
	}

	// Format the pub name based on the literature format
	var pub_text = $.trim(literatureFormat.replace('%pub_author%', pub.pub.pub_author.last_name).replace('%taxon%', pub.taxon).replace('%pub_year%', pub.pub.pub_year).replace('%page%', pub.page).replace('%annotation%', pub.annotation).replace('%citation_id%', pub.citation_id).replace('%doi%',pub.pub.doi).replace('%end_page%', pub.pub.end_page).replace('%journal%', pub.pub.journal).replace('%journal_id%', pub.pub.journal_id).replace('%pub_id%', pub.pub.pub_id).replace('%start_page%', pub.pub.start_page).replace('%pub_month%', pub.pub.pub_month).replace('%title%', pub.pub.title).replace('%vol_num%', pub.pub.vol_num).replace('%volume%', pub.pub.volume));

	return pub_text;
};

xbiod.base.formatAgent = function (agent, agentFormat) {

	// Format the agent name based on the agent format
	var agent_text;// = $.trim(agentFormat.replace());

	return agent_text;
};

xbiod.base.formatMedia = function(media, mediaFormat){
	var media_text;
	if (mediaFormat){
	// Format the media based on the media format
	media_text = $.trim(mediaFormat.replace('%thumb%', media.thumb).replace('%raw%', media.raw).replace('%caption%', media.caption).replace('%media_id%', media.media_id).replace('%media_url%', media.media_url).replace('%copyright%', media.copyright).replace('%media_source%', media.media_source).replace('%media_type%', media.media_type)
	.replace('%license%', media.license).replace('%technique%', media.technique).replace('%notes%', media.notes).replace('%enterer%', media.enterer).replace('%angle%', media.angle).replace('%taxon%', media.occurrence.determination.taxon.taxon).replace('%taxon_author%', media.occurrence.determination.taxon.taxon_author).replace('%author%', media.occurrence.determination.taxon.taxon_author));
	} else {
		media_text = '<a title="' + media.occurrence.determination.taxon.taxon + ': ' + media.parts[0] + ', ' + media.angle + ' view. Copyright: ' + media.copyright + '." class="gallery-item" href="' + media.media_url + '"><img src="' + media.thumb + '"><br><a href="?id=' + media.occurrence.determination.taxon.tnuid + '">' + media.occurrence.determination.taxon.taxon + '</a> '+ media.occurrence.determination.taxon.taxon_author + '</a>';
	}
	return media_text;

};

xbiod.base.formatInstitutionName = function(inst, institutionFormat){
	// Format the institution name based on the institution format
	var inst_text = $.trim(institutionFormat.replace('%inst_code%', inst.inst_code).replace('%inst_id%', inst.inst_id).replace('%name%', inst.inst_name).replace('%inst_name%', inst.inst_name).replace('%vouchered%', inst.vouchered));

	return inst_text;
};

xbiod.base.formatOccurrence = function(occurrence, occurrenceFormat){
	// Format the institution name based on the institution format
	var occur_text = $.trim(occurrenceFormat.replace(/%occurrence_id%/g, occurrence.occurrence_id).replace('%vouchered%', occurrence.vouchered));
	return occur_text;
};

xbiod.base.formatBaseTable = function(){
	var table_builder = ['<table class="xbiodContentTable">'];

	if (arguments.length > 0) {
		table_builder.push('<thead><tr>');
		for (var i = 0; i < arguments.length; i++){
			table_builder.push('<th class="xbiodContentDataHeader col">' + arguments[i] + '</th>');
		}
		table_builder.push('</tr></thead>');
	}
	table_builder.push('<tbody></tbody></table>');
	var table = $(table_builder.join(''));
	table.find('th').each(function(){
		$(this).data('reverse', false);
	});
	return table;
};

// Add events to the headers and td elements in a table
xbiod.base.addTableEvents = function(widget_id){
	var widget = $('#' + widget_id);
	var table = widget.find('.xbiodContentTable');

	table.find('th').on('click', function(){
		// sort data attached to content, append new content
		var prop = $(this).text().toLowerCase().replace(' ', '_'); // get the current table header text as a property to be sorted
		var reverse = $(this).data('reverse'); // get the current sorting order (either reversed or not)
		xbiod.base.sortTable(widget_id, prop, reverse); // sort
		$(this).data('reverse', !reverse); // switch sorting order for next sort
	});

	// The below two blocks controls single cell highlighting
	table.find('.xbiodTableData').hover(function() {
		$(this).parents('table').find('td:nth-child(' + ($(this).index() + 1) + ')').
		add($(this).parent()).addClass('hover');
		$(this).addClass('outline');
	},
	function() {
		$(this).parents('table').find('td:nth-child(' + ($(this).index() + 1) + ')').
		add($(this).parent()).removeClass('hover');
		$(this).removeClass('outline');
	});
};

// Media popup
xbiod.base.addMediaPopup = function(table){
	table.magnificPopup({
		delegate: 'a.gallery-item',
		type: 'image',
		gallery:{
			enabled: true,
			preload: [0,2],
			tPrev: 'Previous (Left arrow key)',
			tNext: 'Next (Right arrow key)',
			tCounter: '<span class="mfp-counter">%curr% of %total% images</span>'
		}
	});
};


// Formatting a tr element and returning the tr object
xbiod.base.formatTableData = function (){
	var tr_builder = ['<tr class="xbiodContentData">']
	// loop through all arguments
	for (var i = 0; i < arguments.length; i++){

		// handle array argument
		if (Object.prototype.toString.call(arguments[i]) === '[object Array]'){

			// loop through all elements of the array arg
			for (var j = 0; j < arguments[i].length; j++){
				tr_builder.push('<td class="xbiodTableData">', arguments[i][j], '</td>');
			}
		} else { // not an array
			// Check if a class was added to this data
			if (typeof arguments[i] == 'string' && arguments[i].indexOf('.class=') > -1)
			{
				var data = arguments[i].split('.class=');
				tr_builder.push('<td class="xbiodTableData ', data[1], '">', data[0], '</td>');
			} else {
				tr_builder.push('<td class="xbiodTableData">', arguments[i], '</td>');
			}
		}
	}
	tr_builder.push('</tr>');
	return tr_builder.join("");
};

// Create table element object with sortable data
xbiod.base.createTableElement = function (table){
	var element = {};
	var headers = table.find('th');
	// Looping through creating the element object
	for (var i = 1; i < arguments.length; i++){
		var header = headers[i - 1];
		var formattedProperty = $(header).text().toLowerCase().replace(' ', '_');
		element[formattedProperty] = arguments[i];
	}
	return element;
};

// Formatting general text data. Simply wraps arguments in a div to be styled
xbiod.base.formatContentData = function () {
	var html_builder = [];
	for (var i = 0; i < arguments.length; i++) {
		html_builder.push('<div class="xbiodContentData">', arguments[i], '</div>');
	}
	return html_builder.join("");
}

// Format inverted table rows
xbiod.base.formatInvertedTable = function(){
	var html_builder = [];
	for (var i = 0; i < arguments.length; i += 2){
		html_builder.push('<tr class="xbiodContentData">');
		html_builder.push('<td class="xbiodContentDataHeader">', arguments[i], '</td><td>', arguments[i+1], '</td>');
		html_builder.push('</tr>');
	}
	return html_builder.join("");
};

// Finalizes an xbiodTable by wrapping the HTML table content (the arg) in a table tag.
xbiod.base.formatTable = function (content){
	return '<table class="xbiodContentTable">' + content + '</table>';
};

// Color format function for TaxonHierarchy animation
xbiod.base.formatColor = function(nodeColor, backgroundColor){

	/* *************** FORMATTING BACKGROUND COLOR ****************/
	//console.log(nodeColor + ' ' + backgroundColor)
	// Checking for a string input - either hexadecimal or color name
	if (typeof backgroundColor == 'string' || backgroundColor instanceof String) {
		backgroundColor = xbiod.base.getColor(backgroundColor);
		if (!backgroundColor){
			backgroundColor = xbiod.base.colors.background_color_default;
		}
	}
	xbiod.base.colors.backgroundColor = backgroundColor;

	xbiod.base.colors.bRedComp = xbiod.base.hexToRedComp(backgroundColor.toString(16));
	// Checking for hex parse error caused by leading zeros
	if(isNaN(xbiod.base.colors.bRedComp)) {
		xbiod.base.colors.bRedComp = 0;
	}

	xbiod.base.colors.bGreenComp = xbiod.base.hexToGreenComp(backgroundColor.toString(16));
	// Checking for hex parse error caused by leading zeros
	if(isNaN(xbiod.base.colors.bGreenComp)) {
		xbiod.base.colors.bGreenComp = 0;
	}

	xbiod.base.colors.bBlueComp = xbiod.base.hexToBlueComp(backgroundColor.toString(16));

	/* *************** FORMATTING NODE COLOR ****************/

	// Checking for a string input - either hexadecimal or color name
	if (typeof nodeColor == 'string' || nodeColor instanceof String) {

		// Creating default gradients
		xbiod.base.colors.redGradient = -5;
		xbiod.base.colors.greenGradient = -5;
		xbiod.base.colors.blueGradient = -5;

		nodeColor = xbiod.base.getColor(nodeColor);
		if (!nodeColor) {
			nodeColor = xbiod.base.colors.nodeColorDefault;
		}
	}
	xbiod.base.colors.nodeColor = nodeColor;

	xbiod.base.colors.nRedComp = xbiod.base.hexToRedComp(nodeColor.toString(16));
	// Checking for hex parse error caused by leading zeros
	if(isNaN(xbiod.base.colors.nRedComp)) {
		xbiod.base.colors.nRedComp = 0;
	}

	xbiod.base.colors.nGreenComp = xbiod.base.hexToGreenComp(nodeColor.toString(16));
	// Checking for hex parse error caused by leading zeros
	if(isNaN(xbiod.base.colors.nGreenComp)) {
		xbiod.base.colors.nGreenComp = 0;
	}

	xbiod.base.colors.nBlueComp = xbiod.base.hexToBlueComp(nodeColor.toString(16));

};

// Check the format of the color and return a parsed numeric representation
xbiod.base.getColor = function(color) {
	// Checking if 6 digit hex (#RRGGBB)
	if(color.charAt(0) == '#'){
		color = parseInt(xbiod.base.cutHex(color), 16);
	// Checking if 8 digit hex (0xAARRGGBB)
	} else if (color.charAt(0) == '0') {
		color = parseInt(color,16);
	} else {
		color = null;
	}
	return color;
};

// Hexadecimal string formatting helper function
xbiod.base.hexToRedComp = function(hex) {
	return parseInt((hex).substring(hex.length - 6, hex.length - 4),16);
};
// Hexadecimal string formatting helper function
xbiod.base.hexToGreenComp = function(hex) {
	return parseInt((hex).substring(hex.length - 4, hex.length - 2),16);
};
// Hexadecimal string formatting helper function
xbiod.base.hexToBlueComp = function(hex) {
	return parseInt((hex).substring(hex.length - 2, hex.length),16);
};
// Hexadecimal string formatting helper function
xbiod.base.cutHex = function(hex) {
	return (hex.charAt(0)=="#") ? hex.substring(1,hex.length):hex;
};

//************* FORMATTING HTML ****************

// Returns an HTML anchor tag with the arguments for the id string, an id, and the link text
xbiod.base.formatLink = function(variable, id, text, newPath){
	if (!newPath){
		newPath = window.location.pathname;
	}
	return ['<a href="', window.location.origin, newPath, '?', variable, '=', id, '">', text, '</a>'].join("");
};

// Returns a formatted HTML string for a taxon's hierarchy from Class -> Genus
xbiod.base.formatTypeHierarchy = function (hier){
	hier_builder = [];
	var currentKey = 'Order';
	// Looping until all hierarchy from Order to Genus are added for this type
	for (var key in hier){
		if (key == currentKey) {
			hier_builder.push(xbiod.base.formatLink('id',  hier[key].tnuid, hier[key].taxon));
			currentKey = hier[key].next;
			if (currentKey == 'Species' || currentKey == null){
				break;
			}
		}
	}
	return hier_builder.join(": ");
};

// Returns a formatted HTML string for a taxon pub's reference
xbiod.base.formatTypeReference = function (pub, pages){
	if (pub.pub_author.agent_name == ''){ // temporary fix, exit function if agent name is empty
		return '';
	}

	var formattedRef = ['<a href="?pub_id=', pub.pub_id, '">', (pub.author || pub.pub_author.agent_name), ', ', (pub.year || pub.pub_year), '</a> '];

	// Checking if pages is defined and if a URL is present
	if (pages.length > 0){

		// Looping until all pages from original citation are formatted and concatenated
		for (var i = 0; i < pages.length; i++){
			if (i != 0){
				formattedRef.push(', ');
			}
			if (pages[i].url == '') {
				formattedRef.push(pages[i].page);
			} else {
				formattedRef.push('<a href="http://', pages[i].url + '">', pages[i].page, '</a>');
			}
		}
	}
	return formattedRef.join("");
};

xbiod.base.formatReference = function formatReference(ref, nViewFormat) {
	var szresultHTML = '';
	var nLitID;
	var nBasePubID;

	// Undefined view defaults to 0 view
	if (nViewFormat == undefined) {
		nViewFormat = 0;
	}

	// Check for contribution ID for pub. ID
	if (ref.contrib_id) {
		nLitID = ref.contrib_id;
		nBasePubID = ref.contrib_id;
	} else {
		nLitID = ref.pub_id;
		nBasePubID = ref.pub_id;
	}

	switch (nViewFormat) {
		case 0: {
			szresultHTML += '<span class="">Full Reference</span> <span class=""><a href="?id=' + nLitID + '" title="View the extended reference of the current publication">view extended reference</a></span><p>';

			break;
		}
		case 1: {
			szresultHTML += '<p>';

			break;
		}
		default: {
			// Nothing
			break;
		}
	}

	// Check for a contributor
	if (ref.contrib_author) {
		szresultHTML += ref.contrib_author.replace(/\.$/g, '');

		// Check if contribution title is specified
		if (ref.contrib_title) {
			szresultHTML += '. ' + ref.contrib_title;
		}

		szresultHTML += ' <span class=""><span class="">in</span></span> ';
	}

	// Remove period at the end of "et al." and a period at the end in author string
	var szAuthor;
	if (ref.author){
		szAuthor = ref.author.replace(/et al\./g, 'et al').replace(/\.$/g, '');
	} else {
		szAuthor = ref.pub_author.agent_name.replace(/et al\./g, 'et al').replace(/\.$/g, '');
	}

	// Check for which type of publication
	switch (ref.pub_type) {
		case 'BOOK':
			szresultHTML += szAuthor + '. ' + ref.pub_year + '. <span class="">' + (ref.title ? ref.title : 'nt.') + '</span> ' + ref.publisher + ', ' + ref.city + '. ' + ref.num_pages + ' pp.';
		break;
		case 'ARTICLE':
			var bNeedColon = false;

			szresultHTML += szAuthor + '. ' + ref.pub_year + '. ' + (ref.title ? ref.title : 'nt.') + ' <span class="Journal">' + ref.journal + '</span>, ';

			// Check for series, volume, and volume number and output if necessary
			if (ref.series.length > 0) {
				szresultHTML += '(' + ref.series + ')';

				bNeedColon = true;
			}
			if (ref.volume.length > 0) {
				szresultHTML += '<span class="Volume">' + ref.volume + '</span>';

				bNeedColon = true;
			}
			if (ref.vol_num.length > 0) {
				szresultHTML += '(' + ref.vol_num + ')';

				bNeedColon = true;
			}

			// Check if a colon is needed
			if (bNeedColon) {
				szresultHTML += ': ';
			}

			// Output page number and check if a range annotation is needed
			szresultHTML += ref.start_page;

			if (ref.end_page.length > 0) {
				szresultHTML += '-' + ref.end_page;
			}

			// Add finishing period
			szresultHTML += '.';
		break;
		case 'BULLETIN':
			szresultHTML += szAuthor + '. ' + ref.pub_year + '. ' + (ref.title ? ref.title : 'nt.') + ' <span class="Journal">' + ref.journal + '</span>. No. ';

			// Check for series, volume, and volume number and output if necessary
			if (ref.series.length > 0) {
				szresultHTML += '(' + ref.series + ')';
			}
			if (ref.volume.length > 0) {
				szresultHTML += ref.volume;
			}
			if (ref.vol_num.length > 0) {
				szresultHTML += '(' + ref.vol_num + ')';
			}

			// Output page number and check if a range annotation is needed
			szresultHTML += '. ' + ref.num_pages + ' pp.';
		break;
		case 'CHAPTER':
			szresultHTML += ref.pub_author.agent_name.replace(/\.$/g, '') + '. ' + ref.pub_year + '. ' + (ref.title ? ref.title : 'nt.');

			// Check for chapter number and output if necessary
			if (ref.chap_num.length > 0) {
				szresultHTML += ' (' + ref.chap_num + ')';
			}

			// Output page number and check if a range annotation is needed
			if (ref.end_page.length > 0) {
				szresultHTML += ' Pages ' + ref.start_page + '-' + ref.end_page;
			} else {
				szresultHTML += ' Page ' + ref.start_page;
			}

			// Output book info for chapter
			szresultHTML += ' <span class=""><span class="boldedText">in</span></span> ' + szAuthor + '. <span class="">' + (ref.book.title ? ref.book.title : 'nt.') + '</span> ' + ref.book.publisher + ', ' + ref.book.city + '. ' + ref.book.num_pages + ' pp.';
		break;
	}

	// Add DOI if specified
	if (ref.doi && nViewFormat < 2) {
		szresultHTML += ' <a href="http://dx.doi.org/' + ref.doi + '" target="_new" title="Go to publication through DOI">doi:' + ref.doi + '</a>';
	}

	// Check if there is a pdf to link
	if (ref.url && nViewFormat < 2) {
		// Check if the PDF is public
		if (ref.public == 'Y') {
			szresultHTML += ' <a href="http://' + (ref.url || ref.full_pdf) + '" target="_new"><img src="http://www.hol.osu.edu/HymOnline/pdf_icon.gif" title="View full PDF (' + ref.filesize + ')"></a> - <a href="literature-viewer.html?id=' + nBasePubID + '" target="_new" title="Browse by page through publication">browse</a>';
		} else {
			szresultHTML += ' <img src="http://www.hol.osu.edu/HymOnline/pdf_icon-locked.gif" title="PDF is available but inaccessible due to copyright restrictions">';
		}
	}

	switch (nViewFormat) {
		case 0: {
			szresultHTML += '</p>';

			break;
		}
		case 1: {
			szresultHTML += ' <span id="' + ref.pub_id + '"></span><span class=""><a href="reference-full.html?id=' + ref.pub_id + '" title="View the extended reference of the current publication">view extended reference</a></span></p>';
			break;
		}
		default: {
			// Nothing
			break;
		}
	}

	return szresultHTML;
};

//************* END FORMATTING *****************

// Sorting functions

xbiod.base.sortTable = function(widget_id, property, reverse){
	var widget = $('#' + widget_id);
	var table = widget.find('.xbiodContentTable');
	var tbody = table.find('tbody');

	var table_elements = widget.data('tableElements');
	var curr_page = widget.data('page_num');
	var start = (curr_page - 1) * widget.data('page_size');//xbiod.base.page_size;
	var end = curr_page * widget.data('page_size');//xbiod.base.page_size;
	var page_elements = table_elements.slice(start, end);


	page_elements.sort(sortBy(property, reverse)); // sort the array
	tbody.children().remove(); // remove tbody content

	// loop until all sorted table elements are added to tbody
	for (var i = 0; i < page_elements.length; i++){
		var tr = page_elements[i].html; // get tr HTML
		tbody.append(tr); // append tr HTML
	}

	// Add hover events
	table.find('.xbiodTableData').hover(function() {
		$(this).parents('table').find('td:nth-child(' + ($(this).index() + 1) + ')').
		add($(this).parent()).addClass('hover');
		$(this).addClass('outline');
	},
	function() {
		$(this).parents('table').find('td:nth-child(' + ($(this).index() + 1) + ')').
		add($(this).parent()).removeClass('hover');
		$(this).removeClass('outline');
	});
}

xbiod.base.sortLastName = function(a, b){
	a = a.last_name;
	b = b.last_name;

	return xbiod.base.sortName(a, b);
};

xbiod.base.sortLit = function (a, b) {
	// First, sort names
	if (a.pub_author == undefined){
		a.pub_author = a.pub.pub_author;
	}
	if (b.pub_author == undefined){
		b.pub_author = b.pub.pub_author;
	}
	var nReturn = xbiod.base.sortName(a.pub_author.agent_name || a.author, b.pub_author.agent_name || b.author);
	// Then sort dates, if necessary
	if (a.pub != undefined){
		a = a.pub;
	}

	if (nReturn == 0) {
		// First, check years
		if (a.pub_year || a.year > b.pub_year || b.year) {
			return 1;
		} else if (a.pub_year || a.year < b.pub_year || b.year) {
			return -1;
		} else {
			// Next, check months
			if (a.pub_month || a.month > b.pub_year || b.month) {
				return 1;
			} else if (a.pub_month || a.month < b.pub_month || b.month) {
				return -1;
			} else {
				// Last, sort by title
				return xbiod.base.sortName(a.title, b.title);
			}
		}
	} else {
		return nReturn;
	}
}

xbiod.base.sortMedia = function (nameA, nameB, pos){
	// Set pos to 0 if not defined
	nameA = nameA.occurrence.determination.taxon.taxon;
	nameB = nameB.occurrence.determination.taxon.taxon;
	if (!pos) {
		pos = 0;
	}

	// Check if both strings are defined
	if (!nameA || !nameB) {
		return typeof(nameB) == 'undefined';
	}

	// Check for end of string (either nameA or nameB)
	if (pos >= nameA.length || pos >= nameB.length) {
		if (nameA.length > nameB.length) {
			return 1;
		} else if (nameA.length < nameB.length) {
			return -1;
		} else {
			return 0;
		}
	} else {
		var chA, chB;

		chA = nameA.charAt(pos);
		chB = nameB.charAt(pos);

		if (chA > chB) {
			return 1;
		} else if (chA < chB) {
			return -1;
		} else {
			return xbiod.base.sortName(nameA, nameB, pos + 1);
		}
	}
}

xbiod.base.sortName = function (a, b) {
	return a.localeCompare(b);
}

// Main sorting function used in widgets
function sortBy(property, reverse, primer) {

	var key = primer ?
		function(x) {return primer(x[property])} : // adds optional primers to the sortable items (such as toUpperCase) for added flexibility
		function(x) {return x[property]}; // else returns the property as normal

	reverse = !reverse ? 1 : -1;

	return function (a, b) {
		a = key(a); // add primer to item a
		b = key(b); // add primer to item b
		if (a == '') return 1; // always make empty string last, even during reverse
		if (b == '') return -1; // always make empty string last, even during reverse
		return reverse * (xbiod.base.sortName(a,b)); // call sortname on items a and b
	}
}

xbiod.base.addLoaderIcon = function(id) {
	var icon = ' <img class="loader_icon" src="img/loader.gif"/>';
	$('#' + id).find('.xbiodWidgetHeaderBar').append(icon);
}

xbiod.base.removeLoaderIcon = function(id) {
	$('#' + id).find('.loader_icon').remove();
}

xbiod.base.addCount = function(id, count){
	$('#' + id).find('.xbiodWidgetHeaderCount').html(' (' + count + ')');
}

xbiod.base.removeCount = function(id){
	$('#' + id).find('.xbiodWidgetHeaderCount').html('');
}

// Creates an xbiod widget window that will hold any arbitary xbiod content
xbiod.base.createWidget = function(name, container_id, options) {
	var nameNoSpaces;
	// Process optional parameters
	if (!name) {
		name = 'Default';
		nameNoSpaces = name;
	} else {
		// Remove any white space a user could have input in the name (eg "Included..Taxa"). Prevents jQuery from reading the ID incorrectly.
		nameNoSpaces = name.replace(/ /g, '');
	}
	if (!container_id) {
		container_id = 'document';
	}
	if (!options) {
		options = {};
	}
	if (options.header == undefined){
		options.header = xbiod.base.widget_options.header;
	}
	if (options.resizable == undefined){
		options.resizable = xbiod.base.widget_options.resizable;
	}
	if(options.initial_height == undefined){
		options.initial_height = xbiod.base.widget_options.initial_height;
	}
	if (options.handles == undefined){
		options.handles = xbiod.base.widget_options.handles;
	}
	if (options.animate == undefined){
		options.animate = xbiod.base.widget_options.animate;
	}
	if (options.start == undefined){
		options.start = xbiod.base.widget_options.start;
	}
	if (options.visual == undefined){
		options.visual = 'N';
	}
	if (options.no_overflow == undefined){
		options.no_overflow = 'N';
	}

	var ids; // object containing widget id and content id
	var widget; // the jquery object that gets appended to document
	var widgetID; // widget id
	var contentId; // content id (may be undefined if double frame is used)
	var widgetHTML = xbiod.base.widget_html.replace(/%TITLE%/g, name); // replace title of HTML template

	// Replacing the widget HTML template with appropriate data.
	widget = $(widgetHTML.replace(/%NAME%/g, nameNoSpaces).replace(/%HEADER%/g, options.header));

	// Adding widget attributes
	widget.data('pagination', false);
	widget.data('num_pages', 0);

	if (options.start == 'closed'){
		widget.data('open', false);
	} else {
		widget.data('open', true);
	}

	//adding widget
	$(container_id).append(widget);

	widgetId = xbiod.base.widget_id_default.replace(/%NAME%/g, nameNoSpaces);
	contentId = nameNoSpaces + "-content";
	ids = {widget_id: widgetId, content_id: contentId};

	xbiod.base.baseMenu(widgetId, contentId, options); // every widget gets base menu items

	if (options.visual == 'N'){
		xbiod.base.textualMenu(widgetId, contentId, options); // text based widgets get text specific menu items
	}

	if (options.no_overflow == 'Y') {
		$('#' + contentId).addClass('no-overflow');
	}

	/*
	 * controlWidget sets up all jQuery events. It must receive the IDs of the widget and the content
	 */
	xbiod.base.controlWidget(widgetId, contentId, options);
	return ids;
}

// Helper function. Reports whether or not scroll bars are present
$.fn.hasScrollBar = function() {
	var hasScrollBar = {}, e = this.get(0);
	hasScrollBar.vertical = (e.scrollHeight > e.clientHeight) ? true : false;
	hasScrollBar.horizontal = (e.scrollWidth > e.clientWidth) ? true : false;
	return hasScrollBar;
}

$.Animation.prefilter(function(element, properties, options){
	if (options.overrideOverflow){
		$(element).css('overflow', options.overrideOverflow)
	}
});

xbiod.base.controlWidget = function (widgetId, contentId, options) {
	var widget = $('#' + widgetId);
	var content = $('#' + contentId);

	// Control initial height
	if (options.start == 'closed'){
		content.css('max-height', '0px');
	} else {
		content.css('max-height', options.initial_height);
	}

	// Getting exact min height for the widget (window height - content height)
	if(xbiod.base.widget_min_height == 0){
		var min_height = xbiod.utils.pixelsToInt(widget.css('height')) - xbiod.utils.pixelsToInt(content.css('height'));
		xbiod.base.widget_min_height = min_height;
	}

	// Checking if user enabled resizing */
	if (options.resizable == 'Y') {
		widget.resizable({
			alsoResize: '#' + contentId, // also resize the content with the window
			disabled: true, // disable by default until a user hovers over
			minHeight: xbiod.base.widget_min_height, //min height of resize
			handles: options.handles, // specify which handles can be resized. Defaults to 's' to limit user control over webpage structure
			resize: function (event, ui) { // resize callback
				if ($(this).height() < xbiod.base.widget_min_height + 20){
					content.css('overflow', 'hidden'); // hide scroll bars
				} else {
					content.css('overflow', 'auto'); // reset scroll bars
				}

				// Checking if this is not a map widget, and the widget does not have a vertical scroll bar. This prevents a user from resizing the content if there is no more data to show.
				if (options.map != 'Y' && !content.hasScrollBar().vertical){
					$( this ).resizable('option', 'maxHeight', ui.size.height); // set max height to current height to disable resize
				} else {
					$( this ).resizable('option', 'maxHeight', $(this).parent().height()); // set max height to container
				}

				// Checking if content has been resized to closed position
				//if ($('#' + contentId).position().top >= $('#' + widgetId + ' .xbiodWidgetFooter').position().top){
				//	$('#' + contentId).css('height', '1px'); // prevents miscalculated JQuery overflow
				//}
			}
		});

		// Performance is increased by disabling the resizable widgets when the user isn't interacting with them
		// Binding mouseenter event to enable widget resize
		widget.mouseenter(function(){
			$(this).resizable("option", "disabled", false);
		});

		// Binding mouseleave event to disable widget resize
		widget.mouseleave(function(e){
			$(this).resizable("option", "disabled", true).removeClass('ui-state-disabled'); //<-- prevent JQuery css
		});
	}

	/* 	CONTROLLING THE MENU */

	/* Binding click event to menu button */
	widget.find(".xbiodWidgetMenuButton").click(function(e) {
		widget.find('.xbiodWidgetMenu').toggle();
		return false;
	});

	// don't toggle widget on menu button clicks
	widget.find(".xbiodWidgetMenuButton").dblclick(function(e) {
		e.stopPropagation();
	});

	widget.find(".xbiodWidgetMenu").dblclick(function(e) {
		e.stopPropagation();
	});

	/* Closing the Menu on click off */
	$(document).mouseup(function (e) {
		var menu = widget.find(".xbiodWidgetMenu");
		var button = widget.find(".xbiodWidgetMenuButton");
		if (menu.is(":visible")  // if the menu is open
			&& !button.is(e.target) // if the target of the click isn't the menu button...
			&& button.has(e.target).length === 0 // ... nor a descendant of the button
			&& !menu.is(e.target) // if the target of the click isn't the menu itself...
			&& menu.has(e.target).length === 0) { // ... nor a descendant of the menu
			menu.fadeOut(100);
		}
	});

	// Bind double click event to header
	widget.find(".xbiodWidgetHeader").dblclick(function(e){
		if (widget.data('open')){ // check if widget is roughly open
			xbiod.base.closeWidget(widgetId, contentId, options);
		} else {
			xbiod.base.openWidget(widgetId, contentId, options);
		}
	});
};

// Open widget
xbiod.base.openWidget = function(widget_id, content_id, options){
	var widget = $('#' + widget_id);
	var content = $('#' + content_id);

	//Checking if user enabled animations
	if (options.animate == 'Y') {
		content.animate({
			maxHeight: options.initial_height
		}, 'fast');
	} else { // no animate
		content.css('max-height', options.initial_height); // widget setter
	}

	// Controlling content
	if (options.no_overflow == 'N'){
		content.css('overflow', 'auto');
	}

	// show pagination
	if (widget.data('pagination')){
		xbiod.base.showPagination(widget_id);
	}

	widget.data('open', true);

	// Update menu item button
	//$('#' + widget_id).find('span.collapseMenuButton').text('Collapse');
}

// Close widget
xbiod.base.closeWidget = function (widget_id, content_id, options){
	var widget = $('#' + widget_id);
	var content = $('#' + content_id);
	// Checking if user enabled animations
	if (options.animate == 'Y') {
		content.animate({ // animate content
			maxHeight: '0px'
		}, 'fast');
	} else { // no animate
		content.css('max-height', '0px'); // content setter
	}

	// controlling content
	if (options.no_overflow == 'N'){
		content.css('overflow', 'auto');
	}

	// hide pagination
	if (widget.data('pagination')){
		xbiod.base.hidePagination(widget_id);
	}

	widget.data('open', false);

	// Updating menu item button
	//$('#' + widget_id).find('span.collapseMenuButton').text('Open');
}

xbiod.base.removeMenuItem = function(widget_id){
	var menu_content = $('#' + widget_id).find('.xbiodWidgetMenuList');
	for (var i = 1; i < arguments.length; i++){
		var menu_item_class = arguments[i];
		var menu_item = menu_content.find('.' + menu_item_class);
		menu_item.remove();
	}
}

// Temporary fix; removes all default menu items
xbiod.base.emptyMenu = function(widget_id){
	var menu_content = $('#' + widget_id).find('.xbiodWidgetMenuList');
	// Clearing default list from menu
	menu_content.empty();
}

// Default menu creation for a widget
xbiod.base.baseMenu = function(widget_id, content_id, options){
	xbiod.utils.populateMenu(widget_id, xbiod.base.menu_button_collapse);

	xbiod.utils.registerMenuEventHandler(widget_id, '.collapseMenuButton', 'click', function(){
			if ($('#' + widget_id).data('open')){ // check if widget is open
				xbiod.base.closeWidget(widget_id, content_id, options);
			} else {
				xbiod.base.openWidget(widget_id, content_id, options);
			}
		}
	);
};

// Helper function for adding additional menu items for non-visual widgets
xbiod.base.textualMenu = function (widget_id, content_id, options){
	xbiod.utils.populateMenu(widget_id, xbiod.base.menu_button_refresh, xbiod.base.menu_option_font);

	xbiod.utils.registerMenuEventHandler(widget_id, '.minusMenuButton', 'click',
		function(){
			var size = $('#' + content_id).css('font-size').split('px')[0];
			var sizeInt = parseInt(size) - 1;
			if (sizeInt >= 8){
				$('#' + content_id).css('font-size', sizeInt + 'px');
			}
		}
	);

	xbiod.utils.registerMenuEventHandler(widget_id, '.plusMenuButton', 'click',
		function(){
			var size = $('#' + content_id).css('font-size').split('px')[0];
			var sizeInt = parseInt(size) + 1;
			if (sizeInt <= 18){
				$('#' + content_id).css('font-size', sizeInt + 'px');
			}
		}
	);

	// refresh button gets registered on widget load
}

// Helper function to populate menu with menu options (checkboxes, buttons, radio buttons)
// Does not register events for these options
xbiod.base.addMenuItem = function(widget_id){
	if (Object.prototype.toString.call(arguments[1]) === '[object Array]'){
		var checkboxes = arguments[1];
		checkboxes.forEach(function(item, i, array){
			xbiod.utils.populateMenu(widget_id, item);
		});
	} else {
		for (var i = 1; i < arguments.length; i++){
			xbiod.utils.populateMenu(widget_id, arguments[i]);
		}
	}
}

// Populates menu with page navigation controls. Registers events for these controls.
xbiod.base.addMenuPagination = function(widget_id){
	xbiod.utils.populateMenu(widget_id, xbiod.base.menu_option_page);

	xbiod.utils.registerMenuEventHandler(widget_id, '.pageRightMenuButton', 'click',
		function(){
			// handle next page
			var widget = $('#' + widget_id);
			var curr_page = widget.data("page_num");
			var max_page = widget.data("num_pages");
			if (curr_page < max_page){
				xbiod.utils.cyclePagination(widget_id, curr_page + 1);
			}
		}
	);

	xbiod.utils.registerMenuEventHandler(widget_id, '.pageLeftMenuButton', 'click',
		function(){
			// handle previous page
			var widget = $('#' + widget_id);
			var curr_page = widget.data("page_num");
			if (curr_page > 1){
				xbiod.utils.cyclePagination(widget_id, curr_page - 1);
			}
		}
	);
}

// Remove page navigation controls from menu.
xbiod.base.removeMenuPagination = function(widget_id){
	xbiod.base.removeMenuItem(widget_id, 'menuContentPage');
}

// Init pagination. Sets default values for pagination first, then updates these values appropriately based on the number of pages generated.
xbiod.base.setPagination = function(widget_id, content_length, page_size){
	var widget = $('#' + widget_id);

	widget.data('page_size', (page_size || xbiod.base.page_size));
	// Calculate # of pages
	var num_pages = Math.ceil(content_length / widget.data('page_size'));
	// set # of pages
	widget.data('num_pages', num_pages);

	if (num_pages > 1){
		// Set starting page to 1
		widget.data('page_num', 1);
		// Add page nav to menu
		xbiod.base.addMenuPagination(widget_id);
		// Enable pagination
		widget.data('pagination', true);
		// Empty current contents
		widget.find('.paginationPages').empty();
		for (var i = 1; i <= num_pages && i <= 5; i++){
			var current_page = xbiod.base.pagination_item.replace('%PAGENUM%', i);
			if (i === 1){
				current_page = current_page.replace('%SELECT_CLASS%', 'current-page');
			}
			widget.find('.paginationPages').append(current_page);
		}
	} else {
		// set starting page to either 0 or 1
		widget.data('page_num', num_pages);
	}
}

// Show the pagination bar and menu buttons when appropriate
xbiod.base.showPagination = function(widget_id){
	var widget = $('#' + widget_id);
	var pagination = widget.find('.xbiodWidgetPagination');
	var buttons = pagination.find('.paginationButton');
	var left_pagination_button = pagination.find('.left');
	var right_pagination_button = pagination.find('.right');
	var menu_list = widget.find(".xbiodWidgetMenuList");
	var left_menu_button = menu_list.find(".pageLeftMenuButton");
	var right_menu_button = menu_list.find(".pageRightMenuButton");
	var current_page = widget.data('page_num');
	var last_page = widget.data('num_pages');

	// Handle disabled page nav buttons
	// Remove any disabled buttons
	left_pagination_button.removeClass('disabled');
	right_pagination_button.removeClass('disabled');
	left_menu_button.removeClass('disabled');
	right_menu_button.removeClass('disabled');

	// Disable buttons based on current page
	if (current_page === 1){
		left_pagination_button.addClass('disabled');
		left_menu_button.addClass('disabled');
	} else if (current_page === last_page){
		right_pagination_button.addClass('disabled');
		right_menu_button.addClass('disabled');
	}

	pagination.show();

	buttons.bind('click', function(){
		if ($(this).hasClass('right')){
			xbiod.base.controlPagination(widget_id, 0);
		}
		else if ($(this).hasClass('left')){
			xbiod.base.controlPagination(widget_id, -1);
		} else {
			var value = parseInt($(this).text());
			xbiod.base.controlPagination(widget_id, value);
		}
	});
}

// Hide pagination bar and menu buttons when appropriate
xbiod.base.hidePagination = function(widget_id){
	var pagination = $('#' + widget_id).find('.xbiodWidgetPagination');
	pagination.hide();
	pagination.find('.paginationButton').unbind('click');
}

/* Controls flow of pagination, taking the page to switch to or special values for right and left button presses
 * Example call to page left: xbiod.base.controlPagination('your-widget-id', -1);
 * Example call to page right: xbiod.base.controlPagination('your-widget-id', 0);
 * Exaple call to arbitrary page: xbiod.base.controlPagination(widget_id, 5);
 */
xbiod.base.controlPagination = function(widget_id, value){
	var widget = $('#' + widget_id);

	if (value === -1){
		// handle previous page
		 var curr_page = widget.data("page_num");
		 if (curr_page > 1){
		 	xbiod.utils.cyclePagination(widget_id, curr_page - 1);
		 }
	} else if (value === 0){
		// handle next page
		var curr_page = widget.data("page_num");
		var max_page = widget.data("num_pages");
		if (curr_page < max_page){
			xbiod.utils.cyclePagination(widget_id, curr_page + 1);
		}
	} else {
		// handle page number
		xbiod.utils.cyclePagination(widget_id, value);
	}
}

/*
 * Binds a callback for an event to a menu item
 */
xbiod.utils.registerMenuEventHandler = function(widget_id, menu_item, event, handler){
	var item = $('#' + widget_id).find(menu_item);
	item.bind(event, handler)
}

/* Changes the page
 * This method assumes the page you pass is a valid page number
 */
xbiod.utils.cyclePagination = function(widget_id, next_page){
	var widget = $('#' + widget_id);
	var table = widget.find('.xbiodContentTable');
	var tbody = table.find('tbody');

	tbody.empty();
	var table_elements = widget.data('tableElements');
	var start = (next_page - 1) * widget.data('page_size');//xbiod.base.page_size;
	var end = next_page * widget.data('page_size');//xbiod.base.page_size;
	for (var i = start; i < end && i < table_elements.length; i++){
		var table_element = table_elements[i];
		tbody.append(table_element.html);
	}

	xbiod.base.hidePagination(widget_id);
	widget.find('.paginationPages').empty();

	var first = next_page - 2;
	var last = next_page + 2;
	var num_pages = widget.data('num_pages');

	if (num_pages <= 5){
		first = 1;
		last = num_pages;
	} else if (next_page === 1 || next_page === 2) {
		first = 1;
		last = 5;
	} else if (next_page === num_pages || next_page === num_pages - 1){
		first = num_pages - 4;
		last = num_pages;
	}

	for (var i = first; i <= num_pages && i <= last; i++){
		var current_page = xbiod.base.pagination_item.replace('%PAGENUM%', i);
		if (i === next_page){
			current_page = current_page.replace('%SELECT_CLASS%', 'current-page');
		}
		widget.find('.paginationPages').append(current_page);
	}

	// Store the current page number
	widget.data("page_num", next_page);
	xbiod.base.showPagination(widget_id);
}


/*
 * Adds 1 to many items to the  menu that belongs to the specified widget_id
 */
xbiod.utils.populateMenu = function(widget_id){
	var menu_content = $('#' + widget_id).find('.xbiodWidgetMenuList');

	for (var i = 1; i < arguments.length; i++){
		var menu_item = arguments[i];
		if (typeof menu_item == 'string' || menu_item instanceof String) {
			// enclose menu item in list items tags if they aren't present
			menu_item = menu_item.indexOf('<li') >= 0 ? menu_item : '<li>' + menu_item + '</li>';
		}
		menu_content.prepend(menu_item);
	}
}

// Helper function. Get integers from pixel values
// "600px" => 600
xbiod.utils.pixelsToInt = function (str){
	if (typeof str !== 'string') {
		return str;
	} else {
		var strings = str.split('px');
		return parseInt(strings[0]);
	}
}

 // Helper function. Adds commas for thousands separation
String.prototype.addCommas = function() {
	return this.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
