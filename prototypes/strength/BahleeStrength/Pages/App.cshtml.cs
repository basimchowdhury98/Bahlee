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
    public string Banner { get; set; } = string.Empty;

    public IActionResult OnGet(string key)
    {
        var accessKey = _configuration["AccessKey"];

        if (string.IsNullOrEmpty(key) || key != accessKey)
        {
            return RedirectToPage("/Index");
        }

        Key = key;

        var banners = _configuration.GetSection("MotivationalBanners").Get<List<string>>() ?? [];
        Banner = banners.Count > 0
            ? banners[Random.Shared.Next(banners.Count)]
            : "You can do it, Mahlee!";

        return Page();
    }
}
