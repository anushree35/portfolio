# Simple Python script for processing weather data
# This looks like beginner Python code

import requests
import json
from datetime import datetime

# Simple class to handle weather data
class WeatherProcessor:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"
    
    # Get weather data for airport
    def get_airport_weather(self, lat, lon):
        try:
            url = f"{self.base_url}?lat={lat}&lon={lon}&appid={self.api_key}&units=imperial"
            response = requests.get(url)
            data = response.json()
            return data
        except Exception as e:
            print(f"Error getting weather data: {e}")
            return None
    
    # Simple delay calculation (basic logic)
    def calculate_delay_risk(self, weather_data):
        if not weather_data:
            return {"error": "No weather data"}
        
        risk_score = 0
        risk_factors = []
        
        # Check temperature
        temp = weather_data['main']['temp']
        if temp < 32:
            risk_score += 30
            risk_factors.append("Freezing temperature")
        
        # Check wind
        if 'wind' in weather_data:
            wind_speed = weather_data['wind']['speed']
            if wind_speed > 15:
                risk_score += 25
                risk_factors.append("High winds")
        
        # Check weather conditions
        condition = weather_data['weather'][0]['main'].lower()
        if 'rain' in condition:
            risk_score += 20
            risk_factors.append("Rain")
        elif 'snow' in condition:
            risk_score += 40
            risk_factors.append("Snow")
        elif 'storm' in condition:
            risk_score += 50
            risk_factors.append("Storm")
        
        # Determine risk level
        if risk_score < 20:
            risk_level = "low"
        elif risk_score < 50:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        return {
            "risk_score": min(risk_score, 100),
            "risk_level": risk_level,
            "factors": risk_factors,
            "timestamp": datetime.now().isoformat()
        }
    
    # Save data to file (simple file handling)
    def save_weather_data(self, airport_code, weather_data, delay_info):
        filename = f"weather_data_{airport_code}_{datetime.now().strftime('%Y%m%d')}.json"
        
        data_to_save = {
            "airport": airport_code,
            "weather": weather_data,
            "delay_prediction": delay_info,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            with open(filename, 'w') as f:
                json.dump(data_to_save, f, indent=2)
            print(f"Data saved to {filename}")
        except Exception as e:
            print(f"Error saving data: {e}")

# Simple function to test the weather processor
def test_weather_processor():
    # You need to get a free API key from OpenWeatherMap
    api_key = "YOUR_API_KEY_HERE"
    
    if api_key == "YOUR_API_KEY_HERE":
        print("Please set your OpenWeatherMap API key!")
        return
    
    # Test with JFK airport coordinates
    processor = WeatherProcessor(api_key)
    weather = processor.get_airport_weather(40.6413, -73.7781)
    
    if weather:
        print("Weather data retrieved successfully!")
        delay_info = processor.calculate_delay_risk(weather)
        print(f"Delay risk: {delay_info}")
        
        # Save the data
        processor.save_weather_data("JFK", weather, delay_info)
    else:
        print("Failed to get weather data")

# Run the test if this script is executed directly
if __name__ == "__main__":
    test_weather_processor()
