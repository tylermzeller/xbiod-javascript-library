/*////////////////////////////////////////////////////////////////////////
Copyright (c) 2014-2016, The Ohio State University
All rights reserved.

Created by Joe Cora & Tyler Zeller
Last revised on 6 January 2016 (TZ)

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

// INITIALIZATION

// Setup namespace
var xbiod = xbiod || {};
xbiod.base = xbiod.base || {};

// SEARCH CLASS SETUP

// Define search class
xbiod.search = function(options) {
	// Setup class variables

	// Current the search ID from the current millseconds since javascript epoch
	var dateCurrent = new Date();

	this.search_id = dateCurrent.getTime();
}

// SEARCH CLASS METHODS
xbiod.search.prototype.showSearch = function (element_id, options) {
	if (element_id) {
		// Process optional parameters
		if (!options){
			options = {};
		}
		if (options.domains == undefined){
			options.domains = [];
			options.domains[0] = {type: '', handler_url: ''};
		}
		if (options.search_type == undefined){
			options.search_type = 'ID';
		}
		if (options.offset == undefined){
			options.offset = 0;
		}
		if (options.limit == undefined){
			options.limit = 30;
		}
		if (options.basic_only == undefined){
			options.basic_only = 'Y';
		}
		if (options.inst_id == undefined){
			options.inst_id = '';
		}
		if (options.case_sensitive == undefined){
			options.case_sensitive = 'Y'
		}
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Setup search box autocomplete
		var input = $('<input>', {
			id: 'xbiodSearchID' + this.search_id,
			class: 'xbiodSearch',
			placeholder: 'Search'
		}).appendTo('#' + element_id);

		// JQuery Autocomplete controller
		$(input).autocomplete({
			search: function (event, ui){
				$('.search-button-content').addClass('pulse');
			},
			response: function (event, ui){
				$('.search-button-content').removeClass('pulse');
			},
			source: function (request, response) {
				getSources(request, response, options);
			},
			minLength: 3,
			select: function(event, ui) {
				event.preventDefault();
				this.value = ui.item.label;
				window.location.href = [window.location.origin, ui.item.handler_url, '?id=', ui.item.value].join("");
			},

			focus: function(event, ui) {
				event.preventDefault();
				this.value = ui.item.label;
			},

			_renderItem: function(ul, item) {
					return $('<li>' + item.label + '</li>').appendTo(ul);
				}
		});

	} else {
		xbiod.base.showParameterError('showSearch', 'search');
	}
};

/*
 * Helper function. Gets cooresponding object identifier from domain name
 */
function getTypeIdentifier(domain){
	if (domain == 'taxa'){
		return 'TAXON';
	} else if (domain == 'occurrences'){
		return 'OCCURRENCE';
	} else if (domain == 'agents'){
		return 'AGENT';
	} else if (domain == 'institutions'){
		return 'INSTITUTION';
	} else if (domain == 'journals'){
		return 'JOURNALS';
	} else if (domain == 'places'){
		return 'PLACE';
	} else if (domain == 'localities'){
		return 'LOCALITY';
	}
};

/*
 * Helper function. Looks for the handler url given to options.domain.
 */
function getHandlerURL(domain, options){
	for (var i = 0; i < options.domains.length; i++){
		var url = '#';
		if (options.domains[i].type.toUpperCase() == domain.toUpperCase()){
			url = options.domains[i].handler_url;
			break;
		}
	}
	return url;
}

/*
 * Helper function. calls the JQuery autocomplete 'response' callback
 */
var getSources = function(request, response, options) {
	// Function variables
	var searchData = []; // searchData array will hold coalsced data from API
	var domains_builder = [];

	// Formatting the domains parameter for API call.
	options.domains.forEach(function(elm, i, array){
		domains_builder.push(elm.type.toUpperCase());
	});

	var formatted_domains = domains_builder.join('+');

	// API request with customized parameters from above
	xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getSearchResults', {search:'%' + request.term + '%', domains:formatted_domains, limit:options.limit, offset:options.offset, basic_only:options.basic_only, case_sensitive:options.case_sensitive, inst_id:options.inst_id, version:2, format:options.format}, 'text_search', true, function(jData) {
		var results = jData.data;
		// Getting returned result objects (e.g. taxon_results object, occurrence_results object, etc.)
		for (var result in results){
			if (result == 'count'){
				break;
			}
			// Accessing the domain object in the result object (e.g. taxa object in taxon_results, occurrences object in occurrence_results, etc.)
			for (var domain in results[result]){
				if (domain == 'count' || results[result].count == 0){
					break;
				}
				// Getting the cooresponding domain keyword from the domain object ("key") string (e.g. TAXON from taxa, OCCURRENCE from occurrences, etc.)
				var type = getTypeIdentifier(domain);
				var size = searchData.length;
				// Getting the handler url for the type
				var handler_url = getHandlerURL(type, options);

				// Looping through each of the returned results for a domain
				for (var element in results[result][domain]){
					var keyNum = parseInt(element, 10);
					// Checking if the element from returned data is a number
					if(!isNaN(keyNum)){
						keyNum = keyNum + size; // Add size of searchData object to keyNum to properly append new keys
						var item = results[result][domain][element];
						// Adding custom properties to the object in searchData array
						searchData[keyNum] = {};
						//searchData[keyNum]['domain'] = type;
						searchData[keyNum]['handler_url'] = handler_url;
						switch(type){
							case 'TAXON': {
								searchData[keyNum]['value'] = item.tnuid;
								searchData[keyNum]['label'] = item.taxon;
								break;
							}
							case 'OCCURRENCE': {
								searchData[keyNum]['value'] = item.occurrence_id;
								searchData[keyNum]['label'] = item.occurrence_id;
								break;
							}
							case 'AGENT': {
								searchData[keyNum]['value'] = item.agent_id;
								searchData[keyNum]['label'] = item.agent_name;
								break;
							}
							case 'INSTITUTION': {
								searchData[keyNum]['value'] = item.inst_id;
								searchData[keyNum]['label'] = item.inst_name;
								break;
							}
							case 'JOURNAL': {
								searchData[keyNum]['value'] = item.journal_id;
								searchData[keyNum]['label'] = item.journal_name;
								break;
							}
							case 'LOCALITY': {
								searchData[keyNum]['value'] = item.loc_id;
								searchData[keyNum]['label'] = item.loc_name;
								break;
							}
							case 'PLACE': {
								searchData[keyNum]['value'] = item.place_id;
								searchData[keyNum]['label'] = item.place_name;
								break;
							}
							default: {
								searchData[keyNum]['value'] = '';
								searchData[keyNum]['label'] = '';
								break;
							}
						}
					}
				}
			}
		}
		// Response callback with searchData object
		response(searchData);
	});
};

// At this point, the namespace has been loaded
xbiod.base.loaded.search = true;
