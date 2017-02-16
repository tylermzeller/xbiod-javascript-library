/*////////////////////////////////////////////////////////////////////////
Copyright (c) 2014-2016, The Ohio State University
All rights reserved.

Created by Joe Cora & Tyler Zeller
Last revised on 7 January 2016 (TZ)


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

// TAXON CLASS SETUP

// Define taxon class
xbiod.taxon = function(options) {
	// Setup class variables
};

// TAXON CLASS METHODS

// **Updated for OJ_Break V2 with sorting**
// *************** NOTICE *******************
// showIncludedTaxa (the below function) is heavily commented.
// This is because most of the documentation for this function applies
// to most other functions in this class.

xbiod.taxon.prototype.showIncludedTaxa = function(element_id, tnuid, options) {
	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.inst_id == undefined) {
			options.inst_id = "";
		}
		if (options.show_syns == undefined) {
			options.show_syns = 'N';
		}
		if (options.show_fossils == undefined) {
			options.show_fossils = 'Y';
		}
		if (options.types_only == undefined) {
			options.types_only = 'N';
		}
		if (options.taxonFormat == undefined) {
			options.taxonFormat = xbiod.base.taxon_format_default;
		}
		if (options.useTaxonItalics == undefined) {
			options.useTaxonItalics = true;
		}
		if (options.limit == undefined){
			options.limit = "";
		}
		if (options.offset == undefined){
			options.offset = 0;
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Create widget (takes name, container ID, and widget options as parameters. Returns ids of widget itself and widget's content element)
		var widget_ids = xbiod.base.createWidget("Included Taxa", '#' + element_id, options.widget_options);
		// Get content_id to append data to content
		var widget_id = widget_ids.widget_id;
		var content_id = widget_ids.content_id;

		// array of menu items
		var check_box_array = [];

		// creating each menu item, one per option (takes menu item label, item name, and initial checked conditions as parameters. Returns value that addMenuItem function can handle)
		var fossil_checkbox = xbiod.base.menu_item.checkbox("Show Fossils", "show_fossils", options.show_fossils == 'Y' ? 'checked="checked"' : '');
		var syns_checkbox = xbiod.base.menu_item.checkbox("Show Synonyms", "show_syns", options.show_syns == 'Y' ? 'checked="checked"' : '');
		var types_checkbox = xbiod.base.menu_item.checkbox("Types Only", "types_only", options.types_only == 'Y' ? 'checked="checked"' : '');

		// add menu items to array
		check_box_array.push(fossil_checkbox, syns_checkbox, types_checkbox);

		// add array of menu items to menu (via addMenuItem function. addMenuItem can also take each item individually)
		xbiod.base.addMenuItem(widget_id, check_box_array);

		// Construct a new load callback function. Called directly after its declaration and whenever a user reload a widget.
		xbiod.taxon.prototype.loadIncludedTaxa = function(options) {
			var widget = $('#' + widget_id);
			var content = $('#' + content_id);

			// set widget init state
			resetWidget(widget_id, content_id);

			// set pagination init state
			resetPagination(widget_id);

			// Send OJ_Break request
			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonIncludedTaxa', {tnuid:tnuid, inst_id:options.inst_id, show_syns:options.show_syns, show_fossils: options.show_fossils, types_only: options.types_only, version: 2, limit: options.limit, offset: options.offset, format: options.format}, 'content_request', true, function(jData) {
				// Check if request was successful
				if (jData.code == 100) {

					var tableElements = []; // Create array to hold table row data
					var included_taxa = jData.data.includedTaxa; // xbiod database data

					// Add number of records returned to widget header
					xbiod.base.addCount(widget_id, included_taxa.length);

					// Sort the returned data based on the taxon name
					included_taxa.sort(sortBy('taxon', false, function(a){return a.toLowerCase()})); // intial sort

					// Create content table with appropriate headers
					var table = xbiod.base.formatBaseTable('Taxon', 'Status', 'Valid');
					// get tbody object for appending data to table
					var tbody = table.find('tbody');

					// close widget if there are no records to show
					if (included_taxa.length == 0){
						xbiod.base.closeWidget(widget_id, content_id, options.widget_options);
					}

					// Inits pagination. If pagination exists, resets all pagination defaults (no menu nav, hides pagination bar, sets number of pages)
					xbiod.base.setPagination(widget_id, included_taxa.length, 15);

					// Loop through all included taxa
					included_taxa.forEach(function(taxon, i, array){
						var formattedTaxon = xbiod.base.formatLink('id', taxon.tnuid, taxon.taxon, xbiod.base.paths.taxon_path) + ' ' + taxon.taxon_author; // format taxon name

						// using correct icon for valid marker
						var valid_marker = xbiod.base.icons.affirmative;
						if (taxon.valid == 'N'){
							valid_marker = xbiod.base.icons.negative;
						}

						// Create a table element object that stores all data that a row could be sorted by
						var tableElement = xbiod.base.createTableElement(table, taxon.taxon, taxon.status, taxon.valid); // this will be added to an array
						// Format the table element HTML for how the row will be presented; not sorted.
						tableElement.html = xbiod.base.formatTableData(formattedTaxon, taxon.status, valid_marker + '.class=bool'); // this will be appended to the table
						// Add table element to tableElements array
						tableElements.push(tableElement);

						// Checking if page size limit reached
						if (i < widget.data('page_size')){
							// Append table element HTML to tbody object until page limit reached
							tbody.append(tableElement.html);
						}
					});

					finishWidget(widget_id, content_id, table, tableElements);

					// If there is pagination (more data than can fit in one page) and widget is open, then show pagination bar
					if (widget.data('pagination')){
						if (widget.data('open')){ // check if widget is open
							xbiod.base.showPagination(widget_id);
						} else { // don't show pagination if the widget is in closed state
							xbiod.base.hidePagination(widget_id);
						}
					}
				} else {
					xbiod.base.showAPIResponseError(jData.code);
					xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
				}
			});
		}
		// Registers all event listeners on the widget and calls the load function.
		registerMenuAndLoad(widget_id, xbiod.taxon.prototype.loadIncludedTaxa, options);

	} else {
		xbiod.base.showParameterError('showIncludedTaxa', 'taxon');
		xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
	}
};

// **Updated for OJ_Break V2 with sorting**
xbiod.taxon.prototype.showSynonyms = function(element_id, tnuid, options) {
	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.show_fossils == undefined) {
			options.show_fossils = 'Y';
		}
		if (options.taxonFormat == undefined) {
			options.taxonFormat = xbiod.base.taxon_format_default;
		}
		if (options.useTaxonItalics == undefined) {
			options.useTaxonItalics = true;
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
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Create widget
		var widget_ids = xbiod.base.createWidget('Synonyms', '#' + element_id, options.widget_options);
		// Get content_id to append data to content
		var widget_id = widget_ids.widget_id;
		var content_id = widget_ids.content_id;

		// creating each menu item, one per option
		var fossil_checkbox = xbiod.base.menu_item.checkbox("Show Fossils", "show_fossils", options.show_fossils == 'Y' ? 'checked="checked"' : '');

		// add array of menu items to menu
		xbiod.base.addMenuItem(widget_id, fossil_checkbox);

		xbiod.taxon.prototype.loadSynonyms = function(options){
			var widget = $('#' + widget_id);
			var content = $('#' + content_id);

			// set widget init state
			resetWidget(widget_id, content_id);

			// set pagination init state
			resetPagination(widget_id);

			// Send OJ_Break request
			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonSynonyms', {tnuid:tnuid, show_fossils:options.show_fossils, version:2, limit:options.limit, offset:options.offset, format:options.format}, 'content_request', true, function(jData) {

				// Check if request was successful
				if (jData.code == 100) {

					// Create array to hold table row data
					var tableElements = [];
					var synonyms = jData.data.synonyms;

					// Add count of records returned
					xbiod.base.addCount(widget_id, synonyms.length);

					synonyms.sort(sortBy('taxon', false, function(a){return a.toLowerCase()})); // intial sort

					// Create table with appropriate headers
					var table = xbiod.base.formatBaseTable('Taxon', 'Status', 'Relationship Type');
					// get tbody object for appending data to table
					var tbody = table.find('tbody');

					if (synonyms.length == 0){
						xbiod.base.closeWidget(widget_id, content_id, options.widget_options);
					}
					// Set pagination defaults for this widget
					xbiod.base.setPagination(widget_id, synonyms.length);

					// Loop through all synonyms
					synonyms.forEach(function(syn, i, array){
						var formattedSyn = xbiod.base.formatLink('id', syn.tnuid, syn.taxon, xbiod.base.paths.taxon_path) + ' ' + syn.taxon_author; // format syn name

						// Create a table element object that stores all data that it could be sorted by.
						var tableElement = xbiod.base.createTableElement(table, syn.taxon, syn.status, syn.rel_type); // this will be added to the array
						// Format the table element HTML for how the row will be presented; not sorted.
						tableElement.html = xbiod.base.formatTableData(formattedSyn, syn.status, syn.rel_type); // this will be appended to the table
						// Add table element to tableElements array.
						tableElements.push(tableElement);

						// Checking if page size limit reached
						if (i < xbiod.base.page_size){
							// Append table element HTML to tbody object until page limit reached
							tbody.append(tableElement.html);
						}
					});

					finishWidget(widget_id, content_id, table, tableElements);

					if (widget.data('pagination')){
						if (widget.data('open')){ // check if widget is open
							xbiod.base.showPagination(widget_id);
						} else {
							xbiod.base.hidePagination(widget_id);
						}
					}
				} else {
					// An error occurred
					xbiod.base.showAPIResponseError(jData.code);
					xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
				}
			});
		}

		registerMenuAndLoad(widget_id, xbiod.taxon.prototype.loadSynonyms, options);

	} else {
		// An error occurred.
		xbiod.base.showParameterError('showSynonyms', 'taxon');
		xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
	}
};

// **Updated for OJ_Break V2 with sorting**
xbiod.taxon.prototype.showInstitutions = function(element_id, tnuid, options) {
	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.institutionFormat == undefined) {
			options.institutionFormat = xbiod.base.general_format_default;
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
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Create widget
		var widget_ids = xbiod.base.createWidget("Institutions", '#' + element_id, options.widget_options);
		// Get content_id to append data to content
		var widget_id = widget_ids.widget_id;
		var content_id = widget_ids.content_id;

		xbiod.taxon.prototype.loadInstitutions = function(options){
			var widget = $('#' + widget_id);
			var content = $('#' + content_id);

			// set widget init state
			resetWidget(widget_id, content_id);

			// set pagination init state
			resetPagination(widget_id);

			// Send OJ_Break request
			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonInstitutions', {tnuid:tnuid, limit:options.limit, offset:options.offset, version:2, format:options.format}, 'content_request', true, function(jData) {
				// Check if request was successful
				if (jData.code == 100) {

					// Create array to hold table row data
					var tableElements = [];
					var insts = jData.data.occurrences;

					// Add count of records returned
					xbiod.base.addCount(widget_id, insts.length);

					insts.sort(sortBy('inst_name', false, function(a){return a.toLowerCase()})); // intial sort

					// Create table with appropriate headers
					var table = xbiod.base.formatBaseTable('Institution', 'Code', 'Vouchered');
					// get tbody object for appending data to table
					var tbody = table.find('tbody');

					if (insts.length == 0){
						xbiod.base.closeWidget(widget_id, content_id, options.widget_options);
					}

					// Intialize pagination for this widget
					xbiod.base.setPagination(widget_id, insts.length);

					// Loop until all included taxa added to table body
					insts.forEach(function(inst, i, array){
						var formattedInst = xbiod.base.formatLink('id', inst.inst_id, inst.inst_name, xbiod.base.paths.agent_path); // format inst name

						// using correct icon for vouchered records
						var vouchered_marker = xbiod.base.icons.affirmative;
						if (inst.vouchered == 'N'){
							vouchered_marker = xbiod.base.icons.negative;
						}

						// Create a table element object that stores all data that it could be sorted by.
						var tableElement = xbiod.base.createTableElement(table, inst.inst_name, inst.inst_code, inst.vouchered); // this will be added to array
						// Format the table element HTML for how the row will be presented; not sorted.
						tableElement.html = xbiod.base.formatTableData(formattedInst, inst.inst_code, vouchered_marker + '.class=bool'); // this will be appended to table
						// Add table element to tableElements array.
						tableElements.push(tableElement);

						// Checking if page size limit reached
						if (i < xbiod.base.page_size){
							// Append table element HTML to tbody object until page limit reached
							tbody.append(tableElement.html);
						}
					});

					finishWidget(widget_id, content_id, table, tableElements);

					if (widget.data('pagination')){
						if (widget.data('open')){ // check if widget is open
							xbiod.base.showPagination(widget_id);
						} else {
							xbiod.base.hidePagination(widget_id);
						}
					}
				} else {
					// An error occurred.
					xbiod.base.showAPIResponseError(jData.code);
					xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
				}
			});
		}

		registerMenuAndLoad(widget_id, xbiod.taxon.prototype.loadInstitutions, options);
	} else {
		// An error occurred.
		xbiod.base.showParameterError('showInstitutions', 'taxon');
		xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
	}
};

// **Updated for OJ_Break V2**
xbiod.taxon.prototype.showHabitats = function(element_id, tnuid, options) {
	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.generalFormat == undefined) {
			options.generalFormat = xbiod.base.general_format_default;
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
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Create widget
		var widget_ids = xbiod.base.createWidget("Habitats", '#' + element_id, options.widget_options);
		// Get content_id to append data to content
		var widget_id = widget_ids.widget_id;
		var content_id = widget_ids.content_id;

		xbiod.taxon.prototype.loadHabitats = function(options){
			var widget = $('#' + widget_id);
			var content = $('#' + content_id);

			// set widget init state
			resetWidget(widget_id, content_id);

			// Send OJ_Break request
			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonHabitats', {tnuid:tnuid, offset:options.offset, limit:options.limit, version:2, format:options.format}, 'content_request', true, function(jData) {
				// Check if request was successful
				if (jData.code == 100) {
					// Process all of the habitats
					var habitat_builder = [];
					var habitats = jData.data.habitats;

					// Add count of records returned
					xbiod.base.addCount(widget_id, habitats.length);

					if (habitats.length == 0){
						xbiod.base.closeWidget(widget_id, content_id, options.widget_options);
					}

					// Loop until all returned habitats added
					habitats.forEach(function(habitat, i, array){
						habitat_builder.push(xbiod.base.formatContentData(xbiod.base.formatGeneralName(habitat, options.generalFormat)));
					});

					// Show the habitats
					xbiod.base.removeLoaderIcon(widget_id);
					content.html(habitat_builder.join(''));

				} else {
					xbiod.base.showAPIResponseError(jData.code);
					xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
				}
			});
		}

		registerMenuAndLoad(widget_id, xbiod.taxon.prototype.loadHabitats, options);

	} else {
		xbiod.base.showParameterError('showHabitats', 'taxon');
		xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
	}
};

/* ***Partially Updated for OJ_Break V2*** */
xbiod.taxon.prototype.showLiterature = function(element_id, tnuid, options) {

	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.show_children == undefined) {
			options.show_children = 'N';
		}
		if (options.show_bib == undefined){
			options.show_bib = 'N';
		}
		if (options.show_ann == undefined){
			options.show_ann = 'Y';
		}
		if (options.taxonFormat == undefined) {
			options.taxonFormat = xbiod.base.taxon_format_default;
		}
		if (options.useTaxonItalics == undefined) {
			options.useTaxonItalics = true;
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
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Create widget
		var widget_ids = xbiod.base.createWidget("Literature", '#' + element_id, options.widget_options);
		// Get widget_id to access widget menu
		var widget_id = widget_ids.widget_id;
		var content_id = widget_ids.content_id;

		// Populating menu with radio buttons for view types
		var annotated_radio = xbiod.base.menu_item.radio('Annotated View', 'show_ann', options.show_bib == 'N' ? 'checked="checked"' : '', 'lit');
		var bib_radio = xbiod.base.menu_item.radio('Bibliography View', 'show_bib', options.show_bib == 'Y' ? 'checked="checked"' : '', 'lit');

		var show_children_checkbox = xbiod.base.menu_item.checkbox('Show Children', 'show_children', options.show_children == 'Y' ? 'checked="checked"' : '');

		xbiod.base.addMenuItem(widget_id, annotated_radio, bib_radio, show_children_checkbox);

		xbiod.taxon.prototype.loadLiterature = function(options){
			var widget = $('#' + widget_id);
			var content = $('#' + content_id);

			// set widget init state
			resetWidget(widget_id, content_id);

			// Send OJ_Break request
			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonLiteratureCitations', {tnuid:tnuid, show_children: options.show_children, offset:options.offset, limit:options.limit, version:2, format:options.format}, 'content_request', true, function(jData) {
				// Check if request was successful
				if (jData.code == 100) {
					// Process all of the publications
					var pubs_builder = [];
					var pubs = jData.data.pub_citations;

					// Add count of records returned
					xbiod.base.addCount(widget_id, pubs.length);

					pubs.sort(xbiod.base.sortLit);

					if (pubs.length == 0){
						xbiod.base.closeWidget(widget_id, content_id, options.widget_options);
					}

					// Loop until all returned publication citations are added
					pubs.forEach(function(pub, i, array){
						if(options.show_bib == 'N') {
							// Manually format lit
							pubs_builder.push('<div class="xbiodContentData">', '<b>', pub.taxon.taxon, '</b> : ',
							pub.pub.pub_author.agent_name, ', ', pub.pub.pub_year, ': <a href="', pub.pages[0].page, '">', pub.pages[0].page, '</a>. ', pub.annotation, '</div>');
						} else if (options.show_bib == 'Y'){
							// Format bib
							pubs_builder.push(xbiod.base.formatContentData(xbiod.base.formatReference(pub.pub, 1)));
						}
					});

					// Show the literature
					xbiod.base.removeLoaderIcon(widget_id);

					content.html(pubs_builder.join(''));

				} else {
					xbiod.base.showAPIResponseError(jData.code);
					xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
				}
			});
		}

		registerMenuAndLoad(widget_id, xbiod.taxon.prototype.loadLiterature, options);

	} else {
		xbiod.base.showParameterError('showTaxonLit', 'taxon');
		xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
	}
};

 /* **Updated for OJ_Break v2** */
