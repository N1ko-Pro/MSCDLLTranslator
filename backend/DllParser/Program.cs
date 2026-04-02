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
                                if (SmartFilter.IsTranslatableText(val))
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
    }
}