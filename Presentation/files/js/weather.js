/*!
* DisplayMonkey source file
* http://displaymonkey.org
*
* Copyright (c) 2015 Fuel9 LLC and contributors
*
* Released under the MIT license:
* http://opensource.org/licenses/MIT
*/

// 2015-03-08 [LTL] - weather BEGIN
// 2015-05-08 [LTL] - ready callback
// 2016-03-27 [LTL] - fixed onSuccess

function degToCompass(num) {
    var val = Math.floor((num / 22.5) + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}

function dayOfWeek(datum) {
    var d = new Date(datum);
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    var n = weekday[d.getDay()];
    return n;
}


DM.Weather = Class.create(/*PeriodicalExecuter*/ DM.FrameBase, {
    initialize: function ($super, options) {
        "use strict";
        $super(options, 'div.weather');
        var data = options.panel.data;
        this.weatherType = data.Type || 0;
        this.tempU = data.TemperatureUnit || _canvas.temperatureUnit;
        this.woeid = data.Woeid || _canvas.woeid;

        this.culture = _canvas.culture;
        this.location = data.Location;

        this._callback();
    },

    _callback: function () {
        "use strict";
        if (this.exiting || this.updating)
            return;

        this.updating = true;
        new Ajax.Request("getWeather.ashx", {
            method: 'get',
            parameters: $H({
                frame: this.frameId,
                panel: this.panelId,
                display: _canvas.displayId,
                woeid: this.woeid,
                tempU: this.tempU,
                culture: this.culture,
                location: this.location,
                latitude: _canvas.latitude,
                longitude: _canvas.longitude

            }),
            evalJSON: false,
            weather: this,

            onSuccess: function (resp) {
                var weather = resp.request.options.weather;
                try {
                    if (weather.exiting)
                        return;

                    var json = null;
                    if (resp.responseText.isJSON())
                        json = resp.responseText.evalJSON();
                    if (!json)
                        throw new Error("JSON expected"); // <-- shouldn't get here

                    if (json.Error)
                        throw new Error(json.Error);

                    if (json.city) {
                        weather.div.select('.city_name').each(function (e) { e.update(json.city.name); });
                        weather.div.select('.city_country').each(function (e) { e.update(json.city.country); });
                    }

                    if (json.list) {
                        weather.div.select('.list_wind_speed').each(function (e) { e.update(Math.round(json.list[0].wind.speed)); });
                        weather.div.select('.list_wind_deg').each(function (e) { e.update(degToCompass(json.list[0].wind.deg)); });
                        weather.div.select('.list_weather_description').each(function (e) { e.update(json.list[0].weather[0].description); });
                        weather.div.select('.list_main_temp').each(function (e) { e.update(Math.round(json.list[0].main.temp)); });

                        var currentdate = new Date(json.list[0].dt_txt);
                        weather.div.select('.currentday').each(function (e) { e.update(dayOfWeek(currentdate)); });
  
                        var currentIconCode = json.list[0].weather[0].icon;
                        //alert(currentIconCode);
                        
                        if (currentIconCode.substring(2, 3) === 'd') {
                            weather.div.select('.currenticon').each(function (e) { e.update("<span class='wu wu-black wu-64 ow-" + currentIconCode + "'></span>"); });
                            weather.div.select('.currenticon_L').each(function (e) { e.update("<span class='wu wu-black wu-128 ow-" + currentIconCode + "'></span>"); });
                        }
                        else {
                        weather.div.select('.currenticon').each(function (e) { e.update("<span class='wu wu-night wu-black wu-64 ow-" + currentIconCode + "'></span>"); });
                            weather.div.select('.currenticon_L').each(function (e) { e.update("<span class='wu wu-night wu-black wu-128 ow-" + currentIconCode + "'></span>"); });
                        }
                        
                        var j = 0;
                        for (var k = 0; k < json.cnt; k++) {

                            var hh = json.list[k].dt_txt.substring(11, 13);  
                           
                            if ( hh === '12' ) {

                               // if (json.list[k].sys.pod === "d") {
                                var dd = json.list[k].dt_txt.substring(0, 10);
                                
                                    //while (j <3) {

                                        weather.div.select('.day' + j).each(function (e) { e.update(dayOfWeek(dd)); });
                                        weather.div.select('.list_main_temp_d_' + j).each(function (e) { e.update(json.list[k].main.temp.toFixed(1)); });

                                        var iconCode = json.list[k].weather[0].icon;    
                                        //if (json.list[k].sys.pod === 'd') {

                                            weather.div.select('.icon_d_' + j).each(function (e) { e.update("<span class='wu wu-black wu-64 ow-" + iconCode + "'></span>"); });
                                       // }
                                        //else {
                                        //    weather.div.select('.icon_d_' + j).each(function (e) { e.update("<span class='wu wu-night wu-black wu-64 ow-" + iconCode + "'></span>"); });
                                        //}
                                        var dn = json.list[k].dt_txt.substring(0, 10);
                                        weather.div.select('.night' + j).each(function (e) { e.update(dayOfWeek(dn)); });
                                        if ((k+4) <= json.cnt) {
                                        weather.div.select('.list_main_temp_n_' + j).each(function (e) { e.update(json.list[k + 4].main.temp.toFixed(1)); });

                                            iconCode = json.list[k + 4].weather[0].icon;   
                                        }
                                       
                                        //if (json.list[k + 4].sys.pod === 'd') {

                                        //    weather.div.select('.icon_d_' + j).each(function (e) { e.update("<span class='wu wu-black wu-64 ow-" + iconCode + "'></span>"); });
                                        //}
                                        //else {
                                            weather.div.select('.icon_n_' + j).each(function (e) { e.update("<span class='wu wu-night wu-black wu-64 ow-" + iconCode + "'></span>"); });
                                        //}
                                        //weather.div.select('.icon_n_' + j).each(function (e) { e.update("<span class='wu wu-night wu-black wu-64 ow-" + iconCode + "'></span>"); });

                                       // //weather.div.select('.day' + j).each(function (e) { e.update(dayOfWeek(dd)); });
                                       // //weather.div.select('.list_main_temp_d_' + j).each(function (e) { e.update(json.list[k].main.temp); });
                                       // alert(json.list[k].main.temp);

                                       // //var iconCodeDay = json.list[k].weather[0].icon;
                                       // //weather.div.select('.icon_d_' + j).each(function (e) { e.update("<span class='wu wu-black wu-64 ow-" + iconCodeDay + "'></span>"); });
                                       //// var dn = json.list[k + 1].dt_txt.substring(0, 10);
                                       
                                       // weather.div.select('.night' + j).each(function (e) { e.update(dayOfWeek(dn)); });
                                       // weather.div.select('.list_main_temp_n_' + j).each(function (e) { e.update(json.list[k + 4].main.temp.toFixed(1)); });

                                       // //var iconCodeNight = json.list[k + 4].weather[0].icon;
                                       // weather.div.select('.icon_n_' + j).each(function (e) { e.update("<span class='wu wu-night wu-black wu-64 ow-" + iconCodeNight + "'></span>"); });
                                        
                                       // break;
                                   // }
                                    j++;                                    
                                
                            }
                            
                        }

                    }

                    if (json.location) {
                        weather.div.select('.location_city').each(function (e) { e.update(json.location.city); });
                        weather.div.select('.location_region').each(function (e) { e.update(json.location.region); });
                        weather.div.select('.location_country').each(function (e) { e.update(json.location.country); });
                    }

                    if (json.condition) {
                        weather.div.select('.condition_code').each(function (e) { e.src = "files/weather/" + json.condition.code + ".gif"; });
                        weather.div.select('.condition_text').each(function (e) { e.update(json.condition.text); });
                        weather.div.select('.condition_temp').each(function (e) { e.update(json.condition.temp); });
                    }

                    if (json.wind) {
                        weather.div.select('.wind_speed').each(function (e) { e.update(Math.round(json.wind.speed)); });
                        weather.div.select('.wind_direction').each(function (e) { e.update(degToCompass(json.wind.direction)); });
                    }

                    if (json.units) {
                        weather.div.select('.units_temperature').each(function (e) { e.update(json.units.temperature); });
                        weather.div.select('.units_speed').each(function (e) { e.update(json.units.speed); });
                    }


                    if (json.current_observation) {
                        var iconname = json.current_observation.icon;
                        if (iconname.length === 0) //weather station hasn't got weather info, pick todays forecast icon if available
                        {
                            if (json.forecast) {
                                if (json.forecast.txt_forecast) {
                                    iconname = json.forecast.txt_forecast.forecastday[0].icon;
                                    if (iconname.startsWith("nt_")) {
                                        iconname = icon.substring(3) + " wu-night";
                                    }
                                }
                            }
                        } else {

                            if (iconname.startsWith("nt_")) //nt_ is missing at current_observation.icon but might be added like in the forecast in the future
                            {
                                iconname = iconname.substring(3);
                            }
                            if (json.current_observation.icon_url.indexOf("/nt_") !== -1) {
                                iconname = iconname + " wu-night";
                            }
                            
                            weather.div.select('.location_city').each(function (e) { e.update(json.current_observation.display_location.city); });
                            weather.div.select('.location_region').each(function (e) { e.update(json.current_observation.display_location.state); });
                            weather.div.select('.location_country').each(function (e) { e.update(json.current_observation.display_location.country); });
                            weather.div.select('.condition_code').each(function (e) { e.src = json.current_observation.icon_url; });
                            weather.div.select('.weather_icon').each(function (e) { e.update("<span class='wu wu-black wu-64 wu-" + iconname + "'></span>"); });
                            weather.div.select('.weather_icon_l').each(function (e) { e.update("<span class='wu wu-black wu-128 wu-" + iconname + "'></span>"); });
                            weather.div.select('.weather_icon_xl').each(function (e) { e.update("<span class='wu wu-black wu-256 wu-" + iconname + "'></span>"); });
                            weather.div.select('.weather_icon_inv').each(function (e) { e.update("<span class='wu wu-white wu-64 wu-" + iconname + "'></span>"); });
                            weather.div.select('.weather_icon_inv_l').each(function (e) { e.update("<span class='wu wu-white wu-128 wu-" + iconname + "'></span>"); });
                            weather.div.select('.weather_icon_inv_xl').each(function (e) { e.update("<span class='wu wu-white wu-256 wu-" + iconname + "'></span>"); });
                            weather.div.select('.condition_text').each(function (e) { e.update(json.current_observation.weather); });
                            weather.div.select('.condition_temp_f').each(function (e) { e.update(json.current_observation.temp_f); });
                            weather.div.select('.condition_temp_c').each(function (e) { e.update(json.current_observation.temp_c); });
                            weather.div.select('.feelslike_f').each(function (e) { e.update(json.current_observation.feelslike_f); });
                            weather.div.select('.feelslike_c').each(function (e) { e.update(json.current_observation.feelslike_c); });
                            weather.div.select('.wind_speed_mph').each(function (e) { e.update(json.current_observation.wind_mph); });
                            weather.div.select('.wind_speed_kph').each(function (e) { e.update(json.current_observation.wind_kph); });
                            weather.div.select('.wind_gust_mph').each(function (e) { e.update(json.current_observation.wind_gust_mph); });
                            weather.div.select('.wind_gust_kph').each(function (e) { e.update(json.current_observation.wind_gust_kph); });
                            weather.div.select('.wind_direction').each(function (e) { e.update(json.current_observation.wind_dir); });
                            weather.div.select('.visibility_m').each(function (e) { e.update(json.current_observation.visibility_mi); });
                            weather.div.select('.visibility_k').each(function (e) { e.update(json.current_observation.visibility_km); });
                            weather.div.select('.uv').each(function (e) { e.update(json.current_observation.UV); });
                    
                        }
                    }

                        if (json.forecast)
                        {
                            if (json.forecast.txt_forecast) {
                                var icon;
                                for (var i = 0; i < 20; i++) {
                                    if (json.forecast.txt_forecast.forecastday[i])
                                    {
                                        icon = json.forecast.txt_forecast.forecastday[i].icon;
                                        if (icon.startsWith("nt_")) {
                                            icon = icon.substring(3) + " wu-night";
                                        }
                                        weather.div.select('.forecast_icon_' + i).each(function (e) { e.update("<span class='wu wu-black wu-64 wu-" + icon + "'></span>"); });
                                        weather.div.select('.forecast_icon_inv_' + i).each(function (e) { e.update("<span class='wu wu-white wu-64 wu-" + icon + "'></span>"); });
                                        weather.div.select('.forecast_icon_l_' + i).each(function (e) { e.update("<span class='wu wu-black wu-128 wu-" + icon + "'></span>"); });
                                        weather.div.select('.forecast_icon_inv_l_' + i).each(function (e) { e.update("<span class='wu wu-white wu-128 wu-" + icon + "'></span>"); });
                                        weather.div.select('.forecast_icon_xl_' + i).each(function (e) { e.update("<span class='wu wu-black wu-256 wu-" + icon + "'></span>"); });
                                        weather.div.select('.forecast_icon_inv_xl_' + i).each(function (e) { e.update("<span class='wu wu-white wu-256 wu-" + icon + "'></span>"); });
                                        weather.div.select('.forecast_title_' + i).each(function (e) { e.update(json.forecast.txt_forecast.forecastday[i].title); });
                                        weather.div.select('.forecast_text_' + i).each(function (e) { e.update(json.forecast.txt_forecast.forecastday[i].fcttext); });
                                        weather.div.select('.forecast_text_metric_' + i).each(function (e) { e.update(json.forecast.txt_forecast.forecastday[i].fcttext_metric); });
                                        weather.div.select('.forecast_pop_' + i).each(function (e) { e.update(json.forecast.txt_forecast.forecastday[i].pop); });
                                    }
                                }
                            }
                            if (json.forecast.simpleforecast) {
                                for (var c = 0; c < 10; c++) {
                                    if (json.forecast.simpleforecast.forecastday[i])
                                    {
                                        weather.div.select('.forecast_low_f_' + i).each(function (e) { e.update(json.forecast.simpleforecast.forecastday[i].low.fahrenheit); });
                                        weather.div.select('.forecast_low_c_' + i).each(function (e) { e.update(json.forecast.simpleforecast.forecastday[i].low.celsius); });
                                        weather.div.select('.forecast_high_f_' + i).each(function (e) { e.update(json.forecast.simpleforecast.forecastday[i].high.fahrenheit); });
                                        weather.div.select('.forecast_high_c_' + i).each(function (e) { e.update(json.forecast.simpleforecast.forecastday[i].high.celsius); });
                                    }
                                }
                            }
                        }
                    
                }

                catch (e) {
                    new DM.ErrorReport({ exception: e, data: resp.responseText, source: "Weather::callBack::onSuccess" });
                }
            
                finally {
                    weather.updating = false;
                    //console.log(resp.responseText);
                    weather.ready();
                }           
            },

            onFailure: function (resp) {
                var weather = resp.request.options.weather;
                new DM.ErrorReport({ exception: resp, source: "Weather::callBack::onFailure" });
                weather.updating = false;
                weather.ready();
            }
        });
    }
});

// weather END