xbiod.taxon.prototype.showAssociations = function(element_id, tnuid, options) {
	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.basic_only == undefined) {
			options.basic_only = 'N';
		}
		if (options.taxonFormat == undefined) {
			options.taxonFormat = xbiod.base.taxon_format_default;
		}
		if (options.limit == undefined){
			options.limit = 10;
		}
		if (options.offset == undefined){
			options.offset = 0;
		}
		if (options.widget_options == undefined){
			options.widget_options = xbiod.base.widget_options;
		}
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Create widget
		var widget_ids = xbiod.base.createWidget("Associations", '#' + element_id, options.widget_options);
		// Get content_id to append data to content
		var widget_id = widget_ids.widget_id;
		var content_id = widget_ids.content_id;

		// Create menu item
		var basic_only_checkbox = xbiod.base.menu_item.checkbox('Basic Only', 'basic_only', options.basic_only == 'Y' ? 'checked="checked"' : '');

		// Add menu item
		xbiod.base.addMenuItem(widget_id, basic_only_checkbox);

		xbiod.taxon.prototype.loadAssociations = function(options){
			var widget = $('#' + widget_id);
			var content = $('#' + content_id);

			// Set widget to init state
			resetWidget(widget_id, content_id);

			// Set pagination to init state
			resetPagination(widget_id);

			// Send OJ_Break request
			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonAssociations', {tnuid:tnuid, offset: options.offset, limit:options.limit, basic_only:options.basic_only, version:2, format:options.format}, 'content_request', true, function(jData) {
				// Check if request was successful
				if (jData.code == 100) {

					// Formatting array of alternate ids into a single string
					var formatAssocIds = function (assoc){
						// Looping until all alt ids added for this association
						var formattedIds = [];
						for (var i = 0; i < assoc.assoc_occurrences.length && i < 10; i++){
							var id = assoc.assoc_occurrences[i].occurrence_id;
							formattedIds.push( xbiod.base.formatLink('id', id, id, xbiod.base.paths.occurrence_path) );
						}

						formattedIds = formattedIds.join(', ');
						if (assoc.assoc_occurrences.length > 10){
							formattedIds += '[...]'
						}
						return formattedIds;
					}

					// Create array to hold table row data
					var tableElements = [];
					var associations = jData.data.associations;

					// Add count of records returned
					xbiod.base.addCount(widget_id, associations.length);

					associations.sort(sortBy('assoc_taxon', false, function(a){return a.taxon;})); // initial sort

					// Create table with appropriate headers
					var table = xbiod.base.formatBaseTable('Taxon', 'Valid Name', 'Assocation Type', 'Taxonomic Hierarchy', 'Association IDs'); // creating the base table
					// get tbody object for appending data to table
					var tbody = table.find('tbody');

					if (associations.length == 0){
						xbiod.base.closeWidget(widget_id, content_id, options.widget_options);
					}

					// Intialize pagination for this widget
					xbiod.base.setPagination(widget_id, associations.length);

					// Loop until all included taxa added to table body
					associations.forEach(function(assoc, i, array){
						// Format various data fields
						var formattedHier = xbiod.base.formatTypeHierarchy(assoc.assoc_taxon.hier);
						var formattedIds = formatAssocIds(assoc);
						var formattedTaxon = xbiod.base.formatLink('id', assoc.assoc_taxon.tnuid, assoc.assoc_taxon.taxon, xbiod.base.paths.taxon_path);
						var formatted_valid_name = (assoc.assoc_taxon.valid_taxon) ? xbiod.base.formatLink('id', assoc.assoc_taxon.valid_taxon.tnuid, assoc.assoc_taxon.valid_taxon.taxon, xbiod.base.paths.taxon_path) : '';

						// Create a table element object that stores all data that it could be sorted by.
						var tableElement = xbiod.base.createTableElement(table, assoc.assoc_taxon.taxon, assoc.assoc_taxon.valid_taxon ? assoc.assoc_taxon.valid_taxon : '', assoc.assoc_type, assoc.assoc_taxon.hier.Order ? assoc.assoc_taxon.hier.Order.taxon : '', assoc.assoc_occurrences[0].occurrence_id); //
						// Format the table element HTML for how the row will be presented; not sorted.
						tableElement.html = xbiod.base.formatTableData(formattedTaxon, formatted_valid_name, assoc.assoc_type, formattedHier, formattedIds);
						// Add table element to tableElements array.
						tableElements.push(tableElement);

						// Checking if page size limit reached
						if (i < xbiod.base.page_size){
							// Append table element HTML to tbody object until page limit reached
							tbody.append(tableElement.html);
						}
					});

					finishWidget(widget_id, content_id, table, tableElements);

					if (widget.data('pagination')){
						if (widget.data('open')){ // check if widget is open
							xbiod.base.showPagination(widget_id);
						} else {
							xbiod.base.hidePagination(widget_id);
						}
					}
				} else {
					xbiod.base.showAPIResponseError(jData.code);
					xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
				}
			});
		}

		registerMenuAndLoad(widget_id, xbiod.taxon.prototype.loadAssociations, options);

	} else {
		xbiod.base.showParameterError('showAssociations', 'taxon');
		xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
	}
};

