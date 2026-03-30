namespace BahleeStrength.Models;

public class Workout
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public DayOfWeekOption Day { get; set; } = DayOfWeekOption.Any;
    public List<string> Exercises { get; set; } = new();

    public int DaySortOrder => Day switch
    {
        DayOfWeekOption.Any       => 0,
        DayOfWeekOption.Monday    => 1,
        DayOfWeekOption.Tuesday   => 2,
        DayOfWeekOption.Wednesday => 3,
        DayOfWeekOption.Thursday  => 4,
        DayOfWeekOption.Friday    => 5,
        DayOfWeekOption.Saturday  => 6,
        DayOfWeekOption.Sunday    => 7,
        _ => 99
    };

    public string DayLabel => Day switch
    {
        DayOfWeekOption.Any       => "Any Day",
        DayOfWeekOption.Monday    => "Mon",
        DayOfWeekOption.Tuesday   => "Tue",
        DayOfWeekOption.Wednesday => "Wed",
        DayOfWeekOption.Thursday  => "Thu",
        DayOfWeekOption.Friday    => "Fri",
        DayOfWeekOption.Saturday  => "Sat",
        DayOfWeekOption.Sunday    => "Sun",
        _ => ""
    };
}

public enum DayOfWeekOption
{
    Any,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday
}
