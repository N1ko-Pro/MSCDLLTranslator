using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Mono.Cecil;
using Mono.Cecil.Cil;

namespace DllParser
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length == 0)
            {
                Console.WriteLine("{\"error\": \"No action specified\"}");
                return;
            }

            string action = args[0];

            if (action == "read" && args.Length > 1)
            {
                ReadDll(args[1]);
            }
            else
            {
                Console.WriteLine("{\"error\": \"Unknown command\"}");
            }
        }

        static void ReadDll(string path)
        {
            try
            {
                using var assembly = AssemblyDefinition.ReadAssembly(path);
                var mainModule = assembly.MainModule;

                string? id = "Unknown", name = "Unknown", author = "Unknown", version = "Unknown", description = "Unknown";
                var strings = new List<string>();

                foreach (var type in mainModule.Types)
                {
                    // Basic heuristic for properties defined by MSC Mod classes
                    foreach (var prop in type.Properties)
                    {
                        if (prop.GetMethod != null && prop.GetMethod.HasBody)
                        {
                            var instruction = prop.GetMethod.Body.Instructions.FirstOrDefault(i => i.OpCode == OpCodes.Ldstr);
                            if (instruction != null)
                            {
                                string? val = instruction.Operand?.ToString();
                                if (val != null)
                                {
                                    switch (prop.Name)
                                    {
                                        case "ID": id = val; break;
                                        case "Name": name = val; break;
                                        case "Author": author = val; break;
                                        case "Version": version = val; break;
                                        case "Description": description = val; break;
                                    }
                                }
                            }
                        }
                    }

                    // Extract all strings for translation
                    foreach (var method in type.Methods)
                    {
                        if (!method.HasBody) continue;
                        
                        foreach (var instr in method.Body.Instructions)
                        {
                            if (instr.OpCode == OpCodes.Ldstr && instr.Operand is string val)
                            {
                                if (IsTranslatableText(val)) 
                                {
                                    strings.Add(val);
                                }
                            }
                        }
                    }
                }

                var metadataValues = new HashSet<string?>(StringComparer.Ordinal) { id, name, author, version, description };
                metadataValues.Remove("Unknown"); // На случай, если в моде есть слово Unknown, мы не хотим его случайно отфильтровать

                strings = strings.Distinct().Where(s => !metadataValues.Contains(s)).ToList();

                var result = new
                {
                    id,
                    name,
                    author,
                    version,
                    description,
                    strings
                };

                Console.WriteLine(JsonSerializer.Serialize(result));
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonSerializer.Serialize(new { error = ex.Message }));
            }
        }

        static bool IsTranslatableText(string text)
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