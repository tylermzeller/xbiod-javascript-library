/*////////////////////////////////////////////////////////////////////////
Copyright (c) 2015-2016, The Ohio State University
All rights reserved.

Created by Joe Cora & Tyler Zeller
Last revised on 12 January 2016 (TZ)


Requires: jQuery 1.8+
          Google Maps API v3 (if mapping used)
          Processing.js 1.4.1+ (if processing.js used)

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

// VISUAL CLASS SETUP

// Define visual class
xbiod.visual = function(options) {
	// Setup class variables

};

// VISUAL CLASS METHODS

// **UPDATED FOR OJ_BREAK V2** LOCALITY INFO NOT ADDED YET
xbiod.visual.prototype.showGoogleMap = function(element_id, tnuid, options) {
	// Check require parameters (element_id and tnuid)
	if (element_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.place_id == undefined) {
			options.place_id = '';
		}
		if (options.inst_id == undefined) {
			options.inst_id = '';
		}
		if (options.show_children == undefined) {
			options.show_children = 'N';
		}
		if (options.use_sex_icons == undefined){
			options.use_sex_icons = false;
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
				if (options.icons.point.sex == undefined){
					options.icons.point.sex = xbiod.base.icons.point.sex;
				} else {
					if (options.point.sex.female == undefined){
						options.point.sex.female = xbiod.base.point.sex.female;
					}
					if (options.point.sex.male == undefined){
						options.point.sex.male = xbiod.base.point.sex.male;
					}
					if (options.point.sex.unsexed == undefined){
						options.point.sex.unsexed = xbiod.base.point.sex.unsexed;
					}
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
				if (options.icons.polygon.sex == undefined){
					options.icons.polygon.sex = xbiod.base.icons.polygon.sex;
				} else {
					if (options.polygon.sex.female == undefined){
						options.polygon.sex.female = xbiod.base.polygon.sex.female;
					}
					if (options.polygon.sex.male == undefined){
						options.polygon.sex.male = xbiod.base.polygon.sex.male;
					}
					if (options.polygon.sex.unsexed == undefined){
						options.polygon.sex.unsexed = xbiod.base.polygon.sex.unsexed;
					}
				}
			}
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
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Guarantee that this widget is marked as visual
		options.widget_options.visual = 'Y';

		// Creating widget
		var widget = xbiod.base.createWidget("Map", '#' + element_id, options.widget_options);
		var content_id = widget.content_id;
		var widget_id = widget.widget_id;
		var widget_options = widget.widget_options;

		// Add loading icon
		xbiod.base.addLoaderIcon(widget_id);

		// Send OJ_Break request
		xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonLocalities', {tnuid:tnuid, place_id:options.place_id, inst_id:options.inst_id, offset:options.offset, limit:options.limit, show_children:options.show_children, version:2, format:options.format}, 'content_request', true, function(jData) {
			// Check if request was successful
			if (jData.code == 100) {
				// Setup Google Map
				var mapOptions = {
					zoom: 1,
					center: new google.maps.LatLng(0, 0),
					mapTypeControlOptions: {
						mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN],
						style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
					},
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};

				// Google Map variables
				var gMap = new google.maps.Map(document.getElementById(content_id), mapOptions);
				var localities = jData.data.localities;
				var marker_position;
				var marker_icon;
				var marker;
				var pt_icon = new google.maps.MarkerImage(options.icons.point.vouchered);
				var poly_icon = new google.maps.MarkerImage(options.icons.polygon.vouchered);
				var pt_unv_icon = new google.maps.MarkerImage(options.icons.point.unvouchered);
				var poly_unv_icon = new google.maps.MarkerImage(options.icons.polygon.unvouchered);
				var poly_male = new google.maps.MarkerImage(options.icons.polygon.sex.male);
				var pt_male = new google.maps.MarkerImage(options.icons.point.sex.male);
				var poly_female = new google.maps.MarkerImage(options.icons.polygon.sex.female);
				var pt_female = new google.maps.MarkerImage(options.icons.point.sex.female);
				var poly_unsexed = new google.maps.MarkerImage(options.icons.polygon.sex.unsexed);
				var pt_unsexed = new google.maps.MarkerImage(options.icons.point.sex.unsexed);

				if (options.markers == 'spiderfy') {
					// Spiderfier
					var oms = new OverlappingMarkerSpiderfier(gMap);
					oms.addListener('click', function(marker, event){
						// Do something on click (load locality info)
					});
				}

				// Creating a marker listener for a map marker click event
				var createListener = function (marker, loc_id) {
					google.maps.event.addListener(marker, "click", function () {
						// xbiod call. Will populate right section of xbiod window.
						//xbiod.agent.prototype.showAgentOccurrenceLocalityInfo(locality element id, loc_id);
					});
					return marker;
				}

				// Loop until all of the localities are plotted
				localities.forEach(function(locality, i, array){
					// Checking if user specified sex icons
					if (options.useSexIcons) {
						if(locality.spm_sex == 'M'){
							// Check on locality type
							if (locality.loc_type.toLowerCase() == 'point') {
								marker_icon = pt_male;
							} else {
								marker_icon = poly_male;
							}
						}
						if (locality.spm_sex = 'F'){
							// Check on locality type
							if (locality.loc_type.toLowerCase() == 'point') {
								marker_icon = pt_female;
							} else {
								marker_icon = poly_female;
							}
						}
						if (locality.spm_sex = 'U'){
							// Check on locality type
							if (locality.loc_type.toLowerCase() == 'point') {
								marker_icon = pt_unsexed;
							} else {
								marker_icon = poly_unsexed;
							}
						}
					}
					// Check if locality source is vouchered or unvouchered
					else if (locality.coords.loc_source == 'unvouchered' || locality.coords.loc_source == 'unvouchered (collection)') {
						// Check on locality type
						if (locality.loc_type.toLowerCase() == 'point') {
							marker_icon = pt_unv_icon;
						} else {
							marker_icon = poly_unv_icon;
						}
					} else { // Use normal icons
						// Check on locality type
						if (locality.loc_type.toLowerCase() == 'point') {
							marker_icon = pt_icon;
						} else {
							marker_icon = poly_icon;
						}
					}
					// create marker coords
					marker_position = new google.maps.LatLng(locality.coords.lat, locality.coords.lng);
					// Create marker
					marker = new google.maps.Marker({map:gMap, position:marker_position, icon:marker_icon, title: locality.loc_name, optimized: false});
					// Checking if user specified marker spiderfier
					if (options.markers == 'spiderfy') {
						// Add marker to spiderfier
						oms.addMarker(marker);
					} else {
						createListener(marker, locality.loc_id);
					}
				});

				$('#' + widget_id).resize(function(){
					google.maps.event.trigger(gMap, 'resize'); // ensures map resizes with xbiod Widget
				});

				$('#' + widget_id + " .xbiodWidgetFooter" ).dblclick(function(){
					google.maps.event.trigger(gMap, 'resize'); // ensures map resizes with xbiod widget close
				});
			} else {
				xbiod.base.showAPIResponseError(jData.code);
			}
		});
	} else {
		xbiod.base.showParameterError('showGoogleMap', 'visual');
	}
};

xbiod.visual.prototype.showTaxonHierarchy = function(element_id, canvas_id, tnuid, requestedNode, options) {

	// Check require parameters (element_id and tnuid)
	if (element_id && canvas_id && tnuid) {

		// Process optional parameters
		if (!options) {
			options = {};
		}
		if (options.show_num_spms == undefined) {
			options.show_num_spms = 'N';
		}
		if (options.inst_id == undefined) {
			options.inst_id = '';
		}
		if (options.rank == undefined){
			options.rank = '';
		}
		if (options.show_syns == undefined) {
			options.show_syns = 'N';
		}
		if (options.show_fossils == undefined) {
			options.show_fossils = 'N';
		}
		if (options.types_only == undefined) {
			options.types_only = 'N';
		}
		if (options.handler_url == undefined){
			options.handler_url = [];
		}
		if (options.nodeColor == undefined) {
			options.nodeColor = '#FFFFFFFF';
		}
		if (options.backgroundColor == undefined) {
			options.backgroundColor = '#70CFF5';
		}
		if (options.size == undefined){
			options.size = {};
		}
		if (options.image_path == undefined){
			options.image_path = '';
		}
		if (options.widget_options == undefined){
			options.widget_options = {};
		}
		if (options.widget_options.initial_height == undefined){
			options.widget_options.initial_height = xbiod.base.widget_options.initial_height;
		}
		if (options.size.width == undefined){
			options.size.width = '';
		}
		if (options.size.height == undefined){
			options.size.height = options.widget_options.initial_height;
		}
		if (options.format == undefined){
			options.format = 'jsonp';
		}

		// Guarantee that this widget is marked as visual
		options.widget_options.visual = 'Y';

		var processing;
		if(!requestedNode) {
			// Create the widget
			var widget = xbiod.base.createWidget('Taxon Hierarchy', '#' + element_id, options.widget_options);
			var content_id = widget.content_id; // get content_id

			options.size.width = $('#' + content_id).css('width');

			$('#' + content_id).html(['<canvas id="', canvas_id, '"></canvas>'].join('')); // insert canvas into widget


			Processing.loadSketchFromSources(canvas_id, ['taxon-hierarchy.pde']); // manually load sketch

			// Send OJ_Break request
			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonHierarchy', {tnuid:tnuid, format:options.format}, 'content_request', true, function(jData) {
				// Check if request was successful
				if (jData.code == 100) {

					$('#' + canvas_id).bind('mousewheel DOMMouseScroll', function (event) {
						event.preventDefault(); // prevent scrolling inside the animation
					});

					xbiod.base.formatColor(options.nodeColor, options.backgroundColor); // get appropriate format for color options

					processing = Processing.getInstanceById(canvas_id); // load processing

					// Passing necessary elements to processing
					processing.addDimensions(xbiod.base.pixelsToInt(options.size.width), xbiod.base.pixelsToInt(options.size.height)); // make sure animation is correct dimensions
					processing.addElements(element_id, canvas_id, options.handler_url, options.image_path); // adding necessary variables for callbacks and resources

					var hier = jData.data.hier;

					// Loop until all hierarchy taxa are added
					for(var key in hier){
						processing.addHierarchy(hier[key]);
					}
					// Add root node; begins animation
					processing.addRootNode();
				} else {
					xbiod.base.showAPIResponseError(jData.code);
				}
			});
		} else {
			xbiod.base.sendAPIRequest('GET', xbiod.base.oj_break_base + 'getTaxonIncludedTaxa', {tnuid:tnuid, rank:options.rank, inst_id:options.inst_id, show_syns:options.show_syns, show_fossils:options.show_fossils, types_only:options.types_only, limit:options.limit, offset:options.offset, format:'jsonp', version:2}, 'content_request', true, function(jData) {
				// Check if request was successful
				if(jData.code == 100) {
					processing = Processing.getInstanceById(canvas_id);
					var taxa = jData.data.includedTaxa;
					taxa.sort(sortBy('taxon', false, function(a){return a.toLowerCase()}));

					// Loop until all included taxa have been displayed
					taxa.forEach(function(taxon, i, array){
						processing.addHierarchy(taxa[i]);
					});

					processing.addIncludedTaxa(requestedNode);
				} else {
					xbiod.base.showAPIResponseError(jData.code);
				}
			});
		}
	} else {
		xbiod.base.showParameterError('showTaxonHierarchy', 'visual');
	}
};

// At this point, the namespace has been loaded
xbiod.base.loaded.visual = true;