/* **Updated for OJ_Break v2 */
xbiod.taxon.prototype.showTaxonMedia = function(element_id, tnuid, options) {
	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.media_type == undefined){
			options.media_type = ''
		}
		if (options.inst_id == undefined){
			options.inst_id = 1;
		}
		if (options.mediaFormat == undefined) {
			options.mediaFormat = '';
		}
		if (options.useTaxonItalics == undefined) {
			options.useTaxonItalics = true;
		}
		if (options.limit == undefined){
			options.limit = 200;
		}
		if (options.offset == undefined){
			options.offset = 0;
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
		if (options.row_count == undefined){
			options.row_count = 5;
		}
		if (options.page_limit == undefined){ // to be used if there should be multiple pages of images
			options.page_limit = 25;
		}
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Create widget
		var widget_ids = xbiod.base.createWidget("Media", '#' + element_id, options.widget_options);
		// Get content_id to append data to content
		var widget_id = widget_ids.widget_id;
		var content_id = widget_ids.content_id;

		xbiod.taxon.prototype.loadMedia = function(options){
			var widget = $('#' + widget_id);
			var content = $('#' + content_id);

			// set widget init state
			resetWidget(widget_id, content_id);

			// Send OJ_Break request
			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonMedia', {tnuid:tnuid, media_type: options.media_type, inst_id: options.inst_id, offset:options.offset, limit:options.limit, version:2, format:options.format}, 'content_request', true, function(jData) {
				// Check if request was successful
				if (jData.code == 100) {
					// Create table with no headers
					var table = xbiod.base.formatBaseTable();
					// get tbody object for appending data to table
					var tbody = table.find('tbody');

					var media = jData.data.media;

					// Add count of records returned
					xbiod.base.addCount(widget_id, media.length);

					media.sort(xbiod.base.sortMedia); // sort

					if (media.length == 0){
						xbiod.base.closeWidget(widget_id, content_id, options.widget_options);
					}

					// How to load more images?
					// store either media array (of many images potentially) in table or store formatted html array (like in other widgets) and then add pages like in HOL, each with an options.page_limit

					// OR dont use page_limit and just reload more data with API call and specified offset = this.options.limit

					// Create array to hold table row image data
					var img_array = [];

					// Loop until all images are added
					media.forEach(function(image, i, array){
						if(image.media_type == 'Recording'){ // temporary fix, manually add thumbnail
							image['thumb'] = 'recording_icon.png';
						}
						var imgHTML = xbiod.base.formatMedia(image, options.mediaFormat); // creating html img tag
						img_array.push(imgHTML);

						if (img_array.length == options.row_count) {
							var tableRow = xbiod.base.formatTableData(img_array); // creating table row
							tbody.append(tableRow); // adding row to table body
							img_array.length = 0; // erase array
						}
					});

					// Checks to see if a row was incomplete after the loop
					if (img_array.length > 0){
						var tableRow = xbiod.base.formatTableData(img_array); // creating table row
						tbody.append(tableRow); // adding row to table body
						img_array.length = 0; // erase array
					}

					xbiod.base.addMediaPopup(table); // add popup effect

					// Remove loading icon
					xbiod.base.removeLoaderIcon(widget_id);
					// Show the images
					content.append(table);
					// Add table events
					xbiod.base.addTableEvents(widget_id);

				} else {
					xbiod.base.showAPIResponseError(jData.code);
					xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
				}
			});
		}

		registerMenuAndLoad(widget_id, xbiod.taxon.prototype.loadMedia, options);

	} else {
		xbiod.base.showParameterError('showTaxonMedia', 'taxon');
		xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
	}
};

