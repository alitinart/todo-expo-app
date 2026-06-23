import { useEffect, useState } from "react";
import AppText from "./ui/AppText";
import { colors } from "@/utils/theme";
import { View, StyleSheet } from "react-native";

function interpretWeatherCode(code: number, isDay: boolean) {
  if (code === 0) return { emoji: isDay ? "☀️" : "🌙", label: "Clear" };
  if (code <= 2) return { emoji: "⛅", label: "Partly cloudy" };
  if (code === 3) return { emoji: "☁️", label: "Overcast" };
  if (code <= 49) return { emoji: "🌫️", label: "Foggy" };
  if (code <= 59) return { emoji: "🌦️", label: "Drizzle" };
  if (code <= 69) return { emoji: "🌧️", label: "Rain" };
  if (code <= 79) return { emoji: "❄️", label: "Snow" };
  if (code <= 84) return { emoji: "🌨️", label: "Rain showers" };
  if (code <= 94) return { emoji: "⛈️", label: "Thunderstorm" };
  return { emoji: "🌩️", label: "Severe storm" };
}

interface WeatherData {
  temp: number;
  feelsLike: number;
  high: number;
  low: number;
  emoji: string;
  label: string;
  rainChance: number;
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const LAT = 42.6629;
    const LON = 21.1655;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
        `&current=temperature_2m,apparent_temperature,weather_code,is_day` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&timezone=auto&forecast_days=1`,
    )
      .then((r) => r.json())
      .then((d) => {
        const code = d.current.weather_code;
        const isDay = d.current.is_day === 1;
        const { emoji, label } = interpretWeatherCode(code, isDay);
        setWeather({
          temp: Math.round(d.current.temperature_2m),
          feelsLike: Math.round(d.current.apparent_temperature),
          high: Math.round(d.daily.temperature_2m_max[0]),
          low: Math.round(d.daily.temperature_2m_min[0]),
          rainChance: d.daily.precipitation_probability_max[0] ?? 0,
          emoji,
          label,
        });
      })
      .catch(() => setWeather(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={weatherStyles.card}>
        <AppText variant="caption" color={colors.gray}>
          Loading weather…
        </AppText>
      </View>
    );
  }

  if (!weather) return null;

  return (
    <View style={weatherStyles.card}>
      <View style={weatherStyles.decorativeCircle} />

      <View style={weatherStyles.row}>
        <AppText variant="caption" color={colors.gray} weight="medium">
          📍 Pristina
        </AppText>
        {weather.rainChance > 0 && (
          <AppText variant="caption" color={colors.gray}>
            💧 {weather.rainChance}% rain
          </AppText>
        )}
      </View>

      {/* Main row: big temp + condition */}
      <View style={weatherStyles.mainRow}>
        <AppText style={weatherStyles.tempText}>{weather.emoji}</AppText>
        <View style={weatherStyles.tempBlock}>
          <AppText weight="bold" variant="h2" color={colors.primary}>
            {weather.temp}°C
          </AppText>
          <AppText variant="caption" color={colors.gray}>
            {weather.label}
          </AppText>
        </View>
      </View>

      <AppText center weight="bold" variant="caption" color={colors.muted}>
        Good weather to complete some tasks
      </AppText>
    </View>
  );
}

const weatherStyles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    gap: 8,
  },
  decorativeCircle: {
    width: 96,
    height: 96,
    backgroundColor: colors.secondaryForeground,
    borderRadius: 99,
    position: "absolute",
    bottom: -40,
    right: -12,
    zIndex: -1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  tempText: {
    fontSize: 36,
  },
  tempBlock: {
    gap: 2,
  },
  hiloBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
});
