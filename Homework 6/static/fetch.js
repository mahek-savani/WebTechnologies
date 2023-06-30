var latitude;
var longitude;
var allEvents;
var singleEvent;

function autoLocateUser(){
    if(document.getElementById("autoLocate").checked){
        document.getElementById("location").disabled = true;
        document.getElementById("location").style.display = "none";
        ipInfo = "https://ipinfo.io/?token=ABCD"
        var resp = fetch(ipInfo);
        resp
            .then(function(response) {
                return response.json();
            })
            .then(function(data){
                var coordinates = data["loc"]
                var arr = coordinates.split(",")
                latitude = arr[0]
                longitude = arr[1]
            })
    }
    else{
        document.getElementById("location").disabled = false;
        document.getElementById("location").style.display = "block";
    }
}

async function locateBySearch(locationValue){
    
    var response = await fetch("https://maps.googleapis.com/maps/api/geocode/json?key=ABCD&address="+locationValue)
    var geoData = await response.json()
    if(geoData.status == "OK"){
        latitude = geoData['results'][0]['geometry']['location']['lat'];
        longitude = geoData['results'][0]['geometry']['location']['lng'];
        return [latitude, longitude]
    }
    else{
        document.getElementById('noRecord').style.display = "block";
        return;
    }
}

async function searchDetails(){
    clearTableArea();
    document.getElementById("container1").innerHTML = "";
    if(document.getElementById("keywords").value == "")
    {
        return;
    }
    if(!(document.getElementById("autoLocate").checked))
    {
        if(document.getElementById("location").value == "")
        {
            return;
        }
    }
    var locationValue = document.getElementById("location").value;
    var keyword = document.getElementById("keywords").value;
    var category = document.getElementById("category").value;
    var distance = document.getElementById("distance").value;
    if(distance=="")
    {
        distance = 10;
    }
    if(!(document.getElementById("autoLocate").checked))
    {
        geoData = await locateBySearch(locationValue);
        if(!geoData){
            return;
        }
        latitude = geoData[0];
        longitude = geoData[1];
    }
    requestData(keyword, category, distance, latitude, longitude)
}

function requestData(keyword, category, distance, latitude, longitude){
    // console.log(keyword, category, distance, latitude, longitude)
    var localeAPI = "http://127.0.0.1:8000/getData?"
    localeAPI += "keyword=" + keyword
    localeAPI += "&category=" + category
    localeAPI += "&distance=" + distance
    localeAPI += "&latitude=" + latitude
    localeAPI += "&longitude=" + longitude
    
    var response = fetch(localeAPI)
    response.then(res => res.json())
    .then(function(data){
        if(data.page.totalElements == 0){
            document.getElementById('noRecord').style.display = "block";
            document.getElementById('fetchedData').style.display = "none";
        }
        else{
            allEvents = data._embedded.events;
            document.getElementById('noRecord').style.display = "none";
            document.getElementById('fetchedData').style.display = "block";
            // console.log(data)

            var tableBody = document.getElementById('tableBody')
            for(var i=0; i<data._embedded.events.length; i++)
            {
                var eDate = ''
                var eTime = ''
                if(data._embedded.events[i].dates && data._embedded.events[i].dates.start){
                    if(data._embedded.events[i].dates.start.localDate){
                        eDate = data._embedded.events[i].dates.start.localDate
                    }
                    if(data._embedded.events[i].dates.start.localTime){
                        eTime = data._embedded.events[i].dates.start.localTime
                    }
                }

                var icon = ''
                if(data._embedded.events[i].images && data._embedded.events[i].images.length > 0){
                    if(data._embedded.events[i].images[0].url){
                        icon = data._embedded.events[i].images[0].url
                    }
                }

                var event = ''
                if(data._embedded.events[i].name){
                    event = data._embedded.events[i].name
                }

                var genre = 'N/A'
                if(data._embedded.events[i].classifications){
                    if(data._embedded.events[i].classifications[0].segment){
                        genre = data._embedded.events[i].classifications[0].segment.name
                    }
                }

                var venue = ''
                if(data._embedded.events[i]._embedded && data._embedded.events[i]._embedded.venues && data._embedded.events[i]._embedded.venues.length > 0){
                    if(data._embedded.events[i]._embedded.venues[0].name){
                        venue = data._embedded.events[i]._embedded.venues[0].name
                    }
                }


                var tabelRow = document.createElement('tr')
                tabelRow.innerHTML = '<td>' + eDate + '<br/>' + eTime + '</td><td>'
                                    + '<img class="icon" src=' + icon +'></img>' +'</td><td>'
                                    + '<a class="eventName" href="#" onClick="eventClicked(' + i +', event)">' + event + '</a>' +'</td><td>'
                                    + genre +'</td><td>'
                                    + venue +'</td>';
                tableBody.appendChild(tabelRow);
            }
        }
    })
}