// **Updated for OJ_Break V2**
xbiod.taxon.prototype.showTypes = function(element_id, tnuid, options) {
	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.show_children == undefined){
			options.show_children = 'Y';
		}
		if (options.inst_id == undefined){
			options.inst_id = '';
		}
		if (options.primary_only == undefined){
			options.primary_only = 'Y';
		}
		if (options.basic_only == undefined){
			options.basic_only = 'Y';
		}
		if (options.taxonFormat == undefined) {
			options.taxonFormat = xbiod.base.taxon_format_default;
		}
		if (options.occurrenceFormat == undefined) {
			options.occurrenceFormat = xbiod.base.occurrence_format_default;
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
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Create widget
		var widget_ids = xbiod.base.createWidget("Types", '#' + element_id, options.widget_options);
		// Get content_id to append data to content
		var widget_id = widget_ids.widget_id;
		var content_id = widget_ids.content_id;

		var show_children_checkbox = xbiod.base.menu_item.checkbox('Show Children', 'show_children', options.show_children == 'Y' ? 'checked=checked' : '');
		var primary_only_checkbox = xbiod.base.menu_item.checkbox('Primary Only', 'primary_only', options.primary_only == 'Y' ? 'checked=checked' : '');
		var basic_only_checkbox = xbiod.base.menu_item.checkbox('Basic Only', 'basic_only', options.basic_only == 'Y' ? 'checked=checked' : '');

		xbiod.base.addMenuItem(widget_id, show_children_checkbox, primary_only_checkbox, basic_only_checkbox);

		xbiod.taxon.prototype.loadTypes = function(options){
			var widget = $('#' + widget_id);
			var content = $('#' + content_id);

			// set widget init state
			resetWidget(widget_id, content_id);

			// set pagination init state
			resetPagination(widget_id);

			// Send OJ_Break request
			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonTypes', {tnuid:tnuid, show_children: options.show_children, inst_id: options.inst_id, primary_only: options.primary_only, offset: options.offset, limit: options.limit, version:2, basic_only:options.basic_only, format:options.format}, 'content_request', true, function(jData) {
				// Check if request was successful
				if (jData.code == 100) {

					// Create array to hold table row data
					var tableElements = [];
					var types = jData.data.occurrences;

					// Add count of records returned
					xbiod.base.addCount(widget_id, types.length);

					types.sort(sortBy('occurrence_id', false, function(a){return a.toLowerCase()})); // intial sort

					var table; // Create table with appropriate headers
					if (options.basic_only == 'N') {
						table = xbiod.base.formatBaseTable('Specimen ID', 'Institution', 'Taxon', 'Valid Name', 'Type', 'Taxonomic Hierarchy', 'Reference');
					} else {
						table = xbiod.base.formatBaseTable('Specimen ID', 'Vouchered');
					}
					// get tbody object for appending data to table
					var tbody = table.find('tbody');

					var is_valid_taxon = function(d){
						if (d.taxon && d.taxon.valid_taxon){
							return true;
						} else {
							console.log(d);
							return false;
						}
					}

					if (types.length == 0){
						xbiod.base.closeWidget(widget_id, content_id, options.widget_options);
					}
					// Intialize pagination for this widget
					xbiod.base.setPagination(widget_id, types.length);

					// Loop until all included taxa added to table body
					types.forEach(function(type, i, array){
						// Format various data fields
						var formattedType = xbiod.base.formatLink('id', type.occurrence_id, type.occurrence_id, xbiod.base.paths.occurrence_path); // format occurrence

						var tableElement;
						if (options.basic_only == 'N'){
							var formattedTaxon = xbiod.base.formatLink('id', type.determinations[0].taxon.tnuid, type.determinations[0].taxon.taxon, xbiod.base.paths.taxon_path) + ' ' + type.determinations[0].taxon.taxon_author;
							var formattedHier = xbiod.base.formatTypeHierarchy(type.determinations[0].taxon.hier);

							if (!type.orig_citation){ // POSSIBLE ISSUE WHEN NULL?
								type.orig_citation = {pub:{pub_author:{agent_name: ''}}, pages: []}; // TEMPORARY FIX: simulating JSON for when orig_citation is null
							}
							// Create a table element object that stores all data that it could be sorted by.
							tableElement = xbiod.base.createTableElement(table, type.occurrence_id, type.institution.inst_code, type.determinations[0].taxon.taxon, (type.determinations[0].taxon.valid === 'N' && is_valid_taxon(type.determinations[0]) ? xbiod.base.formatTaxonName(type.determinations[0].taxon.valid_taxon, options.taxonFormat) : ''), type.determinations[0].type_status, formattedHier, type.orig_citation.pub.pub_author.agent_name); // sortable data goes here
							// Format the table element HTML for how the row will be presented; not sorted.
							tableElement.html = xbiod.base.formatTableData(formattedType, type.institution.inst_code, formattedTaxon, (type.determinations[0].taxon.valid === 'N' && is_valid_taxon(type.determinations[0]) ? xbiod.base.formatTaxonName(type.determinations[0].taxon.valid_taxon, options.taxonFormat) : ''), type.determinations[0].type_status, formattedHier, xbiod.base.formatTypeReference(type.orig_citation.pub, type.orig_citation.pages)); // formatted data goes here
						} else {
							// Create a table element object that stores all data that it could be sorted by.
							tableElement = xbiod.base.createTableElement(table, type.occurrence_id, type.vouchered);
							// Format the table element HTML for how the row will be presented; not sorted.
							tableElement.html = xbiod.base.formatTableData(formattedType, type.vouchered);
						}
						// Add table element to tableElements array.
						tableElements.push(tableElement);

						// Checking if page size limit reached
						if (i < xbiod.base.page_size){
							// Append table element HTML to tbody object until page limit reached
							tbody.append(tableElement.html);
						}
					});

					finishWidget(widget_id, content_id, table, tableElements);

					if (widget.data('pagination')){
						if (widget.data('open')){ // check if widget is open
							xbiod.base.showPagination(widget_id);
						} else {
							xbiod.base.hidePagination(widget_id);
						}
					}
				} else {
					xbiod.base.showAPIResponseError(jData.code);
					xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
				}
			});
		}

		registerMenuAndLoad(widget_id, xbiod.taxon.prototype.loadTypes, options);

	} else {
		xbiod.base.showParameterError('showTaxonTypes', 'taxon');
		xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
	}
};

