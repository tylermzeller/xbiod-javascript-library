// Call the loader for the current page
$(document).ready(loader);
//$(document).on('ready page:load', loader);

function loader() {
	// Initialize xBio:D library
	xbiod.init(['agent', 'search'], 'FBF57A9F7A666FC0E0430100007F0CDC', function() {

		var agent_id = xbiod.base.getQueryVariable('id');

		if(agent_id == null){
		 	agent_id = 2;
		}

		// Load xBio:D components
		var agent  = new xbiod.agent ();
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

		// Load person info
		agent.showAgentInfo('full_width', agent_id, {widget_options: {}});

		// Load person publications
		agent.showPublications('half_width_c1', agent_id);

		// Load person collecting trips
		//agent.showAgentOccurrences('half_width_c1', agent_id, {markers: 'spiderfy', info_element_id: 'full_width_c1', info_widget_options: {initial_height: '500px'}});

		// Load person described taxa
		agent.showDescribedTaxa('half_width_c2', agent_id, {});


		$('.xbiodWidgetFooter').tooltip();
	});
}
