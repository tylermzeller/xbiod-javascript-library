/*////////////////////////////////////////////////////////////////////////
Copyright (c) 2015-2016, The Ohio State University
All rights reserved.

Created by Joe Cora & Tyler Zeller
Last revised on 25 November 2016 (TZ)


Requires: jQuery 1.8+
          Google Maps API v3 (if mapping used)

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

// AGENT CLASS SETUP

// Define person class
xbiod.agent = function(options) {
	// Setup class variables
};

// AGENT CLASS METHODS
xbiod.agent.prototype.showAgentInfo = function(element_id, agent_id, options) {
	// Check require parameters (element_id and agent_id)
	if (element_id && agent_id) {
		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
		if (options.format == undefined){
			options.format = 'jsonp'
		}

		// Create widget
		var widget = xbiod.base.createWidget("Agent Info", '#' + element_id, options.widget_options);
		var widget_id = widget.widget_id;
		var content_id = widget.content_id;

		// Add loading icon
		xbiod.base.addLoaderIcon(widget_id);

		// Send OJ_Break request
		xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getAgentInfo', {agent_id:agent_id, version:2, format:options.format}, 'content_request', true, function(jData) {
			// Check if request was successful
			if (jData.code == 100) {
				// Process all of the taxa
				var result = [];
				var agent = jData.data;

				result.push('<div class="xbiodPersonContentWrapper"><div class="xbiodPersonContentHeader">');

				if (agent.image) {
					result.push('<img class="img-circle" src="', agent.image, '"/>');
				}

				result.push('<div class="xbiodPersonName">', agent.first_name, ' ', agent.last_name, '</div>'); //xbiodPersonName

				if (agent.synonyms.length > 0){
					result.push('<div class="xbiodPersonSubname">Also as: <span class="xbiodPersonSyn">', agent.synonyms[0].first_name, ' ', agent.synonyms[0].last_name, '</span></div>'); // syn name
				}

				result.push('<div class="xbiodPersonSubname">', agent.title, '</div>', '</div>');

				result.push('<div class="xbiodPersonContentBody">');
				result.push('<br><div class="xbiodPersonSectionHeader">Contact Info</div>'); // Section Header
				result.push('<div class="xbiodPersonSectionBody">Address: ', agent.contact.address.full_address, '<br>');
				result.push('Telephone: ', agent.contact.phone, '<br>');
				result.push('Fax: ', agent.contact.fax, '<br>');
				result.push('Email: ', agent.contact.email, '<br>', '</div>');
				result.push('Web Site: <a title="Visit Agent Web Site" href="', agent.contact.web, '">', agent.contact.web, '</a><br>');

				if (agent.bio) {
					result.push('<br><div class="xbiodPersonSectionHeader">Mini Biography</div>'); // Section Header
					result.push('<div class="xbiodPersonSectionBody">', agent.bio, '</div>'); // Section body
				}

				result.push('<div class="xbiodPersonSectionHeader">Agent Stats</div>'); // Section Header
				result.push('<div class="xbiodPersonSectionBody"># Publications: ', String(agent.stats.num_pubs).addCommas(), '<br>');
				result.push('# Specimens Collected: ', String(agent.stats.num_spms).addCommas(), '<br>');
				result.push('# Collecting Events: ', String(agent.stats.num_coll_events).addCommas(), '<br>', '</div>', '</div>', '</div>');

				xbiod.base.removeLoaderIcon(widget_id);

				// Show the literature
				$('#' + content_id).html(result.join(''));
			} else {
				xbiod.base.showAPIResponseError(jData.code);
			}
		});
	} else {
		xbiod.base.showParameterError('showAgentInfo', 'agent');
	}
};

xbiod.agent.prototype.showPublications = function(element_id, agent_id, options) {
	// Check require parameters (element_id and agent_id)
	if (element_id && agent_id) {
		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.limit == undefined){
			options.limit = 50;
		}
		if (options.offset == undefined){
			options.offset = 0;
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
    if (options.widget_options == undefined){
			options.widget_options = {};
		}
    if (options.format == undefined){
			options.format = 'jsonp';
		}

		var widget = xbiod.base.createWidget("Publications", '#' + element_id, options.widget_options);
		var widget_id = widget.widget_id;
		var content_id = widget.content_id;

		// Add loading icon
		xbiod.base.addLoaderIcon(widget_id);

		// Send OJ_Break request
		xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getAgentLiterature', {agent_id:agent_id, offset:options.offset, limit:options.limit, version:2, format:options.format}, 'content_request', true, function(jData) {
			// Check if request was successful
			if (jData.code == 100) {
				// Process all of the taxa
				var result = [];
				var literature = jData.data.literature;

				// Sort the literature
				literature.sort(xbiod.base.sortLit);

				// Loop until all literature citations are added
				literature.forEach(function(lit_ref, i, array){
					result.push(xbiod.base.formatContentData(xbiod.base.formatReference(lit_ref, 1)));
				});

				xbiod.base.removeLoaderIcon(widget_id);

				// Show the literature
				$('#' + content_id).html(result.join(''));
			} else {
				xbiod.base.showAPIResponseError(jData.code);
			}
		});
	} else {
		xbiod.base.showParameterError('showPublications', 'agent');
	}
};

/* Need to add locality info for the markers (on click) */
xbiod.agent.prototype.showAgentOccurrences = function(element_id, agent_id, options) {
	// Check require parameters (element_id and agent_id)
	if (element_id && agent_id) {
		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.info_element_id == undefined){
			options.info_element_id = element_id;
		}
		if (options.generalFormat == undefined){
			options.generalFormat = xbiod.base.general_format_default;
		}
		if (options.markers == undefined){
			options.markers = '';
		}
		if (options.offset == undefined){
			options.offset = 0;
		}
		if (options.limit == undefined){
			options.limit = 50;
		}
		if (options.icons == undefined){
			options.icons = xbiod.base.icons;
		} else {
			if (options.icons.point == undefined){
				options.icons.point = xbiod.base.icons.point;
			} else {
				if (options.icons.point.vouchered == undefined){
					options.icons.point.vouchered = xbiod.base.icons.point.vouchered;
				}
				if (options.icons.point.unvouchered == undefined){
					options.icons.point.unvouchered = xbiod.base.icons.point.unvouchered;
				}
			}
			if (options.icons.polygon == undefined){
				options.icons.polygon = xbiod.base.icons.polygon;
			} else {
				if (options.icons.polygon.vouchered == undefined){
					options.icons.polygon.vouchered = xbiod.base.icons.polygon.vouchered;
				}
				if (options.icons.polygon.unvouchered == undefined){
					options.icons.polygon.unvouchered = xbiod.base.icons.polygon.unvouchered;
				}
			}
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
		if (options.widget_options.visual == undefined){
			options.widget_options.visual = 'Y';
		}
		if (options.info_widget_options == undefined){
			options.info_widget_options = {};
		}
    if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Creating widget
		var widget = xbiod.base.createWidget("Agent Occurrences", '#' + element_id, options.widget_options);
		var widget_id = widget.widget_id;
		var content_id = widget.content_id;

		// Add loading icon
		xbiod.base.addLoaderIcon(widget_id);

		// Send OJ_Break request
		xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getAgentOccurrences', {agent_id:agent_id, version:2, offset:options.offset, limit:options.limit, basic_only:'N', format:options.format}, 'content_request', true, function(jData) {
			// Check if request was successful
			if (jData.code == 100) {
				var occurrences = jData.data.occurrences;
				xbiod.agent.prototype.showAgentOccurrencesInfo(options.info_element_id, occurrences, options.info_widget_options);

				// Setup map variables
				var mapOptions = {
					zoom: 1,
					center: new google.maps.LatLng(0, 0),
					mapTypeControlOptions: {
						mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN],
						style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
					},
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};

				// Creating a marker listener for a map marker click event
				var createListener = function (marker, loc_id) {
					google.maps.event.addListener(marker, "click", function () {
						// xbiod call. Will populate right section of xbiod window.
						//xbiod.agent.prototype.showAgentOccurrenceLocalityInfo(right_content_id, loc_id);
					});
					return marker;
				}

				// Setup map
				var gMap = new google.maps.Map(document.getElementById(content_id), mapOptions);

				// Setup the markers
				var pt_icon = new google.maps.MarkerImage(options.icons.point.vouchered);
				var poly_icon = new google.maps.MarkerImage(options.icons.polygon.vouchered);
				var pt_unv_icon = new google.maps.MarkerImage(options.icons.point.unvouchered);
				var poly_unv_icon = new google.maps.MarkerImage(options.icons.polygon.unvouchered);
				var marker;
				var marker_position;
				var marker_icon;

				if (options.markers == 'spiderfy'){
					// Spiderfier
					var oms = new OverlappingMarkerSpiderfier(gMap);
					oms.addListener('click', function(marker, event){
						// DO SOMETHING ON CLICK EVENT
					});
				}

				// Loop until all occurrences are added. NOTE: The table and table data are being loading into a separate xbiod window.
				for (var i = 0; i < occurrences.length; i++) {
					var occurrence = occurrences[i];

					// Markers get added to the Google Map
					// Check on locality source type (vouchered or unvouchered record)
					if (occurrence.source == 'unvouchered' || occurrence.source == 'unvouchered (collection)') {
						// Check on locality type
						if (occurrence.type == 'point') {
							marker_icon = pt_unv_icon;
						} else {
							marker_icon = poly_unv_icon;
						}
					} else {
						if (occurrence.type == 'point') {
							marker_icon = pt_icon;
						} else {
							marker_icon = poly_icon;
						}
					}
					// Create marker coords
					marker_position = new google.maps.LatLng(occurrence.locality.coords.lat, occurrence.locality.coords.lng);
					// Create marker
					marker = new google.maps.Marker({map: gMap, position: marker_position, icon: marker_icon, title: occurrence.locality.loc_name, optimized: false}); // optimized = true has known bugs
					// Checking if user specified marker spiderfier
					if (options.markers.toLowerCase() == 'spiderfy'){
						oms.addMarker(marker);
					} else {
						createListener(marker, occurrence.locality.loc_id);
					}
				}

				// Resize map
				$('#' + widget.widget_id).resize(function(){
					google.maps.event.trigger(gMap, 'resize');
				});

				$('#' + widget.widget_id + " .xbiodWidgetFooter" ).dblclick(function(){
					google.maps.event.trigger(gMap, 'resize');
				});

				xbiod.base.removeLoaderIcon(widget_id);
			} else {
				xbiod.base.showAPIResponseError(jData.code);
			}
		});
	} else {
		xbiod.base.showParameterError('showAgentOccurrences', 'agent');
	}
};