// **Updated for OJ_Break V2**
xbiod.taxon.prototype.showDeterminers = function(element_id, tnuid, options) {
	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.generalFormat == undefined) {
			options.generalFormat = xbiod.base.general_format_default;
		}
		if (options.limit == undefined){
			options.limit = 50;
		}
		if (options.inst_id == undefined){
			options.inst_id = '';
		}
		if (options.offset == undefined){
			options.offset = 0;
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Create widget
		var widget_ids = xbiod.base.createWidget("Determiners", '#' + element_id, options.widget_options);
		// Get content_id to append data to content
		var widget_id = widget_ids.widget_id;
		var content_id = widget_ids.content_id;

		xbiod.taxon.prototype.loadDeterminers = function(options){
			var widget = $('#' + widget_id);
			var content = $('#' + content_id);

			// set widget init state
			resetWidget(widget_id, content_id);

			// set pagination init state
			resetPagination(widget_id);

			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonDeterminers', {tnuid:tnuid, inst_id: options.inst_id, offset:options.offset, limit:options.limit, version:2, format:options.format}, 'content_request', true, function(jData) {
				// Check if request was successful
				if (jData.code == 100) {
					// Process all of the determiners
					var tableElements = [];
					var determiners = jData.data.determiners;

					// Add count of records returned
					xbiod.base.addCount(widget_id, determiners.length);

					determiners.sort(sortBy('agent_name', false, function(a){return a.toLowerCase()})); // intial sort

					// Create table with appropriate headers
					var table = xbiod.base.formatBaseTable('Determiner(s)'); // creating the base table
					// get tbody object for appending data to table
					var tbody = table.find('tbody');

					if (determiners.length === 0){
						xbiod.base.closeWidget(widget_id, content_id, options.widget_options);
					}
					// Intialize pagination for this widget
					xbiod.base.setPagination(widget_id, determiners.length);

					// Loop until all determiners are added
					determiners.forEach(function(determiner, i, array){
						// Format agent name as an anchor tag
						var formattedDeterminer = xbiod.base.formatLink('agent_id', determiner.agent_id, (determiner.agent_name || 'No Name Specified'), xbiod.base.paths.taxon_path);
						// Create a table element object that stores all data that it could be sorted by.
						var tableElement = xbiod.base.createTableElement(table, determiner.agent_name); //
						// Format the table element HTML for how the row will be presented; not sorted.
						tableElement.html = xbiod.base.formatTableData(formattedDeterminer);
						// Add table element to tableElements array.
						tableElements.push(tableElement);

						// Checking if page size limit reached
						if (i < xbiod.base.page_size){
							// Append table element HTML to tbody object until page limit reached
							tbody.append(tableElement.html);
						}
					});

					finishWidget(widget_id, content_id, table, tableElements);

					if (widget.data('pagination')){
						if (widget.data('open')){ // check if widget is open
							xbiod.base.showPagination(widget_id);
						} else {
							xbiod.base.hidePagination(widget_id);
						}
					}
				} else {
					xbiod.base.showAPIResponseError(jData.code);
					xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
				}
			});
		}

		registerMenuAndLoad(widget_id, xbiod.taxon.prototype.loadDeterminers, options);

	} else {
		xbiod.base.showParameterError('showDeterminers', 'taxon');
		xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
	}
};

