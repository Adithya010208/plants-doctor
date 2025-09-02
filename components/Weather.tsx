import React, { useState, useEffect, useCallback } from 'react';
import { getWeather } from '../services/geminiService';
import type { WeatherData } from '../types';
import { SunIcon, WindIcon, DropletsIcon, ThermometerIcon, AlertTriangleIcon } from './Icons';

export const Weather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFetchWeather = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    try {
      const data = await getWeather(lat, lon);
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleFetchWeather(latitude, longitude);
        },
        () => {
          setError("Location permission denied. Please enable it in your browser settings to see local weather.");
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  }, [handleFetchWeather]);

  if (isLoading) {
    return <div className="text-center p-8">Loading weather data for your location...</div>
  }

  if (error) {
     return (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md flex items-center">
          <AlertTriangleIcon className="h-5 w-5 mr-3"/>
          <p>{error}</p>
        </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto">
       <div className="text-left mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Agricultural Weather</h2>
        <p className="mt-2 text-md text-gray-600 dark:text-gray-300">Hyper-local forecasts to optimize your farming decisions.</p>
      </div>

      {weatherData && (
        <div className="space-y-8">
          {/* Current Conditions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 p-6 bg-primary-600 text-white rounded-2xl shadow-lg flex flex-col justify-center items-center text-center">
                 <SunIcon className="w-20 h-20 mb-2" />
                 <div className="text-6xl font-extrabold">{weatherData.current.temp_c}°C</div>
                 <div className="text-2xl capitalize">{weatherData.current.condition}</div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                 <InfoCard icon={DropletsIcon} label="Humidity" value={`${weatherData.current.humidity}%`} />
                 <InfoCard icon={WindIcon} label="Wind Speed" value={`${weatherData.current.wind_kph} kph`} />
                 <InfoCard icon={SunIcon} label="UV Index" value={weatherData.current.uv_index.toString()} />
                 <InfoCard icon={DropletsIcon} label="Precipitation" value={`${weatherData.current.precip_mm} mm`} />
                 <InfoCard icon={ThermometerIcon} label="Soil Temp" value={`${weatherData.soil.temperature_c}°C`} />
                 <InfoCard icon={DropletsIcon} label="Soil Moisture" value={`${weatherData.soil.moisture_percent}%`} />
            </div>
          </div>
          {/* Forecast */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">3-Day Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                  <div className="font-bold text-xl text-gray-800 dark:text-gray-100">{day.day}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">{day.date}</div>
                  <div className="flex items-center my-2">
                      <SunIcon className="w-10 h-10 mr-4 text-yellow-500"/>
                      <div>
                        <span className="text-lg font-medium capitalize">{day.condition}</span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Rain: {day.chance_of_rain}%</div>
                      </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 text-md">
                    <div className="flex items-center text-red-500 font-semibold"><ThermometerIcon className="w-5 h-5 mr-1"/>{day.max_temp_c}°C</div>
                    <div className="flex items-center text-blue-500 font-semibold"><ThermometerIcon className="w-5 h-5 mr-1"/>{day.min_temp_c}°C</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoCard: React.FC<{icon: React.FC<{className: string;}>, label: string, value: string}> = ({ icon: Icon, label, value}) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg flex items-center">
        <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full mr-4">
            <Icon className="w-6 h-6 text-primary-600 dark:text-primary-300" />
        </div>
        <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
            <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{value}</div>
        </div>
    </div>
);
