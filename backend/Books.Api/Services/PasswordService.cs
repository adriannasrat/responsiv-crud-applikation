using Books.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace Books.Api.Services;

public class PasswordService
{
    private readonly IPasswordHasher<AppUser> _passwordHasher;
    private readonly AppUser _dummyUser = new();
    private readonly string _dummyHash;

    public PasswordService(IPasswordHasher<AppUser> passwordHasher)
    {
        _passwordHasher = passwordHasher;
        _dummyHash = _passwordHasher.HashPassword(_dummyUser, Guid.NewGuid().ToString());
    }

    public string Hash(AppUser user, string password)
    {
        return _passwordHasher.HashPassword(user, password);
    }

    public PasswordVerificationResult Verify(AppUser? user, string password)
    {
        return _passwordHasher.VerifyHashedPassword(
            user ?? _dummyUser,
            user?.PasswordHash ?? _dummyHash,
            password);
    }
}
