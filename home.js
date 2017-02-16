// Call the loader for the current page
$(document).ready(loader);
//$(document).on('ready page:load', loader);

function loader() {
	// Initialize xBio:D library
	xbiod.init(['taxon'], 'FBF57A9F7A666FC0E0430100007F0CDC', function() {
		var tnuid = 52;

		// Load xBio:D components
		var taxon = new xbiod.taxon();
		//var visual = new xbiod.visual();

		//visual.showTaxonHierarchy('half_width_c1', 'id', tnuid, null, {widget_options: {initial_height: '750px', no_overflow: 'Y'}, handler_url: '/taxon', inst_id:0, showSyns:'N', showFossils:'Y', types_only:'N', show_num_spms:'N'});
		taxon.showIncludedTaxa('half_width_c1', tnuid, {widget_options: {initial_height: '500px'}});

		$('.xbiodWidgetHeader').tooltip();
		$('.xbiodWidgetMenuButton').mouseenter(function(e){
			$('.xbiodWidgetHeader').tooltip('hide');
		});
	});
}
