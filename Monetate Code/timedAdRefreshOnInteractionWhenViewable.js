//On page load, wait for 30 seconds. 
//Then wait for the user to interact with the keyboard or mouse.
//If the ad slot in question has registered as "viewable", refresh the ad and start waiting 30secs again
//Send analytics to GA

//Author: Jordan Woll


var allow;
var slotTarget = googletag.slots["clone_of_story_level_pages"]; //top right 300x250 slot on story-level pages
var initialLoad = true; //montetate is too slow to determine this - delete all initialLoad stuff for monetate
var refreshCounter = 0;
var isviewable;  //montetate is too slow to determine this - set isviewable to TRUE initially for monetate

//every 30 seconds, allow ad refresh
function lockUp() {
    allow = false;    
    setTimeout(function () {
        allow = true;
    }, 30000);
}

// start by locking for 15 secs    
lockUp();

//on interaction...
$(document).bind( "mousemove keypress", function () {  
    if (!allow) return; // if no permission, go no further
	if (!isviewable) return; // if ad wasn't viewable, go no further
    lockUp();
	isviewable = false; //reset viewability test
		console.log('resetting viewability determination and refreshing'); //delete this line on prod
    googletag.pubads().refresh([slotTarget]); //refresh to slot in question
});


//fires when the slot in question registers as 'viewable' according to GPT's impressionViewable criteria
googletag.pubads().addEventListener('impressionViewable', function(event) {
	if (event.slot === slotTarget) {
		isviewable = true; //register positive viewability test for the slot
			console.log('determined viewable'); //delete this line on prod
	} 
});



//when the slot is done loading...
googletag.pubads().addEventListener('slotRenderEnded', function(event) {
  //if it's the initial load, record an Initial Ad Load and set initialLoad to false
  if ((event.slot === slotTarget) && (initialLoad === true) && (event.isEmpty === false)) {
	initialLoad = false;	
	ga('send', 'event', 'Monetate Test', 'Initial Ad Load', 'Timed Ad Refresh Experiment');  //this is google analytics tracking info  	
	return;
  } 
  ////if it's not the initial load, start counting the number of refreshes and record a Refresh
  if ((event.slot === slotTarget) && (initialLoad === false) && (event.isEmpty === false)) {	  
	  refreshCounter += 1;	  
	  if (refreshCounter > 0) {
		ga('send', 'event', 'Pinned Refresh', 'ad impression', 'refresh', 1);   //this is google analytics tracking info  	
			console.log('Refresh number '+refreshCounter); //delete this line on prod
	  }
  }
});
