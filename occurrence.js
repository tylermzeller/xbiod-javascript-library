// Call the loader for the current page
$(document).ready(loader);
//$(document).on('ready page:load', loader);

function loader() {
	// Initialize xBio:D library
	xbiod.init(['occurrence', 'search'], 'FBF57A9F7A666FC0E0430100007F0CDC', function() {
		var occurrence_id = xbiod.base.getQueryVariable('id');

		if (occurrence_id == null){
			occurrence_id = 'OSUC 135454';
		}

		// Load xBio:D components
		var occurrence = new xbiod.occurrence();
		var search = new xbiod.search();

		// Setting path variables
		xbiod.base.paths.taxon_path = '/taxon';
		xbiod.base.paths.occurrence_path = '/occurrence';
		xbiod.base.paths.agent_path = '/agent';

		// Setting default widget options
		xbiod.base.widget_options.initial_height = '450px';
		xbiod.base.widget_options.header = '<img class="xbiodWidgetIcon" src="img/xbiod.png"/>';

		// Load search
		search.showSearch('search_id', {search_type: 'id', domains: [{type: 'taxon', handler_url: '/taxon'}, {type: 'occurrence', handler_url: '/occurrence'}, {type: 'agent', handler_url: '/agent'}]});
		// Load locality info
		occurrence.showLocalityInfo('half_width_c2', occurrence_id);

		// Load collecting trip info
		occurrence.showOccurrenceInfo('half_width_c1', occurrence_id);

		// Load determinations
		occurrence.showDeterminations('half_width_c2', occurrence_id);

		// Load biological info
		occurrence.showBiologicalInfo('half_width_c1', 'UCFC 0 000 143');

		// Load specimen info
		occurrence.showSpecimenInfo('half_width_c2', occurrence_id);

		$('.xbiodWidgetFooter').tooltip();
	});
}

// my hands are shaking, my body is cold, nothing is working.... the end is near most definitely
