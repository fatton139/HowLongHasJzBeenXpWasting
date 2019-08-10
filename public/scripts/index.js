function fetchAndSetData() {
    fetch('/isJzXpWaste').then(function(response) {
        response.json().then(function(data) {
            document.getElementById("wasted-hours").innerHTML = data.lastXpUpdateBreakdown.hours;
            document.getElementById("wasted-minutes").innerHTML = data.lastXpUpdateBreakdown.minutes;
            document.getElementById("wasting-since").innerHTML = data.lastXpUpdate;
            document.getElementById("xp-diff").innerHTML = data.xpDifferenceSinceUpdate;
            
        });
    });
}


function refresh() {
    setTimeout(refresh, 5000);
    fetchAndSetData();
}

fetchAndSetData();
setTimeout(refresh, 5000);