function eventClicked(id, event){
    event.preventDefault();
    var venue = ''
    if(allEvents[id]._embedded && allEvents[id]._embedded.venues && allEvents[id]._embedded.venues.length > 0){
        if(allEvents[id]._embedded.venues[0].name){
            venue = allEvents[id]._embedded.venues[0].name
        }
    }
    var title = allEvents[id].name
    var dateTime = allEvents[id].dates.start.localDate + ' ' + allEvents[id].dates.start.localTime
    var venue = allEvents[id]._embedded.venues[0].name
    var ticketStatus = allEvents[id].dates.status.code
    var TMLink = allEvents[id].url
    var artists = ''
    if(allEvents[id]._embedded && allEvents[id]._embedded.attractions){
        for(var i = 0; i < allEvents[id]._embedded.attractions.length; i++){
            if(allEvents[id]._embedded.attractions[i].url){
                artists += '<a  class="artists" href="' + allEvents[id]._embedded.attractions[i].url + '" target="_blank" style="text-decoration:none;">' + allEvents[id]._embedded.attractions[i].name + '</a>'
            }
            else{
                artists += allEvents[id]._embedded.attractions[i].name
            }
            if(i != allEvents[id]._embedded.attractions.length-1){
                artists += " | "
            }
        }
    }
    var genres = ''
    if(allEvents[id].classifications){
        if(allEvents[id].classifications[0].subGenre && allEvents[id].classifications[0].subGenre.name != 'Undefined'){
            genres += allEvents[id].classifications[0].subGenre.name 
        }
        if(allEvents[id].classifications[0].genre && allEvents[id].classifications[0].genre.name != 'Undefined'){
            genres += ' | ' + allEvents[id].classifications[0].genre.name
        }
        if(allEvents[id].classifications[0].segment && allEvents[id].classifications[0].segment.name != 'Undefined'){
            genres += ' | ' + allEvents[id].classifications[0].segment.name
        }
        if(allEvents[id].classifications[0].subType && allEvents[id].classifications[0].subType.name != 'Undefined'){
            genres += ' | ' + allEvents[id].classifications[0].subType.name
        }
        if(allEvents[id].classifications[0].type && allEvents[id].classifications[0].type.name != 'Undefined'){
            genres += ' | ' + allEvents[id].classifications[0].type.name
        }
    }

    var priceRange = ''
    if(allEvents[id].priceRanges){
        priceRange = allEvents[id].priceRanges[0].min + '-' + allEvents[id].priceRanges[0].max;
    }

    var seating = ''
    if(allEvents[id].seatmap){
        seating = allEvents[id].seatmap.staticUrl
    }

    var htmlCode = '<div class="wholeEvent" id="wholeEvent"><div class="eventStyle">';
    htmlCode += `<div class="singleEvent" id="singleEvent" style="position:relative; margin-top: 50px;" >`
    htmlCode += `<div class="title">`+title+`</div>`
    htmlCode += `<div class="eventDetails"> 
                <div class="row2">
                <div class="textDetails" id="textDetails">`
    htmlCode += `<div class="dataTitle">Date</div> <div>`+dateTime+`</div>`
    if(artists != "")
    {
        htmlCode += `<div class="dataTitle">Artist/Team</div><div>`+artists+`</div>`
    }
    htmlCode += `<div class="dataTitle">Venue</div><div>`+venue+`</div>`
    if(genres != '')
    {
        htmlCode += `<div class="dataTitle">Genres</div><div>`+genres+`</div>`
    }
    if(priceRange != ''){
        htmlCode += `<div class="dataTitle">Price Ranges</div><div>`+priceRange+`</div>`;
    }
    if(ticketStatus == "onsale")
    {
        htmlCode += `<div class="dataTitle">Ticket Status</div><div class="onsale"><span>On Sale</span></div>`
    }
    else if(ticketStatus == "offsale")
    {
        htmlCode += `<div class="dataTitle">Ticket Status</div><div class="offsale"><span>Off Sale</span></div>`
    }
    else if(ticketStatus == "cancelled")
    {
        htmlCode += `<div class="dataTitle">Ticket Status</div><div class="canceled"><span>Cancelled</span></div>`
    }
    else if(ticketStatus == "postponed")
    {
        htmlCode += `<div class="dataTitle">Ticket Status</div><div class="postponed"><span>Postponed</span></div>`
    }
    else if(ticketStatus == "rescheduled")
    {
        htmlCode += `<div class="dataTitle">Ticket Status</div><div class="rescheduled"><span>Rescheduled</span></div>`
    }
    if(TMLink != "")
    {
        htmlCode += `<div class="dataTitle">Buy Ticket At:</div><div><a class="tmLink" href="`+TMLink+`" target="_blank">Ticketmaster</a></div>`
    }
    htmlCode += `</div>`
    if(seating != "")
    {
        htmlCode+= `<div class="imageDetails" id="imageDetails"><img class="seatMap" src="`+seating+`" alt=""></div>`
    }
    htmlCode += `</div></div></div></div>`;
    htmlCode += `<div class="expand" id="expand"><span>Show Venue Details</span><br/><span class="arrow" onclick="showVenue(\'`+venue+`\')"><span class="leftArrow">|</span><span class="rightArrow">|</span></span></div><div class="venueDetail" id="venueDetail" style="display: none;"></div>`
    document.getElementById("container1").innerHTML = htmlCode;
    const next = document.getElementById('wholeEvent');
    next.scrollIntoView({ behavior: 'smooth' });
}