// **Updated for OJ_Break V2**
xbiod.taxon.prototype.showContributors = function(element_id, tnuid, options) {
	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.inst_id == undefined){
			options.inst_id = '';
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

		// Create widget
		var widget_ids = xbiod.base.createWidget("Contributors", '#' + element_id, options.widget_options);
		// Get content_id to append data to content
		var widget_id = widget_ids.widget_id;
		var content_id = widget_ids.content_id;

		xbiod.taxon.prototype.loadContributors = function(options){
			var widget = $('#' + widget_id);
			var content = $('#' + content_id);

			// set widget init state
			resetWidget(widget_id, content_id);

			// Send OJ_Break request
			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonInfo', {tnuid:tnuid, inst_id: options.inst_id, version: 2, format:options.format}, 'content_request', true, function(jData) {
				// Check if request was successful
				if (jData.code == 100) {
					// Process all of the contributors

					// Initialize all vars
					var contribs = jData.data.contribs;

					// Add count of records returned
					xbiod.base.addCount(widget_id, contribs.length);

					var tCount = 1, oCount = 1, lCount = 1, mCount = 1;
					var taxa_builder = [];
					var occur_builder = [];
					var lit_builder = [];
					var media_builder = [];

					// Sort contributors array by last name
					contribs.sort(xbiod.base.sortLastName);

					if (contribs.length == 0){
						xbiod.base.closeWidget(widget_id, content_id, options.widget_options);
					}

					// Loop until all contribs are added
					contribs.forEach(function(contrib, i, array){
						// Checking if has contributed to any of the four types
						if (contrib.contrib_types.taxon == 'Y') { // taxon
							var ref = ' [' + xbiod.base.formatLink('id', contrib.contrib_id, tCount, xbiod.base.paths.agent_path) + ']'; //
							taxa_builder.push(contrib.name + ref);
							tCount++;
						}
						if (contrib.contrib_types.literature == 'Y') { // literature
							var ref = ' [' + xbiod.base.formatLink('id', contrib.contrib_id, lCount, xbiod.base.paths.agent_path) + ']';
							lit_builder.push(contrib.name + ref);
							lCount++;
						}
						if (contrib.contrib_types.occurrence == 'Y') { // occurrence
							var ref = ' [' + xbiod.base.formatLink('id', contrib.contrib_id, oCount, xbiod.base.paths.agent_path) + ']';
							occur_builder.push(contrib.name + ref);
							oCount++;
						}
						if (contrib.contrib_types.media == 'Y') { // media
							var ref = ' [' + xbiod.base.formatLink('id', contrib.contrib_id, mCount, xbiod.base.paths.agent_path) + ']';
							media_builder.push(contrib.name + ref);
							mCount++;
						}
					});

					// Format inverted data
					var result = xbiod.base.formatInvertedTable('Taxonomy', taxa_builder.join(', '), 'Literature', lit_builder.join(', '), 'Occurrence', occur_builder.join(', '), 'Media', media_builder.join(', '));
					// Finish formatting table
					result = xbiod.base.formatTable(result);
					// Add table to content
					xbiod.base.removeLoaderIcon(widget_id);

					content.html(result);

				} else {
					xbiod.base.showAPIResponseError(jData.code);
					xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
				}
			});
		}

		registerMenuAndLoad(widget_id, xbiod.taxon.prototype.loadContributors, options);

	} else {
		xbiod.base.showParameterError('showContributors', 'taxon');
		xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
	}
};

