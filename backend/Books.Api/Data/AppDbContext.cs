using Books.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Books.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Quote> Quotes => Set<Quote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>()
            .HasIndex(user => user.NormalizedUsername)
            .IsUnique();

        modelBuilder.Entity<Book>()
            .HasOne<AppUser>()
            .WithMany()
            .HasForeignKey(book => book.UserId);

        modelBuilder.Entity<Quote>()
            .HasOne<AppUser>()
            .WithMany()
            .HasForeignKey(quote => quote.UserId);
    }
}
