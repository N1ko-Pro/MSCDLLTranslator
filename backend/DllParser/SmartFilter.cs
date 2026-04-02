using System;
using System.Linq;
using System.Text.RegularExpressions;

namespace DllParser
{
    public static class SmartFilter
    {
        public static bool IsTranslatableText(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return false;

            string trimmed = text.Trim();
            if (trimmed.Length <= 1) return false; // Игнорируем единичные буквы или пустые строки

            // 0. Защита Unity Rich Text: если строка содержит теги форматирования, это 100% текст из UI, мы обязаны его сохранить
            if (trimmed.Contains("<color=") || trimmed.Contains("<b>") || trimmed.Contains("<i>") || trimmed.Contains("<size="))
                return true;

            // 1. Игнорируем пути к файлам и расширения
            string lower = trimmed.ToLowerInvariant();
            string[] extensions = { ".prefab", ".unity3d", ".png", ".jpg", ".save", ".dll", ".txt", ".json", ".xml", ".asset", ".mat", ".ogg", ".wav", ".mp3", ".ttf", ".bundle" };
            if (extensions.Any(e => lower.EndsWith(e) || lower.Contains(e))) return false;

            // 2. Игнорируем пути Transform (иерархию объектов Unity)
            if (trimmed.Contains("(Clone)")) return false;

            if (trimmed.Contains("/"))
            {
                var parts = trimmed.Split('/');
                // Если 2 и более слеша (например "Database/DatabaseOrders/Racing Carburators" или "SATSUMA(...)/CarSimulation/Exhaust/...")
                if (parts.Length > 2) return false;
                // Один слеш, но без пробелов вокруг элементов (например "Sound/Click")
                if (!trimmed.Contains(" ")) return false;
            }
            if (trimmed.Contains("\\") && !trimmed.Contains(" ")) return false;

            // 3. Игнорируем стандартные технические объекты Unity и переменные
            string[] techKeywords = { " Canvas", " Panel", " Text", " Clone", " Manager", " Controller", " Handler", " MSCCoreLibrary" };
            if (techKeywords.Any(k => trimmed.EndsWith(k, StringComparison.OrdinalIgnoreCase) || trimmed.Equals(k.Trim(), StringComparison.OrdinalIgnoreCase))) return false;

            if (trimmed.StartsWith("UI_", StringComparison.OrdinalIgnoreCase) || trimmed.StartsWith("BTN_", StringComparison.OrdinalIgnoreCase)) return false;

            // 4. Фильтр переменных (CamelCase, PascalCase, kebab-case) если в тексте нет пробелов
            if (!trimmed.Contains(" "))
            {
                // Отсекаем полностью слова состоящие из маленьких букв с дефисами или точками:
                // "window", "box", "boost-gauge", "intercooler-main", "boost-gauge-needle"
                // Нормальные переводы из 1 слова всегда пишутся с Большой Буквы!
                if (Regex.IsMatch(trimmed, @"^[a-z0-9\-_.]+$")) return false;

                // Если есть знак подчеркивания, это тоже скорее всего переменная или ID (player_money)
                if (trimmed.Contains("_")) return false;

                // Переход с нижнего регистра на верхний (например 'layerMoney' в 'PlayerMoney')
                if (Regex.IsMatch(trimmed, @"[a-z][A-Z]")) return false;

                // Последовательность заглавных, затем строчная (например 'GUIu' в 'GUIuse')
                if (Regex.IsMatch(trimmed, @"[A-Z]{2,}[a-z]")) return false;

                // Строки, состоящие только из заглавных букв и цифр (например 'YARD', 'ID123')
                // Мы сохраняем популярные короткие "человеческие" слова-исключения: OK, ON, OFF
                if (Regex.IsMatch(trimmed, @"^[A-Z0-9]+$") && trimmed != "OK" && trimmed != "ON" && trimmed != "OFF" && trimmed != "YES" && trimmed != "NO") return false;
            }

            // 5. Игнорируем строки состоящие только из чисел или математических знаков
            if (double.TryParse(trimmed.Replace(",", "."), out _)) return false;
            if (Regex.IsMatch(trimmed, @"^[\W_0-9]+$")) return false;

            // Все проверки пройдены
            return true;
        }
    }
}