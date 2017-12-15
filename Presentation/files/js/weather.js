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

DM.Weather = Class.create(/*PeriodicalExecuter*/ DM.FrameBase, {
    initialize: function ($super, options) {
        "use strict";
        $super(options, 'div.weather');
        var data = options.panel.data;
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

                    if (json.current_observation) {
                        var iconname = json.current_observation.icon;
                        if (iconname.startsWith("nt_")) //nt_ is missing at current_observation.icon but might be added like in the forecast in the future
                        {
                            iconname = iconname.substring(3);
                        }
                        if (json.current_observation.icon_url.indexOf("/nt_") !== -1)
                        {
                            iconname = iconname + " wu-night";
                        }

                        weather.div.select('.location_city').each(function (e) { e.update(json.current_observation.display_location.city); });
                        weather.div.select('.location_region').each(function (e) { e.update(json.current_observation.display_location.state); });
                        weather.div.select('.location_country').each(function (e) { e.update(json.current_observation.display_location.country); });
                        weather.div.select('.condition_code').each(function (e) { e.src = json.current_observation.icon_url; });
                        weather.div.select('.weather_icon').each(function (e) { e.update("<span class='wu wu-black wu-64 wu-" + iconname + "'></span>"); });
                        weather.div.select('.weather_icon_big').each(function (e) { e.update("<span class='wu wu-black wu-256 wu-" + iconname + "'></span>"); });
                        weather.div.select('.condition_text').each(function (e) { e.update(json.current_observation.weather); });
                        weather.div.select('.condition_temp_f').each(function (e) { e.update(json.current_observation.temp_f); });
                        weather.div.select('.condition_temp_c').each(function (e) { e.update(json.current_observation.temp_c); });
                        weather.div.select('.wind_speed_mph').each(function (e) { e.update(json.current_observation.wind_mph); });
                        weather.div.select('.wind_speed_kph').each(function (e) { e.update(json.current_observation.wind_kph); });
                        weather.div.select('.wind_direction').each(function (e) { e.update(json.current_observation.wind_dir); });
                    }

                    if (json.forecast.txt_forecast) {
                        var icon;
                        for (var i = 0; i < 4; i++) {
                            icon = json.forecast.txt_forecast.forecastday[i].icon
                            if (icon.startsWith("nt_")) {
                                icon = icon.substring(3) + " wu-night";
                            }
                            weather.div.select('.forecast_icon_' + i).each(function (e) { e.update("<span class='wu wu-black wu-128 wu-" + icon + "'></span>"); });
                            weather.div.select('.forecast_title_' + i).each(function (e) { e.update(json.forecast.txt_forecast.forecastday[i].title); });
                            weather.div.select('.forecast_text_' + i).each(function (e) { e.update(json.forecast.txt_forecast.forecastday[i].fcttext); });
                            weather.div.select('.forecast_text_metric_' + i).each(function (e) { e.update(json.forecast.txt_forecast.forecastday[i].fcttext_metric); });
                        }
                    }
                    if (json.forecast.simpleforecast) {
                        for (var i = 0; i < 4; i++) {
                            weather.div.select('.forecast_low_f_' + i).each(function (e) { e.update(json.forecast.simpleforecast.forecastday[i].low.fahrenheit); });
                            weather.div.select('.forecast_low_c_' + i).each(function (e) { e.update(json.forecast.simpleforecast.forecastday[i].low.celsius); });
                            weather.div.select('.forecast_high_f_' + i).each(function (e) { e.update(json.forecast.simpleforecast.forecastday[i].high.fahrenheit); });
                            weather.div.select('.forecast_high_c_' + i).each(function (e) { e.update(json.forecast.simpleforecast.forecastday[i].high.celsius); });
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
            },
        });
    },
});

// weather END
