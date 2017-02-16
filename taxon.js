// Call the loader for the current page
$(document).ready(loader);
//$(document).on('ready page:load', loader);
var TEST = 1;

function loader() {
	// Initialize xBio:D library
	xbiod.init(['taxon', 'search'], 'FBF57A9F7A666FC0E0430100007F0CDC', function() {

		if (TEST){
			var tnuid = xbiod.base.getQueryVariable('id');
			var inst_id = 1;
			if (tnuid == null) {
				tnuid = 52;
			}

			// Load xBio:D components
			var search = new xbiod.search();
			var taxon = new xbiod.taxon();
			//var visual = new xbiod.visual();

			search.showSearch('search_id', {search_type: 'id', inst_id: inst_id, domains: [{type: 'taxon', handler_url: '/'}, {type: 'occurrence', handler_url: '/'}]});

			//visual.showTaxonHierarchy('half_width_c1', 'id', tnuid, null, {widget_options: {initial_height: '750px', no_overflow: 'Y'}, handler_url: '/taxon', inst_id:0, showSyns:'N', showFossils:'Y', types_only:'N', show_num_spms:'N'});
			taxon.showIncludedTaxa('half_width_c1', tnuid, {inst_id: inst_id, widget_options: {initial_height: '700px'}});

			// Load hierarchy
			taxon.showTaxonHierarchy('hier_location', tnuid);

			// Load subordinate taxa
			taxon.showSubordinateTaxa('half_width_c2', tnuid, {inst_id: inst_id, widget_options: {initial_height: '500px'}});

			// Load taxon hierarchy
			//visual.showTaxonHierarchy('half_width_c1', 'canvas_id', tnuid, null, {inst_id: 1, backgroundColor: 'black', handler_url: 'http://hol.osu.edu/index.html'});

			// Load types
			taxon.showTypes('full_width_c1', tnuid, {basic_only: 'N', primary_only: 'N', inst_id: inst_id, limit: '50', widget_options: {initial_height: '500px'}});

			$('.xbiodWidgetHeader').tooltip();
			$('.xbiodWidgetPagination').tooltip();
			$('.xbiodWidgetMenuButton').mouseenter(function(e){
				$('.xbiodWidgetHeader').tooltip('hide');
			});

		} else {
			var tnuid = xbiod.base.getQueryVariable('id');

			if (tnuid == null) {
				tnuid = 52;
			}

			// Load xBio:D components
			var taxon  = new xbiod.taxon ();
			var search = new xbiod.search();
			var visual = new xbiod.visual();

			// Setting path variables
			xbiod.base.paths.taxon_path = '/taxon';
			xbiod.base.paths.occurrence_path = '/occurrence';
			xbiod.base.paths.agent_path = '/agent';

			// Setting default widget options
			xbiod.base.widget_options.initial_height = '1000px';
			xbiod.base.widget_options.header = '<img class="xbiodWidgetIcon" src="img/xbiod.png"/>';
			xbiod.base.widget_options.start = 'closed';

			// Load search
			search.showSearch('search_id', {search_type: 'id', domains: [{type: 'taxon', handler_url: '/taxon'}, {type: 'occurrence', handler_url: '/occurrence'}, {type: 'agent', handler_url: '/agent'}]});

			// Load map
			visual.showGoogleMap('full_width_c1', tnuid, {inst_id:'', show_children:'N', widget_options: {initial_height: '500px'}});

			// Load taxon hierarchy
			//visual.showTaxonHierarchy('canvas_id', tnuid, null, {backgroundColor: 'black', handler_url: 'http://hol.osu.edu/index.html'});

			visual.showTaxonHierarchy('half_width_c2', 'id', tnuid, null, {widget_options: {initial_height: '750px', no_overflow: 'Y'}, handler_url: '/taxon', inst_id:0, showSyns:'N', showFossils:'Y', types_only:'N', show_num_spms:'N'});

			// Load hierarchy
			taxon.showTaxonHierarchy('location', tnuid);

			// Load included taxa
			taxon.showIncludedTaxa('half_width_c1', tnuid);

			// Load taxon synonyms
			taxon.showSynonyms('half_width_c2', tnuid, {showFossils: 'N', widget_options: {initial_height: '500px'}});

			// Load collections
			taxon.showInstitutions('half_width_c2', tnuid, {widget_options: {initial_height: '300px'}});

			// Load habitats
			//taxon.showHabitats('half_width_c2', tnuid, {generalFormat: '<b>%habitat%</b>'});

			// Load literature
			taxon.showLiterature('half_width_c2', tnuid, {show_bib: 'Y', widget_options: {}});

			// Load associations
			taxon.showAssociations('half_width_c1', tnuid, {widget_options: {initial_height: '500px'}});

			// Load images
			taxon.showTaxonMedia('full_width_c1', tnuid, {limit: 72, row_count: 5});

			// Load types
			taxon.showTypes('full_width_c1', tnuid, {basic_only: 'N', widget_options: {}});

			// Load determiners w
			taxon.showDeterminers('half_width_c1', tnuid, {generalFormat: '%agent_name%', widget_options: {}});

			// Load collecting methods
			//taxon.showCollectingMethods('id', tnuid, {generalFormat: '%coll_method% - %num_spms%'});

			// Load contributors
			taxon.showContributors('half_width_c1', tnuid);

			// Load subordinate taxa
			taxon.showSubordinateTaxa('half_width_c2', tnuid);

			$('.xbiodWidgetHeader').tooltip({
				track: true
			});

			$('.xbiodWidgetMenuButton').mouseenter(function(e){
				$('.xbiodWidgetHeader').tooltip('hide');
			});
		}

	});
}



// my hands are shaking, my body is cold, nothing is working.... the end is near most definitely