xbiod.agent.prototype.showAgentOccurrencesInfo = function(element_id, occurrences, widget_options) {
	// Check require parameters (element_id and agent_id)
	if (element_id && occurrences) {
		// Process optional parameters
		if (widget_options == undefined){
			widget_options = {};
		}

		// Creating widget
		var widget = xbiod.base.createWidget("Agent Occurrences Info", '#' + element_id, widget_options);
		var widget_id = widget.widget_id;
		var content_id = widget.content_id;

		// Add loading icon
		xbiod.base.addLoaderIcon(widget_id);

		// Store occurrences in DOM
		var tableElements = [];
		occurrences.sort(sortBy('occurrence_id', false, function(a){return a.toLowerCase()})); // intial sort

		var table = xbiod.base.formatBaseTable('Specimen Id', 'Institution', 'Taxonomy', 'Valid Name', 'Locality', 'Collection Date', 'Collector'); // creating table
		xbiod.base.addTableEvents(table);
		var tbody = $(table).find('tbody');

		// Loop until all occurrences are added. NOTE: The table and table data are being loading into a separate xbiod window.
		occurrences.forEach(function(occurrence, i, array){
			var formatted_occurrence_id = xbiod.base.formatLink('id', occurrence.occurrence_id, occurrence.occurrence_id, xbiod.base.paths.occurrence_path);
			var formatted_institution = xbiod.base.formatLink('id', occurrence.institution.inst_id, occurrence.institution.inst_code, xbiod.base.paths.agent_path);
			var formatted_valid_name = (occurrence.valid_taxon) ? xbiod.base.formatLink('id', occurrence.valid_taxon.tnuid, occurrence.valid_taxon.taxon, xbiod.base.paths.taxon_path) : '';
			var formatted_taxon = xbiod.base.formatLink('id', occurrence.determinations[0].taxon.tnuid, occurrence.determinations[0].taxon.taxon, xbiod.base.paths.taxon_path) + ' ' + occurrence.determinations[0].taxon.taxon_author;
			var formatted_collector = xbiod.base.formatLink('id', occurrence.collector.agent_id, occurrence.collector.agent_name, xbiod.base.paths.agent_path);
			var formatted_locality = xbiod.base.formatLink('loc_id', occurrence.locality.loc_id, occurrence.locality.loc_name);

			var tableElement = xbiod.base.createTableElement(table, occurrence.occurrence_id, occurrence.institution.inst_code, occurrence.determinations[0].taxon.taxon, occurrence.valid_name ? occurrence.valid_name.taxon : '', occurrence.locality.loc_name, occurrence.coll_date.coll_date_sortable, occurrence.collector.agent_name);
			tableElement.html = xbiod.base.formatTableData(formatted_occurrence_id, formatted_institution, formatted_taxon, formatted_valid_name, formatted_locality, occurrence.coll_date.coll_date, formatted_collector);
			tableElements.push(tableElement);
			tbody.append(tableElement.html);
		});

		// Store data on DOM
		$(table).data('tableElements', tableElements);
		//remove loader icon
		xbiod.base.removeLoaderIcon(widget_id);
		// Append table to content
		$('#' + content_id).append(table);
	} else {
		xbiod.base.showParameterError('showAgentOccurrencesInfo', 'agent');
	}
};