function showVenue(id){
    // console.log("Venue",allEvents[id])
    var localeAPI = "http://127.0.0.1:8000/getVenue?venue="+id
    var response = fetch(localeAPI)
    response.then(res => res.json())
    .then(function(data){
        singleEvent = data
    
        document.getElementById("expand").style.display = "none";
        document.getElementById("venueDetail").style.display = "block";
        var fullAddress = ""
        var htmlCode = `<div class="venue">`
        if(singleEvent._embedded.venues[0].name)
        {
            htmlCode += `<div class="venueName"> <span class="vName">`+singleEvent._embedded.venues[0].name+`</span></div>`
            fullAddress += singleEvent._embedded.venues[0].name+", "
        }
        if(singleEvent._embedded.venues[0].images)
        {
            htmlCode += `<div class="venueImage"><img height="60" width="" src="` + singleEvent._embedded.venues[0].images[0].url + `" alt=""></div>`
        }
        else
        {
            htmlCode += `<div class="venueImage"><img src="" alt=""></div>`
        }
        htmlCode += `<div class="row3"> <div class="addressDetail"> <div class="row4"> <div class="address">Address:</div> <div class="addressValue">`
        if(singleEvent._embedded.venues[0].address.line1)
        {
            htmlCode += `<span>`+singleEvent._embedded.venues[0].address.line1+`</span>`
            fullAddress += singleEvent._embedded.venues[0].address.line1+", "
        }
        else
        {
            htmlCode += `<span>N/A</span>`
        }
        htmlCode += `<br/>`
        if(singleEvent._embedded.venues[0].city.name)
        {
            htmlCode += `<span>`+singleEvent._embedded.venues[0].city.name+`,`
            fullAddress += singleEvent._embedded.venues[0].city.name+", "
        }
        else
        {
            htmlCode += `<span>N/A,`
        }
        if(singleEvent._embedded.venues[0].state.stateCode)
        {
            htmlCode += ` `+singleEvent._embedded.venues[0].state.stateCode+`</span><br/>`
            fullAddress += singleEvent._embedded.venues[0].state.stateCode+", "
        }
        else
        {
            htmlCode += ` N/A</span><br/>`
        }
        if(singleEvent._embedded.venues[0].postalCode)
        {
            htmlCode += `<span>`+singleEvent._embedded.venues[0].postalCode+`</span>`
            fullAddress += singleEvent._embedded.venues[0].postalCode
        }
        else
        {
            htmlCode += `<span>N/A</span>`
        }
        var venueLink = ""
        if(singleEvent._embedded.venues[0].url)
        {
            venueLink = singleEvent._embedded.venues[0].url
        }
        else
        {
            venueLink = "#"
        }
        htmlCode += `</div></div>`
        htmlCode += `<div class="mapLink"><a class="googleLink" href="https://www.google.com/maps/search/?api=1&query=`+fullAddress+`" target="_blank">Open in Google Maps</a></div>`
        htmlCode += `</div><div class="line"></div>`
        htmlCode += `<div class="moreDetails"><a class="venueLink" href="`+venueLink+`" target="_blank">More events at this venue</a></div></div></div>`
        document.getElementById("venueDetail").innerHTML = htmlCode;
        const next = document.getElementById('venueDetail');
        next.scrollIntoView({ behavior: 'smooth' });
    })
}

function clearTableArea(){
    document.getElementById("tableBody").innerHTML = "";
    document.getElementById("noRecord").style.display = "none";
    document.getElementById("fetchedData").style.display = "none";
}

function clearForm(){
    document.getElementById("tableBody").innerHTML = "";
    document.getElementById("noRecord").style.display = "none";
    document.getElementById("fetchedData").style.display = "none";
    document.getElementById("container1").innerHTML = "";
    document.getElementById("location").style.display = "block";
}
