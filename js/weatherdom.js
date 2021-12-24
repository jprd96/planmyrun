const input = document.querySelector('.input-location');
// const currentLocation = document.getElementById('.getLocation');
const updateDetails = document.querySelector('.updateDetails');
const forecast = new Forecast();
const updateUI = (data) => {
    // destructure properties
    // const { cityData, current, twelve, minuteCast } = data;
    const { cityData, current, twelve } = data;
    // console.log(data)

    // get 12 hour data
    var myHash = new Object();
    for(var i=0; i<twelve.length; i++) {
      var myTime = getDateTime(twelve[i]);
      var myTemp = getTemp(twelve[i]);
      var myWeather = getWeather(twelve[i]);
      var myPrecipitation = getPrecipitation(twelve[i]);
      myHash[i] = [myTime, myTemp, myWeather, myPrecipitation];
    }

    // raining now?
    var rain;
    rain = (current.HasPrecipitation == "false") ? "Yep" : "Nope";

    // get sunrise and sunset
    var lat = (cityData.GeoPosition['Latitude']);
    var long = (cityData.GeoPosition['Longitude']);
    var fs1 = "https://api.sunrise-sunset.org/json?lat=";
    var fs2 = fs1 + lat + "&lng=" + long + "&formatted=0";
    var sundata;
    fetch(fs2)
      .then(res => res.json())
      .then(sundata => {
        sunrise = new Date(sundata.results.sunrise);
        sunrise = formatTime(sunrise);
        sunset = new Date(sundata.results.sunset);
        sunset = formatTime(sunset)

        // print tables
        var html1 = `<br>
        <h6><u>Current</u></h6>
        <table class="table table-striped table-bordered table-condensed">
          <tr>
            <td>Location</td>
            <td>Temp</td>
            <td>Weather</td>
            <td>Rain?</td>
            <td>Sunrise</td>
            <td>Sunset</td>
          </tr>
          <tr>
            <td>${cityData.EnglishName},&nbsp;${cityData.AdministrativeArea.EnglishName}</td>
            <td>${current.Temperature.Imperial.Value}&nbsp;&deg;F</td>
            <td>${current.WeatherText}</td>
            <td>${rain}</td>
            <td>${sunrise}</td>
            <td>${sunset}</td>
          </tr>
        </table><br>
        <h6><u>Future</u></h6>
        <table class="table table-striped table-bordered table-condensed">
          <tr>
            <td>Hour</td>
            <td>Temp</td>
            <td>Weather</td>
            <td>Preciptation</td>
          </tr>`
        var html2 = ''
        for(var i in myHash) {
          html2 += `<tr>
                    <td>${myHash[i][0]}</td>
                    <td>${myHash[i][1]}</td>
                    <td>${myHash[i][2]}</td>
                    <td>${myHash[i][3]}</td>
                  </tr>`
        }
        var html3 = `</table>`
        updateDetails.innerHTML = html1 + html2 + html3

        function formatTime(date) {
          var minutes = date.getMinutes();
          var hours = date.getHours();
          var suffix = (hours >= 12) ? 'PM' : 'AM';
          hours = (hours > 12) ? hours - 12 : hours; // only -12 from hours if it is greater than 12 (if not, back at mid night)
          hours = (hours == '00') ? 12 : hours; // if 00 then it is 12 am
          var myTime = hours + ":" + minutes + " " + suffix
          return myTime.toString()
        }
      })
}

function getDateTime(date) {
  var date = new Date(date.EpochDateTime*1000);
  var month = date.getMonth()+1;
  var day = date.getDate();
  var hours = date.getHours();
  var suffix = (hours >= 12) ? 'PM' : 'AM';
  hours = (hours > 12) ? hours - 12 : hours; // only -12 from hours if it is greater than 12 (if not, back at mid night)
  hours = (hours == '00') ? 12 : hours; // if 00 then it is 12 am
  return hours + " " + suffix + "<br>" + month + "/" + day
}

function getTemp(temp) {
  return temp.Temperature.Value + " &deg;F"
}

function getWeather(weather) {
  return weather.IconPhrase
}

function getPrecipitation(prec) {
  return prec.PrecipitationProbability + "%"
}

var oops = '<br><p>Sorry, I only have the free version of AccuWeather\'s API. <br> Perhaps one day I\'ll upgrade.</p>'

input.addEventListener('submit',(e) => {
    e.preventDefault()
    const city = input.city.value.trim()
    localStorage.setItem('city', city)
    input.reset()
    input.city.blur()
    forecast.updateCity(city).then(data => updateUI(data))
      .catch(err => console.log(err))
      .catch(err => updateDetails.innerHTML=oops)
})

if(localStorage.getItem('city')) {
  forecast.updateCity(localStorage.getItem('city'))
    .then(data => updateUI(data))
    .catch(err => console.log(err))
}

// https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=AIzaSyDKTZVwlg1SO-JlyAH3LZd0F4qYsbjdh3g
