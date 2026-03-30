using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BahleeStrength.Pages;

public class AppModel : PageModel
{
    private readonly IConfiguration _configuration;

    public AppModel(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string Key { get; set; } = string.Empty;

    public IActionResult OnGet(string key)
    {
        var accessKey = _configuration["AccessKey"];

        if (string.IsNullOrEmpty(key) || key != accessKey)
        {
            return RedirectToPage("/Index");
        }

        Key = key;
        return Page();
    }
}
