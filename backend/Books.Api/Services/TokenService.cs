using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Books.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace Books.Api.Services;

public class TokenService
{
    public string Issuer { get; }
    public string Audience { get; }
    public int TokenMinutes { get; }
    public SymmetricSecurityKey SigningKey { get; }

    public TokenService(IConfiguration configuration, IWebHostEnvironment environment)
    {
        var secret = configuration["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(secret))
        {
            if (!environment.IsDevelopment())
                throw new InvalidOperationException("Ange Jwt__Key innan API:et startas i produktion.");

            secret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }

        if (Encoding.UTF8.GetByteCount(secret) < 32)
            throw new InvalidOperationException("JWT-nyckeln måste vara minst 32 byte.");

        Issuer = configuration["Jwt:Issuer"]!;
        Audience = configuration["Jwt:Audience"]!;
        TokenMinutes = configuration.GetValue("Jwt:Minutes", 30);

        if (TokenMinutes is < 1 or > 1440)
            throw new InvalidOperationException("JWT-livslängden måste vara mellan 1 och 1440 minuter.");

        SigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
    }

    public string CreateToken(AppUser user, DateTimeOffset expiresAt)
    {
        var claims = new[]
        {
            new Claim("sub", user.Id.ToString()),
            new Claim("name", user.Username)
        };

        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: new SigningCredentials(SigningKey, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
