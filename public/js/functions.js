let showError = (errormsg) => {
    document.getElementById("msg_user").textContent = errormsg;
    document.getElementById("cityname").textContent = "";
    document.getElementById("msg_user").setAttribute("style", "font-weight: bold; color: red;");
}

let jumpToTopOfPage = () => window.scrollTo({ top: 0, behavior: `smooth` });

function showErrorModal(errorMsg) {
    document.querySelector("#ModalErrorInfoShow").textContent = errorMsg;
    $('#exampleModal').modal('show')
    console.error(errorMsg)
}

/* Load on first run */
async function loadFirstTime()
{
    try {
        let getIPAddr = await fetch("https://ipv4.icanhazip.com/")
        let getIPAddrText = await getIPAddr.text()
        let getIPAddrData = await getIPAddrText.replace(/(\r\n|\n|\r)/gm,""); /* Strip out any white spaces or newlines*/
        let callWeatherAPI = await fetch(`${window.location.origin}/api/getWeather?ip=${getIPAddrData}`)
        changeStyle(await callWeatherAPI.json())
    } catch (error) {
        showErrorModal(`There was an error while trying to load the page: ${error}`)
    }

}

/* Listen on Enter button - Trigger callOnZip */

document.addEventListener("keyup", (e) => {
    /* 
    Check to see if the 'Enter' key was the key pressed 
    NOTE: keep the 'keyCode' (even if its depricated)
    */

    if (e.key === 'Enter' || e.keyCode === 13) {
        if($('#exampleModal').hasClass('show') == false)
        {
            callOnZip();
        }
        if($('#exampleModal').hasClass('show') == true) 
        {
            $('#exampleModal').modal('toggle')
        }
    }
})

/* Load on user entering a zipcode */
async function callOnZip()
{
    let zip = document.getElementById("zipCodeForm").value;
    let countrySelect = document.getElementById("countrySelect").value;

    if(zip.length == 0) {
        showErrorModal( "The zip code field is empty! Enter a valid zip code!");
    } else {
        try {
            let getZipRes = await fetch(`${window.location.origin}/api/getWeather?zip=${zip}&countrySelect=${countrySelect}`)
            changeStyle(await getZipRes.json())
        } catch (error) {
            showErrorModal(`There was an error while trying to get Weather info from your chosen zip code: ${error}`)
        }
    }
}

/* Geo Location functions */
function geoError()
{
    document.getElementById("msg_user").textContent = "Unable to get your location. Did you decline the permission box?";
    document.getElementById("city_name").textContent = "";
    document.getElementById("msg_user").setAttribute("style", "font-weight: bold; color: red;");
    jumpToTopOfPage();
}

async function geoProcess(position) {
    document.getElementById("msg_user").textContent = "Getting Data...";
    document.getElementById("weather_icon").setAttribute("src", "./media/loading.gif");
    document.getElementById("msg_user").setAttribute("style", "font-weight: bold; color: silver;");
    document.getElementById("city_name").textContent = "";

    let positionArray = [(position.coords.latitude).toFixed(7), (position.coords.longitude).toFixed(7)];

    try {
        let getGeoData = await fetch(`${window.location.origin}/api/getWeather?geoip=${positionArray[0]},${positionArray[1]}`)
        changeStyle(await getGeoData.json())
    } catch (error) {
        showErrorModal(`There was an error while trying to get Weather info from your Geolocation: ${error}`)
    }

}

function callOnGeo()
{
    /* Check if geolocation is supported on the browser */
    if(!navigator.geolocation)
    {
        showError("Geolocation is not supported for your browser")
        jumpToTopOfPage();
    }
    else
    {
        document.getElementById("msg_user").textContent = "Attempting to get your location..."
        document.getElementById("msg_user").setAttribute("style", "font-weight: bold; color: silver;")
        document.getElementById("city_name").textContent = "";
        navigator.geolocation.getCurrentPosition(geoProcess, geoError);
    }
}


/* Changes the actual page style */
function changeStyle(results)
{
    document.getElementById("msg_user").setAttribute("style", "")

    if(results['status'] == 1)
    {
        /* Add/Change Weather Data */       
        for (var key of Object.keys(results['weather_response'])) 
        {
            if(key != "weather_icon")
            {
                document.getElementById(key).textContent = results['weather_response'][key];
            }
            else if(key == "weather_icon")
            {
                document.getElementById(key).setAttribute("src", results['weather_response'][key]);
            }
        }
        /* Change CSS */
        for (var key of Object.keys(results['css'])) 
        {
            try {
                if(results['css'][key][0] == "src")
                {
                    document.getElementById(key).setAttribute("src", results['css'][key][1])
                }
                else if(results['css'][key][0] == "style")
                {
                    document.getElementById(key).setAttribute("style", results['css'][key][1])
                }
                else if(results['css'][key][0] == "txt")
                {
                    document.getElementById(key).textContent = results['css'][key][1]
                }
                else if(results['css'][key][0] == "style-class")
                {
                    var allClassesNames = document.getElementsByClassName(key);
                    for (var i = 0; i < allClassesNames.length; i++) {
                        allClassesNames[i].setAttribute("style", results['css'][key][1]);
                    }
                }
            }
            catch(err)
            {
                console.log("ERROR: " + err + " -> " + key)
            }

        }
    }
    else if(results['status'] == 0)
    {
        document.getElementById("msg_user").textContent = "There was an error: " + results['message'];
        document.getElementById("city_name").textContent = "";
        document.getElementById("msg_user").setAttribute("style", "font-weight: bold; color: red;");
        jumpToTopOfPage();
    }
}