xbiod.agent.prototype.showAgentOccurrenceLocalityInfo = function(element_id, loc_id, options) {
	// Check require parameters (element_id & loc_id)
	if (element_id && loc_id) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.generalFormat == undefined) {
			options.generalFormat = xbiod.base.general_format_default;
		}
    if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Send OJ_Break request
		xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getLocalityInfo', {loc_id: loc_id, version:2, format: options.format}, 'content_request', true, function(jData) {
			// Check if request was successful
			if (jData.code == 100) {
				// Process all of the info
				var locality = jData.data;
				var result = [];
				// Locality Name
				result.push(xbiod.base.formatInvertedTable('Locality Name', locality.loc_name));

				// Coords
				var lat='', lng='';
				// Format coords (no negative coordinates and add degrees)
					// Format latitude
				if(locality.coords.lat >= 0) {
					lat = locality.coords.lat + '&deg;N';
				} else {
					lat = (locality.coords.lat * -1) + '&deg;S';
				}
					// Format Longitude
				if (locality.coords.lng >= 0){
					lng = locality.coords.lng + '&deg;E';
				} else {
					lng = (locality.coords.lng * -1) + '&deg;W';
				}
				result.push(xbiod.base.formatInvertedTable('Coords', [lat, ' ', lng, ' (', locality.coords.loc_source, ')'].join('')));

				// Locality Hierarchy
				var pol0='', pol1='', pol2='', pol4='';
				// Get place hierarchy if present and format appropriately
					// Format country
				if (locality.hier.pol0) {
					pol0 = xbiod.base.formatLink('place_id', locality.hier.pol0.place_id, locality.hier.pol0.place_name) + ' (' + locality.hier.pol0.place_type + ')';
				}
					// Format state (or similar)
				if (locality.hier.pol1) {
					pol1 = xbiod.base.formatLink('place_id', locality.hier.pol1.place_id, locality.hier.pol1.place_name) + ' (' + locality.hier.pol1.place_type + ')';
				}
					// Format county (or similar)
				if (locality.hier.pol2) {
					pol2 = xbiod.base.formatLink('place_id', locality.hier.pol2.place_id, locality.hier.pol2.place_name) + ' (' + locality.hier.pol2.place_type + ')';
				}
					// Format town (or similar)
				if (locality.hier.pol4) {
					pol4 = xbiod.base.formatLink('place_id', locality.hier.pol4.place_id, locality.hier.pol4.place_name) + ' (' + locality.hier.pol4.place_type + ')';
				}
				// Add Country
				result.push(xbiod.base.formatInvertedTable('Country', pol0));
				// Add State
				result.push(xbiod.base.formatInvertedTable('State', pol1));
				// Add County
				result.push(xbiod.base.formatInvertedTable('County', pol2));
				// Add Town
				result.push(xbiod.base.formatInvertedTable('Town', pol4));

				// Show the locality
				$('#' + element_id + ' .xbiodWidgetSectionContent').html(xbiod.base.formatTable(result.join('')));
			} else {
				xbiod.base.showAPIResponseError(jData.code);
			}
		});
	} else {
		xbiod.base.showParameterError('showAgentOccurrenceLocalityInfo', 'agent');
	}
};