// ** Updated for OJ_Break V2 **
xbiod.taxon.prototype.showSubordinateTaxa = function(element_id, tnuid, options) {
	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.inst_id == undefined){
			options.inst_id = '';
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

		// Create widget
		var widget_ids = xbiod.base.createWidget("Subordinate Taxa", '#' + element_id, options.widget_options);
		// Get content_id to append data to content
		var widget_id = widget_ids.widget_id;
		var content_id = widget_ids.content_id;

		xbiod.taxon.prototype.loadSubordinateTaxa = function (options){
			var widget = $('#' + widget_id);
			var content = $('#' + content_id);
			// Remove loading icon from content
			xbiod.base.removeLoaderIcon(widget_id);

			// Add loading icon
			xbiod.base.addLoaderIcon(widget_id);

			// Empty Content
			content.empty();

			// Send OJ_Break request
			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonInfo', {tnuid:tnuid, inst_id: options.inst_id, version:2, format:options.format}, 'content_request', true, function(jData) {
				// Check if request was successful
				if (jData.code == 100) {
					// Process all of the contributors

					// Initialize all vars
					var stats_builder = [];
					var stats = jData.data.stats;
					var child_stats = stats.child_stats;

					// Loop until all subordinate taxa are added
					child_stats.forEach(function(child, i, array){
						stats_builder.push(xbiod.base.formatInvertedTable(child.rank, String(child.num_taxa).addCommas()));
					});

					stats_builder.push(xbiod.base.formatInvertedTable('Specimens', String(stats.num_spms).addCommas()));
					// Finish formatting table
					var result = xbiod.base.formatTable(stats_builder.join(''));
					// Show the contributors
					xbiod.base.removeLoaderIcon(widget_id);

					content.html(result);

				} else {
					xbiod.base.showAPIResponseError(jData.code);
					xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
				}
			});
		}

		registerMenuAndLoad(widget_id, xbiod.taxon.prototype.loadSubordinateTaxa, options);

	} else {
		xbiod.base.showParameterError('showSubordinateTaxa', 'taxon');
		xbiod.base.errorResponse(widget_id, content_id, options.widget_options);
	}
};

