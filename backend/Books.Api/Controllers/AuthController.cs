using System.Security.Claims;
using System.Text.RegularExpressions;
using Books.Api.Data;
using Books.Api.Dtos;
using Books.Api.Models;
using Books.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace Books.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _database;
    private readonly PasswordService _passwords;
    private readonly TokenService _tokens;

    public AuthController(
        AppDbContext database,
        PasswordService passwords,
        TokenService tokens)
    {
        _database = database;
        _passwords = passwords;
        _tokens = tokens;
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register(Credentials input)
    {
        var username = input.Username?.Trim() ?? "";

        if (!Regex.IsMatch(username, @"^[a-zA-Z0-9åäöÅÄÖ_-]{3,32}$"))
        {
            return BadRequest(new
            {
                message = "Användarnamn ska vara 3–32 tecken: bokstäver, siffror, bindestreck eller understreck."
            });
        }

        if (string.IsNullOrWhiteSpace(input.Password) || input.Password.Length is < 10 or > 128)
            return BadRequest(new { message = "Lösenordet ska innehålla 10–128 tecken." });

        var normalizedUsername = username.ToUpperInvariant();
        var usernameExists = await _database.Users.AnyAsync(user =>
            user.NormalizedUsername == normalizedUsername);

        if (usernameExists)
            return Conflict(new { message = "Användarnamnet är redan upptaget." });

        var user = new AppUser
        {
            Username = username,
            NormalizedUsername = normalizedUsername
        };

        user.PasswordHash = _passwords.Hash(user, input.Password);
        _database.Users.Add(user);
        await _database.SaveChangesAsync();

        AddExampleQuotes(user.Id);
        await _database.SaveChangesAsync();

        return Created("/api/auth/me", new { user.Id, user.Username });
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login(Credentials input)
    {
        if (input.Username is null || input.Username.Length > 32 ||
            input.Password is null || input.Password.Length > 128)
        {
            return InvalidLogin();
        }

        var normalizedUsername = input.Username.Trim().ToUpperInvariant();
        var user = await _database.Users.SingleOrDefaultAsync(user =>
            user.NormalizedUsername == normalizedUsername);

        var passwordResult = _passwords.Verify(user, input.Password);

        if (user is null || passwordResult == PasswordVerificationResult.Failed)
            return InvalidLogin();

        if (passwordResult == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = _passwords.Hash(user, input.Password);
            await _database.SaveChangesAsync();
        }

        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(_tokens.TokenMinutes);
        var token = _tokens.CreateToken(user, expiresAt);

        return Ok(new { user.Id, user.Username, expiresAt, token });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = int.Parse(User.FindFirstValue("sub")!);
        var username = User.FindFirstValue("name");
        var expiresAt = DateTimeOffset.FromUnixTimeSeconds(
            long.Parse(User.FindFirstValue("exp")!));

        return Ok(new { id = userId, username, expiresAt });
    }

    private IActionResult InvalidLogin()
    {
        return Unauthorized(new { message = "Fel användarnamn eller lösenord." });
    }

    private void AddExampleQuotes(int userId)
    {
        string[] exampleQuotes =
        [
            "En bra bok slutar inte på sista sidan. Den följer med dig ut i livet.",
            "Ge en ny tanke samma tålamod som du ger en ny vän.",
            "Det finns alltid plats för en berättelse till.",
            "Små steg blir också en resa, om du fortsätter att gå.",
            "Ibland är en lugn stund dagens viktigaste kapitel."
        ];

        foreach (var text in exampleQuotes)
        {
            _database.Quotes.Add(new Quote
            {
                UserId = userId,
                Text = text,
                Author = "Bokrum · exempelcitat"
            });
        }
    }
}
