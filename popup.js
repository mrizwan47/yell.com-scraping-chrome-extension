var scrape_and_append = document.getElementById('scrape_and_append');
var clear_csv = document.getElementById('clear_csv');
var download_csv = document.getElementById('download_csv');


chrome.storage.local.get('yell_com_listings_list', function(items) {

	if( items['yell_com_listings_list'] ){
		document.getElementById('total_count').innerHTML = items['yell_com_listings_list'].length;
	}else{
		document.getElementById('total_count').innerHTML = 0;
	}

});

chrome.storage.onChanged.addListener(function(changes, namespace) {

	if( namespace == 'local' && changes.hasOwnProperty('yell_com_listings_list') ){

		if( changes['yell_com_listings_list'].hasOwnProperty('newValue') ){
			document.getElementById('total_count').innerHTML = changes['yell_com_listings_list']['newValue'].length
		}else{
			document.getElementById('total_count').innerHTML = 0;
		}
		
	}

});



// Clear Data
clear_csv.addEventListener("click", async () => {
	
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	if(!tab.url.includes("chrome://")) {
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: function(){
				chrome.storage.local.remove('yell_com_listings_list', function() {
					console.log('Data cleared!');
				});
			}
		});
	}

});


// Scrape And Append
scrape_and_append.addEventListener("click", async () => {
	
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	if(!tab.url.includes("chrome://")) {
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: function(){

				chrome.storage.local.get('yell_com_listings_list', function(items) {

					if( items['yell_com_listings_list'] ){
						listings_array = items['yell_com_listings_list'];
					}else{
						listings_array = [];
					}
			
					var listings = document.getElementsByClassName('results--row')[0].getElementsByTagName('article');
					var town_name = document.getElementById('search_location').value;

					// title
					// town_name
					// address
					// phone
					// website
					// Email Sending ID (ie "100040861616000050" in "https://www.yell.com/customerneeds/sendenquiry/sendtoone/100040861616000050?searchedLocation=Ab%20Kettleby")
					
					for( i in listings ){
						if( listings.hasOwnProperty(i) ){

							if( listings[i].getElementsByTagName('h2').length ){
								title = listings[i].getElementsByTagName('h2')[0].innerText;
							}else{
								title = 'NO HEADING';
							}
							
							if( listings[i].getElementsByClassName('businessCapsule--address').length ){
								address = listings[i].getElementsByClassName('businessCapsule--address')[0].getElementsByTagName('span')[3].innerText;
							}else{
								address = '';
							}
							
							if( listings[i].getElementsByClassName('business--telephoneNumber').length ){
								phone = listings[i].getElementsByClassName('business--telephoneNumber')[0].innerText;
							}else{
								phone = '';
							}
							
							if( listings[i].querySelectorAll('a.businessCapsule--ctaItem[target=_blank').length ){
								website = listings[i].querySelectorAll('a.businessCapsule--ctaItem[target=_blank')[0].getAttribute('href');
							}else{
								website = '';
							}
							
							if( listings[i].querySelectorAll('a.businessCapsule--ctaItem[data-tracking="LIST:CONTACT"').length ){
								email_id = listings[i].querySelectorAll('a.businessCapsule--ctaItem[data-tracking="LIST:CONTACT"')[0].getAttribute('href').match(/.*?([0-9]+).*/)[1];
							}else{
								email_id = "";
							}
							

							listings_array.push([
								'"' + title + '"',
								'"' + town_name + '"',
								'"' + address + '"',
								'"' + phone.replaceAll(' ', '') + '"',
								'"' + website + '"',
								'"' + email_id + '"'
							]);

						}
					}
			
					chrome.storage.local.set({'yell_com_listings_list': listings_array}, function() {
						console.log('listings Saved!')
						setTimeout(function(){

							if( document.querySelector('a.pagination--next') ){
								document.getElementsByClassName('pagination--next')[0].click();
							}else{
								alert('This was last page!');
								window.close();
							}
							
						}, 200)
					});
			
				});

			}
		});
	}
	

});


// Download CSV
download_csv.addEventListener("click", async () => {
	
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	if(!tab.url.includes("chrome://")) {

		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			function: function(){

				chrome.storage.local.get('yell_com_listings_list', function(items) {
	
					if( items['yell_com_listings_list'] ){
						listings_array = items['yell_com_listings_list'];
					}else{
						listings_array = [];
					}
			
					let csvContent = "data:text/csv;charset=utf-8," + listings_array.map(e => e.join(",")).join("\n");
			
					var encodedUri = encodeURI(csvContent);
					var link = document.createElement("a");
					link.setAttribute("href", encodedUri);
					link.setAttribute("download", "yell.com-listings.csv");
					document.body.appendChild(link);
				
					link.click();
			
				});
	
			}
		});

	}

});