xbiod.taxon.prototype.showTaxonHierarchy = function(element_id, tnuid, options) {
	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Send OJ_Break request
		xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonHierarchy', {tnuid:tnuid, version:2, format:options.format}, 'content_request', true, function(jData) {
			// Check if request was successful
			if (jData.code == 100) {
				// Initialize all vars
				var result = [];
				var hier = jData.data.hier;
				var currentKey = 'Order';
				// Loop until all ranks are added
				for (var key in hier) {
					if (key == currentKey) {
						var rank = hier[key];
						var formattedRank = xbiod.base.formatLink('id', rank.tnuid, rank.taxon, xbiod.base.paths.taxon_path);
						result.push(formattedRank);
						currentKey = hier[key].next;
						if (currentKey == null){
							break;
						}
					}
				}

				$('#' + element_id).append(result.join(' > '));
			} else {
				xbiod.base.showAPIResponseError(jData.code);
			}
		});
	} else {
		xbiod.base.showParameterError('showSubordinateTaxa', 'taxon');
	}
};

var finishWidget = function(widget_id, content_id, table, tableElements){
	// Store table elements array on DOM. Allows sorting without multiple API calls.
	$('#' + widget_id).data('tableElements', tableElements);
	// Remove loading icon from content
	xbiod.base.removeLoaderIcon(widget_id);
	// Append table to content
	$('#' + content_id).append(table);
	// Add table events
	xbiod.base.addTableEvents(widget_id);
};

var registerMenuAndLoad = function(widget_id, load, options){
	xbiod.utils.registerMenuEventHandler(widget_id, '.refreshMenuButton', 'click', function(){
			var menu_items = $('#' + widget_id).find('input');
			menu_items.each(function(i, item){
				if (item.type === 'checkbox' || item.type === 'radio'){
					options[item.value] = item.checked ? "Y" : "N";
				}
			});
			load(options);
		});

	load(options);
};

var resetWidget = function(widget_id, content_id){
	// Remove loading icon from content to prevent multiple icons from appearing
	xbiod.base.removeLoaderIcon(widget_id);

	// Add loading icon
	xbiod.base.addLoaderIcon(widget_id);

	// Empty any content that there may be
	$('#' + content_id).empty();
	// reset data count
	xbiod.base.removeCount(widget_id);
};

var resetPagination = function(widget_id){
	// reset pagination data
	$('#' + widget_id).data('pagination', false);
	// reset pagination bar
	xbiod.base.hidePagination(widget_id);
	// remove menu pagination
	xbiod.base.removeMenuPagination(widget_id);
};

// At this point, the namespace has been loaded
xbiod.base.loaded.taxon = true;
