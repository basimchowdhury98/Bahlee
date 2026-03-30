using BahleeStrength.Models;

namespace BahleeStrength.Services;

public class WorkoutStore
{
    private readonly List<Workout> _workouts = new();

    public IReadOnlyList<Workout> GetAll() =>
        _workouts.OrderBy(w => w.DaySortOrder).ThenBy(w => w.Name).ToList();

    public Workout? GetById(Guid id) =>
        _workouts.FirstOrDefault(w => w.Id == id);

    public void Add(Workout workout) =>
        _workouts.Add(workout);

    public void Update(Guid id, string name, DayOfWeekOption day, List<string> exercises)
    {
        var workout = GetById(id);
        if (workout is null) return;
        workout.Name = name;
        workout.Day = day;
        workout.Exercises = exercises;
    }

    public void Delete(Guid id) =>
        _workouts.RemoveAll(w => w.Id == id);

    public void Reset() =>
        _workouts.Clear();

    public void LoadTestData()
    {
        _workouts.Clear();
        _workouts.AddRange(new[]
        {
            new Workout { Name = "Stretching", Day = DayOfWeekOption.Any, Exercises = [] },
            new Workout { Name = "Upper Body", Day = DayOfWeekOption.Monday, Exercises = ["Inclined Dumbbell Press", "Machine Row"] },
            new Workout { Name = "Leg Day", Day = DayOfWeekOption.Wednesday, Exercises = [] },
        });
    }
}
