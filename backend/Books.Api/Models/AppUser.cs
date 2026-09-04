namespace Books.Api.Models;

public class AppUser
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string NormalizedUsername { get; set; } = "";
    public string PasswordHash { get; set; } = "";
}
