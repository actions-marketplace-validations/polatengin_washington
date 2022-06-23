using System.CommandLine;
public class Program
{
    public static async Task<int> Main(string[] args)
    {
        var fileOption = new Option<FileInfo?>(name: "--file", description: "The file to read and display on the console.") { IsRequired = true };

        var rootCommand = new RootCommand("Bicep and ARM Cost Estimator");

        rootCommand.AddOption(fileOption);

        rootCommand.SetHandler(async (file) =>
        {
            Console.WriteLine($"File: {file}");
        }, fileOption);

        return await rootCommand.InvokeAsync(args);
    }

    public static async Task ReadFile(FileInfo file)
    {
        var filename = file.FullName;

        if (file.Extension == ".bicep")
        {
            filename = Path.GetTempFileName();

            var bicepCliArgs = new string[] { "build", file.FullName, "--outfile", filename };

            await Bicep.Cli.Program.Main(bicepCliArgs);
        }
    }
}