xbiod.agent.prototype.showDescribedTaxa = function(element_id, agent_id, options) {
	// Check require parameters (element_id and author_id)
	if (element_id && agent_id) {
		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.taxonFormat == undefined){
			options.taxonFormat = xbiod.base.default_taxon_format;
		}
		if (options.useTaxonItalics == undefined){
			options.useTaxonItalics = true;
		}
		if (options.limit == undefined){
			options.limit = 50;
		}
		if (options.offset == undefined){
			options.offset = 0;
		}
		if (options.row_count == undefined){
			options.row_count = 3;
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
    if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Creating widget frame
		var widget = xbiod.base.createWidget("Agent Described Taxa", '#' + element_id, options.widget_options);
		var widget_id = widget.widget_id;
		var content_id = widget.content_id;

		// Add loading icon
		xbiod.base.addLoaderIcon(widget_id);

		// Send OJ_Break request
		xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getAgentTaxa', {agent_id:agent_id, version: 2, limit:options.limit, offset:options.offset, format:options.format}, 'content_request', true, function(jData) {
			// Check if request was successful
			if (jData.code == 100) {
				// Process all of the taxa
				var table = xbiod.base.formatBaseTable();
				var tbody = $(table).find('tbody');

				var taxa = jData.data.taxa;
				taxa.sort(xbiod.base.sortTaxa); //initial sort

				var taxa_array = [];

				// Loop until all described taxa are added
				for (var i = 0; i < taxa.length; i++) {
					var taxon = taxa[i];
					var formattedTaxon = xbiod.base.formatLink('id', taxon.tnuid, taxon.taxon, xbiod.base.paths.taxon_path);

					taxa_array.push(formattedTaxon);

					if (taxa_array.length == options.row_count){
						var tableRow = xbiod.base.formatTableData(taxa_array); // creating table row
						$(tbody).append(tableRow); // adding row to table body
						taxa_array.length = 0;
					}
				}
				// Checks to see if a row was incomplete after the loop
				if (taxa_array.length > 0){
					var tableRow = xbiod.base.formatTableData(taxa_array); // creating table row
					$(tbody).append(tableRow); // adding row to table body
					taxa_array.length = 0; // erase array
				}

				// Remove loading icon
				xbiod.base.removeLoaderIcon(widget_id);
				// Show the images
				$('#' + content_id).append(table);
				// Add table events
				xbiod.base.addTableEvents(table);
			} else {
				xbiod.base.showAPIResponseError(jData.code);
			}
		});
	} else {
		xbiod.base.showParameterError('showDescribedTaxa', 'agent');
	}
};

// At this point, the namespace has been loaded
xbiod.base.loaded.agent = true;
