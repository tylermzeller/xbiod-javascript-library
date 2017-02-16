/*////////////////////////////////////////////////////////////////////////
Copyright (c) 2015-2016, The Ohio State University
All rights reserved.

Created by Joe Cora & Tyler Zeller
Last revised on 25 January 2016 (TZ)


Requires: jQuery 1.8+

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

// OCCURRENCE CLASS SETUP

// Define occurrence class
xbiod.occurrence = function(options) {
	// Setup class variables
};

// RECORD CLASS METHODS

// **Updated for OJ_Break V2**
xbiod.occurrence.prototype.showLocalityInfo = function(element_id, occurrence_id, options) {
	// Check require parameters (element_id and cuid)
	if (element_id && occurrence_id) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.localityFormat == undefined) {
			options.localityFormat = '%loc_name%';
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
    if (options.format == undefined){
			options.format = 'jsonp';
		}

		var widget = xbiod.base.createWidget("Locality Info", '#' + element_id, options.widget_options);
		var widget_id = widget.widget_id;
		var content_id = widget.content_id;

		// Add loading icon
		xbiod.base.addLoaderIcon(widget_id);

		// Send OJ_Break request
		xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getOccurrenceInfo', {occurrence_id:occurrence_id, version:2, format:options.format}, 'content_request', true, function(jData) {
			// Check if request was successful
			if (jData.code == 100) {
				// Process all of the info
				var data = jData.data;
				var locality = data.locality;
				var resultHTML = '';

				// Locality Name
				resultHTML += xbiod.base.formatInvertedTable('Locality Name', locality.loc_name);

				// Coords
				var lat = '', lng = '';
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
				resultHTML += xbiod.base.formatInvertedTable('Coords', lat + ' ' + lng + ' (' + locality.coords.loc_source + ')');

				// Elevation
				var elev='', max_elev='';
				// Format the elevation (add units if present)
					// Format elevation
				if (locality.elev){
					elev = locality.elev + 'm';
				} else {
					elev = '';
				}
					//Format max elevation
				if (locality.max_elev) {
					max_elev = '- ' + locality.max_elev + 'm (max)';
				} else {
					max_elev = '';
				}
				if (elev || max_elev){
					resultHTML += xbiod.base.formatInvertedTable('Elevation', elev + ' ' + max_elev);
				}
				
				// Locality Hierarchy
				var pol0='', pol1='', pol2='', pol4='';
				// Get place hierarchy if present and format appropriately
					// Format country
				if (locality.hier.pol0) {
					pol0 = '<a href="?id=' + locality.hier.pol0.place_id + '">' + locality.hier.pol0.place_name + '</a> (' + locality.hier.pol0.place_type + ')';
					// Add country
					resultHTML += xbiod.base.formatInvertedTable('Country', pol0);
				}
					// Format state (or similar)
				if (locality.hier.pol1) {
					pol1 = '<a href="?id=' + locality.hier.pol1.place_id + '">' + locality.hier.pol1.place_name + '</a> (' + locality.hier.pol1.place_type + ')';
					// Add State
					resultHTML += xbiod.base.formatInvertedTable('State', pol1);
				}
					// Format county (or similar)
				if (locality.hier.pol2) {
					pol2 = '<a href="?id=' + locality.hier.pol2.place_id + '">' + locality.hier.pol2.place_name + '</a> (' + locality.hier.pol2.place_type + ')';
					// Add County
					resultHTML += xbiod.base.formatInvertedTable('County', pol2);
				}
					// Format town (or similar)
				if (locality.hier.pol4) {
					pol4 = '<a href="?id=' + locality.hier.pol4.place_id + '">' + locality.hier.pol4.place_name + '</a> (' + locality.hier.pol4.place_type + ')';
					// Add Town
					resultHTML += xbiod.base.formatInvertedTable('Town', pol4);
				}

				if(locality.loc_type){
					// Add Comments
					resultHTML += xbiod.base.formatInvertedTable('Comments', locality.loc_comments);
				}
				if(locality.loc_comments){
					// Add Comments
					resultHTML += xbiod.base.formatInvertedTable('Comments', locality.loc_comments);
				}
				
				// Format Table
				resultHTML = xbiod.base.formatTable(resultHTML);

				xbiod.base.removeLoaderIcon(widget_id);

				// Show the locality info
				$('#' + content_id).html(resultHTML);
			} else {
				xbiod.base.showAPIResponseError(jData.code);
			}
		});
	} else {
		xbiod.base.showParameterError('showLocalityInfo', 'occurrence');
	}
};

// **Updated for OJ_Break V2**
xbiod.occurrence.prototype.showOccurrenceInfo = function(element_id, occurrence_id, options) {
	// Check require parameters (element_id and occurrence_id)
	if (element_id && occurrence_id) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.generalFormat == undefined) {
			options.generalFormat = xbiod.base.general_format_default;
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
    if (options.format == undefined){
			options.format = 'jsonp';
		}

		var widget = xbiod.base.createWidget("Occurrence Info", '#' + element_id, options.widget_options);
		var widget_id = widget.widget_id;
		var content_id = widget.content_id;

		// Add loading icon
		xbiod.base.addLoaderIcon(widget_id);

		// Send OJ_Break request
		xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getOccurrenceInfo', {occurrence_id:occurrence_id, version: 2, format:options.format}, 'content_request', true, function(jData) {
			// Check if request was successful
			if (jData.code == 100) {
				// Process all of the taxa
				var data = jData.data;
				var agent_name = '';
				var resultHTML = '';
				// Formatting collector(s) name(s)
				if (!data.collector.person){
					agent_name = data.collector.agent_name;
				} else {
					// Loop until all info is added
					for (var i = 0; i < data.collector.people.length; i++) {
						var collector = data.collector.people[i];

						// Add a comma for every collector besides the first and last, and an ampersand for the last
						if (i > 0 && i < data.collector.people.length - 1) {
							agent_name += ', ';
						} else if (i > 0) {
							agent_name += ' & ';
						}

						// Add link to collector reference page and last name of collector
						agent_name += collector.last_name;

						// Check if collector has initials
						if (collector.initials) {
							agent_name += ', ' + collector.initials;
						}

						// Add link to collector reference page
						agent_name += '<span class="smallText"> (<a href=?agent_id=' + collector.agent_id + '" title="Go to the extended information page for collector">' + (i + 1) + '</a>)</span>';
					}
				}
				// Date
				resultHTML += xbiod.base.formatInvertedTable('Date', data.coll_date.coll_date);
				// Collector
				resultHTML += xbiod.base.formatInvertedTable('Collector(s)', agent_name);
				// Collecting Method
				resultHTML += xbiod.base.formatInvertedTable('Collecting Method', data.coll_method);
				// Field Code
				resultHTML += xbiod.base.formatInvertedTable('Field Code', data.field_code);
				// Format Table
				resultHTML = xbiod.base.formatTable(resultHTML);

				xbiod.base.removeLoaderIcon(widget_id);

				// Show the trips
				$('#' + content_id).html(resultHTML);
			} else {
				xbiod.base.showAPIResponseError(jData.code);
			}
		});
	} else {
		xbiod.base.showParameterError('showCollectingTripInfo', 'occurrence');
	}
};

// **Updated for OJ_Break V2**
xbiod.occurrence.prototype.showDeterminations = function(element_id, occurrence_id, options) {
	// Check require parameters (element_id and cuid)
	if (element_id && occurrence_id) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.generalFormat == undefined) {
			options.generalFormat = xbiod.base.general_format_default;
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
    if (options.format == undefined){
			options.format = 'jsonp';
		}

		var widget = xbiod.base.createWidget("Determinations", '#' + element_id, options.widget_options);
		var widget_id = widget.widget_id;
		var content_id = widget.content_id;

		// Add loading icon
		xbiod.base.addLoaderIcon(widget_id);

		// Send OJ_Break request
		xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getOccurrenceInfo', {occurrence_id:occurrence_id, version:2, format:options.format}, 'content_request', true, function(jData) {
			// Check if request was successful
			if (jData.code == 100) {
				// Process all of the determinations
				var determinations = jData.data.determinations;
				var resultHTML = '';

				// Loop until all determinations are added
				for (var i = 0; i < determinations.length; i++) {
					var determination = determinations[i];
					// Separate multiple determinations
					if (i > 0) {
						resultHTML += '<hr>';
					}

					// Identified As
					resultHTML += xbiod.base.formatInvertedTable('Identified As', xbiod.base.formatLink('id', determination.taxon.tnuid, determination.taxon.taxon, xbiod.base.paths.taxon_path) + ' ' + determination.taxon.taxon_author);
					// Determined By
					resultHTML += xbiod.base.formatInvertedTable('Determined By', determination.determiner.agent_name);
					// Date of Determination
					resultHTML += xbiod.base.formatInvertedTable('Date of Determination', determination.det_date);
					// Determination Status
					resultHTML += xbiod.base.formatInvertedTable('Determination Status', determination.det_status);
				}

				resultHTML = xbiod.base.formatTable(resultHTML);

				xbiod.base.removeLoaderIcon(widget_id);
				// Show the determinations
				$('#' + content_id).html(resultHTML);
			} else {
				xbiod.base.showAPIResponseError(jData.code);
			}
		});
	} else {
		xbiod.base.showParameterError('showDeterminations', 'occurrence');
	}
};

// **Updated for OJ_Break v2**
xbiod.occurrence.prototype.showBiologicalInfo = function(element_id, occurrence_id, options) {
	// Check require parameters (element_id and occurrence_id)
	if (element_id && occurrence_id) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.generalFormat == undefined) {
			options.generalFormat = xbiod.base.general_format_default;
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
    if (options.format == undefined){
			options.format = 'jsonp';
		}

		var widget = xbiod.base.createWidget("Biological Info", '#' + element_id, options.widget_options);
		var widget_id = widget.widget_id;
		var content_id = widget.content_id;

		// Add loading icon
		xbiod.base.addLoaderIcon(widget_id);

		// Send OJ_Break request
		xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getOccurrenceInfo', {occurrence_id:occurrence_id, version:2, format:options.format}, 'content_request', true, function(jData) {
			// Check if request was successful
			if (jData.code == 100) {
				// Process all of the info
				var habitat = jData.data.habitat;
				var associations = jData.data.associations;
				var formattedAssociations = [];
				var resultHTML = '';
				// Loop until all associations added
				associations.forEach(function(assoc, i, array){
					var formatted_taxon = [xbiod.base.formatLink('id', assoc.determination.taxon.tnuid, assoc.determination.taxon.taxon, xbiod.base.paths.taxon_path), assoc.determination.taxon.taxon_author].join(' ');
					var formatted_occurrence = [assoc.assoc_type, ' [', xbiod.base.formatLink('id', assoc.occurrence_id, assoc.occurrence_id, xbiod.base.paths.occurrence_path), ']'].join('');
					var formatted_assoc = [formatted_taxon, formatted_occurrence].join(': ');

					// add all included associations
					formattedAssociations.push(formatted_assoc);
				});

				resultHTML += xbiod.base.formatInvertedTable('Habitat', habitat, 'Association(s)', formattedAssociations.join(', '));
				resultHTML = xbiod.base.formatTable(resultHTML);

				xbiod.base.removeLoaderIcon(widget_id);
				// Show the biological info
				$('#' + content_id).html(resultHTML);
			} else {
				xbiod.base.showAPIResponseError(jData.code);
			}
		});
	} else {
		xbiod.base.showParameterError('showBiologicalInfo', 'occurrence');
	}
};

// **Updated for OJ_Break v2**
xbiod.occurrence.prototype.showSpecimenInfo = function(element_id, occurrence_id, options) {
	// Check require parameters (element_id and occurrence_id)
	if (element_id && occurrence_id) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.generalFormat == undefined) {
			options.generalFormat = xbiod.base.general_format_default;
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
    if (options.format == undefined){
			options.format = 'jsonp';
		}

		var widget = xbiod.base.createWidget("Specimen Info", '#' + element_id, options.widget_options);
		var widget_id = widget.widget_id;
		var content_id = widget.content_id;

		// Add loading icon
		xbiod.base.addLoaderIcon(widget_id);

		// Send OJ_Break request
		xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getOccurrenceInfo', {occurrence_id:occurrence_id, version:2, format:options.format}, 'content_request', true, function(jData) {
			// Check if request was successful
			if (jData.code == 100) {
				// Process all of the info
				var resultHTML = '';
				var data = jData.data;

				// Format alternate ids
				var alt_ids;
				if (data.alt_ids.length > 0) {
					// Loop until all IDs added
					for (var i = 0; i < spmInfo.alt_ids.length; i++) {
						var id = data.alt_ids[i];
						// separate multiple alt_ids
						if (i > 0) {
							alt_ids += ', ';
						}
						alt_ids += id; //  add all alt_ids
					}
				} else {
					alt_ids = 'None Available';
				}

				// Alternate Ids
				resultHTML += xbiod.base.formatInvertedTable('Alternate Ids', alt_ids);

				// if there are multiple spm records, then format specimen info section for Specimen Groups
				if (data.spm_groups.length > 1) {
					var occurrenceInfo = '';
					// Loop until all specimen groups added
					for (var i = 0; i < data.spm_groups.length; i++) {
						var spm = data.spm_groups[i];

						// Separate multiple specimen groups
						if (i > 0) {
							occurrenceInfo += '; ';
						}

						// Format preparations
						var prepType = '';
						for (var j = 0; j < spm.preparations.length; j++){
							var preparation = spm.preparations[j];

							if (j > 0) {
								prepType += ', ';
							}

							if (preparation.num_preps > 1) {
								prepType += preparation.num_preps + '-';
							}

							if (preparation.prep_contents.length > 0) {
								prepType += preparation.prep_contents + ' within ';
							}
							prepType += preparation.prep_type;
						}
						occurrenceInfo += spm.spm_num + '-' + spm.spm_sex + ' (' + spm.life_status +') / ' + prepType;
					}
					// Add Specimen Groups to the table
					resultHTML += xbiod.base.formatInvertedTable('Specimen Groups', occurrenceInfo);
				// If not multiple records, format for standard specimen info section
				} else {
					var spm = data.spm_groups[0];

					// Specimen sex
					resultHTML += xbiod.base.formatInvertedTable('Specimen Sex', spm.spm_sex);
					//Num Specimens
					resultHTML += xbiod.base.formatInvertedTable('Number of Specimens', spm.num_spms);
					// Life Status
					resultHTML += xbiod.base.formatInvertedTable('Life Status', spm.life_status);

					// Looping until all preparations formatted appropriately
					var prepInfo = '';
					for (var i = 0; i < spm.preparations.length; i++) {
						var preparation = preparations[i];

						// Separate multiple preparations
						if (i > 0) {
							prepInfo += ', ';
						}

						if (preparation.num_preps > 1) {
							prepInfo += preparation.num_preps + '-';
						}

						if (preparation.prep_contents.length > 0) {
							prepInfo += preparation.prep_contents + ' within ';
						}

						prepInfo += preparation.prep_type;
					}
					// Add Preparations to table
					resultHTML += xbiod.base.formatInvertedTable('Preparation(s)', prepInfo);
				}
				// Add Deposited In to table
				resultHTML += xbiod.base.formatInvertedTable('Deposited In', '<a href="?id=' + data.institution.inst_id + '">' + data.institution.inst_name + '</a> (' + data.institution.inst_code + ')');
				// Add Comments to table
				resultHTML += xbiod.base.formatInvertedTable('Comments', data.comments);
				// Add Entered By to table
				resultHTML += xbiod.base.formatInvertedTable('Entered By', ((data.enterer) ? data.enterer:'Not specified'));
				// Finish formatting the inverted table
				resultHTML = xbiod.base.formatTable(resultHTML);

				xbiod.base.removeLoaderIcon(widget_id);
				// Append the table to the content
				$('#' + content_id).html(resultHTML);
			} else {
				xbiod.base.showAPIResponseError(jData.code);
			}
		});
	} else {
		xbiod.base.showParameterError('showSpecimenInfo', 'occurrence');
	}
};

// At this point, the namespace has been loaded
xbiod.base.loaded.occurrence = true;
